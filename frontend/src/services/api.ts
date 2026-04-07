import { API_BASE_URL } from "../config";
import { AuthenticityReport, WritingStats } from "../types";
import { getAuthToken } from "./authSession";
import { refreshAccessTokenOnServer } from "./auth";
import { setAuthToken } from "./authSession";

interface BackendSuspiciousSegment {
  reason: string;
  excerpt: string;
  scoreImpact: number;
}

interface BackendReportPayload {
  confidenceScore: number;
  label: "Likely Human" | "Needs Review" | "Likely AI-Assisted";
  summary: string;
  suspiciousPatterns: string[];
  evidencePoints: string[];
  suspiciousSegments?: BackendSuspiciousSegment[];
  mlInsights?: string[];
  shareToken?: string;
}

interface StartSessionResponse {
  sessionId: string;
  status: "active";
}

interface IngestSessionResponse {
  sessionId: string;
  status: "active";
}

interface EndSessionResponse {
  sessionId: string;
  status: "completed";
  report: BackendReportPayload;
}

async function requestJson<T>(path: string, init: RequestInit): Promise<T> {
  const send = async (token: string | null) =>
    fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {}),
      },
      ...init,
    });

  let response = await send(getAuthToken());

  if (response.status === 401) {
    try {
      const refreshed = await refreshAccessTokenOnServer();
      setAuthToken(refreshed.token);
      response = await send(refreshed.token);
    } catch {
      setAuthToken(null);
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function startSessionOnServer() {
  return requestJson<StartSessionResponse>("/sessions/start", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function ingestSessionOnServer(
  sessionId: string,
  text: string,
  metrics: WritingStats,
) {
  return requestJson<IngestSessionResponse>(`/sessions/${sessionId}/ingest`, {
    method: "POST",
    body: JSON.stringify({ text, metrics }),
  });
}

export async function endSessionOnServer(sessionId: string) {
  return requestJson<EndSessionResponse>(`/sessions/${sessionId}/end`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function normalizeBackendReport(report: BackendReportPayload): AuthenticityReport {
  return {
    confidenceScore: report.confidenceScore,
    label: report.label,
    summary: report.summary,
    suspiciousPatterns: report.suspiciousPatterns ?? [],
    evidencePoints:
      report.mlInsights && report.mlInsights.length > 0
        ? [...(report.evidencePoints ?? []), ...report.mlInsights]
        : report.evidencePoints ?? [],
    suspiciousSegments: (report.suspiciousSegments ?? []).map((segment, index) => ({
      id: `backend-${index}`,
      reason: segment.reason,
      excerpt: segment.excerpt,
      scoreImpact: segment.scoreImpact,
    })),
  };
}

export async function getReportOnServer(sessionId: string) {
  const raw = await requestJson<BackendReportPayload>(`/reports/session/${sessionId}`, {
    method: "GET",
  });
  return normalizeBackendReport(raw);
}
