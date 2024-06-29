import { Request, Response } from 'express';
import { logger, responseLanguage, responseMessages, site } from '..';
import { User } from '../../interfaces';

export const checkUserPermission = async (
  req: Request,
  res: Response,
  permission: string,
) => {
  const request = req.body.requestInfo;
  const selectedUser = await User.findOne({
    _id: request.userId,
    active: true,
    deleted: false,
  });
  if (selectedUser && selectedUser.permissionsList.includes(permission)) {
    return true;
  } else {
    const message = await responseLanguage(
      request.language,
      responseMessages.pemissionNotAllowed,
    );
    logger(req, message);
    res.send({
      success: false,
      statusCode: site.responseStatusCodes.unauthorized,
      message,
    });
  }
};
