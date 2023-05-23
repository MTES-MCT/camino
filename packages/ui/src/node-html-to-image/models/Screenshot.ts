import { ImageType, Encoding, ScreenshotParams } from "../types";

export class Screenshot {
  output: string;
  selector: string;
  html: string;
  quality?: number;
  buffer?: Buffer | string;
  type?: ImageType;
  encoding?: Encoding;
  transparent?: boolean;

  constructor(params: ScreenshotParams) {
    if (!params || !params.html) {
      throw Error("You must provide an html property.");
    }

    const {
      html,
      encoding,
      transparent = false,
      output,
      quality = 80,
      type = "png",
    } = params;

    this.html = html;
    this.encoding = encoding;
    this.transparent = transparent;
    this.type = type;
    this.output = output;
    this.selector = 'body';
    this.quality = type === "jpeg" ? quality : undefined;
  }

  setHTML(html: string) {
    if (!html) {
      throw Error("You must provide an html property.");
    }
    this.html = html;
  }

  setBuffer(buffer: Buffer | string) {
    this.buffer = buffer;
  }
}
