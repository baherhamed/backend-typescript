import { Language } from '../../interfaces';
import {
  site,
  responseLanguage,
  responseMessages,
  verifyJwtToken,
  handleError,
  handleGetActiveResponse,
  handleNoData,
} from '../../shared';
import express, { Request, Response } from 'express';

const getActiveLanguages = async (req: Request, res: Response) => {
  const requestInfo = req.body.requestInfo;

  try {
    const query = {
      active: true,
      deleted: false,
    };

    const result = await Language.find(query);

    if (!result.length) {
      const response = await handleNoData({ language: requestInfo.language });
      return res.send(response);
    }

    const data = [];
    for await (const doc of result) {
      data.push({
        _id: doc._id,
        name: doc.name,
        addInfo: requestInfo.isAdmin ? doc.addInfo : undefined,
        lastUpdateInfo: requestInfo.isAdmin ? doc.lastUpdateInfo : undefined,
      });
    }

    handleGetActiveResponse({
      language: requestInfo.language,
      data,
    },
      res,
    );
  } catch (error: any) {
    console.log(`Language => Get All Languages ${error}`);
    handleError({ message: error.message, res });
  }
};

const languageRouters = (app: express.Application) => {
  app.post(
    `${site.api}${site.apps.languages}${site.appsRoutes.getActive}`,
    verifyJwtToken,
    getActiveLanguages,
  );
};

export default languageRouters;
