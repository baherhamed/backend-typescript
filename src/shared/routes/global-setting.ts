import express, { Request, Response } from 'express';
import {
  GlobalSetting,
  PermissionsNames,
  checkUserPermission,
  handleError,
  handleGetActiveResponse,
  handleUpdateResponse,
  site,
  verifyJwtToken,
} from '..';
const update = async (req: Request, res: Response) => {
  const request = req.body;

  const _id = req.body._id;
  const requestInfo = req.body.requestInfo;
  const hasPermission = await checkUserPermission(
    req,
    res,
    PermissionsNames.setGlobalSetting,
  );

  if (!hasPermission) return;
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
    };
    handleUpdateResponse({ req, language: requestInfo.language, data }, res);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(`System Setting => Update System Setting ${error}`);
    handleError({ req, message: error.message, res });
  }
};

const getGlobalSystemSetting = async (req: Request, res: Response) => {
  const requestInfo = req.body.requestInfo;

  try {
    const doc = await GlobalSetting.findOne({});
    const data = {
      displaySetting: {
        displayRecordDetails: doc?.displaySetting.displayRecordDetails,
        showTooltip: doc?.displaySetting.showTooltip,
        displayTooltipPosition: doc?.displaySetting.tooltipPosition.name,
      },
    };

    handleGetActiveResponse({ req, language: requestInfo.language, data }, res);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(`System Setting => Get Active System Setting ${error}`);
    handleError({ req, message: error.message, res });
  }
};

const getActive = async (req: Request, res: Response) => {
  const requestInfo = req.body.requestInfo;

  try {
    const data = await GlobalSetting.findOne({});
    // const data = {
    //   ...doc,
    // };

    handleGetActiveResponse({ req, language: requestInfo.language, data }, res);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(`System Setting => Get Active System Setting ${error}`);
    handleError({ req, message: error.message, res });
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
  app.get(
    `${site.api}${site.apps.globalSystemSetting}${site.appsRoutes.getGlobalSystemSetting}`,
    verifyJwtToken,
    getGlobalSystemSetting,
  );
};

export default globalSystemSettingRouters;
