/**
 * useRecording Hook
 * Manages voice recording state and logic
 */

import { useState, useRef, useEffect, useCallback } from "react";
import {
  RecordingService,
  RecordingState,
} from "@/app/services/recording-service";

export function useRecording() {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isContinuousRecording: false,
    startTime: null,
    duration: 0,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Starts recording
   */
  const startRecording = useCallback(() => {
    const newState = RecordingService.startRecording();
    setState(newState);

    // Set timeout for continuous recording
    timeoutRef.current = setTimeout(() => {
      setState((prev) => RecordingService.enableContinuousRecording(prev));
    }, 10000); // 10 seconds
  }, []);

  /**
   * Stops recording
   */
  const stopRecording = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setState((prev) => RecordingService.stopRecording(prev));
  }, []);

  /**
   * Handles record start (with continuous mode check)
   */
  const handleRecordStart = useCallback(
    (e?: React.MouseEvent | React.TouchEvent) => {
      if (state.isContinuousRecording) {
        e?.preventDefault();
        stopRecording();
        return;
      }
      startRecording();
    },
    [state.isContinuousRecording, startRecording, stopRecording]
  );

  /**
   * Handles record end
   */
  const handleRecordEnd = useCallback(() => {
    if (!state.isContinuousRecording) {
      stopRecording();
    }
  }, [state.isContinuousRecording, stopRecording]);

  /**
   * Gets formatted duration
   */
  const getFormattedDuration = useCallback(() => {
    const duration = RecordingService.getDuration(state.startTime);
    return RecordingService.formatDuration(duration);
  }, [state.startTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isRecording: state.isRecording,
    isContinuousRecording: state.isContinuousRecording,
    handleRecordStart,
    handleRecordEnd,
    stopRecording,
    getFormattedDuration,
  };
}

