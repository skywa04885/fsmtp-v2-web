export default class Config
{
  public static hostname: string = '192.168.2.11';
  public static port: number = 4001;
  public static apiVersion: string = '1.0.0';

  public static buildURI = (path: string) => {
    return `http://${Config.hostname}:${Config.port}${path}`;
  };
};