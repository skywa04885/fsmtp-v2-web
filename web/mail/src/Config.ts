export default class Config
{
  public static host: string = 'mail.fannst.nl';
  public static method: string = 'http';
  public static defaultHeaders: any = {
    'Accept-Version': '1.0.0',
    'Fannst-From': 'Webmail Client'
  };

  public static buildURL = (path: string, port: number) => {
    if (path.charAt(0) !== '/') path = '/' + path;
    return `${Config.method}://${Config.host}:${port}${path}`;
  };

  public static updateTitle = (title: string) => {
    document.title = `${title} - Fannst Webmail (FSMTP-V2)`;
  }
}
