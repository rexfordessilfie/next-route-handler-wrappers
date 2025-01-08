import test from "ava";
import { chainM, mergeM, stackM, wrapperM } from "../src/index.js";
import { createMocks } from "node-mocks-http";

test("wrapperM - runs handler", async (t) => {
  let handlerCallCount = 0;

  const wrapped = wrapperM(async (next) => {
    return await next();
  });

  const httpMock = createMocks({
    method: "GET"
  });

  const httpMockB = createMocks({
    method: "GET"
  });

  const handler = wrapped((req) => {
    handlerCallCount += 1;
    return new Response("OK", { status: 200 });
  });

  handler(httpMock.req as any);
  handler(httpMockB.req as any);

  t.is(typeof wrapped, "function");
  t.is(handlerCallCount, 2);
});

test("wrapperM - attaches properties to request", async (t) => {
  const wrapped = wrapperM(async (next, req: Request & { foo: string }) => {
    req.foo = "bar";
    return await next();
  });

  const httpMock = createMocks({
    method: "GET"
  });

  const handler = wrapped((req) => {
    t.is(req.foo, "bar"); // test property added by wrapped
    return new Response("OK", { status: 200 });
  });

  handler(httpMock.req as any);

  t.is(typeof wrapped, "function");
});

test("mergeM - runs in correct order", async (t) => {
  const order: string[] = [];
  const wrappedA = wrapperM(async (next) => {
    const res = await next();
    order.push("A handler ran");
    return res;
  });

  const wrappedB = wrapperM(async (next) => {
    const res = await next();
    order.push("B handler ran");
    return res;
  });

  const httpMock = createMocks({
    method: "GET"
  });

  const wrapped = mergeM(wrappedA, wrappedB);

  const handler = wrapped((req) => {
    return new Response("OK", { status: 200 });
  });

  const res = await handler(httpMock.req);

  t.is(res.status, 200);
  t.is(await res.text(), "OK");
  t.deepEqual(order, ["B handler ran", "A handler ran"]);
});

test("stackM - runs in correct order", async (t) => {
  const order: string[] = [];
  const wrappedA = wrapperM(async (next) => {
    const res = await next();
    order.push("A handler ran");
    return res;
  });

  const wrappedB = wrapperM(async (next) => {
    const res = await next();
    order.push("B handler ran");
    return res;
  });

  const wrappedC = wrapperM(async (next) => {
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

  const wrapped = stackM(wrappedA).with(wrappedB).with(wrappedC);

  const handler = wrapped((req) => {
    return new Response("OK", { status: 200 });
  });

  const res = await handler(httpMock.req as any);

  t.is(res.status, 200);
  t.is(await res.text(), "OK");
  t.deepEqual(order, ["C handler ran", "B handler ran", "A handler ran"]);
});

test("chainM - runs in correct order", async (t) => {
  const order: string[] = [];
  const wrappedA = wrapperM(async (next) => {
    const res = await next();
    order.push("A handler ran");
    return res;
  });

  const wrappedB = wrapperM(async (next) => {
    const res = await next();
    order.push("B handler ran");
    return res;
  });

  const wrappedC = wrapperM(async (next) => {
    const res = await next();
    order.push("C handler ran");
    return res;
  });

  const httpMock = createMocks({
    method: "GET"
  });

  const wrapped = chainM(wrappedA).with(wrappedB).with(wrappedC);

  const handler = wrapped((req) => {
    return new Response("OK", { status: 200 });
  });

  const res = await handler(httpMock.req as any);

  t.is(res.status, 200);
  t.is(await res.text(), "OK");
  t.deepEqual(order, ["A handler ran", "B handler ran", "C handler ran"]);
});
