import Config from '../Config';
import Axios from 'axios';
import { resolve } from 'dns';

import { AccountService } from './Accounts.service'

export class MailerService {
  public static port: number = 4003;

  public static sendMail = (subject: string, to: string, text: string, html?: string): Promise<null> => {
    return new Promise<null>((resolve, reject) => {
      setTimeout(() => {
        const url = Config.buildURL('/send', MailerService.port);
        const options: any = {
          headers: Object.assign(Config.defaultHeaders, {
            'Authorization': AccountService.buildBearer()
          })
        };
        const fields = {
          subject, to, text, html
        };
  
        // Axios.post(url, fields, options).then(response => {
        //   if (response.status !== 200)
        //     return reject(`${response.status}: ${response.statusText}`);
          
        //   resolve();
        // });

        resolve();
      }, 200);
    });
  };
}