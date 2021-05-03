import Hapi from "@hapi/hapi";

export interface ILoggerPluginOptions {
  logOnConsole: boolean;
  logOnFile: boolean;
  logOnHttp: boolean;
  serverEventsOnLog: boolean;
  serverEventsOnError: boolean;
  remoteConfig: boolean;
}
export interface IConfigOptions {
  env: string;
  scopeType: string;
  scope: string;
  type: string;
  subType: string;
  category: string;
  subCategory: string;
}
