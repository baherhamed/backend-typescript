import express, { Request, Response } from 'express';
import { User } from '../../models';
import {
  inputsLength,
  responseMessages,
  hashPassword,
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
    PermissionsNames.addUser
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
        const message = await responseLanguage(
          requestInfo.language,
          responseMessages.userExisit
        );
        return res
          .send({
            success: false,
            message,
          })
          .status(400);
      }
      const hashedPassword = await hashPassword(request);
      if (hashedPassword.success) {
        const doc = new User({
          name: request.name,
          mobile: request.mobile,
          email: request.email || request.mobile,
          language_id: request.language_id,
          routesList: request.routesList,
          permissionsList: request.permissionsList,
          password: hashedPassword.newHashedPassword,
          active: true,
          deleted: false,
          add_info: requestInfo,
        });

        doc.save(async (err) => {
          if (err) {
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
              },
            })
            .status(200);
        });
      } else {
        const message = await responseLanguage(
          requestInfo.language,
          responseMessages.password
        );

        return res
          .send({
            success: false,
            message,
          })
          .status(400);
      }
    } catch (error) {
      console.log(`User => Add User ${error}`);
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
    PermissionsNames.updateUser
  );

  if (hasPermission) {
    try {
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

      if (checkIfUserExisit) {
        const message = await responseLanguage(
          requestInfo.language,
          responseMessages.userExisit
        );
        return res
          .send({
            success: false,
            message,
          })
          .status(400);
      }
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
          language_id: request.language_id || selectedUser.language_id,
          routesList: request.routesList || selectedUser.routesList,
          permissionsList:
            request.permissionsList || selectedUser.permissionsList,
          active: request.active || selectedUser.active,
          last_update_info: requestInfo,
        };

        const doc = await User.findOneAndUpdate({ _id }, updatedUserData, {
          new: true,
        });

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
              mobile: doc?.mobile,
              email: doc?.email,
              language: {
                _id: Object(doc?.language_id)._id,
                name: Object(doc?.language_id).name,
              },
              active: doc?.active,
              add_info: requestInfo.isAdmin ? doc?.add_info : undefined,
              last_update_info: requestInfo.isAdmin
                ? doc?.last_update_info
                : undefined,
            },
          })
          .status(200);
      }
    } catch (error) {
      console.log(`User => Update User ${error}`);

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
    PermissionsNames.deleteUser
  );

  if (hasPermission) {
    try {
      const selectedUserToDelete = {
        _id,
        deleted: false,
      };
      const selectedUser = await User.findOne(selectedUserToDelete);

      if (selectedUser) {
        const deletedUserData = {
          active: false,
          deleted: true,
          delete_info: requestInfo,
        };

        const doc = await User.findOneAndUpdate({ _id }, deletedUserData, {
          new: true,
        });

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
      console.log(`User => Delete User ${error}`);

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
      isDeveloper: false,
      deleted: false,
    };

    const result = await User.paginate(where, query);

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
      if (doc) {
        data.push({
          _id: doc._id,
          name: doc.name,
          mobile: doc.mobile,
          email: doc.email,
          language: {
            _id: Object(doc.language_id)._id,
            name: Object(doc.language_id).name,
          },
          active: doc.active,
          add_info: requestInfo.isAdmin ? doc.add_info : undefined,
          last_update_info: requestInfo.isAdmin
            ? doc.last_update_info
            : undefined,
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
    console.log(`User => Search User ${error}`);

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
    if (request.mobile) {
      Object(where)['mobile'] = new RegExp(request.mobile);
    }

    if (request.email) {
      Object(where)['email'] = new RegExp(request.email);
    }

    const result = await User.paginate(where, query);

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
      if (doc) {
        data.push({
          _id: doc._id,
          name: doc.name,
          mobile: doc.mobile,
          email: doc.email,
          language: {
            _id: Object(doc.language_id)._id,
            name: Object(doc.language_id).name,
          },
          active: doc.active,
          add_info: requestInfo.isAdmin ? doc.add_info : undefined,
          last_update_info: requestInfo.isAdmin
            ? doc.last_update_info
            : undefined,
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
    console.log(`User => Get All ${error}`);

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
      responseMessages.password
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

const usersRouters = async (app: express.Application) => {
  app.post(`${definitions.api}/security/users/add`, verifyJwtToken, add);
  app.put(`${definitions.api}/security/users/update`, verifyJwtToken, update);
  app.delete(
    `${definitions.api}/security/users/delete`,
    verifyJwtToken,
    deleted
  );
  app.post(`${definitions.api}/security/users/get_all`, verifyJwtToken, getAll);
  app.post(`${definitions.api}/security/users/search`, verifyJwtToken, search);
};

export default usersRouters;