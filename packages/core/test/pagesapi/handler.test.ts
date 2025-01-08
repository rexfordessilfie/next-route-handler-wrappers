import { createMocks } from "node-mocks-http";
import { createApiHandler, wrapper } from "../../src/pagesapi/index.js";
import test from "ava";
import { NextApiRequest } from "next";

const h = createApiHandler({
  wrappers: {
    GET: wrapper((next, req: NextApiRequest & { isGetWrapped: true }, res) => {
      req.isGetWrapped = true;
      next(req, res);
    }),

    POST: wrapper((next, req: NextApiRequest & { isPostWrapped: true }, res) => {
      req.isPostWrapped = true;
      next(req, res);
    }),

    PATCH: wrapper((next, req: NextApiRequest & { isPatchWrapped: true }, res) => {
      req.isPatchWrapped = true;
      next(req, res);
    }),

    PUT: wrapper((next, req: NextApiRequest & { isPutWrapped: true }, res) => {
      req.isPutWrapped = true;
      next(req, res);
    }),
    DELETE: wrapper((next, req: NextApiRequest & { isDeleteWrapped: true }, res) => {
      req.isDeleteWrapped = true;
      next(req, res);
    }),
  },
});

h.GET((_req, res) => {
  res.send("GET");
});

h.POST((_req, res) => {
  res.send("POST");
});

h.PUT((_req, res) => {
  res.send("PUT");
});

h.PATCH((_req, res) => {
  res.send("PATCH");
});

h.DELETE((_req, res) => {
  res.send("DELETE");
});

test("calls GET handler method", async (t) => {
  let httpMock = createMocks({
    method: "GET",
  });

  h(httpMock.req, httpMock.res);
  t.is(httpMock.res._getData(), "GET");
  t.is(httpMock.req.isGetWrapped, true);
});

test("calls POST handler method", async (t) => {
  let httpMock = createMocks({
    method: "POST",
  });

  h(httpMock.req, httpMock.res);
  t.is(httpMock.res._getData(), "POST");
  t.is(httpMock.req.isPostWrapped, true);
});

test("calls DELETE handler method", async (t) => {
  let httpMock = createMocks({
    method: "DELETE",
  });

  h(httpMock.req, httpMock.res);
  t.is(httpMock.res._getData(), "DELETE");
  t.is(httpMock.req.isDeleteWrapped, true);
});

test("calls PATCH handler method", async (t) => {
  let httpMock = createMocks({
    method: "PATCH",
  });

  h(httpMock.req, httpMock.res);
  t.is(httpMock.res._getData(), "PATCH");
  t.is(httpMock.req.isPatchWrapped, true);
});

test("calls PUT handler method", async (t) => {
  let httpMock = createMocks({
    method: "PUT",
  });

  h(httpMock.req, httpMock.res);
  t.is(httpMock.res._getData(), "PUT");
  t.is(httpMock.req.isPutWrapped, true);
});
