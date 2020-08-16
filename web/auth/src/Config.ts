export default class Config
{
  public static hostname: string = 'fannst.nl';
  public static port: number = 4001;
  public static apiVersion: string = '1.0.0';

  public static buildURI = (path: string) => {
    return `https://${Config.hostname}:${Config.port}${path}`;
  };

  public static setTitle = (title: string) => {
    document.title = `${title} - Fannst Authorization`;
  };
};
