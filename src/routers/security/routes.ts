import express, { Request, Response } from 'express';
import { Route, Permission } from '../../models';
import {
  inputsLength,
  responseMessages,
  responseLanguage,
  verifyJwtToken,
  checkUserPermission,
  pagination,
  definitions,
  PermissionsNames,
} from '../../shared';

const add = async (req: Request, res: Response) => {
  const request = req.body;
  const requestInfo = req.body.requestInfo;

  const hasPermission = await checkUserPermission(
    req,
    res,
    PermissionsNames.addRoute
  );

  if (hasPermission) {
    try {
      const checkData = await validateData(req);

      if (!checkData.valid) {
        return res
          .send({
            success: false,
            message: checkData.message,
          })
          .status(400);
      }

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
        const message = await responseLanguage(
          requestInfo.language,
          responseMessages.routeExisit
        );
        return res
          .send({
            success: false,
            message,
          })
          .status(400);
      }

      const doc = new Route({
        name: request.name,
        ar: request.ar,
        en: request.en,
        active: request.active,
        deleted: false,
        add_info: requestInfo,
      });

      doc.save(async (err) => {
        if (err) {
          console.log(`Route => Add Route ${err}`);
          const message = await responseLanguage(
            requestInfo.language,
            responseMessages.err,
            String(err)
          );

          return res
            .send({
              success: true,
              message,
            })
            .status(200);
        }
        const permissionsList = [];
        if (request.permissionsList) {
          for await (const permission of request.permissionsList) {
            const newPermission = new Permission({
              route_id: doc._id,
              name: permission.name,
              ar: permission.ar,
              en: permission.en,
              active: permission.active,
              add_info: requestInfo,
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
          responseMessages.saved
        );

        return res
          .send({
            success: true,
            message,
            data: {
              _id: doc._id,
              permissionsList,
            },
          })
          .status(200);
      });
    } catch (error) {
      console.log(`Route => Add Route ${error}`);
      const message = await responseLanguage(
        requestInfo.language,
        responseMessages.invalidData
      );
      return res
        .send({
          success: false,
          message,
        })
        .status(500);
    }
  }
};

const update = async (req: Request, res: Response) => {
  const request = req.body;
  const _id = req.body._id;
  const requestInfo = req.body.requestInfo;

  const hasPermission = await checkUserPermission(
    req,
    res,
    PermissionsNames.updateRoute
  );

  if (hasPermission) {
    try {
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

      const checkIfRouteExisit = await Route.findOne(findRoute);
      const selectedRoute = await Route.findOne({ _id });

      if (
        checkIfRouteExisit &&
        String(checkIfRouteExisit['_id']) !== String(_id)
      ) {
        const message = await responseLanguage(
          requestInfo.language,
          responseMessages.routeExisit
        );

        return res
          .send({
            success: false,
            message,
          })
          .status(400);
      }
      if (selectedRoute && String(selectedRoute['_id']) === String(_id)) {
        const updatedRouteData = {
          name: request.name || selectedRoute.name,
          ar: request.ar || selectedRoute.ar,
          en: request.en || selectedRoute.ar,
          active: request.active || selectedRoute.ar,
          last_update_info: requestInfo,
        };

        const doc = await Route.findOneAndUpdate({ _id }, updatedRouteData, {
          new: true,
        });
        const permissionsList = [];
        if (request.permissionsList) {
          for await (const permission of request.permissionsList) {
            await Permission.findOneAndUpdate(
              {
                _id: permission?._id,
              },
              {
                name: permission.name,
                ar: permission.ar,
                en: permission.en,
                active: permission.active,
                last_update_info: requestInfo,
              }
            );
          }
          const selectedPermissions = await Permission.find({
            route_id: doc?._id,
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
                add_info: permission.add_info,
                last_update_info: permission.last_update_info,
              });
            }
          }
        }

        const message = await responseLanguage(
          requestInfo.language,
          responseMessages.updated
        );

        return res
          .send({
            success: true,
            message,
            data: {
              _id: doc?._id,
              name: doc?.name,
              ar: doc?.ar,
              en: doc?.en,
              active: doc?.active,
              permissionsList,
              add_info: doc?.add_info,
              last_update_info: doc?.last_update_info,
            },
          })
          .status(200);
      }
    } catch (error) {
      console.log(`Route => Update Route ${error}`);

      const message = await responseLanguage(
        requestInfo.language,
        responseMessages.invalidData
      );
      return res
        .send({
          success: false,
          message,
        })
        .status(500);
    }
  }
};

const deleted = async (req: Request, res: Response) => {
  const _id = req.body._id;
  const requestInfo = req.body.requestInfo;

  const hasPermission = await checkUserPermission(
    req,
    res,
    PermissionsNames.deleteRoute
  );

  if (hasPermission) {
    try {
      const selectedRouteToDelete = {
        _id,
        deleted: false,
      };
      const selectedRoute = await Route.findOne(selectedRouteToDelete);

      if (selectedRoute) {
        const deletedRouteData = {
          active: false,
          deleted: true,
          delete_info: requestInfo,
        };

        const doc = await Route.findOneAndUpdate({ _id }, deletedRouteData, {
          new: true,
        });

        const deletedPermissionsList = await Permission.find({
          route_id: doc?._id,
          deleted: false,
        });

        for await (const permission of deletedPermissionsList) {
          await Permission.findOneAndUpdate(
            { _id: permission._id },
            { active: false, deleted: true, delete_info: requestInfo },
            { new: true }
          );
        }

        const message = await responseLanguage(
          requestInfo.language,
          responseMessages.deleted
        );

        return res
          .send({
            success: true,
            message,
            data: {
              _id: doc?._id,
            },
          })
          .status(200);
      } else {
        const message = await responseLanguage(
          requestInfo.language,
          responseMessages.noData
        );
        return res
          .send({
            success: false,
            message,
          })
          .status(500);
      }
    } catch (error) {
      console.log(`Route => Delete Route ${error}`);

      const message = await responseLanguage(
        requestInfo.language,
        responseMessages.noData
      );
      return res
        .send({
          success: false,
          message,
        })
        .status(500);
    }
  }
};

