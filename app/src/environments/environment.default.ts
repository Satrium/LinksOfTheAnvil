import * as packageinfo from "../../../package.json"

const defaultGraphConfig = {

};

export const environment = {
  production: false,
  defaultConfig: defaultGraphConfig,
  version: packageinfo.version
};
