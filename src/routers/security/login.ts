import express, { Request, Response } from 'express';

import { User } from '../../models';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {
  inputsLength,
  responseMessages,
  setRequestLanguage,
  responseLanguage,
  definitions,
} from '../../shared';

const login = async (req: Request, res: Response) => {
  const requestLanguage = await setRequestLanguage(req);
  const request = req.body;
  request['language'] = requestLanguage;
  const checkData = await validateData(req);

  if (!checkData.valid) {
    return res
      .send({
        success: false,
        message: checkData.message,
      })
      .status(400);
  }

  const findUser = {
    $or: [
      {
        mobile: request.username,
      },
      {
        email: request.username,
      },
    ],
    active: true,
    deleted: false,
  };
  const foundUser = await User.findOne(findUser);

  if (foundUser) {
    const checkPassword = await bcrypt.compare(
      request.password,
      foundUser.password
    );

    if (!checkPassword) {
      const message = await responseLanguage(
        requestLanguage,
        responseMessages.password
      );
      return res
        .send({
          success: false,
          message,
        })
        .status(400);
    }

    const user = {
      user_id: foundUser._id,
      name: foundUser.name,
      isDeveloper: foundUser?.isDeveloper,
    };

    const token = jwt.sign(user, String(process.env.ACCESS_TOKEN_SECRET), {
      expiresIn: '10h',
    });

    const routesList = foundUser.routesList;
    const permissionsList = foundUser.permissionsList;

    const message = await responseLanguage(
      requestLanguage,
      responseMessages.authorized
    );

    return res
      .send({
        success: true,
        message,
        data: {
          token,
          routesList,
          permissionsList,
          language: Object(foundUser.language_id).name,
        },
      })
      .status(200);
  } else {
    const message = await responseLanguage(
      requestLanguage,
      responseMessages.userNotFound
    );
    return res
      .send({
        success: false,
        message,
      })
      .status(404);
  }
};

async function validateData(req: Request) {
  const request = req.body;
  const userMobile = request.username;
  const userPassword = request.password;
  const requestLanguage = request.language;
  let valid = false;
  let message;

  if (!userMobile || userMobile.length < inputsLength.mobile) {
    message = await responseLanguage(
      requestLanguage,
      responseMessages.username
    );
  } else if (!userPassword || userPassword.length < inputsLength.password) {
    message = await responseLanguage(
      requestLanguage,
      responseMessages.password
    );
  } else {
    valid = true;
    message = await responseLanguage(requestLanguage, responseMessages.valid);
  }
  return {
    valid,
    message,
  };
}

const loginRouters = (app: express.Application) => {
  app.post(`${definitions.api}/security/login`, login);
};

export default loginRouters;
