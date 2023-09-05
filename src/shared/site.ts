export const site = {
  language: {
    ar: 'ar',
    en: 'en',
  },
  route: 'localhost',
  api: '/api',
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
