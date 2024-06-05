import express, { Request, Response } from 'express';
import {
  PermissionsNames,
  checkUserPermission,
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
import { Permission, Route } from '../../interfaces';

const add = async (req: Request, res: Response) => {
  const request = req.body;
  const requestInfo = req.body.requestInfo;

  const hasPermission = await checkUserPermission(
    req,
    res,
    PermissionsNames.addRoute,
  );

  if (!hasPermission) return;
  try {
    const checkData = await validateData(req, res);
    if (!checkData?.valid) return;

    const findRoute = {
      $or: [
        {
          name: request.name,
        },
        {
          ar: request.ar,
        },
        {
          en: request.en,
        },
      ],
      deleted: false,
    };

    const checkNewRoute = await Route.findOne(findRoute);

    if (checkNewRoute) {
      const response = await handleExisitData({
        language: requestInfo.language,
        message: responseMessages.routeExisit,
      });
      return res.send(response);
    }

    const doc = new Route({
      name: request.name,
      ar: request.ar,
      en: request.en,
      active: request.active,
      deleted: false,
      addInfo: requestInfo,
    });

    await doc.save();

    const permissionsList = [];
    if (request.permissionsList) {
      for await (const permission of request.permissionsList) {
        const newPermission = new Permission({
          routeId: doc._id,
          name: permission.name,
          ar: permission.ar,
          en: permission.en,
          active: permission.active,
          addInfo: requestInfo,
        });
        await newPermission.save();
        permissionsList.push({
          _id: newPermission._id,
          name: permission.name,
          ar: permission.ar,
          en: permission.en,
          active: permission.active,
        });
      }
    }

    const message = await responseLanguage(
      requestInfo.language,
      responseMessages.saved,
    );
    await doc.save();

    const data = {
      _id: doc._id,
      addInfo: requestInfo.isAdmin
        ? await setDocumentDetails(requestInfo, doc?.addInfo)
        : undefined,
      permissionsList,
    };
    handleAddResponse({ language: requestInfo.language, data }, res);
  } catch (error: any) {
    console.log(`Route => Add Route ${error}`);
    handleError({ message: error.message, res });
  }
};

const update = async (req: Request, res: Response) => {
  const request = req.body;
  const _id = req.body._id;
  const requestInfo = req.body.requestInfo;

  const hasPermission = await checkUserPermission(
    req,
    res,
    PermissionsNames.updateRoute,
  );

  if (!hasPermission) return;
  try {
    const checkData = await validateData(req, res);
    if (!checkData?.valid) return;

    const findRoute = {
      $or: [
        {
          name: request.name,
        },
        {
          ar: request.ar,
        },
        {
          en: request.en,
        },
      ],
      deleted: false,
    };

    const selectedRoute = await Route.findOne(findRoute);

    if (selectedRoute && String(selectedRoute['_id']) !== String(_id)) {
      const response = await handleExisitData({
        language: requestInfo.language,
        message: responseMessages.routeExisit,
      });
      return res.send(response);
    }

    if (
      !selectedRoute ||
      (selectedRoute && String(selectedRoute['_id']) === String(_id))
    ) {
      const updatedRouteData = {
        name: request.name,
        ar: request.ar,
        en: request.en,
        active: request.active,
        lastUpdateInfo: requestInfo,
      };

      const doc = await Route.findOneAndUpdate({ _id }, updatedRouteData, {
        new: true,
      });

      const permissionsList = [];

      if (request.permissionsList) {
        for await (const permission of request.permissionsList) {
          const exisitPermission = await Permission.findOne({
            _id: permission?._id,
            name: permission.name,
          });

          if (exisitPermission) {
            await Permission.findOneAndUpdate(
              {
                _id: permission?._id,
              },
              {
                name: permission.name,
                ar: permission.ar,
                en: permission.en,
                active: permission.active,
                lastUpdateInfo: requestInfo,
              },
            );
          } else {
            const newPermission = new Permission({
              routeId: doc?._id,
              name: permission.name,
              ar: permission.ar,
              en: permission.en,
              active: permission.active,
              addInfo: requestInfo,
            });
            await newPermission.save();
          }
        }
        const selectedPermissions = await Permission.find({
          routeId: doc?._id,
          deleted: false,
        });

        if (selectedPermissions) {
          for await (const permission of selectedPermissions) {
            permissionsList.push({
              _id: permission._id,
              name: permission.name,
              ar: permission.ar,
              en: permission.en,
              active: permission.active,
              addInfo: requestInfo.isAdmin
                ? await setDocumentDetails(requestInfo, doc?.addInfo)
                : undefined,
              lastUpdateInfo:
                requestInfo.isAdmin && doc?.lastUpdateInfo
                  ? await setDocumentDetails(requestInfo, doc?.lastUpdateInfo)
                  : undefined,
            });
          }
        }
      }
      const data = {
        _id: doc?._id,
        name: doc?.name,
        ar: doc?.ar,
        en: doc?.en,
        active: doc?.active,
        permissionsList,
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
    console.log(`Route => Update Route ${error}`);
    handleError({ message: error.message, res });
  }
};

const deleted = async (req: Request, res: Response) => {
  const _id = req.body._id;
  const requestInfo = req.body.requestInfo;
  const hasPermission = await checkUserPermission(
    req,
    res,
    PermissionsNames.deleteRoute,
  );

  if (!hasPermission) return;
  try {
    const selectedRouteToDelete = {
      _id,
      deleted: false,
    };
    const selectedRoute = await Route.findOne(selectedRouteToDelete);

    if (!selectedRoute) {
      const response = await handleNoData({ language: requestInfo.language });
      return res.send(response);
    }

    const deletedRouteData = {
      active: false,
      deleted: true,
      deleteInfo: requestInfo,
    };

    const doc = await Route.findOneAndUpdate({ _id }, deletedRouteData, {
      new: true,
    });

    const deletedPermissionsList = await Permission.find({
      routeId: doc?._id,
      deleted: false,
    });

    for await (const permission of deletedPermissionsList) {
      await Permission.findOneAndUpdate(
        { _id: permission._id },
        { active: false, deleted: true, deleteInfo: requestInfo },
        { new: true },
      );
    }

    handleDeleteResponse(
      { language: requestInfo.language, data: { _id: doc?._id } },
      res,
    );
  } catch (error: any) {
    console.log(`Route => Delete Route ${error}`);
    handleError({ message: error.message, res });
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

    const result = await Route.paginate(where);

    if (!result?.docs.length) {
      const response = await handleNoData({ language: requestInfo.language });
      return res.send(response);
    }

    const data = [];

    for await (const doc of result.docs) {
      const addInfo = requestInfo.isAdmin
        ? await setDocumentDetails(requestInfo, doc.addInfo)
        : undefined;
      const lastUpdateInfo = requestInfo.isAdmin
        ? await setDocumentDetails(requestInfo, doc.lastUpdateInfo)
        : undefined;
      const permissionsList = [];
      const selectedPermissionsList = await Permission.find({
        routeId: doc?._id,
        deleted: false,
      });

      if (selectedPermissionsList) {
        for await (const permission of selectedPermissionsList) {
          permissionsList.push({
            _id: permission._id,
            name: permission.name,
            ar: permission.ar,
            en: permission.en,
            active: permission.active,
          });
        }
      }

      data.push({
        _id: doc._id,
        name: doc.name,
        ar: doc.ar,
        en: doc.en,
        active: doc.active,
        permissionsList,
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
    console.log(`Route => Get All Route ${error}`);
    handleError({ message: error.message, res });
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
      ...site.setPaginationQuery(req)
    };
    if (request.query.name) {
      Object(where.query)['name'] = new RegExp(request.query.name, 'i');
    }
    if (request.query.ar) {
      Object(where.query)['ar'] = new RegExp(request.query.ar, 'i');
    }

    if (request.query.en) {
      Object(where.query)['en'] = new RegExp(request.query.en, 'i');
    }

    const result = await Route.paginate(where);

    if (!result?.docs.length) {
      const response = await handleNoData({ language: requestInfo.language });
      return res.send(response);
    }

    const data = [];
    for await (const doc of result.docs) {
      const addInfo = requestInfo.isAdmin
        ? await setDocumentDetails(requestInfo, doc.addInfo)
        : undefined;
      const lastUpdateInfo = requestInfo.isAdmin
        ? await setDocumentDetails(requestInfo, doc.lastUpdateInfo)
        : undefined;
      const permissionsList = [];
      const selectedPermissionsList = await Permission.find({
        routeId: doc?._id,
        deleted: false,
      });
      if (selectedPermissionsList) {
        for await (const permission of selectedPermissionsList) {
          permissionsList.push({
            _id: permission._id,
            name: permission.name,
            ar: permission.ar,
            en: permission.en,
            active: permission.active,
          });
        }
      }

      data.push({
        _id: doc._id,
        name: doc.name,
        ar: doc.ar,
        en: doc.en,
        active: doc.active,
        permissionsList,
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
    console.log(`Route => Search Route ${error}`);
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

    const result = await Route.find(where);

    if (!result.length) {
      const response = await handleNoData({ language: requestInfo.language });
      return res.send(response);
    }

    const data = [];

    for await (const doc of result) {
      const permissionsList = [];
      const selectedPermissionsList = await Permission.find({
        routeId: doc?._id,
        deleted: false,
      });

      if (selectedPermissionsList) {
        for await (const permission of selectedPermissionsList) {
          permissionsList.push({
            _id: permission._id,
            name: permission.name,
            ar: permission.ar,
            en: permission.en,
            // active: permission.active,
          });
        }
      }

      data.push({
        _id: doc._id,
        name: doc.name,
        ar: doc.ar,
        en: doc.en,
        active: doc.active,
        permissionsList,
        addInfo: requestInfo.isAdmin ? doc.addInfo : undefined,
        lastUpdateInfo: requestInfo.isAdmin ? doc.lastUpdateInfo : undefined,
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
    console.log(`Routes => Get Active routes ${error}`);
    handleError({ message: error.message, res });
  }
};

const view = async (req: Request, res: Response) => {
  const request = req.body;

  const _id = request._id;
  const requestInfo = req.body.requestInfo;
  // const hasRoute = await checkUserRoutes(req, res, RoutesNames.govs);

  // if (!hasRoute) return;
  try {
    const doc = await Route.findOne({ _id });
    const permissionsList = [];
    const selectedPermissions = await Permission.find({
      routeId: doc?._id,
      deleted: false,
    });

    if (selectedPermissions) {
      for await (const permission of selectedPermissions) {
        permissionsList.push({
          _id: permission._id,
          name: permission.name,
          ar: permission.ar,
          en: permission.en,
          active: permission.active,
        });
      }
    }

    const data = {
      _id: doc?._id,
      name: doc?.name,
      ar: doc?.ar,
      en: doc?.en,
      active: doc?.active,
      permissionsList,
      addInfo: requestInfo.isDeveloper
        ? await setDocumentDetails(requestInfo, doc?.addInfo)
        : undefined,
      lastUpdateInfo:
        requestInfo.isDeveloper && doc?.lastUpdateInfo
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
    console.log(`Route => View Route ${error}`);
    handleError({ message: error.message, res });
  }
};

const validateData = async (req: Request, res: Response) => {
  const request = req.body;
  const routeName = request.name;
  const routeNameAr = request.ar;
  const routeNameEn = request.en;
  const requestLanguage = request.requestInfo.language;
  let valid = false;
  let message;

  if (!routeName || routeName.length < inputsLength.routeName) {
    message = await responseLanguage(
      requestLanguage,
      responseMessages.routeName,
    );
  } else if (!routeNameAr || routeNameAr.length < inputsLength.routeName) {
    message = await responseLanguage(
      requestLanguage,
      responseMessages.routeName,
    );
  } else if (!routeNameEn || routeNameEn.length < inputsLength.routeName) {
    message = await responseLanguage(
      requestLanguage,
      responseMessages.routeName,
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

const routessRouters = async (app: express.Application) => {
  app.post(
    `${site.api}${site.apps.routes}${site.appsRoutes.add}`,
    verifyJwtToken,
    add,
  );
  app.put(
    `${site.api}${site.apps.routes}${site.appsRoutes.update}`,
    verifyJwtToken,
    update,
  );
  app.put(
    `${site.api}${site.apps.routes}${site.appsRoutes.delete}`,
    verifyJwtToken,
    deleted,
  );
  app.post(
    `${site.api}${site.apps.routes}${site.appsRoutes.getAll}`,
    verifyJwtToken,
    getAll,
  );
  app.post(
    `${site.api}${site.apps.routes}${site.appsRoutes.search}`,
    verifyJwtToken,
    search,
  );
  app.post(
    `${site.api}${site.apps.routes}${site.appsRoutes.getActive}`,
    verifyJwtToken,
    getActive,
  );
  app.post(
    `${site.api}${site.apps.routes}${site.appsRoutes.view}`,
    verifyJwtToken,
    view,
  );
};

export default routessRouters;
