import Config from '../Config';
import Axios from 'axios';

import { Mailbox } from '../models/Mailbox.model';
import { AccountService } from './Accounts.service';
import { EmailShortcut } from '../models/EmailShortcut.model';
import { MailboxStatus } from '../models/MailboxStatus.model';

export class MailboxesService {
  public static port: number = 4002;

  public static gatherMailboxStats = (mailboxes: Mailbox[]): Promise<MailboxStatus[]> => {
    return new Promise<MailboxStatus[]>((resolve, reject) => {
      setTimeout(() => {
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
      }, 200);
    });
  };

  public static gatherMailboxes = (): Promise<Mailbox[]> => {
    return new Promise<Mailbox[]>((resolve, reject) => {
      setTimeout(() => {
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
      }, 200);
    });
  };

  public static gatherContents = (mailbox: string, page: number): Promise<EmailShortcut[]> => {
    return new Promise<EmailShortcut[]>((resolve, reject) => {
      setTimeout(() => {
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
      }, 200);
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
