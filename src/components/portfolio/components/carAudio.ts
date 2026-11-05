// Engine, tire and brake audio for the M2.
//
// The engine is built from three cuts of the real recording in /public/sounds:
//   m2-idle.wav     a seamless idle loop
//   m2-rev.mp3      the rev build, from idle up to the top of the range
//   m2-pulloff.mp3  the launch, played once when you pull away from a stop
//
// The car has an RPM value (0 = idle, 1 = top of the range). The rev recording is not just
// played louder or quieter. It is scrubbed: RPM picks the spot in the recording, and short
// overlapping grains of audio are played from that spot, so the pitch and tone climb and fall
// as the revs do. In neutral the revs follow the gas pedal. While driving they follow the
// speed and gear. Brake squeal, tire noise, shift clicks and exhaust pops all read the same
// physics (speed, braking, steering, hitting a barrier), so everything lines up.

const SOUND_URLS = {
  idle: "/sounds/m2-idle.wav",
  rev: "/sounds/m2-rev.mp3",
  pull: "/sounds/m2-pulloff.mp3",
} as const;

// Levels for each layer (the recordings are already balanced against each other).
const IDLE_LEVEL = 0.95;
const REV_LEVEL = 0.8;
const PULL_LEVEL = 0.95;

const GRAIN_DURATION = 0.14; // seconds each grain lasts
const GRAIN_HOP = 0.05; // seconds between grains, so about three overlap
const GRAIN_LOOKAHEAD = 0.12; // how far ahead grains are scheduled, so a slow frame does not leave a gap

type RawSounds = { idle: ArrayBuffer; rev: ArrayBuffer; pull: ArrayBuffer };

let prefetched: Promise<RawSounds | null> | null = null;

// Downloads the sound files ahead of time, so the first key press doesn't wait for the network.
// Decoding happens later, once the audio context exists.
export function prefetchCarSounds(): Promise<RawSounds | null> {
  if (!prefetched) {
    const get = (url: string) =>
      fetch(url).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(`${url} ${r.status}`))));
    prefetched = Promise.all([get(SOUND_URLS.idle), get(SOUND_URLS.rev), get(SOUND_URLS.pull)])
      .then(([idle, rev, pull]) => ({ idle, rev, pull }))
      .catch(() => null);
  }
  return prefetched;
}

