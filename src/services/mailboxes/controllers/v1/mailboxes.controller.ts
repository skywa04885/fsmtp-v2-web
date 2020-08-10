import restify from 'restify';
import errors from 'restify-errors';
import { Bearer } from '../../../../helpers/bearer.helper';
import { Mailbox } from '../../../../models/mail/mailbox.model';

export namespace Controllers
{
  /**
   * Gets all the mailboxes of a user
   * 
   * @param req
   * @param res
   * @param next
   */
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
      }).catch(err => next(new errors.InternalServerError({}, err.toString())));
    }).catch(err => {});
  };
}