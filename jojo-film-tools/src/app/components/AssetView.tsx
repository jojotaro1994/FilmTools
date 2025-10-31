import React, { useState, useMemo } from "react";
import { ImageIcon, Music, Video, Trash2 } from "lucide-react";
import { generateSegmentNumbers } from "../utils/data";

type ScriptRow = {
  id: string;
  image: string | null;
  music?: string;
  musicTitle?: string;
  referenceVideo?: string;
  referenceVideoTitle?: string;
  dialogue?: string;
  mainCharacters?: string;
  cameraMotion?: string;
  durationSeconds?: number | null;
};

type AssetViewProps = {
  scriptData: ScriptRow[];
  imageUrlCache: Record<string, string | null>;
  onPlayMusic: (url: string) => void;
  onScriptChange: (
    id: string | null,
    action: string,
    value?: any
  ) => void;
};

type AssetType = "image" | "music" | "reference";

export const AssetView: React.FC<AssetViewProps> = ({
  scriptData,
  imageUrlCache,
  onPlayMusic,
  onScriptChange,
}) => {
  const [selectedAssets, setSelectedAssets] = useState<
    Map<AssetType, Set<string>>
  >(new Map());

  const assets = useMemo(() => {
    const imageAssets = new Map<string, string[]>();
    const musicAssets = new Map<
      string,
      { title: string | undefined; usedBy: string[] }
    >();
    const referenceAssets = new Map<
      string,
      { title: string | undefined; usedBy: string[] }
    >();

    scriptData.forEach((row) => {
      if (row.image) {
        if (!imageAssets.has(row.image)) imageAssets.set(row.image, []);
        imageAssets.get(row.image)!.push(row.id);
      }
      if (row.music) {
        if (!musicAssets.has(row.music))
          musicAssets.set(row.music, { title: row.musicTitle, usedBy: [] });
        musicAssets.get(row.music)!.usedBy.push(row.id);
      }
      if (row.referenceVideo) {
        if (!referenceAssets.has(row.referenceVideo))
          referenceAssets.set(row.referenceVideo, {
            title: row.referenceVideoTitle,
            usedBy: [],
          });
        referenceAssets.get(row.referenceVideo)!.usedBy.push(row.id);
      }
    });
    return { imageAssets, musicAssets, referenceAssets };
  }, [scriptData]);

  const handleSelect = (type: AssetType, key: string) => {
    const newSelection = new Map(selectedAssets);
    if (!newSelection.has(type)) {
      newSelection.set(type, new Set());
    }
    const typeSet = newSelection.get(type)!;
    if (typeSet.has(key)) {
      typeSet.delete(key);
    } else {
      typeSet.add(key);
    }
    setSelectedAssets(newSelection);
  };

  const handleSelectAll = (type: AssetType, keys: string[]) => {
    const newSelection = new Map(selectedAssets);
    const currentTypeSet = newSelection.get(type) || new Set();

    if (currentTypeSet.size < keys.length) {
      newSelection.set(type, new Set(keys));
    } else {
      newSelection.set(type, new Set());
    }
    setSelectedAssets(newSelection);
  };

  const handleRemoveFromProject = () => {
    onScriptChange(null, "removeAssets", selectedAssets);
    setSelectedAssets(new Map());
  };

  const handleDeleteUnused = (type: AssetType) => {
    alert(
      "This feature would delete unused assets from a central library. Functionality not fully implemented in this demo."
    );
    setSelectedAssets(new Map());
  };

  const renderAssetSection = (
    title: string,
    icon: React.ReactNode,
    assetMap: Map<string, any>,
    type: AssetType
  ) => {
    const keys = Array.from(assetMap.keys());
    const selectedCount = selectedAssets.get(type)?.size || 0;

    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            {icon}
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <span className="text-sm text-gray-400">({keys.length})</span>
          </div>
          <div className="flex items-center space-x-4">
            {selectedCount > 0 && (
              <button
                onClick={handleRemoveFromProject}
                className="text-sm text-yellow-400 hover:text-yellow-300 flex items-center space-x-2"
              >
                <Trash2 size={16} />
                <span>Remove from Project ({selectedCount})</span>
              </button>
            )}
            <button
              onClick={() => handleSelectAll(type, keys)}
              className="text-sm text-gray-300 hover:text-white"
            >
              {selectedCount > 0 && selectedCount === keys.length
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>
        </div>
        {keys.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No assets of this type in the project.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {keys.map((key) => {
              const isSelected = selectedAssets.get(type)?.has(key) || false;
              const info = assetMap.get(key);
              const usedBy = Array.isArray(info) ? info : info.usedBy;
              const assetTitle = Array.isArray(info) ? key : info.title;

              return (
                <div
                  key={key}
                  className={`border rounded-lg overflow-hidden transition-all ${
                    isSelected
                      ? "border-amber-500 ring-2 ring-amber-500/50"
                      : "border-gray-700"
                  }`}
                >
                  <div className="p-3 bg-gray-900/50 flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelect(type, key)}
                      className="mt-1 w-4 h-4 text-amber-600 bg-gray-700 border-gray-600 rounded focus:ring-amber-500"
                    />
                    {type === "image" ? (
                      <div className="w-16 h-16 bg-black rounded-md flex-shrink-0">
                        {imageUrlCache[key] ? (
                          <img
                            src={imageUrlCache[key] || ""}
                            alt={key}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-red-500">
                            ?
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => onPlayMusic(key)}
                        className="p-3 bg-gray-700 rounded-md hover:bg-gray-600"
                      >
                        {type === "music" ? (
                          <Music className="text-amber-400" />
                        ) : (
                          <Video className="text-blue-400" />
                        )}
                      </button>
                    )}
                    <div className="flex-grow min-w-0">
                      <p
                        className="text-sm font-semibold text-white truncate"
                        title={assetTitle}
                      >
                        {assetTitle}
                      </p>
                      <p className="text-xs text-gray-400 truncate" title={key}>
                        {type === "image" ? key : "Link"}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-800">
                    <p className="text-xs text-gray-500 mb-1">
                      Used in segments:
                    </p>
                    {usedBy.length > 0 ? (
                      <p className="text-sm text-gray-300 truncate">
                        {usedBy
                          .map(
                            (id: string) =>
                              generateSegmentNumbers(scriptData)[id] || "?"
                          )
                          .join(", ")}
                      </p>
                    ) : (
                      <p className="text-sm text-yellow-400">Unused</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="flex justify-end mt-4 space-x-3">
          <button
            onClick={() => handleDeleteUnused(type)}
            className="text-sm text-gray-400 hover:text-white"
          >
            Delete Unused
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {renderAssetSection(
        "Images",
        <ImageIcon className="text-gray-400" />,
        assets.imageAssets,
        "image"
      )}
      {renderAssetSection(
        "Music",
        <Music className="text-amber-400" />,
        assets.musicAssets,
        "music"
      )}
      {renderAssetSection(
        "Reference Videos",
        <Video className="text-blue-400" />,
        assets.referenceAssets,
        "reference"
      )}
    </div>
  );
};

export default AssetView;
