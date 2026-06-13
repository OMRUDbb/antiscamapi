import { Router } from "express";
import { config } from "../config";
import { AppError } from "../errors/AppError";
import { asyncHandler } from "../middleware/asyncHandler";
import { scanTargets } from "../services/antiscamService";
import { AntiscamResponse } from "../types/api";
import { extractCleanScan } from "../utils/extractScan";

const router = Router();

function parseLimit(value: unknown): number {
  if (value === undefined) {
    return config.defaultLimit;
  }

  const limit = Number(value);

  if (!Number.isInteger(limit) || limit < 1) {
    throw new AppError(400, "Parameter 'limit' must be a positive integer", {
      limit: value,
    });
  }

  if (limit > config.maxLimit) {
    throw new AppError(
      400,
      `Parameter 'limit' cannot exceed ${config.maxLimit}`,
      { limit },
    );
  }

  return limit;
}

function parseTargets(value: unknown, limit: number): string[] {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(
      400,
      "Query parameter 'type' is required and must be a domain, URL, or comma-separated list",
      { type: value },
    );
  }

  const targets = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!targets.length) {
    throw new AppError(400, "At least one valid target is required", {
      type: value,
    });
  }

  if (targets.length > limit) {
    return targets.slice(0, limit);
  }

  return targets;
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const limit = parseLimit(req.query.limit);
    const targets = parseTargets(req.query.type, limit);

    const scanResults = await scanTargets(targets);
    const results = scanResults
      .map((scan) => scan.data)
      .filter((data): data is NonNullable<typeof data> => data !== undefined)
      .map(extractCleanScan);

    if (!results.length) {
      throw new AppError(404, "No antiscam scan results found", { targets });
    }

    const response: AntiscamResponse = {
      success: true,
      query: { targets, limit },
      meta: {
        returned: results.length,
        source: "ScamLens",
      },
      results,
    };

    res.json(response);
  }),
);

export default router;
