import { Request, Response } from 'express';
import { User } from '../models';

import jwt, { JwtPayload } from 'jsonwebtoken';

import browser from 'browser-detect';
import { responseLanguage, responseMessages, setRequestLanguage } from '.';

interface RequestInfo {
  browser: {
    name: string | undefined;
    version: string | undefined;
    mobile: boolean | undefined;
  };
  os: {
    name: string | undefined;
  };
  ip_address: string | undefined;
  user_id: string | undefined;
  language: string;
  date: Date;
}
export const verifyJwtToken = async function (
  req: Request,
  res: Response,
  next: () => void
) {
  const requestLanguage = await setRequestLanguage(req);

  try {
    const ip = req.ip.split('fff:');
    const ua = req.headers['user-agent'];
    const ip_address = ip[1];

    if (!req.headers.authorization) {
      const message = await responseLanguage(
        requestLanguage,
        responseMessages.authorizationData
      );
      return res.send({
        success: false,
        message,
      });
    }
    if (!ua) {
      const message = await responseLanguage(
        requestLanguage,
        responseMessages.userAgentData
      );
      return res.send({
        success: false,
        message,
      });
    }

    try {
      const token = req.headers['authorization'];

      const jwtPayload = token.split('Bearer ')[1];
      const decoded = jwt.verify(
        jwtPayload,
        String(process.env.ACCESS_TOKEN_SECRET)
      ) as JwtPayload;
      //   //  what happed when token not expired
      if (decoded) {
        const request_browser = browser(req.headers['user-agent']);
        const selectedUser = await User.findOne({
          _id: decoded.userId,
          active: true,
          deleted: false,
        });

        if (selectedUser) {
          const requestInfo: RequestInfo = {
            browser: {
              name: request_browser.name,
              version: request_browser.version,
              mobile: request_browser.mobile,
            },
            os: {
              name: request_browser.os,
            },
            ip_address,
            user_id: String(selectedUser._id),
            language: requestLanguage || 'en',
            date: new Date(),
          };
          req.body['requestInfo'] = requestInfo;
          next();
        } else {
          const message = await responseLanguage(
            requestLanguage,
            responseMessages.authorizationData
          );
          return res
            .send({
              success: false,
              message,
            })
            .status(401);
        }
      }
    } catch (error) {
      console.log(`Verify Request => No Authorization ${error}`);
      const message = await responseLanguage(
        requestLanguage,
        responseMessages.authorizationData
      );
      return res
        .send({
          success: false,
          message,
        })
        .status(401);
    }
  } catch (error) {
    console.log(`Verify Request ${error}`);
  }
};
