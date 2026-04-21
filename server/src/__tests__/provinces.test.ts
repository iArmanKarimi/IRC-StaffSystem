import request from 'supertest';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { app } from '../app';
import { startTestDB, cleanupTestDB, stopTestDB } from './setup';
import { User } from '../models/User';
import { Province } from '../models/Province';

describe('Province Routes', () => {
	let globalAdminCookie: string;
	let provinceAdminCookie: string;
	let testProvince: any;

	beforeAll(async () => {
		await startTestDB();

		// Clean up any existing data from previous test suites
		await cleanupTestDB();

		// Create test province
		testProvince = await Province.create({
			name: 'Test Province',
			admin: new mongoose.Types.ObjectId(),
		});

		// Create global admin
		const hashedPassword = await bcrypt.hash('password', 10);
		await User.create({
			username: 'globaladmin',
			passwordHash: hashedPassword,
			role: 'globalAdmin',
		});

		// Create province admin
		await User.create({
			username: 'provincead',
			passwordHash: hashedPassword,
			role: 'provinceAdmin',
			provinceId: testProvince._id,
		});

		// Login global admin
		const globalRes = await request(app)
			.post('/auth/login')
			.send({ username: 'globaladmin', password: 'password' });
		globalAdminCookie = globalRes.headers['set-cookie'][0];

		// Login province admin
		const provinceRes = await request(app)
			.post('/auth/login')
			.send({ username: 'provincead', password: 'password' });
		provinceAdminCookie = provinceRes.headers['set-cookie'][0];
	}, 60000);

	afterEach(async () => {
		// Only clean extra provinces created in tests, not the base testProvince
		const collections = mongoose.connection.collections;
		if (collections['provinces']) {
			await collections['provinces'].deleteMany({ _id: { $ne: testProvince._id } });
		}
	});

	afterAll(async () => {
		await stopTestDB();
	}, 60000);

	describe('GET /provinces', () => {
		it('should list all provinces as global admin', async () => {
			const response = await request(app)
				.get('/provinces')
				.set('Cookie', globalAdminCookie);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(Array.isArray(response.body.data)).toBe(true);
		}, 15000);

		it('should return 401 when not authenticated', async () => {
			const response = await request(app)
				.get('/provinces');

			expect(response.status).toBe(401);
		}, 15000);

		it('should return 403 for province admin', async () => {
			const response = await request(app)
				.get('/provinces')
				.set('Cookie', provinceAdminCookie);

			expect(response.status).toBe(403);
		}, 15000);
	});

	describe('GET /provinces/:provinceId', () => {
		it('should get province details as global admin', async () => {
			const response = await request(app)
				.get(`/provinces/${testProvince._id}`)
				.set('Cookie', globalAdminCookie);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data._id).toBe(testProvince._id.toString());
		}, 15000);

		it('should return 404 for non-existent province', async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const response = await request(app)
				.get(`/provinces/${fakeId}`)
				.set('Cookie', globalAdminCookie);

			expect(response.status).toBe(404);
		}, 15000);

		it('should return 400 for invalid province ID', async () => {
			const response = await request(app)
				.get('/provinces/invalid')
				.set('Cookie', globalAdminCookie);

			expect(response.status).toBe(400);
		}, 15000);

		it('should allow province admin to get own province details', async () => {
			const response = await request(app)
				.get(`/provinces/${testProvince._id}`)
				.set('Cookie', provinceAdminCookie);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data._id).toBe(testProvince._id.toString());
		}, 15000);
	});

	describe('POST /provinces/:provinceId/toggle-lock', () => {
		it('should toggle province lock as global admin', async () => {
			const response = await request(app)
				.post(`/provinces/${testProvince._id}/toggle-lock`)
				.set('Cookie', globalAdminCookie);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.is_locked).toBe(true);
		}, 15000);

		it('should toggle province lock as province admin in own province', async () => {
			const provinceBefore = await Province.findById(testProvince._id);

			const response = await request(app)
				.post(`/provinces/${testProvince._id}/toggle-lock`)
				.set('Cookie', provinceAdminCookie);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.is_locked).toBe(!provinceBefore?.is_locked);
		}, 15000);

		it('should require authentication', async () => {
			const response = await request(app)
				.post(`/provinces/${testProvince._id}/toggle-lock`);

			expect(response.status).toBe(401);
		}, 15000);
	});

	describe('POST /provinces/bulk-lock', () => {
		it('should lock all provinces as global admin', async () => {
			const response = await request(app)
				.post('/provinces/bulk-lock')
				.set('Cookie', globalAdminCookie)
				.send({ locked: true });

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.provinces.every((province: any) => province.is_locked)).toBe(true);
		}, 15000);

		it('should unlock all provinces as global admin', async () => {
			await Province.updateMany({}, { is_locked: true });

			const response = await request(app)
				.post('/provinces/bulk-lock')
				.set('Cookie', globalAdminCookie)
				.send({ locked: false });

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.provinces.every((province: any) => !province.is_locked)).toBe(true);
		}, 15000);

		it('should reject province admin access', async () => {
			const response = await request(app)
				.post('/provinces/bulk-lock')
				.set('Cookie', provinceAdminCookie)
				.send({ locked: true });

			expect(response.status).toBe(403);
		}, 15000);

		it('should require authentication', async () => {
			const response = await request(app)
				.post('/provinces/bulk-lock')
				.send({ locked: true });

			expect(response.status).toBe(401);
		}, 15000);

		it('should return 400 when locked is not boolean', async () => {
			const response = await request(app)
				.post('/provinces/bulk-lock')
				.set('Cookie', globalAdminCookie)
				.send({ locked: 'true' });

			expect(response.status).toBe(400);
			expect(response.body.error).toBe('locked must be a boolean');
		}, 15000);
	});
});
