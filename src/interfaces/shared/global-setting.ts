import mongoose, { Schema } from 'mongoose';

import { RequestTemplate } from '../shared';

interface GeneralSystemSetting {
  displaySetting: object;

  // addInfo: typeof RequestTemplate;
  // lastUpdateInfo: typeof RequestTemplate;
}

const GolobalSettingSchema = new Schema(
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
    addInfo: RequestTemplate,
    lastUpdateInfo: RequestTemplate,
  },
  {
    versionKey: false,
    collection: 'globalSettings',
  },
);

export const GlobalSetting = mongoose.model<GeneralSystemSetting>(
  'globalSettings',
  GolobalSettingSchema,
);
