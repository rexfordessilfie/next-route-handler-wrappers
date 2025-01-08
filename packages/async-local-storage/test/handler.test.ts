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

  const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
    method: "GET",
  });

  await handler(req, res as any);

  t.is(callCount, 1);
  t.is(res.statusCode, 200);
  t.deepEqual(res._getJSONData(), { message: "OK" });
});
