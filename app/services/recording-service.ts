/**
 * Recording Service
 * Handles voice recording business logic
 */

export interface RecordingState {
  isRecording: boolean;
  isContinuousRecording: boolean;
  startTime: number | null;
  duration: number;
}

export class RecordingService {
  private static readonly CONTINUOUS_RECORDING_THRESHOLD = 10000; // 10 seconds

  /**
   * Starts a new recording session
   */
  static startRecording(): RecordingState {
    return {
      isRecording: true,
      isContinuousRecording: false,
      startTime: Date.now(),
      duration: 0,
    };
  }

  /**
   * Checks if recording should transition to continuous mode
   */
  static shouldEnableContinuousRecording(
    startTime: number | null
  ): boolean {
    if (!startTime) return false;
    const elapsed = Date.now() - startTime;
    return elapsed >= this.CONTINUOUS_RECORDING_THRESHOLD;
  }

  /**
   * Enables continuous recording mode
   */
  static enableContinuousRecording(state: RecordingState): RecordingState {
    return {
      ...state,
      isContinuousRecording: true,
    };
  }

  /**
   * Stops recording
   */
  static stopRecording(state: RecordingState): RecordingState {
    return {
      isRecording: false,
      isContinuousRecording: false,
      startTime: null,
      duration: 0,
    };
  }

  /**
   * Calculates recording duration
   */
  static getDuration(startTime: number | null): number {
    if (!startTime) return 0;
    return Math.floor((Date.now() - startTime) / 1000);
  }

  /**
   * Formats duration as MM:SS
   */
  static formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
}

