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
} from '../../shared';

const update = async (req: Request, res: Response) => {
  const request = req.body;
  console.log('request', request);
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
    const message = await responseLanguage(
      requestInfo.language,
      responseMessages.updated,
    );

    return res
      .send({
        success: true,
        message,
        data: {
          _id: Object(doc)._id,
          displaySetting: Object(doc)?.displaySetting,
          // code: doc?.code,
          // active: doc?.active,
          // addInfo: requestInfo.isAdmin
          //   ? await setDocumentDetails(requestInfo,doc?.addInfo)
          //   : undefined,
          // lastUpdateInfo:
          //   requestInfo.isAdmin && doc?.lastUpdateInfo
          //     ? await setDocumentDetails(requestInfo,doc?.lastUpdateInfo)
          //     : undefined,
        },
      })
      .status(200);
    // }
  } catch (error) {
    console.log(`System Setting => Update System Setting ${error}`);

    const message = await responseLanguage(
      requestInfo.language,
      responseMessages.invalidData,
    );
    return res
      .send({
        success: false,
        message,
      })
      .status(500);
  }
};

const getActive = async (req: Request, res: Response) => {
  const requestInfo = req.body.requestInfo;

  try {
    const doc = await GlobalSetting.findOne();

    const data = {
      _id: doc?._id,
      displaySetting: Object(doc)?.displaySetting,
    };

    const message = await responseLanguage(
      requestInfo.language,
      responseMessages.done,
    );

    return res
      .send({
        success: true,
        message,
        data,
      })
      .status(200);
  } catch (error) {
    console.log(`System Setting => Get Active System Setting ${error}`);

    const message = await responseLanguage(
      requestInfo.language,
      responseMessages.invalidData,
    );
    return res
      .send({
        success: false,
        message,
      })
      .status(500);
  }
};

const generalSystemSettingRouters = async (app: express.Application) => {
  app.post(
    `${site.api}${site.apps.generalSystemSetting}${site.appsRoutes.update}`,
    verifyJwtToken,
    update,
  );

  app.get(
    `${site.api}${site.apps.generalSystemSetting}${site.appsRoutes.getActive}`,
    verifyJwtToken,
    getActive,
  );
};

export default generalSystemSettingRouters;
