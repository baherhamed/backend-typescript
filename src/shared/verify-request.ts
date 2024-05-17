import { Request, Response } from 'express';
import { Token, User } from '../interfaces';

import jwt, { JwtPayload } from 'jsonwebtoken';

import browser from 'browser-detect';
import { responseLanguage, responseMessages, setRequestLanguage } from '.';
import isJwtTokenExpired from 'jwt-check-expiry';

export const verifyJwtToken = async (
  req: Request,
  res: Response,
  next: () => void,
) => {
  const language = await setRequestLanguage(req);

  try {
    const ip = req.ip?.split('fff:');
    const userAgent = req.headers['user-agent'];

    const ipAddress = ip![1];
    if (!req.headers.authorization) {
      const message = await responseLanguage(
        language,
        responseMessages.authorizationData,
      );
      return res.send({
        success: false,
        message,
      });
    }

    if (!userAgent) {
      const message = await responseLanguage(
        language,
        responseMessages.userAgentData,
      );
      return res.send({
        success: false,
        message,
      });
    }

    try {
      // console.log('headers', req.headers);
      // console.log('headers', req.headers);

      const token = req.headers['authorization'];
      const jwtPayload = token.split('Bearer ')[1];
      const isExpired = isJwtTokenExpired(jwtPayload);

      const decoded = jwt.verify(
        jwtPayload,
        String(process.env.ACCESS_TOKEN_SECRET),
      ) as JwtPayload;
      //  what happed when token not expired

      if (isExpired) {
        const message = await responseLanguage(
          language,
          responseMessages.authorizationData,
        );
        return res.status(200).send({
          success: false,
          message,
        });
      }

      const validateExisitToken = await Token.findOne({ token: jwtPayload });

      if (!validateExisitToken || !validateExisitToken.active) {
        const message = await responseLanguage(
          language,
          responseMessages.authorizationData,
        );
        return res.status(200).send({
          status: 401,
          success: false,
          message,
        });
      }

      if (!isExpired && decoded) {
        const requestBrowser = browser(req.headers['user-agent']);
        const selectedUser = await User.findOne({
          _id: decoded.userId,
          active: true,
          deleted: false,
        });

        let isAdmin = false;
        let isDeveloper = false;
        if (selectedUser?.isAdmin) {
          isAdmin = true;
        }
        if (selectedUser?.isDeveloper) {
          isDeveloper = true;
        }
        if (selectedUser) {
          const requestInfo = {
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
            userId: selectedUser._id,
            language,
            date: new Date(),
            isAdmin,
            isDeveloper,
          };
          req.body['requestInfo'] = requestInfo;
          next();
        } else {
          const message = await responseLanguage(
            language,
            responseMessages.authorizationData,
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
        language,
        responseMessages.authorizationData,
      );

       res
        .statusCode= 401;
        res
        .send({
          success: false,
          message,
        })
        return res
        // .status(401);
    }
  } catch (error) {
    return console.log(`Verify Request ${error}`);
  }
};
