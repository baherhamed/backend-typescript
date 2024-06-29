import { Response } from 'express';
import { IMessageLanguage } from '.';
export interface IHandleError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: any;
  message: string;
  res: Response;
}

export interface IHandleNoData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: any;
  language: string;
}

export interface IHandleExisitData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: any;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: any;
  language: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export interface IHandleUpdateResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: any;
  language: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export interface IHandleDeleteResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: any;
  language: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export interface IHandleGetAllResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: any;
  language: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paginationInfo: any;
}

export interface IHandleGetActiveResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: any;
  language: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export interface IHandleSearchResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: any;
  language: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paginationInfo: any;
}

export interface IHandleViewResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: any;
  language: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export interface IHandleLogoutResponse {
  language: string;
}

export interface IHandleLoginFailResponse {
  language: string;
}

export interface IHandleLoginSuccessResponse {
  language: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export interface IHandleGlobalSettingResponse {
  language: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export interface IUserLogin {
  success: boolean;
}
