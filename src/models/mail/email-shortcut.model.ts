import cassandraDriver from 'cassandra-driver';
import { Cassandra } from '../../helpers/database.helper';

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
    e_SizeOctets: number
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
  }

  public static fromMap = (map: any) => {
    return new EmailShortcut({
      e_Domain: map['e_domain'],
      e_Subject: map['e_subject'],
      e_Preview: map['e_preview'],
      e_OwnersUUID: map['e_owners_uuid'],
      e_EmailUUID: map['e_email_uuid'],
      e_UID: map['e_uid'],
      e_Flags: map['e_flags'],
      e_Bucket: map['e_bucket'],
      e_Mailbox: map['e_mailbox'],
      e_SizeOctets: map['e_size_octets']
    });
  };

  public static gatherAll = (
    from: number, to: number,
    e_Domain: string, e_Mailbox: string,
    e_OwnersUUID: cassandraDriver.types.TimeUuid
  ): Promise<EmailShortcut[]> => {
    return new Promise<EmailShortcut[]>((resolve, reject) => {
      const query: string = `SELECT * FROM fannst.email_shortcuts
      WHERE e_domain=? AND e_owners_uuid=? AND e_mailbox=?`;

      const stream = Cassandra.client.stream(query, [e_Domain, e_OwnersUUID, e_Mailbox], {
        prepare: true,
        autoPage: true
      });

      let result: EmailShortcut[] = [];
      stream.on('readable', () => {
        let row: any;
        let i: number = -1;
        while (row = (<any>stream).read()) {
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