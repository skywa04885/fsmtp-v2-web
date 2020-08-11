import cassandraDriver from 'cassandra-driver';
import redisDriver from 'redis';
import { Logger, LoggerLevel } from '../logger';

export class Redis {
  public static client: redisDriver.RedisClient;
  private static logger: Logger = new Logger(LoggerLevel.Info, 'Redis');

  public static connect(config: any) {
    Redis.logger.print(`Currently connecting to ${config.host}:${config.port}`);

    Redis.client = redisDriver.createClient({
      host: config.host,
      port: config.port
    });
  }
}

export class Cassandra {
  public static client: cassandraDriver.Client;
  public static keyspace: string;
  private static logger: Logger = new Logger(LoggerLevel.Info, 'Cassandra');

  public static connect(config: any) {
    Cassandra.logger.print(`Currently connecting to keyspace '${config.keyspace}' on ${config.datacenter} `);
    Cassandra.keyspace = config.keyspace;

    const authProvider = new cassandraDriver.auth.PlainTextAuthProvider(config.username, config.password);
    Cassandra.client = new cassandraDriver.Client({
      contactPoints: config.hosts,
      keyspace: config.keyspace,
      localDataCenter: config.datacenter,
      authProvider: authProvider
    });
  }
};
