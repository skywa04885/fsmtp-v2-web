export class EmailShortcut {
  public e_Subject: string;
  public e_Preview: string;
  public e_EmailUUID: string;
  public e_UUID: string;
  public e_UID: number;
  public e_Flags: number;
  public e_Bucket: number;
  public e_SizeOctets: number;
  public e_From: string;

  public constructor(data: {
    e_Subject: string,
    e_Preview: string,
    e_EmailUUID: string,
    e_UUID: string,
    e_UID: number,
    e_Flags: number,
    e_Bucket: number,
    e_SizeOctets: number,
    e_From: string
  }) {
    this.e_Subject = data.e_Subject;
    this.e_Preview = data.e_Preview;
    this.e_EmailUUID = data.e_EmailUUID;
    this.e_UUID = data.e_UUID;
    this.e_UID = data.e_UID;
    this.e_Flags = data.e_Flags;
    this.e_Bucket = data.e_Bucket;
    this.e_SizeOctets = data.e_SizeOctets;
    this.e_From = data.e_From;
  }

  public static fromMap = (map: any): EmailShortcut => {
    return new EmailShortcut({
      e_Subject: map['e_subject'],
      e_Preview: map['e_preview'],
      e_EmailUUID: map['e_email_uuid'],
      e_UUID: map['e_uuid'],
      e_UID: map['e_uid'],
      e_Flags: map['e_flags'],
      e_Bucket: map['e_bucket'],
      e_SizeOctets: map['e_size_octets'],
      e_From: map['e_from']
    });
  };
}