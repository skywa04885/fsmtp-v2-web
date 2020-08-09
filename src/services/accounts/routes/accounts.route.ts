import restify from 'restify';
import { Controllers as V1Controllers } from '../controllers/v1/accounts.controller';

export namespace Routes
{
  export const accountsRoute = (server: restify.Server) => {
    server.get('/accounts/get', restify.plugins.conditionalHandler([
      { version: '1.0.0', handler: V1Controllers.GET_GetAccount }
    ]));
  };
}
