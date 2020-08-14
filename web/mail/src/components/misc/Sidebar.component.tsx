import React from 'react';

export interface SidebarProps {
};

export class Sidebar extends React.Component<any, any> {
  public constructor(props: SidebarProps) {
    super(props);
  }

  public render = (): any => {
    return (
      <div className="sidebar">
          <div className="sidebar__u">
            <div className="sidebar__ul__li">
              <div className="sidebar__ul__li__">
                <strong>Folders: </strong>
                <div>
                  <button title="Add user defined folder" className="app__sidebar__ul__li__title-btn" type="button">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24"
                      viewBox="0 0 24 24"
                      width="24"
                    >
                      <path d="M0 0h24v24H0z" fill="none"/>
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                    </svg>
                </button>
                </div>
              </div>
            </div>
          </div>
      </div>
    );
  };
}