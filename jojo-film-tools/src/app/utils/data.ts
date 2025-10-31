export const createInitialData = () => ({
  projectSettings: {
    // Display only — actual access is handled via directory handles.
    imageFolderName: "",
  },
  scriptData: [],
});

export const generateSegmentNumbers = (scriptData: any[]) => {
  const numbers: Record<string, string> = {};
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

export const SHOT_SIZES = [
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

export const SHOT_TYPES = [
  { value: "EL", label: "EL: Eye Level" },
  { value: "HA", label: "HA: High Angle" },
  { value: "LA", label: "LA: Low Angle" },
  { value: "POV", label: "POV: Point of View" },
  { value: "Top", label: "Bird's Eye View" },
  { value: "Dutch", label: "Dutch Angle" },
  { value: "Ground", label: "Ground Level" },
  { value: "ES", label: "ES: Establishing Shot" },
];

export const CAMERA_MOTIONS = [
  { value: "Pan", label: "Pan / 摇摄" },
  { value: "Tilt", label: "Tilt / 俯仰" },
  { value: "Dolly In", label: "Dolly In / 推镜" },
  { value: "Dolly Out", label: "Dolly Out / 拉镜" },
  { value: "Tracking", label: "Tracking / 平移" },
  { value: "Crane", label: "Crane / 升降" },
  { value: "Arc Shot", label: "Arc Shot / 弧形环绕" },
  { value: "Steadicam", label: "Steadicam / 稳定移动" },
  { value: "Static", label: "Static / 静止镜头" },
  { value: "Zoom", label: "Zoom / 变焦" },
  { value: "Dolly Zoom", label: "Dolly Zoom / 推拉焦" },
  { value: "Handheld", label: "Handheld / 手持" },
  { value: "POV Shot", label: "POV Shot / 主观镜头" },
  { value: "Aerial", label: "Aerial / 空拍" },
  { value: "Whip Pan", label: "Whip Pan / 快速摇镜" },
  { value: "Time-lapse", label: "Time-lapse / 延时" },
  { value: "Creeping Dolly", label: "Creeping Dolly / 慢速推进" },
];
