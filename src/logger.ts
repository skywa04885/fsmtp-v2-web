import chalk from 'chalk';

enum LoggerLevel {
  Debug, Info, Warn,
  Error, Fatal
};

class Logger {
  private l_Level: LoggerLevel;
  private l_Prefix: string;
  public static minLevel: LoggerLevel = LoggerLevel.Info;

  /**
   * Default constructor for the logger
   * 
   * @param l_Level The level for the logger
   * @param l_Prefix The prefix
   */
  public constructor(l_Level: LoggerLevel, l_Prefix: string) {
    this.l_Level = l_Level;
    this.l_Prefix = l_Prefix;
  }

  /**
   * Prints the message to the console
   * 
   * @param message The message to print
   */
  public print(message: string): Logger
  {
    return this.printWithLevel(message, this.l_Level);
  }

  /**
   * Gets the level string with the colors
   * 
   * @param level The level to get value of
   */
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

  /**
   * Prints an message with specific level to the console
   * 
   * @param message The message to print
   * @param level The level to use while printing
   */
  public printWithLevel(message: string, level: LoggerLevel): Logger {
    if (level < Logger.minLevel) return this;
    const date: string = new Date().toUTCString();
    console.log(`${date} -> ${this.getLoggerLevelString(level)}${message}`);
    return this;
  }
};

export { Logger, LoggerLevel };