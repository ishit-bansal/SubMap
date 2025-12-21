/**
 * Retro Sound Effects for SubMap
 * Uses Web Audio API to generate 8-bit style sounds
 */

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Master volume control (0.0 to 1.0)
const MASTER_VOLUME = 0.03;

function playSound(type) {
  // Resume audio context if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  switch (type) {
    case 'add':
      // Rising blip - happy sound for adding
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.08);
      gainNode.gain.setValueAtTime(MASTER_VOLUME, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
      break;

    case 'remove':
      // Falling blip - sad sound for removing
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(MASTER_VOLUME, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.12);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.12);
      break;

    case 'click':
      // Short tick
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(MASTER_VOLUME * 0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.02);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.02);
      break;

    case 'theme':
      // Theme switch sound - two tones
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.06);
      gainNode.gain.setValueAtTime(MASTER_VOLUME, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
      break;

    case 'error':
      // Buzz for errors
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
      gainNode.gain.setValueAtTime(MASTER_VOLUME, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
      break;
  }
}
