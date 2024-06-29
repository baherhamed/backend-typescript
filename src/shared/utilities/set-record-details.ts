import { GlobalSetting } from '..';
import { User } from '../../interfaces';
import browser from 'browser-detect';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setDocumentDetails = async (requestInfo: any, data?: any) => {
  const globalSetting = await GlobalSetting.findOne({});

  try {
    if (!globalSetting || !requestInfo || !requestInfo?.isAdmin) {
      return {};
    } else if (
      globalSetting &&
      Object(globalSetting).displaySetting.displayRecordDetails
    ) {
      const requestBrowser = browser(data?.userAgent);

      const _id = String(data.userId);
      const ipAddress = Object(data).ipAddress;
      const language = Object(data).language;
      const date = Object(data).date;
      const selectedUser = await User.findOne({
        _id,
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
        isAdmin,
        isDeveloper,
      };
    }
  } catch (error) {
    console.log('error ==> setDocumentDetails', error);
  }
};
