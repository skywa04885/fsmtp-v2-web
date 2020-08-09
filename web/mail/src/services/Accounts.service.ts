import axios from 'axios';
import cookie from 'react-cookies';
import { Account } from '../models/Account.model';
import Config from '../Config';

export class AccountService {
  public static bearer: string;
  public static account: Account;
  public static port: number = 4001;

  /**
   * Authenticates the current client using the bearer
   */
  public static authenticate = (): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
      // Loads the bearer cookie, and returns false if
      //  we are not logged in (bearer not found)
      AccountService.bearer = cookie.load('sess-bearer');
      if (!AccountService.bearer) resolve(false);

      // Receives the account, and stores it in the current
      //  authentication service
      AccountService.getAccount().then(account => {
        console.log(`Welcome, ${account.a_FullName} !`);
        AccountService.account = account;
        resolve(true);
      }).catch(err => reject(err));
    });
  };

  /**
   * Gets an account from the server
   */
  public static getAccount = (): Promise<Account> => {
    return new Promise<Account>((resolve, reject) => {
      // Prepares the get request
      const url: string = Config.buildURL('/accounts/get', AccountService.port);
      const options: any = {
        headers: Object.assign(Config.defaultHeaders, {
          'Authorization': `Bearer ${AccountService.bearer}`
        })
      };

      // Sends the axios request, after that we check if the request response
      //  code returned anything else but 200, if the request succeeded we parse
      //  it from the map to an valid account
      axios.get(url, options).then(response => {
        if (response.status !== 200)
          reject(new Error(`${response.status}: ${response.statusText}`));
        else resolve(Account.fromMap(response.data));
      }).catch(err => reject(err));
    });
  };

  public static logout = (): void => {
    cookie.remove('sess-bearer');
    window.location.href = '/auth/login';
  };
}