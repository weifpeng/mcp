import mergeWith from "lodash/mergeWith.js";
import { globalDataSchema, type IStorage } from "./type";

let DATA = globalDataSchema.parse({
  addressData: [],
  signData: [],
});

export const setGlobalData: IStorage["setGlobalData"] = async (data) => {
  DATA = globalDataSchema.parse(
    mergeWith(DATA, data, (objValue, srcValue) => {
      if (Array.isArray(objValue) && Array.isArray(srcValue)) {
        const resultArray = [...objValue];
        for (const newItem of srcValue) {
          const idField =
            "id" in newItem ? "id" : "address" in newItem ? "address" : null;
          if (!idField) continue;
          const existingIndex = resultArray.findIndex(
            (item) => idField in item && item[idField] === newItem[idField],
          );

          if (existingIndex >= 0) {
            resultArray[existingIndex] = newItem;
          } else {
            resultArray.push(newItem);
          }
        }

        return resultArray;
      }
      return undefined;
    }),
  );
  return;
};

export const getGlobalData: IStorage["getGlobalData"] = async () => {
  return DATA;
};
