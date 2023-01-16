import { Request } from 'express';
export const setRequestLanguage = async (req: Request) => {
  let requestLanguage = '';
  if (req.acceptsLanguages()[0] === '*') {
    requestLanguage = 'en';
  } else {
    requestLanguage = req.acceptsLanguages()[0];
  }

  return requestLanguage.toLowerCase();
};
