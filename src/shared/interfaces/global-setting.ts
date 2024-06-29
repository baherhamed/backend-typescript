import mongoose, { Schema } from 'mongoose';
import { Pagination } from 'mongoose-paginate-ts';
interface GeneralSystemSetting {
  // displaySetting: object;\
  displaySetting: {
    displayRecordDetails: {
      type: boolean;
      default: false;
    };
    showTooltip: {
      type: boolean;
      default: false;
    };
    tooltipPosition: {
      id: number;
      name: string;
      ar: string;
      en: string;
    };
    displayTooltipPosition: string;
  };
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

type GlobalSystemSettingModel = Pagination<GeneralSystemSetting>;

export const GlobalSetting: GlobalSystemSettingModel = mongoose.model<
  GeneralSystemSetting,
  Pagination<GeneralSystemSetting>
>('globalSettings', GlobalSettingSchema);
