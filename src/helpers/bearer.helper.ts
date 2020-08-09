import cassandraDriver from 'cassandra-driver';
import jwt, { decode } from 'jsonwebtoken';
import restify from 'restify';
import errors from 'restify-errors';
import { readConfig } from './config.helper';
import { Account, AccountShortcut } from '../models/accounts/account.model';

const env: any = readConfig(true);

export namespace Bearer
{
  export interface AuthObject {
    uuid: cassandraDriver.types.TimeUuid, 
    domain: string, bucket: number, password: string,
    username: string
  };

  /**
   * Generates an json web token
   * 
   * @param uuid The users UUID
   * @param domain The users domain
   * @param bucket The users Bucket
   * @param password The users password ( Used for decrypting RSA Key )
   * @param username The users username
   */
  export const generate = (
    uuid: cassandraDriver.types.TimeUuid, 
    domain: string, bucket: number, password: string,
    username: string
  ): string => {
    return jwt.sign({
      uuid: uuid.toString(), domain, bucket, password, username
    }, env.jwtPassphrase);
  };

  /**
   * Reads an bearer and returns the AuthObject
   * 
   * @param bearer The bearer
   */
  export const read = (bearer: string): AuthObject => {
    const decoded = jwt.decode(bearer, env.jwtPassphrase);
    if (!decoded || !decoded.uuid || !decoded.password || !decoded.domain || !decoded.bucket || !decoded.username)
      throw new Error('Invalid bearer');

    return {
      uuid: cassandraDriver.types.TimeUuid.fromString(decoded.uuid),
      bucket: parseInt(decoded.bucket),
      password: decoded.password,
      domain: decoded.domain,
      username: decoded.username
    };
  };

  /**
   * Authenticates with an bearer
   * 
   * @param bearer The bearer
   */
  export const auth = (bearer: string): Promise<AuthObject> => {
    return new Promise<AuthObject>((resolve, reject) => {
      try {        
        // Gets the result object from the bearer, after that
        //  we try to find the user and then we know if the bearer is valid
        const result = read(bearer);
        AccountShortcut.find(result.domain, result.username).then(user => {
          if (!user) reject(new Error('User does not exist anymore'));
          else resolve(result);
        });
      } catch (err) {
        reject (err);
      };
    });
  };

  /**
   * Authenticates an request
   * 
   * @param req 
   * @param res 
   * @param next 
   */
  export const authRequest = (
    req: restify.Request, 
    res: restify.Response, 
    next: restify.Next
  ): Promise<AuthObject> => {
    return new Promise<AuthObject>((resolve, reject) => {
      // Validates the request headers and checks if the bearer is there
      //  else we will send error
      if (!req.headers.authorization)
      {
        next(new errors.NotAuthorizedError());
        return reject(new Error('Bearer not found'));
      }

      // Authenticates and if something goes wrong, we just send the 
      //  invalid header error, because the bearer is invalid
      const bearerStartIndex = req.headers.authorization.indexOf(' ') + 1;
      Bearer.auth(req.headers.authorization.substr(bearerStartIndex)).then(authObj => {
        resolve(authObj);
      }).catch(err => {
        next(new errors.InvalidHeaderError());
        reject(err);
      })
    });
  }
}
