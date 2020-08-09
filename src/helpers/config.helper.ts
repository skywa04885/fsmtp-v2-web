import fs from 'fs';
import path from 'path';
import { Logger, LoggerLevel } from '../logger';

const logger: Logger = new Logger(LoggerLevel.Info, 'ConfigHelper');
let _globalConfigVar: any = undefined;
let _globalEnvConfigVar: any = undefined;

/**
 * Gets the configuration, and reads it from disk if not defined yet
 */
const readConfig = (env = false): any => {
  if (env) if (_globalEnvConfigVar) return _globalEnvConfigVar;
  else if (_globalConfigVar) return _globalConfigVar;

  // Reads the configuration file into an buffer, and returns
  //  the parsed data, while it sets the global variable
  try {
    const data: Buffer = fs.readFileSync(path.join(process.cwd(), env ? 'env.json' : 'config.json'));
    return (_globalConfigVar = JSON.parse(data.toString('utf-8')));
  } catch (e)
  {
    logger.printWithLevel(`Could not read file: ${e}`, LoggerLevel.Fatal);
    process.exit(-1);
  }
}

export { readConfig }
