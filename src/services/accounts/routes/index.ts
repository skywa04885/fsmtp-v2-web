import restify from 'restify';
import { Routes as AuthenticationRoutes } from './authentication.route';
import { Routes as AccountsRouter } from './accounts.route';

export namespace Routes
{
  export const use = (server: restify.Server) => {
    AuthenticationRoutes.authenticationRoute(server);
    AccountsRouter.accountsRoute(server);
  };  
}