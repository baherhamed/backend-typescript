import 'dotenv/config';
import * as dotenv from 'dotenv';

dotenv.config({ path: __dirname + '/.env' });

import bodyParser from 'body-parser';
import express from 'express';

// eslint-disable-next-line @typescript-eslint/no-var-requires
// const sslConfig = require('ssl-config')('modern');
import * as http from 'http';
import * as https from 'https';

import fs from 'fs';

import { systemDefaults } from './shared/system-default';
import mongoose from 'mongoose';
import cors from 'cors';
import routesRouters from './routers/security/routes';

import usersRouters from './routers/security/user';
import loginRouters from './routers/security/login';

import languageRouters from './routers/system-management/languages';
import govsRouters from './routers/system-management/govs';
import citiesRouters from './routers/system-management/cities';
import GlobalSettingRouters from './routers/shared/global-setting';
import jsonRouters from './routers/json/fixed';


const app = express();

app.use(
  bodyParser.urlencoded({
    limit: '1mb',
    extended: true,
  }),

  bodyParser.json({
    limit: '1mb',
  }),
);

mongoose.set('strictQuery', true);
mongoose.set('strictPopulate', true);

(async () => {
  try {

    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      useNewUrlParser: true, 
      useUnifiedTopology: true,
      auth: {
        username: process.env.dbUser,
        password: process.env.dbPass,
      }
    };

    await mongoose.connect(String(process.env.url), options);
    await systemDefaults();

    console.log('Successfully Connected To Database');
  } catch (error) {
    console.log(`Error While Connecting Database ${error}`);

  }
})();

app.post('/', (req, res) => {
  res.send('Backend works post request');
});

app.get('/', (req, res) => {
  res.send('Backend works get request');
});

app.use(cors());
loginRouters(app);
routesRouters(app);
languageRouters(app);
govsRouters(app);
usersRouters(app);
citiesRouters(app);
GlobalSettingRouters(app);
jsonRouters(app);

let privateKey;
let certificate: string;
let fullchain: string;
let dir = './cer';

if (!fs.existsSync(dir)) {
  dir = '/etc/letsencrypt/live/resellers.tebah-soft.com';
}

privateKey = fs.readFileSync(`${dir}/privkey.pem`, 'utf8');
certificate = fs.readFileSync(`${dir}/cert.pem`, 'utf8');
fullchain = fs.readFileSync(`${dir}/fullchain.pem`, 'utf8');

if (!privateKey || !certificate) {
  privateKey = fs.readFileSync(`${dir}/privkey.pem`, 'utf8');
  certificate = fs.readFileSync(`${dir}/cert.pem`, 'utf8');
  fullchain = fs.readFileSync(`${dir}/fullchain.pem`, 'utf8');
}

const credentials = {
  key: privateKey,
  cert: String(certificate),
  ca: String(fullchain),
  // ciphers: sslConfig.ciphers,
  honorCipherOrder: true,
  // secureOptions: sslConfig.minimumTLSVersion,
  passphrase: 'sample',
  agent: false,
};

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(process.env.PORT, async () => {
  console.log(`
  -------------------------
  Server Run Http at PORT: ${process.env.PORT}
  -------------------------`);
});

httpsServer.listen(process.env.SSLPORT, async () => {
  console.log(`
  -------------------------
  Server Run Https at PORT: ${process.env.SSLPORT}
  -------------------------`);
});

export default { httpServer, httpsServer };