export type CarAudioInput = {
  engineOn: boolean;
  throttle: boolean; // gas pedal held
  brake: boolean; // brake pedal held
  driving: boolean; // false while docked in neutral
  speed: number; // signed ground speed in px/s, negative is reverse
  topSpeed: number; // top speed of the current gear, px/s
  slide: boolean; // steering hard at speed
  scrape: number; // 0 to 1, how hard the car is grinding along a barrier
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

export class CarAudio {
  readonly ctx: AudioContext;
  // Smoothed RPM, 0 at idle and 1 at the top of the range.
  rpm = 0;

  private master: GainNode;
  private idleGain: GainNode;
  private revGain: GainNode;
  private pullGain: GainNode;
  private roadGain: GainNode;
  private rumbleGain: GainNode;
  private squealGain: GainNode;
  private squealA: OscillatorNode;
  private squealB: OscillatorNode;
  private skidGain: GainNode;
  private skidFilter: BiquadFilterNode;
  private scrapeGain: GainNode;
  private fallbackOsc: OscillatorNode;
  private fallbackGain: GainNode;

  private noise: AudioBuffer;
  private hann: Float32Array;

  private idleBuf: AudioBuffer | null = null;
  private revBuf: AudioBuffer | null = null;
  private pullBuf: AudioBuffer | null = null;
  private idleSrc: AudioBufferSourceNode | null = null;

  private nextGrain = 0;
  private limiter = 0; // seconds left of a rev limiter cut
  private shiftDip = 0; // seconds left of the dip while changing gear
  private pullSrc: AudioBufferSourceNode | null = null;
  private pullEnv: GainNode | null = null;
  private pullStart = -10;
  private pullUntil = 0;
  private prevEngineOn = false;
  private prevThrottle = false;
  private prevBrake = false;
  private pops: number[] = []; // audio times of exhaust pops still to fire

  constructor() {
    const Ctor =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctor();
    const ctx = this.ctx;

    // Everything goes through a compressor, so the launch is punchy but never clips.
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 16;
    comp.ratio.value = 3.5;
    comp.attack.value = 0.004;
    comp.release.value = 0.18;
    this.master = ctx.createGain();
    this.master.gain.value = 0.85;
    this.master.connect(comp);
    comp.connect(ctx.destination);

    const layer = () => {
      const g = ctx.createGain();
      g.gain.value = 0;
      g.connect(this.master);
      return g;
    };
    this.idleGain = layer();
    this.revGain = layer();
    this.pullGain = layer();
    this.roadGain = layer();
    this.rumbleGain = layer();
    this.squealGain = layer();
    this.skidGain = layer();
    this.scrapeGain = layer();
    this.fallbackGain = layer();

    // White noise, shared by the tire, brake and pop sounds.
    this.noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const loopNoise = (type: BiquadFilterType, freq: number, q: number, out: GainNode) => {
      const src = ctx.createBufferSource();
      src.buffer = this.noise;
      src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = type;
      f.frequency.value = freq;
      f.Q.value = q;
      src.connect(f);
      f.connect(out);
      src.start(0, Math.random());
      return f;
    };
    loopNoise("bandpass", 520, 0.6, this.roadGain); // tire and wind roar
    loopNoise("lowpass", 640, 0.7, this.rumbleGain); // brake grind
    // Brake squeal is tonal: two slightly detuned, inharmonic tones, with a little hiss on top.
    this.squealA = ctx.createOscillator();
    this.squealA.type = "triangle";
    this.squealA.frequency.value = 2200;
    this.squealB = ctx.createOscillator();
    this.squealB.type = "sine";
    this.squealB.frequency.value = 3300;
    const squealMix = ctx.createGain();
    squealMix.gain.value = 0.5;
    this.squealA.connect(squealMix);
    this.squealB.connect(squealMix);
    squealMix.connect(this.squealGain);
    this.squealA.start();
    this.squealB.start();
    loopNoise("bandpass", 3000, 2.5, this.squealGain); // a little hiss under the squeal
    this.skidFilter = loopNoise("bandpass", 1800, 5, this.skidGain); // tire slide
    loopNoise("bandpass", 1500, 1.3, this.scrapeGain); // metal scraping a barrier

    // A plain synth engine that only plays if the recordings can't be loaded.
    this.fallbackOsc = ctx.createOscillator();
    this.fallbackOsc.type = "sawtooth";
    this.fallbackOsc.frequency.value = 45;
    const fb = ctx.createBiquadFilter();
    fb.type = "lowpass";
    fb.frequency.value = 700;
    fb.Q.value = 2;
    this.fallbackOsc.connect(fb);
    fb.connect(this.fallbackGain);
    this.fallbackOsc.start();

    // Window shape that fades each grain in and out.
    this.hann = new Float32Array(64);
    for (let i = 0; i < this.hann.length; i++) {
      this.hann[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (this.hann.length - 1)));
    }

    this.loadBuffers();
  }

  resume() {
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  dispose() {
    void this.ctx.close();
  }

  private async loadBuffers() {
    const raw = await prefetchCarSounds();
    if (!raw) return;
    try {
      // decodeAudioData takes ownership of the bytes, so each call gets its own copy.
      const [idle, rev, pull] = await Promise.all([
        this.ctx.decodeAudioData(raw.idle.slice(0)),
        this.ctx.decodeAudioData(raw.rev.slice(0)),
        this.ctx.decodeAudioData(raw.pull.slice(0)),
      ]);
      this.idleBuf = idle;
      this.revBuf = rev;
      this.pullBuf = pull;
      const src = this.ctx.createBufferSource();
      src.buffer = idle;
      src.loop = true;
      src.connect(this.idleGain);
      src.start();
      this.idleSrc = src;
    } catch {
      // The synth fallback keeps playing.
    }
  }

  private ramp(param: AudioParam, value: number, tau: number) {
    param.setTargetAtTime(value, this.ctx.currentTime, tau);
  }

  // A short burst of filtered noise, used for clicks, thumps and exhaust pops.
  private burst(opts: { type: BiquadFilterType; freq: number; q?: number; peak: number; attack: number; decay: number; delay?: number }) {
    const { ctx } = this;
    const t = ctx.currentTime + (opts.delay ?? 0);
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = opts.type;
    f.frequency.value = opts.freq;
    f.Q.value = opts.q ?? 1;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(opts.peak, t + opts.attack);
    env.gain.exponentialRampToValueAtTime(0.0001, t + opts.attack + opts.decay);
    src.connect(f);
    f.connect(env);
    env.connect(this.master);
    src.start(t, Math.random());
    src.stop(t + opts.attack + opts.decay + 0.05);
  }

  // A low thud for a door.
  door() {
    this.burst({ type: "lowpass", freq: 260, peak: 0.9, attack: 0.01, decay: 0.28 });
  }

  // A gear change: a click, a short dip in the engine, and a pop on an upshift at high revs.
  shift(up: boolean) {
    this.burst({ type: "lowpass", freq: 900, peak: 0.35, attack: 0.005, decay: 0.12 });
    this.shiftDip = 0.09;
    if (up && this.rpm > 0.5) this.queuePops(1 + Math.floor(Math.random() * 2), 0.22);
  }

  // One tone for the ring of metal in a crash. It rings out on a gentle exponential tail.
  private tone(freq: number, peak: number, tau: number, delay = 0, type: OscillatorType = "sine") {
    const { ctx } = this;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(peak, t + 0.004);
    env.gain.setTargetAtTime(0.0001, t + 0.004, tau);
    osc.connect(env);
    env.connect(this.master);
    osc.start(t);
    osc.stop(t + tau * 8 + 0.05);
  }

  // Filtered noise with a sharp hit and a long tail, for the body of a crash.
  private impactNoise(type: BiquadFilterType, freq: number, peak: number, tau: number, q = 0.7) {
    const { ctx } = this;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(peak, t + 0.003);
    env.gain.setTargetAtTime(0.0001, t + 0.003, tau);
    src.connect(f);
    f.connect(env);
    env.connect(this.master);
    src.start(t, Math.random());
    src.stop(t + tau * 8 + 0.05);
  }

  // A crash into a barrier. Strength runs from 0 (a bump) to 1 (flat out). It is built from a deep
  // thud, a crunch of noise, a low rumble, a ring of metal and scattered debris, and it knocks the
  // engine down so the impact stands out.
  crash(strength: number) {
    const { ctx } = this;
    const s = clamp(strength, 0.12, 1);
    const t = ctx.currentTime;

    // The thud: a sine that drops fast in pitch, with a tail that stays audible.
    const thud = ctx.createOscillator();
    thud.type = "sine";
    thud.frequency.setValueAtTime(140, t);
    thud.frequency.exponentialRampToValueAtTime(32, t + 0.4);
    const thudEnv = ctx.createGain();
    thudEnv.gain.setValueAtTime(0.0001, t);
    thudEnv.gain.exponentialRampToValueAtTime(1.0 * s, t + 0.005);
    thudEnv.gain.setTargetAtTime(0.0001, t + 0.005, 0.11);
    thud.connect(thudEnv);
    thudEnv.connect(this.master);
    thud.start(t);
    thud.stop(t + 1.0);

    // The crunch: a body of noise that darkens as it dies away, and the sharp snap of first contact.
    this.impactNoise("lowpass", 1200 + 900 * s, 0.95 * s, 0.09 + 0.08 * s);
    this.impactNoise("highpass", 2200, 0.5 * s, 0.025, 0.8);
    // A low rumble underneath, so a big hit has weight.
    this.impactNoise("lowpass", 240, 0.8 * s, 0.22);

    // The ring of bent metal: a few inharmonic tones that fade at different speeds.
    const detune = 0.92 + Math.random() * 0.16;
    [412, 655, 1043, 1530].forEach((f, i) => {
      this.tone(f * detune, 0.13 * s, 0.07 + 0.06 * (3 - i) * s + 0.04, i * 0.004, i % 2 ? "triangle" : "sine");
    });

    // Debris and glass: small bright ticks scattered over the next half second.
    const ticks = 3 + Math.floor(s * 7);
    for (let i = 0; i < ticks; i++) {
      this.burst({
        type: "highpass",
        freq: 2500 + Math.random() * 2500,
        q: 0.9,
        peak: (0.08 + Math.random() * 0.13) * s,
        attack: 0.002,
        decay: 0.03 + Math.random() * 0.04,
        delay: 0.05 + Math.random() * 0.55,
      });
    }

    // The engine gets knocked down and chokes for a moment, so the impact stands out. The
    // pull-off clip is cut so it can't keep playing through the hit.
    this.rpm *= 0.5;
    this.shiftDip = 0.25 + 0.35 * s;
    this.stopPullOff(0.08);
    this.prevThrottle = false;
  }

  private queuePops(count: number, over: number) {
    const now = this.ctx.currentTime;
    for (let i = 0; i < count; i++) this.pops.push(now + 0.03 + Math.random() * over);
    this.pops.sort((a, b) => a - b);
  }

  private firePop(strength: number) {
    this.burst({
      type: "bandpass",
      freq: 380 + Math.random() * 700,
      q: 1.1,
      peak: (0.12 + Math.random() * 0.14) * strength,
      attack: 0.004,
      decay: 0.05 + Math.random() * 0.05,
    });
  }

  // One grain of the rev recording, taken from the spot that matches the current RPM.
  private spawnGrain(when: number) {
    const buf = this.revBuf;
    if (!buf) return;
    const { ctx } = this;
    // Higher revs also play the grain a little faster, which widens the pitch range.
    const rate = 0.88 + 0.4 * this.rpm;
    const span = GRAIN_DURATION * rate; // how much of the recording one grain covers
    const room = Math.max(buf.duration - span, 0);
    const jitter = (Math.random() - 0.5) * 0.05;
    const offset = clamp(this.rpm * room + jitter, 0, room);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rate;
    const g = ctx.createGain();
    g.gain.value = 0;
    g.gain.setValueCurveAtTime(this.hann, when, GRAIN_DURATION);
    src.connect(g);
    g.connect(this.revGain);
    src.onended = () => g.disconnect();
    src.start(when, offset, span);
  }

  private startPullOff() {
    if (!this.pullBuf) return;
    const { ctx } = this;
    this.stopPullOff(0.05);
    const src = ctx.createBufferSource();
    src.buffer = this.pullBuf;
    const env = ctx.createGain();
    env.gain.value = 1;
    src.connect(env);
    env.connect(this.pullGain);
    src.start();
    this.pullSrc = src;
    this.pullEnv = env;
    this.pullStart = ctx.currentTime;
    // The rev layer stays ducked until the last part of the clip, then comes back in.
    this.pullUntil = ctx.currentTime + this.pullBuf.duration - 0.3;
  }

  private stopPullOff(fade: number) {
    if (!this.pullSrc || !this.pullEnv) return;
    const t = this.ctx.currentTime;
    this.pullEnv.gain.cancelScheduledValues(t);
    this.pullEnv.gain.setValueAtTime(this.pullEnv.gain.value, t);
    this.pullEnv.gain.linearRampToValueAtTime(0, t + fade);
    this.pullSrc.stop(t + fade + 0.02);
    this.pullSrc = null;
    this.pullEnv = null;
    this.pullUntil = 0;
  }

  // Call once per frame.
  update(dt: number, input: CarAudioInput) {
    const { ctx } = this;
    const now = ctx.currentTime;
    const speed = Math.abs(input.speed);
    const ratio = input.topSpeed > 0 ? Math.min(speed / input.topSpeed, 1) : 0;
    const gas = input.engineOn && input.throttle;

    // ---- RPM ----
    let target: number;
    let rise: number;
    let fall: number;
    if (!input.engineOn) {
      target = 0;
      rise = 1;
      fall = 2.5;
    } else if (input.driving && speed > 25) {
      // Rolling: the revs follow the speed and the gear. Slipping the clutch on a launch holds
      // them up for the first stretch, fading out as the speed builds.
      const slip = gas ? 0.55 * (1 - clamp(speed / 160, 0, 1)) : 0;
      target = Math.max(ratio, slip);
      rise = 3.5;
      fall = 2.4;
    } else {
      // Neutral, or just starting off: the revs follow the pedal.
      target = gas ? (input.driving ? 0.55 : 1) : 0;
      rise = 1.7;
      fall = 1.2;
    }
    // Starting the engine gives a short flare of revs.
    if (input.engineOn && !this.prevEngineOn) this.rpm = Math.max(this.rpm, 0.5);
    this.rpm += Math.max(-fall * dt, Math.min(rise * dt, target - this.rpm));

    // Hitting the top of the range makes the limiter chatter.
    if (gas && this.rpm > 0.985 && this.limiter <= 0) {
      this.limiter = 0.11;
      this.rpm = 0.9;
    }
    this.limiter = Math.max(0, this.limiter - dt);
    this.shiftDip = Math.max(0, this.shiftDip - dt);

    // Letting off the gas at high revs crackles.
    if (this.prevThrottle && !input.throttle && input.engineOn && this.rpm > 0.6) {
      this.queuePops(2 + Math.floor(Math.random() * 4), 0.5);
    }

    // ---- Pull-off ----
    // Pulling away from a stop plays the launch recording. It follows the pedal, so letting go
    // early fades it out.
    const risingGas = gas && !this.prevThrottle;
    if (input.driving && gas && speed < 90 && now - this.pullStart > 1.2 && (risingGas || speed < 25)) {
      if (now - this.pullStart > 1.5 || risingGas) this.startPullOff();
    }
    if (this.pullSrc && !gas && now - this.pullStart < 0.5) this.stopPullOff(0.2);
    if (this.pullSrc && this.pullBuf && now - this.pullStart > this.pullBuf.duration + 0.1) {
      this.pullSrc = null;
      this.pullEnv = null;
    }
    const pulling = now < this.pullUntil;
    this.ramp(this.pullGain.gain, input.engineOn ? PULL_LEVEL : 0, 0.03);

    // ---- Engine layers ----
    const buffersReady = !!(this.revBuf && this.idleBuf);
    const on = input.engineOn ? 1 : 0;
    const load = input.throttle ? 1 : 0.62; // easing off the gas is quieter
    // The engine also gets louder as the revs climb, on top of the rise already in the recording.
    let revTarget = on * smooth(0.02, 0.18, this.rpm) * load * (0.75 + 0.45 * this.rpm);
    if (this.limiter > 0) revTarget *= 0.35;
    if (this.shiftDip > 0) revTarget *= 0.3;
    if (pulling) revTarget *= 0.3;
    this.ramp(this.revGain.gain, revTarget * REV_LEVEL, pulling ? 0.04 : 0.1);
    const idleTarget = on * (1 - smooth(0.03, 0.22, this.rpm));
    this.ramp(this.idleGain.gain, idleTarget * IDLE_LEVEL, 0.06);
    // The idle loop breathes a little faster as the revs rise, so it hands over smoothly.
    if (this.idleSrc) this.ramp(this.idleSrc.playbackRate, 1 + this.rpm * 0.25, 0.1);

    // Grains of the rev recording, scheduled slightly ahead of the clock.
    if (buffersReady && input.engineOn && this.rpm > 0.015 && ctx.state === "running") {
      if (this.nextGrain < now) this.nextGrain = now;
      while (this.nextGrain < now + GRAIN_LOOKAHEAD) {
        this.spawnGrain(this.nextGrain);
        this.nextGrain += GRAIN_HOP;
      }
    }

    // The synth fallback, only if the recordings didn't load.
    this.ramp(this.fallbackGain.gain, buffersReady ? 0 : on * 0.1, 0.1);
    this.ramp(this.fallbackOsc.frequency, 45 + this.rpm * 110, 0.08);

    // ---- Exhaust pops ----
    while (this.pops.length && this.pops[0] <= now) {
      this.pops.shift();
      this.firePop(0.4 + this.rpm * 0.8);
    }

    // ---- Tires and brakes, from the same physics ----
    const speedN = Math.min(speed / 900, 1);
    const braking = input.brake && input.speed > 30;
    this.ramp(this.roadGain.gain, speed > 5 ? 0.012 + 0.12 * speedN : 0, 0.12);

    // Braking at speed grinds, and squeals more as the car slows towards a stop, with the
    // pitch climbing the slower it gets. A thump marks the pads biting.
    const slowing = 1 - Math.min(speed / 700, 1);
    this.ramp(this.rumbleGain.gain, braking ? 0.05 + 0.12 * speedN : 0, 0.06);
    // It builds as the car slows, and cuts off when it stops.
    const squeal = braking && speed > 18 ? 0.11 * smooth(0.02, 0.1, speed / 700) * (speed > 420 ? 0.5 : 1) : 0;
    this.ramp(this.squealGain.gain, squeal, 0.04);
    const pitch = 1700 + slowing * 1500 + (Math.random() - 0.5) * 40; // a small wobble keeps it alive
    this.ramp(this.squealA.frequency, pitch, 0.05);
    this.ramp(this.squealB.frequency, pitch * 1.52, 0.05);
    if (braking && !this.prevBrake && speed > 150) {
      this.burst({ type: "lowpass", freq: 320, peak: 0.28 * (0.4 + speedN), attack: 0.01, decay: 0.12 });
    }

    // Grinding along a barrier scrapes.
    this.ramp(this.scrapeGain.gain, input.scrape * 0.2, 0.04);

    // Steering hard at speed slides the tires.
    this.ramp(this.skidGain.gain, input.slide ? 0.15 : 0, 0.08);
    this.ramp(this.skidFilter.frequency, 1500 + speedN * 800, 0.1);

    this.prevEngineOn = input.engineOn;
    this.prevThrottle = input.throttle;
    this.prevBrake = braking;
  }
}
