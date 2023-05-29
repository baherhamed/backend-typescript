import { hashPassword } from './hash-password';
import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;
import { User } from '../models';

import { Language } from '../models';

// import { Route } from '../models';
// import { Permission } from '../models';

export const systemDefaults = (async () => {
  const defaultLangAr = await Language.findOne({
    code: 1,
  });
  const defaultLangEn = await Language.findOne({
    code: 2,
  });

  if (!defaultLangAr) {
    const newLang = new Language({
      _id: new ObjectId('606b64ba679e4903d47fa001'),
      code: 1,
      name: 'ar',
      active: true,
      deleted: false,
    });

    newLang.save(async (err: unknown) => {
      if (err) {
        console.log(
          `Error In System Default While Creating Default Arabic Language ${err}`
        );
      }
    });
  }
  if (!defaultLangEn) {
    const newLang = new Language({
      _id: new ObjectId('606b64ba679e4903d47fa002'),
      code: 2,
      name: 'en',
      active: true,
      deleted: false,
    });
    newLang.save(async (err: unknown) => {
      if (err) {
        console.log(
          `Error In System Default While Creating Default English Language ${err}`
        );
      }
    });
  }

  const developerDefaultUser = {
    name: process.env.DEVELOPER_USERNAME,
  };
  const defaultDevUser = await User.findOne(developerDefaultUser);

  if (!defaultDevUser) {
    const hashedPassword = await hashPassword({
      password: String(process.env.DEVELOPER_PASSWORD),
    });
    const routesList = ['users', 'routes', 'permissions'];
    const permissionsList = [
      'addUser',
      'updateUser',
      'deleteUser',
      'addRoute',
      'updateRoute',
      'deleteRoute',
      'addPermission',
      'updatePermission',
      'deletePermission',
    ];

    const newUser = new User({
      _id: new ObjectId('606b64ba679e4903d47ab001'),
      languageId: new ObjectId('606b64ba679e4903d47fa001'),
      password: hashedPassword.newHashedPassword,
      name: 'developer',
      mobile: '21002627613',
      email: 'baherhamed@gmail.com',
      routesList,
      permissionsList,
      active: true,
      isDeveloper: true,
      deleted: false,
    });

    newUser.save(async (err) => {
      console.log('err');

      if (err) {
        console.log(
          `Error In System Default While Creating Default Developer User ${err}`
        );
      }
    });
  }
})();
