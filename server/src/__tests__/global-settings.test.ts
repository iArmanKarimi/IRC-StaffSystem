import request from 'supertest';
import bcrypt from 'bcrypt';
import { app } from '../app';
import { startTestDB, cleanupTestDB, stopTestDB } from './setup';
import { User } from '../models/User';
import { GlobalSettings } from '../models/GlobalSettings';

describe('Global Settings Routes', () => {
	let globalAdminCookie: string;

	beforeAll(async () => {
		await startTestDB();
	}, 60000);

	beforeEach(async () => {
		await cleanupTestDB();

		const passwordHash = await bcrypt.hash('password', 10);
		await User.create({
			username: 'globaladmin',
			passwordHash,
			role: 'globalAdmin',
		});

		const loginResponse = await request(app)
			.post('/auth/login')
			.send({ username: 'globaladmin', password: 'password' });

		globalAdminCookie = loginResponse.headers['set-cookie'][0];
	});

	afterAll(async () => {
		await stopTestDB();
	}, 60000);

	describe('GET /global-settings', () => {
		it('should create default settings when none exist', async () => {
			const response = await request(app).get('/global-settings');

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.performanceLocked).toBe(false);

			const savedSettings = await GlobalSettings.findOne({});
			expect(savedSettings).not.toBeNull();
			expect(savedSettings?.performanceLocked).toBe(false);
		}, 15000);

		it('should return the existing lock state', async () => {
			await GlobalSettings.create({ performanceLocked: true });

			const response = await request(app).get('/global-settings');

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.performanceLocked).toBe(true);
		}, 15000);
	});

	describe('POST /global-settings/toggle-performance-lock', () => {
		it('should toggle performance lock on for a global admin', async () => {
			const response = await request(app)
				.post('/global-settings/toggle-performance-lock')
				.set('Cookie', globalAdminCookie);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.performanceLocked).toBe(true);
			expect(response.body.data.lastLockedBy).toBeDefined();
			expect(response.body.data.lockedAt).toBeDefined();
		}, 15000);

		it('should toggle performance lock off when it is already enabled', async () => {
			await GlobalSettings.create({ performanceLocked: true });

			const response = await request(app)
				.post('/global-settings/toggle-performance-lock')
				.set('Cookie', globalAdminCookie);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.performanceLocked).toBe(false);
		}, 15000);

		it('should require authentication', async () => {
			const response = await request(app)
				.post('/global-settings/toggle-performance-lock');

			expect(response.status).toBe(401);
			expect(response.body.error).toBe('Not authenticated');
		}, 15000);
	});
});
