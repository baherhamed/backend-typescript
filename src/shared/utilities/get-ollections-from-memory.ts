import {
  cashedCollectionsList,
  handleGetActiveResponse,
  loadCollectionsToMemory,
  setRequestLanguage,
} from '..';

import { Request, Response } from 'express';

export async function getCollectionsToMemory(
  req: Request,
  res: Response,
  app: string,
  listNameInMembery: string,
) {
  const appName = app.split('/')[0];
  const language = await setRequestLanguage(req);

  if (cashedCollectionsList.includes(appName)) {
    const myCache = loadCollectionsToMemory();
    const data = await (await myCache).get(listNameInMembery);

    return handleGetActiveResponse({ req, language, data }, res);
  }
}
