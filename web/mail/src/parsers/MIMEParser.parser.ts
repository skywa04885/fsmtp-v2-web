import { Email, Header } from '../models/Email.model';
import { stringify } from 'querystring';

const parseHeaders = (raw: string): Header[] => {
  let result: Header[] = [];
  
  raw.split('\r\n').forEach(rawHeader => {
    if (rawHeader.trim() === '') return;

    let sepIndex: number = rawHeader.indexOf(':');
    if (sepIndex === -1) throw new Error('Invalid headers');

    let header: Header = {
      h_Key: rawHeader.substring(0, sepIndex).trim(),
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

  return stringify;
};

export const parse = (raw: string): Email => {
  let result: Email = new Email();
  let start: number = Date.now();

  const cleaned: string = raw.replace(/ +(?= )/g,'');

  // Splits the headers and the body, and starts the parsing process
  //  this will be an different recursive function
  const { headers, body } = splitHeadersAndBody(cleaned);
  result.e_Headers = parseHeaders(headers);


  let end: number = Date.now();
  console.log(`Parsing finished in ${end-start}ms`)
  return result;
};