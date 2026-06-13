import { ScamlensCheckData, ScamlensThreat } from "../types/scamlens";

export type RiskLevel = "safe" | "low" | "medium" | "high" | "critical";
export type Verdict = "trusted" | "safe" | "likely_safe" | "suspicious" | "phishing" | "malware";

export interface AssessedRisk {
  riskLevel: RiskLevel;
  verdict: Verdict;
  summary: string;
}

const TRUSTED_DOMAINS = new Set([
  "google.com",
  "youtube.com",
  "youtu.be",
  "googleapis.com",
  "gstatic.com",
  "facebook.com",
  "instagram.com",
  "whatsapp.com",
  "meta.com",
  "amazon.com",
  "microsoft.com",
  "apple.com",
  "github.com",
  "gitlab.com",
  "netflix.com",
  "wikipedia.org",
  "reddit.com",
  "linkedin.com",
  "twitter.com",
  "x.com",
  "tiktok.com",
  "spotify.com",
  "paypal.com",
  "stripe.com",
  "cloudflare.com",
  "stackoverflow.com",
  "medium.com",
  "discord.com",
  "twitch.tv",
  "zoom.us",
  "adobe.com",
  "dropbox.com",
  "ebay.com",
  "bing.com",
  "yahoo.com",
  "outlook.com",
  "live.com",
  "office.com",
  "openai.com",
  "chatgpt.com",
]);

const CONFIRMED_THREAT_CATEGORIES = new Set(["phishing", "malware", "scam", "fraud"]);

function normalizeDomain(domain: string): string {
  return domain.toLowerCase().replace(/^www\./, "");
}

export function isTrustedDomain(domain: string): boolean {
  const normalized = normalizeDomain(domain);

  if (TRUSTED_DOMAINS.has(normalized)) {
    return true;
  }

  for (const trusted of TRUSTED_DOMAINS) {
    if (normalized.endsWith(`.${trusted}`)) {
      return true;
    }
  }

  return false;
}

function hasConfirmedThreat(threats: ScamlensThreat[]): boolean {
  return threats.some((threat) => {
    const severity = threat.severity?.toLowerCase();
    const category = threat.category?.toLowerCase();
    const isSevere = severity === "high" || severity === "critical";
    const isThreatCategory =
      category !== undefined && CONFIRMED_THREAT_CATEGORIES.has(category);

    return isSevere && isThreatCategory;
  });
}

function hasOnlyWeakSignals(threats: ScamlensThreat[]): boolean {
  if (!threats.length) {
    return true;
  }

  return threats.every((threat) => {
    const severity = threat.severity?.toLowerCase() ?? "low";
    const category = threat.category?.toLowerCase() ?? "suspicious";
    return severity === "low" && category === "suspicious";
  });
}

function mapTrustScoreToRisk(score: number): AssessedRisk {
  if (score >= 75) {
    return {
      riskLevel: "safe",
      verdict: "safe",
      summary: "No significant threat indicators were found.",
    };
  }

  if (score >= 55) {
    return {
      riskLevel: "low",
      verdict: "likely_safe",
      summary: "Minor signals detected, but overall risk appears low.",
    };
  }

  if (score >= 35) {
    return {
      riskLevel: "medium",
      verdict: "suspicious",
      summary: "Some suspicious indicators were detected. Proceed with caution.",
    };
  }

  if (score >= 15) {
    return {
      riskLevel: "high",
      verdict: "suspicious",
      summary: "Multiple risk indicators suggest this site may be unsafe.",
    };
  }

  return {
    riskLevel: "critical",
    verdict: "suspicious",
    summary: "Strong risk indicators suggest this site is likely unsafe.",
  };
}

function mapProviderVerdict(verdict: string): Verdict {
  const normalized = verdict.toLowerCase();

  if (normalized === "phishing") return "phishing";
  if (normalized === "malware") return "malware";
  if (normalized === "scam" || normalized === "fraud") return "suspicious";
  return "suspicious";
}

export function assessRisk(data: ScamlensCheckData): AssessedRisk {
  const domain = normalizeDomain(data.domain);

  if (isTrustedDomain(domain)) {
    return {
      riskLevel: "safe",
      verdict: "trusted",
      summary: `${domain} is a well-known trusted website.`,
    };
  }

  const reportCount = data.reportCount ?? 0;
  const weakSignalsOnly = hasOnlyWeakSignals(data.threats);

  if (reportCount === 0 && weakSignalsOnly) {
    return mapTrustScoreToRisk(data.score);
  }

  if (hasConfirmedThreat(data.threats)) {
    return {
      riskLevel: "high",
      verdict: mapProviderVerdict(data.verdict),
      summary:
        data.summary ||
        "Confirmed threat indicators were found for this domain.",
    };
  }

  return mapTrustScoreToRisk(data.score);
}
