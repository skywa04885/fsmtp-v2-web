import restify from 'restify';
import errors from 'restify-errors';
import cassandraDriver, { auth } from 'cassandra-driver';
import { Bearer } from '../../../../helpers/bearer.helper';
import { Mailbox, MailboxFlags } from '../../../../models/mail/mailbox.model';
import { validateRequest } from '../../../../helpers/validation.helper';
import { EmailShortcut, EmailFlags } from '../../../../models/mail/email-shortcut.model';
import { reject, auto } from 'async';
import { EmailRaw } from '../../../../models/mail/email-raw.model';
import { MailboxStatus } from '../../../../models/mail/mailbox-status.model';
import { sendInternalServerError } from '../../../../helpers/errors.helper';
import { Cassandra } from '../../../../helpers/database.helper';

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
      }).catch(err => sendInternalServerError(req, res, next, err, __filename));
      // -> End Bearer.authRequest()
    }).catch(err => {});
  };

  export const GET_Shortcut = (
    req: restify.Request, res: restify.Response, 
    next: restify.Next
  ) => {

    let mailbox: any;
    if (req.headers['mailbox']) {
      mailbox = req.headers['mailbox'].toString();
    } else return next(new errors.InvalidHeaderError({}, "Mailbox header is required"));

    let email_uuid: any;
    if (req.headers['email-uuid']) {
      try {
        email_uuid = cassandraDriver.types.TimeUuid.fromString(req.headers['email-uuid'].toString());
      } catch (e) {
        return next(new errors.InvalidHeaderError({}, "Invalid header value for Email-UUID"));
      }
    } else return next(new errors.InvalidHeaderError({}, "Email-UUID header is required"));

    Bearer.authRequest(req, res, next).then(authObj => {
      EmailShortcut.get(authObj.domain, authObj.uuid, mailbox, email_uuid).then(shortcut => {
        res.json({
          e_domain: shortcut.e_Domain,
          e_subject: shortcut.e_Subject,
          e_preview: shortcut.e_Preview,
          e_owners_uuid: shortcut.e_OwnersUUID,
          e_email_uuid: shortcut.e_EmailUUID,
          e_uid: shortcut.e_UID,
          e_flags: shortcut.e_Flags,
          e_bucket: shortcut.e_Bucket,
          e_mailbox: shortcut.e_Mailbox,
          e_size_octets: shortcut.e_SizeOctets,
          e_from: shortcut.e_From
        });
      }).catch(err => sendInternalServerError(req, res, next, err, __filename));
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

    // Authenticates the user and starts fetching the emails
    //  after this we make them more JSON readable and send them
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
            e_uid: shortcut.e_UID,
            e_from: shortcut.e_From,
            e_mailbox: shortcut.e_Mailbox
          };
        }));
        // -> End EmailShortcut.gatherAll()
      }).catch(err => sendInternalServerError(req, res, next, err, __filename));
      // -> End Bearer.authRequest()
    }).catch(err => {});
  };

  export const GET_GetEmail = (
    req: restify.Request, res: restify.Response, 
    next: restify.Next
  ) => {
    let bucket: number;
    let emailUuid: cassandraDriver.types.TimeUuid;

    // Checks if the email bucket is in the header, and then tries
    //  to parse it as an integer
    if (!req.headers['email-bucket'])
      return next(new errors.InvalidHeaderError('Email-Bucket header is required'));
    else bucket = parseInt(req.headers['email-bucket'].toString());
    
    // Checks if the email uuid is in the header, since the parsing may crash
    //  the current thread, we will do it in try catch statement
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
      }).catch(err => sendInternalServerError(req, res, next, err, __filename));
    }).catch(err => {});
  };

  export const POST_FlagEmail = (
    req: restify.Request, res: restify.Response, 
    next: restify.Next
  ) => {
    if (!validateRequest(req, res, next, {
      properties: {
        flag: {
          type: 'string',
          required: true
        },
        mailbox: {
          type: 'string',
          required: true
        },
        email_uuid: {
          type: 'string',
          required: true
        }
      }
    })) return;

    // Checks if the flag is valid, if so store the binary
    //  value of the flag, so we can later set it
    let flag: number;
    switch (req.body.flag.toString()) {
      case 'seen':
        flag = EmailFlags.Seen;
        break;
      case 'deleted':
        flag = EmailFlags.Deleted;
        break;
      default: return next(new errors.InvalidArgumentError());
    }

    // Parses the email uuid, and throws error
    //  if this does not work out
    let uuid: cassandraDriver.types.TimeUuid;
    try {
      uuid = cassandraDriver.types.TimeUuid.fromString(req.body.email_uuid);
    } catch (err) {
      return sendInternalServerError(req, res, next, err, __filename);
    }

    Bearer.authRequest(req, res, next).then(authObj => {
      EmailShortcut.setFlag(
        authObj.domain, authObj.uuid, 
        req.body.mailbox, uuid, flag
      ).then(() => {

        // Checks if we need to perform any further operations
        if (flag === EmailFlags.Deleted) {
          MailboxStatus.addOneEmail(authObj.bucket, authObj.domain, authObj.uuid, 'INBOX.Trash').then(() => {
            MailboxStatus.removeOneEmail(authObj.bucket, authObj.domain, authObj.uuid, req.body.mailbox).then(() => {
              res.send(200, 'success');
            }).catch(err => sendInternalServerError(req, res, next, err, __filename));
          }).catch(err => sendInternalServerError(req, res, next, err, __filename));
        } else {
          res.send(200, 'success');
        }
      })
      .catch(err => sendInternalServerError(req, res, next, err, __filename));
    });
  };

  export const POST_UnFlagEmail = (
    req: restify.Request, res: restify.Response, 
    next: restify.Next
  ) => {
    if (!validateRequest(req, res, next, {
      properties: {
        flag: {
          type: 'string',
          required: true
        },
        mailbox: {
          type: 'string',
          required: true
        },
        email_uuid: {
          type: 'string',
          required: true
        }
      }
    })) return;

    // Checks if the flag is valid, if so store the binary
    //  value of the flag, so we can later set it
    let flag: number;
    switch (req.body.flag.toString()) {
      case 'seen':
        flag = EmailFlags.Seen;
        break;
      case 'deleted':
        flag = EmailFlags.Deleted;
        break;
      default: return next(new errors.InvalidArgumentError());
    }

    // Parses the email uuid, and throws error
    //  if this does not work out
    let uuid: cassandraDriver.types.TimeUuid;
    try {
      uuid = cassandraDriver.types.TimeUuid.fromString(req.body.email_uuid);
    } catch (err) {
      return sendInternalServerError(req, res, next, err, __filename);
    }

    Bearer.authRequest(req, res, next).then(authObj => {
      EmailShortcut.clearFlag(
        authObj.domain, authObj.uuid, 
        req.body.mailbox, uuid, flag
      ).then(() => {

        // Checks if we need to perform any further operations
        if (flag === EmailFlags.Deleted) {
          MailboxStatus.removeOneEmail(authObj.bucket, authObj.domain, authObj.uuid, 'INBOX.Trash').then(() => {
            MailboxStatus.addOneEmail(authObj.bucket, authObj.domain, authObj.uuid, req.body.mailbox).then(() => {
              res.send(200, 'success');
            }).catch(err => sendInternalServerError(req, res, next, err, __filename));
          }).catch(err => sendInternalServerError(req, res, next, err, __filename));
        } else {
          res.send(200, 'success');
        }
      })
      .catch(err => sendInternalServerError(req, res, next, err, __filename));
    });
  };

  export const GET_MailboxStats = (
    req: restify.Request, res: restify.Response, 
    next: restify.Next
  ) => {
    let mailboxes: string[] = [];

    // Checks if the headers contain the mailboxes field
    //  this header will be used to check which mailboxes needs to be checked
    if (!req.headers['mailboxes'])
      return next(new errors.InvalidHeaderError('Mailboxes header is required'));
    else mailboxes = req.headers['mailboxes'].toString().split(',');

    Bearer.authRequest(req, res, next).then(authObj => {
      let tasks: any[] = [];

      // Generates teh batch mailbox status tasks, these will be executed in paralell
      //  by the next command
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
      }).catch(err => sendInternalServerError(req, res, next, err, __filename));
    }).catch(err => {});
  };

  export const POST_MoveEmail = (
    req: restify.Request, res: restify.Response, 
    next: restify.Next
  ) => {
    if (!validateRequest(req, res, next, {
      properties: {
        mailbox: {
          type: 'string',
          required: true
        },
        mailbox_target: {
          type: 'string',
          required: true
        },
        email_uuid: {
          type: 'string',
          required: true
        }
      }
    })) return;

    // Tries to parse the uuid, this may crash the server and that
    //  is why we use an try/catch... Learned it the hard way
    let uuid: cassandraDriver.types.TimeUuid;
    try {
      uuid = cassandraDriver.types.TimeUuid.fromString(req.body.email_uuid);
    } catch (err)
    {
      return sendInternalServerError(req, res, next, err, __filename);
    }

    Bearer.authRequest(req, res, next).then(authObj => {
      // Moves the email shortcut, after which we will update the in memory stats
      //  of both of the mailboxes
      EmailShortcut.move(authObj.domain, authObj.uuid, req.body.mailbox, uuid, req.body.mailbox_target, authObj.bucket).then(() => {
        res.send(200, 'success');
      }).catch(err => sendInternalServerError(req, res, next, err, __filename));
    }).catch(err => {});
  };

  export const POST_EraseTrash = (
    req: restify.Request, res: restify.Response, 
    next: restify.Next
  ) => {
    Bearer.authRequest(req, res, next).then(authObj => {
      const baseQuery: string = `SELECT e_flags, e_mailbox, e_email_uuid, e_bucket
      FROM ${Cassandra.keyspace}.email_shortcuts 
      WHERE e_domain=? AND e_owners_uuid=? ALLOW FILTERING`;

      // Loops over all the emails from a users inbox and searches for the
      //  deleted ones, if such one is found add the query to the final batch
      //  query array.

      const stream = Cassandra.client.stream(baseQuery, [authObj.domain, authObj.uuid], {
        autoPage: true,
        prepare: true
      });

      const queries: {
        query: string,
        params: any[]
      }[] = [];
      stream.on('readable', () => {
        let row: any;
        while (row = (<any>stream).read()) {
          if ((row['e_flags'] & EmailFlags.Deleted) !== EmailFlags.Deleted) continue;
          
          queries.push({
            query: `DELETE FROM ${Cassandra.keyspace}.email_shortcuts
            WHERE e_domain=? AND e_owners_uuid=? AND e_mailbox=? AND e_email_uuid=?`,
            params: [authObj.domain, authObj.uuid, row['e_mailbox'], row['e_email_uuid']]
          });

          queries.push({
            query: `DELETE FROM ${Cassandra.keyspace}.raw_emails
            WHERE e_domain=? AND e_owners_uuid=? AND e_bucket=? AND e_email_uuid=?`,
            params: [authObj.domain, authObj.uuid, row['e_bucket'], row['e_email_uuid']]
          });
        }
      });

      stream.on('close', err => {
        if (queries.length > 0) {
          MailboxStatus.get(authObj.bucket, authObj.domain, authObj.uuid, "INBOX.Trash").then(mailbox => {
            mailbox.s_Total = 0;
            mailbox.saveTotalAndUID("INBOX.Trash").then(() => {
              Cassandra.client.batch(queries, {prepare: true})
              .then(() => res.send(200, 'success'))
              .catch(err => sendInternalServerError(req, res, next, err, __filename));
            }).catch(err => sendInternalServerError(req, res, next, err, __filename));
            // End -> mailbox.saveTotalAndUID
          }).catch(err => sendInternalServerError(req, res, next, err, __filename));
          // End -> MailboxStatus.get
        } else {
          res.send(200, 'success');
        }
      });

      stream.on('error', err => {
        sendInternalServerError(req, res, next, err, __filename);
      });
    }).catch(err => {});
  };
}