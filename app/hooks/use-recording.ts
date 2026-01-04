/**
 * useRecording Hook
 * Manages voice recording state and logic with actual audio recording
 */

import { useState, useRef, useEffect, useCallback } from "react";
import {
  RecordingService,
  RecordingState,
} from "@/app/services/recording-service";

export interface RecordingResult {
  audioBlob: Blob;
  duration: number;
}

export function useRecording(onRecordingComplete?: (result: RecordingResult) => void) {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isContinuousRecording: false,
    startTime: null,
    duration: 0,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  /**
   * Starts actual audio recording
   */
  const startRecording = useCallback(async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Determine best MIME type
      const mimeTypes = [
        "audio/webm",
        "audio/webm;codecs=opus",
        "audio/mp4",
        "audio/ogg",
        "audio/wav",
      ];
      let selectedMimeType = "audio/webm";
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: selectedMimeType
        });
        const duration = RecordingService.getDuration(state.startTime);
        
        // Call callback with recording result
        if (onRecordingComplete && audioBlob.size > 0) {
          onRecordingComplete({ audioBlob, duration });
        }

        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        audioChunksRef.current = [];
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      
      const newState = RecordingService.startRecording();
      setState(newState);

      // Set timeout for continuous recording
      timeoutRef.current = setTimeout(() => {
        setState((prev) => RecordingService.enableContinuousRecording(prev));
      }, 10000); // 10 seconds
    } catch (error: any) {
      console.error("Error starting recording:", error);
      // Reset state on error
      setState((prev) => RecordingService.stopRecording(prev));
      throw error;
    }
  }, [state.startTime, onRecordingComplete]);

  /**
   * Stops recording
   */
  const stopRecording = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (mediaRecorderRef.current && state.isRecording) {
      if (mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    }

    setState((prev) => RecordingService.stopRecording(prev));
  }, [state.isRecording]);

  /**
   * Handles record start (with continuous mode check)
   */
  const handleRecordStart = useCallback(
    async (e?: React.MouseEvent | React.TouchEvent) => {
      if (state.isContinuousRecording) {
        e?.preventDefault();
        stopRecording();
        return;
      }
      try {
        await startRecording();
      } catch (error: any) {
        console.error("Failed to start recording:", error);
        // Handle permission denied or other errors
        if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
          throw new Error("Microphone permission denied");
        }
        throw error;
      }
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
      if (mediaRecorderRef.current && state.isRecording) {
        if (mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [state.isRecording]);

  return {
    isRecording: state.isRecording,
    isContinuousRecording: state.isContinuousRecording,
    handleRecordStart,
    handleRecordEnd,
    stopRecording,
    getFormattedDuration,
  };
}

