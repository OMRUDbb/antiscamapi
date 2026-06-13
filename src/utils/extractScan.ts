import { CleanScanResult, CleanThreat } from "../types/api";
import { ScamlensCheckData, ScamlensThreat } from "../types/scamlens";
import { assessRisk } from "./riskAssessment";

function extractThreat(threat: ScamlensThreat): CleanThreat {
  return {
    source: threat.source,
    category: threat.category,
    severity: threat.severity ?? null,
    confidence: threat.confidence ?? null,
    labels: threat.labels ?? [],
  };
}

export function extractCleanScan(data: ScamlensCheckData): CleanScanResult {
  const assessed = assessRisk(data);

  return {
    target: data.domain,
    riskLevel: assessed.riskLevel,
    verdict: assessed.verdict,
    score: data.score,
    confidence: data.confidence,
    summary: assessed.summary,
    threats: data.threats.map(extractThreat),
    providersChecked: data.providers_checked_count ?? 0,
    providersWithSignals: data.providers_signals_count ?? 0,
    reportCount: data.reportCount ?? 0,
    cached: data.cached ?? false,
  };
}
