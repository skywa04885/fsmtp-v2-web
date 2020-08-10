export interface Header {
  h_Key: string,
  h_Value: string
}

export class Email {
  public e_Headers: Header[];

  public constructor()
  {
    this.e_Headers = [];
  }
};