import { NextApiRequest, NextApiResponse } from "next";
import { asyncLocalStorage } from "@nextwrappers/async-local-storage/pagesapi";
import {v4 as uuid} from 'uuid'

const { wrapper: withTraceId, getStore: getTraceId } = asyncLocalStorage({
  initialize: () => uuid(),
});

export default withTraceId(function handler(
  _req: NextApiRequest,
  res: NextApiResponse<string>
) {
  const traceId = getTraceId() || ''
  res.status(200).json(traceId);
});
