import React, { FormEvent } from 'react';
import FormField from '../components/form/FormField.component';
import DefaultButton from '../components/buttons/DefaultButton.component';

import FannstIcon from '../static/fannst-icon.png';

interface LoginPageProps {

};

export default class LoginPage extends React.Component<any, any> {
  state: {
    username: any,
    password: any,
    errors: {
      username: any,
      password: any
    }
  };

  public constructor(props: LoginPageProps)
  {
    super(props);

    this.state = {
      username: '',
      password: '',
      errors: {
        username: '',
        password: ''
      }
    };
  }

  public onSubmit = (e: FormEvent) => {
    e.preventDefault();
  }

  public onChange = (e: Event) => {
    e.preventDefault();
    const { name, value } = (e.target as HTMLInputElement);
    let errors = this.state.errors;

    // Checks if there are any errors that should be reported to
    //  the user
    switch (name)
    {
      case 'username':
        if (value.length === 0 ) errors.username = 'Please enter a username';
        else if (value.length < 5) errors.username = 'Please enter more than 5 chars';
        else errors.username = null;
        break;
      case 'password':
        if (value.length === 0 ) errors.password = 'Please enter a password';
        else if (value.length < 5) errors.password = 'Please enter more than 5 chars';
        else errors.password = null;        break; 
      default: break;
    }

    // Sets the new state with the username and password errors there
    this.setState({
      errors, 
      [name]: value
    });
  };

  public render = (): any =>
  {
    const { username, password, errors } = this.state;
    const valid: boolean = errors.username === null && errors.password === null;

    return (
      <React.Fragment>
        <form onSubmit={this.onSubmit}>
          <fieldset>
            <legend>Login</legend>
            <p>Login to your Fannst-Account</p>
            
            <FormField
              onChange={this.onChange}
              error={errors.username}
              required value={username}
              name="username"
              label="Username"
              type="text"
            />
            <FormField
              onChange={this.onChange}
              error={errors.password}
              required value={password}
              name="password"
              label="Password"
              type="password"
            />
            <hr />
            <DefaultButton type="submit" active={valid}>Login</DefaultButton>
          </fieldset>
        </form>
      </React.Fragment>
    );
  };
};
