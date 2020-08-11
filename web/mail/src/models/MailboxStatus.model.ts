export class MailboxStatus {
  public s_Unseen: number;
  public s_NextUUID: number;
  public s_Recent: number;
  public s_Total: number;
  public s_Flags: number;
  public s_PermaFlags: number;
  public s_Path: string;

  public constructor(data: {
    s_Unseen: number,
    s_NextUUID: number,
    s_Recent: number,
    s_Total: number,
    s_Flags: number,
    s_PermaFlags: number,
    s_Path: string
  }) {
    this.s_Unseen = data.s_Unseen;
    this.s_NextUUID = data.s_NextUUID;
    this.s_Recent = data.s_Recent;
    this.s_Total = data.s_Total;
    this.s_Flags = data.s_Flags;
    this.s_PermaFlags = data.s_PermaFlags;
    this.s_Path = data.s_Path;
  }

  public static fromMap = (map: any): MailboxStatus => {
    return new MailboxStatus({
      s_Unseen: map['s_unseen'],
      s_NextUUID: map['s_next_uuid'],
      s_Recent: map['s_recent'],
      s_Total: map['s_total'],
      s_Flags: map['s_flags'],
      s_PermaFlags: map['s_perma_flags'],
      s_Path: map['s_path']
    });
  };
};