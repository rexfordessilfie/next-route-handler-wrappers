import { wrapper } from "@nextwrappers/core";
import { AsyncLocalStorage } from "node:async_hooks";
import { runWithAsyncLocalStorage } from "./shared.js";

/**
 * Creates an async local storage wrapper for a route handler
 * @param options The options including an optional async local `storage`
 * instance and an `initialize` function which receives the request
 * and returns the `store`
 * @returns
 */
export function asyncLocalStorage<Store>(
  options: AsyncLocalStorageWrapperOptions<Store>
) {
  const { initialize, storage = new AsyncLocalStorage<Store>() } = options;
  return {
    storage,
    getStore: () => storage.getStore(),
    wrapper: wrapper((next, req, ext) => {
      const store = initialize?.(req, ext);
      return runWithAsyncLocalStorage(storage, store, next, [req, ext]);
    }),
  };
}

export type AsyncLocalStorageWrapperOptions<Store> = {
  storage?: AsyncLocalStorage<Store>;
  initialize?: <Req = unknown, Ext = unknown>(
    req: Req,
    ext?: Ext
  ) => Store;
};
