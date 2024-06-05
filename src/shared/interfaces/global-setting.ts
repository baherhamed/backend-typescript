import mongoose, { PaginateModel, PaginateOptions, Schema } from 'mongoose';


interface GeneralSystemSetting {
  displaySetting: object;

  // addInfo: typeof RequestTemplate;
  // lastUpdateInfo: typeof RequestTemplate;
}

const GlobalSettingSchema = new Schema<GeneralSystemSetting>(
  {
    displaySetting: {
      displayRecordDetails: {
        type: Boolean,
        default: false,
      },
      showTooltip: {
        type: Boolean,
        default: false,
      },
      tooltipPosition: {
        // type: Object,
        id: Number,
        name: String,
        ar: String,
        en: String,
      },
    },
    // displaySetting:{},
    // addInfo: RequestTemplate,
    // lastUpdateInfo: RequestTemplate,
  },
  {
    versionKey: false,
    collection: 'globalSettings',
  },
);

type GlobalSystemSettingModel = PaginateModel<GeneralSystemSetting>;

export const GlobalSetting: GlobalSystemSettingModel = mongoose.model<GeneralSystemSetting, PaginateModel<GeneralSystemSetting>, PaginateOptions>(
  'globalSettings', GlobalSettingSchema
);
