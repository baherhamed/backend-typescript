import express, { Request, Response } from 'express';
import { handleGlobalSettingResponse, setRequestLanguage, site, verifyJwtToken } from '..';



export const tooltipPositionsList = [
  {
    id: 1,
    name: 'above',
    ar: 'أعلي',
    en: 'Above',
  },
  {
    id: 2,
    name: 'below',
    ar: 'أسفل',
    en: 'Below',
  },
  {
    id: 3,
    name: 'right',
    ar: 'يمين',
    en: 'Right',
  },
  {
    id: 4,
    name: 'left',
    ar: 'يسار',
    en: 'Left',
  },
  {
    id: 5,
    name: 'before',
    ar: 'قبل',
    en: 'Before',
  },
  {
    id: 6,
    name: 'after',
    ar: 'بعد',
    en: 'After',
  },
];

const getTooltipPosition = async (req: Request, res: Response) => {
  const language = await setRequestLanguage(req);
  handleGlobalSettingResponse({ language, data: tooltipPositionsList }, res);
};

const jsonRouters = async (app: express.Application) => {
  app.get(
    `${site.api}${site.apps.json}getTooltipPosition`,
    verifyJwtToken,
    getTooltipPosition,
  );
};

export default jsonRouters;
