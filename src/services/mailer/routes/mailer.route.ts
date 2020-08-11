import restify from 'restify';
import { Controllers as MailerControllers } from '../controllers/v1/mailer.controller';

export namespace Routes
{
  export const mailboxesRoute = (server: restify.Server) => {
    server.post('/send', restify.plugins.conditionalHandler([
      {version: '1.0.0', handler: MailerControllers.POST_SendEmail}
    ]));
  };
}