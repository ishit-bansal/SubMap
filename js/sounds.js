/**
 * Retro Sound Effects for SubMap
 */

let audioContext = null;
const MASTER_VOLUME = 0.08;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

function playSound(type) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  const t = ctx.currentTime;

  switch (type) {
    case 'add':
      osc.type = 'square';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.06);
      gain.gain.setValueAtTime(MASTER_VOLUME, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.start(t);
      osc.stop(t + 0.08);
      break;
    case 'remove':
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(150, t + 0.08);
      gain.gain.setValueAtTime(MASTER_VOLUME, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.start(t);
      osc.stop(t + 0.1);
      break;
    case 'click':
      osc.type = 'square';
      osc.frequency.setValueAtTime(600, t);
      gain.gain.setValueAtTime(MASTER_VOLUME * 0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
      osc.start(t);
      osc.stop(t + 0.02);
      break;
    case 'theme':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.setValueAtTime(600, t + 0.04);
      gain.gain.setValueAtTime(MASTER_VOLUME, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.start(t);
      osc.stop(t + 0.08);
      break;
  }
}
