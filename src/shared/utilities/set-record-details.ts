import { GlobalSetting } from '..';
import { User } from '../../interfaces';
import browser from 'browser-detect';
export const setDocumentDetails = async (requestInfo: any, data?: any) => {
  const globalSetting = await GlobalSetting.findOne({});
  try {
    if (
      (!globalSetting &&
        Object(globalSetting).displaySetting.displayRecordDetails) ||
      !requestInfo ||
      (!requestInfo.isAdmin && !requestInfo.isDeveloper)
    ) {
      return {};
    } else if (
      globalSetting &&
      Object(globalSetting).displaySetting.displayRecordDetails
    ) {
      const requestBrowser = browser(data?.userAgent);

      const ipAddress = Object(data).ipAddress;
      const language = Object(data).language;
      const date = Object(data).date;
      const selectedUser = await User.findOne({
        _id: Object(data).userId,
        active: true,
        deleted: false,
      });
      let isAdmin = false;
      let isDeveloper = false;
      if (selectedUser?.isAdmin) {
        isAdmin = true;
      }
      if (selectedUser?.isDeveloper) {
        isDeveloper = true;
      }

      return {
        userName: selectedUser?.name,
        browser: requestBrowser?.name + ' - ' + requestBrowser?.version,
        mobile: requestBrowser?.mobile,
        os: requestBrowser.os,
        ipAddress,
        date,
        language,
      };
    }
  } catch (error) {
    console.log('error ==> setDocumentDetails', error);
  }
};
