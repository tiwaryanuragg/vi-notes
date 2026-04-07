import type {
  ChangeEventHandler,
  ClipboardEventHandler,
  KeyboardEventHandler,
} from "react";
import { useEffect, useMemo, useState } from "react";
import {
  AuthenticityReport,
  PauseBucket,
  SessionAlert,
  WritingStats,
} from "../types";
import {
  calculateCurrentWpm,
  countWords,
  estimateTextComplexity,
  standardDeviation,
  summarizeSpeed,
} from "../utils/textAnalysis";
import {
  endSessionOnServer,
  ingestSessionOnServer,
  normalizeBackendReport,
  startSessionOnServer,
} from "../services/api";

const PAUSE_MICRO_MAX = 900;
const PAUSE_THINKING_MAX = 2400;

function createInitialStats(): WritingStats {
  return {
    totalCharacters: 0,
    totalWords: 0,
    totalKeystrokes: 0,
    deletionCount: 0,
    pasteCount: 0,
    pastedCharacters: 0,
    revisionCount: 0,
    punctuationPauseCount: 0,
    averagePauseMs: 0,
    longestPauseMs: 0,
    pauseDistribution: {
      micro: 0,
      thinking: 0,
      deep: 0,
    },
    speedSamples: [],
  };
}

function classifyPause(pauseMs: number): PauseBucket {
  if (pauseMs <= PAUSE_MICRO_MAX) {
    return "micro";
  }
  if (pauseMs <= PAUSE_THINKING_MAX) {
    return "thinking";
  }
  return "deep";
}

function qualityBand(score: number): AuthenticityReport["label"] {
  if (score >= 75) {
    return "Likely Human";
  }
  if (score >= 45) {
    return "Needs Review";
  }
  return "Likely AI-Assisted";
}

