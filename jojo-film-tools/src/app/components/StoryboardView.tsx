import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  LayoutGrid,
  List,
  Crop,
  FileUp,
  Music,
  Video,
  PlayCircle,
  Trash2,
  Plus,
  Play,
  Square,
  X,
} from "lucide-react";
import {
  EditableSegment,
  EditableMedia,
  EditableTextField,
  EditableNumberField,
} from "./EditableControls";
import { SHOT_SIZES, SHOT_TYPES, CAMERA_MOTIONS } from "../utils/data";

type DialogueEntry = {
  speaker: string;
  line: string;
};

type ScriptRow = {
  id: string;
  level: number;
  segment: string;
  image: string | null;
  dialogues?: DialogueEntry[];
  dialogue?: string;
  mainCharacters?: string;
  cameraMotion?: string;
  durationSeconds?: number | null;
  music?: string;
  musicTitle?: string;
  musicDuration?: number;
  referenceVideo?: string;
  referenceVideoTitle?: string;
  referenceVideoDuration?: number;
  shotSize?: string;
  shotType?: string;
  isChapterHeading?: boolean;
};

type StoryboardViewProps = {
  scriptData: ScriptRow[];
  onScriptChange: (
    id: string,
    action: string,
    value?: any,
    value2?: any
  ) => void;
  onUploadClick: (id: string) => void;
  onImageClick: (url: string | null) => void;
  onPlayMusic: (url: string) => void;
  imageUrlCache: Record<string, string | null>;
};

type SelectionPopupProps = {
  title: string;
  options: { value: string; label: string }[];
  currentValue?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
};

const SelectionPopup: React.FC<SelectionPopupProps> = ({
  title,
  options,
  currentValue,
  onSelect,
  onClose,
}) => {
  const popupRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
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

type AspectRatioModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentRatio: string;
  onSetRatio: (ratio: string) => void;
};

