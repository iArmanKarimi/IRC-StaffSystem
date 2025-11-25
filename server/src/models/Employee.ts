import { Schema, model, models, Document } from 'mongoose';
import { IBasicInfo, BasicInfoSchema } from './employee-sub-schemas/BasicInfo';
import { IWorkPlace, WorkPlaceSchema } from './employee-sub-schemas/WorkPlace';
import { IAdditionalSpecifications, AdditionalSpecificationsSchema } from './employee-sub-schemas/AdditionalSpecifications';
import { IPerformance, PerformanceSchema } from './employee-sub-schemas/Performance';

export interface IEmployee extends Document {
	provinceId: Schema.Types.ObjectId;
	basicInfo: IBasicInfo;
	workPlace: IWorkPlace;
	additionalSpecifications: IAdditionalSpecifications;
	performances: IPerformance[];
	createdAt: Date;
	updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>({
	provinceId: { type: Schema.Types.ObjectId, ref: 'Province', required: true },
	basicInfo: { type: BasicInfoSchema, required: true },
	workPlace: { type: WorkPlaceSchema, required: true },
	additionalSpecifications: { type: AdditionalSpecificationsSchema, required: true },
	performances: { type: [PerformanceSchema], required: true }
}, { timestamps: true });

// Indexes for better query performance
EmployeeSchema.index({ provinceId: 1 });
EmployeeSchema.index({ 'basicInfo.nationalID': 1 });
EmployeeSchema.index({ createdAt: -1 });

export const Employee = models.Employee || model<IEmployee>('Employee', EmployeeSchema);
