import {
  definitions,
  responseLanguage,
  responseMessages,
  verifyJwtToken,
} from '../../shared';
import express, { Request, Response } from 'express';
import { Language } from '../../models';

const getActiveLanguages = async (req: Request, res: Response) => {
  const requestInfo = req.body.requestInfo;

  try {
    const query = {
      active: true,
      deleted: false,
    };

    const result = await Language.find(query);

    if (!result.length) {
      const message = await responseLanguage(
        requestInfo.language,
        responseMessages.noData
      );

      return res
        .send({
          success: false,
          message,
        })
        .status(200);
    }

    const data = [];
    for await (const doc of result) {
      data.push({
        _id: doc._id,
        name: doc.name,
        add_info: requestInfo.isAdmin ? doc.add_info : undefined,
        last_update_info: requestInfo.isAdmin
          ? doc.last_update_info
          : undefined,
      });
    }

    const message = await responseLanguage(
      requestInfo.language,
      responseMessages.done
    );

    return res
      .send({
        success: true,
        message,
        data,
      })
      .status(200);
  } catch (error) {
    console.log(`Language => Get All Languages ${error}`);

    const message = await responseLanguage(
      requestInfo.language,
      responseMessages.invalidData
    );
    return res
      .send({
        success: false,
        message,
      })
      .status(500);
  }
};

const languageRouters = (app: express.Application) => {
  app.post(
    `${definitions.api}/system_management/languages/get_active_languages`,
    verifyJwtToken,
    getActiveLanguages
  );
};

export default languageRouters;
