import { useState, useEffect } from 'react';
import { printService, PrintService, type PrinterInfo } from '../services/printService';
import './PrinterConnection.css';

interface Props {
  onConnectionChange?: (connected: boolean) => void;
}

const PrinterConnection: React.FC<Props> = ({ onConnectionChange }) => {
  const [printerInfo, setPrinterInfo] = useState<PrinterInfo>(printService.getPrinterInfo());
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSupported = PrintService.isSupported();

  useEffect(() => {
    const unsubscribe = printService.onStatusChange((info) => {
      setPrinterInfo(info);
      onConnectionChange?.(info.connected);
    });
    return unsubscribe;
  }, [onConnectionChange]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const success = await printService.connect();
      if (!success) {
        setError('Connection failed. Make sure the printer is connected and try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await printService.disconnect();
  };

  if (!isSupported) {
    return (
      <div className="printer-connection">
        <div className="browser-warning">
          ⚠️ Your browser doesn't support Web Serial. Try Chrome, Edge, or Opera.
        </div>
      </div>
    );
  }

  return (
    <div className="printer-connection">
      <div className="connection-status">
        <span className={`status-indicator ${printerInfo.connected ? 'connected' : ''}`} />
        <span className="status-text">
          {printerInfo.connected 
            ? `Connected to ${printerInfo.deviceName || 'printer'}`
            : 'No printer connected'}
        </span>
      </div>

      {!printerInfo.connected ? (
        <div className="connection-controls">
          <button 
            className="btn-connect" 
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Connect Printer (Web Serial)'}
          </button>
        </div>
      ) : (
        <button className="btn-disconnect" onClick={handleDisconnect}>
          Disconnect
        </button>
      )}

      {error && <div className="connection-error">{error}</div>}
    </div>
  );
};

export default PrinterConnection;
