import restify from 'restify';
import errors from 'restify-errors';
import { validateRequest } from '../../../../helpers/validation.helper';
import { Account, AccountShortcut, AccountType } from '../../../../models/accounts/account.model';
import { readConfig } from '../../../../helpers/config.helper';
import { passwordHash, passwordVerify } from '../../../../helpers/passwords.helper';;
import cassandraDriver from 'cassandra-driver';
import { Logger, LoggerLevel } from '../../../../logger';
import async from 'async';

const config: any = readConfig();

export namespace Controllers
{
  export const POST_AuthRegister = (
    req: restify.Request, res: restify.Response, 
    next: restify.Next
  ) => {
    const logger: Logger = new Logger(LoggerLevel.Debug, `POST_AuthRegister:${req.connection.remoteAddress}`);

    // Validates the request body, and returns if not valid
    //  since the error message is already handled in the mean time
    logger.print('Validating request ...');
    if (!validateRequest(req, res, next, {
      properties: {
        username: {
          type: 'string',
          pattern: '^[A-Za-z0-9._]{1,80}$',
          required: true
        },
        password: {
          type: 'string',
          required: true,
          minLength: 12
        },
        full_name: {
          type: 'string',
          required: true,
          minLength: 4,
          maxLength: 120
        },
        birth_date: {
          type: 'string',
          required: true
        },
        recovery_email: {
          type: 'string',
          required: false,
          format: 'email'
        }
      }
    })) return;
    logger.print('Request is valid, proceeding with checking if account already exists ...');

    // Checks if the user is already in the database, if so send error
    //  else proceed with operation
    AccountShortcut.find(config.global.domain, req.body.username).then(accountShortcut => {
      // Checks if the account exists, else send error message
      if (accountShortcut)
        return next(new errors.InvalidArgumentError({}, 
          `Username already in use: ${req.body.username}`));
      
      // Since it does not exist, create the new one and hash the 
      //  password, so it can be later used
      logger.print(`Account not existing, generating password hash for: ${req.body.password}`);
      passwordHash(req.body.password).then(hash => {
        // Creates the account, and assigns a new RSA keypair used for
        //  the later encryption of emails
        const account = new Account({
          a_Username: req.body.username,
          a_PictureURI: 'def',
          a_Password: hash,
          a_Domain: config.global.domain,
          a_Bucket: Account.getBucket(),
          a_FullName: req.body.full_name,
          a_BirthDate: new Date(req.body.birth_date),
          a_CreationDate: new Date(),
          a_Gas: 5.0,
          a_Type: AccountType.Default,
          a_UUID: cassandraDriver.types.TimeUuid.now(),
          a_Flags: 0x0,
          a_StorageUsedInBytes: 0,
          a_StorageMaxInBytes: 5 * 1024 * 1024 * 1024 // 5 GB
        });
        account.generateKeypair().then(() => {
          logger.print('RSA Keypair generated successfully, storing user in database ...');

          // Creates the account shortcut, and then stores both inside of the database
          //  after that we proceed with preparing the inbox
          const accountShortcut: AccountShortcut = new AccountShortcut({
            a_Domain: account.a_Domain,
            a_Bucket: account.a_Bucket,
            a_UUID: account.a_UUID,
            a_Username: account.a_Username
          });

          accountShortcut.save().then(() => {
            account.save().then(() => {
              logger.print('Stored accounts in database, account created with success ...');
              res.json({
                status: true,
                data: {
                  domain: accountShortcut.a_Domain,
                  username: accountShortcut.a_Username,
                  uuid: accountShortcut.a_UUID,
                  bucket: accountShortcut.a_Bucket
                }
              });
            }).catch(err => next(new errors.InternalServerError({}, err.toString())));
            // -> End account.save()
          }).catch(err => next(new errors.InternalServerError({}, err.toString())));
          // -> End accountShortcut.save()
        }).catch(err => next(new errors.InternalServerError({}, err.toString())));
        // -> End passwordHash()
      }).catch(err => next(new errors.InternalServerError({}, err.toString())));
      // -> End AccountShortcut.find()
    }).catch(err => next(new errors.InternalServerError({}, err.toString())));
  };
};