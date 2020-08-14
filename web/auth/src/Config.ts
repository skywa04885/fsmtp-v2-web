export default class Config
{
  public static hostname: string = 'mail.fannst.nl';
  public static port: number = 4001;
  public static apiVersion: string = '1.0.0';

  public static buildURI = (path: string) => {
    return `http://${Config.hostname}:${Config.port}${path}`;
  };
};
