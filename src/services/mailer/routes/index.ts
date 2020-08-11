import restify from 'restify';

import { Routes as MailerRoutes } from './mailer.route';

export namespace Routes {
  export const use = (server: restify.Server) => {
    MailerRoutes.mailboxesRoute(server);
  };
}