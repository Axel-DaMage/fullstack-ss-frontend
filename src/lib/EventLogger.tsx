import { useState, useEffect } from 'react';
import { eventEmitter } from './EventEmitter';

interface LogEntry {
  id: number;
  event: string;
  data: unknown;
  timestamp: Date;
}

let idCounter = 0;

const originalEmit = eventEmitter.emit.bind(eventEmitter);
eventEmitter.emit = function<T>(event: string, data: T): void {
  const entry: LogEntry = {
    id: ++idCounter,
    event,
    data,
    timestamp: new Date(),
  };
  window.dispatchEvent(new CustomEvent('event-log', { detail: entry }));
  return originalEmit(event, data);
};

interface EventLoggerProps {
  maxLogs?: number;
}

export function EventLogger({ maxLogs = 10 }: EventLoggerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const handler = (e: CustomEvent<LogEntry>) => {
      setLogs(prev => [e.detail, ...prev].slice(0, maxLogs));
    };
    window.addEventListener('event-log', handler as EventListener);
    return () => window.removeEventListener('event-log', handler as EventListener);
  }, [maxLogs]);

  if (logs.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: '#1a1a2e',
      border: '1px solid #4a4a6a',
      borderRadius: 8,
      padding: 12,
      maxWidth: 350,
      maxHeight: 300,
      overflow: 'auto',
      fontSize: 12,
      fontFamily: 'monospace',
      zIndex: 9999,
    }}>
      <div style={{ color: '#888', marginBottom: 8, fontWeight: 'bold' }}>
        📡 Observer Events
      </div>
      {logs.map(log => (
        <div key={log.id} style={{
          padding: '4px 0',
          borderBottom: '1px solid #333',
          color: '#00d9ff',
        }}>
          <div style={{ color: '#ff6b6b' }}>{log.event}</div>
          <div style={{ color: '#aaa' }}>
            {typeof log.data === 'object' ? JSON.stringify(log.data) : String(log.data)}
          </div>
          <div style={{ color: '#666', fontSize: 10 }}>
            {log.timestamp.toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
}