/**
 * Retro Sound Effects for SubMap
 * Uses Web Audio API to generate 8-bit style sounds
 */

let audioContext = null;

// Master volume control (0.0 to 1.0)
const MASTER_VOLUME = 0.02;

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

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  const now = ctx.currentTime;

  switch (type) {
    case 'add':
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(300, now);
      oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.06);
      gainNode.gain.setValueAtTime(MASTER_VOLUME, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      oscillator.start(now);
      oscillator.stop(now + 0.08);
      break;

    case 'remove':
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(400, now);
      oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.08);
      gainNode.gain.setValueAtTime(MASTER_VOLUME, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      oscillator.start(now);
      oscillator.stop(now + 0.1);
      break;

    case 'click':
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(600, now);
      gainNode.gain.setValueAtTime(MASTER_VOLUME * 0.4, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      oscillator.start(now);
      oscillator.stop(now + 0.02);
      break;

    case 'theme':
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(400, now);
      oscillator.frequency.setValueAtTime(600, now + 0.04);
      gainNode.gain.setValueAtTime(MASTER_VOLUME, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      oscillator.start(now);
      oscillator.stop(now + 0.08);
      break;

    case 'error':
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, now);
      gainNode.gain.setValueAtTime(MASTER_VOLUME, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      oscillator.start(now);
      oscillator.stop(now + 0.12);
      break;
  }
}
