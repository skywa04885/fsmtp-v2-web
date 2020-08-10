import Config from '../Config';
import Axios from 'axios';

import { Mailbox } from '../models/Mailbox.model';
import { AccountService } from './Accounts.service';
import { REPL_MODE_SLOPPY } from 'repl';

export class MailboxesService {
  public static port: number = 4002;

  public static gatherMailboxes = (): Promise<Mailbox[]> => {
    return new Promise<Mailbox[]>((resolve, reject) => {
      // Prepares the data for axios, like the headers
      const url: string = Config.buildURL('/mailboxes/get', MailboxesService.port);
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
}
