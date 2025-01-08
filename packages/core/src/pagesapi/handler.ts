import { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import {
  AnyApiHandler,
  AnyApiWrapper,
  InferApiWrapperHandler,
} from "./route.js";

// Source: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
/**
 * List of http methods.
 */
export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
  HEAD: "HEAD",
  OPTIONS: "OPTIONS",
  TRACE: "TRACE",
  CONNECT: "CONNECT",
} as const;

/**
 * Creates an api handler that can take wrappers as arguments and returns
 * an api handler function with method attributes for registering handlers
 * for specific methods.
 *
 * */
export const createApiHandler = <
  Config extends CreateApiHandlerConfig = CreateApiHandlerConfig
>(
  config?: Config
) => {
  let _POST: AnyApiHandler;
  let _GET: AnyApiHandler;
  let _PATCH: AnyApiHandler;
  let _PUT: AnyApiHandler;
  let _DELETE: AnyApiHandler;

  const handler = async (
    request: NextApiRequest,
    response: NextApiResponse
  ) => {
    const methodMap = {
      [HTTP_METHODS.POST]: _POST,
      [HTTP_METHODS.PUT]: _PUT,
      [HTTP_METHODS.PATCH]: _PATCH,
      [HTTP_METHODS.DELETE]: _DELETE,
      [HTTP_METHODS.GET]: _GET,
    };

    const requestMethod = request.method?.toUpperCase();

    if (!requestMethod) {
      response.status(500).json({ message: "Missing request method!" });
      return;
    }

    const methodApiHandler = methodMap[requestMethod as keyof typeof methodMap];

    if (!methodApiHandler) {
      response.status(405).json({ message: "Unsupported method!" });
      return;
    }

    return methodApiHandler(request, response);
  };

  // Register POST handler
  handler.POST = <Req = NextApiRequest, Res = NextApiResponse>(
    h: InferCreateApiHandlerConfig<Config, "POST"> extends AnyApiWrapper
      ? InferApiWrapperHandler<InferCreateApiHandlerConfig<Config, "POST">>
      : GenericApiHandler<Req, Res>
  ) => {
    const wrapper = config?.wrappers?.POST || config?.wrappers?.fallback;
    _POST = wrapper ? wrapper(h) : h;
    return handler;
  };

  // Register GET handler
  handler.GET = <Req = NextApiRequest, Res = NextApiResponse>(
    h: InferCreateApiHandlerConfig<Config, "GET"> extends AnyApiWrapper
      ? InferApiWrapperHandler<InferCreateApiHandlerConfig<Config, "GET">>
      : GenericApiHandler<Req, Res>
  ) => {
    const wrapper = config?.wrappers?.GET || config?.wrappers?.fallback;
    _GET = wrapper ? wrapper(h) : h;
    return handler;
  };

  // Register PATCH handler
  handler.PATCH = <Req = NextApiRequest, Res = NextApiResponse>(
    h: InferCreateApiHandlerConfig<Config, "PATCH"> extends AnyApiWrapper
      ? InferApiWrapperHandler<InferCreateApiHandlerConfig<Config, "PATCH">>
      : GenericApiHandler<Req, Res>
  ) => {
    const wrapper = config?.wrappers?.PATCH || config?.wrappers?.fallback;
    _PATCH = wrapper ? wrapper(h) : h;
    return handler;
  };

  // Register PUT handler
  handler.PUT = <Req = NextApiRequest, Res = NextApiResponse>(
    h: InferCreateApiHandlerConfig<Config, "PUT"> extends AnyApiWrapper
      ? InferApiWrapperHandler<InferCreateApiHandlerConfig<Config, "PUT">>
      : GenericApiHandler<Req, Res>
  ) => {
    const wrapper = config?.wrappers?.PUT || config?.wrappers?.fallback;
    _PUT = wrapper ? wrapper(h) : h;
    return handler;
  };

  // Register DELETE handler
  handler.DELETE = <Req = NextApiRequest, Res = NextApiResponse>(
    h: InferCreateApiHandlerConfig<Config, "DELETE"> extends AnyApiWrapper
      ? InferApiWrapperHandler<InferCreateApiHandlerConfig<Config, "DELETE">>
      : GenericApiHandler<Req, Res>
  ) => {
    const wrapper = config?.wrappers?.DELETE || config?.wrappers?.fallback;
    _DELETE = wrapper ? wrapper(h) : h;
    return handler;
  };

  return handler;
};

/**
 * The keys of the wrapper config object.
 */
export type CreateApiHandlerWrapperKeys =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "fallback";

/**
 * The type of the config object passed to the createHandler function.
 */
export type CreateApiHandlerConfig = {
  wrappers?: Partial<Record<CreateApiHandlerWrapperKeys, AnyApiWrapper>>;
};

/**
 * Infers the wrapper type from the config. Checks for the specified method
 * then fallbacks to the type of the default wrapper, otherwise returns undefined.
 */
export type InferCreateApiHandlerConfig<
  C extends CreateApiHandlerConfig,
  K extends CreateApiHandlerWrapperKeys
> = C["wrappers"] extends Record<string, AnyApiWrapper>
  ? C["wrappers"][K] extends AnyApiWrapper
    ? C["wrappers"][K]
    : C["wrappers"]["fallback"] extends AnyApiWrapper
    ? C["wrappers"]["fallback"]
    : undefined
  : undefined;

/**
 * A generic handler that does not enforce request or response types
 * for flexible use cases in createHandler.
 */
export type GenericApiHandler<Req, Res> = (
  req: Req,
  res: Res
) => ReturnType<NextApiHandler>;
