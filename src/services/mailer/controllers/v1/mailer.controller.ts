import restify from 'restify';
import errors from 'restify-errors';
import cassandraDriver, { auth } from 'cassandra-driver';
import { Bearer } from '../../../../helpers/bearer.helper';
import { Mailbox } from '../../../../models/mail/mailbox.model';
import { validateRequest } from '../../../../helpers/validation.helper';
import nodemailer from 'nodemailer';
import { readConfig } from '../../../../helpers/config.helper';
import { sendInternalServerError } from '../../../../helpers/errors.helper';

const config: any = readConfig();

export namespace Controllers
{
  export const POST_SendEmail = (
    req: restify.Request, res: restify.Response, 
    next: restify.Next
  ) => {
    if (!validateRequest(req, res, next, {
      properties: {
        subject: {
          type: 'string',
          required: true,
          maxLength: 256
        },
        text: {
          type: 'string',
          required: true
        },
        html: {
          type: 'string',
          required: false
        },
        to: {
          type: 'string',
          required: true,
          maxLength: 1024
        }
      }
    })) return;

    Bearer.authRequest(req, res, next).then(authObject => {
      nodemailer.createTransport({
        host: config.services.mailer.smtp_server,
        port: config.services.mailer.smtp_port,
        tls: {
          rejectUnauthorized: false
        },
        secure: false,
        auth: {
          user: `${authObject.username}@${authObject.domain}`,
          pass: authObject.password
        }
      }).sendMail({
        from: `${authObject.username} <${authObject.username}@${authObject.domain}>`,
        to: req.body.to,
        subject: req.body.subject,
        text: req.body.text,
        html: req.body.html,
        headers: {
          'X-Fannst-Origin': 'Fannst Webmail'
        }
      }).then(info => {
        res.send(200);
      }).catch(err => sendInternalServerError(req, res, next, err, __filename));
    }).catch(err => {});
  };
}