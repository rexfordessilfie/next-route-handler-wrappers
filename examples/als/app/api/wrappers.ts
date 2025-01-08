import { asyncLocalStorage } from "@nextwrappers/async-local-storage";
import { v4 as uuid } from "uuid";

export const { wrapper: traced, getStore: getTraceId } = asyncLocalStorage({
  initialize: () => uuid(),
});
