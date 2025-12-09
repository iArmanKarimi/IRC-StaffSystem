import { connectDB } from '../data-source';
import { User } from '../models/User';
import { Province } from '../models/Province';
import { USER_ROLE } from '../types/roles';
import { logger } from '../middleware/logger';
import bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

interface AdminConfig {
	globalAdmin?: {
		username: string;
		password: string;
	};
	provinceAdmins?: Array<{
		username: string;
		password: string;
		provinceName?: string;
	}>;
}

interface AdminCredentials {
	username: string;
	password: string;
}

interface SeedStats {
	globalAdminCreated: boolean;
	globalAdminUpdated: boolean;
	provinceAdminsCreated: number;
	provinceAdminsUpdated: number;
	provinceAdminsLinked: number;
	errors: string[];
}

/**
 * Validates that a string is not empty or whitespace-only
 */
function isValidString(value: string | undefined | null): boolean {
	return value !== undefined && value !== null && value.trim() !== '';
}

/**
 * Validates admin credentials
 */
function validateCredentials(credentials: AdminCredentials, context: string): string | null {
	if (!isValidString(credentials.username)) {
		return `${context}: username is required`;
	}
	if (!isValidString(credentials.password)) {
		return `${context}: password is required`;
	}
	return null;
}

/**
 * Reads and parses the admin configuration file
 */
function loadConfig(): AdminConfig {
	const configPath = path.join(__dirname, '../../admins.json');

	if (!fs.existsSync(configPath)) {
		console.error(`Error: admins.json not found at ${configPath}`);
		console.error('Please create admins.json based on admins.example.json');
		process.exit(1);
	}

	const configContent = fs.readFileSync(configPath, 'utf-8');
	try {
		return JSON.parse(configContent);
	} catch (parseError) {
		console.error('❌ Error parsing admins.json: Invalid JSON format');
		if (parseError instanceof Error) {
			console.error('Error details:', parseError.message);
		}
		process.exit(1);
	}
}

/**
 * Creates a password hash using bcrypt
 */
async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 10);
}

/**
 * Creates a global admin user
 */
async function createGlobalAdmin(credentials: AdminCredentials, stats: SeedStats): Promise<void> {
	const validationError = validateCredentials(credentials, 'Global admin');
	if (validationError) {
		const errMsg = `${validationError}, skipping...`;
		console.error(`  ❌ ${errMsg}`);
		stats.errors.push(errMsg);
		return;
	}

	const { username, password } = credentials;

	try {
		const existingUser = await User.findOne({ username });
		if (existingUser) {
			// Sync password from config if it changed
			const samePassword = await bcrypt.compare(password, existingUser.passwordHash);
			if (!samePassword) {
				existingUser.passwordHash = await hashPassword(password);
				await existingUser.save();
				logger.info("Global admin password updated", { username });
				console.log(`  ✅ Updated password for global admin: ${username} from config`);
				stats.globalAdminUpdated = true;
			} else {
				logger.debug("Global admin password unchanged", { username });
				console.log(`  ℹ️  Password for global admin "${username}" already matches config`);
			}
			return;
		}

		const passwordHash = await hashPassword(password);
		const user = new User({
			username,
			passwordHash,
			role: USER_ROLE.GLOBAL_ADMIN,
		});

		await user.save();
		logger.info("Global admin created", { username });
		console.log(`  ✅ Created global admin: ${username}`);
		stats.globalAdminCreated = true;
	} catch (err) {
		const errMsg = `Failed to create global admin ${username}`;
		logger.error(errMsg, err);
		console.error(`  ❌ ${errMsg}`);
		stats.errors.push(errMsg);
	}
}

/**
 * Links a province admin user to a province
 */
async function linkProvinceToAdmin(user: InstanceType<typeof User>, provinceName: string, stats: SeedStats): Promise<boolean> {
	try {
		const province = await Province.findOne({ name: provinceName });
		if (!province) {
			const errMsg = `Province "${provinceName}" not found`;
			logger.warn(errMsg, { username: user.username });
			return false;
		}

		// Check if province already has an admin
		if (province.admin) {
			const existingAdmin = await User.findById(province.admin);
			if (existingAdmin) {
				logger.warn("Province admin will be replaced", {
					province: provinceName,
					oldAdmin: existingAdmin.username,
					newAdmin: user.username
				});
				console.log(`  ⚠️  Province "${provinceName}" already has admin "${existingAdmin.username}", will be replaced`);
			}
		}

		user.provinceId = province._id;
		await user.save();

		province.admin = user._id;
		await province.save();

		logger.info("Province admin linked", { username: user.username, province: provinceName });
		return true;
	} catch (err) {
		logger.error("Failed to link province admin", err);
		stats.errors.push(`Failed to link ${user.username} to province ${provinceName}`);
		return false;
	}
}

/**
 * Creates a province admin user
 */
