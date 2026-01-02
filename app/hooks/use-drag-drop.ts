/**
 * useDragDrop Hook
 * Manages drag and drop state and handlers
 */

import { useState, useCallback } from "react";
import {
  DragDropService,
  DragDropData,
} from "@/app/services/drag-drop-service";

export function useDragDrop(onDrop: (data: DragDropData) => void) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    DragDropService.handleDragOver(e);
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      DragDropService.handleDrop(e, (data) => {
        setIsDragOver(false);
        onDrop(data);
      });
    },
    [onDrop]
  );

  return {
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}

