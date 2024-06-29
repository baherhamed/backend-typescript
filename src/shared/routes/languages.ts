import express, { Request, Response } from 'express';
import {
  Language,
  handleError,
  handleGetActiveResponse,
  handleNoData,
  site,
  verifyJwtToken,
} from '../../shared';

const getActiveLanguages = async (req: Request, res: Response) => {
  const requestInfo = req.body.requestInfo;

  try {
    const query = {
      active: true,
      deleted: false,
    };

    const result = await Language.find(query);

    if (!result.length) {
      const response = await handleNoData({
        req,
        language: requestInfo.language,
      });
      return res.send(response);
    }

    const data = [];
    for await (const doc of result) {
      data.push({
        _id: doc._id,
        name: doc.name,
        // addInfo: requestInfo.isAdmin ? doc.addInfo : undefined,
        // lastUpdateInfo: requestInfo.isAdmin ? doc.lastUpdateInfo : undefined,
      });
    }

    handleGetActiveResponse({ req, language: requestInfo.language, data }, res);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(`Language => Get All Languages ${error}`);
    handleError({ req, message: error.message, res });
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
