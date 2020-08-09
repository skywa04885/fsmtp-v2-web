import crypto from 'crypto';

export namespace AES256 {
  const _algo = 'aes-256-cbc';
  const _keyItter = 2000;
  const _keyIvSize = 16;
  const _keySaltSize = 20;
  const _keySize = 32;

  const _randomSaltDict: string[] = [
    'a','b','c','d','e','f','g','h','i','j',
		'k','l','m','n','o','p','q','r','s','t',
		'u','v','w','x','y','z','A','B','C','D',
		'E','F','G','H','I','J','K','L','M','N',
		'O','P','Q','R','S','T','U','V','W','X',
		'Y','Z','1','2','3','4','5','6','7','8',
		'9','0'
  ];

  /**
   * Generates salt, iv etcetera, and encrypts the raw data
   * 
   * @param raw The raw data
   * @param password The password we need to encrypt with
   */
  export const encrypt = (raw: string, password: string): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      // Creates the salt, after that we turn the password with the salt into an key
      //  which later will be used to encrypt the data
      let salt: string = '';
      for (let i: number = 0; i < _keySaltSize; i++)
      {
        salt += _randomSaltDict[Math.floor(Math.random() * _randomSaltDict.length)];
      }

      // Derives the key from the password
      crypto.pbkdf2(password, salt, _keyItter, _keySize, 'sha1', (err, key) => {
        if (err) reject(err);
        const iv: Buffer = crypto.randomBytes(_keyIvSize);
        const cipher: crypto.Cipher = crypto.createCipheriv(_algo, key, iv);

        // Sets the cipher callbacks, which allows us to consume the data
        //  given by crypto
        let encrypted: any[] = [];
        cipher.on('readable', () => {
          let chunk: any;
          while((chunk = cipher.read()) !== null)
            encrypted.push(chunk);
        });

        cipher.on('end', () => {
          resolve(`${Buffer.concat(encrypted).toString('base64')}.${iv.toString('base64')}.${salt}`);
        });

        cipher.on('error', err => reject(err));

        // Writes the raw data to the cipher, after that we end the cipher
        //  this will trigger the previous defined callbacks
        cipher.write(raw);
        cipher.end();
      });
    });
  }

  /**
   * Decrypts some data using the global algorithm
   * 
   * @param toDecrypt The data that should be decrypted
   * @param password The password used for encrypting
   */
  export const decrypt = (toDecrypt: string, password: string): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      // Separates the iv, salt and encrypted data from the total input
      //  these are separated by the .
      let dotIndex: number = toDecrypt.indexOf('.');
      let secondDotIndex: number = toDecrypt.lastIndexOf('.');
      if (dotIndex === -1 || dotIndex === secondDotIndex)
        reject(new Error('Invalid encypted data supplied'));
      const encrypted: Buffer = Buffer.from(toDecrypt.substring(0, dotIndex), 'base64');
      const iv: Buffer = Buffer.from(toDecrypt.substring(dotIndex + 1, secondDotIndex), 'base64');
      const salt: string = toDecrypt.substring(secondDotIndex + 1);

      // Derives the key from the password, iv salt etcetera... This will allow us
      //  to read the original values of the data
      crypto.pbkdf2(password, salt, _keyItter, _keySize, 'sha1', (err, key) => {
        if (err) reject(err);
        const decipher: crypto.Decipher = crypto.createDecipheriv(_algo, key, iv);

        // Sets the cipher callbacks, this allows us to read the raw data
        //  from the stream
        let decrypted: any[] = [];
        decipher.on('readable', () => {
          let chunk: any;
          while ((chunk = decipher.read()) !== null)
            decrypted.push(chunk);
        });

        decipher.on('end', () => {
          resolve(Buffer.concat(decrypted).toString('utf-8'));
        });

        decipher.on('error', err => reject(err));

        // Writes the encrypted data to the decipher, after this the previous
        //  specified callbacks will be called
        decipher.write(encrypted);
        decipher.end();
      });
    });
  };
}
