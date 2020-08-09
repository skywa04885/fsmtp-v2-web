import crypto from 'crypto';

const _randomPasswordSaltDict: string[] = [
  'a','b','c','d','e','f','g','h','i','j',
  'k','l','m','n','o','p','q','r','s','t',
  'u','v','w','x','y','z','A','B','C','D',
  'E','F','G','H','I','J','K','L','M','N',
  'O','P','Q','R','S','T','U','V','W','X',
  'Y','Z','1','2','3','4','5','6','7','8',
  '9','0'
];

/**
 * Hashes the password with the specified salt
 * 
 * @param password The password which needs to be hashed
 * @param salt The salt used for the hashing
 */
const passwordHashOnly = (password: string, salt: string) => {
  return new Promise<string>((resolve, reject) => {
    crypto.pbkdf2(password, salt, 4000, 32, 'sha1', (err, key) => {
      if (err) reject(err);
      else resolve(key.toString('base64'));
    });
  });
}

/**
 * Generates the salt and hashes the password
 * 
 * @param password The password to be hashed
 */
const passwordHash = (password: string): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    let salt: string = '';

    // Generates the random salt, this is being done using the dict
    //  then we get a random one and append it to the salt
    for (let i: number = 0; i < 25; i++)
    {
      salt += _randomPasswordSaltDict[Math.floor(Math.random() * _randomPasswordSaltDict.length)]
    }

    // Returns the hash, this is being done by a separate function
    //  after that we just append the salt to the hash
    passwordHashOnly(password, salt).then(hash => {
      resolve(`${hash}.${salt}`);
    }).catch(err => reject(err));
  });
}

/**
 * Compares an password against a hashed one
 * 
 * @param password The password to be verified
 * @param compared The hash from the database
 */
const passwordVerify = (password: string, compared: string ): Promise<boolean> => {
  return new Promise<boolean>((resolve, reject) => {
    // Gets the salt from the original hash, this is being done using the dot
    //  since that is neither in base64 and the hash table
    const saltIndex: number = compared.indexOf('.');
    if (saltIndex === -1) reject(new Error('Invalid hash'));
    
    const salt = compared.substr(saltIndex + 1);
    
    // Generates the password hash using the existing salt, and compares
    //  it against the existing one
    passwordHashOnly(password, salt).then(newHash => {
      if (newHash === compared.substr(0, saltIndex)) resolve(true);
      else resolve(false);
    }).catch(err => reject(err));
  });
};

export { passwordHash, passwordVerify };