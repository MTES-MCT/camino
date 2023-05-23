import { Cluster } from "puppeteer-cluster";

import { Screenshot } from "./models/Screenshot";
import { makeScreenshot } from "./screenshot";
import { Options } from "./types";

export const getPuppeteerCluster = async () =>  await Cluster.launch({
  concurrency: Cluster.CONCURRENCY_PAGE,
  maxConcurrency: 50,
  puppeteerOptions: { headless: true },
});

export async function nodeHtmlToImage(options: Options) {
  const {
    html,
    encoding,
    transparent,
    type,
    quality,
    cluster
  } = options;

  try {
  const screenshot = await cluster.execute(
    {
      html,
      encoding,
      transparent,
      type,
      quality,
    },
    async ({ page, data }) => {
      const screenshot = await makeScreenshot(page, {
        ...options,
        screenshot: new Screenshot(data),
      });
      return screenshot;
    }
  );

    return screenshot.buffer;
  } catch (err) {
    console.error(err);
    await cluster.close();
    process.exit(1);
  }
}
