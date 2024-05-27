import express, { Request, Response } from 'express';
import { Gov } from '../../interfaces';

import {
  inputsLength,
  responseMessages,
  responseLanguage,
  verifyJwtToken,
  checkUserPermission,
  pagination,
  site,
  PermissionsNames,
  checkUserRoutes,
  RoutesNames,
  setDocumentDetails,
  handleError,
  handleNoData,
  handleExisitData,
  handleValidateData,
  handleAddResponse,
  handleUpdateResponse,
  handleDeleteResponse,
  handleGetAllResponse,
  handleSearchResponse,
  handleGetActiveResponse,
  handleViewResponse,
} from '../../shared';

const add = async (req: Request, res: Response) => {
  const request = req.body;
  const requestInfo = req.body.requestInfo;
  try {
    const hasRoute = await checkUserRoutes(req, res, RoutesNames.govs);
    const hasPermission = await checkUserPermission(
      req,
      res,
      PermissionsNames.addGov,
    );

    if (!hasRoute || !hasPermission) return;
    const checkData = await validateData(req, res);

    if (!checkData?.valid) return;

    const findGov = {
      name: request.name,
      deleted: false,
    };

    const checkNewGov = await Gov.findOne(findGov);

    if (checkNewGov) {
      const response = await handleExisitData({
        language: requestInfo.language,
        message: responseMessages.govExisit,
      });
      return res.send(response);
    }
    const doc = new Gov({
      name: request.name,
      code: request.code,
      active: request.active,
      deleted: false,
      addInfo: requestInfo,
    });
    await doc.save();

    const data = {
      _id: doc._id,
      addInfo: requestInfo.isAdmin
        ? await setDocumentDetails(requestInfo, doc?.addInfo)
        : undefined,
    };

    handleAddResponse({ language: requestInfo.language, data }, res);
  } catch (error: any) {
    console.log(`Gov => Add Gov ${error}`);
    handleError({ message: error.message, res });
  }
};

const update = async (req: Request, res: Response) => {
  const request = req.body;
  const _id = req.body._id;
  const requestInfo = req.body.requestInfo;
  const hasRoute = await checkUserRoutes(req, res, RoutesNames.govs);
  const hasPermission = await checkUserPermission(
    req,
    res,
    PermissionsNames.updateGov,
  );

  if (!hasRoute || !hasPermission) return;
  try {
    const checkData = await validateData(req, res);

    if (!checkData?.valid) return;

    const findGov = {
      name: request.name,
      deleted: false,
    };

    const selectedGov = await Gov.findOne(findGov);

    if (selectedGov && String(selectedGov['_id']) !== String(_id)) {
      const response = await handleExisitData({
        language: requestInfo.language,
        message: responseMessages.govExisit,
      });
      return res.send(response);
    }

    if (
      !selectedGov ||
      (selectedGov && String(selectedGov['_id']) === String(_id))
    ) {
      const updatedGovData = {
        name: request.name,
        code: request.code,
        active: request.active,
        lastUpdateInfo: requestInfo,
      };

      const doc = await Gov.findOneAndUpdate({ _id }, updatedGovData, {
        new: true,
      });

      const data = {
        _id: doc?._id,
        name: doc?.name,
        code: doc?.code,
        active: doc?.active,
        addInfo: requestInfo.isAdmin
          ? await setDocumentDetails(requestInfo, doc?.addInfo)
          : undefined,
        lastUpdateInfo:
          requestInfo.isAdmin && doc?.lastUpdateInfo
            ? await setDocumentDetails(requestInfo, doc?.lastUpdateInfo)
            : undefined,
      };
      handleUpdateResponse({ language: requestInfo.language, data }, res);
    }
  } catch (error: any) {
    console.log(`Gov => Update Gov ${error}`);
    handleError({ message: error.message, res });
  }
};

const deleted = async (req: Request, res: Response) => {
  const _id = req.body._id;
  const requestInfo = req.body.requestInfo;
  const hasRoute = await checkUserRoutes(req, res, RoutesNames.govs);
  const hasPermission = await checkUserPermission(
    req,
    res,
    PermissionsNames.deleteGov,
  );

  if (!hasRoute || !hasPermission) return;
  try {
    const selectedGovToDelete = {
      _id,
      deleted: false,
    };
    const selectedGov = await Gov.findOne(selectedGovToDelete);
    if (!selectedGov) {
      const response = await handleNoData({ language: requestInfo.language });
      return res.send(response);
    }

    const deletedGovData = {
      active: false,
      deleted: true,
      deleteInfo: requestInfo,
    };

    const doc = await Gov.findOneAndUpdate({ _id }, deletedGovData, {
      new: true,
    });

    handleDeleteResponse(
      { language: requestInfo.language, data: { _id: doc?._id } },
      res,
    );
  } catch (error: any) {
    console.log(`Gov => Delete Gov ${error}`);
    handleError({ message: error.message, res });
  }
};

const getAll = async (req: Request, res: Response) => {
  const request = req.body;
  const requestInfo = req.body.requestInfo;
  const hasRoute = await checkUserRoutes(req, res, RoutesNames.govs);
  if (!hasRoute) return;

  try {
    const query = {
      page: req.query?.page || request.page || pagination.page,
      limit: req.query?.limit || request.limit || pagination.getAll,
    };

    const where = {
      deleted: false,
    };

    const result = await Gov.paginate(where, query);

    if (!result.docs.length) {
      const response = await handleNoData({ language: requestInfo.language });
      return res.send(response);
    }

    const data = [];

    for await (const doc of result.docs) {
      const addInfo = requestInfo.isAdmin
        ? await setDocumentDetails(requestInfo, doc.addInfo)
        : undefined;
      const lastUpdateInfo =
        requestInfo.isAdmin && doc.lastUpdateInfo
          ? await setDocumentDetails(requestInfo, doc.lastUpdateInfo)
          : undefined;

      data.push({
        _id: doc._id,
        name: doc.name,
        code: doc.code,
        active: doc.active,
        addInfo,
        lastUpdateInfo,
      });
    }

    handleGetAllResponse(
      {
        language: requestInfo.language,
        data,
        paginationInfo: site.pagination(result),
      },
      res,
    );
  } catch (error: any) {
    console.log(`Gov => Get All Gov ${error}`);
    handleError({ message: error.message, res });
  }
};

