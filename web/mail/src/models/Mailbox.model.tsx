import React from 'react';

const MailboxFlags = {
  HasSubdirs: 1,
  Unmarked: 2,
  Archive: 4,
  Trash: 8,
  Sent: 16,
  Draft: 32,
  Marked: 64,
  Junk: 128,
  ReadOnly: 256
};

export class Mailbox {
  public e_Bucket: number;
  public e_MessageCount: number;
  public e_Domain: string;
  public e_MailboxPath: string;
  public e_MailboxStand: boolean;
  public e_Subscribed: boolean;
  public e_Flags: number;

  /**
   * The default constructor for the mailbox class
   * 
   * @param data The mailbox data
   */
  public constructor(data: {
    e_Bucket: number,
    e_MessageCount: number,
    e_Domain: string,
    e_MailboxPath: string,
    e_MailboxStand: boolean,
    e_Subscribed: boolean,
    e_Flags: number
  }) {
    this.e_Bucket = data.e_Bucket;
    this.e_MessageCount = data.e_MessageCount;
    this.e_Domain = data.e_Domain;
    this.e_MailboxPath = data.e_MailboxPath;
    this.e_MailboxStand = data.e_MailboxStand;
    this.e_Subscribed = data.e_Subscribed;
    this.e_Flags = data.e_Flags;
  }

  /**
   * Creates an mailbox from the raw data
   * 
   * @param map The map of raw data
   */
  public static fromMap = (map: any): Mailbox => {
    return new Mailbox({
      e_Bucket: map['e_bucket'],
      e_MessageCount: map['e_message_count'],
      e_Domain: map['e_domain'],
      e_MailboxPath: map['e_mailbox_path'],
      e_MailboxStand: map['e_mailbox_stand'],
      e_Subscribed: map['e_subscribed'],
      e_Flags: map['e_flags']
    });
  };

  /**
   * Gets an icon for the mailbox
   */
  public getIcon = (): any => {
    if ((this.e_Flags & MailboxFlags.Archive) === MailboxFlags.Archive)
    { // -> Is Archive
      return <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/></svg>;
    } else if ((this.e_Flags & MailboxFlags.Draft) === MailboxFlags.Draft)
    { // -> Is draft
      return <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M21.99 8c0-.72-.37-1.35-.94-1.7L12 1 2.95 6.3C2.38 6.65 2 7.28 2 8v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2l-.01-10zM12 13L3.74 7.84 12 3l8.26 4.84L12 13z"/></svg>;
    } else if ((this.e_Flags & MailboxFlags.Trash) === MailboxFlags.Trash)
    { // -> Is trash
      return <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>;
    } else if ((this.e_Flags & MailboxFlags.Junk) === MailboxFlags.Junk)
    { // -> Is spam
      return <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M14.59 8L12 10.59 9.41 8 8 9.41 10.59 12 8 14.59 9.41 16 12 13.41 14.59 16 16 14.59 13.41 12 16 9.41 14.59 8zM12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>;
    } else if ((this.e_Flags & MailboxFlags.Sent) === MailboxFlags.Sent)
    { // -> Is sent
      return <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>;
    } else if (this.e_MailboxPath === 'INBOX')
    { // -> Is inbox
      return <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 3H4.99c-1.11 0-1.98.89-1.98 2L3 19c0 1.1.88 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.11-.9-2-2-2zm0 12h-4c0 1.66-1.35 3-3 3s-3-1.34-3-3H4.99V5H19v10z"/></svg>;
    } else
    { // -> Just something else
      return <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>;
    }
  };

  /**
   * Gets an human readable mailbox name
   */
  public getName = (): string => {
    const path: string = this.e_MailboxPath;

    // Checks if we're dealing with a inbox sub folder, if not
    //  just return full path
    if (path.substring(0, 5) === 'INBOX')
    {
      // Checks if it is the initial folder, if so return Inbox
      //  else return it without the inbox prefix
      let result: string;
      if ((result = path.substr(6)) !== '') return result;
      else return 'Inbox';
    } else return path;
  }
}
