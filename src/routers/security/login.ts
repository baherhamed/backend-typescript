import express, { Request, Response } from 'express';

import jwt, { JwtPayload } from 'jsonwebtoken';
import browser from 'browser-detect';
import bcrypt from 'bcrypt';
import {
  checkUserLogin,
  handleLoginFailResponse,
  handleLoginSuccessResponse,
  handleValidateData,
  hashString,
  inputsLength,
  responseLanguage,
  responseMessages,
  setRequestLanguage,
  site,
  Token,
} from '../../shared';
import { User } from '../../interfaces';

const login = async (req: Request, res: Response) => {
  const requestLanguage = await setRequestLanguage(req);
  const request = req.body;
  request.language = requestLanguage;
  const checkData = await validateData(req, res);
  if (!checkData?.valid) return;

  const findUser = {
    $or: [
      {
        mobile: request.username,
      },
      {
        email: request.username,
      },
      {
        name: request.username,
      },
    ],
    active: true,
    deleted: false,
  };

  const foundUser = await User.findOne(findUser);

  if (!foundUser) {
    return handleLoginFailResponse({ language: requestLanguage }, res);
  }

  const checkPassword = await bcrypt.compare(
    request.password,
    String(Object(foundUser).password),
  );

  if (!checkPassword) {
    return handleLoginFailResponse({ language: requestLanguage }, res);
  }

  const user = {
    userId: Object(foundUser)?._id,
    name: Object(foundUser)?.name,
    isAdmin: Object(foundUser)?.isAdmin,
    isDeveloper: Object(foundUser)?.isDeveloper,
  };

  const token = jwt.sign(user, String(process.env.ACCESS_TOKEN_SECRET), {
    expiresIn: '10h',
  });

  const decode = jwt.decode(token, { complete: true }) as JwtPayload;
  const requestBrowser = browser(req.headers['user-agent']);
  const ip = req.ip?.split('fff:');
  const userAgent = req.headers['user-agent'];
  const ipAddress = ip![1];
  Token.findOneAndUpdate(
    { userId: user.userId, active: true },
    {
      active: false,
      deactivateInfo: {
        userId: Object(foundUser)?._id,
        userAgent,
        browser: {
          name: requestBrowser.name,
          version: requestBrowser.version,
          mobile: requestBrowser.mobile,
        },
        os: {
          name: requestBrowser.os,
        },
        ipAddress,
        language: request.language,
        date: new Date(),
        isAdmin: Object(foundUser)?.isAdmin,
        isDeveloper: Object(foundUser)?.isDeveloper,
      },
    },
  );

  const newToken = new Token({
    token,
    userId: user.userId,
    name: user.name,
    isAdmin: user.isAdmin,
    isDeveloper: user.isDeveloper,
    signature: decode?.signature,
    createdOn: new Date(decode.payload.iat * 1000),
    expiredOn: new Date(decode.payload.exp * 1000),
    active: true,
  });
  await newToken.save();
  const routesList = Object(foundUser)?.routesList;
  const permissionsList = Object(foundUser)?.permissionsList;
  const hasedRoutesList = (await hashString(routesList.toString())).hashedText;
  const hasedPermissionsList = (await hashString(permissionsList.toString()))
    .hashedText;

  const data = {
    token,
    routesList: hasedRoutesList,
    permissionsList: hasedPermissionsList,
    language: Object(foundUser?.languageId).name,
  };
  handleLoginSuccessResponse({ language: requestLanguage, data }, res);
};

const isLogin = async (req: Request, res: Response) => {
  checkUserLogin(req, res);
};

const validateData = async (req: Request, res: Response) => {
  const request = req.body;
  const userName = request.username;
  const userPassword = request.password;
  const requestLanguage = request.language;
  let valid = false;
  let message;

  if (!userName) {
    message = await responseLanguage(
      requestLanguage,
      responseMessages.username,
    );
  } else if (!userPassword || userPassword.length < inputsLength.password) {
    message = await responseLanguage(
      requestLanguage,
      responseMessages.password,
    );
  } else {
    valid = true;
    message = await responseLanguage(requestLanguage, responseMessages.valid);
  }
  if (!valid) {
    handleValidateData({ language: requestLanguage, res, message });
  } else {
    return { valid };
  }
};

const loginRouters = (app: express.Application) => {
  app.post(`${site.api}${site.apps.login}`, login);
  app.post(`${site.api}${site.apps.login}/isLogin`, isLogin);
};

export default loginRouters;
