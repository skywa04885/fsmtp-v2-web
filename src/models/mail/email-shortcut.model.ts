import cassandraDriver from 'cassandra-driver';
import { Cassandra } from '../../helpers/database.helper';
import { Mailbox, MailboxFlags } from './mailbox.model';
import { MailboxStatus } from './mailbox-status.model';
import { reject } from 'async';

export const EmailFlags = {
  Seen: 1,
  Answered: 2,
  Flagged: 4,
  Deleted: 8,
  Draft: 16,
  Recent: 32
};

export class EmailShortcut {
  public e_Domain: string;
  public e_Subject: string;
  public e_Preview: string;
  public e_OwnersUUID: cassandraDriver.types.TimeUuid;
  public e_EmailUUID: cassandraDriver.types.TimeUuid;
  public e_UID: number;
  public e_Flags: number;
  public e_Bucket: number;
  public e_Mailbox: string;
  public e_SizeOctets: number;
  public e_From: string;

  public constructor(data: {
    e_Domain: string,
    e_Subject: string,
    e_Preview: string,
    e_OwnersUUID: cassandraDriver.types.TimeUuid,
    e_EmailUUID: cassandraDriver.types.TimeUuid,
    e_UID: number,
    e_Flags: number,
    e_Bucket: number,
    e_Mailbox: string,
    e_SizeOctets: number,
    e_From: string
  }) {
    this.e_Domain = data.e_Domain;
    this.e_Subject = data.e_Subject;
    this.e_Preview = data.e_Preview;
    this.e_OwnersUUID = data.e_OwnersUUID;
    this.e_EmailUUID = data.e_EmailUUID;
    this.e_UID = data.e_UID;
    this.e_Flags = data.e_Flags;
    this.e_Bucket = data.e_Bucket;
    this.e_Mailbox = data.e_Mailbox;
    this.e_SizeOctets = data.e_SizeOctets;
    this.e_From = data.e_From;
  }

  static insertQuery: string = `INSERT INTO ${Cassandra.keyspace}.email_shortcuts (
    e_domain, e_subject, e_preview,
    e_owners_uuid, e_email_uuid, e_uid,
    e_flags, e_bucket, e_mailbox,
    e_size_octets, e_from
  ) VALUES (
    ?, ?, ?,
    ?, ?, ?,
    ?, ?, ?,
    ?, ?
  )`;

  public static fromMap = (map: any) => {
    return new EmailShortcut({
      e_Domain: map['e_domain'],
      e_Subject: map['e_subject'],
      e_Preview: map['e_preview'],
      e_OwnersUUID: map['e_owners_uuid'],
      e_EmailUUID: map['e_email_uuid'],
      e_UID: map['e_uid'],
      e_Flags: parseInt(map['e_flags']),
      e_Bucket: parseInt(map['e_bucket']),
      e_Mailbox: map['e_mailbox'],
      e_SizeOctets: parseInt(map['e_size_octets']),
      e_From: map['e_from']
    });
  };

  public save = (): Promise<null> => {
    return new Promise<null>((resolve, reject) => {
      Cassandra.client.execute(EmailShortcut.insertQuery, [
        this.e_Domain, this.e_Subject, this.e_Preview,
        this.e_OwnersUUID, this.e_EmailUUID, this.e_UID,
        this.e_Flags, this.e_Bucket, this.e_Mailbox,
        this.e_SizeOctets, this.e_From
      ], { prepare: true }).then(() => resolve()).catch(err => reject(err));
    });
  };

