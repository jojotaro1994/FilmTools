"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FileUp,
  Settings,
  Copy,
  X,
  Plus,
  Minus,
  Trash2,
  LayoutGrid,
  List,
  Crop,
  Upload,
  Download,
  RefreshCw,
  AlertTriangle,
  CornerDownLeft,
  ArrowRight,
  Music,
  PlayCircle,
  GripVertical,
  Edit2,
  Play,
  Square,
  Move,
  Undo,
  Redo,
  Camera,
} from "lucide-react";

// --- Custom Hook for State History (Undo/Redo) ---
const useHistoryState = (initialState) => {
  const [history, setHistory] = useState([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const setState = (action) => {
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

  const resetState = (newState) => {
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
  ];
};

// --- Initial Data & Helpers ---
const createInitialData = () => ({
  emotionColumns: [
    { key: "coolFactor", label: "Cool Factor", color: "#f87171" },
    { key: "tension", label: "Tension", color: "#22d3ee" },
    { key: "hypeFactor", label: "Hype Factor", color: "#facc15" },
    { key: "resonance", label: "Resonance", color: "#a78bfa" },
    { key: "boredom", label: "Boredom", color: "#9ca3af" },
  ],
  scriptData: [
    {
      id: "scene1-part1",
      level: 0,
      segment: "1. EXT. MOUNTAIN TOP - PRE-DAWN (2s)",
      image: null,
      music: "",
      musicTitle: "",
      musicDuration: 1,
      coolFactor: 3,
      tension: 1,
      hypeFactor: 2,
      resonance: 1,
      boredom: 0,
      shotSize: "WS",
      shotType: "EL",
    },
    {
      id: "scene1-part2",
      level: 1,
      segment:
        "A wide shot of the quiet mountain road. Suddenly, the roar of an AE86 engine shatters the silence, followed by the screech of tires.",
      image: null,
      music: "https://www.youtube.com/watch?v=ZQn3nIa3hAM",
      musicTitle: "Drift sound effect",
      musicDuration: 3,
      coolFactor: 7,
      tension: 2,
      hypeFactor: 7,
      resonance: 2,
      boredom: 0,
      shotSize: "LS",
      shotType: "EL",
    },
    {
      id: "scene1-part3",
      level: 0,
      segment: "2. MONTAGE: MOUNTAIN PASS DRIFTING (15s)",
      image: null,
      music: "",
      musicTitle: "",
      musicDuration: 1,
      coolFactor: 9,
      tension: 3,
      hypeFactor: 9,
      resonance: 3,
      boredom: 0,
      shotSize: "",
      shotType: "",
    },
    {
      id: "scene1-part4",
      level: 1,
      segment:
        "A flash of headlights as the AE86 exits a hairpin turn at high speed, the rear of the car inches from the guardrail.",
      image: null,
      music: "",
      musicTitle: "",
      musicDuration: 1,
      coolFactor: 10,
      tension: 2,
      hypeFactor: 10,
      resonance: 4,
      boredom: 0,
      shotSize: "MCU",
      shotType: "LA",
    },
    {
      id: "scene1-part5",
      level: 1,
      segment:
        "[CLOSE UP: A cup of water in the car's cup holder spins violently, but not a single drop spills.]",
      image: null,
      music: "",
      musicTitle: "",
      musicDuration: 1,
      coolFactor: 10,
      tension: 1,
      hypeFactor: 9,
      resonance: 6,
      boredom: 0,
      shotSize: "CU",
      shotType: "EL",
    },
  ],
});

const getRandomColor = () =>
  `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`;

const generateSegmentNumbers = (scriptData) => {
  const numbers = {};
  const counters = [0, 0, 0, 0, 0, 0];
  scriptData.forEach((row) => {
    const level = row.level || 0;
    counters[level]++;
    for (let i = level + 1; i < counters.length; i++) {
      counters[i] = 0;
    }
    numbers[row.id] = counters.slice(0, level + 1).join(".");
  });
  return numbers;
};

// --- Shot Definitions ---
const SHOT_SIZES = [
  { value: "ECU", label: "ECU: Extreme Close Up" },
  { value: "CU", label: "CU: Close Up" },
  { value: "MCU", label: "MCU: Medium Close Up" },
  { value: "MS", label: "MS: Medium Shot" },
  { value: "FS", label: "FS: Full Shot" },
  { value: "MLS", label: "MLS: Medium Long Shot" },
  { value: "LS", label: "LS: Long Shot" },
  { value: "WS", label: "WS: Wide Shot" },
  { value: "ELS", label: "ELS: Extreme Long Shot" },
  { value: "Two Shot", label: "Two Shot" },
  { value: "Single", label: "Single" },
  { value: "OTS", label: "OTS: Over The Shoulder" },
];

const SHOT_TYPES = [
  { value: "EL", label: "EL: Eye Level" },
  { value: "HA", label: "HA: High Angle" },
  { value: "LA", label: "LA: Low Angle" },
  { value: "POV", label: "POV: Point of View" },
  { value: "Top", label: "Bird's Eye View" },
  { value: "Dutch", label: "Dutch Angle" },
  { value: "Ground", label: "Ground Level" },
  { value: "ES", label: "ES: Establishing Shot" },
];

// --- Reusable Components ---
const EditableSegment = ({ value, onChange, placeholder = "..." }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value);
  const textareaRef = useRef(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();
      textareaRef.current?.select();
      autoResizeTextarea();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    onChange(text);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    autoResizeTextarea();
  };

  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleTextChange}
        onBlur={handleBlur}
        className="bg-gray-600 w-full rounded px-2 py-1.5 text-sm text-white placeholder-gray-400 resize-none overflow-hidden"
        placeholder={placeholder}
        rows={1}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer w-full hover:bg-gray-700/50 rounded px-2 py-1.5 min-h-[34px] whitespace-pre-wrap"
    >
      {value || <span className="text-gray-500">{placeholder}</span>}
    </div>
  );
};

