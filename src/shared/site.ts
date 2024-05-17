export const site = {
  language: {
    ar: 'ar',
    en: 'en',
  },
  route: 'localhost',
  api: '/api/',
  modules: {
    security: 'security/',
    systemManagement: 'systemManagement/',
  },
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
  },
  apps: {
    home: 'home',
    login: 'login',
    languages: 'languages/',
    routes: 'routes/',
    users: 'users/',
    govs: 'govs/',
    cities: 'cities/',
    generalSystemSetting: 'generalSystemSetting/',
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
  pagination: (result: any) => {
    return {
      totalDocs: result.totalDocs,
      limit: result.limit,
      totalPages: result.totalPages,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
    };
  },
};
