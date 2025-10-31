import React, { useState, useRef, useEffect } from "react";
import {
  AlertTriangle,
  ClipboardCopy,
  ClipboardPaste,
  Download,
  FileUp,
  X,
} from "lucide-react";

type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
}) => {
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
          <AlertTriangle className="text-red-500 mr-4 flex-shrink-0" size={24} />
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

type ImageModalProps = {
  imageUrl: string | null;
  onClose: () => void;
};

export const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
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

type MiniMusicPlayerProps = {
  embedUrl: string | null;
  onClose: () => void;
};

export const MiniMusicPlayer: React.FC<MiniMusicPlayerProps> = ({
  embedUrl,
  onClose,
}) => {
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

type ImportExportModalProps = {
  mode: "import" | "export" | null;
  onClose: () => void;
  appData: any;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onTextImport: (data: any) => void;
};

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  mode,
  onClose,
  appData,
  onFileUpload,
  onTextImport,
}) => {
  const [textData, setTextData] = useState("");
  const [copyStatus, setCopyStatus] = useState("Copy to Clipboard");
  const [importStatus, setImportStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (mode === "export") {
      setTextData(JSON.stringify(appData, null, 2));
    } else {
      setTextData("");
    }
    setCopyStatus("Copy to Clipboard");
    setImportStatus("");
  }, [mode, appData]);

  const handleCopy = () => {
    navigator.clipboard.writeText(textData).then(
      () => {
        setCopyStatus("Copied!");
        setTimeout(() => setCopyStatus("Copy to Clipboard"), 2000);
      },
      () => {
        setCopyStatus("Failed to copy!");
      }
    );
  };

  const handleTextImportClick = () => {
    try {
      const parsedData = JSON.parse(textData);
      onTextImport(parsedData);
      setImportStatus("Imported successfully!");
      setTimeout(onClose, 1000);
    } catch (error) {
      setImportStatus("Invalid JSON format. Please check your text.");
      console.error("Invalid JSON:", error);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  if (!mode) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl p-6 relative w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">
            {mode === "import" ? "Import Project Data" : "Export Project Data"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {mode === "export" && (
            <>
              <p className="text-sm text-gray-400">
                Copy the text below or download the JSON file.
              </p>
              <textarea
                readOnly
                value={textData}
                className="w-full h-64 bg-gray-900 text-gray-300 text-xs p-3 rounded-md border border-gray-600 focus:ring-amber-500 focus:border-amber-500"
              />
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-2"
                >
                  <ClipboardCopy size={16} />
                  <span>{copyStatus}</span>
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([textData], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "jojo-film-tools-data.json";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-gray-600 text-white hover:bg-gray-500 flex items-center space-x-2"
                >
                  <Download size={16} />
                  <span>Download File</span>
                </button>
              </div>
            </>
          )}

          {mode === "import" && (
            <>
              <div>
                <p className="text-sm text-gray-400 mb-2">
                  Paste your JSON data here or upload a file.
                </p>
                <textarea
                  value={textData}
                  onChange={(e) => setTextData(e.target.value)}
                  className="w-full h-64 bg-gray-900 text-gray-300 text-xs p-3 rounded-md border border-gray-600 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Paste your JSON data here..."
                />
                {importStatus && (
                  <p
                    className={`text-sm mt-2 ${
                      importStatus.includes("successfully")
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {importStatus}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={handleTextImportClick}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-2"
                >
                  <ClipboardPaste size={16} />
                  <span>Import from Text</span>
                </button>
                <button
                  onClick={handleFileButtonClick}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-gray-600 text-white hover:bg-gray-500 flex items-center space-x-2"
                >
                  <FileUp size={16} />
                  <span>Upload from File</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={onFileUpload}
                  accept=".json"
                  className="hidden"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

type ProjectSettingsModalProps = {
  onClose: () => void;
  onSelectFolder: () => Promise<void>;
  imageFolderName?: string;
};

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  onClose,
  onSelectFolder,
  imageFolderName,
}) => {
  const handleSelectClick = async () => {
    try {
      await onSelectFolder();
      onClose();
    } catch (error) {
      console.log("Folder selection was cancelled or failed.", error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl p-6 relative w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">Project Settings</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="image-base-path"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Image Folder
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-grow p-2 bg-gray-900 rounded-md text-sm text-gray-400 truncate">
                {imageFolderName || "No folder selected"}
              </div>
              <button
                onClick={handleSelectClick}
                className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
              >
                Select Folder
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Select your local project folder containing the images.
            </p>
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium bg-gray-700 text-gray-200 hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
