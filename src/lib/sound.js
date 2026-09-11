// Tiny procedural ambient-sound engine using WebAudio (no assets needed).
// Rain/ocean/brown/white = filtered noise with slow amplitude LFO;
// pad = detuned oscillators through a lowpass.

class Ambient {
  constructor() { this.ctx = null; this.nodes = []; this.kind = null; }

  _noiseBuffer(ctx, type) {
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (type === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
      else d[i] = w;
    }
    return buf;
  }

  start(kind, volume = 0.5) {
    this.stop();
    if (!kind) return;
    try {
      const ctx = this.ctx || (this.ctx = new (window.AudioContext || window.webkitAudioContext)());
      if (ctx.state === 'suspended') ctx.resume();
      const master = ctx.createGain();
      master.gain.value = volume;
      master.connect(ctx.destination);
      this.nodes.push(master);

      const addNoise = (filterType, freq, q, brown, lfoHz, depth) => {
        const src = ctx.createBufferSource();
        src.buffer = this._noiseBuffer(ctx, brown ? 'brown' : 'white');
        src.loop = true;
        const f = ctx.createBiquadFilter();
        f.type = filterType; f.frequency.value = freq; f.Q.value = q;
        const mod = ctx.createGain();
        mod.gain.value = 1;
        src.connect(f); f.connect(mod); mod.connect(master);
        src.start();
        this.nodes.push(src, f, mod);
        if (lfoHz) {
          const o = ctx.createOscillator();
          o.type = 'sine'; o.frequency.value = lfoHz;
          const g = ctx.createGain();
          g.gain.value = depth;
          o.connect(g); g.connect(mod.gain);
          o.start();
          this.nodes.push(o, g);
        }
      };

      if (kind === 'white') addNoise('highpass', 2200, 0.7, false);
      else if (kind === 'brown') addNoise('lowpass', 520, 0.6, true, 0.14, 0.22);
      else if (kind === 'rain') addNoise('bandpass', 1500, 0.5, false, 0.25, 0.3);
      else if (kind === 'ocean') addNoise('lowpass', 460, 0.4, true, 0.09, 0.65);
      else if (kind === 'pad') {
        const filt = ctx.createBiquadFilter();
        filt.type = 'lowpass'; filt.frequency.value = 640;
        filt.connect(master);
        this.nodes.push(filt);
        [146.83, 220, 293.66, 369.99].forEach((fr, i) => {
          const o = ctx.createOscillator();
          o.type = i % 2 ? 'sine' : 'triangle';
          o.frequency.value = fr; o.detune.value = i * 3 - 4;
          const g = ctx.createGain();
          g.gain.value = 0.12;
          o.connect(g); g.connect(filt);
          o.start();
          this.nodes.push(o, g);
        });
      }
      this.kind = kind;
    } catch { /* audio unsupported */ }
  }

  setVolume(v) {
    const m = this.nodes[0];
    if (m?.gain) { try { m.gain.value = v; } catch { /* noop */ } }
  }

  stop() {
    this.nodes.forEach((n) => {
      try { if (n.stop) n.stop(); } catch { /* noop */ }
      try { n.disconnect(); } catch { /* noop */ }
    });
    this.nodes = [];
    this.kind = null;
  }
}

export const ambient = new Ambient();

export function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const t0 = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0 + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.22, t0 + i * 0.12 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.12 + 0.5);
      o.connect(g); g.connect(ctx.destination);
      o.start(t0 + i * 0.12); o.stop(t0 + i * 0.12 + 0.6);
    });
    setTimeout(() => ctx.close(), 1500);
  } catch { /* noop */ }
}