const getAll = async (req: Request, res: Response) => {
  const request = req.body;
  const requestInfo = req.body.requestInfo;

  try {
    const query = {
      page: req.query?.page || request.query?.page || pagination.page,
      limit: req.query?.limit || request.query?.limit || pagination.getAll,
    };

    const where = {
      deleted: false,
    };

    const result = await Route.paginate(where, query);

    if (!result.docs.length) {
      const message = await responseLanguage(
        requestInfo.language,
        responseMessages.noData
      );

      return res
        .send({
          success: false,
          message,
        })
        .status(200);
    }

    const data = [];
    for await (const doc of result.docs) {
      const permissionsList = [];
      const selectedPermissionsList = await Permission.find({
        route_id: doc?._id,
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
      if (doc) {
        data.push({
          _id: doc._id,
          name: doc.name,
          ar: doc.ar,
          en: doc.en,
          active: doc.active,
          permissionsList,
          add_info: doc.add_info,
          last_update_info: doc.last_update_info,
        });
      }
    }
    const paginationInfo = {
      totalDocs: result.totalDocs,
      limit: result.limit,
      totalPages: result.totalPages,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
    };

    const message = await responseLanguage(
      requestInfo.language,
      responseMessages.done
    );

    return res
      .send({
        success: true,
        message,
        data,
        paginationInfo,
      })
      .status(200);
  } catch (error) {
    console.log(`Route => Search Route ${error}`);

    const message = await responseLanguage(
      requestInfo.language,
      responseMessages.invalidData
    );
    return res
      .send({
        success: false,
        message,
      })
      .status(500);
  }
};

const search = async (req: Request, res: Response) => {
  const request = req.body;
  const requestInfo = req.body.requestInfo;

  try {
    const query = {
      page: req.query?.page || request.query?.page || pagination.page,
      limit: req.query?.limit || request.query?.limit || pagination.search,
    };

    const where = {
      isDeveloper: false,
      deleted: false,
    };

    if (request.name) {
      Object(where)['name'] = new RegExp(request.name);
    }
    if (request.ar) {
      Object(where)['ar'] = new RegExp(request.ar);
    }

    if (request.en) {
      Object(where)['en'] = new RegExp(request.en);
    }

    const result = await Route.paginate(where, query);

    if (!result.docs.length) {
      const message = await responseLanguage(
        requestInfo.language,
        responseMessages.noData
      );

      return res
        .send({
          success: false,
          message,
        })
        .status(200);
    }

    const data = [];
    for await (const doc of result.docs) {
      const permissionsList = [];
      const selectedPermissionsList = await Permission.find({
        route_id: doc?._id,
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
      if (doc) {
        data.push({
          _id: doc._id,
          name: doc.name,
          ar: doc.ar,
          en: doc.en,
          active: doc.active,
          permissionsList,
          add_info: doc.add_info,
          last_update_info: doc.last_update_info,
        });
      }
    }
    const paginationInfo = {
      totalDocs: result.totalDocs,
      limit: result.limit,
      totalPages: result.totalPages,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
    };

    const message = await responseLanguage(
      requestInfo.language,
      responseMessages.done
    );

    return res
      .send({
        success: true,
        message,
        data,
        paginationInfo,
      })
      .status(200);
  } catch (error) {
    console.log(`Route => Get All ${error}`);

    const message = await responseLanguage(
      requestInfo.language,
      responseMessages.invalidData
    );
    return res
      .send({
        success: false,
        message,
      })
      .status(500);
  }
};

async function validateData(req: Request) {
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
      responseMessages.routeName
    );
  } else if (!routeNameAr || routeNameAr.length < inputsLength.routeName) {
    message = await responseLanguage(
      requestLanguage,
      responseMessages.routeName
    );
  } else if (!routeNameEn || routeNameEn.length < inputsLength.routeName) {
    message = await responseLanguage(
      requestLanguage,
      responseMessages.routeName
    );
  } else {
    valid = true;
    message = await responseLanguage(requestLanguage, responseMessages.valid);
  }
  return {
    valid,
    message,
  };
}

const routessRouters = async (app: express.Application) => {
  app.post(`${definitions.api}/security/routes/add`, verifyJwtToken, add);
  app.patch(
    `${definitions.api}/security/routes/update`,
    verifyJwtToken,
    update
  );
  app.delete(
    `${definitions.api}/security/routes/delete`,
    verifyJwtToken,
    deleted
  );
  app.post(
    `${definitions.api}/security/routes/get_all`,
    verifyJwtToken,
    getAll
  );
  app.post(`${definitions.api}/security/routes/search`, verifyJwtToken, search);
};

export default routessRouters;
