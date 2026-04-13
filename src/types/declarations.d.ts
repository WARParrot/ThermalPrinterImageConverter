// src/types/declarations.d.ts

declare module '@point-of-sale/receipt-printer-encoder' {
  interface EncoderOptions {
    language?: 'esc-pos' | 'star-prnt' | 'star-line';
    width?: number;
    embedded?: boolean;
  }

  interface EncoderResult {
    encode(): Uint8Array;
    text(text: string): this;
    newline(): this;
    line(text: string): this;
    cut(partial?: 'partial' | 'full'): this;
    image(
      image: ImageData | HTMLCanvasElement | HTMLImageElement,
      width: number,
      height: number,
      algorithm?: 'threshold' | 'bayer' | 'floydsteinberg' | 'atkinson'
    ): this;
    align(alignment: 'left' | 'center' | 'right'): this;
    bold(enabled?: boolean): this;
    underline(enabled?: boolean | 0 | 1 | 2): this;
    size(width: number, height: number): this;
    barcode(data: string, type: string, height: number): this;
    qrcode(data: string, options?: object): this;
    initialize(): this;
  }

  class ReceiptPrinterEncoder implements EncoderResult {
    constructor(options?: EncoderOptions);
    encode(): Uint8Array;
    text(text: string): this;
    newline(): this;
    line(text: string): this;
    cut(partial?: 'partial' | 'full'): this;
    image(
      image: ImageData | HTMLCanvasElement | HTMLImageElement,
      width: number,
      height: number,
      algorithm?: 'threshold' | 'bayer' | 'floydsteinberg' | 'atkinson'
    ): this;
    align(alignment: 'left' | 'center' | 'right'): this;
    bold(enabled?: boolean): this;
    underline(enabled?: boolean | 0 | 1 | 2): this;
    size(width: number, height: number): this;
    barcode(data: string, type: string, height: number): this;
    qrcode(data: string, options?: object): this;
    initialize(): this;
  }

  export default ReceiptPrinterEncoder;
}

declare module '@point-of-sale/webserial-receipt-printer' {
  interface WebSerialReceiptPrinterEvents {
    connected: () => void;
    disconnected: () => void;
  }

  class WebSerialReceiptPrinter {
    constructor();
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    print(data: Uint8Array): Promise<void>;
    addEventListener<K extends keyof WebSerialReceiptPrinterEvents>(
      type: K,
      listener: WebSerialReceiptPrinterEvents[K]
    ): void;
    removeEventListener<K extends keyof WebSerialReceiptPrinterEvents>(
      type: K,
      listener: WebSerialReceiptPrinterEvents[K]
    ): void;
  }

  export default WebSerialReceiptPrinter;
}
