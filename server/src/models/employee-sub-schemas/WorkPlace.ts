import { Schema } from 'mongoose';

export interface IWorkPlace {
	branch: string;
	rank: string;
	licensedWorkplace: string;
}

export const WorkPlaceSchema = new Schema<IWorkPlace>({
	branch: { type: String, required: true, trim: true },
	rank: { type: String, required: true, trim: true },
	licensedWorkplace: { type: String, required: true, trim: true }
});
