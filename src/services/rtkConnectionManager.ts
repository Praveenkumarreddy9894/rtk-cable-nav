import { NmeaParser } from "./nmeaParser";
import { RtkLocation } from "../types/location";

type DataCallback = (loc: RtkLocation) => void;
type StatusCallback = (status: string) => void;

export type ConnectionMode = "BLUETOOTH" | "USB_SERIAL" | "NTRIP_TCP";

export class RtkConnectionManager {
  private parser = new NmeaParser();
  private staleTimer: ReturnType<typeof setInterval> | null = null;
  private lastRtkEpoch = 0;

  constructor(
    private readonly onData: DataCallback,
    private readonly onStatus: StatusCallback
  ) {}

  async connect(mode: ConnectionMode): Promise<void> {
    this.onStatus(`Connecting ${mode}...`);
    this.watchStaleSignal();

    // Replace with actual transport setup:
    // - BLUETOOTH: react-native-ble-plx notifications
    // - USB_SERIAL: USB host serial line reader
    // - NTRIP_TCP: socket stream of NMEA or RTCM-derived solution
    this.onStatus(`Connected ${mode}`);
  }

  disconnect(): void {
    if (this.staleTimer) clearInterval(this.staleTimer);
    this.staleTimer = null;
    this.onStatus("Disconnected");
  }

  ingestRawNmea(line: string): void {
    const parsed = this.parser.parseLine(line);
    if (!parsed) return;
    this.lastRtkEpoch = Date.now();
    this.onData(parsed);
  }

  private watchStaleSignal(): void {
    if (this.staleTimer) return;
    this.staleTimer = setInterval(() => {
      if (this.lastRtkEpoch === 0) return;
      if (Date.now() - this.lastRtkEpoch > 3000) {
        this.onStatus("RTK signal stale (>3s). Do not use internal GPS.");
      }
    }, 1000);
  }
}
