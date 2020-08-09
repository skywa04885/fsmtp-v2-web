import cassandraDriver from 'cassandra-driver';
import { Logger, LoggerLevel } from '../logger';

class Cassandra
{
  public static client: cassandraDriver.Client;
  public static keyspace: string;
  private static logger: Logger = new Logger(LoggerLevel.Info, 'Cassandra');

  public static connect(config: any)
  {
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

export { Cassandra };
