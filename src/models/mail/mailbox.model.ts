import cassandraDriver from 'cassandra-driver';
import { Cassandra } from '../../helpers/database.helper';

const MailboxFlags = {
  HasSubdirs: 1,
  Unmarked: 2,
  Archive: 4,
  Trash: 8,
  Sent: 16,
  Draft: 32,
  Marked: 64,
  Junk: 128,
  SysFlagReadOnly: 256
};

class Mailbox {
  public e_Bucket: number;
  public e_MessageCount: number;
  public e_Domain: string;
  public e_UUID: cassandraDriver.types.TimeUuid;
  public e_MailboxPath: string;
  public e_MailboxStand: boolean;
  public e_Subscribed: boolean;
  public e_Flags: number;
  
  public constructor(data: {
    e_Bucket: number,
    e_MessageCount: number,
    e_Domain: string,
    e_UUID: cassandraDriver.types.TimeUuid,
    e_MailboxPath: string,
    e_MailboxStand: boolean,
    e_Subscribed: boolean,
    e_Flags: number
  }) {
    this.e_Bucket = data.e_Bucket;
    this.e_MessageCount = data.e_MessageCount;
    this.e_Domain = data.e_Domain;
    this.e_UUID = data.e_UUID;
    this.e_MailboxPath = data.e_MailboxPath;
    this.e_MailboxStand = data.e_MailboxStand;
    this.e_Subscribed = data.e_Subscribed;
    this.e_Flags = data.e_Flags;
  }

  static fromMap = (map: any): Mailbox => {
    return new Mailbox({
      e_Bucket: map['e_bucket'],
      e_Flags: map['e_flags'],
      e_Domain: map['e_domain'],
      e_MessageCount: map['e_message_count'],
      e_Subscribed: map['e_subscribed'],
      e_MailboxPath: map['e_mailbox_path'],
      e_MailboxStand: map['e_mailbox_stand'],
      e_UUID: map['e_uuid']
    });
  };

  public static batchSave = (mailboxes: Mailbox[]): Promise<null> => {
    return new Promise<null>((resolve, reject) => {
      const query: string = `INSERT INTO ${Cassandra.keyspace}.mailboxes (
        e_bucket, e_domain, e_uuid,
        e_mailbox_path, e_mailbox_stand, e_message_count,
        e_flags, e_subscribed
      ) VALUES (
        ?, ?, ?,
        ?, ?, ?,
        ?, ?
      )`;

      // Creates the vector of queries, so we can later execute
      //  them in a batch way
      
      const queries: any[] = [];
      mailboxes.forEach(mailbox => {
        queries.push({
          query, params: [
            mailbox.e_Bucket, mailbox.e_Domain, mailbox.e_UUID,
            mailbox.e_MailboxPath, mailbox.e_MailboxStand, mailbox.e_MessageCount,
            mailbox.e_Flags, mailbox.e_Subscribed
          ]
        });
      });

      // Performs the batch execution, this will be more cheap to do
      //  when we have large sets of data

      Cassandra.client.batch(queries, {
        prepare: true
      }).then(() => resolve()).catch(err => reject(err));
    });
  };

  public static get = (
    e_Bucket: number, e_Domain: string, 
    e_UUID: cassandraDriver.types.TimeUuid, 
    e_MailboxPath: string
  ): Promise<Mailbox> => {
    return new Promise<Mailbox>((resolve, reject) => {
      const query: string = `SELECT e_mailbox_stand, e_message_count, e_flags, e_subscribed
      FROM ${Cassandra.keyspace}.mailboxes 
      WHERE e_bucket=? AND e_domain=? AND e_uuid=? AND e_mailbox_path=? ALLOW FILTERING`;

      Cassandra.client.execute(query, [
        e_Bucket, e_Domain, e_UUID, e_MailboxPath
      ], {
        prepare: true
      }).then(res => {
        if (res.rows.length <= 0) resolve(undefined);
        else {
          let result: Mailbox = Mailbox.fromMap(res.rows[0]);
          result.e_Bucket = e_Bucket;
          result.e_UUID = e_UUID;
          result.e_MailboxPath = e_MailboxPath;
          result.e_Domain = e_Domain;
          resolve(result);
        }
      });
    });
  };

  public save = (): Promise<null> => {
    return new Promise<null>((resolve, reject) => {
      const query: string = `INSERT INTO ${Cassandra.keyspace}.mailboxes (
        e_bucket, e_domain, e_uuid,
        e_mailbox_path, e_mailbox_stand, e_message_count,
        e_flags, e_subscribed
      ) VALUES (
        ?, ?, ?,
        ?, ?, ?,
        ?, ?
      )`;

      Cassandra.client.execute(query, [
        this.e_Bucket, this.e_Domain, this.e_UUID,
        this.e_MailboxPath, this.e_MailboxStand, this.e_MessageCount,
        this.e_Flags, this.e_Subscribed
      ], {
        prepare: true
      }).then(() => resolve()).catch(err => reject(err));
    });
  };

  public static gatherAll = (
    e_Bucket: number, e_Domain: string, 
    e_UUID: cassandraDriver.types.TimeUuid, subscribedOnly: boolean
  ): Promise<Mailbox[]> => {
    return new Promise<Mailbox[]>((resolve, reject) => {
      const query: string = `SELECT e_mailbox_path, e_mailbox_stand, e_message_count, e_flags, e_subscribed
      FROM ${Cassandra.keyspace}.mailboxes 
      WHERE e_bucket=? AND e_domain=? AND e_uuid=? 
      ${subscribedOnly ? 'AND e_subscribed=true' : ''} ALLOW FILTERING`;

      Cassandra.client.execute(query, [
        e_Bucket, e_Domain, e_UUID
      ], {
        prepare: true
      }).then(data => {
        let result: Mailbox[] = [];

        data.rows.forEach(row => {
          let mailbox: Mailbox = Mailbox.fromMap(row);
          mailbox.e_Bucket = e_Bucket;
          mailbox.e_Domain = e_Domain;
          mailbox.e_UUID = e_UUID;
          result.push(mailbox);
        });

        resolve(result);
      }).catch(err => reject(err));
    });
  };
}

export { Mailbox, MailboxFlags };
