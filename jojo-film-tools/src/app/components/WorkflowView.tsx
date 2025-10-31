import React from "react";

export const WorkflowView: React.FC = () => {
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
        .sub-stage { border-left: 2px solid #555; padding-left: 1.5rem; margin-top: 1.5rem; }
        .sub-stage-title { font-size: 1.2rem; font-weight: 600; margin-bottom: 1rem; color: #e0e0e0; }
    `;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
      <style>{workflowStyles}</style>
      <div className="p-6">
        <header className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            專業單人專案工作流程 (修訂版)
          </h1>
          <p className="text-lg text-gray-400 mt-2">
            一個為獨立創作者設計的、注重視覺開發的生產管線。
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
                  d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
                />
              </svg>
              1. 構思與藍圖 (Concept & Blueprint)
            </h2>
            <div className="card-grid">
              <div className="card" style={{ borderColor: "#3b82f6" }}>
                <h3 className="card-title">核心想法 & 腳本</h3>
                <p className="card-description">
                  確定故事的核心和文字內容。
                </p>
              </div>
              <div className="card" style={{ borderColor: "#3b82f6" }}>
                <h3 className="card-title">參考與氛圍</h3>
                <p className="card-description">
                  收集視覺風格、色彩和音樂/音效的參考，確立專案的整體基調。
                </p>
              </div>
              <div className="card" style={{ borderColor: "#3b82f6" }}>
                <h3 className="card-title">故事板 & 指標分析</h3>
                <p className="card-description">
                  將腳本視覺化，拆解成具體的鏡頭。
                </p>
              </div>
            </div>
          </div>
          <div className="arrow">↓</div>
          <div className="stage">
            <h2 className="stage-title" style={{ color: "#f97316" }}>
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
                  d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
                />
              </svg>
              2. 視覺開發與鏡頭製作 (Look Dev & Shot Production)
            </h2>
            <div className="sub-stage">
              <h3 className="sub-stage-title">
                1. 場景搭建與視覺基調 (Scene Setup & Look Dev)
              </h3>
              <div className="card-grid">
                <div className="card" style={{ borderColor: "#f97316" }}>
                  <h3 className="card-title">初步資產與佈景</h3>
                  <p className="card-description">
                    獲取或製作「及格」水平的關鍵資產。
                  </p>
                </div>
                <div className="card" style={{ borderColor: "#f97316" }}>
                  <h3 className="card-title">Look Dev 測試</h3>
                  <p className="card-description">
                    建立關鍵鏡頭來驗證光影與質感。
                  </p>
                </div>
                <div className="card" style={{ borderColor: "#f97316" }}>
                  <h3 className="card-title">技術規範</h3>
                  <p className="card-description">
                    制定統一的分辨率、色彩和檔案命名規則。
                  </p>
                </div>
              </div>
            </div>
            <div className="arrow">↓</div>
            <div className="sub-stage">
              <h3 className="sub-stage-title">2. 鏡頭量產 (Shot Production)</h3>
              <div className="card-grid">
                <div className="card" style={{ borderColor: "#eab308" }}>
                  <h3 className="card-title">完善資產與細節</h3>
                  <p className="card-description">
                    基於已確立的風格完善所有場景細節。
                  </p>
                </div>
                <div className="card" style={{ borderColor: "#eab308" }}>
                  <h3 className="card-title">動畫與攝影機</h3>
                  <p className="card-description">
                    製作角色、物體和攝影機的動態。
                  </p>
                </div>
                <div className="card" style={{ borderColor: "#eab308" }}>
                  <h3 className="card-title">最終光影與特效</h3>
                  <p className="card-description">
                    為所有鏡頭打光並添加特效。
                  </p>
                </div>
                <div className="card" style={{ borderColor: "#eab308" }}>
                  <h3 className="card-title">完整渲染</h3>
                  <p className="card-description">輸出整個鏡頭的圖像序列。</p>
                </div>
              </div>
            </div>
            <div className="arrow">↓</div>
            <div className="sub-stage">
              <h3 className="sub-stage-title">
                3. 預覽與音效 (Preview & Sound)
              </h3>
              <div className="card-grid">
                <div className="card" style={{ borderColor: "#84cc16" }}>
                  <h3 className="card-title">檢查節奏</h3>
                  <p className="card-description">
                    將渲染序列快速合成，並配上臨時音效或音樂，以檢查節奏和整體感覺。
                  </p>
                </div>
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
              3. 最終整合 (Final Polish)
            </h2>
            <div className="card-grid">
              <div className="card" style={{ borderColor: "#ec4899" }}>
                <h3 className="card-title">最終剪輯 & 調色</h3>
                <p className="card-description">
                  將所有渲染好的片段組合起來，統一整體色調。
                </p>
              </div>
              <div className="card" style={{ borderColor: "#ec4899" }}>
                <h3 className="card-title">音效設計 & 混音</h3>
                <p className="card-description">
                  完成所有聲音的細節和混合。
                </p>
              </div>
              <div className="card" style={{ borderColor: "#ec4899" }}>
                <h3 className="card-title">最終輸出</h3>
                <p className="card-description">匯出最終的影片成品。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowView;
