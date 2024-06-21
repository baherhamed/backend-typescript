import { Request } from 'express';
export const setRequestLanguage = async (req: Request) => {
  let requestLanguage = 'en';
  if (req.acceptsLanguages()[0]) {
    requestLanguage =
      req.acceptsLanguages()[0] && req.acceptsLanguages()[0].length === 2
        ? req.acceptsLanguages()[0]
        : req.acceptsLanguages()[0].slice(0, 2);
  }

  return requestLanguage.toLowerCase();
};
