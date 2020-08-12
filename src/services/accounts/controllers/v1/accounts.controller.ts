import restify from 'restify';
import errors from 'restify-errors';
import { Bearer } from '../../../../helpers/bearer.helper';
import { Account } from '../../../../models/accounts/account.model';

export namespace Controllers
{
  export const GET_GetAccount = (
    req: restify.Request, res: restify.Response, 
    next: restify.Next
  ) => {
    Bearer.authRequest(req, res, next).then(authObject => {
      Account.get(authObject.bucket, authObject.domain, authObject.uuid).then(account => {
        res.json({
          a_username: account.a_Username,
          a_full_name: account.a_FullName,
          a_birth_date: account.a_BirthDate,
          a_creation_date: account.a_CreationDate,
          a_domain: account.a_Domain,
          a_bucket: account.a_Bucket,
          a_gas: account.a_Gas,
          a_address: account.a_Address,
          a_country: account.a_Country,
          a_region: account.a_Region,
          a_city: account.a_City,
          a_phone: account.a_Phone,
          a_flags: account.a_Flags,
          a_uuid: account.a_UUID,
          a_storage_used_in_bytes: account.a_StorageUsedInBytes,
          a_storage_max_in_bytes: account.a_StorageMaxInBytes,
          a_type: account.a_Type,
          a_picture_uri: account.a_PictureURI
        });
      }).catch(err => new errors.InternalServerError({}, err.toString()));
    }).catch(err => {});
  }
}