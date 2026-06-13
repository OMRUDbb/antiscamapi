import { config } from "../config";
import { AppError } from "../errors/AppError";
import { ScamlensCheckResponse } from "../types/scamlens";

interface ScamlensApiError {
  message?: string;
  error?: string;
}

export async function scanTarget(target: string): Promise<ScamlensCheckResponse> {
  const domain = normalizeTarget(target);
  const url = new URL(`${config.scamlensBaseUrl}/public/check`);
  url.searchParams.set("domain", domain);

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (config.scamlensApiKey) {
    headers["X-API-Key"] = config.scamlensApiKey;
  }

  let response: Response;

  try {
    response = await fetch(url, { headers });
  } catch {
    throw new AppError(502, "Unable to reach the ScamLens antiscam scanner");
  }

  if (!response.ok) {
    let message = "Antiscam scan request failed";

    try {
      const body = (await response.json()) as ScamlensApiError;
      message = body.message ?? body.error ?? message;
    } catch {
      message = `Antiscam scanner returned status ${response.status}`;
    }

    throw new AppError(502, message, { status: response.status, target: domain });
  }

  const result = (await response.json()) as ScamlensCheckResponse;

  if (!result.success || !result.data) {
    throw new AppError(404, `No scan result found for target '${domain}'`, {
      target: domain,
      message: result.message,
    });
  }

  return result;
}

export async function scanTargets(targets: string[]): Promise<ScamlensCheckResponse[]> {
  return Promise.all(targets.map((target) => scanTarget(target)));
}

function normalizeTarget(target: string): string {
  const trimmed = target.trim();

  try {
    const parsed = new URL(
      trimmed.includes("://") ? trimmed : `https://${trimmed}`,
    );
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return trimmed.replace(/^www\./, "");
  }
}
