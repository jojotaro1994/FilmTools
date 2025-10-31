import React, { useState, useRef, useEffect, useCallback } from "react";
import { Music, Video } from "lucide-react";

type EditableSegmentProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isHeading?: boolean;
};

export const EditableSegment: React.FC<EditableSegmentProps> = ({
  value,
  onChange,
  placeholder = "...",
  isHeading = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const autoResizeTextarea = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();
      textareaRef.current?.select();
      autoResizeTextarea();
    }
  }, [isEditing, autoResizeTextarea]);

  const handleBlur = () => {
    setIsEditing(false);
    onChange(text);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
        className={`bg-gray-600 w-full rounded px-2 py-1.5 text-sm text-white placeholder-gray-400 resize-none overflow-hidden ${
          isHeading ? "text-center text-lg font-bold text-amber-400" : ""
        }`}
        placeholder={placeholder}
        rows={1}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer w-full hover:bg-gray-700/50 rounded px-2 py-1.5 min-h-[34px] whitespace-pre-wrap ${
        isHeading ? "text-center text-lg font-bold text-amber-400" : ""
      }`}
    >
      {value || <span className="text-gray-500">{placeholder}</span>}
    </div>
  );
};

type EditableMediaProps = {
  title: string;
  link: string;
  onSave: (title: string, link: string) => void;
  type: "music" | "reference";
};

export const EditableMedia: React.FC<EditableMediaProps> = ({
  title,
  link,
  onSave,
  type,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const [tempLink, setTempLink] = useState(link);
  const popupRef = useRef<HTMLDivElement | null>(null);

  const isMusic = type === "music";
  const colorClass = isMusic ? "text-amber-400" : "text-blue-400";
  const IconComponent = isMusic ? Music : Video;

  useEffect(() => {
    setTempTitle(title);
    setTempLink(link);
  }, [title, link]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node))
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
        <IconComponent size={14} className={`${colorClass} flex-shrink-0`} />
        <div className="flex-grow truncate">
          <span className={`${colorClass} text-sm font-medium`}>
            {title || (isMusic ? "Untitled Music" : "Untitled Reference")}
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
                {isMusic ? "Music Title" : "Reference Title"}
              </label>
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                placeholder={
                  isMusic ? "e.g., Drift sound effect" : "e.g., Initial D Ref"
                }
                className="bg-gray-700 w-full rounded px-2 py-1.5 text-sm text-white placeholder-gray-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                {isMusic ? "Music Link" : "Reference Link"}
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

type EditableTextFieldProps = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
};

export const EditableTextField: React.FC<EditableTextFieldProps> = ({
  value = "",
  onChange,
  placeholder = "Click to edit",
  className = "",
  multiline = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      const el = inputRef.current;
      if (el) {
        el.focus();
        if ("setSelectionRange" in el) {
          (el as HTMLInputElement).setSelectionRange(0, el.value.length);
        }
      }
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    onChange(tempValue.trim());
  };

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.MutableRefObject<HTMLTextAreaElement | null>}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleBlur}
          className={`w-full bg-gray-700 text-sm text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y min-h-[40px] ${className}`}
          placeholder={placeholder}
          rows={Math.max(2, tempValue.split("\\n").length)}
        />
      );
    }
    return (
      <input
        ref={inputRef as React.MutableRefObject<HTMLInputElement | null>}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleBlur}
        className={`w-full bg-gray-700 text-sm text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500 ${className}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div
      className={`w-full text-sm text-gray-200 px-2 py-1 rounded cursor-pointer hover:bg-gray-700/50 whitespace-pre-wrap ${className}`}
      onClick={() => setIsEditing(true)}
    >
      {value ? (
        <span className="block">{value}</span>
      ) : (
        <span className="text-gray-500">{placeholder}</span>
      )}
    </div>
  );
};

type EditableNumberFieldProps = {
  value?: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
};

export const EditableNumberField: React.FC<EditableNumberFieldProps> = ({
  value = null,
  onChange,
  placeholder = "0",
  min,
  max,
  step = 1,
  className = "",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(
    value !== null && value !== undefined ? String(value) : ""
  );
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setTempValue(value !== null && value !== undefined ? String(value) : "");
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    const trimmed = tempValue.trim();
    if (trimmed === "") {
      onChange(null);
      return;
    }
    const parsed = Number(trimmed);
    if (Number.isNaN(parsed)) {
      setTempValue(value !== null && value !== undefined ? String(value) : "");
      return;
    }
    let next = parsed;
    if (typeof min === "number") next = Math.max(min, next);
    if (typeof max === "number") next = Math.min(max, next);
    onChange(next);
  };

  return isEditing ? (
    <input
      ref={inputRef}
      type="number"
      value={tempValue}
      onChange={(e) => setTempValue(e.target.value)}
      onBlur={handleBlur}
      step={step}
      min={min}
      max={max}
      className={`w-full bg-gray-700 text-sm text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500 ${className}`}
      placeholder={placeholder}
    />
  ) : (
    <div
      className={`w-full text-sm text-gray-200 px-2 py-1 rounded cursor-pointer hover:bg-gray-700/50 ${className}`}
      onClick={() => setIsEditing(true)}
    >
      {value !== null && value !== undefined ? (
        <span>{value}</span>
      ) : (
        <span className="text-gray-500">{placeholder}</span>
      )}
    </div>
  );
};
