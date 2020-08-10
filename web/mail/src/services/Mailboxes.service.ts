import Config from '../Config';
import Axios from 'axios';

import { Mailbox } from '../models/Mailbox.model';
import { AccountService } from './Accounts.service';
import { EmailShortcut } from '../models/EmailShortcut.model';

export class MailboxesService {
  public static port: number = 4002;

  public static gatherMailboxes = (): Promise<Mailbox[]> => {
    return new Promise<Mailbox[]>((resolve, reject) => {
      // Prepares the data for axios, like the headers
      const url: string = Config.buildURL('/get/mailboxes', MailboxesService.port);
      const options: any = {
        headers: Object.assign(Config.defaultHeaders, {
          'Authorization': AccountService.buildBearer()
        })
      };

      // Performs the axios request, and checks for errors
      //  if none just parse the result and return it
      Axios.get(url, options).then(response => {
        // Checks if the request failed, if so just quit
        if (response.status !== 200)
          reject(new Error(`${response.status}: ${response.statusText}`));
        
        // Parses the response data
        let result: Mailbox[] = [];
        response.data.forEach((rawMailbox: any) => {
          result.push(Mailbox.fromMap(rawMailbox));
        });
        resolve(result);
      }).catch(err => reject(err));
    });
  };

  public static gatherContents = (mailbox: string, page: number): Promise<EmailShortcut[]> => {
    return new Promise<EmailShortcut[]>((resolve, reject) => {
      // Calculates the pagination index, each page is 50 next
      const from = page * 50;
      const to = from + 50;
  
      // Prepares the data for axios, like the headers and url
      const url: string = Config.buildURL('/get/content', MailboxesService.port);
      const options: any = {
        headers: Object.assign(Config.defaultHeaders, {
          'Authorization': AccountService.buildBearer(),
          'From': from,
          'To': to,
          'Mailbox': mailbox
        })
      };

      // Performs the axios request, checks for errors
      //  and parses the response after that
      Axios.get(url, options).then(response => {
        // Checks if the request failed, if so just return
        if (response.status !== 200)
          reject(new Error(`${response.status}: ${response.statusText}`));

        // Parses the response data
        let result: EmailShortcut[] = [];
        response.data.forEach((rawShortcut: any) => {
          result.push(EmailShortcut.fromMap(rawShortcut));
        });
        resolve(result);
      }).catch(err => reject(err));
    });
  };
}
