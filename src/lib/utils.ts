import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Emergency Alarm Sound Utility
export class EmergencyAlarm {
  private static audioContext: AudioContext | null = null;
  private static oscillator: OscillatorNode | null = null;
  private static gainNode: GainNode | null = null;

  static start() {
    try {
      // Initialize audio context if not already created
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Create oscillator and gain nodes
      this.oscillator = this.audioContext.createOscillator();
      this.gainNode = this.audioContext.createGain();

      // Configure oscillator
      this.oscillator.type = 'triangle';
      this.oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);

      // Configure gain (volume)
      this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      this.gainNode.gain.setValueAtTime(1, this.audioContext.currentTime);

      // Connect nodes
      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);

      // Start oscillator
      this.oscillator.start();

      // Create alarm pattern
      this.createAlarmPattern();
    } catch (error) {
      console.error('Error starting alarm:', error);
    }
  }

  private static createAlarmPattern() {
    if (!this.gainNode || !this.audioContext || !this.oscillator) return;

    const now = this.audioContext.currentTime;
    
    // Create a repeating pattern of beeps
    for (let i = 0; i < 10; i++) {
      // Timing for each beep
      const startTime = now + (i * 0.5);
      const endTime = startTime + 0.25;

      // Volume
      this.gainNode.gain.setValueAtTime(0, startTime);
      this.gainNode.gain.setValueAtTime(0.8, startTime + 0.01);
      this.gainNode.gain.setValueAtTime(0.8, endTime - 0.01);
      this.gainNode.gain.setValueAtTime(0, endTime);

      // Frequency
      this.oscillator.frequency.setValueAtTime(800, startTime);
      this.oscillator.frequency.setValueAtTime(600, endTime - 0.1);
    }
  }

  static stop() {
    try {
      if (this.gainNode) {
        this.gainNode.gain.setValueAtTime(0, this.audioContext?.currentTime || 0);
      }
      if (this.oscillator) {
        this.oscillator.stop(this.audioContext?.currentTime || 0);
        this.oscillator = null;
      }
    } catch (error) {
      console.error('Error stopping alarm:', error);
    }
  }
}

export function parseCSV(csvText: string) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const entry: any = {};
    
    headers.forEach((header, index) => {
      const value = values[index];
      if (header === 'Predicted_Severity_Scale' || header === 'Population_Density' || 
          header === 'latitude' || header === 'longitude') {
        entry[header] = parseFloat(value);
      } else {
        entry[header] = value;
      }
    });
    
    return entry;
  });
}
