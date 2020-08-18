export enum AccountType {
  Default
}

export class Account {
  public a_FullName: string;
  public a_Username: string;
  public a_Domain: string;
  public a_CreationDate: Date;
  public a_BirthDate: Date;
  public a_Bucket: number;
  public a_Gas: number;
  public a_Address: string;
  public a_Country: string;
  public a_Region: string;
  public a_City: string;
  public a_Phone: string;
  public a_Flags: number;
  public a_UUID: string;
  public a_StorageUsedInBytes: number;
  public a_StorageMaxInBytes: number;
  public a_PictureURI: string;
  public a_Type: AccountType;

  /**
   * Default constructor for the account
   * 
   * @param data The account data
   */
  public constructor(data: {
    a_FullName: string,
    a_Username: string,
    a_Domain: string,
    a_CreationDate: Date,
    a_BirthDate: Date,
    a_Bucket: number,
    a_Gas: number,
    a_Address: string,
    a_Country: string,
    a_Region: string,
    a_City: string,
    a_Phone: string,
    a_Flags: number,
    a_UUID: string,
    a_StorageUsedInBytes: number,
    a_StorageMaxInBytes: number,
    a_PictureURI: string,
    a_Type: AccountType
  }) {
    this.a_FullName = data.a_FullName;
    this.a_Username = data.a_Username;
    this.a_Domain = data.a_Domain;
    this.a_CreationDate = data.a_CreationDate;
    this.a_BirthDate = data.a_BirthDate;
    this.a_Bucket = data.a_Bucket;
    this.a_Gas = data.a_Gas;
    this.a_Address = data.a_Address;
    this.a_Country = data.a_Country;
    this.a_Region = data.a_Region;
    this.a_City = data.a_City;
    this.a_Phone = data.a_Phone;
    this.a_Flags = data.a_Flags;
    this.a_UUID = data.a_UUID;
    this.a_StorageUsedInBytes = data.a_StorageUsedInBytes;
    this.a_StorageMaxInBytes = data.a_StorageMaxInBytes;
    this.a_PictureURI = data.a_PictureURI;
    this.a_Type = data.a_Type;
  }

  /**
   * Turns an request json map into an valid account
   * 
   * @param map The raw JSON Map
   */
  public static fromMap = (map: any): Account => {
    return new Account({
      a_FullName: map['a_full_name'],
      a_Username: map['a_username'],
      a_Domain: map['a_domain'],
      a_CreationDate: new Date(parseInt(map['a_creation_date'])),
      a_BirthDate: new Date(parseInt(map['a_birth_date'])),
      a_Bucket: parseInt(map['a_bucket']),
      a_Gas: parseFloat(map['a_gas']),
      a_Address: map['a_address'],
      a_Country: map['a_country'],
      a_Region: map['a_region'],
      a_City: map['a_city'],
      a_Phone: map['a_phone'],
      a_Flags: map['a_flags'],
      a_UUID: map['a_uuid'],
      a_StorageUsedInBytes: parseInt(map['a_storage_used_in_bytes']),
      a_StorageMaxInBytes: parseInt(map['a_storage_max_in_bytes']),
      a_PictureURI: map['a_picture_uri'],
      a_Type: parseInt(map['a_type'])
    });
  };

  public getObject = (): any => {
    return {
      FullName: this.a_FullName,
      Username: this.a_Username,
      Domain: this.a_Domain,
      CreationDate: this.a_CreationDate,
      BirthDate: this.a_BirthDate,
      Bucket: this.a_Bucket,
      Gas: this.a_Gas,
      Address: this.a_Address,
      Country: this.a_Country,
      Region: this.a_Region,
      City: this.a_City,
      Phone: this.a_Phone,
      Flags: this.a_Flags.toString(2),
      UUID: this.a_UUID,
      StorageUsedInBytes: this.a_StorageUsedInBytes,
      StorageMaxInBytes: this.a_StorageMaxInBytes,
      PictureURI: this.a_PictureURI,
      Type: this.a_Type,
    }
  };
}