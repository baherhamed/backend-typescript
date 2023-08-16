import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import util from 'util';
import fs from 'fs';

import {
  // PermissionsNames,
  // RoutesNames,
  // checkUserPermission,
  // checkUserRoutes,
  definitions,
  // responseLanguage,
  // responseMessages,
  // setRequestLanguage,
  // verifyJwtToken,
} from '.';
import formidable from 'formidable';


const fileFilter = async (
  req: Request,
  file: { mimetype: string },
  cb: (arg0: null, arg1: boolean) => void
) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'application/pdf'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../uploads');
  },

  filename: function (req, file, cb) {
    // const request = req.body;
    cb(
      null,
      // request.fileId +
        // '-' +
        // request.servicePhone +
        // '-' +
        new Date().getTime() +
        path.extname(file.originalname)
    );
  },
});

const uploadFile = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter,
});

const checkUploadsDir = async (
  req: Request,
  res: Response,
  cb: (arg0: null, arg1: boolean) => void
) => {
  const dirExisit = fs.existsSync('../uploads');
  if (!dirExisit) {
    fs.mkdirSync('../uploads');
  }

  cb(null, true);
};



// const removeCustomerDoc = async (req: Request, res: Response) => {
//   const hasRoute = await checkUserRoutes(req, res, RoutesNames.customers);
//   const hasPermission = await checkUserPermission(
//     req,
//     res,
//     PermissionsNames.removeCustomerDoc
//   );

//   if (!hasRoute || !hasPermission) return;

//   const request = req.body;
//   const _id = request._id;
//   const requestInfo = request.requestInfo;
//   const findCustomer = {
//     _id: request._id,
//     deleted: false,
//   };

//   const selectedCustomer = await Customer.findOne(findCustomer);
//   const newUploadedFiles = [];
//   if (selectedCustomer && selectedCustomer.customerFiles) {
//     let deletedFile;
//     for await (const file of selectedCustomer.customerFiles) {
//       if (file && file.fileName === request.fileName) {
//         deletedFile = '../uploads/' + file.fileName;
//         fs.unlink(deletedFile, async (err) => {
//           if (err) {
//             console.error(err);
//             return;
//           }
//         });
//       }
//       if (file && file.fileName !== request.fileName) {
//         newUploadedFiles.push(file);
//       }
//     }
//     const setNewFIles = await Customer.findByIdAndUpdate(
//       _id,
//       {
//         customerFiles: newUploadedFiles,
//       },
//       {
//         new: true,
//       }
//     );
//     if (setNewFIles) {
//       const message = await responseLanguage(
//         requestInfo.language,
//         responseMessages.deleted
//       );
//       return res.send({
//         success: true,
//         message,
//         data: {
//           _id: setNewFIles._id,
//           customerFiles: setNewFIles.customerFiles,
//           deletedFileName: request.fileName,
//         },
//       });
//     }
//   }
// };

const uploadsRouters = async (app: express.Application) => {
  app.post(
    `${definitions.api}/uploadCustomerDoc`,
    checkUploadsDir,
    uploadFile.single('customerDoc'),
    async (req: Request, res: Response) => {
      // const language = await setRequestLanguage(req);

      // const request = req.body;
      // const _id = request._id;

      const form = formidable({});

      form.parse(req, async (err, fields, files) => {
        res.writeHead(200, {
          'content-type': '*',
        });
        res.write('received upload:\n\n');

        res.end(
          util.inspect({
            fields: fields,
            files: files,
          })
        );
      });

      // const newDoc = {
        // fileType: json.customerFilesList.find(
        //   (el: { id: number }) => el.id === Number(request.fileId)
        // ),
        // fileName: req.file?.filename,
      // };

      // const doc = await Customer.findOneAndUpdate(
      //   { _id },
      //   {
      //     $push: {
      //       customerFiles: newDoc,
      //     },
      //   },
      //   {
      //     new: true,
      //   }
      // );

      // if (!doc) {
      //   const message = await responseLanguage(
      //     language,
      //     responseMessages.missingId
      //   );
      //   return res
      //     .send({
      //       success: false,
      //       message,
      //     })
      //     .status(400); G
      // }
      // const customerFiles = [];
      // for (const file of doc.customerFiles) {
      //   if (file) {
      //     customerFiles.push({
      //       fileType: json.customerFilesList.find(
      //         (el: { id: number }) => el.id === request.fileId
      //       ),
      //       fileName: file.fileName,
      //     });
      //   }
      // }

      // const message = await responseLanguage(
      //   language,
      //   responseMessages.uploaded
      // );

      // return res.send({
      //   success: true,
      //   message,
      //   data: {
      //     _id: doc._id,
      //     customerFiles: doc.customerFiles,
      //   },
      // });
    }
  );

  // app.post(
  //   `${definitions.api}/removeCustomerDoc`,
  //   verifyJwtToken,
  //   removeCustomerDoc
  // );

  // app.post(
  //   `${definitions.api}/upload`,
  //   verifyJwtToken,
  //   checkUploadsDir,
  //   uploadFile.single('doc'),
  //   async (req: Request, res: Response) => {
  //     const request = req.body.requestInfo || { language: 'en' };
  //     const message = await responseLanguage(
  //       request.language,
  //       responseMessages.uploaded
  //     );

  //     res.send({ success: true, message }).status(200);
  //   }
  // );
};

export default uploadsRouters;
