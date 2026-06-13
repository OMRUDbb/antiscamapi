import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const type = req.query.type;

  if (!type) {
    return res.status(400).json({
      success: false,
      error: { message: "type is required" }
    });
  }

  return res.json({
    success: true,
    target: type,
    riskLevel: "low",
    verdict: "safe"
  });
}