async function createProvinceAdmin(credentials: AdminCredentials & { provinceName?: string }, stats: SeedStats): Promise<void> {
	const validationError = validateCredentials(credentials, `Province admin "${credentials.username}"`);
	if (validationError) {
		const errMsg = `${validationError}, skipping...`;
		console.error(`  ❌ ${errMsg}`);
		stats.errors.push(errMsg);
		return;
	}

	const { username, password, provinceName } = credentials;

	try {
		const existingUser = await User.findOne({ username });
		let user: InstanceType<typeof User>;

		if (existingUser) {
			// Ensure role is correct
			if (existingUser.role !== USER_ROLE.PROVINCE_ADMIN) {
				existingUser.role = USER_ROLE.PROVINCE_ADMIN;
			}

			// Sync password from config if it changed
			const samePassword = await bcrypt.compare(password, existingUser.passwordHash);
			if (!samePassword) {
				existingUser.passwordHash = await hashPassword(password);
				await existingUser.save();
				logger.info("Province admin password updated", { username });
				console.log(`  ✅ Updated password for province admin: ${username} from config`);
				stats.provinceAdminsUpdated++;
			} else {
				logger.debug("Province admin password unchanged", { username });
				console.log(`  ℹ️  Password for province admin "${username}" already matches config`);
			}

			user = existingUser;
		} else {
			const passwordHash = await hashPassword(password);
			user = new User({
				username,
				passwordHash,
				role: USER_ROLE.PROVINCE_ADMIN,
			});
			await user.save();
			logger.info("Province admin user created", { username });
			console.log(`  ✅ Created province admin user: ${username}`);
			stats.provinceAdminsCreated++;
		}

		// Link to province if provided
		if (isValidString(provinceName)) {
			const linked = await linkProvinceToAdmin(user, provinceName!, stats);
			if (linked) {
				logger.info("Province admin created and linked", { username, province: provinceName });
				console.log(`  ✅ Created province admin: ${username} (linked to ${provinceName})`);
				stats.provinceAdminsLinked++;
			} else {
				logger.warn("Province admin created but not linked", { username, province: provinceName });
				console.log(`  ⚠️  Created province admin: ${username} (province "${provinceName}" not found, not linked)`);
			}
		} else {
			logger.warn("Province admin created without province", { username });
			console.log(`  ⚠️  Created province admin: ${username} (no province name provided)`);
		}
	} catch (err) {
		const errMsg = `Failed to create province admin ${username}`;
		logger.error(errMsg, err);
		console.error(`  ❌ ${errMsg}`);
		stats.errors.push(errMsg);
	}
}

/**
 * Main function to seed admins from configuration
 */
async function seedAdmins() {
	const stats: SeedStats = {
		globalAdminCreated: false,
		globalAdminUpdated: false,
		provinceAdminsCreated: 0,
		provinceAdminsUpdated: 0,
		provinceAdminsLinked: 0,
		errors: []
	};

	try {
		await connectDB();
		logger.info("Database connected");
		console.log('✅ Connected to database\n');

		const config = loadConfig();

		// Create global admin
		console.log('Creating global admin...');
		if (config.globalAdmin) {
			await createGlobalAdmin(config.globalAdmin, stats);
		} else {
			console.log('  ⚠️  No global admin configured, skipping...');
		}

		// Create province admins
		console.log('\nCreating province admins...');
		if (!config.provinceAdmins || config.provinceAdmins.length === 0) {
			console.log('  ⚠️  No province admins configured, skipping...');
		} else {
			for (const admin of config.provinceAdmins) {
				await createProvinceAdmin(admin, stats);
			}
		}

		// Print summary
		console.log('\n' + '='.repeat(50));
		console.log('SEED SUMMARY');
		console.log('='.repeat(50));

		if (stats.globalAdminCreated) {
			console.log('✅ Global Admin: Created');
		} else if (stats.globalAdminUpdated) {
			console.log('✅ Global Admin: Updated');
		} else {
			console.log('ℹ️  Global Admin: No changes');
		}

		console.log(`Province Admins:`);
		console.log(`  Created: ${stats.provinceAdminsCreated}`);
		console.log(`  Updated: ${stats.provinceAdminsUpdated}`);
		console.log(`  Linked:  ${stats.provinceAdminsLinked}`);

		if (stats.errors.length > 0) {
			console.log(`\nErrors (${stats.errors.length}):`);
			stats.errors.forEach(err => console.log(`  • ${err}`));
			logger.warn("Seed completed with errors", { errorCount: stats.errors.length });
			console.log('\n⚠️  Admin seeding completed with errors');
			process.exit(1);
		} else {
			logger.info("Admin seeding completed successfully");
			console.log('\n✅ Admin seeding completed successfully!');
			process.exit(0);
		}
	} catch (err) {
		const errMsg = 'Error during admin seeding';
		console.error(`\n❌ ${errMsg}`);
		logger.error(errMsg, err);
		if (err instanceof Error) {
			console.error('Error details:', err.message);
		}
		process.exit(1);
	}
}

// Run the seed script
seedAdmins();
