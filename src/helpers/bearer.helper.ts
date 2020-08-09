import cassandraDriver from 'cassandra-driver';
import jwt from 'jsonwebtoken';
import { readConfig } from './config.helper';

const env: any = readConfig(true);

export namespace Bearer
{
  export const generate = (
    uuid: cassandraDriver.types.TimeUuid, 
    domain: string, bucket: number, password: string
  ): string => {
    return jwt.sign({
      uuid, domain, bucket, password
    }, env.jwtPassphrase);
  };
}
