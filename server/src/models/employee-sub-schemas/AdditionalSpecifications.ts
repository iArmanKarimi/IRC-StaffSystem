import { Schema } from 'mongoose';

export interface IAdditionalSpecifications {
	educationalDegree: string;
	dateOfBirth: Date;
	contactNumber: string;
	jobStartDate: Date;
	jobEndDate?: Date;
}

export const AdditionalSpecificationsSchema = new Schema<IAdditionalSpecifications>({
	educationalDegree: { type: String, required: true, trim: true },
	dateOfBirth: { type: Date, required: true },
	contactNumber: { type: String, required: true, trim: true, match: /^\d{10}$/ },
	jobStartDate: { type: Date, required: true },
	jobEndDate: { type: Date }
});
