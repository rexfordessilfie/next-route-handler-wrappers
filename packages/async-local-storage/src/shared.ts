import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Runs a callback within the async local storage context
 * @param storage The async local storage instance
 * @param store The data to store
 * @param callback The callback to run within the async local storage context
 * @param args The arguments to pass to the callback
 * @returns The return value of the callback
 */
export function runWithAsyncLocalStorage<
  Store = unknown,
  ReturnType = unknown,
  Args extends any[] = any[]
>(
  storage: AsyncLocalStorage<Store>,
  store: Store,
  callback: (...args: Args) => ReturnType,
  args: Args
) {
  return storage.run(store, callback, ...args);
}
