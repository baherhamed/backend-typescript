import { Request, Response } from 'express';


import jwt, { JwtPayload } from 'jsonwebtoken';

import browser from 'browser-detect';
import {
  handleError,
  handleUnauthorization,
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
    if (!req.headers.authorization) {
      handleUnauthorization({ language, res });
    }

    if (!userAgent) {
      handleUnauthorization({ language, res });
    }

    try {
      // console.log('headers', req.headers);
      // console.log('headers', req.headers);

      const token = req.headers['authorization'];
      if (!token) {
        handleUnauthorization({ language, res });
      }

      const jwtPayload = token!.split('Bearer ')[1];
      const isExpired = isJwtTokenExpired(jwtPayload);

      const decoded = jwt.verify(
        jwtPayload,
        String(process.env.ACCESS_TOKEN_SECRET),
      ) as JwtPayload;
      //  what happed when token not expired

      if (isExpired) {
        handleUnauthorization({ language, res });
      }

      const validateExisitToken = await Token.findOne({ token: jwtPayload });

      if (!validateExisitToken || !validateExisitToken.active) {
        handleUnauthorization({ language, res });
      }

      // if (!isExpired && decoded) {
      // const requestBrowser = browser(req.headers['user-agent']);
      const selectedUser = await User.findOne({
        _id: decoded.userId,
        active: true,
        deleted: false,
      });

      // let isAdmin = false;
      // let isDeveloper = false;
      // if (selectedUser?.isAdmin) {
      //   isAdmin = true;
      // }
      // if (selectedUser?.isDeveloper) {
      //   isDeveloper = true;
      // }
      // if (selectedUser) {
      //   const requestInfo = {
      //     userAgent,
      // browser: {
      //   name: requestBrowser.name,
      //   version: requestBrowser.version,
      //   mobile: requestBrowser.mobile,
      // },
      // os: {
      //   name: requestBrowser.os,
      // },
      //     ipAddress,
      //     userId: selectedUser._id,
      //     language,
      //     date: new Date(),
      //     isAdmin,
      //     isDeveloper,
      //   };
      // req.body['requestInfo'] = requestInfo;
      req.body['requestInfo'] = { userAgent, ipAddress, userId: selectedUser?._id, language, date: new Date(), isAdmin: selectedUser?.isAdmin };
      next();
      // }
      // }
    } catch (error) {
      console.log(`Verify Request 123=> No Authorization ${error}`);
      handleUnauthorization({ language, res });
    }
  } catch (error) {
    return console.log(`Verify Request ${error}`);
  }
};