export function useWritingSession() {
  const [text, setText] = useState("");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [stats, setStats] = useState<WritingStats>(createInitialStats());
  const [alerts, setAlerts] = useState<SessionAlert[]>([]);
  const [lastEventAt, setLastEventAt] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [pastedExcerpts, setPastedExcerpts] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<string>("idle");
  const [backendReport, setBackendReport] = useState<AuthenticityReport | null>(null);

  const addAlert = (level: SessionAlert["level"], message: string) => {
    setAlerts((current) => {
      const next = [{ id: `${Date.now()}-${Math.random()}`, level, message }, ...current];
      return next.slice(0, 6);
    });
  };

  const startSession = () => {
    if (isSessionActive) {
      return;
    }
    const now = Date.now();
    setStartedAt(now);
    setLastEventAt(now);
    setIsSessionActive(true);
    setAlerts([]);
    setServerStatus("starting");

    startSessionOnServer()
      .then(({ sessionId: nextSessionId }) => {
        setSessionId(nextSessionId);
        setBackendReport(null);
        setServerStatus("active");
        addAlert("info", "Session linked to backend analysis service.");
      })
      .catch((error: unknown) => {
        setServerStatus("offline");
        addAlert("warning", error instanceof Error ? error.message : "Backend unavailable.");
      });
  };

  const endSession = () => {
    setIsSessionActive(false);
    addAlert("info", "Session paused. You can still inspect the report.");

    if (sessionId) {
      setServerStatus("finalizing");
      endSessionOnServer(sessionId)
        .then((response) => {
          const normalized = normalizeBackendReport(response.report);
          setBackendReport(normalized);
          addAlert("info", `Backend report generated with ${normalized.confidenceScore}% confidence.`);
          setServerStatus("completed");
        })
        .catch((error: unknown) => {
          setServerStatus("offline");
          addAlert("warning", error instanceof Error ? error.message : "Failed to finalize backend session.");
        });
    }
  };

  const resetSession = () => {
    setText("");
    setStats(createInitialStats());
    setPastedExcerpts([]);
    setAlerts([]);
    setIsSessionActive(false);
    setLastEventAt(null);
    setStartedAt(null);
    setSessionId(null);
    setServerStatus("idle");
    setBackendReport(null);
  };

  const capturePause = (currentTimestamp: number, previousText: string) => {
    if (lastEventAt === null) {
      setLastEventAt(currentTimestamp);
      return;
    }

    const pauseMs = currentTimestamp - lastEventAt;
    if (pauseMs < 120) {
      setLastEventAt(currentTimestamp);
      return;
    }

    const bucket = classifyPause(pauseMs);
    const endsWithPunctuation = /[.,!?;:]\s*$/.test(previousText);

    setStats((current) => {
      const totalPauses =
        current.pauseDistribution.micro +
        current.pauseDistribution.thinking +
        current.pauseDistribution.deep;
      const averagePauseMs =
        totalPauses === 0
          ? pauseMs
          : (current.averagePauseMs * totalPauses + pauseMs) / (totalPauses + 1);

      return {
        ...current,
        averagePauseMs,
        longestPauseMs: Math.max(current.longestPauseMs, pauseMs),
        punctuationPauseCount: current.punctuationPauseCount + (endsWithPunctuation ? 1 : 0),
        pauseDistribution: {
          ...current.pauseDistribution,
          [bucket]: current.pauseDistribution[bucket] + 1,
        },
      };
    });

    if (pauseMs > 3200) {
      addAlert("info", "Long cognitive pause detected before continuing.");
    }

    setLastEventAt(currentTimestamp);
  };

  const onKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    const key = event.key;
    const isDeletion = key === "Backspace" || key === "Delete";
    const isPrintable = key.length === 1 || key === "Enter" || key === "Tab" || key === " ";
    const shouldTrackEvent = isPrintable || isDeletion;

    if (!isSessionActive && shouldTrackEvent) {
      startSession();
    }

    if (!isSessionActive && !shouldTrackEvent) {
      return;
    }

    const now = Date.now();
    capturePause(now, text);

    setStats((current) => {
      const nextKeystrokes = current.totalKeystrokes + (isPrintable || isDeletion ? 1 : 0);
      const sessionDurationMs = startedAt ? now - startedAt : 0;
      const nextSpeedSample = {
        timestamp: now,
        wpm: calculateCurrentWpm(nextKeystrokes, sessionDurationMs),
      };

      return {
        ...current,
        totalKeystrokes: nextKeystrokes,
        deletionCount: current.deletionCount + (isDeletion ? 1 : 0),
        revisionCount: current.revisionCount + (isDeletion ? 1 : 0),
        speedSamples:
          isPrintable || isDeletion
            ? [...current.speedSamples.slice(-179), nextSpeedSample]
            : current.speedSamples,
      };
    });
  };

  const onChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    const nextText = event.target.value;

    if (!isSessionActive && nextText.trim().length > 0) {
      startSession();
    }

    setText(nextText);

    setStats((current) => ({
      ...current,
      totalCharacters: nextText.length,
      totalWords: countWords(nextText),
    }));
  };

  const onPaste: ClipboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (!isSessionActive) {
      startSession();
    }

    const pasted = event.clipboardData.getData("text");
    const excerpt = pasted.slice(0, 140).replace(/\s+/g, " ").trim();

    setStats((current) => ({
      ...current,
      pasteCount: current.pasteCount + 1,
      pastedCharacters: current.pastedCharacters + pasted.length,
    }));

    if (excerpt) {
      setPastedExcerpts((current) => [...current, excerpt].slice(-6));
    }

    if (pasted.length > 150) {
      addAlert("warning", "Large pasted block detected. This can reduce authenticity confidence.");
    }
  };

  useEffect(() => {
    if (!sessionId || !isSessionActive) {
      return;
    }

    const timeout = window.setTimeout(() => {
      ingestSessionOnServer(sessionId, text, stats).catch((error: unknown) => {
        setServerStatus("offline");
        addAlert("warning", error instanceof Error ? error.message : "Realtime sync failed.");
      });
    }, 650);

    return () => window.clearTimeout(timeout);
  }, [isSessionActive, sessionId, stats, text]);

  const localReport = useMemo<AuthenticityReport>(() => {
    const suspiciousPatterns: string[] = [];
    const evidencePoints: string[] = [];
    const suspiciousSegments: AuthenticityReport["suspiciousSegments"] = [];

    const speedStats = summarizeSpeed(stats.speedSamples);
    const pauseCounts = Object.values(stats.pauseDistribution).reduce((sum, value) => sum + value, 0);
    const complexity = estimateTextComplexity(text);
    const revisionDensity = stats.revisionCount / Math.max(stats.totalWords, 1);
    const pastedRatio = stats.pastedCharacters / Math.max(stats.totalCharacters, 1);

    let score = 82;

    if (stats.pasteCount > 0) {
      suspiciousPatterns.push("Externally inserted text detected during session");
      score -= Math.min(26, stats.pasteCount * 7 + Math.floor(stats.pastedCharacters / 80));
      evidencePoints.push(
        `${stats.pasteCount} paste event(s), ${stats.pastedCharacters} pasted characters`,
      );
      pastedExcerpts.forEach((excerpt, index) => {
        suspiciousSegments.push({
          id: `paste-${index}`,
          reason: "Pasted content",
          excerpt,
          scoreImpact: 6,
        });
      });
    }

    if (speedStats.varianceWpm < 5 && stats.speedSamples.length > 35) {
      suspiciousPatterns.push("Typing speed appears unusually constant");
      score -= 12;
      evidencePoints.push(`Speed variance: ${speedStats.varianceWpm.toFixed(2)} WPM`);
    } else {
      evidencePoints.push(`Natural speed variance: ${speedStats.varianceWpm.toFixed(2)} WPM`);
      score += 3;
    }

    if (pauseCounts < 5 && stats.totalWords > 120) {
      suspiciousPatterns.push("Low pause diversity for long-form writing");
      score -= 10;
    }

    if (complexity > 18 && revisionDensity < 0.08 && stats.totalWords > 80) {
      suspiciousPatterns.push("Complex text with limited revision behavior");
      score -= 14;
      evidencePoints.push(
        `Complexity ${complexity.toFixed(1)} with revision density ${revisionDensity.toFixed(2)}`,
      );
    } else if (complexity > 10) {
      evidencePoints.push("Revision behavior aligns with text complexity.");
      score += 4;
    }

    const sentenceLengths = text
      .split(/[.!?]+/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((sentence) => countWords(sentence));

    const sentenceVariance = standardDeviation(sentenceLengths);
    if (sentenceVariance < 2 && sentenceLengths.length >= 6) {
      suspiciousPatterns.push("Sentence structure appears overly uniform");
      score -= 9;
    } else if (sentenceLengths.length > 0) {
      evidencePoints.push(`Sentence-length variance: ${sentenceVariance.toFixed(2)}`);
      score += 2;
    }

    if (stats.punctuationPauseCount > 0) {
      evidencePoints.push(
        `${stats.punctuationPauseCount} punctuation-linked pause(s) captured`,
      );
      score += Math.min(4, Math.floor(stats.punctuationPauseCount / 3));
    }

    score = Math.max(0, Math.min(100, score));

    const summary =
      suspiciousPatterns.length === 0
        ? "Behavioral and linguistic indicators align with organic human composition."
        : "Some cross-signal mismatches were detected and should be reviewed before accepting the submission as fully authentic.";

    return {
      confidenceScore: score,
      label: qualityBand(score),
      summary,
      suspiciousPatterns,
      evidencePoints,
      suspiciousSegments,
    };
  }, [pastedExcerpts, stats, text]);

  const report = backendReport ?? localReport;

  return {
    alerts,
    isSessionActive,
    onChange,
    onKeyDown,
    onPaste,
    report,
    resetSession,
    startSession,
    endSession,
    stats,
    text,
    serverStatus,
  };
}
