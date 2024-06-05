
import { Request, Response } from 'express';
import {  responseLanguage, responseMessages, site } from '..';
import { User } from '../../interfaces';

export const checkUserRoutes = async (
  req: Request,
  res: Response,
  route: string,
) => {
  const request = req.body.requestInfo;
  const selectedUser = await User.findOne({
    _id: request.userId,
    active: true,
    deleted: false,
  });
  if (selectedUser && selectedUser.routesList.includes(route)) {
    return true;
  } else {
    const message = await responseLanguage(
      request.language,
      responseMessages.routeNotAllowed,
    );
     res.send({
      success: false,
      statusCode: site.responseStatusCodes.unauthorized,
      message,
    });
  }
};
