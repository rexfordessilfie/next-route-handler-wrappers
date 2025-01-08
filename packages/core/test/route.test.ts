import test from "ava";
import { chain, merge, stack, wrapper } from "../src/index.js";
import { createMocks } from "node-mocks-http";

test("wrapper - runs handler", async (t) => {
  let handlerCallCount = 0;

  const wrapped = wrapper(async (next) => {
    return await next();
  });

  const httpMock = createMocks({
    method: "GET"
  });

  const httpMockB = createMocks({
    method: "GET"
  });

  const handler = wrapped((req, ext) => {
    handlerCallCount += 1;
    return new Response("OK", { status: 200 });
  });

  handler(httpMock.req as any);
  handler(httpMockB.req as any);

  t.is(typeof wrapped, "function");
  t.is(handlerCallCount, 2);
});

test("wrapper - attaches properties to request", async (t) => {
  const wrapped = wrapper(async (next, req: Request & { foo: string }) => {
    req.foo = "bar";
    return await next();
  });

  const httpMock = createMocks({
    method: "GET"
  });

  const handler = wrapped((req, ext) => {
    t.is(req.foo, "bar"); // test property added by wrapped
    return new Response("OK", { status: 200 });
  });

  handler(httpMock.req as any);

  t.is(typeof wrapped, "function");
});

test("merge - runs in correct order", async (t) => {
  const order: string[] = [];
  const wrappedA = wrapper(async (next) => {
    const res = await next();
    order.push("A handler ran");
    return res;
  });

  const wrappedB = wrapper(async (next) => {
    const res = await next();
    order.push("B handler ran");
    return res;
  });

  const httpMock = createMocks({
    method: "GET"
  });

  const wrapped = merge(wrappedA, wrappedB);

  const handler = wrapped((req, ext) => {
    return new Response("OK", { status: 200 });
  });

  const res = await handler(httpMock.req);

  t.is(res.status, 200);
  t.is(await res.text(), "OK");
  t.deepEqual(order, ["B handler ran", "A handler ran"]);
});

test("stack - runs in correct order", async (t) => {
  const order: string[] = [];
  const wrappedA = wrapper(async (next) => {
    const res = await next();
    order.push("A handler ran");
    return res;
  });

  const wrappedB = wrapper(async (next) => {
    const res = await next();
    order.push("B handler ran");
    return res;
  });

  const wrappedC = wrapper(async (next) => {
    const res = await next();
    order.push("C handler ran");
    return res;
  });

  const httpMock = createMocks({
    method: "GET",
    query: {
      foo: "bar"
    }
  });

  const wrapped = stack(wrappedA).with(wrappedB).with(wrappedC);

  const handler = wrapped((req, ext) => {
    return new Response("OK", { status: 200 });
  });

  const res = await handler(httpMock.req as any);

  t.is(res.status, 200);
  t.is(await res.text(), "OK");
  t.deepEqual(order, ["C handler ran", "B handler ran", "A handler ran"]);
});

test("chain - runs in correct order", async (t) => {
  const order: string[] = [];
  const wrappedA = wrapper(async (next) => {
    const res = await next();
    order.push("A handler ran");
    return res;
  });

  const wrappedB = wrapper(async (next) => {
    const res = await next();
    order.push("B handler ran");
    return res;
  });

  const wrappedC = wrapper(async (next) => {
    const res = await next();
    order.push("C handler ran");
    return res;
  });

  const httpMock = createMocks({
    method: "GET"
  });

  const wrapped = chain(wrappedA).with(wrappedB).with(wrappedC);

  const handler = wrapped((req) => {
    return new Response("OK", { status: 200 });
  });

  const res = await handler(httpMock.req as any);

  t.is(res.status, 200);
  t.is(await res.text(), "OK");
  t.deepEqual(order, ["A handler ran", "B handler ran", "C handler ran"]);
});
