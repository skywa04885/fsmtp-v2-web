export default class Config
{
  public static darkmode: boolean = localStorage.getItem('config:dark-mode') === 'true' ? true : false;
  public static host: string = 'fannst.nl';
  public static method: string = 'https';
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

  public static setDarkMode = (enable: boolean) => {
    localStorage.setItem('config:dark-mode', (enable ? 'true' : 'false'));
    Config.darkmode = enable;
  };
}
