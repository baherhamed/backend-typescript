import express, { Request, Response } from 'express';
import fs from 'fs';
import { site, verifyJwtToken } from '.';
import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' });

// import Backup from 'backup-mongodb';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Backup = require('backup-mongodb');

export const backupDatabase = async (req: Request, res: Response) => {
  const backupPath = fs.existsSync('../backup');
  const db = String(process.env.DB_HOST);
  const auth = {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
  };
  console.log('db', db);
  console.log('backupPath', backupPath);
  if (!backupPath) {
    fs.mkdirSync('../backup');
  }

  const newBackup = await new Backup(db, auth, backupPath).backup();
  //   console.log('newBackup', newBackup);

//   return;
};
const backupRouters = async (app: express.Application) => {
  app.post(
    `${site.api}/backup`,
    // verifyJwtToken,
    backupDatabase
  );
};

export default backupRouters;