  public static setFlag = (
    e_Domain: string, e_OwnersUUID: cassandraDriver.types.TimeUuid,
    e_Mailbox: string, e_EmailUUID: cassandraDriver.types.TimeUuid,
    e_Flag: number
  ): Promise<null> => {
    return new Promise<null>((resolve, reject) => {

      // Gets the previous flags so we can then OR the new ones to
      //  it, because we want to keep the previous ones too

      let query: string = `SELECT e_flags FROM ${Cassandra.keyspace}.email_shortcuts
      WHERE e_domain=? AND e_owners_uuid=? AND e_mailbox=? AND e_email_uuid=?`;

      Cassandra.client.execute(query, [
        e_Domain, e_OwnersUUID, e_Mailbox, e_EmailUUID
      ], {
        prepare: true
      }).then(res => {
        if (res.rows.length <= 0)
          return reject(new Error('Could not find message'));

        // OR's the flags, and updates the record in apache cassandra, i know
        //  this is not very efficient, but i do not care.

        let flags: number = res.rows[0]['e_flags'];
        flags |= e_Flag;

        query = `UPDATE ${Cassandra.keyspace}.email_shortcuts
        SET e_flags=?
        WHERE e_domain=? AND e_owners_uuid=? AND e_mailbox=? AND e_email_uuid=?`;

        Cassandra.client.execute(query, [
          flags, e_Domain, e_OwnersUUID, e_Mailbox, e_EmailUUID
        ], {
          prepare: true
        }).then(() => resolve()).catch(err => reject(err));
      }).catch(err => reject(err));
    });
  };

  public static clearFlag = (
    e_Domain: string, e_OwnersUUID: cassandraDriver.types.TimeUuid,
    e_Mailbox: string, e_EmailUUID: cassandraDriver.types.TimeUuid,
    e_Flag: number
  ): Promise<null> => {
    return new Promise<null>((resolve, reject) => {

      // Gets the previous flags so we can then OR the new ones to
      //  it, because we want to keep the previous ones too

      let query: string = `SELECT e_flags FROM ${Cassandra.keyspace}.email_shortcuts
      WHERE e_domain=? AND e_owners_uuid=? AND e_mailbox=? AND e_email_uuid=?`;

      Cassandra.client.execute(query, [
        e_Domain, e_OwnersUUID, e_Mailbox, e_EmailUUID
      ], {
        prepare: true
      }).then(res => {
        if (res.rows.length <= 0)
          return reject(new Error('Could not find message'));

        // OR's the flags, and updates the record in apache cassandra, i know
        //  this is not very efficient, but i do not care.

        let flags: number = res.rows[0]['e_flags'];
        flags &= ~e_Flag;

        query = `UPDATE ${Cassandra.keyspace}.email_shortcuts
        SET e_flags=?
        WHERE e_domain=? AND e_owners_uuid=? AND e_mailbox=? AND e_email_uuid=?`;

        Cassandra.client.execute(query, [
          flags, e_Domain, e_OwnersUUID, e_Mailbox, e_EmailUUID
        ], {
          prepare: true
        }).then(() => resolve()).catch(err => reject(err));
      }).catch(err => reject(err));
    });
  };

  public static get = (
    e_Domain: string, e_OwnersUUID: cassandraDriver.types.TimeUuid,
		e_Mailbox: string, e_EmailUUID: cassandraDriver.types.TimeUuid
  ): Promise<EmailShortcut> => {
    return new Promise<EmailShortcut>((resolve, reject) => {
      const query: string = `SELECT e_preview, e_uid, e_flags, e_bucket, e_size_octets, e_from, e_subject
      FROM ${Cassandra.keyspace}.email_shortcuts
      WHERE e_domain=? AND e_owners_uuid=? AND e_mailbox=? AND e_email_uuid=?`;
      
      Cassandra.client.execute(query, [
        e_Domain, e_OwnersUUID, e_Mailbox, e_EmailUUID
      ], { prepare: true }).then(res => {
        if (res.rows.length <= 0)
          return reject(new Error('Could not find record'));

        let shortcut: EmailShortcut = EmailShortcut.fromMap(res.rows[0]);
        shortcut.e_Domain = e_Domain;
        shortcut.e_OwnersUUID = e_OwnersUUID;
        shortcut.e_Mailbox = e_Mailbox;
        shortcut.e_EmailUUID = e_EmailUUID;

        resolve(shortcut);
      }).catch(err => reject(err));
    });
  }

  public static delete = (
    e_Domain: string, e_OwnersUUID: cassandraDriver.types.TimeUuid,
		e_Mailbox: string, e_EmailUUID: cassandraDriver.types.TimeUuid
  ): Promise<null> => {
    return new Promise<null>((resolve, reject) => {
      const query: string = `DELETE FROM ${Cassandra.keyspace}.email_shortcuts
      WHERE e_domain=? AND e_owners_uuid=? AND e_mailbox=? AND e_email_uuid=?`;

      Cassandra.client.execute(query, [
        e_Domain, e_OwnersUUID, e_Mailbox, e_EmailUUID
      ], { prepare: true }).then(() => resolve()).catch(err => reject(err));
    });
  };

