import { spawn } from "node:child_process";
import path from "node:path";
import { env } from "../config/env";

export interface MlPrediction {
  humanProbability: number;
  anomalyScore: number;
  insights: string[];
}

export interface MlFeatureInput {
  behaviorScore: number;
  textScore: number;
  crossScore: number;
  totalWords: number;
  pasteCount: number;
  revisionCount: number;
  speedVariance: number;
}

async function predictViaHttp(features: MlFeatureInput): Promise<MlPrediction | null> {
  if (!env.mlServiceUrl) {
    return null;
  }

  try {
    const response = await fetch(env.mlServiceUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(features),
    });

    if (!response.ok) {
      return null;
    }

    const json = (await response.json()) as MlPrediction;
    return json;
  } catch {
    return null;
  }
}

async function predictViaPython(features: MlFeatureInput): Promise<MlPrediction | null> {
  const scriptPath = path.resolve(__dirname, "../../../ml/inference/predict.py");

  return new Promise((resolve) => {
    const child = spawn(env.pythonBin, [scriptPath], {
      stdio: ["pipe", "pipe", "ignore"],
    });

    let output = "";

    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });

    child.on("error", () => resolve(null));

    child.on("close", (code) => {
      if (code !== 0) {
        resolve(null);
        return;
      }

      try {
        const parsed = JSON.parse(output) as MlPrediction;
        resolve(parsed);
      } catch {
        resolve(null);
      }
    });

    child.stdin.write(JSON.stringify(features));
    child.stdin.end();
  });
}

export async function getMlPrediction(features: MlFeatureInput): Promise<MlPrediction | null> {
  const httpPrediction = await predictViaHttp(features);
  if (httpPrediction) {
    return httpPrediction;
  }

  return predictViaPython(features);
}
