import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";

/**
 * Creates a wrapper-like functionality for Next.js API handlers.
 *
 * @param callback - A callback that exposes the API handler's request and response args,
 * as well as a next() function for executing the wrapped handler.
 *
 * @returns A wrapper function that takes a Next.js API handler as argument,
 *  and returns the newly wrapped handler
 */
export function wrapper<
  ResBody = unknown,
  Req extends NextApiRequest = NextApiRequest,
  Res extends NextApiResponse<ResBody> = NextApiResponse<ResBody>
>(cb: ApiWrapperCallback<Req, Res>) {
  return (handler: ApiHandler<Req>): typeof handler => {
    // The new handler
    return async (req, res) => {
      const next = (_req: any, _res: any) => handler(_req ?? req, _res ?? res);

      // Run the callback. Cast req to the type of callback's req
      // since we assume deps are already attached to the request
      return await cb(
        next as InferApiWrapperCallbackNext<typeof cb>,
        req as InferApiWrapperCallbackReq<typeof cb>,
        res as Res
      );
    };
  };
}

/**
 * Merges two Next.js API wrapper into one (wrapper applied from right-to-left, i.e b first, then a)
 * @param a - the outer wrapper
 * @param b - the inner wrapper
 * @returns
 */
export const merge =
  <A extends ApiWrapper, B extends AnyApiWrapper>(a: A, b: B) =>
  (
    handler: ApiHandler<
      MergedNextApiRequest<InferApiWrapperReq<A>, InferApiWrapperReq<B>>
    >
  ): typeof handler =>
    a(b(handler));

/**
 * Merges two Next.js API wrapper into one (wrapper applied from last to first)
 * @param a - the last wrapper to be applied
 * @returns
 */
export const stack = <M1 extends AnyApiWrapper>(a: M1) => {
  const _stack = (handler: InferApiWrapperHandler<M1>): typeof handler =>
    a(handler);

  _stack.kind = "stack" as "stack";
  _stack.with = <M2 extends AnyApiWrapper>(b: M2) => stack(merge(a, b));

  return _stack;
};

/**
 * Chains two Next.js API wrapper into one (wrapper applied from first to last)
 * @param a - the firs wrapper to be applied
 * @returns
 */
export const chain = <M1 extends AnyApiWrapper>(a: M1) => {
  const _chain = (handler: InferApiWrapperHandler<M1>): typeof handler =>
    a(handler);

  _chain.kind = "chain" as "chain";
  _chain.with = <M2 extends AnyApiWrapper>(b: M2) => chain(merge(b, a));

  return _chain;
};

/**
 * The handler type. It is the same as the default Next.js handler,
 * but with deeper type inference for request and response.
 */
export type ApiHandler<
  Req extends NextApiRequest = NextApiRequest,
  Res extends NextApiResponse = NextApiResponse<unknown>
> = (req: Req, res: Res) => ReturnType<NextApiHandler>;

export type AnyApiHandler = ApiHandler<any, any>;

export type ApiWrapper<H extends ApiHandler = ApiHandler> = (handler: H) => H;

export type AnyApiWrapper = ApiWrapper<AnyApiHandler>;

/**
 * Helper type to infer the wrapper's handler argument request type
 */
export type InferApiWrapperReq<M extends ApiWrapper<any>> = Parameters<
  Parameters<M>[0]
>[0];

/**
 * The wrapper callback type.
 */
export type ApiWrapperCallback<
  Req extends NextApiRequest = NextApiRequest & Record<string, any>,
  Res extends NextApiResponse = NextApiResponse<any>,
  Next = ApiHandler<Req, Res> & (() => ReturnType<NextApiHandler>)
> = (next: Next, req: Req, res: Res) => ReturnType<NextApiHandler>;

/**
 * Helper type to infer the callback's request type
 */
export type InferApiWrapperCallbackReq<
  C extends ApiWrapperCallback<Req, Res>,
  Req extends NextApiRequest = any,
  Res extends NextApiResponse = any
> = Parameters<C>[1];

export type InferApiWrapperCallbackNext<
  C extends ApiWrapperCallback<Req, Res>,
  Req extends NextApiRequest = any,
  Res extends NextApiResponse = any
> = Parameters<C>[0];

/**
 * Helper type to infer the wrapper's handler argument request type
 */
export type InferApiWrapperHandler<W extends AnyApiWrapper> = Parameters<W>[0];

/**
 * Merge values from U into T, replacing types for existing keys in T with the types of U
 */
export type LeftIntersection<L, R> = {
  [K in keyof L as K extends keyof R ? never : K]: L[K];
} & R;

type IsAny<T> = 0 extends 1 & T ? true : false;

type ExcludeLoneAny<L, R> = {
  [K in keyof L as K extends keyof R
    ? IsAny<L[K]> extends true
      ? IsAny<R[K]> extends true
        ? K
        : never
      : K
    : K]: L[K];
};

type Pretty<T> = {
  [K in keyof T]: T[K];
} & {};

export type SpecificIntersection<A, B> = Pretty<
  ExcludeLoneAny<A, B> & ExcludeLoneAny<B, A>
>;

export type LeftSpecificIntersection<A, B> = Pretty<
  LeftIntersection<ExcludeLoneAny<A, B>, ExcludeLoneAny<B, A>>
>;

/**
 * Extends the NextApiRequest type with the provided Params type.
 * If T contains a type already in NextApiRequest, the type from T will be used.
 */
export type ExtendedNextApiRequest<
  T extends Record<string, any>,
  Req extends NextApiRequest = NextApiRequest
> = SpecificIntersection<Req, T> extends NextApiRequest
  ? SpecificIntersection<Req, T>
  : never;

export type MergedNextApiRequest<
  ReqA extends NextApiRequest,
  ReqB extends NextApiRequest
> = SpecificIntersection<ReqA, ReqB> extends NextApiRequest
  ? SpecificIntersection<ReqA, ReqB>
  : never;
