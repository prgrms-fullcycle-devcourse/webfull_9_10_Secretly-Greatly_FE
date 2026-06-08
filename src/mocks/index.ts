import { authHandlers } from "./handler/auth.handler";
import { stocksHandlers } from "./handler/stocks.handler";
import { healthHandlers } from "./handler/health.handler";

export const handlers = [...authHandlers, ...stocksHandlers, ...healthHandlers];
