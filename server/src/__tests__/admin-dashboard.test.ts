import request from 'supertest';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { app } from '../app';
import { startTestDB, cleanupTestDB, stopTestDB } from './setup';
import { User } from '../models/User';
import { Province } from '../models/Province';
import { Employee } from '../models/Employee';

describe('Admin Dashboard Routes', () => {
	let globalAdminCookie: string;
	let provinceAdminCookie: string;
	let provinceA: any;
	let provinceB: any;

	beforeAll(async () => {
		await startTestDB();
		await cleanupTestDB();

		provinceA = await Province.create({
			name: 'Alpha Province',
			admin: new mongoose.Types.ObjectId(),
		});
		provinceB = await Province.create({
			name: 'Beta Province',
			admin: new mongoose.Types.ObjectId(),
		});

		const hashedPassword = await bcrypt.hash('password', 10);
		await User.create({
			username: 'globaladmin',
			passwordHash: hashedPassword,
			role: 'globalAdmin',
		});
		await User.create({
			username: 'provinceadmin',
			passwordHash: hashedPassword,
			role: 'provinceAdmin',
			provinceId: provinceA._id,
		});

		const globalRes = await request(app)
			.post('/auth/login')
			.send({ username: 'globaladmin', password: 'password' });
		globalAdminCookie = globalRes.headers['set-cookie'][0];

		const provinceRes = await request(app)
			.post('/auth/login')
			.send({ username: 'provinceadmin', password: 'password' });
		provinceAdminCookie = provinceRes.headers['set-cookie'][0];
	}, 60000);

	afterEach(async () => {
		await Employee.deleteMany({});
	});

	afterAll(async () => {
		await stopTestDB();
	}, 60000);

	describe('GET /admin-dashboard/stats', () => {
		it('should reject unauthenticated access', async () => {
			const response = await request(app).get('/admin-dashboard/stats');
			expect(response.status).toBe(401);
		}, 15000);

		it('should reject province admin access', async () => {
			const response = await request(app)
				.get('/admin-dashboard/stats')
				.set('Cookie', provinceAdminCookie);

			expect(response.status).toBe(403);
		}, 15000);

		it('should return dashboard statistics for global admin', async () => {
			await Employee.create({
				provinceId: provinceA._id,
				basicInfo: {
					nationalID: 'ADM-001',
					firstName: 'Leila',
					lastName: 'Rahimi',
					male: true,
				},
				workPlace: {
					rank: 'Senior',
					branch: 'North',
					licensedWorkplace: 'Central Station',
				},
				additionalSpecifications: {
					jobStartDate: new Date('2023-01-01'),
					contactNumber: '11111111111',
					dateOfBirth: new Date('1992-01-01'),
					educationalDegree: 'Bachelor',
				},
				performance: {
					dailyPerformance: 8,
					shiftCountPerLocation: 24,
					shiftDuration: 8,
					overtime: 3,
					dailyLeave: 0,
					sickLeave: 0,
					absence: 1,
					travelAssignment: 0,
					status: 'active',
					notes: '',
				},
			});

			await Employee.create({
				provinceId: provinceA._id,
				basicInfo: {
					nationalID: 'ADM-002',
					firstName: 'Sara',
					lastName: 'Nazari',
					male: false,
				},
				workPlace: {
					rank: 'Junior',
					branch: 'North',
					licensedWorkplace: 'Central Station',
				},
				additionalSpecifications: {
					jobStartDate: new Date('2023-01-02'),
					contactNumber: '22222222222',
					dateOfBirth: new Date('1993-01-01'),
					educationalDegree: 'Master',
				},
				performance: {
					dailyPerformance: 6,
					shiftCountPerLocation: 24,
					shiftDuration: 8,
					overtime: 2,
					dailyLeave: 1,
					sickLeave: 0,
					absence: 0,
					travelAssignment: 0,
					status: 'inactive',
					notes: '',
				},
			});

			await Employee.create({
				provinceId: provinceB._id,
				basicInfo: {
					nationalID: 'ADM-003',
					firstName: 'Reza',
					lastName: 'Karimi',
					male: true,
				},
				workPlace: {
					rank: 'Senior',
					branch: 'South',
					licensedWorkplace: 'Regional Office',
				},
				additionalSpecifications: {
					jobStartDate: new Date('2023-01-03'),
					contactNumber: '33333333333',
					dateOfBirth: new Date('1991-01-01'),
					educationalDegree: 'Bachelor',
				},
				performance: {
					dailyPerformance: 9,
					shiftCountPerLocation: 24,
					shiftDuration: 8,
					overtime: 1,
					dailyLeave: 0,
					sickLeave: 1,
					absence: 2,
					travelAssignment: 0,
					status: 'on_leave',
					notes: '',
				},
			});

			const response = await request(app)
				.get('/admin-dashboard/stats')
				.set('Cookie', globalAdminCookie);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.totalEmployees).toBe(3);
			expect(response.body.data.totalProvinces).toBe(2);
			expect(response.body.data.activeEmployees).toBe(1);
			expect(response.body.data.inactiveEmployees).toBe(1);
			expect(response.body.data.onLeaveEmployees).toBe(1);
			expect(response.body.data.employeesByStatus.active).toBe(1);
			expect(response.body.data.employeeDistribution.femaleCount).toBe(1);
			expect(response.body.data.employeeDistribution.maleCount).toBe(2);
			expect(response.body.data.employeesByProvince).toHaveLength(2);
		}, 15000);
	});
});
