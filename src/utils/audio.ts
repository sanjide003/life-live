// Web Audio API Synthesizer for high-fidelity Alarm and Azan chime alerts
let audioCtx: AudioContext | null = null;
let soundInterval: any = null;

export function playAlarmSound(type: 'task' | 'bill' | 'prayer' | 'custom' = 'custom') {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    // Clear any previous running timers
    if (soundInterval) {
      clearInterval(soundInterval);
    }
    
    // Choose chime frequency patterns depending on alarm category
    // Prayers get a serene, layered meditative bell tone
    // Finance/Bills get an active digital beep sequence
    // Tasks get a pleasant dual chime
    const triggerTone = () => {
      if (!audioCtx) return;
      
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      const now = audioCtx.currentTime;
      
      if (type === 'prayer') {
        // Serene prayer reminder: resonant 440Hz (A4) and 554.37Hz (C#5) with beautiful decay
        osc1.type = 'triangle';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(329.63, now); // E4
        osc2.frequency.setValueAtTime(440.00, now); // A4
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.25, now + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.8);
        osc2.stop(now + 1.8);
      } else if (type === 'bill') {
        // Bill due alert: energetic digital double-pip
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880.00, now); // A5
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        
        osc1.start(now);
        osc1.stop(now + 0.2);
        
        // second pip
        setTimeout(() => {
          if (!audioCtx) return;
          const osc3 = audioCtx.createOscillator();
          const gain3 = audioCtx.createGain();
          osc3.connect(gain3);
          gain3.connect(audioCtx.destination);
          osc3.frequency.setValueAtTime(987.77, audioCtx.currentTime); // B5
          gain3.gain.setValueAtTime(0, audioCtx.currentTime);
          gain3.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
          gain3.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
          osc3.start();
          osc3.stop(audioCtx.currentTime + 0.2);
        }, 250);
      } else {
        // Tasks and custom alerts: cheerful melodic C-major chime
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc2.frequency.setValueAtTime(659.25, now); // E5
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.8);
        osc2.stop(now + 0.8);
      }
    };

    // First ring
    triggerTone();
    
    // Repeat the alarm signal every 1.5 seconds
    soundInterval = setInterval(() => {
      triggerTone();
    }, 1500);

  } catch (error) {
    console.warn('[Audio] Failed to initialize Web Audio context', error);
  }
}

export function stopAlarmSound() {
  if (soundInterval) {
    clearInterval(soundInterval);
    soundInterval = null;
  }
}
