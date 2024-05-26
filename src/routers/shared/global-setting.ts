import express, { Request, Response } from 'express';
import { GlobalSetting } from '../../interfaces';

import {
  // inputsLength,
  responseMessages,
  responseLanguage,
  verifyJwtToken,
  checkUserPermission,
  // pagination,
  site,
  PermissionsNames,
  checkUserRoutes,
  RoutesNames,
  handleError,
  handleGetActiveResponse,
  handleUpdateResponse,
} from '../../shared';

const update = async (req: Request, res: Response) => {
  const request = req.body;

  const _id = req.body._id;
  const requestInfo = req.body.requestInfo;
  const hasRoute = await checkUserRoutes(req, res, RoutesNames.globalSetting);
  const hasPermission = await checkUserPermission(
    req,
    res,
    PermissionsNames.setGlobalSetting,
  );

  if (!hasRoute || !hasPermission) return;
  try {
    let doc;
    if (!_id) {
      doc = new GlobalSetting({
        ...request,
        addInfo: requestInfo,
      });
      await doc.save();
    } else {
      const updatedGeneralSystemSettingData = {
        ...request,
        lastUpdateInfo: requestInfo,
      };
      doc = await GlobalSetting.findOneAndUpdate(
        { _id },
        updatedGeneralSystemSettingData,
        {
          new: true,
        },
      );
    }
    const data = {
      _id: Object(doc)._id,
      displaySetting: Object(doc).displaySetting,
    }
    handleUpdateResponse({ language: requestInfo.language, data }, res);
  } catch (error: any) {
    console.log(`System Setting => Update System Setting ${error}`);
    handleError({ message: error.message, res });
  }
};

const getActive = async (req: Request, res: Response) => {
  const requestInfo = req.body.requestInfo;

  try {
    const doc = await GlobalSetting.findOne();

    const data = {
      _id: doc?._id,
      displaySetting: doc?.displaySetting,
    };

    handleGetActiveResponse({
      language: requestInfo.language,
      data,
    },
      res,
    );
  } catch (error: any) {
    console.log(`System Setting => Get Active System Setting ${error}`);
    handleError({ message: error.message, res });
  }
};

const globalSystemSettingRouters = async (app: express.Application) => {
  app.post(
    `${site.api}${site.apps.globalSystemSetting}${site.appsRoutes.update}`,
    verifyJwtToken,
    update,
  );

  app.get(
    `${site.api}${site.apps.globalSystemSetting}${site.appsRoutes.getActive}`,
    verifyJwtToken,
    getActive,
  );
};

export default globalSystemSettingRouters;
