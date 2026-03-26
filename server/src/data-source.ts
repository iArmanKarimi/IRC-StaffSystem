import mongoose from 'mongoose';
import { getConfig } from './config';
import { logger } from './middleware/logger';

export const connectDB = async () => {
	const config = getConfig();
	try {
		await mongoose.connect(config.mongodb.uri);
		logger.info('MongoDB connected successfully', {
			uri: config.mongodb.uri
		});

		// Handle MongoDB connection events
		mongoose.connection.on('error', (err) => {
			logger.error('MongoDB connection error', err);
		});

		mongoose.connection.on('disconnected', () => {
			logger.warn('MongoDB disconnected');
		});

		mongoose.connection.on('reconnected', () => {
			logger.info('MongoDB reconnected');
		});
	} catch (err) {
		logger.error('Failed to connect to MongoDB', err);
		throw err; // Re-throw to let caller handle
	}
};

export const closeDB = async () => {
	try {
		await mongoose.connection.close();
		logger.info('MongoDB connection closed');
	} catch (err) {
		logger.error('Error closing MongoDB connection', err);
		throw err;
	}
};
