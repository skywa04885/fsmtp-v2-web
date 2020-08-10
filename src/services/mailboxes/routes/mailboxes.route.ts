import restify from 'restify';
import { Controllers as MailboxesControllers } from '../controllers/v1/mailboxes.controller';

export namespace Routes
{
  export const mailboxesRoute = (server: restify.Server) => {
    server.get('/mailboxes/get', restify.plugins.conditionalHandler([
      {version: '1.0.0', handler: MailboxesControllers.GET_GetMailboxes}
    ]));
  };
}