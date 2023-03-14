import { Logger } from '@nestjs/common';
import { App } from './app.entry';
import { getConfigFromEnv } from './common/config/configuration.dto';

function listenCallback() {
  Logger.log(
    `*** Application running in [${
      getConfigFromEnv().environment
    }] environment on port [${getConfigFromEnv().port}] ***`,
  );
}
async function bootstrap() {
  const app = await new App().initialize();
  // app.useGlobalPipes(new ValidationPipe());
  await app.listen(getConfigFromEnv().port, listenCallback);
}
bootstrap();
