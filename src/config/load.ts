/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import path from 'path';
import pino from 'pino';
import Logger from '../utilities/logger';
import { Config, SanitizedConfig } from './types';
import findConfig from './find';
import validate from './validate';
import babelConfig from '../babel.config';

const removedExtensions = ['.scss', '.css', '.svg', '.png', '.jpg', '.eot', '.ttf', '.woff', '.woff2'];

const loadConfig = (logger?: pino.Logger, configArg?: Config): SanitizedConfig => {
  const localLogger = logger ?? Logger();

  removedExtensions.forEach((ext) => {
    require.extensions[ext] = () => null;
  });

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@babel/register')({
    ...babelConfig,
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    env: {
      development: {
        sourceMaps: 'inline',
        retainLines: true,
      },
    },
    ignore: [
      /node_modules[\\/](?!.pnpm[\\/].*[\\/]node_modules[\\/])(?!payload[\\/]dist[\\/]admin|payload[\\/]components).*/,
    ],
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let config: any;
  let configPath: string | undefined;
  if (configArg) {
    config = configArg;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    configPath = findConfig();
    config = require(configPath);
    if (config.default) config = config.default;
  }

  const validatedConfig = validate(config, localLogger);

  return {
    ...validatedConfig,
    paths: {
      ...(validatedConfig.paths || {}),
      configDir: configPath ? path.dirname(configPath) : undefined,
      config: configPath,
    },
  };
};

export default loadConfig;
