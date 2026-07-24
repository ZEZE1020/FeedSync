'use client';

import { useEffect, useRef, useState } from 'react';

// Web Serial API is not in lib.dom.d.ts yet — minimal stubs
interface SerialPort {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  writable: WritableStream<Uint8Array> | null;
}

interface SerialAPI {
  requestPort(): Promise<SerialPort>;
}

interface Props {
  initialTemp?: number | null;
  initialChlorophyll?: number | null;
}

interface LogEntry {
  text: string;
  kind: 'info' | 'sent' | 'err';
}

type Decision = 'feed' | 'reduce' | 'skip';

interface Verdict {
  decision: Decision;
  label: string;
  why: string;
  command: string;
}

function evaluate(temp: number, algae: number): Verdict {
  if (algae > 15 || temp > 32 || temp < 14) {
    return {
      decision: 'skip',
      label: 'SKIP — hold feeding',
      why:
        algae > 15
          ? 'Chlorophyll-a above 15 mg/m³ — active algae bloom. Feeding now risks oxygen depletion and fish stress.'
          : 'Temperature outside safe range — fish metabolism drops sharply.',
      command: 'FEED:0',
    };
  }
  if (algae > 8 || temp > 30 || temp < 18) {
    return {
      decision: 'reduce',
      label: 'REDUCE — 40% ration',
      why: 'Borderline conditions. Reduced feed limits waste while bloom or temperature stabilises.',
      command: 'FEED:40',
    };
  }
  return {
    decision: 'feed',
    label: 'FEED — 100% ration',
    why: 'Temperature and bloom levels within safe range for normal feeding.',
    command: 'FEED:100',
  };
}

