import restify from 'restify';
import { Controllers as MailboxesControllers } from '../controllers/v1/mailboxes.controller';

export namespace Routes
{
  export const mailboxesRoute = (server: restify.Server) => {
    server.get('/get/mailboxes', restify.plugins.conditionalHandler([
      {version: '1.0.0', handler: MailboxesControllers.GET_GetMailboxes}
    ]));

    server.get('/get/content', restify.plugins.conditionalHandler([
      {version: '1.0.0', handler: MailboxesControllers.GET_GetMailboxContent}
    ]));

    server.get('/get/email', restify.plugins.conditionalHandler([
      {version: '1.0.0', handler: MailboxesControllers.GET_GetEmail}
    ]));

    server.post('/email/move', restify.plugins.conditionalHandler([
      {version: '1.0.0', handler: MailboxesControllers.POST_MoveEmail}
    ]));

    server.post('/email/flag', restify.plugins.conditionalHandler([
      {version: '1.0.0', handler: MailboxesControllers.POST_FlagEmail}
    ]));

    server.get('/get/mailboxes/status', restify.plugins.conditionalHandler([
      {version: '1.0.0', handler: MailboxesControllers.GET_MailboxStats}
    ]));

    server.post('/erase-trash', restify.plugins.conditionalHandler([
      {version: '1.0.0', handler: MailboxesControllers.POST_EraseTrash}
    ]));
  };
}