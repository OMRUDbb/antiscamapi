export interface CleanThreat {
  source: string;
  category: string;
  severity: string | null;
  confidence: number | null;
  labels: string[];
}

export interface CleanScanResult {
  target: string;
  riskLevel: string;
  verdict: string;
  score: number;
  confidence: string;
  summary: string;
  threats: CleanThreat[];
  providersChecked: number;
  providersWithSignals: number;
  reportCount: number;
  cached: boolean;
}

export interface AntiscamResponse {
  success: true;
  query: {
    targets: string[];
    limit: number;
  };
  meta: {
    returned: number;
    source: string;
  };
  results: CleanScanResult[];
}
