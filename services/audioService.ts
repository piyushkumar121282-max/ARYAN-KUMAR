// Futuristic Web Audio Synthesizer for Tier Upgrade FX

class AudioEffectsService {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  // Play a tier-specific upgrade sound
  playUpgradeSound(plan: string) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (plan === 'PRO') {
      // Golden Cyber Chime - Radiant ascending power-up arpeggio
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.1 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.7);
      });

      // Warm background sub swell
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'triangle';
      sub.frequency.setValueAtTime(110, now);
      sub.frequency.exponentialRampToValueAtTime(220, now + 0.5);
      subGain.gain.setValueAtTime(0.15, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      sub.connect(subGain);
      subGain.connect(ctx.destination);
      sub.start(now);
      sub.stop(now + 0.75);

    } else if (plan === 'MAX') {
      // Overdrive Hyper-Warp - Fast energetic dual-oscillator sweep
      const sweep = ctx.createOscillator();
      const sweepGain = ctx.createGain();
      sweep.type = 'sawtooth';
      sweep.frequency.setValueAtTime(200, now);
      sweep.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
      sweepGain.gain.setValueAtTime(0.12, now);
      sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      sweep.connect(sweepGain);
      sweepGain.connect(ctx.destination);
      sweep.start(now);
      sweep.stop(now + 0.55);

      // Cyan crystal harmonic cascade
      const crystalNotes = [587.33, 880, 1174.66, 1760]; // D5, A5, D6, A6
      crystalNotes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + 0.15 + idx * 0.08);
        gain.gain.setValueAtTime(0, now + 0.15 + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.15 + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15 + idx * 0.08 + 0.7);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + 0.15 + idx * 0.08);
        osc.stop(now + 0.15 + idx * 0.08 + 0.75);
      });

    } else if (plan === 'PRO_MAX') {
      // Supreme Rockstar Sovereign Chord - Orchestral electric swell
      const chords = [
        { f: 220, type: 'sawtooth' as const }, // A3
        { f: 277.18, type: 'sine' as const },  // C#4
        { f: 329.63, type: 'sawtooth' as const }, // E4
        { f: 440, type: 'triangle' as const }, // A4
        { f: 554.37, type: 'sine' as const }, // C#5
        { f: 880, type: 'sine' as const }     // A5
      ];

      chords.forEach((chord) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = chord.type;
        osc.frequency.setValueAtTime(chord.f, now);
        
        // Tremolo / vibrato
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.3);
      });

      // Stardust glitter
      [1318.51, 1760, 2093, 2637].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + 0.3 + idx * 0.1);
        gain.gain.setValueAtTime(0.1, now + 0.3 + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3 + idx * 0.1 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + 0.3 + idx * 0.1);
        osc.stop(now + 0.3 + idx * 0.1 + 0.6);
      });

    } else {
      // FREE plan subtle click/beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  }

  // Soft button click feedback
  playClick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }
}

export const audioService = new AudioEffectsService();