export function FeederTestPanel({ initialTemp, initialChlorophyll }: Props) {
  const [open, setOpen] = useState(false);
  const [temp, setTemp] = useState(initialTemp ?? 26);
  const [algae, setAlgae] = useState(initialChlorophyll ?? 4);
  const [connected, setConnected] = useState(false);
  const [baud, setBaud] = useState(9600);
  const [sendDisabled, setSendDisabled] = useState(true);
  const [log, setLog] = useState<LogEntry[]>([{ text: 'waiting for connection…', kind: 'info' }]);
  const [mounted, setMounted] = useState(false);
  const [serialSupported, setSerialSupported] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSerialSupported('serial' in navigator);
  }, []);

  const portRef = useRef<SerialPort | null>(null);
  const writerRef = useRef<WritableStreamDefaultWriter | null>(null);
  const consoleRef = useRef<HTMLDivElement>(null);

  const verdict = evaluate(temp, algae);

  function addLog(text: string, kind: LogEntry['kind'] = 'info') {
    setLog((prev) => [...prev.slice(-80), { text, kind }]);
  }

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [log]);

  async function connect() {
    try {
      const port = await (navigator as Navigator & { serial: SerialAPI }).serial.requestPort();
      await port.open({ baudRate: baud });
      portRef.current = port;
      writerRef.current = port.writable!.getWriter() as WritableStreamDefaultWriter<Uint8Array>;
      setConnected(true);
      setSendDisabled(false);
      addLog(`Port opened at ${baud} baud.`);
      addLog('Ready to send feed commands.');
    } catch (err) {
      addLog(`Connection failed: ${(err as Error).message}`, 'err');
    }
  }

  async function disconnect() {
    try {
      if (writerRef.current) await writerRef.current.close();
      if (portRef.current) await portRef.current.close();
    } catch (err) {
      addLog(`Disconnect error: ${(err as Error).message}`, 'err');
    }
    portRef.current = null;
    writerRef.current = null;
    setConnected(false);
    setSendDisabled(true);
    addLog('Port closed.');
  }

  async function send() {
    if (!writerRef.current) return;
    const cmd = verdict.command + '\n';
    try {
      await writerRef.current.write(new TextEncoder().encode(cmd));
      addLog(`sent → ${verdict.command}`, 'sent');
    } catch (err) {
      addLog(`Write failed: ${(err as Error).message}`, 'err');
    }
  }

  const decisionColors: Record<Decision, { border: string; bg: string; text: string }> = {
    feed:   { border: '#7ee08a', bg: 'rgba(126,224,138,0.08)', text: '#7ee08a' },
    reduce: { border: '#e0b34f', bg: 'rgba(224,179,79,0.08)',  text: '#e0b34f' },
    skip:   { border: '#e0714f', bg: 'rgba(224,113,79,0.08)',  text: '#e0714f' },
  };
  const dc = decisionColors[verdict.decision];

  if (!mounted) return null;

  return (
    <>
      {/* Tab trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: 'fixed',
          top: '50%',
          right: open ? 380 : 0,
          transform: 'translateY(-50%) rotate(180deg)',
          writingMode: 'vertical-rl',
          background: '#062430',
          color: '#7ee08a',
          border: '1px solid #154a5c',
          borderRight: 'none',
          borderRadius: '8px 0 0 8px',
          padding: '14px 10px',
          fontSize: 11,
          fontFamily: "'SF Mono', 'Courier New', monospace",
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          zIndex: 1000,
          transition: 'right 0.25s ease',
        }}
        aria-label={open ? 'Close feeder test panel' : 'Open feeder test panel'}
      >
        {open ? 'Close' : 'Feeder Test'}
      </button>

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: open ? 0 : -400,
          width: 380,
          height: '100vh',
          background: '#062430',
          borderLeft: '1px solid #154a5c',
          zIndex: 999,
          overflowY: 'auto',
          transition: 'right 0.25s ease',
          padding: '24px 20px 40px',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          color: '#eaf6f4',
        }}
      >
        <div style={{ fontFamily: "'SF Mono','Courier New',monospace", fontSize: 10, letterSpacing: '0.14em', color: '#7ee08a', textTransform: 'uppercase', marginBottom: 6 }}>
          Showcase · Web Serial API
        </div>
        <h2 style={{ fontSize: 16, margin: '0 0 6px', fontWeight: 650 }}>Feeder test panel</h2>
        <p style={{ color: '#8fb9bd', fontSize: 12, lineHeight: 1.5, margin: '0 0 20px' }}>
          Adjust environmental thresholds and send the resulting command to a WaziDev board over USB.
        </p>

        {/* Pipeline flow */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 20, fontFamily: "'SF Mono','Courier New',monospace", fontSize: 10 }}>
          {['KijaniSpace data', 'Decision engine', 'Web Serial / USB', 'WaziDev relay'].map((label, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{
                flex: 1, background: '#0a2f3d', border: `1px solid ${i <= 1 || (i === 2 && connected) ? '#7ee08a' : '#154a5c'}`,
                borderRadius: 6, padding: '6px 8px', fontSize: 9.5, color: '#8fb9bd', lineHeight: 1.4,
              }}>
                {label}
              </div>
              {i < 3 && <span style={{ color: '#4a7a82', padding: '0 3px' }}>›</span>}
            </div>
          ))}
        </div>

        {/* Sliders */}
        <div style={{ background: '#0a2f3d', border: '1px solid #154a5c', borderRadius: 10, padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8fb9bd', marginBottom: 14, fontWeight: 600 }}>
            Environmental inputs
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span>Sea surface temperature</span>
              <span style={{ fontFamily: "'SF Mono','Courier New',monospace", color: '#7ee08a' }}>{temp.toFixed(1)} °C</span>
            </div>
            <input
              type="range" min={10} max={35} step={0.5} value={temp}
              onChange={(e) => setTemp(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#7ee08a' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span>Chlorophyll-a (algae proxy)</span>
              <span style={{ fontFamily: "'SF Mono','Courier New',monospace", color: '#7ee08a' }}>{algae.toFixed(1)} mg/m³</span>
            </div>
            <input
              type="range" min={0} max={25} step={0.5} value={algae}
              onChange={(e) => setAlgae(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#7ee08a' }}
            />
          </div>

          {/* Decision */}
          <div style={{ marginTop: 14, borderRadius: 8, padding: 14, border: `1px solid ${dc.border}`, background: dc.bg, fontFamily: "'SF Mono','Courier New',monospace" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: dc.text, marginBottom: 6 }}>{verdict.label}</div>
            <div style={{ fontSize: 11.5, color: '#8fb9bd', lineHeight: 1.5 }}>{verdict.why}</div>
          </div>
        </div>

        {/* WaziDev link */}
        <div style={{ background: '#0a2f3d', border: '1px solid #154a5c', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8fb9bd', marginBottom: 14, fontWeight: 600 }}>
            WaziDev link
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'SF Mono','Courier New',monospace", fontSize: 12, marginBottom: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: connected ? '#7ee08a' : '#5c7176', boxShadow: connected ? '0 0 8px #7ee08a' : 'none' }} />
            <span style={{ color: '#8fb9bd' }}>{connected ? `Connected @ ${baud} baud` : 'Not connected'}</span>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, fontSize: 12, color: '#8fb9bd' }}>
            <label htmlFor="baud-select">Baud:</label>
            <select
              id="baud-select"
              value={baud}
              onChange={(e) => setBaud(parseInt(e.target.value, 10))}
              disabled={connected}
              style={{ background: '#041c24', color: '#eaf6f4', border: '1px solid #154a5c', borderRadius: 6, padding: '4px 6px', fontFamily: "'SF Mono','Courier New',monospace", fontSize: 12 }}
            >
              {[9600, 19200, 57600, 115200].map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {!serialSupported && (
            <p style={{ color: '#e0714f', fontSize: 12, fontFamily: "'SF Mono','Courier New',monospace", marginBottom: 10 }}>
              Web Serial not available. Open in Chrome or Edge on desktop.
            </p>
          )}

          <button
            onClick={connect}
            disabled={!serialSupported || connected}
            style={{ width: '100%', marginBottom: 8, padding: '10px 14px', borderRadius: 8, border: 'none', background: (!serialSupported || connected) ? '#3a4d4f' : '#7ee08a', color: (!serialSupported || connected) ? '#7d9294' : '#04241a', fontWeight: 600, fontSize: 13, cursor: (!serialSupported || connected) ? 'not-allowed' : 'pointer' }}
          >
            Connect to WaziDev (USB)
          </button>
          <button
            onClick={send}
            disabled={sendDisabled}
            style={{ width: '100%', marginBottom: 8, padding: '10px 14px', borderRadius: 8, border: '1px solid #154a5c', background: 'transparent', color: sendDisabled ? '#4a7a82' : '#eaf6f4', fontWeight: 600, fontSize: 13, cursor: sendDisabled ? 'not-allowed' : 'pointer' }}
          >
            Send current decision
          </button>
          <button
            onClick={disconnect}
            disabled={!connected}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #154a5c', background: 'transparent', color: !connected ? '#4a7a82' : '#eaf6f4', fontWeight: 600, fontSize: 13, cursor: !connected ? 'not-allowed' : 'pointer' }}
          >
            Disconnect
          </button>

          <div
            ref={consoleRef}
            style={{ background: '#041c24', border: '1px solid #154a5c', borderRadius: 8, padding: 12, fontFamily: "'SF Mono','Courier New',monospace", fontSize: 11, height: 130, overflowY: 'auto', marginTop: 12, lineHeight: 1.6 }}
          >
            {log.map((entry, i) => (
              <div key={i} style={{ color: entry.kind === 'sent' ? '#7ee08a' : entry.kind === 'err' ? '#e0714f' : '#8fb9bd' }}>
                $ {entry.text}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 16, padding: '10px 12px', borderRadius: 8, background: 'rgba(224,179,79,0.06)', border: '1px solid rgba(224,179,79,0.3)', fontSize: 11.5, color: '#e0b34f', lineHeight: 1.5 }}>
          KijaniSpace blocks direct browser requests (CORS). In production a server proxy fetches live SST/chlorophyll — sliders pre-filled from server data above.
        </div>
      </div>
    </>
  );
}
