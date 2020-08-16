import restify from 'restify';
import path from 'path';
import fs from 'fs';
import { readConfig } from '../../helpers/config.helper';
import { Logger, LoggerLevel } from '../../logger';
import { Routes } from './routes/index';
import { Cassandra, Redis } from '../../helpers/database.helper';
import cors from 'restify-cors-middleware';

const CONFIG: any = readConfig();
const PORT: number = CONFIG.services.mailboxes.port;
const ADDRESS: string = CONFIG.services.mailboxes.address;
const CERT: any = fs.readFileSync(path.join(process.cwd(), CONFIG["ssl"]["cert"]));
const CA: any = fs.readFileSync(path.join(process.cwd(), CONFIG["ssl"]["ca"]));
const KEY: any = fs.readFileSync(path.join(process.cwd(), CONFIG["ssl"]["key"]));

const logger: Logger = new Logger(LoggerLevel.Info, 'Mailboxes');
const server: restify.Server = restify.createServer({
  key: KEY,
  cert: CERT,
  ca: CA
});


Cassandra.connect(CONFIG.global.cassandra);
Redis.connect(CONFIG.global.redis);

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
