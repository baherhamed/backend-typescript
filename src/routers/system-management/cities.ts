import express, { Request, Response } from 'express';
import { City } from '../../models';

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
    PermissionsNames.addCity
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

      const findCity = {
        gov_id: request.gov_id,
        name: request.name,
        deleted: false,
      };

      const checkNewCity = await City.findOne(findCity);

      if (checkNewCity) {
        const message = await responseLanguage(
          requestInfo.language,
          responseMessages.cityExisit
        );
        return res
          .send({
            success: false,
            message,
          })
          .status(400);
      }

      const doc = new City({
        gov_id: request.gov_id,
        name: request.name,
        active: request.active,
        deleted: false,
        add_info: requestInfo,
      });

      doc.save(async (err: any) => {
        if (err) {
          console.log(`City => Add City ${err}`);
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
    } catch (error) {
      console.log(`City => Add City ${error}`);
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
    PermissionsNames.updateCity
  );

  if (hasPermission) {
    try {
      const findCity = {
        name: request.name,

        deleted: false,
      };

      const selectedCity = await City.findOne(findCity);

      if (selectedCity && String(selectedCity['_id']) !== String(_id)) {
        const message = await responseLanguage(
          requestInfo.language,
          responseMessages.cityExisit
        );

        return res
          .send({
            success: false,
            message,
          })
          .status(400);
      }
      if (
        !selectedCity ||
        (selectedCity && String(selectedCity['_id']) === String(_id))
      ) {
        const updatedCityData = {
          name: request.name,

          active: request.active,
          last_update_info: requestInfo,
        };

        const doc = await City.findOneAndUpdate({ _id }, updatedCityData, {
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
              gov: {
                _id: Object(doc?.gov_id)._id,
                name: Object(doc?.gov_id).name,
              },
              name: doc?.name,
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
      console.log(`City => Update City ${error}`);

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
    PermissionsNames.deleteCity
  );

  if (hasPermission) {
    try {
      const selectedCityToDelete = {
        _id,
        deleted: false,
      };
      const selectedCity = await City.findOne(selectedCityToDelete);

      if (selectedCity) {
        const deletedCityData = {
          active: false,
          deleted: true,
          delete_info: requestInfo,
        };

        const doc = await City.findOneAndUpdate({ _id }, deletedCityData, {
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
      console.log(`City => Delete City ${error}`);

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

    const result = await City.paginate(where, query);

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
      data.push({
        _id: doc._id,
        gov: {
          _id: Object(doc.gov_id)._id,
          name: Object(doc.gov_id).name,
        },
        name: doc.name,
        active: doc.active,
        add_info: requestInfo.isAdmin ? doc.add_info : undefined,
        last_update_info: requestInfo.isAdmin
          ? doc.last_update_info
          : undefined,
      });
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
    console.log(`City => Search City ${error}`);

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

    if (request.query.name) {
      Object(where)['name'] = new RegExp(request.query.name, 'i');
    }

    const result = await City.paginate(where, query);

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
          gov: {
            _id: Object(doc.gov_id)._id,
            name: Object(doc.gov_id).name,
          },
          name: doc.name,
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
    console.log(`City => Get All ${error}`);

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

const getActive = async (req: Request, res: Response) => {
  const requestInfo = req.body.requestInfo;

  try {
    const where = {
      active: true,
      deleted: false,
    };

    const result = await City.find(where);

    if (!result.length) {
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
    for await (const doc of result) {
      if (doc) {
        data.push({
          _id: doc._id,
          name: doc.name,
          active: doc.active,
        });
      }
    }

    const message = await responseLanguage(
      requestInfo.language,
      responseMessages.done
    );

    return res
      .send({
        success: true,
        message,
        data,
      })
      .status(200);
  } catch (error) {
    console.log(`City => Get Active City ${error}`);

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
  const cityName = request.name;
  const requestLanguage = request.requestInfo.language;
  let valid = false;
  let message;

  if (!cityName || cityName.length < inputsLength.cityName) {
    message = await responseLanguage(
      requestLanguage,
      responseMessages.cityName
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

const citiesRouters = async (app: express.Application) => {
  app.post(
    `${definitions.api}/systemManagement/cities/add`,
    verifyJwtToken,
    add
  );
  app.put(
    `${definitions.api}/systemManagement/cities/update`,
    verifyJwtToken,
    update
  );
  app.put(
    `${definitions.api}/systemManagement/cities/delete`,
    verifyJwtToken,
    deleted
  );
  app.post(
    `${definitions.api}/systemManagement/cities/get_all`,
    verifyJwtToken,
    getAll
  );
  app.post(
    `${definitions.api}/systemManagement/cities/search`,
    verifyJwtToken,
    search
  );
  app.post(
    `${definitions.api}/systemManagement/cities/get_active`,
    verifyJwtToken,
    getActive
  );
};

export default citiesRouters;
