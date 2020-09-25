import React, { FormEvent } from 'react';
import FormField from '../components/form/FormField.component';
import DefaultButton from '../components/buttons/DefaultButton.component';
import axios from 'axios';
import Config from '../Config';

import FannstIcon from '../static/fannst-icon.png';

interface LoginPageProps {
  showLoader: (message: string) => {},
  hideLoader: () => {}
};

export default class LoginPage extends React.Component<any, any> {
  public state: {
    username: string,
    password: string,
    password_confirm: string,
    full_name: string,
    birth_date: string,
    recovery_email: string,
    errors: {
      username: any,
      password: any,
      password_confirm: any,
      full_name: any,
      birth_date: any,
      recovery_email: any
    },
    error: any
  };

  public constructor(props: LoginPageProps)
  {
    super(props);

    this.state = {
      username: '',
      password: '',
      password_confirm: '',
      full_name: '',
      birth_date: '',
      recovery_email: '',
      errors: {
        username: '',
        password: '',
        password_confirm: '',
        full_name: '',
        birth_date: '',
        recovery_email: ''
      },
      error: null
    };
  }

  public onSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Checks if the form is valid, if so proceed to show
    //  the loader to the user
    if (!this.valid()) return;
    this.props.showLoader('Creating your account ...');

    // Prepares the fields, headers etcetera
    const { username, password, full_name, birth_date, recovery_email } = this.state;
    const fields: any = Object.assign(
      {username, password, full_name, birth_date}, 
      recovery_email === '' ? null : {recovery_email}
    );
    const url: string = Config.buildURI('/auth/register');
    const config: any = {
      headers: {
        'accept-version': Config.apiVersion
      }
    };

    // Gets the data and sends the axios request, with the currently supported
    //  api version specified in the config.
    axios.post(url, fields, config).then(response => {
      this.props.hideLoader();

      // Checks if the request was successfull, if so redirect to the login page
      //  else we will display the error message
      if (response.status === 200 && response.data.status)
        this.props.history.push('/login');
      else
        this.setState({
          error: `${response.status}: ${response.data.message}`
        })
    }).catch(err => {
      this.props.hideLoader();
      this.setState({
        error: err.toString()
      });
    });
  };

  public componentDidMount = () => {
    Config.setTitle('Register');
  };

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
        else if (value.length < 8) errors.password = 'Please enter more than 8 chars';
        else errors.password = null;
        break; 
      case 'password_confirm':
        if (value.length === 0 ) errors.password_confirm = 'Please confirm your password';
        else if (value.length < 12) errors.password_confirm = 'Please enter more than 12 chars';
        else errors.password_confirm = null;
        break; 
      case 'full_name':
        if (value.length === 0 ) errors.full_name = 'Please enter your name';
        else if (value.length < 5) errors.full_name = 'Please enter more than 5 chars';
        else errors.full_name = null;
        break;
      case 'birth_date':
        if (value.length === 0 ) errors.full_name = 'Please enter your birth date';
        errors.birth_date = null;
        break;
      default: break;
    }

    // Sets the new state with the username and password errors there
    this.setState({
      errors, 
      [name]: value
    });
  };

  private valid = (): boolean => {
    const { errors } = this.state;
    return errors.username === null && errors.password === null && 
      errors.full_name === null && errors.birth_date === null && errors.password_confirm === null;
  }

  public render = (): any =>
  {
    const { error, username, password, password_confirm, errors, full_name, recovery_email, birth_date } = this.state;
    const valid: boolean = this.valid();

    return (
      <React.Fragment>
        <form onSubmit={this.onSubmit}>
          <fieldset>
            <legend>Register</legend>
            <p>Create your new Fannst-Account</p>

            {error ? (
              <div className="form__error">
                <p>
                  <strong>An error occured: </strong>
                  <br />
                  {error}
                </p>
              </div>
            ) : null}

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
            <FormField
              onChange={this.onChange}
              error={errors.password_confirm}
              required value={password_confirm}
              name="password_confirm"
              label="Confirm"
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
            <DefaultButton type="submit" active={valid}>Register</DefaultButton>
          </fieldset>
        </form>
      </React.Fragment>
    );
  };
};
