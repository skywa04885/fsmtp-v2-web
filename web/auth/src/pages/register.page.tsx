import React, { FormEvent } from 'react';
import FormField from '../components/form/FormField.component';
import DefaultButton from '../components/buttons/DefaultButton.component';

import FannstIcon from '../static/fannst-icon.png';

interface LoginPageProps {

};

export default class LoginPage extends React.Component<any, any> {
  state: {
    username: string,
    password: string,
    full_name: string,
    birth_date: string,
    recovery_email: string,
    errors: {
      username: any,
      password: any,
      full_name: any,
      birth_date: any,
      recovery_email: any
    }
  };

  public constructor(props: LoginPageProps)
  {
    super(props);

    this.state = {
      username: '',
      password: '',
      full_name: '',
      birth_date: '',
      recovery_email: '',
      errors: {
        username: '',
        password: '',
        full_name: '',
        birth_date: '',
        recovery_email: ''
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
        else errors.password = null;
        break; 
      case 'full_name':
        if (value.length === 0 ) errors.full_name = 'Please enter your name';
        else if (value.length < 5) errors.full_name = 'Please enter more than 5 chars';
        else errors.full_name = null;
        break;
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
    const { username, password, errors, full_name, recovery_email, birth_date } = this.state;
    const valid: boolean = errors.username === null && errors.password === null;

    return (
      <React.Fragment>
        <form onSubmit={this.onSubmit}>
          <fieldset>
            <legend>Register</legend>
            <p>Create your new Fannst-Account</p>

            <FormField
              onChange={this.onChange}
              error={errors.full_name}
              required value={full_name}
              name="full_name"
              label="Full name"
              type="text"
            />
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
            <FormField
              onChange={this.onChange}
              error={errors.birth_date}
              required value={birth_date}
              name="birth_date"
              label="Birth Date"
              type="date"
            />
            <FormField
              onChange={this.onChange}
              error={errors.recovery_email}
              value={recovery_email}
              name="recovery_email"
              label="Recovery email"
              type="email"
            />
            <hr />
            <DefaultButton type="submit" active={valid}>Register</DefaultButton>
          </fieldset>
        </form>
      </React.Fragment>
    );
  };
};
