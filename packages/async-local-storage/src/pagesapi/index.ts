import { wrapper } from "@nextwrappers/core/pagesapi";
import { AsyncLocalStorage } from "node:async_hooks";
import type { NextApiRequest, NextApiResponse } from "next";
import { runWithAsyncLocalStorage } from "../shared.js";

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
    wrapper: wrapper((next, req, res) => {
      const store = initialize?.(req, res);
      return runWithAsyncLocalStorage(storage, store, next, [req, res]);
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
