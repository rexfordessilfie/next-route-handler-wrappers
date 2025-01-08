import test from "ava";
import { NextApiRequest, NextApiResponse } from "next";
import { asyncLocalStorage } from "../src/pagesapi/index.js";
import { createMocks } from "node-mocks-http";

test("invokes handler with async local storage", async (t) => {
  let callCount = 0;
  const { wrapper, getStore } = asyncLocalStorage({
    initialize: () => "1234",
  });

  const handler = wrapper(function (
    _req: NextApiRequest,
    res: NextApiResponse
  ) {
    callCount += 1;
    t.is(getStore(), "1234");
    res.status(200).json({ message: "OK" });
  });

  const mockRes = {
    status: function(code: number) {
      this.statusCode = code;
      return this;
    },
    json: function(data: any) {
      this.body = data;
      return this;
    },
    statusCode: 0,
    body: null
  };

  const { req } = createMocks<NextApiRequest, NextApiResponse>({
    method: "GET",
  });

  await handler(req, mockRes as any);

  t.is(callCount, 1);
  t.is(mockRes.statusCode, 200);
  t.deepEqual(mockRes.body, { message: "OK" });
});
