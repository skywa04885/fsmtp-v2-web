import express from 'express';
import path from 'path';
import { readConfig } from '../../helpers/config.helper';
import { Logger, LoggerLevel } from '../../logger';

const CONFIG: any = readConfig();
const PORT: number = CONFIG.services.general.port;

// Creates the express app, logger and adds the basic stuff
const app: express.Application = express();
const logger: Logger = new Logger(LoggerLevel.Info, 'General');
app.use(express.static(path.join(process.cwd(), 'web')));

// Serves the other static files
app.get('/auth/*', (req, res, next) => {
  res.sendFile(path.join(process.cwd(), 'web', 'auth', 'build', 'index.html'));
});

app.get('/mail/*', (req, res, next) => {
  res.sendFile(path.join(process.cwd(), 'web', 'mail', 'build', 'index.html'));
});

// Listens the server
app.listen(PORT, () => logger.print(`Server listening on port ${PORT}`));
