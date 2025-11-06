import { fileLogger } from "./fileLogger";
import { dbLog } from "./dbLogger";

export const log = {
  info: (msg: string, meta: any = {}) => {
    fileLogger.info(msg, meta);
    dbLog("info", msg, meta);
  },
  warn: (msg: string, meta: any = {}) => {
    fileLogger.warn(msg, meta);
    dbLog("warn", msg, meta);
  },
  error: (msg: string, meta: any = {}) => {
    fileLogger.error(msg, meta);
    dbLog("error", msg, meta);
  },
  debug: (msg: string, meta: any = {}) => {
    fileLogger.debug(msg, meta);
    dbLog("debug", msg, meta);
  },
};
