import chalk from 'chalk';

enum LoggerLevel {
  Debug, Info, Warn,
  Error, Fatal
};

class Logger {
  private l_Level: LoggerLevel;
  private l_Prefix: string;

  public constructor(l_Level: LoggerLevel, l_Prefix: string) {
    this.l_Level = l_Level;
    this.l_Prefix = l_Prefix;
  }

  public print(message: string): Logger
  {
    return this.printWithLevel(message, this.l_Level);
  }

  private getLoggerLevelString(level: LoggerLevel): string
  {
    const message: string = `(${LoggerLevel[level]}@${this.l_Prefix}): `;

    switch (level)
    {
      case LoggerLevel.Debug: return chalk.green(message);
      case LoggerLevel.Info: return chalk.blue(message);
      case LoggerLevel.Warn: return chalk.yellow(message);
      case LoggerLevel.Fatal: return chalk.red(message);
      case LoggerLevel.Error: return chalk.redBright(message);
      default: return message;
    }
  }

  public printWithLevel(message: string, level: LoggerLevel): Logger {
    const date: string = new Date().toUTCString();
    console.log(`${date} -> ${this.getLoggerLevelString(level)}${message}`);
    return this;
  }
};

export { Logger, LoggerLevel };