const EditableMusic = ({ title, link, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const [tempLink, setTempLink] = useState(link);
  const popupRef = useRef(null);

  useEffect(() => {
    setTempTitle(title);
    setTempLink(link);
  }, [title, link]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target))
        setIsEditing(false);
    };
    if (isEditing) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing]);

  const handleSave = () => {
    onSave(tempTitle, tempLink);
    setIsEditing(false);
  };

  return (
    <div className="relative w-full">
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
        className="flex items-center space-x-2 w-full cursor-pointer p-1 rounded hover:bg-white/10"
      >
        <Music size={14} className="text-amber-400 flex-shrink-0" />
        <div className="flex-grow truncate">
          <span className="text-amber-400 text-sm font-medium">
            {title || "Untitled Music"}
          </span>
        </div>
      </div>
      {isEditing && (
        <div
          ref={popupRef}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-full mt-2 left-0 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl p-4 z-20"
        >
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Music Title
              </label>
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                placeholder="e.g., Drift sound effect"
                className="bg-gray-700 w-full rounded px-2 py-1.5 text-sm text-white placeholder-gray-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Music Link
              </label>
              <input
                type="text"
                value={tempLink}
                onChange={(e) => setTempLink(e.target.value)}
                placeholder="Paste YouTube or Bilibili link"
                className="bg-gray-700 w-full rounded px-2 py-1.5 text-sm text-white placeholder-gray-500"
              />
            </div>
            <button
              onClick={handleSave}
              className="w-full text-sm bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 rounded"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricGraph = ({ value, color, onValueChange }) => {
  const graphRef = useRef(null);
  const handleInteraction = useCallback(
    (e) => {
      if (!graphRef.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const { left, width } = graphRef.current.getBoundingClientRect();
      const newPercentage = Math.max(
        0,
        Math.min(100, ((clientX - left) / width) * 100)
      );
      onValueChange(Math.round(newPercentage / 10));
    },
    [onValueChange]
  );

  const percentage = value * 10;
  return (
    <div
      className="w-full h-10 flex items-center relative group cursor-pointer"
      ref={graphRef}
      onMouseDown={handleInteraction}
      onTouchStart={handleInteraction}
    >
      <div className="w-full h-0.5 bg-gray-600 relative">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-lg"
          style={{
            left: `calc(${percentage}% - 6px)`,
            backgroundColor: color,
            zIndex: 10,
          }}
        >
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Modals & Popups ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl p-6 relative w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start">
          <AlertTriangle
            className="text-red-500 mr-4 flex-shrink-0"
            size={24}
          />
          <div className="flex-grow">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <div className="text-gray-400 mt-2">{children}</div>
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium bg-gray-700 text-gray-200 hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
const ImageModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-lg shadow-xl p-4 relative max-w-4xl max-h-[90vh] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
          aria-label="Close image view"
        >
          <X size={24} />
        </button>
        <img
          src={imageUrl}
          alt="Full size view"
          className="w-full h-full object-contain rounded-md"
          style={{ maxHeight: "calc(90vh - 4rem)" }}
        />
      </div>
    </div>
  );
};

const MiniMusicPlayer = ({ embedUrl, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    if (embedUrl) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [embedUrl]);

  if (!embedUrl) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 w-full max-w-xs rounded-lg shadow-2xl bg-gray-800 border border-gray-700 z-50 transition-all duration-300 ease-in-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="p-2">
        <div className="aspect-video bg-black rounded">
          <iframe
            className="w-full h-full rounded"
            src={embedUrl}
            title="Embedded video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          ></iframe>
        </div>
      </div>
      <button
        onClick={onClose}
        className="absolute -top-2 -right-2 text-gray-200 bg-gray-900 rounded-full p-1 hover:text-white z-10"
        aria-label="Close music player"
      >
        <X size={16} />
      </button>
    </div>
  );
};

const MetricSettingsPopup = ({ metrics, onAddMetric, onDeleteMetric }) => {
  const [newMetricName, setNewMetricName] = useState("");
  const handleAdd = () => {
    if (newMetricName.trim()) {
      onAddMetric(newMetricName.trim());
      setNewMetricName("");
    }
  };
  return (
    <div className="absolute top-full mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-4 z-20">
      <div className="flex items-start mb-4">
        <Settings
          size={20}
          className="text-amber-400 mr-3 mt-1 flex-shrink-0"
        />
        <div>
          <h3 className="font-semibold text-white">Analysis Metrics</h3>
          <p className="text-xs text-gray-400">
            Add or remove metrics to track.
          </p>
        </div>
      </div>
      <div className="my-4 space-y-2">
        <div className="flex flex-wrap gap-2">
          {metrics.map((metric) => (
            <div
              key={metric.key}
              className="flex items-center bg-gray-700 rounded-full pl-3 pr-1 py-1 text-sm"
            >
              <span
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: metric.color }}
              ></span>
              <span className="text-gray-200">{metric.label}</span>
              <button
                onClick={() => onDeleteMetric(metric.key)}
                className="ml-2 text-gray-500 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={newMetricName}
          onChange={(e) => setNewMetricName(e.target.value)}
          placeholder="e.g., Memorability, Suspense"
          className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <button
          onClick={handleAdd}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-1.5 px-3 rounded-md flex items-center space-x-2 text-sm"
        >
          <Plus size={16} />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
};
const AspectRatioModal = ({ isOpen, onClose, currentRatio, onSetRatio }) => {
  if (!isOpen) return null;
  const ratios = [
    {
      key: "16/9",
      label: "Widescreen (16:9)",
      description: "Standard widescreen aspect ratio.",
    },
    { key: "1/1", label: "Square (1:1)", description: "Square aspect ratio." },
    {
      key: "9/16",
      label: "Vertical (9:16)",
      description: "Tall vertical aspect ratio.",
    },
  ];
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl p-6 relative w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start mb-4">
          <Crop size={24} className="text-amber-400 mr-3 mt-1" />
          <div>
            <h2 className="text-xl font-semibold text-white">Aspect Ratio</h2>
            <p className="text-gray-400 mt-1">
              Choose the aspect ratio for the image panels.
            </p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
        <div className="space-y-2">
          {ratios.map((ratio) => (
            <button
              key={ratio.key}
              onClick={() => {
                onSetRatio(ratio.key);
                onClose();
              }}
              className={`w-full text-left p-4 rounded-lg transition-colors ${
                currentRatio === ratio.key
                  ? "bg-amber-500/20 border border-amber-500"
                  : "bg-gray-700/50 hover:bg-gray-700"
              }`}
            >
              <p
                className={`font-semibold ${
                  currentRatio === ratio.key ? "text-amber-400" : "text-white"
                }`}
              >
                {ratio.label}
              </p>
              <p className="text-sm text-gray-400">{ratio.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
const SegmentDetailModal = ({ segment, onClose }) => {
  if (!segment) return null;
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="font-semibold text-white">Segment Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {segment.image && (
            <img
              src={segment.image}
              alt="Segment visual"
              className="w-full h-48 object-cover rounded-md mb-4"
            />
          )}
          <p className="text-gray-300">{segment.segment}</p>
        </div>
      </div>
    </div>
  );
};

const SelectionPopup = ({
  title,
  options,
  currentValue,
  onSelect,
  onClose,
}) => {
  const popupRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={popupRef}
      className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-80 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl p-4 z-20"
    >
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-white">{title}</h4>
        <button onClick={onClose} className="text-gray-500 hover:text-white">
          <X size={18} />
        </button>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${
              currentValue === option.value
                ? "bg-amber-500/20"
                : "hover:bg-gray-700"
            }`}
          >
            <input
              type="radio"
              name={title}
              value={option.value}
              checked={currentValue === option.value}
              onChange={() => {
                onSelect(option.value);
                onClose();
              }}
              className="w-4 h-4 text-amber-600 bg-gray-700 border-gray-600 focus:ring-amber-500"
            />
            <span className="ml-3 text-sm text-gray-300">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

// --- View Components ---

const MusicBlock = ({
  item,
  onScriptChange,
  onPlayMusic,
  totalRows,
  rowIndex,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const startY = useRef(0);
  const startDuration = useRef(1);

  const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    startY.current = e.clientY;
    startDuration.current = item.musicDuration || 1;
    document.body.style.cursor = "ns-resize";
    document.addEventListener("mousemove", handleResizeMouseMove);
    document.addEventListener("mouseup", handleResizeMouseUp);
  };

  const handleResizeMouseMove = useCallback(
    (e) => {
      const rowHeight = 88;
      const deltaY = e.clientY - startY.current;
      const newRows = Math.round(deltaY / rowHeight);
      let newDuration = startDuration.current + newRows;

      newDuration = Math.max(1, newDuration);
      newDuration = Math.min(newDuration, totalRows - rowIndex);

      if (newDuration !== item.musicDuration) {
        onScriptChange(item.id, "musicDuration", newDuration);
      }
    },
    [item.id, item.musicDuration, totalRows, rowIndex, onScriptChange]
  );

  const handleResizeMouseUp = () => {
    setIsResizing(false);
    document.body.style.cursor = "";
    document.removeEventListener("mousemove", handleResizeMouseMove);
    document.removeEventListener("mouseup", handleResizeMouseUp);
  };

  const adjustDuration = (amount) => {
    let newDuration = (item.musicDuration || 1) + amount;
    newDuration = Math.max(1, newDuration);
    newDuration = Math.min(newDuration, totalRows - rowIndex);
    onScriptChange(item.id, "musicDuration", newDuration);
  };

  const blockStyle = {
    height: `${(item.musicDuration || 1) * 5.5 - 0.5}rem`,
  };

  return (
    <div
      style={blockStyle}
      className={`relative rounded-lg flex flex-col justify-between border-l-4 border-amber-500 group transition-all duration-150 cursor-move
                ${
                  isResizing
                    ? "shadow-2xl border-amber-300 bg-gray-600"
                    : "bg-gray-700/50"
                }
            `}
      draggable="true"
      onDragStart={(e) => {
        if (
          e.target.closest("[data-resize-handle]") ||
          e.target.closest("button")
        ) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.setData("text/plain", item.id);
        e.dataTransfer.effectAllowed = "move";
      }}
    >
      <div className="p-3 flex-grow flex flex-col justify-start min-h-0">
        <EditableMusic
          title={item.musicTitle}
          link={item.music}
          onSave={(newTitle, newLink) => {
            onScriptChange(item.id, "musicTitle", newTitle);
            onScriptChange(item.id, "music", newLink);
          }}
        />
      </div>
      <div
        data-resize-handle
        className="absolute bottom-0 left-0 w-full h-8 flex items-center justify-between px-2 bg-black/20 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={handleResizeMouseDown}
      >
        <div className="flex items-center space-x-1 text-gray-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              adjustDuration(-1);
            }}
            className="p-1 rounded-full hover:bg-white/20 hover:text-white disabled:opacity-50"
            disabled={item.musicDuration <= 1}
            title="Decrease duration"
          >
            <Minus size={14} />
          </button>
          <GripVertical size={16} className="cursor-ns-resize" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              adjustDuration(1);
            }}
            className="p-1 rounded-full hover:bg-white/20 hover:text-white disabled:opacity-50"
            disabled={rowIndex + item.musicDuration >= totalRows}
            title="Increase duration"
          >
            <Plus size={14} />
          </button>
        </div>
        <span className="text-xs text-gray-400">
          Duration: {item.musicDuration || 1}
        </span>
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayMusic(item.music);
            }}
            className="p-1 text-gray-300 rounded-full hover:bg-white/20 hover:text-white"
            title="Play music"
          >
            <PlayCircle size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onScriptChange(item.id, "music", "");
            }}
            className="p-1 text-gray-400 rounded-full hover:bg-red-500 hover:text-white"
            title="Delete music"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const TableView = ({
  scriptData,
  emotionColumns,
  showOverlay,
  onScriptChange,
  onMetricChange,
  onUploadClick,
  onImageClick,
  onPlayMusic,
  onMoveMusic,
}) => {
  const tableRef = useRef(null);
  const segmentNumbers = generateSegmentNumbers(scriptData);
  let musicBlockSkipCounter = 0;
  const [dragOverId, setDragOverId] = useState(null);

  const FullOverlayGraph = () => {
    const [points, setPoints] = useState({});

    useEffect(() => {
      if (!tableRef.current || !showOverlay) return;

      const newPoints = {};
      emotionColumns.forEach((col) => (newPoints[col.key] = []));
      const rows = tableRef.current.querySelectorAll("tbody tr");

      rows.forEach((rowEl) => {
        const rowId = rowEl.dataset.id;
        const rowData = scriptData.find((d) => d.id === rowId);
        if (!rowData) return;

        emotionColumns.forEach((col) => {
          const cell = rowEl.querySelector(`td[data-key="${col.key}"]`);

          if (cell) {
            const value = rowData[col.key] || 0;
            const y = rowEl.offsetTop + rowEl.offsetHeight / 2;
            const cellWidth = cell.offsetWidth || 150;
            const x = cell.offsetLeft + cellWidth * (value / 10);
            newPoints[col.key].push({ x, y });
          }
        });
      });
      setPoints(newPoints);
    }, [scriptData, emotionColumns, showOverlay]);

    return (
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
        {emotionColumns.map((col) => (
          <g key={`overlay-group-${col.key}`}>
            <polyline
              points={(points[col.key] || [])
                .map((p) => `${p.x},${p.y}`)
                .join(" ")}
              fill="none"
              stroke={col.color}
              strokeWidth="2"
            />
            {(points[col.key] || []).map((p, i) => (
              <circle
                key={`overlay-point-${col.key}-${i}`}
                cx={p.x}
                cy={p.y}
                r="4"
                fill={col.color}
              />
            ))}
          </g>
        ))}
      </svg>
    );
  };

  const handleDragOver = (e, row) => {
    if (!row.music) {
      e.preventDefault();
      setDragOverId(row.id);
    }
  };

  const handleDrop = (e, row) => {
    e.preventDefault();
    if (!row.music) {
      const sourceId = e.dataTransfer.getData("text/plain");
      const targetId = row.id;
      if (sourceId && targetId && sourceId !== targetId) {
        onMoveMusic(sourceId, targetId);
      }
    }
    setDragOverId(null);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const renderRow = (row, index) => {
    const isDropTarget = dragOverId === row.id;
    return (
      <tr
        key={row.id}
        data-id={row.id}
        className={`group hover:bg-gray-700/50 transition-colors ${
          isDropTarget ? "bg-amber-900/50" : ""
        }`}
        onDragOver={(e) => handleDragOver(e, row)}
        onDrop={(e) => handleDrop(e, row)}
        onDragLeave={handleDragLeave}
      >
        <td className="px-6 py-4 text-gray-300 h-22">
          <div className="flex items-center">
            <span
              className="font-mono text-gray-500 mr-4 flex-shrink-0"
              style={{ paddingLeft: `${row.level * 1.5}rem` }}
            >
              {segmentNumbers[row.id]}
            </span>
            <div className="flex-grow min-w-0">
              <EditableSegment
                value={row.segment}
                onChange={(newText) =>
                  onScriptChange(row.id, "segment", newText)
                }
                placeholder="Enter script segment..."
              />
            </div>
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4 flex-shrink-0">
              <button
                onClick={() => onScriptChange(row.id, "add")}
                className="p-1 hover:bg-gray-600 rounded"
                title="Add new row below"
              >
                <Plus size={16} />
              </button>
              <button
                disabled={index === 0}
                onClick={() => onScriptChange(row.id, "indent")}
                className="p-1 hover:bg-gray-600 rounded disabled:opacity-20 disabled:cursor-not-allowed"
                title="Increase indent"
              >
                <ArrowRight size={16} />
              </button>
              <button
                disabled={row.level === 0}
                onClick={() => onScriptChange(row.id, "outdent")}
                className="p-1 hover:bg-gray-600 rounded disabled:opacity-20 disabled:cursor-not-allowed"
                title="Decrease indent"
              >
                <CornerDownLeft size={16} />
              </button>
              <button
                onClick={() => onScriptChange(row.id, "delete")}
                className="p-1 hover:bg-gray-600 rounded text-red-400"
                title="Delete this row"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="w-20 h-16 relative group/image">
            {row.image ? (
              <>
                <img
                  src={row.image}
                  alt="Thumbnail"
                  className="w-full h-full object-cover rounded-md cursor-pointer"
                  onClick={() => onImageClick(row.image)}
                />
                <button
                  onClick={() => onScriptChange(row.id, "image", null)}
                  className="absolute -top-1.5 -right-1.5 p-0.5 bg-gray-900/80 rounded-full text-white hover:bg-red-600 transition-colors opacity-0 group-hover/image:opacity-100"
                  title="Delete image"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <button
                onClick={() => onUploadClick(row.id)}
                className="w-full h-full border-2 border-dashed border-gray-600 rounded-md flex flex-col items-center justify-center text-gray-500 hover:bg-gray-700 hover:text-gray-400"
              >
                <FileUp size={20} />
                <span className="text-xs mt-1">Upload</span>
              </button>
            )}
          </div>
        </td>
        <td
          className="px-6 py-4"
          rowSpan={row.music ? row.musicDuration || 1 : 1}
        >
          {row.music ? (
            <MusicBlock
              item={row}
              onScriptChange={onScriptChange}
              onPlayMusic={onPlayMusic}
              totalRows={scriptData.length}
              rowIndex={index}
            />
          ) : (
            <button
              onClick={() => onScriptChange(row.id, "music", "https://")}
              className="w-full h-full text-center text-gray-500 hover:text-amber-400 transition-colors flex flex-col items-center justify-center"
            >
              <Music size={16} className="mb-1" />
              <span className="text-xs">Add Music</span>
            </button>
          )}
        </td>
        {emotionColumns.map((col) => (
          <td key={col.key} data-key={col.key} className="px-6 py-4">
            <div
              className={
                showOverlay ? "opacity-0" : "opacity-100 transition-opacity"
              }
            >
              <MetricGraph
                value={row[col.key] || 0}
                color={col.color}
                onValueChange={(newValue) =>
                  onMetricChange(row.id, col.key, newValue)
                }
              />
            </div>
          </td>
        ))}
      </tr>
    );
  };

  const renderSkippedRow = (row, index) => {
    const isDropTarget = dragOverId === row.id;
    return (
      <tr
        key={row.id}
        data-id={row.id}
        className={`group hover:bg-gray-700/50 transition-colors ${
          isDropTarget ? "bg-amber-900/50" : ""
        }`}
        onDragOver={(e) => handleDragOver(e, row)}
        onDrop={(e) => handleDrop(e, row)}
        onDragLeave={handleDragLeave}
      >
        <td className="px-6 py-4 text-gray-300 h-22">
          <div className="flex items-center">
            <span
              className="font-mono text-gray-500 mr-4 flex-shrink-0"
              style={{ paddingLeft: `${row.level * 1.5}rem` }}
            >
              {segmentNumbers[row.id]}
            </span>
            <div className="flex-grow min-w-0">
              <EditableSegment
                value={row.segment}
                onChange={(newText) =>
                  onScriptChange(row.id, "segment", newText)
                }
                placeholder="Enter script segment..."
              />
            </div>
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4 flex-shrink-0">
              <button
                onClick={() => onScriptChange(row.id, "add")}
                className="p-1 hover:bg-gray-600 rounded"
                title="Add new row below"
              >
                <Plus size={16} />
              </button>
              <button
                disabled={index === 0}
                onClick={() => onScriptChange(row.id, "indent")}
                className="p-1 hover:bg-gray-600 rounded disabled:opacity-20 disabled:cursor-not-allowed"
                title="Increase indent"
              >
                <ArrowRight size={16} />
              </button>
              <button
                disabled={row.level === 0}
                onClick={() => onScriptChange(row.id, "outdent")}
                className="p-1 hover:bg-gray-600 rounded disabled:opacity-20 disabled:cursor-not-allowed"
                title="Decrease indent"
              >
                <CornerDownLeft size={16} />
              </button>
              <button
                onClick={() => onScriptChange(row.id, "delete")}
                className="p-1 hover:bg-gray-600 rounded text-red-400"
                title="Delete this row"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="w-20 h-16 relative group/image">
            {row.image ? (
              <>
                <img
                  src={row.image}
                  alt="Thumbnail"
                  className="w-full h-full object-cover rounded-md cursor-pointer"
                  onClick={() => onImageClick(row.image)}
                />
                <button
                  onClick={() => onScriptChange(row.id, "image", null)}
                  className="absolute -top-1.5 -right-1.5 p-0.5 bg-gray-900/80 rounded-full text-white hover:bg-red-600 transition-colors opacity-0 group-hover/image:opacity-100"
                  title="Delete image"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <button
                onClick={() => onUploadClick(row.id)}
                className="w-full h-full border-2 border-dashed border-gray-600 rounded-md flex flex-col items-center justify-center text-gray-500 hover:bg-gray-700 hover:text-gray-400"
              >
                <FileUp size={20} />
                <span className="text-xs mt-1">Upload</span>
              </button>
            )}
          </div>
        </td>
        {emotionColumns.map((col) => (
          <td key={col.key} data-key={col.key} className="px-6 py-4">
            <div
              className={
                showOverlay ? "opacity-0" : "opacity-100 transition-opacity"
              }
            >
              <MetricGraph
                value={row[col.key] || 0}
                color={col.color}
                onValueChange={(newValue) =>
                  onMetricChange(row.id, col.key, newValue)
                }
              />
            </div>
          </td>
        ))}
      </tr>
    );
  };

  return (
    <div className="relative">
      {showOverlay && <FullOverlayGraph />}
      <div className="overflow-x-auto" ref={tableRef}>
        <table className="w-full text-sm text-left table-fixed">
          <thead className="bg-gray-800 border-b border-gray-700">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-300 w-2/5">
                Script Segment
              </th>
              <th className="px-6 py-3 font-medium text-gray-300 w-24">
                Image
              </th>
              <th className="px-6 py-3 font-medium text-gray-300 w-48">
                Music
              </th>
              {emotionColumns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-3 font-medium text-gray-300"
                >
                  {col.label} <span className="text-gray-500">(0-10)</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {scriptData.map((row, index) => {
              if (musicBlockSkipCounter > 0) {
                musicBlockSkipCounter--;
                return renderSkippedRow(row, index);
              }

              if (row.music) {
                musicBlockSkipCounter = (row.musicDuration || 1) - 1;
              }

              return renderRow(row, index);
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StoryboardView = ({
  scriptData,
  onScriptChange,
  onUploadClick,
  onImageClick,
  onPlayMusic,
}) => {
  const [layout, setLayout] = useState("grid");
  const [aspectRatio, setAspectRatio] = useState("16/9");
  const [isRatioModalOpen, setIsRatioModalOpen] = useState(false);
  const aspectStyle = { aspectRatio };

  const musicSequences = [];
  let currentSequence = [];
  scriptData.forEach((item, index) => {
    if (item.music) {
      if (currentSequence.length > 0) musicSequences.push(currentSequence);
      currentSequence = [index];
      for (let i = 1; i < (item.musicDuration || 1); i++) {
        if (index + i < scriptData.length) {
          currentSequence.push(index + i);
        }
      }
    }
  });
  if (currentSequence.length > 0) musicSequences.push(currentSequence);

  const getMusicStatus = (index) => {
    for (const seq of musicSequences) {
      if (seq.includes(index)) {
        if (seq[0] === index) return "start";
        if (seq[seq.length - 1] === index) return "end";
        return "middle";
      }
    }
    return "none";
  };

  const StoryboardItem = ({ item, index, viewType = "grid" }) => {
    const musicStatus = getMusicStatus(index);
    const musicSequenceInfo = musicSequences.find((seq) => seq.includes(index));
    const musicItem = musicSequenceInfo
      ? scriptData[musicSequenceInfo[0]]
      : null;
    const [activePopup, setActivePopup] = useState(null);

    const musicGlowClass =
      musicStatus !== "none"
        ? "ring-2 ring-amber-500/70 shadow-lg shadow-amber-500/20"
        : "";
    const containerClasses =
      viewType === "grid" ? "flex flex-col" : "flex items-stretch";
    const imageContainerClasses =
      viewType === "grid" ? "rounded-t-lg" : "w-1/3 flex-shrink-0 rounded-l-lg";
    const contentContainerClasses =
      viewType === "grid"
        ? "p-4 flex-grow flex flex-col justify-between"
        : "p-4 text-sm text-gray-300 flex-grow flex flex-col justify-between";

    return (
      <div
        className={`bg-gray-800 rounded-lg group relative transition-all duration-300 ${musicGlowClass} ${containerClasses}`}
      >
        {musicStatus !== "none" && (
          <div className="absolute top-2 left-2 bg-black/50 rounded-full p-1 text-amber-400 z-10">
            {musicStatus === "start" && <Play size={14} />}
            {musicStatus === "end" && <Square size={14} />}
            {musicStatus === "middle" && <Music size={14} />}
          </div>
        )}

        <div
          className={`bg-gray-900/50 flex items-center justify-center relative group/image ${imageContainerClasses}`}
          style={aspectStyle}
        >
          {item.image ? (
            <>
              <img
                src={item.image}
                alt={`Storyboard for ${item.segment}`}
                className={`w-full h-full object-cover ${
                  viewType === "grid" ? "rounded-t-lg" : "rounded-l-lg"
                }`}
                onClick={() => onImageClick(item.image)}
              />
              <button
                onClick={() => onScriptChange(item.id, "image", null)}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 bg-black/60 backdrop-blur-sm rounded-full text-white hover:text-red-400 hover:bg-black/80 transition-all duration-200 opacity-0 group-hover/image:opacity-100 scale-90 group-hover/image:scale-100"
                title="Delete Image"
              >
                <Trash2 size={24} />
              </button>
            </>
          ) : (
            <button
              onClick={() => onUploadClick(item.id)}
              className={`w-full h-full text-gray-500 flex flex-col items-center justify-center ${
                viewType === "grid" ? "rounded-t-lg" : "rounded-l-lg"
              }`}
            >
              <FileUp size={32} />
              <p className="text-sm mt-2">Click to Upload</p>
            </button>
          )}
        </div>

        <div className={contentContainerClasses}>
          <div className="text-sm text-gray-300 mb-3">
            <EditableSegment
              value={item.segment}
              onChange={(newText) =>
                onScriptChange(item.id, "segment", newText)
              }
              placeholder="Enter script segment..."
            />
          </div>

          <div className="relative grid grid-cols-2 gap-2 border-t border-gray-700 pt-3 mb-3">
            <div className="relative">
              <button
                onClick={() => setActivePopup("size")}
                className="w-full text-left p-2 rounded-md bg-gray-700/50 hover:bg-gray-700"
              >
                <span className="text-xs text-gray-400">Shot Size</span>
                <p className="text-sm font-semibold truncate">
                  {item.shotSize || "Not Set"}
                </p>
              </button>
              {activePopup === "size" && (
                <SelectionPopup
                  title="Select Shot Size"
                  options={SHOT_SIZES}
                  currentValue={item.shotSize}
                  onSelect={(value) =>
                    onScriptChange(item.id, "shotSize", value)
                  }
                  onClose={() => setActivePopup(null)}
                />
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setActivePopup("type")}
                className="w-full text-left p-2 rounded-md bg-gray-700/50 hover:bg-gray-700"
              >
                <span className="text-xs text-gray-400">Shot Type</span>
                <p className="text-sm font-semibold truncate">
                  {item.shotType || "Not Set"}
                </p>
              </button>
              {activePopup === "type" && (
                <SelectionPopup
                  title="Select Shot Type"
                  options={SHOT_TYPES}
                  currentValue={item.shotType}
                  onSelect={(value) =>
                    onScriptChange(item.id, "shotType", value)
                  }
                  onClose={() => setActivePopup(null)}
                />
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 border-t border-gray-700 pt-3">
            {musicItem ? (
              <>
                <div className="flex-grow min-w-0">
                  <EditableMusic
                    title={musicItem.musicTitle}
                    link={musicItem.music}
                    onSave={(newTitle, newLink) => {
                      onScriptChange(musicItem.id, "musicTitle", newTitle);
                      onScriptChange(musicItem.id, "music", newLink);
                    }}
                  />
                </div>
                <button
                  onClick={() => onScriptChange(musicItem.id, "music", "")}
                  className="text-gray-400 hover:text-red-400 flex-shrink-0"
                  title="Delete music"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={() => onPlayMusic(musicItem.music)}
                  className="text-gray-400 hover:text-amber-400 flex-shrink-0"
                  title="Play music"
                >
                  <PlayCircle size={18} />
                </button>
              </>
            ) : (
              <button
                onClick={() => onScriptChange(item.id, "music", "https://")}
                className="w-full text-left text-gray-500 hover:text-amber-400 transition-colors text-sm flex items-center space-x-2"
              >
                <Music size={14} />
                <span>Add Music</span>
              </button>
            )}
          </div>
        </div>

        <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onScriptChange(item.id, "delete")}
            className="p-1 bg-gray-900/50 hover:bg-gray-900 rounded-full text-red-400"
            title="Delete panel"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  };

  const handleAddPanel = () => {
    const lastId =
      scriptData.length > 0 ? scriptData[scriptData.length - 1].id : null;
    onScriptChange(lastId, "add");
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">Storyboard View</h2>
        <p className="text-gray-400 mt-1">
          Visually plan your shots and script. Choose your preferred layout and
          aspect ratio below.
        </p>
      </div>
      <div className="p-4 flex items-center justify-between bg-gray-800/50 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => setLayout("grid")}
              className={`px-3 py-1.5 text-sm rounded-md flex items-center space-x-2 ${
                layout === "grid"
                  ? "bg-gray-600 text-white"
                  : "text-gray-400 hover:bg-gray-600/50"
              }`}
            >
              <LayoutGrid size={16} />
              <span>Grid View</span>
            </button>
            <button
              onClick={() => setLayout("panel")}
              className={`px-3 py-1.5 text-sm rounded-md flex items-center space-x-2 ${
                layout === "panel"
                  ? "bg-gray-600 text-white"
                  : "text-gray-400 hover:bg-gray-600/50"
              }`}
            >
              <List size={16} />
              <span>List View</span>
            </button>
          </div>
          <button
            onClick={() => setIsRatioModalOpen(true)}
            className="px-3 py-1.5 text-sm rounded-lg flex items-center space-x-2 bg-gray-700 text-gray-300 hover:bg-gray-600/50"
          >
            <Crop size={16} />
            <span>Aspect Ratio</span>
          </button>
        </div>
        <button
          onClick={handleAddPanel}
          className="px-3 py-1.5 text-sm rounded-lg flex items-center space-x-2 bg-amber-600 text-white hover:bg-amber-700"
        >
          <Plus size={16} />
          <span>Add Panel</span>
        </button>
      </div>
      <div className="p-6">
        {layout === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {scriptData.map((item, index) => (
              <StoryboardItem
                key={item.id}
                item={item}
                index={index}
                viewType="grid"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {scriptData.map((item, index) => (
              <StoryboardItem
                key={item.id}
                item={item}
                index={index}
                viewType="panel"
              />
            ))}
          </div>
        )}
      </div>
      <AspectRatioModal
        isOpen={isRatioModalOpen}
        onClose={() => setIsRatioModalOpen(false)}
        currentRatio={aspectRatio}
        onSetRatio={setAspectRatio}
      />
    </div>
  );
};

const MetricTimelineChart = ({ data, columns, onSegmentClick }) => {
  const padding = { top: 20, right: 20, bottom: 60, left: 40 },
    width = 800,
    height = 400;
  const chartWidth = width - padding.left - padding.right,
    chartHeight = height - padding.top - padding.bottom;
  if (!data || data.length < 2)
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg mt-8 p-6 text-center text-gray-400">
        Add at least two script segments to see the timeline.
      </div>
    );
  const segmentNumbers = generateSegmentNumbers(data);
  const xScale = (i) => padding.left + (i / (data.length - 1)) * chartWidth,
    yScale = (v) => padding.top + chartHeight - (v / 10) * chartHeight;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg mt-8 relative">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-white">Metric Timeline</h2>
        <p className="text-gray-400 mt-1">
          A visualization of how metrics change over time.
        </p>
      </div>
      <div className="p-6">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          <g className="text-gray-500 text-xs">
            {[0, 2, 4, 6, 8, 10].map((v) => (
              <g key={`y-${v}`}>
                <line
                  x1={padding.left}
                  y1={yScale(v)}
                  x2={width - padding.right}
                  y2={yScale(v)}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  strokeDasharray="2,2"
                />
                <text
                  x={padding.left - 8}
                  y={yScale(v)}
                  dy="0.32em"
                  textAnchor="end"
                >
                  {v}
                </text>
              </g>
            ))}
            <text
              transform={`translate(${padding.left - 30}, ${
                padding.top + chartHeight / 2
              }) rotate(-90)`}
              textAnchor="middle"
              className="fill-current text-gray-400 text-sm"
            >
              Intensity
            </text>
          </g>
          <g className="text-gray-500 text-xs">
            <line
              x1={padding.left}
              y1={yScale(0)}
              x2={width - padding.right}
              y2={yScale(0)}
              stroke="currentColor"
              strokeWidth="0.5"
            />
            {data.map((d, i) => (
              <text
                key={`x-${i}`}
                x={xScale(i)}
                y={height - padding.bottom + 20}
                textAnchor="middle"
                onClick={() => onSegmentClick(d)}
                className="cursor-pointer hover:fill-white transition-colors"
              >
                {segmentNumbers[d.id]}
              </text>
            ))}
            <text
              x={padding.left + chartWidth / 2}
              y={height - 5}
              textAnchor="middle"
              className="fill-current text-gray-400 text-sm"
            >
              Script Segment
            </text>
          </g>
          {columns.map((c) => (
            <polyline
              key={`l-${c.key}`}
              fill="none"
              stroke={c.color}
              strokeWidth="2"
              points={data
                .map((d, i) => `${xScale(i)},${yScale(d[c.key] || 0)}`)
                .join(" ")}
            />
          ))}
          {columns.map((c) => (
            <g key={`p-${c.key}`}>
              {data.map((d, i) => (
                <circle
                  key={`p-${c.key}-${i}`}
                  cx={xScale(i)}
                  cy={yScale(d[c.key] || 0)}
                  r="4"
                  fill={c.color}
                >
                  <title>{`${c.label}: ${d[c.key] || 0}`}</title>
                </circle>
              ))}
            </g>
          ))}
        </svg>
        <div className="flex justify-center items-center space-x-6 mt-4 flex-wrap">
          {columns.map((c) => (
            <div
              key={`lg-${c.key}`}
              className="flex items-center space-x-2 text-sm mb-2"
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: c.color }}
              ></span>
              <span className="text-gray-300">{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const WorkflowView = () => {
  const workflowStyles = `
        .stage-container { display: flex; flex-direction: column; gap: 1.5rem; }
        .stage { background-color: #2a2a2e; border-radius: 12px; padding: 1.5rem; border: 1px solid #444; box-shadow: 0 4px 6px rgba(0,0,0,0.2); }
        .stage-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; }
        .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
        .card { background-color: #38383d; border-radius: 8px; padding: 1rem; border-left: 4px solid; }
        .card-title { font-weight: 500; font-size: 1rem; color: #ffffff; margin-bottom: 0.25rem; }
        .card-description { font-size: 0.875rem; color: #b0b0b0; }
        .arrow { text-align: center; font-size: 2.5rem; color: #666; margin: 0.5rem 0; }
        .icon { width: 28px; height: 28px; }
        .loop-icon { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    `;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
      <style>{workflowStyles}</style>
      <div className="p-6">
        <header className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Personal Animation Workflow
          </h1>
          <p className="text-lg text-gray-400 mt-2">
            A flexible, iterative visual guide for solo creators.
          </p>
        </header>
        <div className="stage-container">
          <div className="stage">
            <h2 className="stage-title" style={{ color: "#3b82f6" }}>
              <svg
                className="icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6.375a.625.625 0 0 1 .625.625v3.75a.625.625 0 0 1-.625.625H9v-5Zm0 6.25h6.375a.625.625 0 0 1 .625.625v3.75a.625.625 0 0 1-.625.625H9v-5Z"
                />
              </svg>
              0. Project Foundation
            </h2>
            <div className="card-grid">
              <div className="card" style={{ borderColor: "#3b82f6" }}>
                <h3 className="card-title">Project Initialization</h3>
                <p className="card-description">
                  Set up a clear folder structure and version control.
                </p>
              </div>
              <div className="card" style={{ borderColor: "#3b82f6" }}>
                <h3 className="card-title">Task System Setup</h3>
                <p className="card-description">
                  Set up a board in Jira/Trello, define tags.
                </p>
              </div>
            </div>
          </div>
          <div className="arrow">↓</div>
          <div className="stage">
            <h2 className="stage-title" style={{ color: "#10b981" }}>
              <svg
                className="icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a7.5 7.5 0 0 1-7.5 0c-1.421-.455-2.5-1.683-2.75-3.182S4.5 14.19 4.5 13.5v-1.5c0-.69.055-1.379.168-2.042M12 18V10.5m0 7.5H8.25m3.75 0H15.75m-7.5 0H5.625m7.5 0H18.375m-7.5 0h.008v.015h-.008V18Zm-7.5 0h.008v.015h-.008V18Zm7.5 0h.008v.015h-.008V18Zm7.5 0h.008v.015h-.008V18Z"
                />
              </svg>
              1. Pre-Production
            </h2>
            <div className="card-grid">
              <div className="card" style={{ borderColor: "#10b981" }}>
                <h3 className="card-title">Core Concept & Script</h3>
                <p className="card-description">
                  Define the core story and text.
                </p>
              </div>
              <div className="card" style={{ borderColor: "#10b981" }}>
                <h3 className="card-title">Script Analysis & Metrics</h3>
                <p className="card-description">
                  Use the metric table to define the viral potential of each
                  scene.
                </p>
              </div>
              <div className="card" style={{ borderColor: "#10b981" }}>
                <h3 className="card-title">Visual References & Moodboard</h3>
                <p className="card-description">
                  Gather images, colors, and lighting references to establish
                  the mood.
                </p>
              </div>
              <div className="card" style={{ borderColor: "#10b981" }}>
                <h3 className="card-title">Music & Sound Exploration</h3>
                <p className="card-description">
                  Collect reference music and sound effects to set the project's
                  auditory tone.
                </p>
              </div>
              <div className="card" style={{ borderColor: "#10b981" }}>
                <h3 className="card-title">Storyboard & Animatic</h3>
                <p className="card-description">
                  Sketch out shots to define composition, pacing, and meaning.
                </p>
              </div>
              <div className="card" style={{ borderColor: "#10b981" }}>
                <h3 className="card-title">Asset List & R&D</h3>
                <p className="card-description">
                  Break down required 3D assets and test key visual effects.
                </p>
              </div>
            </div>
          </div>
          <div className="arrow">↓</div>
          <div className="stage">
            <h2 className="stage-title" style={{ color: "#f97316" }}>
              <svg
                className="icon loop-icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.691v4.992h-4.992m0 0-3.181-3.183a8.25 8.25 0 0 1 11.667 0l3.181 3.183"
                />
              </svg>
              2. Production (Iterative per Shot)
            </h2>
            <div className="card-grid">
              <div className="card" style={{ borderColor: "#f97316" }}>
                <h3 className="card-title">Asset Acquisition & Integration</h3>
                <p className="card-description">
                  Get assets from online libraries (Fab, Sketchfab) or create
                  them.
                </p>
              </div>
              <div className="card" style={{ borderColor: "#f97316" }}>
                <h3 className="card-title">Final Music & Sound</h3>
                <p className="card-description">
                  Based on the animatic, select and finalize the music for the
                  current shot.
                </p>
              </div>
              <div className="card" style={{ borderColor: "#f97316" }}>
                <h3 className="card-title">Layout & Blocking</h3>
                <p className="card-description">
                  Construct the scene and set up camera positions.
                </p>
              </div>
              <div className="card" style={{ borderColor: "#f97316" }}>
                <h3 className="card-title">Lighting & Color Draft</h3>
                <p className="card-description">
                  Create a color palette and set up key and mood lighting based
                  on references.
                </p>
              </div>
              <div className="card" style={{ borderColor: "#f97316" }}>
                <h3 className="card-title">Animation</h3>
                <p className="card-description">
                  Create movement for characters, objects, and the camera.
                </p>
              </div>
              <div className="card" style={{ borderColor: "#f97316" }}>
                <h3 className="card-title">Visual Effects (VFX)</h3>
                <p className="card-description">
                  Create or integrate necessary visual effects.
                </p>
              </div>
              <div className="card" style={{ borderColor: "#f97316" }}>
                <h3 className="card-title">Rendering</h3>
                <p className="card-description">
                  Output image sequences or video clips.
                </p>
              </div>
            </div>
          </div>
          <div className="arrow">↓</div>
          <div className="stage">
            <h2 className="stage-title" style={{ color: "#ec4899" }}>
              <svg
                className="icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
                />
              </svg>
              3. Post-Production
            </h2>
            <div className="card-grid">
              <div className="card" style={{ borderColor: "#ec4899" }}>
                <h3 className="card-title">Editing</h3>
                <p className="card-description">Assemble the rendered shots.</p>
              </div>
              <div className="card" style={{ borderColor: "#ec4899" }}>
                <h3 className="card-title">Color Grading</h3>
                <p className="card-description">
                  Unify the color tone, enhance mood and style.
                </p>
              </div>
              <div className="card" style={{ borderColor: "#ec4899" }}>
                <h3 className="card-title">Sound Design & Mixing</h3>
                <p className="card-description">
                  Add ambient sounds, foley, and mix the audio tracks.
                </p>
              </div>
              <div className="card" style={{ borderColor: "#ec4899" }}>
                <h3 className="card-title">Final Touches & Export</h3>
                <p className="card-description">
                  Make final tweaks and export the final video.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Application Component ---
export default function App() {
  const [appData, setAppData, undo, redo, canUndo, canRedo, resetAppData] =
    useHistoryState(createInitialData());
  const [isClient, setIsClient] = useState(false);
  const [activeView, setActiveView] = useState("Table");
  const [modalImageUrl, setModalImageUrl] = useState(null);
  const [timelineDetail, setTimelineDetail] = useState(null);
  const [activeUpload, setActiveUpload] = useState({ id: null });
  const [showOverlay, setShowOverlay] = useState(false);
  const [isMetricSettingsOpen, setIsMetricSettingsOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [musicEmbedUrl, setMusicEmbedUrl] = useState(null);
  const [copyNotification, setCopyNotification] = useState("");

  const fileUploadRef = useRef(null);
  const importFileRef = useRef(null);
  const metricSettingsRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        metricSettingsRef.current &&
        !metricSettingsRef.current.contains(event.target)
      ) {
        setIsMetricSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUploadClick = (id) => {
    setActiveUpload({ id });
    fileUploadRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file || !activeUpload.id) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Image = e.target.result;
      const { id } = activeUpload;
      setAppData((prev) => {
        const updatedData = prev.scriptData.map((row) =>
          row.id === id ? { ...row, image: base64Image } : row
        );
        return { ...prev, scriptData: updatedData };
      });
    };
    reader.readAsDataURL(file);

    event.target.value = null;
    setActiveUpload({ id: null });
  };

  const handleScriptChange = (id, action, value, value2) => {
    setAppData((prev) => {
      let newScriptData = [...prev.scriptData];
      const currentIndex =
        id !== null ? newScriptData.findIndex((row) => row.id === id) : -1;

      if (currentIndex === -1 && id !== null && action !== "add") return prev;

      switch (action) {
        case "segment":
          newScriptData = newScriptData.map((row, index) =>
            index === currentIndex ? { ...row, segment: value } : row
          );
          break;
        case "image":
          newScriptData = newScriptData.map((row, index) =>
            index === currentIndex ? { ...row, image: value } : row
          );
          break;
        case "shotSize":
          newScriptData = newScriptData.map((row, index) =>
            index === currentIndex ? { ...row, shotSize: value } : row
          );
          break;
        case "shotType":
          newScriptData = newScriptData.map((row, index) =>
            index === currentIndex ? { ...row, shotType: value } : row
          );
          break;
        case "music":
          newScriptData = newScriptData.map((row, index) => {
            if (index !== currentIndex) return row;
            const newRow = { ...row, music: value };
            if (value2 !== undefined) newRow.musicTitle = value2;
            if (!value) {
              newRow.musicDuration = 1;
              newRow.musicTitle = "";
            }
            return newRow;
          });
          break;
        case "musicTitle":
          newScriptData = newScriptData.map((row, index) =>
            index === currentIndex ? { ...row, musicTitle: value } : row
          );
          break;
        case "musicDuration":
          newScriptData = newScriptData.map((row, index) =>
            index === currentIndex ? { ...row, musicDuration: value } : row
          );
          break;
        case "add":
          const addIndex = id ? currentIndex : newScriptData.length - 1;
          const newRow = {
            id: crypto.randomUUID(),
            level: id ? newScriptData[addIndex].level : 0,
            segment: "New Segment",
            image: null,
            music: "",
            musicTitle: "",
            musicDuration: 1,
            shotSize: "",
            shotType: "",
          };
          prev.emotionColumns.forEach((col) => (newRow[col.key] = 0));
          newScriptData.splice(addIndex + 1, 0, newRow);
          break;
        case "delete":
          if (newScriptData.length > 1) {
            newScriptData = newScriptData.filter(
              (_, index) => index !== currentIndex
            );
          }
          break;
        case "indent":
          if (currentIndex > 0) {
            newScriptData = newScriptData.map((row, index) =>
              index === currentIndex
                ? { ...row, level: Math.min(row.level + 1, 5) }
                : row
            );
          }
          break;
        case "outdent":
          newScriptData = newScriptData.map((row, index) =>
            index === currentIndex
              ? { ...row, level: Math.max(row.level - 1, 0) }
              : row
          );
          break;
        default:
          break;
      }
      return { ...prev, scriptData: newScriptData };
    });
  };

  const handleMoveMusic = (sourceId, targetId) => {
    setAppData((prev) => {
      const newScriptData = [...prev.scriptData];
      const sourceIndex = newScriptData.findIndex((row) => row.id === sourceId);
      const targetIndex = newScriptData.findIndex((row) => row.id === targetId);

      if (
        sourceIndex === -1 ||
        targetIndex === -1 ||
        newScriptData[targetIndex].music
      ) {
        return prev;
      }

      const { music, musicTitle, musicDuration } = newScriptData[sourceIndex];
      newScriptData[targetIndex] = {
        ...newScriptData[targetIndex],
        music,
        musicTitle,
        musicDuration,
      };
      newScriptData[sourceIndex] = {
        ...newScriptData[sourceIndex],
        music: "",
        musicTitle: "",
        musicDuration: 1,
      };

      return { ...prev, scriptData: newScriptData };
    });
  };

  const handlePlayMusic = (url) => {
    if (!url) return;

    let embedUrl = null;

    try {
      const youtubeRegex =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const youtubeMatch = url.match(youtubeRegex);
      if (youtubeMatch && youtubeMatch[2].length === 11) {
        const videoId = youtubeMatch[2];
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&origin=https://www.youtube.com`;
      }

      if (!embedUrl) {
        const bilibiliRegex = /bilibili\.com\/video\/(BV[1-9A-HJ-NP-Za-km-z]+)/;
        const bilibiliMatch = url.match(bilibiliRegex);
        if (bilibiliMatch && bilibiliMatch[1]) {
          const bvid = bilibiliMatch[1];
          embedUrl = `https://player.bilibili.com/player.html?bvid=${bvid}&page=1&autoplay=1`;
        }
      }
    } catch (error) {
      console.error("Could not parse URL:", error);
    }

    if (embedUrl) {
      setMusicEmbedUrl(embedUrl);
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleMetricChange = (rowId, metricKey, newValue) => {
    setAppData((prev) => ({
      ...prev,
      scriptData: prev.scriptData.map((row) =>
        row.id === rowId
          ? { ...row, [metricKey]: Math.max(0, Math.min(10, newValue)) }
          : row
      ),
    }));
  };

  const handleReset = () => {
    resetAppData(createInitialData());
    setIsResetModalOpen(false);
  };

  const handleAddMetric = (metricName) => {
    setAppData((prev) => {
      const newMetricKey = metricName.toLowerCase().replace(/\s+/g, "-");
      if (prev.emotionColumns.some((e) => e.key === newMetricKey)) {
        console.warn("Metric already exists.");
        return prev;
      }
      const newMetric = {
        key: newMetricKey,
        label: metricName,
        color: getRandomColor(),
      };
      const newEmotionColumns = [...prev.emotionColumns, newMetric];
      const newScriptData = prev.scriptData.map((row) => ({
        ...row,
        [newMetricKey]: 0,
      }));
      return {
        ...prev,
        emotionColumns: newEmotionColumns,
        scriptData: newScriptData,
      };
    });
  };

  const handleDeleteMetric = (metricKey) => {
    setAppData((prev) => {
      const newEmotionColumns = prev.emotionColumns.filter(
        (e) => e.key !== metricKey
      );
      const newScriptData = prev.scriptData.map((row) => {
        const newRow = { ...row };
        delete newRow[metricKey];
        return newRow;
      });
      return {
        ...prev,
        emotionColumns: newEmotionColumns,
        scriptData: newScriptData,
      };
    });
  };

  const handleExport = () => {
    const jsonString = JSON.stringify(appData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jojo-film-tools-data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    importFileRef.current.click();
  };

  const handleImportFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData.scriptData && importedData.emotionColumns) {
          resetAppData({ ...createInitialData(), ...importedData });
        } else {
          throw new Error("Invalid file format.");
        }
      } catch (error) {
        console.error("Failed to import file:", error);
        alert(
          "Error: Could not import the file. It may be invalid or corrupted."
        );
      }
    };
    reader.readAsText(file);
    event.target.value = null;
  };

  const handleCopyScript = () => {
    const segmentNumbers = generateSegmentNumbers(appData.scriptData);
    const scriptText = appData.scriptData
      .map((row) => {
        const indent = "    ".repeat(row.level);
        return `${indent}${segmentNumbers[row.id]} ${row.segment}`;
      })
      .join("\n");

    const textArea = document.createElement("textarea");
    textArea.value = scriptText;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      setCopyNotification("Script copied to clipboard!");
    } catch (err) {
      setCopyNotification("Failed to copy script!");
      console.error("Failed to copy text: ", err);
    }
    document.body.removeChild(textArea);

    setTimeout(() => {
      setCopyNotification("");
    }, 3000);
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen font-sans">
      <header className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1
            className="text-4xl font-bold text-amber-400"
            style={{ fontFamily: "'Brush Script MT', cursive" }}
          >
            Jojo Film Tools
          </h1>
          <p className="text-gray-400 text-sm">Tools</p>
        </div>
      </header>
      <main className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveView("Table")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === "Table"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setActiveView("Storyboard")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === "Storyboard"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                Storyboard
              </button>
              <button
                onClick={() => setActiveView("Workflow")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === "Workflow"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                Workflow
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={undo}
                disabled={!canUndo}
                className="p-2 rounded-md text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Undo size={16} />
                <span>Undo</span>
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className="p-2 rounded-md text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Redo size={16} />
                <span>Redo</span>
              </button>
              <button
                onClick={handleImportClick}
                className="p-2 rounded-md text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 flex items-center space-x-2"
              >
                <Upload size={16} />
                <span>Import</span>
              </button>
              <button
                onClick={handleExport}
                className="p-2 rounded-md text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Export</span>
              </button>
              <button
                onClick={() => setIsResetModalOpen(true)}
                className="p-2 rounded-md text-sm font-medium bg-gray-700 text-red-400 hover:bg-gray-600 flex items-center space-x-2"
              >
                <RefreshCw size={16} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {activeView === "Table" && (
            <>
              <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white">
                    Table & Analysis View
                  </h2>
                  <p className="text-gray-400 mt-1">
                    Detailed script analysis, image uploads, and metric
                    tracking.
                  </p>
                </div>
                <div className="p-6 border-t border-gray-700 flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center space-x-6 text-sm">
                    <div ref={metricSettingsRef} className="relative">
                      <button
                        onClick={() => setIsMetricSettingsOpen((o) => !o)}
                        className="flex items-center space-x-2 text-gray-300 hover:text-white"
                      >
                        <Settings size={16} />
                        <span>Metric Settings</span>
                      </button>
                      {isMetricSettingsOpen && (
                        <MetricSettingsPopup
                          metrics={appData.emotionColumns}
                          onAddMetric={handleAddMetric}
                          onDeleteMetric={handleDeleteMetric}
                        />
                      )}
                    </div>
                    <button
                      onClick={handleCopyScript}
                      className="flex items-center space-x-2 text-gray-300 hover:text-white"
                    >
                      <Copy size={16} />
                      <span>Copy Script</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-300">
                      Chart Overlay
                    </label>
                    <button
                      onClick={() => setShowOverlay(!showOverlay)}
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                        showOverlay ? "bg-amber-500" : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                          showOverlay ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <TableView
                  scriptData={appData.scriptData}
                  emotionColumns={appData.emotionColumns}
                  showOverlay={showOverlay}
                  onScriptChange={handleScriptChange}
                  onMetricChange={handleMetricChange}
                  onUploadClick={handleUploadClick}
                  onImageClick={setModalImageUrl}
                  onPlayMusic={handlePlayMusic}
                  onMoveMusic={handleMoveMusic}
                />
              </div>
              <MetricTimelineChart
                data={appData.scriptData}
                columns={appData.emotionColumns}
                onSegmentClick={setTimelineDetail}
              />
            </>
          )}
          {activeView === "Storyboard" && (
            <StoryboardView
              scriptData={appData.scriptData}
              onScriptChange={handleScriptChange}
              onUploadClick={handleUploadClick}
              onImageClick={setModalImageUrl}
              onPlayMusic={handlePlayMusic}
            />
          )}
          {activeView === "Workflow" && <WorkflowView />}
        </div>
      </main>
      <input
        type="file"
        ref={fileUploadRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={importFileRef}
        onChange={handleImportFile}
        accept=".json"
        className="hidden"
      />
      <ImageModal
        imageUrl={modalImageUrl}
        onClose={() => setModalImageUrl(null)}
      />
      <SegmentDetailModal
        segment={timelineDetail}
        onClose={() => setTimelineDetail(null)}
      />
      <MiniMusicPlayer
        embedUrl={musicEmbedUrl}
        onClose={() => setMusicEmbedUrl(null)}
      />
      <ConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleReset}
        title="Reset Project?"
      >
        <p>
          Are you sure you want to reset? All current data, including script
          segments and metric settings, will be lost and restored to the default
          state.
        </p>
      </ConfirmationModal>
      {copyNotification && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300">
          {copyNotification}
        </div>
      )}
    </div>
  );
}
