import restify from 'restify';
import { readConfig } from '../../helpers/config.helper';
import { Logger, LoggerLevel } from '../../logger';
import { Routes } from './routes/index';
import { Cassandra } from '../../helpers/database.helper';
import cors from 'restify-cors-middleware';

const CONFIG: any = readConfig();
const PORT: number = CONFIG.services.mailboxes.port;
const ADDRESS: string = CONFIG.services.mailboxes.address;

const logger: Logger = new Logger(LoggerLevel.Info, 'Mailboxes');
const server: restify.Server = restify.createServer();

Cassandra.connect(CONFIG.global.cassandra);

const corsMiddleware = cors({
  origins: ['*'],
  allowHeaders: ['*'],
  exposeHeaders: ['*']
});
server.pre(corsMiddleware.preflight);
server.use(corsMiddleware.actual);
server.use(restify.plugins.bodyParser({
  mapParams: false
}));

Routes.use(server);

server.listen(PORT, ADDRESS);
logger.print(`Server listening on -> ${ADDRESS}:${PORT}`);
