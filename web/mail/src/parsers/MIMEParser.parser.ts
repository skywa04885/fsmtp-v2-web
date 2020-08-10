import { 
  Email, Header, EmailAddress,
  EmailContentType, EmailBodySection,
  stringToEmailContentType, stringToTransferEncoding, 
  EmailTransferEncoding, contentTypeToString
} from '../models/Email.model';

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

interface ParseContentTypeResullt {
  type?: EmailContentType,
  boundary?: string,
  charset?: string,
  name?: string
}

const parseContentType = (raw: string): ParseContentTypeResullt => {
  // Example: multipart/alternative; boundary="000000000000fe154a05ac855683"
  let result: ParseContentTypeResullt = {};

  // Gets the content type
  const pairs: string[] = raw.split(';');
  result.type = stringToEmailContentType(pairs[0]);

  // Removes the first element and starts looping over
  //  the other ones, parsing them in the meantime
  pairs.shift();
  pairs.forEach(pair => {
    let sepIndex: number = pair.indexOf('=');
    if (sepIndex === -1) return;

    // Gets the key and value of the current pair
    let key: string = pair.substring(0, sepIndex).trim().toLowerCase();
    let value: string = pair.substr(++sepIndex).trim();

    // Removes the quotes from the value, since it may contain these
    //  but not required by RFC
    if (value[0] === '"') value = value.slice(1);
    if (value[value.length - 1] === '"') value = value.slice(0, value.length - 1);

    // Checks if we should use the value
    switch (key)
    {
      case 'boundary':
        result.boundary = value;
        break;
      case 'charset':
        result.charset = value;
        break;
      case 'name':
        result.name = value;
        break;
    }
  });

  return result;
};

const decodeQuotedPrintable = (raw: string): string => {
  let result: string = '';

  const lines: string[] = raw.split('\r\n');
  for (let line of lines) {
    if (line[line.length - 1] === '=') result += line.substring(0, line.length - 1);
    else {
      result += line;
      result += '\r\n';
    }
  }

  console.log(result);


  result = result.replace(/=[0-9A-Za-z]{2}/g, (match, capture) => {
    return String.fromCharCode(parseInt(match.substr(1), 16));
  });

  return result;
};

const recursiveParse = async (raw: string, target: Email, i: number) => {
  const { headers, body } = splitHeadersAndBody(raw);
  const parsedHeaders: Header[] = parseHeaders(headers);
  let resultSection: EmailBodySection = {
    e_Index: i,
    e_Headers: parsedHeaders
  };
  let insertSection: boolean = false;
  let contentType: ParseContentTypeResullt = {};

  // Parses the content type from the headers since we will use
  //  this to determine if we need to process it like multipart data
  //  or just any other body section  
  parsedHeaders.forEach(header => {
    if (header.h_Key === 'content-type')
    {
      contentType = parseContentType(header.h_Value);
      resultSection.e_Type = contentType.type;
    }
    else if (header.h_Key === 'content-transfer-encoding')
    {
      resultSection.e_TransferEncoding = stringToTransferEncoding(header.h_Value);
    }
  });

  // Checks how we should process the data, this may be text, etcetera
  //  next to that we also decode the text, so the user can read it
  switch (resultSection.e_Type)
  {
    case EmailContentType.ImageJpg: case EmailContentType.ImagePng: {
      switch (resultSection.e_TransferEncoding) {
        case EmailTransferEncoding.Base64: {
          const fileType: EmailContentType = contentType.type ? contentType.type : EmailContentType.Unknown
          const fileTypeString: string = contentTypeToString(fileType);

          const fileURI: string = `base64,${body.split('\r\n').join()}`;
          const res: any = await fetch(fileURI);
          resultSection.e_Content = new File(
            [ res.arrayBuffer() ], 
            contentType.name ? contentType.name : `F${Date.now()}.bin`,
            { type: fileTypeString }
          );
          insertSection = true;
        };
        default: break;
      }

      break;
    }
    case EmailContentType.TextPlain: case EmailContentType.TextHTML: {
      if (resultSection.e_TransferEncoding === EmailTransferEncoding.QuotedPrintable || resultSection.e_TransferEncoding === EmailTransferEncoding.B7bit)
        resultSection.e_Content = decodeQuotedPrintable(body);
      else resultSection.e_Content = body;
      insertSection = true;
      break;
    }
    case EmailContentType.MultipartAlternative: case EmailContentType.MultipartMixed: {
      if (!contentType.boundary)
        throw new Error('Content type is multipart but boundary not specified');

      // Prepares the boundaries for comparation, and splits the message
      //  using the CRLF
      const newSectionBoundary: string = `--${contentType.boundary}`;
      const endBoundary: string = `--${contentType.boundary}--`;
      const lines: string[] = body.split('\r\n');

      // Starts looping over the lines, and parsing the individual
      //  sections into the target
      let temp: string = '';
      for (let line of lines) {
        if (line.substring(0, 2) === '--')
        {
          // Checks which boundary is hit, if the first one is hit
          //  we will not compare the second one, since we do not care about
          //  that comparison
          let endBoundaryHit: boolean = line == endBoundary;
          let newSectionBoundaryHit: boolean = (!endBoundaryHit) ? line == newSectionBoundary : false;

          // Checks if we've hit something, if so perform the action, then we check
          //  if there is something in the temp buffer, if so run it though a new
          //  recursive parser instance
          if (endBoundaryHit || newSectionBoundaryHit)
          {
            // Calls the recursive method, increments the index
            //  and then clears the buffer
            if (temp.trim() !== '') {
              await recursiveParse(temp, target, i + 1);
              temp = '';
            }

            // Checks if we need to quit, else skip
            //  append of current stuff
            if (endBoundaryHit) break;
            else continue;
          }
        }

        temp += line;
        temp += '\r\n';
      };

      break;
    }
  }

  // Checks if we need to use the headers for the main message
  //  information
  if (i === 0) {
    // Parses the header values, and stores the headers inside of the email
    target.e_Headers = parsedHeaders;
    parsedHeaders.forEach(header => {
      switch (header.h_Key) {
        case 'subject':
          target.e_Subject = header.h_Value;
          break;
        case 'from':
          target.e_From = EmailAddress.parseArray(header.h_Value);
          break;
        case 'to':
          target.e_To = EmailAddress.parseArray(header.h_Value);
          break;
        case 'date':
          target.e_Date = new Date(Date.parse(header.h_Value));
          break;
      }
    });
  } else if (insertSection)
    target.e_Sections.push(resultSection);
};

export const parse = (raw: string): Promise<Email> => {
  return new Promise<Email>(async (resolve, reject) => {
    try {
      let result: Email = new Email();
      let start: number = Date.now();
    
      const cleaned: string = raw.replace(/ +(?= )/g, '').replace(/\t/g, ' ');
      await recursiveParse(cleaned, result, 0);
  
      console.log(`Parser finished job ${Date.now() - start}ms`);
      resolve(result);
    } catch (e) {
      reject(e);
    }
  });
};