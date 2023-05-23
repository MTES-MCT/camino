import type { Screenshot } from "./models/Screenshot";
import type { Cluster } from "puppeteer-cluster";

export type Encoding = "base64" | "binary";
export type ImageType = "png" | "jpeg";

export interface ScreenshotParams {
  html: string;
  encoding?: Encoding;
  transparent?: boolean;
  type?: ImageType;
  quality?: number;
}

export interface Options extends ScreenshotParams {
  cluster: Cluster<ScreenshotParams>
}

export interface MakeScreenshotParams {
  screenshot: Screenshot;
}
