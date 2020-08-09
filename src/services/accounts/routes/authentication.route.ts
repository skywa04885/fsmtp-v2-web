import restify from 'restify';
import { Controllers as V1Controllers } from '../controllers/v1/authentication.controller';

export namespace Routes
{
  export const authenticationRoute = (server: restify.Server) => {
    server.post('/auth/register', restify.plugins.conditionalHandler([
      { version: '1.0.0', handler: V1Controllers.POST_AuthRegister }
    ]));
  };
}
