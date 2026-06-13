export interface ScamlensThreat {
  source: string;
  category: string;
  labels?: string[];
  severity?: string;
  confidence?: number;
}

export interface ScamlensCheckData {
  domain: string;
  score: number;
  risk_level: string;
  verdict: string;
  threats: ScamlensThreat[];
  confidence: string;
  summary: string;
  summary_status?: string;
  cached?: boolean;
  reportCount?: number;
  providers_signals_count?: number;
  providers_checked_count?: number;
  checked_at?: string;
}

export interface ScamlensCheckResponse {
  success: boolean;
  data?: ScamlensCheckData;
  message?: string;
}
