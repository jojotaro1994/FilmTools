"use client";

import React, { useState, useRef, useEffect } from "react";
import { Copy, Upload, Download, RefreshCw, Undo, Redo, FolderCog } from "lucide-react";

import { useHistoryState } from "./utils/useHistoryState";
import { createInitialData, generateSegmentNumbers } from "./utils/data";

const createEmptyRow = (level = 0) => ({
  id: crypto.randomUUID(),
  level,
  segment: "New Segment",
  image: null,
  music: "",
  musicTitle: "",
  musicDuration: 1,
  referenceVideo: "",
  referenceVideoTitle: "",
  referenceVideoDuration: 1,
  shotSize: "",
  shotType: "",
  dialogues: [],
  mainCharacters: "",
  cameraMotion: "",
  durationSeconds: null,
  isChapterHeading: false,
});

const normalizeRow = (row) => {
  let dialogues = [];
  if (Array.isArray(row.dialogues)) {
    dialogues = row.dialogues.map((dialogue) => ({
      speaker: (dialogue && dialogue.speaker) || "",
      line: (dialogue && dialogue.line) || "",
    }));
  } else if (row.dialogue) {
    dialogues = String(row.dialogue)
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => ({ speaker: "", line }));
  }
  return {
    ...row,
    dialogues,
  };
};

import {
  ConfirmationModal,
  ImageModal,
  MiniMusicPlayer,
  ImportExportModal,
  ProjectSettingsModal,
} from "./components/Modals";
import TableView from "./components/TableView";
import StoryboardView from "./components/StoryboardView";
import AssetView from "./components/AssetView";
import WorkflowView from "./components/WorkflowView";

