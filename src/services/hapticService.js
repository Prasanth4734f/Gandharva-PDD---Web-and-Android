import { Platform, Vibration } from 'react-native';

/**
 * hapticService.js
 * Universal Tactile Feedback Service for Gandharva AI Studio.
 * Provides micro-haptic pulses on touch across iOS, Android, and Web.
 */

class HapticService {
  /**
   * Light tactile pulse on piano keys, guitar strings, and chord taps
   */
  static light() {
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(8);
        }
      } else {
        Vibration.vibrate(10);
      }
    } catch (e) {}
  }

  /**
   * Medium impact pulse for button selections and mode toggles
   */
  static medium() {
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(18);
        }
      } else {
        Vibration.vibrate(20);
      }
    } catch (e) {}
  }

  /**
   * Heavy thump for bass drops and kick drum hits
   */
  static heavy() {
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(35);
        }
      } else {
        Vibration.vibrate(35);
      }
    } catch (e) {}
  }

  /**
   * Double celebratory pulse when audio generation finishes
   */
  static success() {
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([15, 40, 25]);
        }
      } else {
        Vibration.vibrate([0, 15, 40, 25]);
      }
    } catch (e) {}
  }
}

export default HapticService;
