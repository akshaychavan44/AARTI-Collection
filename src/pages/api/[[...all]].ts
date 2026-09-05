import type { NextApiRequest, NextApiResponse } from "next";
import app from "@/server/app";

// Disable Next.js body parser so Express can parse json, urlencoded, and raw payloads (like webhooks)
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return app(req, res);
}
