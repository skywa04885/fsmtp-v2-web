import errors from 'restify-errors';
import restify from 'restify';
import { Logger, LoggerLevel } from '../logger';

const logger: Logger = new Logger(LoggerLevel.Error, 'ErrorHelper');

export const sendInternalServerError = (
  req: restify.Request, res: restify.Response,
  next: restify.Next, error: Error, file: string
): void => {
  logger.print(`Fatal exception occured on: ${file}`);
  console.error(error);

  next(new errors.InternalServerError({
    cause: error,
    info: {
      timestamp: Date.now()
    }
  }));
};
