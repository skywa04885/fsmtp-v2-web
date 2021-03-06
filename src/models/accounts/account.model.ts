import cassandraDriver from 'cassandra-driver';
import { Cassandra, Redis } from '../../helpers/database.helper';
import crypto from 'crypto';
import { reject } from 'async';
import { bunyan } from 'restify';
import { RedisClient } from 'redis';

enum AccountType {
  Default
};

class Account
{
  public a_Username: string;
  public a_PictureURI: string;
  public a_Password: string;
  public a_Domain: string;
  public a_Bucket: number;
  public a_FullName: string;
  public a_BirthDate: Date;
  public a_CreationDate: Date;
  public a_RSAPublic?: string;
  public a_RSAPrivate?: string;
  public a_Gas: number;
  public a_Country?: string;
  public a_Region?: string;
  public a_City?: string;
  public a_Address?: string;
  public a_Phone?: string;
  public a_Type: AccountType;
  public a_UUID: cassandraDriver.types.TimeUuid;
  public a_Flags: number;
  public a_StorageUsedInBytes: number;
  public a_StorageMaxInBytes: number;

  public constructor(data: {
    a_Username: string, a_PictureURI: string, a_Password: string,
    a_Domain: string, a_Bucket: number, a_FullName: string,
    a_BirthDate: Date,a_CreationDate: Date, a_RSAPublic?: string,
    a_RSAPrivate?: string, a_Gas: number, a_Country?: string,
    a_Region?: string, a_City?: string, a_Address?: string,
    a_Phone?: string, a_Type: AccountType, a_UUID: cassandraDriver.types.TimeUuid,
    a_Flags: number, a_StorageUsedInBytes: number, a_StorageMaxInBytes: number
  }) {
    this.a_Username = data.a_Username;
    this.a_PictureURI = data.a_PictureURI;
    this.a_Password = data.a_Password;
    this.a_Domain = data.a_Domain;
    this.a_Bucket = data.a_Bucket;
    this.a_FullName = data.a_FullName;
    this.a_BirthDate = data.a_BirthDate;
    this.a_CreationDate = data.a_CreationDate;
    this.a_RSAPublic = data.a_RSAPublic;
    this.a_RSAPrivate = data.a_RSAPrivate;
    this.a_Gas = data.a_Gas;
    this.a_Country = data.a_Country;
    this.a_Region = data.a_Region;
    this.a_City = data.a_City;
    this.a_Address = data.a_Address;
    this.a_Phone = data.a_Phone;
    this.a_Type = data.a_Type;
    this.a_UUID = data.a_UUID;
    this.a_Flags = data.a_Flags;
    this.a_StorageUsedInBytes = data.a_StorageUsedInBytes;
    this.a_StorageMaxInBytes = data.a_StorageMaxInBytes;
  }

  public static getPassword = (
    a_Bucket: number, a_Domain: string, 
    a_UUID: cassandraDriver.types.TimeUuid
  ): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const query: string =  `SELECT a_password FROM ${Cassandra.keyspace}.accounts 
      WHERE a_bucket=? AND a_domain=? AND a_uuid=?`;

      Cassandra.client.execute(query, [
        a_Bucket, a_Domain, a_UUID
      ], {
        prepare: true
      }).then(res => {
        if (res.rows.length <= 0) resolve(undefined);
        else resolve(res.rows[0].a_password);
      }).catch(err => reject(err));
    });
  };

  public save = (): Promise<null> => {
    return new Promise<null>((resolve, reject) => {
      const query: string = `INSERT INTO ${Cassandra.keyspace}.accounts (
        a_username, a_picture_uri, a_password,
        a_domain, a_bucket, a_full_name,
        a_birth_date, a_creation_date, a_rsa_public,
        a_rsa_private, a_gas, a_country, 
        a_region, a_city, a_address, 
        a_phone, a_type, a_uuid,
        a_flags, a_storage_used_bytes, a_storage_max_bytes
      ) VALUES (
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?
      )`;

      Cassandra.client.execute(query, [
        this.a_Username, this.a_PictureURI, this.a_Password,
        this.a_Domain, this.a_Bucket, this.a_FullName,
        this.a_BirthDate.getTime(), this.a_CreationDate.getTime(), this.a_RSAPublic,
        this.a_RSAPrivate, this.a_Gas, this.a_Country,
        this.a_Region, this.a_City, this.a_Address,
        this.a_Phone, this.a_Type, this.a_UUID,
        this.a_Flags, this.a_StorageUsedInBytes, this.a_StorageMaxInBytes
      ], {
        prepare: true
      }).then(() => resolve()).catch(err => reject(err));
    });
  };

  public static fromMap = (map: any) => {
    return new Account({
      a_Username: map['a_username'],
      a_PictureURI: map['a_picture_uri'],
      a_Password: map['a_password'],
      a_Domain: map['a_domain'],
      a_Bucket: parseInt(map['a_bucket']),
      a_FullName: map['a_full_name'],
      a_BirthDate: new Date(parseInt(map['a_birth_date'])),
      a_CreationDate: new Date(parseInt(map['a_creation_date'])),
      a_RSAPublic: map['a_rsa_public'],
      a_RSAPrivate: map['a_rsa_private'],
      a_Gas: parseFloat(map['a_gas']),
      a_Country: map['a_country'],
      a_Region: map['a_region'],
      a_City: map['a_city'],
      a_Address: map['a_address'],
      a_Phone: map['a_phone'],
      a_Type: map['a_type'],
      a_UUID: map['a_uuid'],
      a_Flags: parseInt(map['a_flags']),
      a_StorageUsedInBytes: parseInt(map['a_storage_used_bytes']),
      a_StorageMaxInBytes: parseInt(map['a_storage_max_bytes'])
    });
  };

  public static get = (
    a_Bucket: number, a_Domain: string, 
    a_UUID: cassandraDriver.types.TimeUuid
  ): Promise<Account> => {
    return new Promise<Account>((resolve, reject) => {
      const query: string = `SELECT a_username, a_picture_uri, a_password,
      a_full_name, a_birth_date, a_creation_date, 
      a_rsa_public, a_rsa_private, a_gas, a_country, 
      a_region, a_city, a_address, a_phone, 
      a_type, a_flags, a_storage_used_bytes, 
      a_storage_max_bytes
      FROM ${Cassandra.keyspace}.accounts 
      WHERE a_bucket=? AND a_domain=? AND a_uuid=?`;

      Cassandra.client.execute(query, [
        a_Bucket, a_Domain, a_UUID
      ], {
        prepare: true
      }).then(res => {
        if (res.rows.length <= 0) resolve(undefined);
        
        let account: Account = Account.fromMap(res.rows[0]);
        account.a_Domain = a_Domain;
        account.a_UUID = a_UUID;
        account.a_Bucket = a_Bucket;

        resolve(account);
      }).catch(err => reject(err));
    });
  };

  public generateKeypair = (): Promise<null> => {
    return new Promise<null>((resolve, reject) => {
      crypto.generateKeyPair(<any>'rsa', {
        modulusLength: 2048
      }, (err: any, publicKey: crypto.KeyObject, privateKey: crypto.KeyObject) => {
        if (err) reject(err);
        
        this.a_RSAPrivate = privateKey.export({
          type: 'pkcs1',
          format: 'pem'
        }).toString('utf-8');

        this.a_RSAPublic = publicKey.export({
          type: 'spki',
          format: 'pem'
        }).toString('utf-8');

        resolve();
      });
    });
  }

  public static getBucket = (): number => {
    return Math.round(Date.now() / 1000 / 1000 / 10);
  };
};

