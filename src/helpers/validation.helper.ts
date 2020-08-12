import revalidator from 'revalidator';
import restify from 'restify'
import errors from 'restify-errors';

const validateRequest = (
  req: restify.Request, res: restify.Response,
  next: restify.Next, options: any
): boolean => {
  // Checks if there is an request body at all
  if (!req.body)
  {
    next(new errors.InvalidArgumentError(
      {}, 
      'Please specify message body'
    ));
    return false;
  }

  // Validates the body, and if valid just return true
  const validation = revalidator.validate(req.body, options);
  if (validation.valid) return true;

  // Builds the error string, and adds an comma after each error
  let errorString: string = '';
  validation.errors.forEach(error => {
    errorString += `${error.property}: ${error.message}, `;
  });

  // Sends the error to the client, and returns false so we will not
  //  continue any more with the further request 
  console.log(errorString);
  next(new errors.InvalidArgumentError({
    info: {
      status: false,
      message: errorString.substr(0, errorString.length - 2)
    }
  }))
  return false;
};

export { validateRequest };