const search = async (req: Request, res: Response) => {
  const request = req.body;
  const requestInfo = req.body.requestInfo;
  const hasRoute = await checkUserRoutes(req, res, RoutesNames.govs);
  if (!hasRoute) return;
  try {
    const query = {
      page: req.query?.page || request.page || pagination.page,
      limit: req.query?.limit || request.query?.limit || pagination.search,
    };

    const where = {
      deleted: false,
    };

    if (request.query.name) {
      Object(where)['name'] = new RegExp(request.query.name, 'i');
    }

    if (request.query.code) {
      Object(where)['code'] = new RegExp(request.query.code);
    }

    const result = await Gov.paginate(where, query);

    if (!result.docs.length) {
      const response = await handleNoData({ language: requestInfo.language });
      return res.send(response);
    }

    const data = [];
    for await (const doc of result.docs) {
      const addInfo = requestInfo.isAdmin
        ? await setDocumentDetails(requestInfo, doc.addInfo)
        : undefined;
      const lastUpdateInfo =
        requestInfo.isAdmin && doc.lastUpdateInfo
          ? await setDocumentDetails(requestInfo, doc.lastUpdateInfo)
          : undefined;
      data.push({
        _id: doc._id,
        name: doc.name,
        code: doc.code,
        active: doc.active,
        addInfo,
        lastUpdateInfo,
      });
    }

    handleSearchResponse(
      {
        language: requestInfo.language,
        data,
        paginationInfo: site.pagination(result),
      },
      res,
    );
  } catch (error: any) {
    console.log(`Gov => Search All ${error}`);
    handleError({ message: error.message, res });
  }
};

const getActive = async (req: Request, res: Response) => {
  const requestInfo = req.body.requestInfo;

  try {
    const where = {
      active: true,
      deleted: false,
    };

    const result = await Gov.find(where)

    if (!result.length) {
      const response = await handleNoData({ language: requestInfo.language });
      return res.send(response);
    }

    const data = [];
    for await (const doc of result) {
      data.push({
        _id: doc._id,
        name: doc.name,
        code: doc.code,
        active: doc.active,
      });
    }

    handleGetActiveResponse({
      language: requestInfo.language,
      data,
    },
      res,
    );
  } catch (error: any) {
    console.log(`Gov => Get Active Gov ${error}`);
    handleError({ message: error.message, res });
  }
};

const view = async (req: Request, res: Response) => {
  const request = req.body;
  const _id = request._id;
  const requestInfo = req.body.requestInfo;
  const hasRoute = await checkUserRoutes(req, res, RoutesNames.govs);

  if (!hasRoute) return;
  try {
    const doc = await Gov.findOne({ _id });

    const data = {
      _id: doc?._id,
      name: doc?.name,
      code: doc?.code,
      active: doc?.active,
      addInfo: requestInfo.isAdmin
        ? await setDocumentDetails(requestInfo, doc?.addInfo)
        : undefined,
      lastUpdateInfo:
        requestInfo.isAdmin && doc?.lastUpdateInfo
          ? await setDocumentDetails(requestInfo, doc?.lastUpdateInfo)
          : undefined,
    };

    handleViewResponse({
      language: requestInfo.language,
      data,
    },
      res,
    );
  } catch (error: any) {
    console.log(`Gov => View Gov ${error}`);
    handleError({ message: error.message, res });
  }
};

const validateData = async (req: Request, res: Response) => {
  const request = req.body;
  const govName = request.name;
  const requestLanguage = request.requestInfo.language;
  let valid = false;
  let message;

  if (!govName || govName.length < inputsLength.govName) {
    message = await responseLanguage(requestLanguage, responseMessages.govName);
  } else {
    valid = true;
    message = await responseLanguage(requestLanguage, responseMessages.valid);
  }

  if (!valid) {
    handleValidateData({ language: requestLanguage, res, message });
  } else {
    return { valid };
  }
};

const govsRouters = async (app: express.Application) => {
  app.post(
    `${site.api}${site.apps.govs}${site.appsRoutes.add}`,
    verifyJwtToken,
    add,
  );
  app.put(
    `${site.api}${site.apps.govs}${site.appsRoutes.update}`,
    verifyJwtToken,
    update,
  );
  app.put(
    `${site.api}${site.apps.govs}${site.appsRoutes.delete}`,
    verifyJwtToken,
    deleted,
  );
  app.post(
    `${site.api}${site.apps.govs}${site.appsRoutes.getAll}`,
    verifyJwtToken,
    getAll,
  );
  app.post(
    `${site.api}${site.apps.govs}${site.appsRoutes.search}`,
    verifyJwtToken,
    search,
  );
  app.post(
    `${site.api}${site.apps.govs}${site.appsRoutes.getActive}`,
    verifyJwtToken,
    getActive,
  );
  app.post(
    `${site.api}${site.apps.govs}${site.appsRoutes.view}`,
    verifyJwtToken,
    view,
  );
};

export default govsRouters;
