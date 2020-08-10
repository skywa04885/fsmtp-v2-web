import cassandraDriver from 'cassandra-driver';
import { Cassandra } from '../../helpers/database.helper';
import { rejectSeries } from 'async';
import { bunyan } from 'restify';

export class EmailRaw {
  public e_Bucket: number;
  public e_Domain: string;
  public e_OwnersUUID: cassandraDriver.types.TimeUuid;
  public e_EmailUUID: cassandraDriver.types.TimeUuid;
  public e_Content: string;

  public constructor(data: {
    e_Bucket: number,
    e_Domain: string,
    e_OwnersUUID: cassandraDriver.types.TimeUuid,
    e_EmailUUID: cassandraDriver.types.TimeUuid,
    e_Content: string
  }) {
    this.e_Bucket = data.e_Bucket;
    this.e_Domain = data.e_Domain;
    this.e_OwnersUUID = data.e_OwnersUUID;
    this.e_EmailUUID = data.e_EmailUUID;
    this.e_Content = data.e_Content;
  }

  public static fromMap = (map: any): EmailRaw => {
    return new EmailRaw({
      e_Bucket: map['e_bucket'],
      e_Domain: map['e_domain'],
      e_OwnersUUID: map['e_owners_uuid'],
      e_EmailUUID: map['e_email_uuid'],
      e_Content: map['e_content']
    });
  };

  public static get = (
    e_Bucket: number, e_Domain: string, 
    e_OwnersUUID: cassandraDriver.types.TimeUuid,
    e_EmailUUID: cassandraDriver.types.TimeUuid
  ): Promise<EmailRaw> => {
    return new Promise<EmailRaw>((resolve, reject) => {
      const query: string = `SELECT e_content FROM ${Cassandra.keyspace}.raw_emails
      WHERE e_bucket=? AND e_domain=? AND e_owners_uuid=? AND e_email_uuid=?`;

      Cassandra.client.execute(query, [
        e_Bucket, e_Domain, e_OwnersUUID, e_EmailUUID
      ], {
        prepare: true
      }).then(res => {
        if (res.rows.length <= 0) resolve(undefined);
        let result: EmailRaw = EmailRaw.fromMap(res.rows[0]);
        result.e_Bucket = e_Bucket;
        result.e_Domain = e_Domain;
        result.e_OwnersUUID = e_OwnersUUID;
        result.e_EmailUUID = e_EmailUUID;
        resolve(result);
      }).catch(err => reject(err));
    });
  };
}