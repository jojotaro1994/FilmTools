import React from "react";
import {
  FileUp,
  Plus,
  Trash2,
  ArrowRight,
  CornerDownLeft,
  Bookmark,
  X,
} from "lucide-react";
import { generateSegmentNumbers } from "../utils/data";
import { EditableSegment } from "./EditableControls";

type ScriptRow = {
  id: string;
  level: number;
  segment: string;
  image: string | null;
  isChapterHeading?: boolean;
};

type TableViewProps = {
  scriptData: ScriptRow[];
  onScriptChange: (
    id: string | null,
    action: string,
    value?: any,
    value2?: any
  ) => void;
  onUploadClick: (id: string) => void;
  onImageClick: (url: string | null) => void;
  imageUrlCache: Record<string, string | null>;
};

const TableView: React.FC<TableViewProps> = ({
  scriptData,
  onScriptChange,
  onUploadClick,
  onImageClick,
  imageUrlCache,
}) => {
  if (scriptData.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center space-y-4">
        <p className="text-sm text-gray-400">
          当前没有脚本段落，请先添加一个片段开始规划。
        </p>
        <button
          onClick={() => onScriptChange(null, "add")}
          className="px-4 py-2 bg-amber-500 text-black font-semibold rounded-md hover:bg-amber-400"
        >
          + 添加第一个片段
        </button>
      </div>
    );
  }

  const segmentNumbers = generateSegmentNumbers(scriptData);

  const renderHeadingRow = (row: ScriptRow, index: number) => (
    <tr key={row.id} data-id={row.id} className="group bg-gray-800/50">
      <td colSpan={2} className="px-6 py-3">
        <div className="flex items-start gap-3">
          <span
            className="font-mono text-gray-500 flex-shrink-0"
            style={{ paddingLeft: `${row.level * 1.5}rem` }}
          >
            {segmentNumbers[row.id]}
          </span>
          <div className="flex-grow min-w-0">
            <EditableSegment
              value={row.segment}
              onChange={(newText) => onScriptChange(row.id, "segment", newText)}
              placeholder="输入章节标题..."
              isHeading={true}
            />
          </div>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={() => onScriptChange(row.id, "toggleChapterHeading")}
              className="p-1 hover:bg-gray-600 rounded text-amber-400"
              title="切换为镜头片段"
            >
              <Bookmark size={16} />
            </button>
            <button
              onClick={() => onScriptChange(row.id, "add")}
              className="p-1 hover:bg-gray-600 rounded"
              title="在下方添加新片段"
            >
              <Plus size={16} />
            </button>
            <button
              disabled={index === 0}
              onClick={() => onScriptChange(row.id, "indent")}
              className="p-1 hover:bg-gray-600 rounded disabled:opacity-20 disabled:cursor-not-allowed"
              title="增加层级"
            >
              <ArrowRight size={16} />
            </button>
            <button
              disabled={row.level === 0}
              onClick={() => onScriptChange(row.id, "outdent")}
              className="p-1 hover:bg-gray-600 rounded disabled:opacity-20 disabled:cursor-not-allowed"
              title="减少层级"
            >
              <CornerDownLeft size={16} />
            </button>
            <button
              onClick={() => onScriptChange(row.id, "delete")}
              className="p-1 hover:bg-gray-600 rounded text-red-400"
              title="删除此片段"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </td>
    </tr>
  );

  const renderRow = (row: ScriptRow, index: number) => {
    if (row.isChapterHeading) {
      return renderHeadingRow(row, index);
    }

    return (
      <tr
        key={row.id}
        data-id={row.id}
        className="group hover:bg-gray-700/50 transition-colors"
      >
        <td className="px-6 py-4 text-gray-300 align-top min-w-[520px]">
          <div className="flex items-start gap-3">
            <span
              className="font-mono text-gray-500 flex-shrink-0"
              style={{ paddingLeft: `${row.level * 1.5}rem` }}
            >
              {segmentNumbers[row.id]}
            </span>
            <div className="flex-grow min-w-0">
              <EditableSegment
                value={row.segment}
                onChange={(newText) => onScriptChange(row.id, "segment", newText)}
                placeholder="输入脚本内容..."
              />
            </div>
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={() => onScriptChange(row.id, "toggleChapterHeading")}
                className="p-1 text-gray-400 hover:bg-gray-600 hover:text-white rounded"
                title="标记为章节标题"
              >
                <Bookmark size={16} />
              </button>
              <button
                onClick={() => onScriptChange(row.id, "add")}
                className="p-1 hover:bg-gray-600 rounded"
                title="在下方添加新片段"
              >
                <Plus size={16} />
              </button>
              <button
                disabled={index === 0}
                onClick={() => onScriptChange(row.id, "indent")}
                className="p-1 hover:bg-gray-600 rounded disabled:opacity-20 disabled:cursor-not-allowed"
                title="增加层级"
              >
                <ArrowRight size={16} />
              </button>
              <button
                disabled={row.level === 0}
                onClick={() => onScriptChange(row.id, "outdent")}
                className="p-1 hover:bg-gray-600 rounded disabled:opacity-20 disabled:cursor-not-allowed"
                title="减少层级"
              >
                <CornerDownLeft size={16} />
              </button>
              <button
                onClick={() => onScriptChange(row.id, "delete")}
                className="p-1 hover:bg-gray-600 rounded text-red-400"
                title="删除此片段"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 w-40 align-top">
          <div className="w-24 h-16 relative group/image bg-gray-900/50 rounded-md">
            {row.image && imageUrlCache[row.image] ? (
              <>
                <img
                  src={imageUrlCache[row.image] || ""}
                  alt={row.image || ""}
                  className="w-full h-full object-cover rounded-md cursor-pointer"
                  onClick={() => onImageClick(imageUrlCache[row.image] || null)}
                />
                <button
                  onClick={() => onScriptChange(row.id, "image", null)}
                  className="absolute -top-1.5 -right-1.5 p-0.5 bg-gray-900/80 rounded-full text-white hover:bg-red-600 transition-colors opacity-0 group-hover/image:opacity-100"
                  title="移除图片"
                >
                  <X size={14} />
                </button>
              </>
            ) : row.image ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-red-400 text-center p-1">
                未找到
              </div>
            ) : (
              <button
                onClick={() => onUploadClick(row.id)}
                className="w-full h-full border-2 border-dashed border-gray-600 rounded-md flex flex-col items-center justify-center text-gray-500 hover:bg-gray-700 hover:text-gray-400"
              >
                <FileUp size={20} />
                <span className="text-xs mt-1">上传</span>
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-sm text-left table-fixed">
        <thead className="bg-gray-800 border-b border-gray-700">
          <tr>
            <th className="px-6 py-3 font-medium text-gray-300 w-[520px]">
              Script Segment
            </th>
            <th className="px-6 py-3 font-medium text-gray-300 w-40">Image</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {scriptData.map((row, index) => renderRow(row, index))}
        </tbody>
      </table>
    </div>
  );
};

export default TableView;
