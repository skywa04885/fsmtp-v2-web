import Config from '../Config';
import Axios from 'axios';

import { Mailbox } from '../models/Mailbox.model';
import { AccountService } from './Accounts.service';
import { EmailShortcut, EmailFlags } from '../models/EmailShortcut.model';
import { MailboxStatus } from '../models/MailboxStatus.model';

export class MailboxesService {
  public static port: number = 4002;

  public static gatherMailboxStats = (mailboxes: Mailbox[]): Promise<MailboxStatus[]> => {
    return new Promise<MailboxStatus[]>((resolve, reject) => {
      const url: string = Config.buildURL('/get/mailboxes/status', MailboxesService.port);
      const options: any = {
        headers: Object.assign(Config.defaultHeaders, {
          'Authorization': AccountService.buildBearer(),
          'Mailboxes': mailboxes.map(mailbox => mailbox.e_MailboxPath).join(',')
        })
      };

      Axios.get(url, options).then(response => {
        if (response.status !== 200)
          return reject(new Error(`${response.status}: ${response.statusText}`));

        resolve(response.data.map((rawStatus: any) => MailboxStatus.fromMap(rawStatus)));
      }).catch(err => reject(err));
    });
  };

  public static gatherMailboxes = (): Promise<Mailbox[]> => {
    return new Promise<Mailbox[]>((resolve, reject) => {
      const url: string = Config.buildURL('/get/mailboxes', MailboxesService.port);
      const options: any = {
        headers: Object.assign(Config.defaultHeaders, {
          'Authorization': AccountService.buildBearer()
        })
      };

      Axios.get(url, options).then(response => {
        if (response.status !== 200)
          return reject(new Error(`${response.status}: ${response.statusText}`));

        resolve(response.data.map((rawMailbox: any) => Mailbox.fromMap(rawMailbox)))
      }).catch(err => reject(err));
    });
  };

  public static clearTrash = (): Promise<null> => {
    return new Promise<null>((resolve, reject) => {
      const url: string = Config.buildURL('/erase-trash', MailboxesService.port);
      const options: any = {
        headers: Object.assign(Config.defaultHeaders, {
          'Authorization': AccountService.buildBearer()
        })
      };

      Axios.post(url, null, options).then(response => {
        if (response.status !== 200)
          return reject(new Error(`${response.status}: ${response.statusText}`));

        resolve();
      }).catch(err => reject(err));
    });
  };

  public static gatherContents = (mailbox: string, page: number): Promise<EmailShortcut[]> => {
    return new Promise<EmailShortcut[]>((resolve, reject) => {
      // Calculates the pagination index, each page is 50 next
      const from = page * 50;
      const to = from + 50;

      const url: string = Config.buildURL('/get/content', MailboxesService.port);
      const options: any = {
        headers: Object.assign(Config.defaultHeaders, {
          'Authorization': AccountService.buildBearer(),
          'From': from,
          'To': to,
          'Mailbox': mailbox
        })
      };

      Axios.get(url, options).then(response => {
        if (response.status !== 200)
          return reject(new Error(`${response.status}: ${response.statusText}`));

        resolve(response.data.map((rawShortcut: any) => EmailShortcut.fromMap(rawShortcut)));
      }).catch(err => reject(err));
    });
  };

  public static flag = (mailbox: string, emailUUID: string, flag: number): Promise<null> => {
    return new Promise<null>((resolve, reject) => {
      const url: string = Config.buildURL('/email/flag', MailboxesService.port);
      const options: any = {
        headers: Object.assign(Config.defaultHeaders, {
          'Authorization': AccountService.buildBearer()
        })
      };

      let flagStr: string;
      switch (flag)
      {
        case EmailFlags.Seen:
          flagStr = 'seen';
          break;
        case EmailFlags.Deleted:
          flagStr = 'deleted';
          break;
        default: return reject('Flag not implemented');
      }

      const fields: any = {
        email_uuid: emailUUID,
        mailbox: mailbox,
        flag: flagStr
      };

      Axios.post(url, fields, options).then(response => {
        if (response.status !== 200)
          return reject(new Error(`${response.status}: ${response.statusText}`));

        resolve();
      }).catch(err => reject(err));
    });
  };

  public static unflag = (mailbox: string, emailUUID: string, flag: number): Promise<null> => {
    return new Promise<null>((resolve, reject) => {
      const url: string = Config.buildURL('/email/flag', MailboxesService.port);
      const options: any = {
        headers: Object.assign(Config.defaultHeaders, {
          'Authorization': AccountService.buildBearer()
        })
      };

      let flagStr: string;
      switch (flag)
      {
        case EmailFlags.Seen:
          flagStr = 'seen';
          break;
        case EmailFlags.Deleted:
          flagStr = 'deleted';
          break;
        default: return reject('Flag not implemented');
      }

      const fields: any = {
        email_uuid: emailUUID,
        mailbox: mailbox,
        flag: flagStr
      };

      Axios.post(url, fields, options).then(response => {
        if (response.status !== 200)
          return reject(new Error(`${response.status}: ${response.statusText}`));

        resolve();
      }).catch(err => reject(err));
    });
  };

  public static move = (mailbox: string, emailUUID: string, mailboxTarget: string): Promise<null> => {
    return new Promise<null>((resolve, reject) => {
      setTimeout(() => {
        const url: string = Config.buildURL('/email/move', MailboxesService.port);
        const options: any = {
          headers: Object.assign(Config.defaultHeaders, {
            'Authorization': AccountService.buildBearer()
          })
        };
        const fields: any = {
          mailbox,
          mailbox_target: mailboxTarget,
          email_uuid: emailUUID
        };
  
        Axios.post(url, fields, options).then(response => {
          if (response.status !== 200)
            return reject(new Error(`${response.status}: ${response.statusText}`));
  
          resolve();
        }).catch(err => reject(err));
      }, 400);
    });
  };

  public static getEmail = (bucket: number, uuid: string): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const url: string = Config.buildURL('/get/email', MailboxesService.port);
      const options: any = {
        headers: Object.assign(Config.defaultHeaders, {
          'Authorization': AccountService.buildBearer(),
          'Email-UUID': uuid,
          'Email-Bucket': bucket
        })
      };

      Axios.get(url, options).then(response => {
        if (response.status !== 200)
          return reject(new Error(`${response.status}: ${response.statusText}`));
        
        resolve(response.data);
      }).catch(err => reject(err));
    });
  };
}