class AccountShortcut
{
  public a_Bucket: number;
  public a_Domain: string;
  public a_Username: string;
  public a_UUID: cassandraDriver.types.TimeUuid;

  public constructor(data: {
    a_Bucket: number, a_Domain: string, a_Username: string,
    a_UUID: cassandraDriver.types.TimeUuid
  }) {
    this.a_Bucket = data.a_Bucket;
    this.a_Domain = data.a_Domain;
    this.a_Username = data.a_Username;
    this.a_UUID = data.a_UUID;
  }

  public static fromMap = (map: any): AccountShortcut => {
    return new AccountShortcut({
      a_Bucket: map['a_bucket'],
      a_Domain: map['a_domain'],
      a_Username: map['a_username'],
      a_UUID: map['a_uuid']
    });
  };

  public static fromRedisMap = (map: any, a_Domain: string, a_Username: string): AccountShortcut => {
    return new AccountShortcut({
      a_Bucket: map['v1'],
      a_UUID: cassandraDriver.types.TimeUuid.fromString(map['v2']),
      a_Domain: a_Domain,
      a_Username: a_Username
    });
  };

  public save = (): Promise<null> => {
    return new Promise<null>((resolve, reject) => {
      const query: string = `INSERT INTO ${Cassandra.keyspace}.account_shortcuts (
        a_bucket, a_domain, a_username,
        a_uuid
      ) VALUES (
        ?, ?, ?,
        ?
      )`;

      Cassandra.client.execute(query, [
        this.a_Bucket, this.a_Domain, 
        this.a_Username, this.a_UUID
      ], {
        prepare: true
      }).then(() => resolve()).catch(err => reject(err));
    });
  };

  public static getPrefix = (
    username: string, domain: string
  ): string => {
    return `acc:${username}@${domain}`;
  };
  
  public static findRedis = (
    username: string, domain: string 
  ): Promise<AccountShortcut> => {
    return new Promise<AccountShortcut>((resolve, reject) => {
      Redis.client.hgetall(AccountShortcut.getPrefix(username, domain), (err, res) => {
        if (err) reject(err);
        else if (!res) resolve(undefined);
        else resolve(AccountShortcut.fromRedisMap(res, domain, username));
      });
    });
  };

  public saveRedis = (): Promise<null> => {
    return new Promise<null>((resolve, reject) => {
      Redis.client.hmset(
        AccountShortcut.getPrefix(this.a_Username, this.a_Domain), 
        'v1', this.a_Bucket.toString(),
        'v2', this.a_UUID.toString(),
        (err) => {
          if (err) return reject(err);
          resolve();    
        }
      )
    });
  };

  public static find = (domain: string, username: string): Promise<AccountShortcut> => {
    return new Promise<AccountShortcut>((resolve, reject) => {

      // Performs initial attempt from redis, if this fails
      //  we will try again using cassandra

      AccountShortcut.findRedis(username, domain).then(redisShortcut => {
        if (redisShortcut) return resolve(redisShortcut);

        // Performs attempt from cassandra, and if this does work we will add
        //  it to the redis memory

        const query: string = `SELECT a_bucket, a_uuid 
        FROM ${Cassandra.keyspace}.account_shortcuts 
        WHERE a_domain=? AND a_username=?`;
    
        Cassandra.client.execute(query, [domain, username], {
          prepare: true
        }).then(data => {
          if (data.rows.length <= 0) return resolve(undefined);
          
          let result: AccountShortcut = AccountShortcut.fromMap(data.rows[0]);
          result.a_Domain = domain;
          result.a_Username = username;

          result.saveRedis().then(() => resolve(result)).catch(err => reject(err))
        }).catch(err => reject(err));
      });
    });
  };
};

export { Account, AccountType, AccountShortcut };