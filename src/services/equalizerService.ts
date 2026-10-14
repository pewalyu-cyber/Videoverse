/**
 * VideoVerse - Spotify-style Equalizer Service & Web Audio Node Controller
 */

export interface EqualizerBand {
  frequency: number; // in Hz
  label: string;
  gain: number; // in dB (-12 to +12)
}

export interface EqualizerConfig {
  enabled: boolean;
  preset: string;
  bands: [number, number, number, number, number, number]; // 60Hz, 150Hz, 400Hz, 1kHz, 2.4kHz, 15kHz
}

export const FREQUENCY_LABELS = ['60Hz', '150Hz', '400Hz', '1kHz', '2.4kHz', '15kHz'];
export const FREQUENCY_VALUES = [60, 150, 400, 1000, 2400, 15000];

export const EQUALIZER_PRESETS: Record<string, [number, number, number, number, number, number]> = {
  Flat: [0, 0, 0, 0, 0, 0],
  'Bass Booster': [6, 4.5, 2, 0, 0, 0],
  'Bass Reducer': [-6, -4.5, -2, 0, 0, 0],
  'Treble Booster': [0, 0, 0, 2, 4.5, 6],
  'Treble Reducer': [0, 0, 0, -2, -4.5, -6],
  Electronic: [4.5, 3.5, 0, 1.5, 3, 4.5],
  Dance: [5, 4, 2, 0, 2.5, 3.5],
  'Hip-Hop': [6, 4, 1.5, 2, -1, 2],
  Rock: [5, 3, -1.5, 1.5, 3.5, 5],
  Pop: [-1.5, 1.5, 4.5, 3, -1, -2],
  Jazz: [3, 2, 0, 1.5, 2.5, 3],
  Acoustic: [3, 2.5, 1.5, 2, 3, 3.5],
  'Vocal Booster': [-2, 0, 3.5, 4.5, 3, 0],
  Classical: [4, 2.5, 0, 0, 2, 3]
};

const EQ_STORAGE_KEY = 'videoverse_equalizer_config';

class EqualizerService {
  private config: EqualizerConfig = {
    enabled: true,
    preset: 'Flat',
    bands: [0, 0, 0, 0, 0, 0]
  };

  private listeners: ((config: EqualizerConfig) => void)[] = [];

  constructor() {
    this.restore();
  }

  private restore() {
    try {
      const stored = localStorage.getItem(EQ_STORAGE_KEY);
      if (stored) {
        this.config = JSON.parse(stored);
      }
    } catch {
      // ignore
    }
  }

  private save() {
    try {
      localStorage.setItem(EQ_STORAGE_KEY, JSON.stringify(this.config));
    } catch {
      // ignore
    }
  }

  public getConfig(): EqualizerConfig {
    return { ...this.config, bands: [...this.config.bands] };
  }

  public subscribe(cb: (config: EqualizerConfig) => void): () => void {
    this.listeners.push(cb);
    cb(this.getConfig());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.save();
    this.listeners.forEach((cb) => cb(this.getConfig()));
  }

  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.notify();
  }

  public setPreset(presetName: string): void {
    if (EQUALIZER_PRESETS[presetName]) {
      this.config.preset = presetName;
      this.config.bands = [...EQUALIZER_PRESETS[presetName]];
      this.notify();
    }
  }

  public setBandGain(index: number, gain: number): void {
    if (index >= 0 && index < 6) {
      const clamped = Math.max(-12, Math.min(12, Math.round(gain * 10) / 10));
      this.config.bands[index] = clamped;
      this.config.preset = 'Custom';
      this.notify();
    }
  }

  public resetToFlat(): void {
    this.setPreset('Flat');
  }

  /**
   * Helper to generate smooth SVG path for the frequency curve
   * width: width of SVG, height: height of SVG
   */
  public generateSvgCurvePath(width: number, height: number): string {
    const bands = this.config.bands;
    const paddingX = 24;
    const availableWidth = width - paddingX * 2;
    const midY = height / 2;
    const maxDb = 12;

    const points = bands.map((db, idx) => {
      const x = paddingX + (idx / (bands.length - 1)) * availableWidth;
      // -12 dB is bottom (height - padding), +12 dB is top
      const y = midY - (db / maxDb) * (midY - 16);
      return { x, y };
    });

    if (points.length === 0) return '';

    // Smooth cardinal spline
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    return path;
  }
}

export const equalizerService = new EqualizerService();
