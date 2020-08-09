import restify from 'restify';
import { readConfig } from '../../helpers/config.helper';
import { Logger, LoggerLevel } from '../../logger';
import { Routes } from './routes/index';
import { Cassandra } from '../../helpers/database.helper';

const CONFIG: any = readConfig();
const PORT: number = CONFIG.services.accounts.port;
const ADDRESS: string = CONFIG.services.accounts.address;

const logger: Logger = new Logger(LoggerLevel.Info, 'Accounts');
const server: restify.Server = restify.createServer();

// Connects to apache cassandra, and other services
Cassandra.connect(CONFIG.services.accounts.cassandra);

// Uses the body parser and other pre-defined things
//  so we can actaully read the data
server.use(restify.plugins.bodyParser({ mapParams: false }))

// Uses the routes, this is done in an separate file
//  since that will make everything more clear
Routes.use(server);

// Starts listening the server and prints the address and port to the log
//  just to make it more clear whats happening
server.listen(PORT, ADDRESS);
logger.print(`Server listening on -> ${ADDRESS}:${PORT}`);
