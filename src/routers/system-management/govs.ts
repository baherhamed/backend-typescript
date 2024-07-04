import express, { Request, Response } from 'express';
import {
  PermissionsNames,
  cashedCollectionsList,
  checkUserPermission,
  collectionsCachenamesList,
  getCollectionsToMemory,
  handleAddResponse,
  handleDeleteResponse,
  handleError,
  handleExisitData,
  handleGetActiveResponse,
  handleGetAllResponse,
  handleNoData,
  handleSearchResponse,
  handleUpdateResponse,
  handleValidateData,
  handleViewResponse,
  inputsLength,
  responseLanguage,
  responseMessages,
  setDocumentDetails,
  site,
  verifyJwtToken,
} from '../../shared';
import { Gov } from '../../interfaces';

const add = async (req: Request, res: Response) => {
  const request = req.body;
  const requestInfo = req.body.requestInfo;
  try {
    const hasPermission = await checkUserPermission(
      req,
      res,
      PermissionsNames.addGov,
    );

    if (!hasPermission) return;
    const checkData = await validateData(req, res);

    if (!checkData?.valid) return;

    const findGov = {
      name: request.name,
      deleted: false,
    };

    const checkNewGov = await Gov.findOne(findGov);

    if (checkNewGov) {
      const response = await handleExisitData({
        req,
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

    handleAddResponse({ req, language: requestInfo.language, data }, res);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(`Gov => Add Gov ${error}`);
    handleError({ req, message: error.message, res });
  }
};

const update = async (req: Request, res: Response) => {
  const request = req.body;
  const _id = req.body._id;
  const requestInfo = req.body.requestInfo;
  const hasPermission = await checkUserPermission(
    req,
    res,
    PermissionsNames.updateGov,
  );

  if (!hasPermission) return;
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
        req,
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
      handleUpdateResponse({ req, language: requestInfo.language, data }, res);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(`Gov => Update Gov ${error}`);
    handleError({ req, message: error.message, res });
  }
};

const deleted = async (req: Request, res: Response) => {
  const _id = req.body._id;
  const requestInfo = req.body.requestInfo;
  const hasPermission = await checkUserPermission(
    req,
    res,
    PermissionsNames.deleteGov,
  );

  if (!hasPermission) return;
  try {
    const selectedGovToDelete = {
      _id,
      deleted: false,
    };
    const selectedGov = await Gov.findOne(selectedGovToDelete);
    if (!selectedGov) {
      const response = await handleNoData({
        req,
        language: requestInfo.language,
      });
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
      { req, language: requestInfo.language, data: { _id: doc?._id } },
      res,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(`Gov => Delete Gov ${error}`);
    handleError({ req, message: error.message, res });
  }
};

const getAll = async (req: Request, res: Response) => {
  const requestInfo = req.body.requestInfo;

  try {
    const where = {
      query: {
        deleted: false,
      },
      ...site.setPaginationQuery(req),
    };

    const result = await Gov.paginate(where);

    if (!result?.docs.length) {
      const response = await handleNoData({
        req,
        language: requestInfo.language,
      });
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
        req,
        language: requestInfo.language,
        data,
        paginationInfo: site.pagination(result),
      },
      res,
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(`Gov => Get All Gov ${error}`);

    return handleError({ req, message: error.message, res });
  }
};

const search = async (req: Request, res: Response) => {
  const request = req.body;
  const requestInfo = req.body.requestInfo;
  try {
    const where = {
      query: {
        deleted: false,
      },
      ...site.setPaginationQuery(req),
    };

    if (request.query.name) {
      Object(where.query).name = new RegExp(request.query.name, 'i');
    }

    if (request.query.code) {
      Object(where.query).code = new RegExp(request.query.code, 'i');
    }

    const result = await Gov.paginate(where);

    if (!result?.docs.length) {
      const response = await handleNoData({
        req,
        language: requestInfo.language,
      });
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
        req,
        language: requestInfo.language,
        data,
        paginationInfo: site.pagination(result),
      },
      res,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(`Gov => Search All ${error}`);
    handleError({ req, message: error.message, res });
  }
};

const getActive = async (req: Request, res: Response) => {
  const requestInfo = req.body.requestInfo;

  if (cashedCollectionsList.includes(site.apps.govs.split('/')[0])) {
    return getCollectionsToMemory(
      req,
      res,
      site.apps.govs,
      collectionsCachenamesList.gov,
    );
  }

  try {
    const where = {
      active: true,
      deleted: false,
    };

    const result = await Gov.find(where);

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
        code: doc.code,
        active: doc.active,
      });
    }

    handleGetActiveResponse({ req, language: requestInfo.language, data }, res);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(`Gov => Get Active Gov ${error}`);
    handleError({ req, message: error.message, res });
  }
};

const view = async (req: Request, res: Response) => {
  const request = req.body;
  const _id = request._id;
  const requestInfo = req.body.requestInfo;

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

    handleViewResponse({ req, language: requestInfo.language, data }, res);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(`Gov => View Gov ${error}`);
    handleError({ req, message: error.message, res });
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
