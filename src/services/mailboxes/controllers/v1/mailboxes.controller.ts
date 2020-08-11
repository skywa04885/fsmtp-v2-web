import restify from 'restify';
import errors from 'restify-errors';
import cassandraDriver, { auth } from 'cassandra-driver';
import { Bearer } from '../../../../helpers/bearer.helper';
import { Mailbox } from '../../../../models/mail/mailbox.model';
import { validateRequest } from '../../../../helpers/validation.helper';
import { EmailShortcut } from '../../../../models/mail/email-shortcut.model';
import { reject } from 'async';
import { EmailRaw } from '../../../../models/mail/email-raw.model';
import { MailboxStatus } from '../../../../models/mail/mailbox-status.model';

export namespace Controllers
{
  export const GET_GetMailboxes = (
    req: restify.Request, res: restify.Response, 
    next: restify.Next
  ) => {
    Bearer.authRequest(req, res, next).then(authObj => {
      Mailbox.gatherAll(authObj.bucket, authObj.domain, authObj.uuid, false).then(mailboxes => {
        res.json(mailboxes.map(mailbox => {
          return {
            e_bucket: mailbox.e_Bucket,
            e_message_count: mailbox.e_MessageCount,
            e_domain: mailbox.e_Domain,
            e_uuid: mailbox.e_UUID,
            e_mailbox_path: mailbox.e_MailboxPath,
            e_mailbox_stand: mailbox.e_MailboxStand,
            e_subscribed: mailbox.e_Subscribed,
            e_flags: mailbox.e_Flags
          }
        }));
        // End -> Mailbox.gatherAll()
      }).catch(err => next(new errors.InternalServerError({}, err.toString())));
      // -> End Bearer.authRequest()
    }).catch(err => {});
  };

  export const GET_GetMailboxContent = (
    req: restify.Request, res: restify.Response, 
    next: restify.Next
  ) => {
    let mailbox: string;
    let from: number, to: number;

    if (!req.headers.mailbox) mailbox = 'INBOX';
    else mailbox = req.headers.mailbox.toString();

    if (!req.headers.from) from = 0;
    else from = parseInt(req.headers.from.toString());
    
    if (!req.headers.to) to = 60;
    else to = parseInt(req.headers.to.toString());

    if (from >= to) res.json([]);

    Bearer.authRequest(req, res, next).then(authObj => {
      EmailShortcut.gatherAll(from, to, authObj.domain, mailbox, authObj.uuid).then(data => {
        res.json(data.map(shortcut => {
          return {
            e_subject: shortcut.e_Subject,
            e_preview: shortcut.e_Preview,
            e_email_uuid: shortcut.e_EmailUUID,
            e_uuid: shortcut.e_UID,
            e_flags: shortcut.e_Flags,
            e_bucket: shortcut.e_Bucket,
            e_size_octets: shortcut.e_SizeOctets,
            e_uid: shortcut.e_UID
          };
        }));
        // -> End EmailShortcut.gatherAll()
      }).catch(err => next(new errors.InternalServerError({}, err.toString())));
      // -> End Bearer.authRequest()
    }).catch(err => {});
  };

  export const GET_GetEmail = (
    req: restify.Request, res: restify.Response, 
    next: restify.Next
  ) => {
    let bucket: number;
    let emailUuid: cassandraDriver.types.TimeUuid;

    if (!req.headers['email-bucket'])
      return next(new errors.InvalidHeaderError('Email-Bucket header is required'));
    else bucket = parseInt(req.headers['email-bucket'].toString());

    if (!req.headers['email-uuid'])
      return next(new errors.InvalidHeaderError('Email-UUID header is required'));
    else {
      try {
        emailUuid = cassandraDriver.types.TimeUuid.fromString(req.headers['email-uuid'].toString());
      } catch (err) {
        return next(new errors.InvalidHeaderError('Email-UUID header is invalid'));
      }
    }

    Bearer.authRequest(req, res, next).then(authObj => {
      EmailRaw.get(bucket, authObj.domain, authObj.uuid, emailUuid).then(email => {
        if (!email) next(new errors.ResourceNotFoundError());
        else res.send(200, email.e_Content, {
          'Content-Type': 'text/plain'
        });
      }).catch(err => next(new errors.InternalServerError({}, err.toString())));
    }).catch(err => {});
  };

  export const GET_MailboxStats = (
    req: restify.Request, res: restify.Response, 
    next: restify.Next
  ) => {
    let mailboxes: string[] = [];

    if (!req.headers['mailboxes'])
      return next(new errors.InvalidHeaderError('Mailboxes header is required'));
    else mailboxes = req.headers['mailboxes'].toString().split(',');

    Bearer.authRequest(req, res, next).then(authObj => {
      let tasks: any[] = [];

      mailboxes.forEach(mailbox => {
        tasks.push(MailboxStatus.get(authObj.bucket, authObj.domain, authObj.uuid, mailbox));
      });

      Promise.all(tasks).then(results => {
        res.json(results.map((result: MailboxStatus) => {
          return {
            s_unseen: result.s_Unseen,
            s_next_uid: result.s_NextUID,
            s_recent: result.s_Recent,
            s_total: result.s_Total,
            s_flags: result.s_Flags,
            s_perma_flags: result.s_PermaFlags,
            s_path: result.s_MailboxPath
          };
        }))
      }).catch(err => next(new errors.InternalServerError({}, err.toString())));
    }).catch(err => {});
  };
}