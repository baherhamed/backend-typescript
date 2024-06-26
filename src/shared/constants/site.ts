import { PaginationModel, pagination } from '..';
import { Request } from 'express';
export const site = {
  language: {
    ar: 'ar',
    en: 'en',
  },
  route: 'localhost',
  api: '/api/',
  appsRoutes: {
    login: 'login',
    add: 'add',
    update: 'update',
    search: 'search',
    delete: 'delete',
    getAll: 'getAll',
    getActive: 'getActive',
    view: 'view',
    getCitiesByGov: 'getCitiesByGov',
    changePassword: 'changePassword',
    logout: 'logout',
    getGlobalSystemSetting: 'getGlobalSystemSetting',
  },
  apps: {
    home: 'home',
    login: 'login',
    languages: 'languages/',
    routes: 'routes/',
    users: 'users/',
    govs: 'govs/',
    cities: 'cities/',
    globalSystemSetting: 'globalSystemSetting/',
    json: 'json/',
  },
  systemDefault: {
    routesList: ['globalSetting', 'users', 'routes', 'permissions'],
    permissionsList: [
      'setGlobalSetting',
      'addUser',
      'updateUser',
      'deleteUser',
      'addRoute',
      'updateRoute',
      'deleteRoute',
      'addPermission',
      'updatePermission',
      'deletePermission',
    ],
  },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pagination: (result: PaginationModel | any) => {
    return {
      totalDocs: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page,
      limit: result.limit,
      pagingCounter: result.pagingCounter,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      hasMore: result.hasMore,
    };
  },
  responseStatusCodes: {
    add: 700,
    update: 701,
    delete: 702,
    getAll: 703,
    getActive: 704,
    search: 705,
    noData: 706,
    error: 707,
    missingData: 708,
    unauthorized: 401,
    exisit: 709,
    loggedOut: 710,
    loggedInFail: 711,
    loggedInSuccess: 712,
    globalSetting: 713,
    view: 1000,
  },
  setPaginationQuery: (req: Request) => {
    return {
      page: req?.query.page || req?.body.page || pagination.page,
      limit: req?.query.limit || req?.body.limit || pagination.search,
    };
  },
};
