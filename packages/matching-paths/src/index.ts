import { wrapperM, MiddlewareWrapperCallback } from "@nextwrappers/core";
import { Path, pathToRegexp } from "path-to-regexp";

export type MatchingPathsConfig = {
  matcher?: Path;
};

/**
 * Returns a middleware that only executes the provided callback if the request path matches the provided matcher
 * @param config - The configuration for matching the request path
 * @param cb - The callback to execute if the request path matches the provided matcher. The callback will receive the next middleware and the request as parameters
 * @returns
 *
 * @example
 * ```ts
 * // middleware.ts
 * import { matchingPaths } from "@nextwrappers/matching-paths";
 *
 * const withGreeting = matchingPaths(
 *  { matcher: ["/dashboard/:path*"] },
 *  (next, req) => {
 *    console.log(`Hello '${req.nextUrl.pathname}'!`);
 *    const res = next();
 *    console.log(`Goodbye '${req.nextUrl.pathname}'!`);
 *    return res;
 * });
 *
 * export const middleware = withGreeting((req) => {
 *  return NextResponse.next();
 * });
 * ```
 */
export function matchingPaths<Req extends Request, Res extends Response | void>(
  config: MatchingPathsConfig = { matcher: [] },
  cb: MiddlewareWrapperCallback<Req, Res>
) {
  const { matcher: paths } = config;
  const regexp = paths ? pathToRegexp(paths) : /.*/;
  return wrapperM<Req, Res>((next, req) => {
    const { pathname } = new URL(req.url);
    return regexp.test(pathname) ? cb(next, req) : next();
  });
}
