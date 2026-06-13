import "dotenv/config";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;

export const config = {
  port: Number(process.env.PORT) || 3000,
  scamlensApiKey: process.env.SCAMLENS_API_KEY ?? "",
  scamlensBaseUrl: "https://api.scamlens.org/v1",
  defaultLimit: DEFAULT_LIMIT,
  maxLimit: MAX_LIMIT,
};
