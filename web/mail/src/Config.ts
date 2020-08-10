export default class Config
{
  public static host: string = 'localhost';
  public static method: string = 'http';
  public static defaultHeaders: any = {
    'Accept-Version': '1.0.0',
    'Fannst-From': 'Webmail Client'
  };

  /**
   * Builds an url with the host and method
   * 
   * @param path The path
   * @param port The service port
   */
  public static buildURL = (path: string, port: number) => {
    if (path.charAt(0) !== '/') path = '/' + path;
    return `${Config.method}://${Config.host}:${port}${path}`;
  };
}
