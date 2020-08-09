import restify from 'restify';
import errors from 'restify-errors';
import { validateRequest } from '../../../../helpers/validation.helper';
import { Account, AccountShortcut, AccountType } from '../../../../models/accounts/account.model';
import { readConfig } from '../../../../helpers/config.helper';
import { passwordHash, passwordVerify } from '../../../../helpers/passwords.helper';;
import cassandraDriver from 'cassandra-driver';
import { Logger, LoggerLevel } from '../../../../logger';
import async, { reject } from 'async';
import { Mailbox, MailboxFlags } from '../../../../models/mailbox/mailbox.model';
import { AES256 } from '../../../../helpers/aes.helper';
import { Bearer } from '../../../../helpers/bearer.helper';

const config: any = readConfig();
const usernameRegex = '^[A-Za-z0-9._]{1,80}$';

export namespace Controllers
{
  const POST_AuthRegister_InitializeMailboxes = (bucket: number, domain: string, uuid: cassandraDriver.types.TimeUuid): Promise<null> => {
    return new Promise<null>((resolve, reject) => {
      const defaultConstructorOptions: any = {
        e_Bucket: bucket,
        e_Domain: domain,
        e_UUID: uuid
      };

      // Prepars the list of mailboxes so we can later perform
      //  the batch insertion, which basically makes it way faster
      const mailboxes: Mailbox[] = [
        new Mailbox(Object.assign(defaultConstructorOptions, {
          e_MessageCount: 0,
          e_MailboxPath: 'INBOX',
          e_MailboxStand: true,
          e_Subscribed: true,
          e_Flags: 0
        })),
        new Mailbox(Object.assign(defaultConstructorOptions, {
          e_MessageCount: 0,
          e_MailboxPath: 'INBOX.Sent',
          e_MailboxStand: true,
          e_Subscribed: true,
          e_Flags: MailboxFlags.Unmarked | MailboxFlags.Sent
        })),
        new Mailbox(Object.assign(defaultConstructorOptions, {
          e_MessageCount: 0,
          e_MailboxPath: 'INBOX.Spam',
          e_MailboxStand: true,
          e_Subscribed: true,
          e_Flags: MailboxFlags.Marked | MailboxFlags.Junk
        })),
        new Mailbox(Object.assign(defaultConstructorOptions, {
          e_MessageCount: 0,
          e_MailboxPath: 'INBOX.Archive',
          e_MailboxStand: true,
          e_Subscribed: true,
          e_Flags: MailboxFlags.Unmarked | MailboxFlags.Archive
        })),
        new Mailbox(Object.assign(defaultConstructorOptions, {
          e_MessageCount: 0,
          e_MailboxPath: 'INBOX.Drafts',
          e_MailboxStand: true,
          e_Subscribed: true,
          e_Flags: MailboxFlags.Unmarked | MailboxFlags.Draft
        })),
        new Mailbox(Object.assign(defaultConstructorOptions, {
          e_MessageCount: 0,
          e_MailboxPath: 'INBOX.Trash',
          e_MailboxStand: true,
          e_Subscribed: true,
          e_Flags: MailboxFlags.Marked | MailboxFlags.Trash
        }))
      ];

      // Performs the batch insertion
      Mailbox.batchSave(mailboxes)
        .then(() => resolve())
        .catch(err => reject(err));
    });
  };