	public static move = (
		domain: string, ownersUUID: cassandraDriver.types.TimeUuid,
		mailbox: string, emailUUID: cassandraDriver.types.TimeUuid,
		targetMailbox: string, e_OwnersBucket: number
	): Promise<null> => {
		return new Promise<null>((resolve, reject) => {
      EmailShortcut.get(domain, ownersUUID, mailbox, emailUUID).then(shortcut => {
        EmailShortcut.remove(domain, ownersUUID, mailbox, emailUUID).then(() => {
          // Updates the stats, and gets the new uid for the email
          //  this is important since we do not want to have any dupe UID
          //  in the archive
          MailboxStatus.removeOneEmail(e_OwnersBucket, domain, ownersUUID, mailbox).then(() => {
            MailboxStatus.addOneEmail(e_OwnersBucket, domain, ownersUUID, targetMailbox).then(status => {
              shortcut.e_Mailbox = targetMailbox;
              shortcut.e_UID = <number>status.s_NextUID;

              // Saves the new shortcut copy in cassandra
              shortcut.save().then(() => resolve()).catch(err => reject(err));
            }).catch(err => reject(err));
            // End -> MailboxStatus.addOneEmail()
          }).catch(err => reject(err));
          // End -> MailboxStatus.removeOneEmail()
        }).catch(err => reject(err));
        // End -> EmailShortcut.remove()
      }).catch(err => reject(err));
      // End -> EmailShortcut.get()
		});
  };
  
  public static getFlags = (
    domain: string, ownersUUID: cassandraDriver.types.TimeUuid,
		mailbox: string, emailUUID: cassandraDriver.types.TimeUuid
  ): Promise<number> => {
    return new Promise<number>((resolve, reject) => {
      const query: string = `SELECT e_flags FROM ${Cassandra.keyspace}.email_shortcuts
      WHERE e_domain=? AND e_owners_uuid=? AND e_mailbox=? AND e_email_uuid=?`;

      Cassandra.client.execute(query, [
        domain, ownersUUID, mailbox, emailUUID
      ], {
        prepare: true
      }).then(result => {
        if (result.rows.length <= 0) return resolve(undefined);
        else return resolve(result.rows[0]['e_flags']);
      }).catch(err => reject(err));
    });
  };

  public static bulkMove = (
		domain: string, ownersUUID: cassandraDriver.types.TimeUuid,
		mailbox: string, emailUUIDs: cassandraDriver.types.TimeUuid[],
		targetMailbox: string, e_OwnersBucket: number
  ): Promise<null> => {
    return new Promise<null>((resolve, reject) => {
      if (targetMailbox === 'INBOX.Trash' || mailbox === 'INBOX.Trash') {
        let tasks: any[] = [];

        emailUUIDs.forEach(uuid => {
          tasks.push(EmailShortcut.getFlags(domain, ownersUUID, mailbox, uuid));
        });

        let numberIndex: number = 0;
        Promise.all(tasks).then((results: number[]) => {
          const batchStatements: {
            query: string,
            params: any
          }[] = results.map(result => {
            return {
              query: `UPDATE ${Cassandra.keyspace}.email_shortcuts
              SET e_flags=?
              WHERE e_domain=? AND e_owners_uuid=? AND e_mailbox=? AND e_email_uuid=?`,
              params: [
                result, domain, ownersUUID, mailbox, emailUUIDs[numberIndex++]
              ]
            };
          });

          Cassandra.client.batch(batchStatements, {
            prepare: true
          }).then(() => resolve()).catch(err => reject(err));
        }).catch(err => reject(err));
      } else {
        let tasks: any[] = [];

        emailUUIDs.forEach(uuid => {
          tasks.push(EmailShortcut.get(domain, ownersUUID, mailbox, uuid));
        });
  
        Promise.all(tasks).then((results: EmailShortcut[]) => {
          const batchStatements: {
            query: string,
            params: any
          }[] = results.map(result => {
            result.e_Mailbox = targetMailbox;
  
            return {
              query: EmailShortcut.insertQuery,
              params: [
                result.e_Domain, result.e_Subject, result.e_Preview,
                result.e_OwnersUUID, result.e_EmailUUID, result.e_UID,
                result.e_Flags, result.e_Bucket, result.e_Mailbox,
                result.e_SizeOctets, result.e_From
              ]
            };
          });
  
          Cassandra.client.batch(batchStatements, {
            prepare: true
          }).then(() => resolve()).catch(err => reject(err));
        }).catch(err => reject(err));
      }
    });
  };