const AspectRatioModal: React.FC<AspectRatioModalProps> = ({
  isOpen,
  onClose,
  currentRatio,
  onSetRatio,
}) => {
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

type ActivePopup = { id: string; type: "size" | "type" } | null;

export const StoryboardView: React.FC<StoryboardViewProps> = ({
  scriptData,
  onScriptChange,
  onUploadClick,
  onImageClick,
  onPlayMusic,
  imageUrlCache,
}) => {
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [aspectRatio, setAspectRatio] = useState("16/9");
  const [isRatioModalOpen, setIsRatioModalOpen] = useState(false);
  const [activePopup, setActivePopup] = useState<ActivePopup>(null);
  const aspectStyle = useMemo(() => ({ aspectRatio }), [aspectRatio]);

  if (scriptData.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center space-y-4">
        <p className="text-sm text-gray-400">
          No storyboard panels yet. Add your first shot to get started.
        </p>
        <button
          onClick={() => onScriptChange(null, "add")}
          className="px-4 py-2 bg-amber-500 text-black font-semibold rounded-md hover:bg-amber-400"
        >
          + Add First Shot
        </button>
      </div>
    );
  }

  const musicSequences: number[][] = [];
  let currentMusicSequence: number[] = [];
  scriptData.forEach((item, index) => {
    if (item.music) {
      if (currentMusicSequence.length > 0)
        musicSequences.push(currentMusicSequence);
      currentMusicSequence = [index];
      for (let i = 1; i < (item.musicDuration || 1); i++) {
        if (index + i < scriptData.length) {
          currentMusicSequence.push(index + i);
        }
      }
    }
  });
  if (currentMusicSequence.length > 0)
    musicSequences.push(currentMusicSequence);

  const referenceSequences: number[][] = [];
  let currentReferenceSequence: number[] = [];
  scriptData.forEach((item, index) => {
    if (item.referenceVideo) {
      if (currentReferenceSequence.length > 0)
        referenceSequences.push(currentReferenceSequence);
      currentReferenceSequence = [index];
      for (let i = 1; i < (item.referenceVideoDuration || 1); i++) {
        if (index + i < scriptData.length) {
          currentReferenceSequence.push(index + i);
        }
      }
    }
  });
  if (currentReferenceSequence.length > 0)
    referenceSequences.push(currentReferenceSequence);

  const getMusicStatus = (index: number) => {
    for (const seq of musicSequences) {
      if (seq.includes(index)) {
        if (seq[0] === index) return "start";
        if (seq[seq.length - 1] === index) return "end";
        return "middle";
      }
    }
    return "none";
  };

  const getReferenceStatus = (index: number) => {
    for (const seq of referenceSequences) {
      if (seq.includes(index)) {
        if (seq[0] === index) return "start";
        if (seq[seq.length - 1] === index) return "end";
        return "middle";
      }
    }
    return "none";
  };

  const renderStatusIcon = (status: string) => {
    if (status === "start") return <Play size={14} />;
    if (status === "end") return <Square size={14} />;
    if (status === "middle")
      return <span className="text-xs font-semibold">||</span>;
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setLayout("grid")}
            className={`p-2 rounded ${
              layout === "grid"
                ? "bg-amber-500 text-black"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setLayout("list")}
            className={`p-2 rounded ${
              layout === "list"
                ? "bg-amber-500 text-black"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <List size={18} />
          </button>
        </div>
        <button
          onClick={() => setIsRatioModalOpen(true)}
          className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white"
        >
          <Crop size={16} />
          <span>Aspect Ratio: {aspectRatio}</span>
        </button>
      </div>

      <div
        className={`grid gap-6 ${
          layout === "grid"
            ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
            : "grid-cols-1"
        }`}
      >
        {scriptData.map((item, index) => {
          const musicStatus = getMusicStatus(index);
          const referenceStatus = getReferenceStatus(index);
          const musicItem = scriptData.find(
            (row, i) => row.music && getMusicStatus(i) === "start" && i === index
          );
          const referenceItem = scriptData.find(
            (row, i) =>
              row.referenceVideo &&
              getReferenceStatus(i) === "start" &&
              i === index
          );
          const itemDialogues = Array.isArray(item.dialogues)
            ? item.dialogues
            : item.dialogue
            ? item.dialogue
                .split(/\n+/)
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line) => ({ speaker: "", line }))
            : [];

          return (
            <div
              key={item.id}
              className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg flex flex-col overflow-visible"
            >
              <div className="relative">
                <div
                  className={`bg-gray-900 rounded-t-lg overflow-hidden ${
                    layout === "grid"
                      ? "h-48"
                      : "h-48 md:h-40 lg:h-32 xl:h-28"
                  }`}
                >
                  <div
                    className="w-full h-full flex items-center justify-center overflow-hidden"
                    style={aspectStyle}
                  >
                    {item.image && imageUrlCache[item.image] ? (
                      <>
                        <img
                          src={imageUrlCache[item.image] || ""}
                          alt={item.segment}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() =>
                            onImageClick(imageUrlCache[item.image] || null)
                          }
                        />
                        <button
                          onClick={() => onScriptChange(item.id, "image", null)}
                          className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-red-600"
                          title="Remove Image"
                        >
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onUploadClick(item.id)}
                        className="w-full h-full text-gray-500 flex flex-col items-center justify-center"
                      >
                        <FileUp size={32} />
                        <p className="text-sm mt-2">Click to Upload</p>
                      </button>
                    )}
                  </div>
                </div>
                {musicStatus !== "none" && (
                  <div className="absolute top-2 left-2 bg-amber-500/80 text-black text-xs font-semibold px-2 py-1 rounded-full flex items-center space-x-1">
                    {renderStatusIcon(musicStatus)}
                    <span>Music</span>
                  </div>
                )}
                {referenceStatus !== "none" && (
                  <div className="absolute top-2 right-2 bg-blue-500/80 text-black text-xs font-semibold px-2 py-1 rounded-full flex items-center space-x-1">
                    {renderStatusIcon(referenceStatus)}
                    <span>Reference</span>
                  </div>
                )}
              </div>

              <div
                className={`${
                  layout === "grid"
                    ? "p-4 flex-grow flex flex-col justify-between"
                    : "p-4 text-sm text-gray-300 flex-grow flex flex-col justify-between"
                }`}
              >
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
                      onClick={() =>
                        setActivePopup((prev) =>
                          prev?.id === item.id && prev.type === "size"
                            ? null
                            : { id: item.id, type: "size" }
                        )
                      }
                      className="w-full text-left p-2 rounded-md bg-gray-700/50 hover:bg-gray-700"
                    >
                      <span className="text-xs text-gray-400">Shot Size</span>
                      <p className="text-sm font-semibold truncate">
                        {item.shotSize || "Not Set"}
                      </p>
                    </button>
                    {activePopup?.id === item.id && activePopup.type === "size" && (
                      <SelectionPopup
                        title="Shot Size"
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
                      onClick={() =>
                        setActivePopup((prev) =>
                          prev?.id === item.id && prev.type === "type"
                            ? null
                            : { id: item.id, type: "type" }
                        )
                      }
                      className="w-full text-left p-2 rounded-md bg-gray-700/50 hover:bg-gray-700"
                    >
                      <span className="text-xs text-gray-400">Shot Type</span>
                      <p className="text-sm font-semibold truncate">
                        {item.shotType || "Not Set"}
                      </p>
                    </button>
                    {activePopup?.id === item.id && activePopup.type === "type" && (
                      <SelectionPopup
                        title="Shot Type"
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
                              <div>
                  <p className="text-xs text-gray-400 mb-1">Camera Motion</p>
                  <select
                    value={item.cameraMotion || ""}
                    onChange={(e) =>
                      onScriptChange(item.id, "cameraMotion", e.target.value)
                    }
                    className="w-full bg-gray-700 text-sm text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select camera motion</option>
                    {CAMERA_MOTIONS.map((motion) => (
                      <option key={motion.value} value={motion.value}>
                        {motion.label}
                      </option>
                    ))}
                  </select>
                </div>

              <div className="border-t border-gray-700 pt-3 mb-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Dialogue
                  </p>
                  <button
                    onClick={() => onScriptChange(item.id, "addDialogue")}
                    className="text-xs text-amber-400 hover:text-amber-300"
                  >
                    + Add Line
                  </button>
                </div>
                {itemDialogues.length === 0 ? (
                  <p className="text-xs text-gray-500">No dialogue yet.</p>
                ) : null}
                {itemDialogues.map((dialogue, dIndex) => (
                  <div
                    key={`${item.id}-dialogue-${dIndex}`}
                    className="bg-gray-700/30 rounded-md p-2 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Speaker</span>
                      <EditableTextField
                        value={dialogue.speaker}
                        placeholder="Name"
                        multiline={false}
                        className="min-h-[32px]"
                        onChange={(val) =>
                          onScriptChange(item.id, "updateDialogue", {
                            index: dIndex,
                            field: "speaker",
                            content: val,
                          })
                        }
                      />
                      <button
                        onClick={() =>
                          onScriptChange(item.id, "removeDialogue", dIndex)
                        }
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block mb-1">
                        Line
                      </span>
                      <EditableTextField
                        value={dialogue.line}
                        placeholder="Dialogue line"
                        onChange={(val) =>
                          onScriptChange(item.id, "updateDialogue", {
                            index: dIndex,
                            field: "line",
                            content: val,
                          })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gray-700 pt-3 mb-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Main Characters</p>
                  <EditableTextField
                    value={item.mainCharacters || ""}
                    placeholder="List key characters"
                    onChange={(value) =>
                      onScriptChange(item.id, "mainCharacters", value)
                    }
                  />
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">Duration (s)</p>
                  <EditableNumberField
                    value={item.durationSeconds ?? null}
                    placeholder="0"
                    min={0}
                    step={0.5}
                    onChange={(value) =>
                      onScriptChange(item.id, "durationSeconds", value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2 border-t border-gray-700 pt-3">
                {musicItem ? (
                  <div className="flex items-center space-x-2">
                      <div className="flex-grow min-w-0">
                        <EditableMedia
                          type="music"
                          title={musicItem.musicTitle || ""}
                          link={musicItem.music || ""}
                          onSave={(newTitle, newLink) => {
                            onScriptChange(
                              musicItem.id,
                              "musicTitle",
                              newTitle
                            );
                            onScriptChange(musicItem.id, "music", newLink);
                          }}
                        />
                      </div>
                      <button
                        onClick={() =>
                          onScriptChange(musicItem.id, "music", "")
                        }
                        className="text-gray-400 hover:text-red-400 flex-shrink-0"
                        title="Delete music"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={() => onPlayMusic(musicItem.music || "")}
                        className="text-gray-400 hover:text-amber-400 flex-shrink-0"
                        title="Play music"
                      >
                        <PlayCircle size={18} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        onScriptChange(item.id, "music", "https://")
                      }
                      className="w-full text-left text-gray-500 hover:text-amber-400 transition-colors text-sm flex items-center space-x-2"
                    >
                      <Music size={14} />
                      <span>Add Music</span>
                    </button>
                  )}
                  {referenceItem ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex-grow min-w-0">
                        <EditableMedia
                          type="reference"
                          title={referenceItem.referenceVideoTitle || ""}
                          link={referenceItem.referenceVideo || ""}
                          onSave={(newTitle, newLink) => {
                            onScriptChange(
                              referenceItem.id,
                              "referenceVideoTitle",
                              newTitle
                            );
                            onScriptChange(
                              referenceItem.id,
                              "referenceVideo",
                              newLink
                            );
                          }}
                        />
                      </div>
                      <button
                        onClick={() =>
                          onScriptChange(
                            referenceItem.id,
                            "referenceVideo",
                            ""
                          )
                        }
                        className="text-gray-400 hover:text-red-400 flex-shrink-0"
                        title="Delete reference"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={() =>
                          onPlayMusic(referenceItem.referenceVideo || "")
                        }
                        className="text-gray-400 hover:text-blue-400 flex-shrink-0"
                        title="Play reference"
                      >
                        <PlayCircle size={18} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        onScriptChange(item.id, "referenceVideo", "https://")
                      }
                      className="w-full text-left text-gray-500 hover:text-blue-400 transition-colors text-sm flex items-center space-x-2"
                    >
                      <Video size={14} />
                      <span>Add Reference</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center bg-gray-900 border-t border-gray-700 px-4 py-3 text-xs text-gray-400">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onScriptChange(item.id, "add")}
                    className="flex items-center space-x-1 text-gray-400 hover:text-white"
                  >
                    <Plus size={14} />
                    <span>Add Shot</span>
                  </button>
                  <button
                    onClick={() => onScriptChange(item.id, "delete")}
                    className="flex items-center space-x-1 text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="uppercase tracking-wider text-[11px]">
                    Shot {index + 1}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
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

export default StoryboardView;
