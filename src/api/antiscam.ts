import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const type = req.query.type;

  return res.json({
    success: true,
    target: type
  });
}