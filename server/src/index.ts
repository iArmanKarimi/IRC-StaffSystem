import { app } from "./app";
import { connectDB } from "./data-source";
import { getConfig } from "./config";
import { logger } from "./middleware/logger";

const config = getConfig();

async function startServer() {
	try {
		logger.info("Starting server", {
			environment: config.nodeEnv,
			port: config.port
		});

		await connectDB();

		const server = app.listen(config.port, () => {
			logger.info(`Server running on port ${config.port}`);
		});

		// Handle server errors
		server.on('error', (err: NodeJS.ErrnoException) => {
			if (err.code === 'EADDRINUSE') {
				logger.error(`Port ${config.port} is already in use`);
			} else {
				logger.error('Server error', err);
			}
			process.exit(1);
		});

		// Handle graceful shutdown
		process.on('SIGTERM', () => {
			logger.info('SIGTERM signal received: closing HTTP server');
			server.close(() => {
				logger.info('HTTP server closed');
				process.exit(0);
			});
		});

		process.on('SIGINT', () => {
			logger.info('SIGINT signal received: closing HTTP server');
			server.close(() => {
				logger.info('HTTP server closed');
				process.exit(0);
			});
		});
	} catch (err) {
		logger.error("Error during server initialization", err);
		process.exit(1);
	}
}

startServer();
