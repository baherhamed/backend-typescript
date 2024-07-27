import { Request, Response } from 'express';

import jwt, { JwtPayload } from 'jsonwebtoken';

import {
  handleUnauthorization,
  handleUserLoginResponse,
  logger,
  setRequestLanguage,
} from '.';

import { User } from '../../interfaces';
import { site, Token } from '..';

export const verifyJwtToken = async (
  req: Request,
  res: Response,
  next: () => void,
) => {
  const language = await setRequestLanguage(req);
  try {
    // console.log('path', req.path);
    // console.log('headers', req.headers);

    const ip = req.ip?.split('fff:');
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.socket.remoteAddress || ip?.[1];
    const path = req.path.split(site.api)[1].split('/')[0];
    if (!req.headers?.authorization || !userAgent) {
      const error = `No authorization || no  UserAgent ${path}`;
      logger(req, error);
      handleUnauthorization({ language, res });
    }

    const { authorization } = req.headers;

    const token = authorization?.split('Bearer ')[1] || '';

    if (!token) {
      const error = `No token ${path}`;
      logger(req, error);
      handleUnauthorization({ language, res });
    }

    const decoded = jwt.verify(
      token,
      String(process.env.ACCESS_TOKEN_SECRET),
    ) as JwtPayload;

    const validateExisitToken = await Token.findOne({ token });

    if (!validateExisitToken || !validateExisitToken.active) {
      const error = `User not authorized to access URL ${path}`;
      logger(req, error);
      handleUnauthorization({ language, res });
    }

    const selectedUser = await User.findOne({
      _id: decoded.userId,
      active: true,
      deleted: false,
    });

    if (!selectedUser || !selectedUser?.routesList.includes(path)) {
      const error = `User not authorized to access URL ${path}`;
      logger(req, error);

      return handleUnauthorization({ language, res });
    }
    req.body['requestInfo'] = {
      userAgent,
      ipAddress,
      userId: String(selectedUser?._id),
      language,
      date: new Date(),
      isAdmin: selectedUser?.isAdmin,
    };
    next();
  } catch (error) {
    console.log('Verify  ===> errror', error);
    logger(req, String(error));
    return handleUnauthorization({ language, res });
  }
};

export const checkUserLogin = async (req: Request, res: Response) => {
  try {
    const navToRoute = req.body.navToRoute;
    const language = await setRequestLanguage(req);

    const _id = req.body.userId;
    const ip = req.ip?.split('fff:');
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.socket.remoteAddress || ip?.[1];
    if (!_id) {
      return handleUnauthorization({ language, res });
    }
    const selectedUser = await User.findOne({
      _id,
      active: true,
      deleted: false,
    });

    if (!selectedUser || !selectedUser?.routesList.includes(navToRoute)) {
      const error = `User not authorized to access URL ${navToRoute}`;

      const loggerData = {
        path: '/api/login/isLogin',
        body: {
          requestInfo: {
            ipAddress,
            userAgent,
            userId: _id,
          },
        },
      };
      logger(loggerData, error);
      return handleUserLoginResponse({ success: false }, res);
    }
    return handleUserLoginResponse({ success: true }, res);
  } catch (error) {
    console.log('checkUserLogin', error);
  }
};
