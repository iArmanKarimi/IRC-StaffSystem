import request from 'supertest';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { app } from '../app';
import { startTestDB, cleanupTestDB, stopTestDB } from './setup';
import { User } from '../models/User';
import { Province } from '../models/Province';
import { Employee } from '../models/Employee';

describe('Employee Routes', () => {
	let globalAdminCookie: string;
	let provinceAdminCookie: string;
	let testProvince1: any;
	let testProvince2: any;

	const sampleEmployee = {
		basicInfo: {
			nationalID: '123456789',
			firstName: 'John',
			lastName: 'Doe',
			male: true,
		},
		workPlace: {
			department: 'Engineering',
			position: 'Developer',
			licensedWorkplace: 'Test Workplace',
			rank: 'Senior',
			branch: 'Main Branch',
		},
		additionalSpecifications: {
			jobStartDate: new Date('2020-01-01'),
			contactNumber: '12345678901',
			dateOfBirth: new Date('1990-01-01'),
			educationalDegree: 'Bachelor',
		},
	};

	beforeAll(async () => {
		await startTestDB();

		// Clean up any existing data from previous test suites
		await cleanupTestDB();

		// Create test provinces
		testProvince1 = await Province.create({
			name: 'Province 1',
			admin: new mongoose.Types.ObjectId(),
		});

		testProvince2 = await Province.create({
			name: 'Province 2',
			admin: new mongoose.Types.ObjectId(),
		});

		// Create global admin
		const hashedPassword = await bcrypt.hash('password', 10);
		await User.create({
			username: 'globaladmin',
			passwordHash: hashedPassword,
			role: 'globalAdmin',
		});

		// Create province admin for province1
		await User.create({
			username: 'provincead',
			passwordHash: hashedPassword,
			role: 'provinceAdmin',
			provinceId: testProvince1._id,
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
		// Only clean employees, not users/provinces
		await Employee.deleteMany({});
	});

	afterAll(async () => {
		await stopTestDB();
	}, 60000);

	describe('POST /provinces/:provinceId/employees', () => {
		it('should create employee as global admin', async () => {
			const response = await request(app)
				.post(`/provinces/${testProvince1._id}/employees`)
				.set('Cookie', globalAdminCookie)
				.send(sampleEmployee);

			expect(response.status).toBe(201);
			expect(response.body.success).toBe(true);
			expect(response.body.data._id).toBeDefined();
		}, 15000);

		it('should create employee as province admin in own province', async () => {
			const response = await request(app)
				.post(`/provinces/${testProvince1._id}/employees`)
				.set('Cookie', provinceAdminCookie)
				.send(sampleEmployee);

			expect(response.status).toBe(201);
			expect(response.body.success).toBe(true);
		}, 15000);

		it('should return 403 for province admin in different province', async () => {
			const response = await request(app)
				.post(`/provinces/${testProvince2._id}/employees`)
				.set('Cookie', provinceAdminCookie)
				.send(sampleEmployee);

			expect(response.status).toBe(403);
		}, 15000);

		it('should return 401 when not authenticated', async () => {
			const response = await request(app)
				.post(`/provinces/${testProvince1._id}/employees`)
				.send(sampleEmployee);

			expect(response.status).toBe(401);
		}, 15000);
	});

	describe('GET /provinces/:provinceId/employees', () => {
		it('should list employees in province as global admin', async () => {
			await Employee.create({
				provinceId: testProvince1._id,
				...sampleEmployee,
			});

			const response = await request(app)
				.get(`/provinces/${testProvince1._id}/employees`)
				.set('Cookie', globalAdminCookie);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(Array.isArray(response.body.data)).toBe(true);
		}, 15000);

		it('should list employees in own province as province admin', async () => {
			await Employee.create({
				provinceId: testProvince1._id,
				...sampleEmployee,
			});

			const response = await request(app)
				.get(`/provinces/${testProvince1._id}/employees`)
				.set('Cookie', provinceAdminCookie);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		}, 15000);

		it('should return 403 for province admin accessing different province', async () => {
			const response = await request(app)
				.get(`/provinces/${testProvince2._id}/employees`)
				.set('Cookie', provinceAdminCookie);

			expect(response.status).toBe(403);
		}, 15000);

		it('should return pagination data', async () => {
			for (let i = 0; i < 5; i++) {
				await Employee.create({
					provinceId: testProvince1._id,
					basicInfo: { ...sampleEmployee.basicInfo, nationalID: `ID${i}` },
					workPlace: sampleEmployee.workPlace,
					additionalSpecifications: sampleEmployee.additionalSpecifications,
				});
			}

			const response = await request(app)
				.get(`/provinces/${testProvince1._id}/employees?page=1&limit=2`)
				.set('Cookie', globalAdminCookie);

			expect(response.status).toBe(200);
			expect(response.body.pagination.total).toBe(5);
			expect(response.body.data.length).toBe(2);
		}, 15000);

		it('should find employees by first name and full name search', async () => {
			await Employee.create({
				provinceId: testProvince1._id,
				basicInfo: {
					...sampleEmployee.basicInfo,
					firstName: 'Ali',
					lastName: 'Rezaei',
					nationalID: 'SEARCH001',
				},
				workPlace: sampleEmployee.workPlace,
				additionalSpecifications: sampleEmployee.additionalSpecifications,
			});

			const firstNameResponse = await request(app)
				.get(`/provinces/${testProvince1._id}/employees?search=Ali`)
				.set('Cookie', globalAdminCookie);

			expect(firstNameResponse.status).toBe(200);
			expect(firstNameResponse.body.data).toHaveLength(1);
			expect(firstNameResponse.body.data[0].basicInfo.firstName).toBe('Ali');

			const fullNameResponse = await request(app)
				.get(`/provinces/${testProvince1._id}/employees?search=Ali%20Rezaei`)
				.set('Cookie', globalAdminCookie);

			expect(fullNameResponse.status).toBe(200);
			expect(fullNameResponse.body.data).toHaveLength(1);
			expect(fullNameResponse.body.data[0].basicInfo.lastName).toBe('Rezaei');
		}, 15000);
	});

	describe('GET /provinces/:provinceId/employees/:employeeId', () => {
		it('should get employee as global admin', async () => {
			const employee = await Employee.create({
				provinceId: testProvince1._id,
				...sampleEmployee,
			});

			const response = await request(app)
				.get(`/provinces/${testProvince1._id}/employees/${employee._id}`)
				.set('Cookie', globalAdminCookie);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data._id).toBe(employee._id.toString());
		}, 15000);

		it('should return 404 for non-existent employee', async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const response = await request(app)
				.get(`/provinces/${testProvince1._id}/employees/${fakeId}`)
				.set('Cookie', globalAdminCookie);

			expect(response.status).toBe(404);
		}, 15000);

		it('should return 400 for employee in different province', async () => {
			const employee = await Employee.create({
				provinceId: testProvince2._id,
				...sampleEmployee,
			});

			const response = await request(app)
				.get(`/provinces/${testProvince1._id}/employees/${employee._id}`)
				.set('Cookie', globalAdminCookie);

			expect(response.status).toBe(400);
		}, 15000);
	});

	describe('PUT /provinces/:provinceId/employees/:employeeId', () => {
		it('should update employee when province is unlocked', async () => {
			const employee = await Employee.create({
				provinceId: testProvince1._id,
				...sampleEmployee,
				performance: {
					dailyPerformance: 1,
					shiftCountPerLocation: 1,
					shiftDuration: 8,
					overtime: 0,
					dailyLeave: 0,
					sickLeave: 0,
					absence: 0,
					travelAssignment: 0,
					status: 'active',
					notes: '',
				},
			});

			const response = await request(app)
				.put(`/provinces/${testProvince1._id}/employees/${employee._id}`)
				.set('Cookie', provinceAdminCookie)
				.send({
					performance: {
						...employee.performance,
						dailyPerformance: 9,
					},
				});

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.performance.dailyPerformance).toBe(9);
		}, 15000);

		it('should block employee updates when the province is locked', async () => {
			const employee = await Employee.create({
				provinceId: testProvince1._id,
				...sampleEmployee,
				performance: {
					dailyPerformance: 1,
					shiftCountPerLocation: 1,
					shiftDuration: 8,
					overtime: 0,
					dailyLeave: 0,
					sickLeave: 0,
					absence: 0,
					travelAssignment: 0,
					status: 'active',
					notes: '',
				},
			});

			await Province.findByIdAndUpdate(testProvince1._id, { is_locked: true });

			const response = await request(app)
				.put(`/provinces/${testProvince1._id}/employees/${employee._id}`)
				.set('Cookie', provinceAdminCookie)
				.send({
					performance: {
						...employee.performance,
						dailyPerformance: 9,
					},
				});

			expect(response.status).toBe(423);
			expect(response.body.code).toBe('PERFORMANCE_LOCKED');
		}, 15000);

		it('should allow global admin updates when the province is locked', async () => {
			const employee = await Employee.create({
				provinceId: testProvince1._id,
				...sampleEmployee,
				performance: {
					dailyPerformance: 1,
					shiftCountPerLocation: 24,
					shiftDuration: 8,
					overtime: 0,
					dailyLeave: 0,
					sickLeave: 0,
					absence: 0,
					travelAssignment: 0,
					status: 'active',
					notes: '',
				},
			});

			await Province.findByIdAndUpdate(testProvince1._id, { is_locked: true });

			const response = await request(app)
				.put(`/provinces/${testProvince1._id}/employees/${employee._id}`)
				.set('Cookie', globalAdminCookie)
				.send({
					performance: {
						...employee.performance,
						dailyPerformance: 9,
					},
				});

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.performance.dailyPerformance).toBe(9);
		}, 15000);
	});
});
