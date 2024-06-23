import express, { Request, Response } from 'express';

import {
  PermissionsNames,
  RoutesNames,
  checkUserPermission,
  checkUserRoutes,
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
  pagination,
  responseLanguage,
  responseMessages,
  setDocumentDetails,
  site,
  verifyJwtToken,
} from '../../shared';
import { City } from '../../interfaces';

const add = async (req: Request, res: Response) => {
  const request = req.body;
  const requestInfo = req.body.requestInfo;
  const hasRoute = await checkUserRoutes(req, res, RoutesNames.cities);
  const hasPermission = await checkUserPermission(
    req,
    res,
    PermissionsNames.addCity,
  );

  if (!hasRoute || !hasPermission) return;
  try {
    const checkData = await validateData(req, res);

    if (!checkData?.valid) return;

    const findCity = {
      govId: request.govId,
      name: request.name,
      deleted: false,
    };

    const checkNewCity = await City.findOne(findCity);

    if (checkNewCity) {
      const response = await handleExisitData({
        language: requestInfo.language,
        message: responseMessages.cityExisit,
      });
      return res.send(response);
    }

    const doc = new City({
      govId: request.govId,
      name: request.name,
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
    console.log(`City => Add City ${error}`);
    handleError({ message: error.message, res });
  }
};

const update = async (req: Request, res: Response) => {
  const request = req.body;
  const _id = req.body._id;
  const requestInfo = req.body.requestInfo;
  const hasRoute = await checkUserRoutes(req, res, RoutesNames.cities);
  const hasPermission = await checkUserPermission(
    req,
    res,
    PermissionsNames.updateCity,
  );

  if (!hasRoute || !hasPermission) return;
  try {
    const checkData = await validateData(req, res);

    if (!checkData?.valid) return;

    const findCity = {
      govId: request.govId,
      name: request.name,
      deleted: false,
    };

    const selectedCity = await City.findOne(findCity);

    if (selectedCity && String(selectedCity['_id']) !== String(_id)) {
      const response = await handleExisitData({
        language: requestInfo.language,
        message: responseMessages.cityExisit,
      });
      return res.send(response);
    }

    if (
      !selectedCity ||
      (selectedCity && String(selectedCity['_id']) === String(_id))
    ) {
      const updatedCityData = {
        name: request.name,
        govId: request.govId,
        active: request.active,
        lastUpdateInfo: requestInfo,
      };

      const doc = await City.findOneAndUpdate({ _id }, updatedCityData, {
        new: true,
      });

      const data = {
        _id: doc?._id,
        gov: {
          _id: Object(doc?.govId)._id,
          name: Object(doc?.govId).name,
        },
        name: doc?.name,
        active: doc?.active,
        addInfo: requestInfo.isAdmin
          ? await setDocumentDetails(requestInfo, doc!.addInfo)
          : undefined,
        lastUpdateInfo: requestInfo.isAdmin
          ? await setDocumentDetails(requestInfo, doc!.lastUpdateInfo)
          : undefined,
      };
      handleUpdateResponse({ language: requestInfo.language, data }, res);
    }
  } catch (error: any) {
    console.log(`City => Update City ${error}`);
    handleError({ message: error.message, res });
  }
};

const deleted = async (req: Request, res: Response) => {
  const _id = req.body._id;
  const requestInfo = req.body.requestInfo;
  const hasRoute = await checkUserRoutes(req, res, RoutesNames.cities);
  const hasPermission = await checkUserPermission(
    req,
    res,
    PermissionsNames.deleteCity,
  );

  if (!hasRoute || !hasPermission) return;
  try {
    const selectedCityToDelete = {
      _id,
      deleted: false,
    };

    const selectedCity = await City.findOne(selectedCityToDelete);

    if (!selectedCity) {
      const response = await handleNoData({ language: requestInfo.language });
      return res.send(response);
    }

    const deletedCityData = {
      active: false,
      deleted: true,
      deleteInfo: requestInfo,
    };

    const doc = await City.findOneAndUpdate({ _id }, deletedCityData, {
      new: true,
    });

    handleDeleteResponse(
      { language: requestInfo.language, data: { _id: doc?._id } },
      res,
    );
  } catch (error: any) {
    console.log(`City => Delete City ${error}`);
    handleError({ message: error.message, res });
  }
};

const getAll = async (req: Request, res: Response) => {


  const requestInfo = req.body.requestInfo;
  const hasRoute = await checkUserRoutes(req, res, RoutesNames.cities);
  if (!hasRoute) return;
  try {
    const where = {
      query: {
        deleted: false,
      },
      ...site.setPaginationQuery(req),
    };

    const result = await City.paginate(where);

    if (!result?.docs.length) {
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
        gov: {
          _id: Object(doc.govId)._id,
          name: Object(doc.govId).name,
        },
        name: doc.name,
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
    console.log(`City => Get All City ${error}`);
    handleError({ message: error.message, res });
  }
};

const search = async (req: Request, res: Response) => {
  const request = req.body;
  const requestInfo = req.body.requestInfo;
  const hasRoute = await checkUserRoutes(req, res, RoutesNames.cities);
  if (!hasRoute) return;
  try {
    const where = {
      query: {
        deleted: false,
      },
      ...site.setPaginationQuery(req),
    };

    if (request.query.gov?._id) {
      Object(where.query).govId = request.query.gov?._id;
    }

    if (request.query.name) {
      Object(where.query).name = new RegExp(request.query.name, 'i');
    }

    const result = await City.paginate(where);

    if (!result?.docs.length) {
      const response = await handleNoData({ language: requestInfo.language });
      return res.send(response);
    }

    const data = [];
    for await (const doc of result.docs) {
      const addInfo = requestInfo.isAdmin
        ? await setDocumentDetails(requestInfo, doc?.addInfo)
        : undefined;
      const lastUpdateInfo =
        requestInfo.isAdmin && doc?.lastUpdateInfo
          ? await setDocumentDetails(requestInfo, doc?.lastUpdateInfo)
          : undefined;

      data.push({
        _id: doc._id,
        gov: {
          _id: Object(doc.govId)._id,
          name: Object(doc.govId).name,
        },
        name: doc.name,
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
    console.log(`City => Search All ${error}`);
    handleError({ message: error.message, res });
  }
};

const getCitiesByGov = async (req: Request, res: Response) => {
  const request = req.body;
  const requestInfo = req.body.requestInfo;

  try {
    const where = {
      govId: request.govId,
      active: true,
      deleted: false,
    };

    const result = await City.find(where);

    if (!result.length) {
      const response = await handleNoData({ language: requestInfo.language });
      return res.send(response);
    }

    const data = [];

    for await (const doc of result) {
      data.push({
        _id: doc._id,
        name: doc.name,
      });
    }
    handleGetActiveResponse(
      {
        language: requestInfo.language,
        data,
      },
      res,
    );
  } catch (error: any) {
    console.log(`City => Get Cities By Gov ${error}`);
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

    const result = await City.find(where);

    if (!result.length) {
      const response = await handleNoData({ language: requestInfo.language });
      return res.send(response);
    }

    const data = [];
    for await (const doc of result) {
      data.push({
        _id: doc._id,
        gov: {
          _id: Object(doc.govId)._id,
          name: Object(doc.govId).name,
        },
        name: doc.name,
        active: doc.active,
      });
    }

    handleGetActiveResponse(
      {
        language: requestInfo.language,
        data,
      },
      res,
    );
  } catch (error: any) {
    console.log(`City => Get Active City ${error}`);
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
    const doc = await City.findOne({ _id });
    const data = {
      _id: doc?._id,
      gov: {
        _id: Object(doc?.govId)._id,
        name: Object(doc?.govId).name,
      },
      name: doc?.name,
      active: doc?.active,
      addInfo: requestInfo.isAdmin
        ? await setDocumentDetails(requestInfo, doc?.addInfo)
        : undefined,
      lastUpdateInfo:
        requestInfo.isAdmin && doc?.lastUpdateInfo
          ? await setDocumentDetails(requestInfo, doc?.lastUpdateInfo)
          : undefined,
    };

    handleViewResponse(
      {
        language: requestInfo.language,
        data,
      },
      res,
    );
  } catch (error: any) {
    console.log(`City => View City ${error}`);
    handleError({ message: error.message, res });
  }
};

const validateData = async (req: Request, res: Response) => {
  const request = req.body;
  const cityName = request.name;
  const requestLanguage = request.requestInfo.language;
  let valid = false;
  let message;

  if (!cityName || cityName.length < inputsLength.cityName) {
    message = await responseLanguage(
      requestLanguage,
      responseMessages.cityName,
    );
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

const citiesRouters = async (app: express.Application) => {
  app.post(
    `${site.api}${site.apps.cities}${site.appsRoutes.add}`,
    verifyJwtToken,
    add,
  );
  app.put(
    `${site.api}${site.apps.cities}${site.appsRoutes.update}`,
    verifyJwtToken,
    update,
  );
  app.put(
    `${site.api}${site.apps.cities}${site.appsRoutes.delete}`,
    verifyJwtToken,
    deleted,
  );
  app.post(
    `${site.api}${site.apps.cities}${site.appsRoutes.getAll}`,
    verifyJwtToken,
    getAll,
  );
  app.post(
    `${site.api}${site.apps.cities}${site.appsRoutes.search}`,
    verifyJwtToken,
    search,
  );
  app.post(
    `${site.api}${site.apps.cities}${site.appsRoutes.getActive}`,
    verifyJwtToken,
    getActive,
  );
  app.post(
    `${site.api}${site.apps.cities}${site.appsRoutes.getCitiesByGov}`,
    verifyJwtToken,
    getCitiesByGov,
  );
  app.post(
    `${site.api}${site.apps.cities}${site.appsRoutes.view}`,
    verifyJwtToken,
    view,
  );
};

export default citiesRouters;