  /**
   * Registers an new account
   * 
   * @param req
   * @param res
   * @param next
   */
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
          pattern: usernameRegex,
          required: true,
          maxLength: 196
        },
        password: {
          type: 'string',
          required: true,
          minLength: 12,
          maxLength: 196
        },
        full_name: {
          type: 'string',
          required: true,
          minLength: 4,
          maxLength: 196,
        },
        birth_date: {
          type: 'string',
          required: true,
          maxLength: 196
        },
        recovery_email: {
          type: 'string',
          required: false,
          format: 'email',
          maxLength: 196
        }
      }
    })) return;
    logger.print('Request is valid, proceeding with checking if account already exists ...');

    // Checks if the user is already in the database, if so send error
    //  else proceed with operation
    AccountShortcut.find(config.global.domain, req.body.username).then(accountShortcut => {
      // Checks if the account exists, else send error message
      if (accountShortcut)
        return res.json({
          status: false,
          message: `Account ${req.body.username}@${req.body.domain} already exists !`
        });

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

          // Encrypts the private key with the users password, this will make sure
          //  that even i cannot read their data ( the whole point of fannst mail )
          AES256.encrypt(<string>account.a_RSAPrivate, req.body.password)
            .then(encryptedPrivateKey => {
              account.a_RSAPrivate = encryptedPrivateKey;

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
                  logger.print('Stored account in database, proceeding with mailbox creation ...');

                  POST_AuthRegister_InitializeMailboxes(account.a_Bucket, account.a_Domain, account.a_UUID)
                    .then(() => {
                      logger.print('Account ready for usage, signing off..');
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
                    // -> End POST_AuthRegister_InitializeMailboxes()
                }).catch(err => next(new errors.InternalServerError({}, err.toString())));
                // -> End account.save()
              }).catch(err => next(new errors.InternalServerError({}, err.toString())));
              // -> End accountShortcut.save()
            }).catch(err => next(new errors.InternalServerError({}, err.toString())));
            // -> End AES256.encrypt()
          }).catch(err => next(new errors.InternalServerError({}, err.toString())));
        // -> End passwordHash()
      }).catch(err => next(new errors.InternalServerError({}, err.toString())));
      // -> End AccountShortcut.find()
    }).catch(err => next(new errors.InternalServerError({}, err.toString())));
  };

  /**
   * Logs in to an existing account
   * 
   * @param req
   * @param res
   * @param next
   */
  export const POST_AuthLogin = (
    req: restify.Request, res: restify.Response, 
    next: restify.Next
  ) => {
    const logger: Logger = new Logger(LoggerLevel.Debug, `POST_AuthLogin:${req.connection.remoteAddress}`);

    // Validates the request body, so we are sure that the needed parameters are there
    //  the username and password in this case
    if (!validateRequest(req, res, next, {
      properties: {
        username: {
          required: true,
          type: 'string',
          pattern: usernameRegex,
          maxLength: 196
        },
        password: {
          required: true,
          type: 'string',
          maxLength: 196
        },
        domain: {
          required: false,
          type: 'string',
          maxLength: 196
        }
      }
    })) return;

    // Sets the default domain if the domain is empty, then we check if the account
    //  is in the database, if not we send an error
    if (!req.body.domain) req.body.domain = config.global.domain;
    logger.print(`Login attempt for ${req.body.username}@${req.body.account}, with passphrase: ${req.body.password}`);
    AccountShortcut.find(req.body.domain, req.body.username).then(accountShortcut => {
      // Checks if the account exists, if not send error
      if (!accountShortcut)
        return res.json({
          status: false,
          message: `Account ${req.body.username}@${req.body.domain} does not exist !`
        });

      // Gets the password from the account, so we can compare it against
      //  the supplied one
      Account.getPassword(accountShortcut.a_Bucket, accountShortcut.a_Domain, accountShortcut.a_UUID)
      .then(password => {
        passwordVerify(req.body.password, password).then(valid => {
          if (!valid)
            return next(new errors.InvalidCredentialsError('Supplied password is not valid !'));
          
          // Generates the bearer, and sends the bearer to the client
          logger.print('Client is authenticated, generating bearer ...');
          const bearer = Bearer.generate(
            accountShortcut.a_UUID, accountShortcut.a_Domain, 
            accountShortcut.a_Bucket, req.body.password, accountShortcut.a_Username
          );
          res.json({
            status: true,
            bearer
          });
          // -> End passwordVerify()
        }).catch(err => next(new errors.InternalServerError({}, err.toString())));
        // -> End Account.getPassword()
      }).catch(err => next(new errors.InternalServerError({}, err.toString())));
      // -> End AccountShortcut.find()
    }).catch(err => next(new errors.InternalServerError({}, err.toString())));
  }
};