import { app } from './server/app.js';
import { env, assertEnv } from './server/config/env.js';

assertEnv();

app.listen(env.port, () => {
  console.log(`KUROMART berjalan di http://localhost:${env.port}`);
});
