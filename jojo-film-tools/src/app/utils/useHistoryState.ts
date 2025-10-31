import { useState } from "react";

// Shared undo/redo state history hook
export const useHistoryState = (initialState: any) => {
  const [history, setHistory] = useState([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const setState = (action: any) => {
    const currentState = history[currentIndex];
    const newState =
      typeof action === "function" ? action(currentState) : action;

    if (JSON.stringify(currentState) === JSON.stringify(newState)) {
      return;
    }

    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newState);

    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (canUndo) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const redo = () => {
    if (canRedo) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const resetState = (newState: any) => {
    setHistory([newState]);
    setCurrentIndex(0);
  };

  return [
    history[currentIndex],
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    resetState,
  ] as const;
};
