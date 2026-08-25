import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";

// Bind explicitly to all interfaces — some container/proxy setups (e.g. ShardCloud)
// only route traffic to 0.0.0.0, and Node's default bind can behave differently
// depending on the platform's IPv4/IPv6 configuration.
app.listen(env.PORT, "0.0.0.0", () => {
  logger.info(`API rodando em http://0.0.0.0:${env.PORT} (${env.NODE_ENV})`);
});
