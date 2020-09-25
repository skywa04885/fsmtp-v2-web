import React, { FormEvent } from 'react';
import FormField from '../components/form/FormField.component';
import DefaultButton from '../components/buttons/DefaultButton.component';
import axios from 'axios';
import Config from '../Config';
import cookie from 'react-cookies';

interface LoginPageProps {

};

export default class LoginPage extends React.Component<any, any> {
  state: {
    username: any,
    password: any,
    errors: {
      username: any,
      password: any
    },
    error: string
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
      },
      error: ''
    };
  }

  public onSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Checks if the form is valid, and shows the loader
    if (!this.valid()) return;
    this.props.showLoader('Loggin in, please wait ...');

    // Prepares the form fields, like headers, body etcetera
    //  which will be sent to the server
    const { username, password } = this.state;
    let domain = 'fannst.nl';
    let finalUsername = username;
    if (username.indexOf('@') != -1) {
      domain = username.substring(username.indexOf('@') + 1, username.length);
      finalUsername = username.substring(0, username.indexOf('@'));
    }
    const fields = { username: finalUsername, domain, password };
    const url: string = Config.buildURI('/auth/login');
    const config: any = {
      headers: {
        'accept-version': Config.apiVersion
      }
    };

    // Sends the http request, and waits for an server response
    axios.post(url, fields, config).then(response => {
      this.props.hideLoader();

      // Checks if the response was successfull, if so redirect
      //  to the fannst mail service, else show error
      if (response.status === 200 && response.data.status)
      {
        cookie.save('sess-bearer', response.data.bearer, {
          path: '/'
        });
        window.location.href = '/mail/inbox';
      } else
        this.setState({
          error: `${response.status}: ${response.data.message}`
        })
    }).catch(err => {
      this.props.hideLoader();
      this.setState({
        error: err.toString()
      });
    });
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
        else if (value.length < 8) errors.password = 'Please enter more than 8 chars';
        else errors.password = null;
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
    return errors.username === null && errors.password === null;
  }

  public componentDidMount = () => {
    Config.setTitle('Login');
  };

  public render = (): any =>
  {
    const { error, username, password, errors } = this.state;
    const valid: boolean = this.valid();

    return (
      <React.Fragment>
        <form onSubmit={this.onSubmit}>
          <fieldset>
            <legend>Login</legend>
            <p>Login to your Fannst-Account</p>

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
            <DefaultButton type="submit" active={valid}>Login</DefaultButton>
          </fieldset>
        </form>
      </React.Fragment>
    );
  };
};
