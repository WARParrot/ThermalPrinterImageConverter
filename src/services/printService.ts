import WebSerialReceiptPrinter from '@point-of-sale/webserial-receipt-printer';
import ReceiptPrinterEncoder from '@point-of-sale/receipt-printer-encoder';

export interface PrinterInfo {
  connected: boolean;
  deviceName?: string;
}

class PrintService {
  private printer: WebSerialReceiptPrinter | null = null;
  private encoder: ReceiptPrinterEncoder;
  private listeners: ((info: PrinterInfo) => void)[] = [];

  constructor() {
    this.encoder = new ReceiptPrinterEncoder({
      language: 'esc-pos',
      width: 42,
    });
  }

  onStatusChange(callback: (info: PrinterInfo) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners() {
    const info = this.getPrinterInfo();
    this.listeners.forEach(cb => cb(info));
  }

  getPrinterInfo(): PrinterInfo {
    return {
      connected: this.printer !== null,
      deviceName: this.printer ? 'Thermal Printer' : undefined,
    };
  }

  async connect(): Promise<boolean> {
    try {
      // Create a temporary instance to attempt connection
      const newPrinter = new WebSerialReceiptPrinter();

      // Set up event listeners before connecting
      newPrinter.addEventListener('connected', () => {
        console.log('Printer connected');
        this.notifyListeners();
      });

      newPrinter.addEventListener('disconnected', () => {
        console.log('Printer disconnected');
        this.printer = null;
        this.notifyListeners();
      });

      // Attempt to connect – this will show the browser permission prompt
      await newPrinter.connect();

      // Connection successful – assign to the instance property
      this.printer = newPrinter;
      this.notifyListeners();
      return true;
    } catch (error) {
      // User cancelled or connection failed – ensure printer is null
      console.error('WebSerial connection failed or cancelled:', error);
      this.printer = null;
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.printer) {
      try {
        await this.printer.disconnect();
      } catch (error) {
        console.error('Disconnect error:', error);
      } finally {
        this.printer = null;
        this.notifyListeners();
      }
    }
  }

  async printImage(canvas: HTMLCanvasElement): Promise<void> {
    if (!this.printer) {
      throw new Error('No printer connected');
    }

    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const commands = this.encoder
        .initialize()
        .align('center')
        .image(imageData, canvas.width, canvas.height, 'threshold')
        .cut('partial')
        .encode();

      await this.printer.print(commands);
    } catch (error) {
      console.error('Print error:', error);
      throw error;
    }
  }

  static isSupported(): boolean {
    return 'serial' in navigator;
  }
}

export const printService = new PrintService();
export { PrintService };
