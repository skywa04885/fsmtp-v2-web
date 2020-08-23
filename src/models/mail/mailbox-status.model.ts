import cassandraDriver from 'cassandra-driver';
import { Cassandra, Redis } from '../../helpers/database.helper';
import { EmailShortcut, EmailFlags } from './email-shortcut.model';
import { Mailbox } from './mailbox.model';
import { reject } from 'async';
import Mail from 'nodemailer/lib/mailer';
import { NotImplementedError } from 'restify-errors';

export class MailboxStatus {
  public s_Bucket?: number;
  public s_Domain?: string;
  public s_UUID?: cassandraDriver.types.TimeUuid;
  public s_Unseen?: number;
  public s_NextUID?: number;
  public s_Recent?: number;
  public s_Total?: number;
  public s_Flags?: number;
  public s_PermaFlags?: number;
  public s_MailboxPath?: string;
  
  public constructor(data?: {
    s_Bucket?: number,
    s_Domain?: string,
    s_UUID?: cassandraDriver.types.TimeUuid,
    s_Unseen?: number,
    s_NextUID?: number,
    s_Recent?: number,
    s_Total?: number,
    s_Flags?: number,
    s_PermaFlags?: number,
    s_MailboxPath?: string
  }) {
    if (!data) return;
    this.s_Bucket = data.s_Bucket;
    this.s_Domain = data.s_Domain;
    this.s_UUID = data.s_UUID;
    this.s_Unseen = data.s_Unseen;
    this.s_NextUID = data.s_NextUID;
    this.s_Recent = data.s_Recent;
    this.s_Total = data.s_Total;
    this.s_Flags = data.s_Flags;
    this.s_PermaFlags = data.s_PermaFlags;
    this.s_MailboxPath = data.s_MailboxPath;
  }

  public static fromRedisMap = (map: any): MailboxStatus => {
    return new MailboxStatus({
      s_Unseen: parseInt(map['v2']),
      s_NextUID: parseInt(map['v5']),
      s_Recent: parseInt(map['v6']),
      s_Total: parseInt(map['v3']),
      s_Flags: parseInt(map['v1']),
      s_PermaFlags: parseInt(map['v4'])
    });
  };

  public static getPrefix = (
    s_Bucket: number, s_Domain: string, 
    s_UUID: cassandraDriver.types.TimeUuid, s_MailboxPath: string
  ): string => {
    return `${s_Bucket}:${s_Domain}:${s_UUID.getDatePrecision().date.getTime()}:${s_MailboxPath}`;
  }

  public static restoreFromCassandra = (
    s_Bucket: number, s_Domain: string, 
    s_UUID: cassandraDriver.types.TimeUuid, s_MailboxPath: string
  ): Promise<MailboxStatus> => {
    return new Promise<MailboxStatus>((resolve, reject) => {
      let result: MailboxStatus = new MailboxStatus({
        s_Total: 0,
        s_Unseen: 0,
        s_Recent: 0,
        s_Bucket: s_Bucket,
        s_Domain: s_Domain,
        s_UUID: s_UUID,
        s_MailboxPath: s_MailboxPath
      });
      
      // Gets the normal stuff from the mailbox, this is required for later storage
      //  we will get this with a basic mailbox query

      Mailbox.get(s_Bucket, s_Domain, s_UUID, s_MailboxPath).then(mailbox => {
        if (!mailbox)
          return reject(new Error(`Could not find mailbox ${s_Bucket}:${s_Domain}:${s_UUID}:${s_MailboxPath}`));
        
        result.s_PermaFlags = mailbox.e_Flags;
        result.s_Flags = mailbox.e_Flags;

        // Loops over all the messages in the mailbox and builds the status
        //  the status will contain the unseen, total, largest UUID etcetera
      
        const query: string = `SELECT e_flags, e_uid FROM ${Cassandra.keyspace}.email_shortcuts 
        WHERE e_domain=? AND e_owners_uuid=? AND e_mailbox=?`;

        try {
          let largestUid: number = 0;
          Cassandra.client.eachRow(query, [
            s_Domain, s_UUID, s_MailboxPath
          ], {
            autoPage: true,
            prepare: true
          }, (n, row) => {
            let shortcut: EmailShortcut = EmailShortcut.fromMap(row); 
            
            if ((shortcut.e_Flags | EmailFlags.Seen) !== EmailFlags.Seen)
              ++(<number>result.s_Unseen);
    
            if (shortcut.e_UID > largestUid) largestUid = shortcut.e_UID;
            ++(<number>result.s_Total);
          }, () => {
            result.s_NextUID = ++largestUid;
            resolve(result);
          });
        } catch (err) {
          reject (err);
        }
      })
    });
  };

