import { Schema, model, models, Document } from 'mongoose';

export interface IBasicInfo {
	firstName: string;
	lastName: string;
	nationalID: string;
	male: boolean;
	married: boolean;
	childrenCount: number;
}

export interface IWorkPlace {
	provinceName: string;
	branch: string;
	rank: string;
	licensedWorkplace: string;
	travelAssignment: boolean;
}

export interface IAdditionalSpecifications {
	educationalDegree: string;
	dateOfBirth: Date;
	contactNumber: string;
	jobStartDate: Date;
	jobEndDate?: Date;
	status: string;
}

export interface IPerformance {
	dailyPerformance: number;
	shiftCountPerLocation: number;
	shiftDuration: number;
	overtime: number;
	dailyLeave: number;
	sickLeave: number;
	absence: number;
	volunteerShiftCount: number;
	truckDriver: boolean;
	monthYear: string;
	notes?: string;
}

export interface IEmployee extends Document {
	province: Schema.Types.ObjectId;
	basicInfo: IBasicInfo;
	workPlace: IWorkPlace;
	additionalSpecifications: IAdditionalSpecifications;
	performances: IPerformance[];
	createdAt: Date;
	updatedAt: Date;
}

const BasicInfoSchema = new Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	nationalID: { type: String, unique: true, required: true },
	male: { type: Boolean, required: true },
	married: { type: Boolean, default: false },
	childrenCount: { type: Number, default: 0 }
});

const WorkPlaceSchema = new Schema({
	provinceName: { type: String, required: true },
	branch: { type: String, required: true },
	rank: { type: String, required: true },
	licensedWorkplace: { type: String, required: true },
	travelAssignment: { type: Boolean, default: false }
});

const AdditionalSpecificationsSchema = new Schema({
	educationalDegree: { type: String, required: true },
	dateOfBirth: { type: Date, required: true },
	contactNumber: { type: String, required: true },
	jobStartDate: { type: Date, required: true },
	jobEndDate: { type: Date },
	status: { type: String, default: 'active' }
});

const PerformanceSchema = new Schema({
	dailyPerformance: { type: Number, required: true },
	shiftCountPerLocation: { type: Number, required: true },
	shiftDuration: { type: Number, required: true },
	overtime: { type: Number, default: 0 },
	dailyLeave: { type: Number, default: 0 },
	sickLeave: { type: Number, default: 0 },
	absence: { type: Number, default: 0 },
	volunteerShiftCount: { type: Number, default: 0 },
	truckDriver: { type: Boolean, default: false },
	monthYear: { type: String, required: true },
	notes: { type: String }
});

const EmployeeSchema = new Schema({
	province: { type: Schema.Types.ObjectId, ref: 'Province', required: true },
	basicInfo: { type: BasicInfoSchema, required: true },
	workPlace: { type: WorkPlaceSchema, required: true },
	additionalSpecifications: { type: AdditionalSpecificationsSchema, required: true },
	performances: [PerformanceSchema]
}, { timestamps: true });

export const Employee = models.Employee || model<IEmployee>('Employee', EmployeeSchema);
