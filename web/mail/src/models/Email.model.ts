export interface Header {
  h_Key: string,
  h_Value: string
}

export enum EmailContentType {
  TextHTML,
  TextPlain,
  MultipartAlternative,
  MultipartMixed,
  ImagePng,
  ImageJpg,
  Unknown,
};

export const contentTypeToString = (type: EmailContentType): string => {
  switch (type) {
    case EmailContentType.TextHTML: return 'text/html';
    case EmailContentType.TextPlain: return 'text/plain';
    case EmailContentType.MultipartAlternative: return 'multipart/alternative';
    case EmailContentType.MultipartMixed: return 'multipart/mixed';
    case EmailContentType.ImagePng: return 'image/png';
    case EmailContentType.ImageJpg: return 'image/jpg';
    case EmailContentType.Unknown: return 'application/x-binary';
  }
};

export const stringToEmailContentType = (raw: string): EmailContentType => {
  switch (raw) {
    case 'multipart/alternative': return EmailContentType.MultipartAlternative;
    case 'multipart/mixed': return EmailContentType.MultipartMixed;
    case 'text/html': return EmailContentType.TextHTML;
    case 'text/plain': return EmailContentType.TextPlain;
    case 'image/png': return EmailContentType.ImagePng;
    case 'image/jpg': case 'image/jpef': return EmailContentType.ImageJpg;
    default: return EmailContentType.Unknown;
  }
};

export enum EmailTransferEncoding {
  QuotedPrintable,
  Base64,
  B7bit,
  B8bit,
  Unknown
};

export const stringToTransferEncoding = (raw: string): EmailTransferEncoding => {
  switch (raw) {
    case '7bit': return EmailTransferEncoding.B7bit;
    case '8bit': return EmailTransferEncoding.B8bit;
    case 'base64': return EmailTransferEncoding.Base64;
    case 'quoted-printable': return EmailTransferEncoding.QuotedPrintable;
    default: return EmailTransferEncoding.Unknown;
  }
};

export interface EmailBodySection {
  e_Type?: EmailContentType,
  e_Content?: any,
  e_Headers?: Header[],
  e_Index?: number,
  e_TransferEncoding?: EmailTransferEncoding
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

    if (name[0] === '"') name = name.substr(1);
    if (name[name.length - 1] === '"') name = name.substring(0, name.length - 1);

    return new EmailAddress(address, name);
  };

  public static parseArray = (raw: string): EmailAddress[] => {
    let result: EmailAddress[] = [];
    raw.split(',').forEach(address => result.push(EmailAddress.parse(address)));
    return result;
  }
};

export class Email {
  public e_Headers: Header[];
  public e_Sections: EmailBodySection[];
  public e_Subject?: string;
  public e_From: EmailAddress[];
  public e_To: EmailAddress[];
  public e_Date?: Date;
  public e_SPFVerified?: string;
  public e_DKIMVerified?: string;

  public constructor()
  {
    this.e_Headers = [];
    this.e_Sections = [];
    this.e_From = [];
    this.e_To = [];
  }
};