  public static removeEmails = (
    s_Bucket: number, s_Domain: string, 
    s_UUID: cassandraDriver.types.TimeUuid, s_MailboxPath: string,
    num: number
  ): Promise<MailboxStatus> => {
    return new Promise<MailboxStatus>((resolve, reject) => {
      MailboxStatus.get(s_Bucket, s_Domain, s_UUID, s_MailboxPath).then(status => {
        (<number>status.s_Total) -= num;

        status.saveTotalAndUID(s_MailboxPath).then(() => resolve(status)).catch(err => reject(err));
      }).catch(err => reject(err));
    });
  };

  public static addEmails = (
    s_Bucket: number, s_Domain: string, 
    s_UUID: cassandraDriver.types.TimeUuid, s_MailboxPath: string,
    num: number
  ): Promise<MailboxStatus> => {
    return new Promise<MailboxStatus>((resolve, reject) => {
      MailboxStatus.get(s_Bucket, s_Domain, s_UUID, s_MailboxPath).then(status => {
        (<number>status.s_Total) += num;
        (<number>status.s_NextUID) += num;

        status.saveTotalAndUID(s_MailboxPath).then(() => resolve(status)).catch(err => reject(err));
      }).catch(err => reject(err));
    });
  };

  public save = (mailboxPath: string): Promise<null> => {
    return new Promise<null>((resolve, reject) => {
      if (
        this.s_Bucket === undefined || this.s_Flags === undefined || this.s_Unseen === undefined || 
        this.s_Total === undefined || this.s_PermaFlags === undefined || this.s_NextUID === undefined || 
        this.s_Recent === undefined || this.s_Domain === undefined || this.s_UUID === undefined
      ) return reject(new Error('Please supply all required values'));  
    
      Redis.client.hmset(
        MailboxStatus.getPrefix(this.s_Bucket, this.s_Domain, this.s_UUID, mailboxPath),
        'v1', this.s_Flags,
        'v2', this.s_Unseen,
        'v3', this.s_Total,
        'v4', this.s_PermaFlags,
        'v5', this.s_NextUID,
        'v6', this.s_Recent, (err) => {
          if (err) reject(err);
          else resolve();
        });
    });
  };

  public saveTotalAndUID = (s_MailboxPath: string): Promise<null> => {
    return new Promise<null>((resolve, reject) => {
      if (this.s_Bucket === undefined || this.s_Domain  === undefined || 
        this.s_UUID === undefined || this.s_Total === undefined || 
        this.s_NextUID === undefined
      ) return reject(new Error('Please supply all params'));

      Redis.client.hmset(
        MailboxStatus.getPrefix(this.s_Bucket, this.s_Domain, this.s_UUID, s_MailboxPath),
          'v3', this.s_Total,
          'v5', this.s_NextUID, (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  };

  public resetRecent = (s_MailboxPath: string): Promise<null> => {
    return new Promise<null>((resolve, reject) => {
      if (this.s_Bucket === undefined || this.s_Domain === undefined || this.s_UUID === undefined)
        return reject(new Error('Please supply all params'));

      Redis.client.hmset(
        MailboxStatus.getPrefix(this.s_Bucket, this.s_Domain, this.s_UUID, s_MailboxPath), 
        'v6', 0, (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  };

  public static get = (
    s_Bucket: number, s_Domain: string, 
    s_UUID: cassandraDriver.types.TimeUuid, s_MailboxPath: string
  ): Promise<MailboxStatus> => {
    return new Promise<MailboxStatus>((resolve, reject) => {
      // Attempts redis fetch, if this turns out to be a failure, we build a new redis
      //  record using the existing cassandra data ( expensive )
      MailboxStatus.getFromRedis(s_Bucket, s_Domain, s_UUID, s_MailboxPath).then(redisMailbox => {
        if (!redisMailbox) {
          MailboxStatus.restoreFromCassandra(s_Bucket, s_Domain, s_UUID, s_MailboxPath).then(mailbox => {
            mailbox.save(s_MailboxPath).then(() => resolve(mailbox)).catch(err => reject(err));
          }).catch(err => reject(err));
        } else {
          redisMailbox.resetRecent(s_MailboxPath);
          resolve(redisMailbox);
        }
      }).catch(err => reject(err));
    });
  };

  public static getFromRedis = (
    s_Bucket: number, s_Domain: string, 
    s_UUID: cassandraDriver.types.TimeUuid, s_MailboxPath: string
  ): Promise<MailboxStatus> => {
    return new Promise<MailboxStatus>((resolve, reject) => {
      Redis.client.hgetall(MailboxStatus.getPrefix(
        s_Bucket, s_Domain, s_UUID, s_MailboxPath
      ), (err, res) => {
        if (err) reject(err);
        else if (!res) return resolve(undefined);
        let result: MailboxStatus = MailboxStatus.fromRedisMap(res);
        result.s_Bucket = s_Bucket;
        result.s_Domain = s_Domain;
        result.s_UUID = s_UUID;
        result.s_MailboxPath = s_MailboxPath;
        resolve(result);
      });
    });
  };
}