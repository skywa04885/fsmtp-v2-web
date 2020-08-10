import restify from 'restify';

import { Routes as MailboxesRoutes } from './mailboxes.route';

export namespace Routes {
  export const use = (server: restify.Server) => {
    MailboxesRoutes.mailboxesRoute(server);
  };
}