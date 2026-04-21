import request from 'supertest';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { app } from '../app';
import { startTestDB, cleanupTestDB, stopTestDB } from './setup';
import { User } from '../models/User';
import { Province } from '../models/Province';
import { Employee } from '../models/Employee';

describe('Global Employee Routes', () => {
	let globalAdminCookie: string;
	let provinceAdminCookie: string;
	let testProvince1: any;
	let testProvince2: any;

	beforeAll(async () => {
		await startTestDB();

		await cleanupTestDB();

		testProvince1 = await Province.create({
			name: 'Province 1',
			admin: new mongoose.Types.ObjectId(),
		});
		testProvince2 = await Province.create({
			name: 'Province 2',
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
			provinceId: testProvince1._id,
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

	describe('GET /employees/export-all', () => {
		it('should deny access for non-admin users', async () => {
			const response = await request(app).get('/employees/export-all');
			expect(response.status).toBe(401);
		}, 15000);

		it('should deny access for province admin users', async () => {
			const response = await request(app)
				.get('/employees/export-all')
				.set('Cookie', provinceAdminCookie);
			expect(response.status).toBe(403);
		}, 15000);

		it('should return 404 when no employees exist', async () => {
			const response = await request(app)
				.get('/employees/export-all')
				.set('Cookie', globalAdminCookie);
			expect(response.status).toBe(404);
			expect(response.body.error).toBe('No employees found');
		}, 15000);

		it('should export all employees as an Excel file', async () => {
			await Employee.create({
				provinceId: testProvince1._id,
				basicInfo: {
					nationalID: 'EMP-001',
					firstName: 'John',
					lastName: 'Doe',
					male: true,
				},
				workPlace: {
					licensedWorkplace: 'Station A',
					rank: 'Senior',
					branch: 'Main',
				},
				additionalSpecifications: {
					jobStartDate: new Date('2020-01-01'),
					contactNumber: '12345678901',
					dateOfBirth: new Date('1990-01-01'),
					educationalDegree: 'Bachelor',
				},
			});

			const response = await request(app)
				.get('/employees/export-all')
				.set('Cookie', globalAdminCookie);

			expect(response.status).toBe(200);
			expect(response.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
			expect(response.headers['content-disposition']).toContain('attachment; filename=');
		}, 15000);
	});

	describe('DELETE /employees/clear-performances', () => {
		const employeePayload = {
			basicInfo: {
				nationalID: 'EMP-100',
				firstName: 'A',
				lastName: 'B',
				male: true,
			},
			workPlace: {
				licensedWorkplace: 'Station A',
				rank: 'Senior',
				branch: 'Main',
			},
			additionalSpecifications: {
				jobStartDate: new Date('2020-01-01'),
				contactNumber: '12345678901',
				dateOfBirth: new Date('1990-01-01'),
				educationalDegree: 'Bachelor',
			},
			performance: {
				dailyPerformance: 5,
				shiftCountPerLocation: 12,
				shiftDuration: 12,
				overtime: 8,
				dailyLeave: 4,
				sickLeave: 1,
				absence: 2,
				travelAssignment: 1,
				status: 'inactive',
				notes: 'custom notes',
			},
		};

		beforeEach(async () => {
			await Employee.create({
				...employeePayload,
				provinceId: testProvince1._id,
				basicInfo: {
					...employeePayload.basicInfo,
					nationalID: 'EMP-100',
				},
			});

			await Employee.create({
				...employeePayload,
				provinceId: testProvince2._id,
				basicInfo: {
					...employeePayload.basicInfo,
					nationalID: 'EMP-101',
				},
			});
		}, 15000);

		it('should deny access for province admin users', async () => {
			const response = await request(app)
				.delete('/employees/clear-performances')
				.set('Cookie', provinceAdminCookie);
			expect(response.status).toBe(403);
		}, 15000);

		it('should reset performance data to defaults', async () => {
			const response = await request(app)
				.delete('/employees/clear-performances')
				.set('Cookie', globalAdminCookie);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.modifiedCount).toBe(2);

			const employees = await Employee.find().sort({ 'basicInfo.nationalID': 1 }).lean();
			expect(employees).toHaveLength(2);
			expect(employees[0].performance?.dailyPerformance).toBe(0);
			expect(employees[0].performance?.shiftDuration).toBe(8);
			expect(employees[1].performance?.dailyPerformance).toBe(0);
			expect(employees[1].performance?.shiftDuration).toBe(8);
			expect(employees[1].performance?.overtime).toBe(0);
		}, 15000);
	});
});
