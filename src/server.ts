import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' });
import bodyParser from 'body-parser';
import express from 'express';

import { systemDefaults } from './shared/system-default';
import mongoose from 'mongoose';
import cors from 'cors';
import routesRouters from './routers/security/routes';
import usersRouters from './routers/security/user';
import loginRouters from './routers/security/login';
import languageRouters from './routers/system-management/languages';

const app = express();

app.use(
  bodyParser.urlencoded({
    limit: '5mb',
    // extended: false,
    extended: true,
  }),

  bodyParser.json({
    limit: '5mb',
  })
);

mongoose.set('strictQuery', true);
mongoose.set('strictPopulate', true);
try {
  mongoose.connect(String(process.env.DB_HOST), {
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    auth: {
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
    },
    // ssl: false,
    // sslValidate: false,
  });

  console.log('Successfully Connected To Database');
} catch (error) {
  console.log(`Error While Connecting Database ${error}`);
}

app.use(cors());
loginRouters(app);
routesRouters(app);
usersRouters(app);
languageRouters(app);

// let privateKey: Promise<string>;
// let certificate: Promise<string>;
// let fullchain: Promise<string>;
// let dir = './cer';

// if (!fsPromises.access(dir)) {
//   dir = '/etc/letsencrypt/live/tebah.site';
// }

// privateKey = fsPromises.readFile(`${dir}/privkey.pem`, 'utf8');
// certificate = fsPromises.readFile(`${dir}/cert.pem`, 'utf8');
// fullchain = fsPromises.readFile(`${dir}/fullchain.pem`, 'utf8');

// if (!privateKey || !certificate) {
//   privateKey = fsPromises.readFile(`${dir}/privkey.pem`, 'utf8');
//   certificate = fsPromises.readFile(`${dir}/cert.pem`, 'utf8');
//   fullchain = fsPromises.readFile(`${dir}/fullchain.pem`, 'utf8');
// }

// const credentials = {
//   key: privateKey,
//   cert: certificate,
//   ca: fullchain,
//   ciphers: sslConfig.ciphers,
//   honorCipherOrder: true,
//   secureOptions: sslConfig.minimumTLSVersion,
// };

// const httpServer = http.createServer(app);
// const httpsServer = https.createServer(credentials, app);
// systemDefaults;
// console.log('process.env.PORT', process.env.PORT);
// console.log('systemDefaults', systemDefaults);

const appServer = app.listen(Number(process.env.PORT), () => {
  systemDefaults;
  console.log(`
  -------------------------
   Server Run At Port:${process.env.PORT}
  -------------------------`);
});

// httpServer.listen(process.env.PORT, () => {
//   systemDefaults;
//   console.log(`
//   -------------------------
//    Server Run at port:${process.env.PORT}
//   -------------------------`);
// });

// httpsServer.listen(process.env.SSLPORT, () => {
// console.log(`
// -------------------------
//  Server Run at port:${process.env.SSLPORT}
// -------------------------`);
// });

export default appServer;
