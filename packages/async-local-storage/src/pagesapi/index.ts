import { wrapper } from "@nextwrappers/core/pagesapi";
import { AsyncLocalStorage } from "node:async_hooks";
import type { NextApiRequest, NextApiResponse } from "next";
import { runWithAsyncLocalStorage } from "../shared";

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
    wrapper: wrapper((next, ...args) => {
      const store = initialize?.(...args);
      return runWithAsyncLocalStorage(storage, store, next, args as any);
    }),
  };
}

export type AsyncLocalStorageWrapperOptions<Store> = {
  storage?: AsyncLocalStorage<Store>;
  initialize?: <Req extends NextApiRequest, Res extends NextApiResponse>(
    req: Req,
    res?: Res
  ) => Store;
};
