import { collectionsCachenamesList } from '..';
import { Gov, City } from '../../interfaces';

import NodeCache from 'node-cache';
const ttlTime = 86400000 * 3 * 365; // 3 year
// const today = new Date();
// console.log('tody', today);

// console.log('ttlTime', new Date(today.setTime(today.getTime() + ttlTime)));

export async function loadCollectionsToMemory() {
  const systemCache = new NodeCache();
  const govData = (await Gov.find({ active: true, deleted: false })).map(
    (i) => {
      return { _id: i._id, name: i.name, code: i.code };
    },
  );
  const cityData = (await City.find({ active: true, deleted: false })).map(
    (doc) => {
      return {
        _id: doc._id,
        gov: {
          _id: Object(doc.govId)._id,
          code: Object(doc.govId).code,
          name: Object(doc.govId).name,
        },
        name: doc.name,
      };
    },
  );
  systemCache.set(collectionsCachenamesList.gov, govData, ttlTime);
  systemCache.set(collectionsCachenamesList.city, cityData, ttlTime);
  return systemCache;
}
