import { GlobalSetting, RequestTemplate } from '..';

export const setDocumentDetails = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestInfo: any,
  data?: RequestTemplate,
) => {
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
      return {
        userName: Object(data).userId?.name,
        browser:
          Object(data).browser?.name + ' - ' + Object(data).browser?.version,
        mobile: Object(data).browser?.mobile,
        os: Object(data).os?.name,
        ipAddress: Object(data)?.ip_address || Object(data)?.ipAddress,
        date: Object(data)?.date,
      };
    }
  } catch (error) {
    console.log('error ==> setDocumentDetails', error);
  }
};
