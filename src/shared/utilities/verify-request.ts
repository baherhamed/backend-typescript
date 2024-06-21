import { Request, Response } from 'express';

import jwt, { JwtPayload } from 'jsonwebtoken';

import {
  handleUnauthorization,
  handleUserLoginResponse,
  setRequestLanguage,
} from '.';
import isJwtTokenExpired from 'jwt-check-expiry';
import { Token, User } from '../../interfaces';

export const verifyJwtToken = async (
  req: Request,
  res: Response,
  next: () => void,
) => {
  const language = await setRequestLanguage(req);

  try {
    const ip = req.ip?.split('fff:');
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.socket.remoteAddress || ip?.[1];
    if (!req.headers?.authorization || !userAgent) {
      handleUnauthorization({ language, res });
    }

    try {
      let token = req.headers?.authorization;

      token = token?.split('Bearer ')[1] || '';

      if (!token) {
        handleUnauthorization({ language, res });
      }

      const isExpired = isJwtTokenExpired(token);

      const decoded = jwt.verify(
        token,
        String(process.env.ACCESS_TOKEN_SECRET),
      ) as JwtPayload;

      if (isExpired) {
        handleUnauthorization({ language, res });
      }

      const validateExisitToken = await Token.findOne({ token });

      if (!validateExisitToken || !validateExisitToken.active) {
        handleUnauthorization({ language, res });
      }

      const selectedUser = await User.findOne({
        _id: decoded.userId,
        active: true,
        deleted: false,
      });

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
      console.log(`Verify Request 123=> No Authorization ${error}`);
      handleUnauthorization({ language, res });
    }
  } catch (error) {
    return console.log(`Verify Request ${error}`);
  }
};

export const checkUserLogin = async (req: Request, res: Response) => {
  try {
    const navToRoute = req.body.navToRoute;
    const language = await setRequestLanguage(req);

    const _id = req.body.userId;

    if (!_id) {
      return handleUnauthorization({ language, res });
    }
    const selectedUser = await User.findOne({
      _id,
      active: true,
      deleted: false,
    });

    if (!selectedUser || !selectedUser?.routesList.includes(navToRoute)) {
      return handleUserLoginResponse({ success: false }, res);
    }
    return handleUserLoginResponse({ success: true }, res);
  } catch (error) {
    console.log('checkUserLogin', error);
  }
};