  public static remove = (
    e_Domain: string, e_OwnersUUID: cassandraDriver.types.TimeUuid,
    e_Mailbox: string, e_EmailUUID: cassandraDriver.types.TimeUuid
  ): Promise<null> => {
    return new Promise<null>((resolve, reject) => {
      let query: string = `DELETE FROM ${Cassandra.keyspace}.email_shortcuts 
      WHERE e_domain=? AND e_owners_uuid=? AND e_mailbox=? AND e_email_uuid=?`;

      Cassandra.client.execute(query, [
        e_Domain, e_OwnersUUID, e_Mailbox, e_EmailUUID
      ], {
        prepare: true
      }).then(() => resolve()).catch(err => reject(err));
    });
  };

  public static gatherAllByFlag = (
    from: number, to: number,
    e_Domain: string, e_OwnersUUID: cassandraDriver.types.TimeUuid,
    e_Flags: number
  ): Promise<EmailShortcut[]> => {
    return new Promise<EmailShortcut[]>((resolve, reject) => {
      const query: string = `SELECT * FROM ${Cassandra.keyspace}.email_shortcuts
      WHERE e_domain=? AND e_owners_uuid=? AND e_flags=? ALLOW FILTERING`

      const stream = Cassandra.client.stream(query, [e_Domain, e_OwnersUUID, e_Flags], {
        prepare: true,
        autoPage: true
      });

      let result: EmailShortcut[] = [];
      stream.on('readable', () => {
        let row: any;
        let i: number = -1;

        while (row = (<any>stream).read()) {
          if ((row['e_flags'] & e_Flags) !== e_Flags) continue;

          ++i;
          if (i < from) continue;
          if (i >= to) break;

          result.push(EmailShortcut.fromMap(row));
        }

        stream.on('close', () => {
          resolve(result);
        });

        stream.on('error', err => reject(err));
      });
    });
  };

  public static gatherAll = (
    from: number, to: number,
    e_Domain: string, e_Mailbox: string,
    e_OwnersUUID: cassandraDriver.types.TimeUuid
  ): Promise<EmailShortcut[]> => {
    return new Promise<EmailShortcut[]>((resolve, reject) => {
      
      // Checks if the mailbox is INBOX.Trash, if so we want to call the by flag
      //  method, and pass the trash flag to it. This is done here since it will keep
      //  the front-end code more clean ( in the server side then )
      
      if (e_Mailbox === "INBOX.Trash") {
        EmailShortcut.gatherAllByFlag(
          from, to, e_Domain,
          e_OwnersUUID, EmailFlags.Deleted
        ).then(res => resolve(res)).catch(err => reject(err));
        return;
      }

      const query: string = `SELECT * FROM ${Cassandra.keyspace}.email_shortcuts
      WHERE e_domain=? AND e_owners_uuid=? AND e_mailbox=?`;

      // Creates the cassandra read stream with auto paging, this means
      //  we do not have to use a ton of memory for simple things
      const stream = Cassandra.client.stream(query, [e_Domain, e_OwnersUUID, e_Mailbox], {
        prepare: true,
        autoPage: true
      });

      // Starts looping an getting the messages, after this is done
      //  close is called and we send the result
      let result: EmailShortcut[] = [];
      stream.on('readable', () => {
        let row: any;
        let i: number = -1;

        while (row = (<any>stream).read()) {
          if ((row['e_flags'] & EmailFlags.Deleted) === EmailFlags.Deleted) continue;

          ++i;
          if (i < from) continue;
          if (i >= to) break;

          result.push(EmailShortcut.fromMap(row));
        }

        (<any>stream).destroy();
      });
      
      stream.on('close', () => {
        resolve(result);
      });

      stream.on('error', err => reject(err));
    });
  }
}
