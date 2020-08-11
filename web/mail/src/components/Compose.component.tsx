import React from 'react';
import { Editor, EditorState } from 'draft-js';

interface ComposeProps {

}

class Compose extends React.Component<any, any> {
  public constructor(props: ComposeProps) {
    super(props);
  }

  public render = (): any => {
    return (
      <div className="compose">
        <div className="compose__head">

        </div>
        <div className="compose__targets">
          
        </div>
        <div className="compose__editor">

        </div>
        <div className="compose__buttons">

        </div>
      </div>
    );
  };
}
