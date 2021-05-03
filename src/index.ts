import Hapi from "@hapi/hapi";
const { Logger } = require("@timeless-systems/logger");
const axios = require("axios");
const pluginName = "log";
const env = process.env.NODE_ENV || "production";
import { ILoggerPluginOptions, IConfigOptions } from './interfaces'

// plugin to instantiate Prisma Client
const logPlugin: Hapi.Plugin<Partial<ILoggerPluginOptions>> = {
  name: pluginName,
  version: "1.0.0",
  register: async function (server: Hapi.Server, options: Partial<ILoggerPluginOptions>) {
    // clone all user options to account for internal mutations, except for existing stream and pino instances
    const {
      logOnConsole = true,
      logOnFile = true,
      logOnHttp = true,
      serverEventsOnLog = true,
      serverEventsOnError = false,
      remoteConfig = true,
    } = options;

    const configurationProtocol = process.env.CONFIGURATION_PROTOCOL || "http";
    const configurationHost = process.env.CONFIGURATION_HOST || "127.0.0.1";
    const configurationPort = process.env.CONFIGURATION_PORT || "3004";
    const configurationUrl = `${configurationProtocol}://${configurationHost}:${configurationPort}`;

    const defaultLoggerOptions: any = {
      transports: [
        {
          type: "console",
          level: "info",
        },
        {
          type: "file",
          level: "info",
          filename: "./logs/output.log",
        },
        {
          type: "http",
          level: "info",
        },
      ],
    };

    const Params: IConfigOptions = {
      env: 'development',
      scopeType: 'svc',
      scope: 'svc-etc-csv',
      type: 'config',
      subType: 'logger',
      category: '',
      subCategory: '',
    };

    const Config = {
      method: "get",
      url: `${configurationUrl}/configuration/find/`,
    };

    let loggerOptions;
    
    if (remoteConfig) {
      console.log(`${configurationUrl}`)
      try {
        let response = await axios.get(`${configurationUrl}/configuration/find/`, { params: Params } );
        console.log(`response.status : ${response.status}`)
        if (response.status === 200) {
          loggerOptions = response.data[0].value;
          console.log("Remote logger options ");
          console.log(JSON.stringify(loggerOptions, null, 4));
        } else {
          loggerOptions = defaultLoggerOptions;
          console.log("Default logger options ");
          console.log(JSON.stringify(loggerOptions, null, 4));
        }
      } catch (error) {
        console.log("Default logger options as remoteConfig = false");
        loggerOptions = defaultLoggerOptions;
      }
    } else {
      loggerOptions = defaultLoggerOptions;
    }
    
    console.log(` options: ${JSON.stringify(options, null, 4)}`)
    console.log(` LoggerOptions: ${JSON.stringify(loggerOptions, null, 4)}`)
  
    const logger = new Logger(loggerOptions);

    // expose logger as 'server.logger'
    server.decorate("server", "logger", logger);

    server.events.on("log", function (event) {
      if (options.serverEventsOnLog) {
        // server.logger.info(event);
      }
    });

    // Close DB connection after the server's connection listeners are stopped
    // Related issue: https://github.com/hapijs/hapi/issues/2839
    server.ext({
      type: "onPostStop",
      method: async (server: Hapi.Server) => {
        //server.app.prisma.$disconnect()
      },
    });
  },
};

export default logPlugin;
