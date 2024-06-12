
import { Response } from 'express';
import {
  IHandleAddResponse,
  IHandleDeleteResponse,
  IHandleError,
  IHandleExisitData,
  IHandleGetActiveResponse,
  IHandleGetAllResponse,
  IHandleGlobalSettingResponse,
  IHandleLoginFailResponse,
  IHandleLoginSuccessResponse,
  IHandleLogoutResponse,
  IHandleNoData,
  IHandleSearchResponse,
  IHandleUnauthorization,
  IHandleUpdateResponse,
  IHandleValidateData,
  IHandleViewResponse,
  IUserLogin,
} from '../interfaces';
import { responseLanguage } from '.';
import { responseMessages, site } from '..';


export const handleError = async (data: IHandleError) => {
  const message = data.message ? data.message : responseMessages.invalidData;

  return data.res.send({
    success: false,
    statusCode: site.responseStatusCodes.error,
    message,
  });
};

export const handleNoData = async (data: IHandleNoData) => {
  const message = await responseLanguage(
    data.language,
    responseMessages.noData,
  );
  return {
    success: false,
    statusCode: site.responseStatusCodes.noData,
    message,
  };
};

export const handleExisitData = async (data: IHandleExisitData) => {
  const message = await responseLanguage(data.language, data.message);
  return {
    success: false,
    statusCode: site.responseStatusCodes.exisit,
    message,
  };
};

export const handleUnauthorization = async (data: IHandleUnauthorization) => {
  const message = await responseLanguage(
    data.language,
    responseMessages.authorizationData,
  );
  return data.res.send({
    success: false,
    statusCode: site.responseStatusCodes.unauthorized,
    message,
  });
};

export const handleValidateData = async (data: IHandleValidateData) => {
  const message = data.message
    ? data.message
    : await responseLanguage(data.language, responseMessages.missingId);
  return data.res.send({
    success: false,
    statusCode: site.responseStatusCodes.missingData,
    message,
  });
};

export const handleAddResponse = async (
  result: IHandleAddResponse,
  res: Response,
) => {
  const message = await responseLanguage(
    result.language,
    responseMessages.saved,
  );
  return res.send({
    success: true,
    statusCode: site.responseStatusCodes.add,
    message,
    data: result.data,
  });
};

export const handleUpdateResponse = async (
  result: IHandleUpdateResponse,
  res: Response,
) => {
  const message = await responseLanguage(
    result.language,
    responseMessages.updated,
  );

  return res.send({
    success: true,
    statusCode: site.responseStatusCodes.update,
    message,
    data: result.data,
  });
};

export const handleDeleteResponse = async (
  result: IHandleDeleteResponse,
  res: Response,
) => {
  const message = await responseLanguage(
    result.language,
    responseMessages.deleted,
  );
  return res.send({
    success: true,
    statusCode: site.responseStatusCodes.delete,
    message,
    data: result.data,
  });
};

export const handleGetAllResponse = async (
  result: IHandleGetAllResponse,
  res: Response,
) => {
  const message = await responseLanguage(
    result.language,
    responseMessages.done,
  );
  return res.send({
    success: true,
    statusCode: site.responseStatusCodes.getAll,
    message,
    data: result.data,
    paginationInfo: site.pagination(result.paginationInfo),
  });
};

export const handleSearchResponse = async (
  result: IHandleSearchResponse,
  res: Response,
) => {
  const message = await responseLanguage(
    result.language,
    responseMessages.done,
  );
  return res.send({
    success: true,
    statusCode: site.responseStatusCodes.search,
    message,
    data: result.data,
    paginationInfo: site.pagination(result.paginationInfo),
  });
};

export const handleGetActiveResponse = async (
  result: IHandleGetActiveResponse,
  res: Response,
) => {
  const message = await responseLanguage(
    result.language,
    responseMessages.done,
  );
  return res.send({
    success: true,
    statusCode: site.responseStatusCodes.getActive,
    // message,
    data: result.data,
  });
};

export const handleViewResponse = async (
  result: IHandleViewResponse,
  res: Response,
) => {
  const message = await responseLanguage(
    result.language,
    responseMessages.done,
  );
  return res.send({
    success: true,
    statusCode: site.responseStatusCodes.getActive,
    // message,
    data: result.data,
  });
};

export const handleLoggedOutResponse = async (
  result: IHandleLogoutResponse,
  res: Response,
) => {
  const message = await responseLanguage(
    result.language,
    responseMessages.loggedout,
  );
  return res.send({
    success: true,
    statusCode: site.responseStatusCodes.loggedOut,
    message,

  });
};

export const handleLoginFailResponse = async (
  result: IHandleLoginFailResponse,
  res: Response,
) => {
  const message = await responseLanguage(
    result.language,
    responseMessages.validateLogin,
  );
  return res.send({
    success: false,
    statusCode: site.responseStatusCodes.loggedInFail,
    message,

  });
};

export const handleLoginSuccessResponse = async (
  result: IHandleLoginSuccessResponse,
  res: Response,
) => {
  const message = await responseLanguage(
    result.language,
    responseMessages.authorized,
  );
  return res.send({
    success: true,
    statusCode: site.responseStatusCodes.loggedInSuccess,
    message, data: result.data,

  });
};

export const handleGlobalSettingResponse = async (
  result: IHandleGlobalSettingResponse,
  res: Response,
) => {
  const message = await responseLanguage(
    result.language,
    responseMessages.done,
  );
  return res.send({
    success: true,
    statusCode: site.responseStatusCodes.globalSetting,
    // message,
    data: result.data,
  });
};

export const handleUserLoginResponse = async (
  result: IUserLogin,
  res: Response,
) => {
  const { success } = result;
  return res.send(success);
};
