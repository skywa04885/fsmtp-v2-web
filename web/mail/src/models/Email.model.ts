export interface Header {
  h_Key: string,
  h_Value: string
}

export enum EmailContentType {
  TextHTML,
  TextPlain,
  Base64,
  PrintedQuotable,
  MultipartAlternative,
  MultipartMixed
};

export interface EmailBodySection {
  e_Type: EmailContentType,
  e_Content: string,
  e_Headers: Header[],
  e_Index: number
};

export class EmailAddress {
  public e_Address: string;
  public e_Name?: string;

  public constructor(e_Address: string, e_Name?: string) {
    this.e_Address = e_Address;
    this.e_Name = e_Name;
  }

  public static parse = (raw: string): EmailAddress => {
    let name: string = '', address: string = '';

    if (raw.indexOf('@') === -1)
      throw new Error('Could not find @');

    let openBracket: number, closeBracket: number;
    openBracket = raw.indexOf('<');
    closeBracket = raw.indexOf('>');

    if (openBracket !== -1 && closeBracket !== -1) {
      address = raw.substring(openBracket + 1, closeBracket).trim();
      name = raw.substring(0, openBracket).trim();
    } else if (
      openBracket !== -1 && closeBracket === -1 ||
      openBracket === -1 && closeBracket !== -1
    ) {
      throw new Error('Only one bracket found, address should contain two.');
    } else address = raw.trim();

    return new EmailAddress(address, name);
  };
};

export class Email {
  public e_Headers: Header[];
  public e_Sections: EmailBodySection[];
  public e_Subject: string;

  public constructor()
  {
    this.e_Headers = [];
    this.e_Sections = [];
    this.e_Subject = '';
  }
};