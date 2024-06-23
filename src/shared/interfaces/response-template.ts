import { Response } from 'express';
import { IMessageLanguage } from '.';
export interface IHandleError {
  message: string;
  res: Response;
}

export interface IHandleNoData {
  language: string;
}

export interface IHandleExisitData {
  language: string;
  message: IMessageLanguage;
}

export interface IHandleUnauthorization {
  language: string;
  res: Response;
}

export interface IHandleValidateData {
  language: string;
  res: Response;
  message?: string;
}

export interface IHandleAddResponse {
  language: string;
  data: {};
}

export interface IHandleUpdateResponse {
  language: string;
  data: {};
}

export interface IHandleDeleteResponse {
  language: string;
  data: {};
}

export interface IHandleGetAllResponse {
  language: string;
  data: any;
  paginationInfo: any;
}

export interface IHandleGetActiveResponse {
  language: string;
  data: any;
}

export interface IHandleSearchResponse {
  language: string;
  data: any;
  paginationInfo: any;
}

export interface IHandleViewResponse {
  language: string;
  data: {};
}

export interface IHandleLogoutResponse {
  language: string;
}

export interface IHandleLoginFailResponse {
  language: string;
}

export interface IHandleLoginSuccessResponse {
  language: string;
  data: {};
}

export interface IHandleGlobalSettingResponse {
  language: string;
  data: {};
}

export interface IUserLogin {
  success: Boolean;
}