// --- Main Application Component ---
export default function App() {
  const [appData, setAppData, undo, redo, canUndo, canRedo, resetAppData] =
    useHistoryState(createInitialData());
  const [isClient, setIsClient] = useState(false);
  const [activeView, setActiveView] = useState("Script");
  const [modalImageUrl, setModalImageUrl] = useState(null);
  const [activeUpload, setActiveUpload] = useState({ id: null });
  const [isProjectSettingsOpen, setIsProjectSettingsOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [musicEmbedUrl, setMusicEmbedUrl] = useState(null);
  const [copyNotification, setCopyNotification] = useState("");
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState({
    isOpen: false,
    mode: null,
  });
  const [imageDirectoryHandle, setImageDirectoryHandle] = useState(null);
  const [imageUrlCache, setImageUrlCache] = useState({});

  const fileUploadRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const updateImageUrlCache = async () => {
      if (!imageDirectoryHandle) return;

      const newCache = {};
      const uniqueImageFiles = [
        ...new Set(appData.scriptData.map((row) => row.image).filter(Boolean)),
      ];

      for (const fileName of uniqueImageFiles) {
        try {
          const fileHandle = await imageDirectoryHandle.getFileHandle(fileName);
          const file = await fileHandle.getFile();
          newCache[fileName] = URL.createObjectURL(file);
        } catch (error) {
          console.warn(
            `Could not find or access image "${fileName}" in the selected directory.`,
            error
          );
          newCache[fileName] = null; // Mark as not found
        }
      }

      // Revoke old URLs to prevent memory leaks
      Object.values(imageUrlCache).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });

      setImageUrlCache(newCache);
    };

    updateImageUrlCache();

    return () => {
      Object.values(imageUrlCache).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [imageDirectoryHandle, appData.scriptData]);

  const handleSelectFolder = async () => {
    try {
      if (window.showDirectoryPicker) {
        const handle = await window.showDirectoryPicker();
        setImageDirectoryHandle(handle);
        handleProjectSettingsSave({ imageFolderName: handle.name });
      } else {
        alert(
          "Your browser does not support the File System Access API. Please use a modern browser like Chrome or Edge."
        );
      }
    } catch (error) {
      console.error("Error selecting directory:", error);
    }
  };

  const handleUploadClick = (id) => {
    setActiveUpload({ id });
    fileUploadRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file || !activeUpload.id) return;

    const { id } = activeUpload;
    setAppData((prev) => {
      const newScriptData = prev.scriptData.map((row) =>
        row.id === id ? { ...row, image: file.name } : row
      );
      return { ...prev, scriptData: newScriptData };
    });

    event.target.value = null;
    setActiveUpload({ id: null });
  };

  const handleScriptChange = (id, action, value, value2) => {
    setAppData((prev) => {
      let newScriptData = prev.scriptData.map(normalizeRow);
      const currentIndex =
        id !== null ? newScriptData.findIndex((row) => row.id === id) : -1;

      const applyToRow = (index, updater) => {
        if (index < 0 || index >= newScriptData.length) return false;
        const next = normalizeRow(updater({ ...newScriptData[index] }));
        newScriptData[index] = next;
        return true;
      };

      switch (action) {
        case "add": {
          if (newScriptData.length === 0) {
            newScriptData = [createEmptyRow(0)];
          } else if (currentIndex >= 0) {
            const level = newScriptData[currentIndex].level;
            newScriptData.splice(currentIndex + 1, 0, createEmptyRow(level));
          } else {
            newScriptData = [...newScriptData, createEmptyRow(0)];
          }
          break;
        }
        case "segment":
          if (!applyToRow(currentIndex, (row) => ({ ...row, segment: value })))
            return prev;
          break;
        case "image":
          if (!applyToRow(currentIndex, (row) => ({ ...row, image: value })))
            return prev;
          break;
        case "mainCharacters":
          if (
            !applyToRow(currentIndex, (row) => ({
              ...row,
              mainCharacters: value || "",
            }))
          )
            return prev;
          break;
        case "cameraMotion":
          if (
            !applyToRow(currentIndex, (row) => ({
              ...row,
              cameraMotion: value || "",
            }))
          )
            return prev;
          break;
        case "durationSeconds": {
          if (currentIndex === -1) return prev;
          const nextValue =
            value === null || value === undefined || value === ""
              ? null
              : Number(value);
          if (nextValue !== null && Number.isNaN(nextValue)) return prev;
          if (
            !applyToRow(currentIndex, (row) => ({
              ...row,
              durationSeconds: nextValue,
            }))
          )
            return prev;
          break;
        }
        case "shotSize":
          if (!applyToRow(currentIndex, (row) => ({ ...row, shotSize: value })))
            return prev;
          break;
        case "shotType":
          if (!applyToRow(currentIndex, (row) => ({ ...row, shotType: value })))
            return prev;
          break;
        case "toggleChapterHeading":
          if (
            !applyToRow(currentIndex, (row) => ({
              ...row,
              isChapterHeading: !row.isChapterHeading,
            }))
          )
            return prev;
          break;
        case "music":
          if (
            !applyToRow(currentIndex, (row) => {
              const next = { ...row, music: value };
              if (value2 !== undefined) next.musicTitle = value2;
              if (!value) {
                next.musicDuration = 1;
                next.musicTitle = "";
              }
              return next;
            })
          )
            return prev;
          break;
        case "musicTitle":
          if (!applyToRow(currentIndex, (row) => ({ ...row, musicTitle: value })))
            return prev;
          break;
        case "musicDuration":
          if (!applyToRow(currentIndex, (row) => ({ ...row, musicDuration: value })))
            return prev;
          break;
        case "referenceVideo":
          if (
            !applyToRow(currentIndex, (row) => {
              const next = { ...row, referenceVideo: value };
              if (value2 !== undefined) next.referenceVideoTitle = value2;
              if (!value) {
                next.referenceVideoDuration = 1;
                next.referenceVideoTitle = "";
              }
              return next;
            })
          )
            return prev;
          break;
        case "referenceVideoTitle":
          if (
            !applyToRow(currentIndex, (row) => ({
              ...row,
              referenceVideoTitle: value,
            }))
          )
            return prev;
          break;
        case "referenceVideoDuration":
          if (
            !applyToRow(currentIndex, (row) => ({
              ...row,
              referenceVideoDuration: value,
            }))
          )
            return prev;
          break;
        case "addDialogue":
          if (
            !applyToRow(currentIndex, (row) => ({
              ...row,
              dialogues: [...row.dialogues, { speaker: "", line: "" }],
            }))
          )
            return prev;
          break;
        case "updateDialogue": {
          if (currentIndex === -1 || !value) return prev;
          const { index: dialogueIndex, field, content } = value;
          if (typeof dialogueIndex !== "number") return prev;
          if (
            !applyToRow(currentIndex, (row) => {
              const dialogues = [...row.dialogues];
              if (!dialogues[dialogueIndex]) {
                dialogues[dialogueIndex] = { speaker: "", line: "" };
              }
              dialogues[dialogueIndex] = {
                ...dialogues[dialogueIndex],
                [field]: content,
              };
              return { ...row, dialogues };
            })
          )
            return prev;
          break;
        }
        case "removeDialogue":
          if (
            !applyToRow(currentIndex, (row) => ({
              ...row,
              dialogues: row.dialogues.filter((_, idx) => idx !== value),
            }))
          )
            return prev;
          break;
        case "delete":
          if (currentIndex !== -1 && newScriptData.length > 1) {
            newScriptData.splice(currentIndex, 1);
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
          if (currentIndex !== -1) {
            newScriptData = newScriptData.map((row, index) =>
              index === currentIndex
                ? { ...row, level: Math.max(row.level - 1, 0) }
                : row
            );
          }
          break;
        case "removeAssets": {
          const assetsToRemove = value;
          newScriptData = newScriptData.map((row) => {
            const next = { ...row };
            if (
              assetsToRemove.has("image") &&
              assetsToRemove.get("image").has(row.image)
            ) {
              next.image = null;
            }
            if (
              assetsToRemove.has("music") &&
              assetsToRemove.get("music").has(row.music)
            ) {
              next.music = "";
              next.musicTitle = "";
              next.musicDuration = 1;
            }
            if (
              assetsToRemove.has("reference") &&
              assetsToRemove.get("reference").has(row.referenceVideo)
            ) {
              next.referenceVideo = "";
              next.referenceVideoTitle = "";
              next.referenceVideoDuration = 1;
            }
            return next;
          });
          break;
        }
        default:
          break;
      }

      return { ...prev, scriptData: newScriptData };
    });
  };
  const handlePlayMusic = (url) => {
    if (!url) return;

    let embedUrl = null;

    try {
      // YouTube URL Parser (no changes here)
      const youtubeRegex =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const youtubeMatch = url.match(youtubeRegex);
      if (youtubeMatch && youtubeMatch[2].length === 11) {
        const videoId = youtubeMatch[2];
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&origin=https://www.youtube.com`;
      }

      // *** MODIFICATION START: Enhanced Bilibili URL Parser ***
      if (!embedUrl) {
        // This new regex handles www, m, and no subdomain, as well as both BV and av video IDs.
        const bilibiliRegex =
          /(?:www\.|m\.)?bilibili\.com\/video\/(av[0-9]+|BV[1-9A-HJ-NP-Za-km-z]+)/;
        const bilibiliMatch = url.match(bilibiliRegex);

        if (bilibiliMatch && bilibiliMatch[1]) {
          const videoId = bilibiliMatch[1];
          // Check if it's a BV or an older AV number and construct the correct embed URL.
          if (videoId.startsWith("BV")) {
            embedUrl = `https://player.bilibili.com/player.html?bvid=${videoId}&page=1&autoplay=1`;
          } else if (videoId.startsWith("av")) {
            const aid = videoId.substring(2); // Remove the "av" prefix
            embedUrl = `https://player.bilibili.com/player.html?aid=${aid}&page=1&autoplay=1`;
          }
        }
      }
      // *** MODIFICATION END ***
    } catch (error) {
      console.error("Could not parse URL:", error);
    }

    if (embedUrl) {
      setMusicEmbedUrl(embedUrl);
    } else {
      // Fallback for any other URL: open in a new tab.
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleReset = () => {
    resetAppData(createInitialData());
    setIsResetModalOpen(false);
  };

  const handleProjectSettingsSave = (newSettings) => {
    setAppData((prev) => ({
      ...prev,
      projectSettings: {
        ...prev.projectSettings,
        ...newSettings,
      },
    }));
  };

  const handleTextImport = (data) => {
    if (Array.isArray(data?.scriptData)) {
      const { scriptData, projectSettings = {} } = data;
      const base = createInitialData();
      resetAppData({
        ...base,
        scriptData,
        projectSettings: {
          ...base.projectSettings,
          ...projectSettings,
        },
      });
    } else {
      throw new Error("Invalid file format.");
    }
  };

  const handleImportFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        handleTextImport(importedData);
        setIsImportExportModalOpen({ isOpen: false, mode: null });
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
                onClick={() => setActiveView("Script")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === "Script"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                Script
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
                onClick={() => setActiveView("Assets")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === "Assets"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                Assets
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
                onClick={() => setIsProjectSettingsOpen(true)}
                className="p-2 rounded-md text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 flex items-center space-x-2"
              >
                <FolderCog size={16} />
                <span>Project Settings</span>
              </button>
              <button
                onClick={handleCopyScript}
                className="p-2 rounded-md text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 flex items-center space-x-2"
              >
                <Copy size={16} />
                <span>Copy Script</span>
              </button>
              <button
                onClick={() =>
                  setIsImportExportModalOpen({ isOpen: true, mode: "import" })
                }
                className="p-2 rounded-md text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 flex items-center space-x-2"
              >
                <Upload size={16} />
                <span>Import</span>
              </button>
              <button
                onClick={() =>
                  setIsImportExportModalOpen({ isOpen: true, mode: "export" })
                }
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

          {activeView === "Script" && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-white">Script View</h2>
                <p className="text-gray-400 mt-1">
                  层级化管理脚本段落，并快速关联与预览参考图片。
                </p>
              </div>
              <TableView
                scriptData={appData.scriptData}
                onScriptChange={handleScriptChange}
                onUploadClick={handleUploadClick}
                onImageClick={setModalImageUrl}
                imageUrlCache={imageUrlCache}
              />
            </div>
          )}
          {activeView === "Storyboard" && (
            <StoryboardView
              scriptData={appData.scriptData}
              onScriptChange={handleScriptChange}
              onUploadClick={handleUploadClick}
              onImageClick={setModalImageUrl}
              onPlayMusic={handlePlayMusic}
              imageUrlCache={imageUrlCache}
            />
          )}
          {activeView === "Assets" && (
            <AssetView
              scriptData={appData.scriptData}
              imageUrlCache={imageUrlCache}
              onPlayMusic={handlePlayMusic}
              onScriptChange={handleScriptChange}
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

      <ImportExportModal
        mode={isImportExportModalOpen.mode}
        isOpen={isImportExportModalOpen.isOpen}
        onClose={() =>
          setIsImportExportModalOpen({ isOpen: false, mode: null })
        }
        appData={appData}
        onFileUpload={handleImportFile}
        onTextImport={handleTextImport}
      />

      {isProjectSettingsOpen && (
        <ProjectSettingsModal
          settings={appData.projectSettings}
          onSave={handleProjectSettingsSave}
          onClose={() => setIsProjectSettingsOpen(false)}
          onSelectFolder={handleSelectFolder}
          imageFolderName={imageDirectoryHandle?.name}
        />
      )}

      <ImageModal
        imageUrl={modalImageUrl}
        onClose={() => setModalImageUrl(null)}
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
          segments and asset settings, will be lost and restored to the default
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
