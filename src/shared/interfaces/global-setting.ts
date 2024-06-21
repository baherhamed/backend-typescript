import mongoose, { PaginateModel, PaginateOptions, Schema } from 'mongoose';

interface GeneralSystemSetting {
  displaySetting: object;
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
        id: Number,
        name: String,
        ar: String,
        en: String,
      },
    },
  },
  {
    versionKey: false,
  },
);

type GlobalSystemSettingModel = PaginateModel<GeneralSystemSetting>;

export const GlobalSetting: GlobalSystemSettingModel = mongoose.model<
  GeneralSystemSetting,
  PaginateModel<GeneralSystemSetting>,
  PaginateOptions
>('globalSettings', GlobalSettingSchema);
