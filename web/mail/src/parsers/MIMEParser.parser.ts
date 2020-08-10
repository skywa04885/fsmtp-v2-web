import { Email, Header, EmailAddress } from '../models/Email.model';
import { stringify } from 'querystring';

const parseHeaders = (raw: string): Header[] => {
  let result: Header[] = [];
  
  uniteLines(raw).split('\r\n').forEach(rawHeader => {
    if (rawHeader.trim() === '') return;

    let sepIndex: number = rawHeader.indexOf(':');
    if (sepIndex === -1) throw new Error('Invalid headers');

    let header: Header = {
      h_Key: rawHeader.substring(0, sepIndex).trim().toLowerCase(),
      h_Value: rawHeader.substr(++sepIndex).trim()
    };

    result.push(header);
  });

  return result;
};

const splitHeadersAndBody = (raw: string): { headers: string, body: string } => {
  let result: { headers: string, body: string } = {
    headers: '',
    body: ''
  };

  let headersEnded: boolean = false;
  raw.split('\r\n').forEach(line => {
    if (line.trim() === '' && !headersEnded)
    {
      headersEnded = true;
      return;
    };

    if (!headersEnded) result.headers += line += '\r\n';
    else result.body += line += '\r\n';
  });

  return result;
};

const uniteLines = (raw: string): string => {
  let result: string = '';

  const lines: string[] = raw.split('\r\n');
  for (let i: number = 0; i < lines.length; i++) {
    if (i+1 < lines.length && lines[i+1][0] === ' ') {
      if (result[result.length-1] === ';') result += ' ';
      result += lines[i].trim();
    } else {
      result += lines[i].trim();
      result += '\r\n';
    }
  }

  return result;
};

const recursiveParse = (raw: string, target: Email, i: number) => {
  const { headers, body } = splitHeadersAndBody(raw);
  const parsedHeaders: Header[] = parseHeaders(headers);

  parsedHeaders.forEach(header => {
    if (header.h_Key === 'from') console.log(EmailAddress.parse(header.h_Value));
  });
};

export const parse = (raw: string): Email => {
  let result: Email = new Email();
  let start: number = Date.now();

  const cleaned: string = raw.replace(/ +(?= )/g, '').replace('\t', ' ');

  recursiveParse(cleaned, result, 0);

  console.log(`Parsing finished in ${Date.now() - start}ms`)
  return result;
};