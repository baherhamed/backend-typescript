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
  handleGetAllResponse,
  handleLoggedOutResponse,
  handleNoData,
  handleSearchResponse,
  handleUpdateResponse,
  handleValidateData,
  hashPassword,
  inputsLength,
  pagination,
  responseLanguage,
  responseMessages,
  setDocumentDetails,
  site,
  verifyJwtToken,
} from '../../shared';

import jwt, { JwtPayload } from 'jsonwebtoken';
import { Permission, Route, Token, User } from '../../interfaces';

const add = async (req: Request, res: Response) => {
  const request = req.body;
  const requestInfo = req.body.requestInfo;
  const hasRoute = await checkUserRoutes(req, res, RoutesNames.users);
  const hasPermission = await checkUserPermission(
    req,
    res,
    PermissionsNames.addUser,
  );

  if (!hasRoute || !hasPermission) return;
  try {
    const checkData = await validateData(req, res);

    if (!checkData?.valid) return;

    const findUser = {
      $or: [
        {
          mobile: request.mobile,
        },
        {
          email: {
            $eq: request.email,
          },
        },
      ],
      deleted: false,
    };

    const checkNewUser = await User.findOne(findUser);

    if (checkNewUser) {
      const response = await handleExisitData({
        language: requestInfo.language,
        message: responseMessages.userExisit,
      });
      return res.send(response);
    }

    const hashedPassword = await hashPassword(request);
    if (!hashedPassword.success) {
      const message = await responseLanguage(
        requestInfo.language,
        responseMessages.password,
      );

      return res.send({
        success: false,
        statusCode: site.responseStatusCodes.missingData,
        message,
      });
    }

    const doc = new User({
      name: request.name,
      mobile: request.mobile,
      email: request.email || request.mobile,
      languageId: request.languageId,
      routesList: request.routesList,
      permissionsList: request.permissionsList,
      password: hashedPassword.newHashedPassword,
      isAdmin:
        requestInfo.isDeveloper || requestInfo.isAdmin
          ? request.isAdmin
          : false,
      active: true,
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
    console.log(`User => Add User ${error}`);
    handleError({ message: error.message, res });
  }
};

const update = async (req: Request, res: Response) => {
  const request = req.body;
  const _id = req.body._id;
  const requestInfo = req.body.requestInfo;
  const hasRoute = await checkUserRoutes(req, res, RoutesNames.users);
  const hasPermission = await checkUserPermission(
    req,
    res,
    PermissionsNames.updateUser,
  );

  if (!hasRoute || !hasPermission) return;
  try {
    const checkData = await validateData(req, res);

    if (!checkData?.valid) return;

    const findUser = {
      $or: [
        {
          mobile: request.mobile,
        },
        {
          email: {
            $eq: request.email,
          },
        },
      ],
      deleted: false,
    };

    const checkIfUserExisit = await User.findOne(findUser);
    const selectedUser = await User.findOne({ _id });

    if (checkIfUserExisit && String(checkIfUserExisit['_id']) !== String(_id)) {
      const response = await handleExisitData({
        language: requestInfo.language,
        message: responseMessages.userExisit,
      });
      return res.send(response);
    }

    if (
      !checkIfUserExisit ||
      (checkIfUserExisit && String(checkIfUserExisit['_id']) === String(_id))
    ) {
      if (selectedUser) {
        let password = selectedUser.password;
        if (
          request.password &&
          request.password.length >= inputsLength.password
        ) {
          const hashedPassword = await hashPassword(request);
          password = String(hashedPassword.newHashedPassword);
        }
        const updatedUserData = {
          name: request.name || selectedUser.name,
          password,
          mobile: request.mobile || selectedUser.mobile,
          email: request.email || selectedUser.email,
          languageId: request.languageId || selectedUser.languageId,
          routesList: request.routesList || selectedUser.routesList,
          permissionsList:
            request.permissionsList || selectedUser.permissionsList,
          isAdmin:
            requestInfo.isDeveloper || requestInfo.isAdmin
              ? request.isAdmin
              : false,
          active: request.active || selectedUser.active,
          lastUpdateInfo: requestInfo,
        };

        const doc = await User.findOneAndUpdate({ _id }, updatedUserData, {
          new: true,
        });
        const routesList = [];

        const allRoutesList = await Route.find({ deleted: false });
        const allPermissionsList = await Permission.find({
          deleted: false,
        });

        for await (const activeRoute of allRoutesList) {
          const permissionsList = [];
          for await (const perm of allPermissionsList) {
            if (String(Object(perm.routeId)._id) === String(activeRoute?._id)) {
              if (doc?.permissionsList.includes(perm.name)) {
                permissionsList.push({
                  _id: perm._id,
                  routeId: Object(perm.routeId)._id,
                  name: perm.name,
                  ar: perm.ar,
                  en: perm.en,
                  active: true,
                });
              } else {
                permissionsList.push({
                  _id: perm._id,
                  routeId: Object(perm.routeId)._id,
                  name: perm.name,
                  ar: perm.ar,
                  en: perm.en,
                  active: false,
                });
              }
            }
          }

          const selectedRoute = {
            _id: activeRoute._id,
            name: activeRoute.name,
            ar: activeRoute.ar,
            en: activeRoute.en,
            active: activeRoute.active,
            permissionsList,
          };
          if (doc?.routesList.includes(activeRoute.name)) {
            routesList.push(selectedRoute);
          } else {
            selectedRoute.active = false;
            routesList.push(selectedRoute);
          }
        }

        const data = {
          _id: doc?._id,
          name: doc?.name,
          mobile: doc?.mobile,
          email: doc?.email,
          language: {
            _id: Object(doc?.languageId)._id,
            name: Object(doc?.languageId).name,
          },
          routesList,
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
    }
  } catch (error: any) {
    console.log(`User => Update User ${error}`);
    handleError({ message: error.message, res });
  }
};

const deleted = async (req: Request, res: Response) => {
  const _id = req.body._id;
  const requestInfo = req.body.requestInfo;
  const hasRoute = await checkUserRoutes(req, res, RoutesNames.users);
  const hasPermission = await checkUserPermission(
    req,
    res,
    PermissionsNames.deleteUser,
  );

  if (!hasRoute || !hasPermission) return;
  try {
    const selectedUserToDelete = {
      _id,
      deleted: false,
    };
    const selectedUser = await User.findOne(selectedUserToDelete);

    if (!selectedUser) {
      const response = await handleNoData({ language: requestInfo.language });
      return res.send(response);
    }

    const deletedUserData = {
      active: false,
      deleted: true,
      deleteInfo: requestInfo,
    };

    const doc = await User.findOneAndUpdate({ _id }, deletedUserData, {
      new: true,
    });
    handleDeleteResponse(
      { language: requestInfo.language, data: { _id: doc?._id } },
      res,
    );
  } catch (error: any) {
    console.log(`User => Delete User ${error}`);
    handleError({ message: error.message, res });
  }
};

const getAll = async (req: Request, res: Response) => {
  const requestInfo = req.body.requestInfo;
  const hasRoute = await checkUserRoutes(req, res, RoutesNames.users);
  if (!hasRoute) return;
  try {
    let where;

    if (requestInfo.isDeveloper) {
      where = {
        query: {
          $or: [{ isDeveloper: true }, { isAdmin: true }],
          deleted: false,
        },
        ...site.setPaginationQuery(req),
      };
    } else if (requestInfo.isAdmin) {
      where = {
        query: {
          isDeveloper: false,
          deleted: false,
        },
        ...site.setPaginationQuery(req),
      };
    }
    const result = await User.paginate(where);

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
        requestInfo.isAdmin && doc?.lastUpdateInfo
          ? await setDocumentDetails(requestInfo, doc?.lastUpdateInfo)
          : undefined;
      const routesList = [];

      const allRoutesList = await Route.find({ deleted: false });
      const allPermissionsList = await Permission.find({
        deleted: false,
      });

      for await (const activeRoute of allRoutesList) {
        const permissionsList = [];
        for await (const perm of allPermissionsList) {
          if (String(Object(perm.routeId)._id) === String(activeRoute?._id)) {
            if (doc.permissionsList.includes(perm.name)) {
              permissionsList.push({
                _id: perm._id,
                routeId: Object(perm.routeId)._id,
                name: perm.name,
                ar: perm.ar,
                en: perm.en,
                active: true,
              });
            } else {
              permissionsList.push({
                _id: perm._id,
                routeId: Object(perm.routeId)._id,
                name: perm.name,
                ar: perm.ar,
                en: perm.en,
                active: false,
              });
            }
          }
        }

        const selectedRoute = {
          _id: activeRoute._id,
          name: activeRoute.name,
          ar: activeRoute.ar,
          en: activeRoute.en,
          active: activeRoute.active,
          permissionsList,
        };
        if (doc.routesList.includes(activeRoute.name)) {
          routesList.push(selectedRoute);
        } else {
          selectedRoute.active = false;
          routesList.push(selectedRoute);
        }
      }

      let isAdmin;
      if (requestInfo.isDeveloper || requestInfo.isAdmin) {
        isAdmin = doc.isAdmin;
      }

      data.push({
        _id: doc._id,
        name: doc.name,
        mobile: doc.mobile,
        email: doc.email,
        language: {
          _id: Object(doc.languageId)._id,
          name: Object(doc.languageId).name,
        },
        routesList,
        isAdmin,
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
    console.log(`User => Get All User ${error}`);
    handleError({ message: error.message, res });
  }
};

const search = async (req: Request, res: Response) => {
  const request = req.body;
  const requestInfo = req.body.requestInfo;
  const hasRoute = await checkUserRoutes(req, res, RoutesNames.users);
  if (!hasRoute) return;
  try {
    let where = { query: {} };
    if (requestInfo.isDeveloper) {
      where = {
        query: {
          $or: [{ isDeveloper: true }, { isAdmin: true }],
          deleted: false,
        },
        ...site.setPaginationQuery(req),
      };
    } else if (requestInfo.isAdmin) {
      where = {
        query: {
          isDeveloper: false,
          deleted: false,
        },
        ...site.setPaginationQuery(req),
      };
    }
    if (request.query.name) {
      Object(where.query).name = new RegExp(request.query.name, 'i');
    }
    if (request.query.mobile) {
      Object(where.query).mobile = new RegExp(request.query.mobile);
    }

    if (request.query.email) {
      Object(where.query).email = new RegExp(request.query.email, 'i');
    }

    const result = await User.paginate(where);

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
        requestInfo.isAdmin && doc?.lastUpdateInfo
          ? await setDocumentDetails(requestInfo, doc?.lastUpdateInfo)
          : undefined;
      const routesList = [];

      const allRoutesList = await Route.find({ deleted: false });
      const allPermissionsList = await Permission.find({
        deleted: false,
      });

      for await (const activeRoute of allRoutesList) {
        const permissionsList = [];
        for await (const perm of allPermissionsList) {
          if (String(Object(perm.routeId)._id) === String(activeRoute?._id)) {
            if (doc.permissionsList.includes(perm.name)) {
              permissionsList.push({
                _id: perm._id,
                routeId: Object(perm.routeId)._id,
                name: perm.name,
                ar: perm.ar,
                en: perm.en,
                active: true,
              });
            } else {
              permissionsList.push({
                _id: perm._id,
                routeId: Object(perm.routeId)._id,
                name: perm.name,
                ar: perm.ar,
                en: perm.en,
                active: false,
              });
            }
          }
        }

        const selectedRoute = {
          _id: activeRoute._id,
          name: activeRoute.name,
          ar: activeRoute.ar,
          en: activeRoute.en,
          active: activeRoute.active,
          permissionsList,
        };
        if (doc.routesList.includes(activeRoute.name)) {
          routesList.push(selectedRoute);
        } else {
          selectedRoute.active = false;
          routesList.push(selectedRoute);
        }
      }

      data.push({
        _id: doc._id,
        name: doc.name,
        mobile: doc.mobile,
        email: doc.email,
        language: {
          _id: Object(doc.languageId)._id,
          name: Object(doc.languageId).name,
        },
        routesList,
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
    console.log(`User => Search User ${error}`);
    handleError({ message: error.message, res });
  }
};

const logout = async (req: Request, res: Response) => {
  try {
    const token = req.headers['authorization'];
    const jwtPayload = String(token)?.split('Bearer ')[1];
    const decoded = jwt.verify(
      jwtPayload,
      String(process.env.ACCESS_TOKEN_SECRET),
    ) as JwtPayload;

    await Token.findOneAndUpdate(
      { userId: decoded.userId, active: true },
      {
        active: false,
        deactivateInfo: { userId: decoded.userId, date: new Date() },
      },
      {
        new: true,
      },
    );
    const language = req.headers['accept-language'] || 'ar';
    handleLoggedOutResponse(
      {
        language,
      },
      res,
    );
    // const message = await responseLanguage(
    //   req.headers['accept-language'] || 'ar',
    //   responseMessages.loggedout,
    // );

    // return res
    //   .send({
    //     success: true,
    //     message,
    //   })
    //   .status(200);
  } catch (error: any) {
    console.log(`User => logout ${error}`);
    handleError({ message: error.message, res });
  }
};

const view = async (req: Request, res: Response) => {
  const request = req.body;

  const _id = request._id;
  const requestInfo = req.body.requestInfo;
  const hasRoute = await checkUserRoutes(req, res, RoutesNames.users);

  if (!hasRoute) return;
  try {
    const doc = await User.findOne({ _id });
    const routesList = [];
    const allRoutesList = await Route.find({ deleted: false });
    const allPermissionsList = await Permission.find({
      deleted: false,
    });

    for await (const activeRoute of allRoutesList) {
      const permissionsList = [];
      for await (const perm of allPermissionsList) {
        if (String(Object(perm.routeId)._id) === String(activeRoute?._id)) {
          if (doc?.permissionsList.includes(perm.name)) {
            permissionsList.push({
              _id: perm._id,
              routeId: Object(perm.routeId)._id,
              name: perm.name,
              ar: perm.ar,
              en: perm.en,
              active: true,
            });
          } else {
            permissionsList.push({
              _id: perm._id,
              routeId: Object(perm.routeId)._id,
              name: perm.name,
              ar: perm.ar,
              en: perm.en,
              active: false,
            });
          }
        }
      }

      const selectedRoute = {
        _id: activeRoute._id,
        name: activeRoute.name,
        ar: activeRoute.ar,
        en: activeRoute.en,
        active: activeRoute.active,
        permissionsList,
      };
      if (doc?.routesList.includes(activeRoute.name)) {
        routesList.push(selectedRoute);
      } else {
        selectedRoute.active = false;
        routesList.push(selectedRoute);
      }
    }

    return res.send({
      success: true,
      statusCode: site.responseStatusCodes.view,
      data: {
        _id: doc?._id,
        name: doc?.name,
        mobile: doc?.mobile,
        email: doc?.email,
        language: {
          _id: Object(doc?.languageId)._id,
          name: Object(doc?.languageId).name,
        },
        routesList,
        active: doc?.active,
        addInfo: requestInfo.isAdmin
          ? await setDocumentDetails(requestInfo, doc?.addInfo)
          : undefined,
        lastUpdateInfo:
          requestInfo.isAdmin && doc?.lastUpdateInfo
            ? await setDocumentDetails(requestInfo, doc?.lastUpdateInfo)
            : undefined,
      },
    });
  } catch (error: any) {
    console.log(`Users => View Users ${error}`);
    handleError({ message: error.message, res });
  }
};

const validateData = async (req: Request, res: Response) => {
  const request = req.body;
  const userName = request.name;
  const userMobile = request.mobile;
  const userPassword = request.password;
  const requestLanguage = request.requestInfo.language;
  let valid = false;
  let message;

  if (!userName || userName.length < inputsLength.name) {
    message = await responseLanguage(requestLanguage, responseMessages.name);
  } else if (!userMobile || userMobile.length < inputsLength.mobile) {
    message = await responseLanguage(requestLanguage, responseMessages.mobile);
  } else if (!userPassword || userPassword.length < inputsLength.password) {
    message = await responseLanguage(
      requestLanguage,
      responseMessages.password,
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

const usersRouters = async (app: express.Application) => {
  app.post(
    `${site.api}${site.apps.users}${site.appsRoutes.add}`,
    verifyJwtToken,
    add,
  );
  app.put(
    `${site.api}${site.apps.users}${site.appsRoutes.update}`,
    verifyJwtToken,
    update,
  );
  app.put(
    `${site.api}${site.apps.users}${site.appsRoutes.delete}`,
    verifyJwtToken,
    deleted,
  );
  app.post(
    `${site.api}${site.apps.users}${site.appsRoutes.getAll}`,
    verifyJwtToken,
    getAll,
  );
  app.post(
    `${site.api}${site.apps.users}${site.appsRoutes.search}`,
    verifyJwtToken,
    search,
  );
  app.put(
    `${site.api}${site.apps.users}${site.appsRoutes.logout}`,

    logout,
  );
  app.post(
    `${site.api}${site.apps.users}${site.appsRoutes.view}`,
    verifyJwtToken,
    view,
  );
};

export default usersRouters;
