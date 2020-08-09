import React from 'react';
import RandomIDComponent from '../RandomIDComponent.component';
import cnames from 'classnames';

import './FormField.styles.scss';

interface FormFieldProps {
  onChange: (e: Event) => {},
  type: string,
  required: boolean,
  value: string,
  name: string,
  error?: string
};

export default class FormField extends RandomIDComponent {
  public constructor(props: FormFieldProps) {
    super(props);
  }

  public render = (): any => {
    const { randomID } = this.state;
    const { type, required, onChange, label, value, name, error } = this.props;
    const classnames = cnames({
      'form-field': true,
      'form-field_invalid': !!error
    });

    return ( 
      <div className={classnames}>
        <div className="form-field__flexarea">
          <label className="form-field__label" htmlFor={randomID}>{label}{required ? <span>*</span> : null}</label>
          <input className="form-field__input" id={randomID} type={type} name={name} value={value} onChange={onChange} />
        </div>
        <p className="form-field__error">{error}</p>
      </div> 
    );
  };
}