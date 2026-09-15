/**
 * Web Audio API Sound System for Water Park Tycoon.
 * 100% offline, zero external sound files required, instant latency.
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private musicInterval: number | null = null;
  private isMusicPlaying = false;
  private soundVolume = 0.8;
  private musicVolume = 0.5;
  private isMuted = false;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolumes(soundVol: number, musicVol: number, muted: boolean) {
    this.soundVolume = soundVol;
    this.musicVolume = musicVol;
    this.isMuted = muted;
  }

  // Play button click
  public playClick() {
    if (this.isMuted || this.soundVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

    gain.gain.setValueAtTime(0.2 * this.soundVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Play Coin Collect Sound
  public playCoin() {
    if (this.isMuted || this.soundVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.setValueAtTime(1318.51, now + 0.07); // E6
    osc2.frequency.setValueAtTime(1975.53, now + 0.07); // B6

    gain.gain.setValueAtTime(0.25 * this.soundVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.07);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  }

  // Play Splash sound
  public playSplash() {
    if (this.isMuted || this.soundVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Noise buffer for water splash
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4 * this.soundVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.4);
  }

  // Play Build / Placement Sound
  public playBuild() {
    if (this.isMuted || this.soundVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    this.playSplash();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.15);

    gain.gain.setValueAtTime(0.3 * this.soundVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Play Upgrade Sound
  public playUpgrade() {
    if (this.isMuted || this.soundVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
    notes.forEach((freq, idx) => {
      const now = this.ctx!.currentTime + idx * 0.08;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.25 * this.soundVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    });
  }

  // Play Level Up fanfare
  public playLevelUp() {
    if (this.isMuted || this.soundVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const chords = [
      [523.25, 659.25, 783.99], // C
      [587.33, 739.99, 880.00], // D
      [659.25, 830.61, 987.77], // E
      [1046.50, 1318.51, 1567.98] // C high
    ];

    chords.forEach((chord, i) => {
      const now = this.ctx!.currentTime + i * 0.15;
      chord.forEach(freq => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime((i === 3 ? 0.35 : 0.2) * this.soundVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (i === 3 ? 0.6 : 0.2));

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now);
        osc.stop(now + (i === 3 ? 0.6 : 0.2));
      });
    });
  }

  // Play Quest / Reward sound
  public playReward() {
    if (this.isMuted || this.soundVolume <= 0) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const notes = [659.25, 830.61, 987.77, 1318.51];
      notes.forEach((freq, idx) => {
        const now = this.ctx!.currentTime + idx * 0.09;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.3 * this.soundVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now);
        osc.stop(now + 0.3);
      });
    } catch {
      // Ignore audio failure
    }
  }

  // Play rich triumphant Daily Reward fanfare with cascading coin shower
  public playDailyRewardFanfare() {
    if (this.isMuted || this.soundVolume <= 0) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const vol = Math.max(0.05, this.soundVolume);

      // 1. Triumphant Ascending Brass/Synth Fanfare
      const fanfareChords = [
        { freqs: [523.25, 659.25, 783.99], offset: 0, dur: 0.2 }, // C Major
        { freqs: [587.33, 739.99, 880.00], offset: 0.16, dur: 0.2 }, // D Major
        { freqs: [659.25, 830.61, 987.77], offset: 0.32, dur: 0.24 }, // E Major
        { freqs: [783.99, 987.77, 1318.51, 1567.98], offset: 0.50, dur: 0.75 } // G5 + E6 + G6 Grand Climax
      ];

      fanfareChords.forEach(chord => {
        const chordTime = now + chord.offset;
        chord.freqs.forEach(freq => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, chordTime);

          gain.gain.setValueAtTime(0.2 * vol, chordTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, chordTime + chord.dur);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(chordTime);
          osc.stop(chordTime + chord.dur);
        });
      });

      // 2. Sparkling Coin Cascade (shimmering bright metallic dings)
      const coinFrequencies = [1318.51, 1567.98, 1760.0, 2093.0, 2349.32, 2637.02, 3135.96, 3520.0];
      coinFrequencies.forEach((freq, idx) => {
        const coinTime = now + 0.4 + idx * 0.07;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, coinTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.04, coinTime + 0.07);

        gain.gain.setValueAtTime(0.22 * vol, coinTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, coinTime + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(coinTime);
        osc.stop(coinTime + 0.25);
      });

      // 3. Resonant warm bass impact punch
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(160, now);
      bassOsc.frequency.exponentialRampToValueAtTime(50, now + 0.35);
      bassGain.gain.setValueAtTime(0.35 * vol, now);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      bassOsc.connect(bassGain);
      bassGain.connect(this.ctx.destination);
      bassOsc.start(now);
      bassOsc.stop(now + 0.35);
    } catch {
      // Safe fallback
    }
  }

  // Play Coin Shower sound
  public playCoinShower() {
    if (this.isMuted || this.soundVolume <= 0) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const vol = Math.max(0.05, this.soundVolume);
      const pitches = [1046.5, 1318.51, 1567.98, 1760.0, 2093.0, 2637.02];

      pitches.forEach((freq, idx) => {
        const t = now + idx * 0.06;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.18 * vol, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t);
        osc.stop(t + 0.18);
      });
    } catch {
      // Safe fallback
    }
  }

  // Play Cash / Shop purchase sound
  public playPurchase() {
    if (this.isMuted || this.soundVolume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'square';
    osc1.frequency.setValueAtTime(700, now);
    osc1.frequency.setValueAtTime(900, now + 0.08);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1400, now + 0.08);

    gain.gain.setValueAtTime(0.2 * this.soundVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.08);
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.3);
  }

  public initAudio() {
    this.initContext();
  }

  public startBackgroundMusic() {
    this.startMusic();
  }

  // Background Tropical Island Marimba / Synth music generator
  public startMusic() {
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.initContext();

    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25]; // C Pentatonic/Major
    const bassline = [130.81, 164.81, 174.61, 196.00];

    let step = 0;
    this.musicInterval = window.setInterval(() => {
      if (this.isMuted || this.musicVolume <= 0 || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;

        // Bass beat every 4 steps
        if (step % 4 === 0) {
          const bassOsc = this.ctx.createOscillator();
          const bassGain = this.ctx.createGain();
          bassOsc.type = 'sine';
          const bassFreq = bassline[(step / 4) % bassline.length];
          bassOsc.frequency.setValueAtTime(bassFreq, now);
          bassGain.gain.setValueAtTime(0.08 * this.musicVolume, now);
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          bassOsc.connect(bassGain);
          bassGain.connect(this.ctx.destination);
          bassOsc.start(now);
          bassOsc.stop(now + 0.4);
        }

        // Tropical marimba note
        if (Math.random() > 0.3) {
          const noteIndex = Math.floor(Math.random() * scale.length);
          const freq = scale[noteIndex];
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.06 * this.musicVolume, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 0.25);
        }

        step++;
      } catch {
        // Safe catch if AudioContext temporarily closed
      }
    }, 280);
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicPlaying = false;
  }
}

export const sound = new SoundSystem();
