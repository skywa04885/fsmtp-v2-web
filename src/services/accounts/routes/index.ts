import restify from 'restify';
import { Routes as AuthenticationRoutes } from './authentication.route';

export namespace Routes
{
  export const use = (server: restify.Server) => {
    AuthenticationRoutes.authenticationRoute(server);
  };  
}