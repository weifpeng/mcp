import fs from "node:fs/promises";
import { config } from "../../config";
import merge from "lodash/merge.js";
import { globalDataSchema, type IStorage } from "./type";

const DATA_FILE_PATH = config.dataFilePath;

export const setGlobalData: IStorage["setGlobalData"] = async (data) => {
  if (!DATA_FILE_PATH) {
    throw new Error("DATA_FILE_PATH is not set");
  }
  const currentData = await getGlobalData();
  const newData = globalDataSchema.parse(merge(currentData, data));
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(newData, null, 2));
};

export const getGlobalData: IStorage["getGlobalData"] = async () => {
  if (!DATA_FILE_PATH) {
    throw new Error("DATA_FILE_PATH is not set");
  }
  const data = await fs.readFile(DATA_FILE_PATH, "utf-8");
  return globalDataSchema.parse(JSON.parse(data));
};
