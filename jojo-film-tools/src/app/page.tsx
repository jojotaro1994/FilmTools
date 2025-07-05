'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FileUp, Settings, Copy, X, Plus, Trash2, LayoutGrid, List, Crop, Upload, Download, RefreshCw, AlertTriangle, CornerDownLeft, ArrowRight, Workflow as WorkflowIcon } from 'lucide-react';

// --- Initial Data & Helpers ---
const createInitialData = () => ({
    emotionColumns: [
        { key: 'interest', label: 'Interest', color: '#ec4899' },
        { key: 'tension', label: 'Tension', color: '#22d3ee' },
        { key: 'excitement', label: 'Excitement', color: '#facc15' },
        { key: 'sadness', label: 'Sadness', color: '#a78bfa' },
        { key: 'boredom', label: 'Boredom', color: '#38bdf8' }
    ],
    scriptData: [
      { id: crypto.randomUUID(), level: 0, segment: '1. INT. COFFEE SHOP - DAY', image: null, interest: 7, tension: 2, excitement: 4, sadness: 1, boredom: 0 },
      { id: crypto.randomUUID(), level: 1, segment: 'A YOUNG WOMAN, JANE, sips her latte.', image: null, interest: 8, tension: 5, excitement: 3, sadness: 2, boredom: 0 },
      { id: crypto.randomUUID(), level: 0, segment: '2. A MAN, MARK, enters.', image: null, interest: 8, tension: 6, excitement: 6, sadness: 1, boredom: 0 },
    ],
    storyboardData: [
        { id: crypto.randomUUID(), segment: 'Opening shot of the coffee shop.', image: null },
        { id: crypto.randomUUID(), segment: 'Close up on Jane, looking nervous.', image: null },
    ]
});

const getRandomColor = () => `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;

const generateSegmentNumbers = (scriptData) => {
    const numbers = {};
    const counters = [0, 0, 0, 0, 0, 0]; // Supports up to level 5 indentation
    scriptData.forEach(row => {
        const level = row.level || 0;
        counters[level]++;
        for (let i = level + 1; i < counters.length; i++) { counters[i] = 0; }
        numbers[row.id] = counters.slice(0, level + 1).join('.');
    });
    return numbers;
};


// --- Reusable Components ---
const EditableSegment = ({ value, onChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(value);
    const inputRef = useRef(null);
    useEffect(() => { if (isEditing) { inputRef.current?.focus(); inputRef.current?.select(); } }, [isEditing]);
    const handleBlur = () => { setIsEditing(false); onChange(text); };
    if (isEditing) { return <input ref={inputRef} type="text" value={text} onChange={e => setText(e.target.value)} onBlur={handleBlur} onKeyDown={e => e.key === 'Enter' && handleBlur()} className="bg-gray-600 w-full rounded px-1 -mx-1" />; }
    return <div onClick={() => setIsEditing(true)} className="cursor-pointer w-full hover:bg-gray-700/50 rounded px-1 -mx-1">{value}</div>;
};

const EmotionGraph = ({ value, color, onValueChange }) => {
  const graphRef = useRef(null);
  const handleInteraction = useCallback((e) => {
    if (!graphRef.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const { left, width } = graphRef.current.getBoundingClientRect();
    const newPercentage = Math.max(0, Math.min(100, ((clientX - left) / width) * 100));
    onValueChange(Math.round(newPercentage / 10));
  }, [onValueChange]);
  
  const percentage = value * 10;
  return (
    <div className="w-full h-10 flex items-center relative group cursor-pointer" ref={graphRef} onMouseDown={handleInteraction} onTouchStart={handleInteraction}>
      <div className="w-full h-0.5 bg-gray-600 relative">
        <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-lg" style={{ left: `calc(${percentage}% - 6px)`, backgroundColor: color, zIndex: 10 }}>
             <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{value}</div>
        </div>
      </div>
    </div>
  );
};


// --- Modals & Popups ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => { if (!isOpen) return null; return (<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}><div className="bg-gray-800 rounded-lg shadow-xl p-6 relative w-full max-w-md" onClick={(e) => e.stopPropagation()}><div className="flex items-start"><AlertTriangle className="text-red-500 mr-4 flex-shrink-0" size={24} /><div className="flex-grow"><h2 className="text-xl font-semibold text-white">{title}</h2><div className="text-gray-400 mt-2">{children}</div></div></div><div className="flex justify-end space-x-4 mt-6"><button onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-700 text-gray-200 hover:bg-gray-600">Cancel</button><button onClick={onConfirm} className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700">Confirm</button></div></div></div>); };
const ImageModal = ({ imageUrl, onClose }) => { if (!imageUrl) return null; return (<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}><div className="bg-gray-900 rounded-lg shadow-xl p-4 relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}><button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white" aria-label="Close image view"><X size={24} /></button><img src={imageUrl} alt="Full size view" className="w-full h-full object-contain rounded-md" style={{ maxHeight: 'calc(90vh - 4rem)' }} /></div></div>); };
const EmotionSettingsPopup = ({ emotions, onAddEmotion, onDeleteEmotion }) => { 
    const [newEmotionName, setNewEmotionName] = useState('');
    const handleAdd = () => { if (newEmotionName.trim()) { onAddEmotion(newEmotionName.trim()); setNewEmotionName(''); } };
    return (
        <div className="absolute top-full mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-4 z-20">
            <div className="flex items-start mb-4">
                <Settings size={20} className="text-amber-400 mr-3 mt-1 flex-shrink-0"/>
                <div>
                    <h3 className="font-semibold text-white">Emotions to Analyze</h3>
                    <p className="text-xs text-gray-400">Add or remove emotions to track.</p>
                </div>
            </div>
            <div className="my-4 space-y-2">
                <div className="flex flex-wrap gap-2">
                    {emotions.map(emotion => (
                        <div key={emotion.key} className="flex items-center bg-gray-700 rounded-full pl-3 pr-1 py-1 text-sm">
                            <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: emotion.color }}></span>
                            <span className="text-gray-200">{emotion.label}</span>
                            <button onClick={() => onDeleteEmotion(emotion.key)} className="ml-2 text-gray-500 hover:text-white"><X size={16}/></button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <input type="text" value={newEmotionName} onChange={(e) => setNewEmotionName(e.target.value)} placeholder="e.g. Joy, Fear" className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"/>
                <button onClick={handleAdd} className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-1.5 px-3 rounded-md flex items-center space-x-2 text-sm"><Plus size={16}/><span>Add</span></button>
            </div>
        </div>
    );
};
const AspectRatioModal = ({ isOpen, onClose, currentRatio, onSetRatio }) => { if (!isOpen) return null; const ratios = [{ key: '16/9', label: 'Wide (16:9)', description: 'Standard widescreen.' },{ key: '1/1', label: 'Square (1:1)', description: 'Square aspect ratio.' },{ key: '9/16', label: 'Vertical (9:16)', description: 'Tall, vertical aspect ratio.' },]; return (<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}><div className="bg-gray-800 rounded-lg shadow-xl p-6 relative w-full max-w-md" onClick={(e) => e.stopPropagation()}><div className="flex items-start mb-4"><Crop size={24} className="text-amber-400 mr-3 mt-1"/><div><h2 className="text-xl font-semibold text-white">Aspect Ratio Settings</h2><p className="text-gray-400 mt-1">Choose the aspect ratio for image panels.</p></div><button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white" aria-label="Close"><X size={24} /></button></div><div className="space-y-2">{ratios.map(ratio => (<button key={ratio.key} onClick={() => { onSetRatio(ratio.key); onClose(); }} className={`w-full text-left p-4 rounded-lg transition-colors ${currentRatio === ratio.key ? 'bg-amber-500/20 border border-amber-500' : 'bg-gray-700/50 hover:bg-gray-700'}`}><p className={`font-semibold ${currentRatio === ratio.key ? 'text-amber-400' : 'text-white'}`}>{ratio.label}</p><p className="text-sm text-gray-400">{ratio.description}</p></button>))}</div></div></div>); };


// --- View Components ---

const TableView = ({ scriptData, emotionColumns, showOverlay, onScriptChange, onEmotionChange, onUploadClick, onImageClick }) => {
    const tableRef = useRef(null);
    const segmentNumbers = generateSegmentNumbers(scriptData);

    const FullOverlayGraph = () => {
        const [points, setPoints] = useState({});
        useEffect(() => {
            if (!tableRef.current) return;
            const newPoints = {};
            emotionColumns.forEach(col => newPoints[col.key] = []);
            const rows = tableRef.current.querySelectorAll('tbody tr');
            rows.forEach((rowEl, rowIndex) => {
                const rowData = scriptData[rowIndex];
                if (!rowData) return;
                emotionColumns.forEach((col, colIndex) => {
                    const cell = rowEl.cells[colIndex + 2];
                    if (cell) {
                        const value = rowData[col.key] || 0;
                        const y = (rowEl.offsetTop + rowEl.offsetHeight / 2);
                        const x = cell.offsetLeft + cell.offsetWidth * (value / 10);
                        newPoints[col.key].push({ x, y });
                    }
                });
            });
            setPoints(newPoints);
        }, [scriptData, emotionColumns]);

        return (
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" >
                {emotionColumns.map(col => (
                    <g key={`overlay-group-${col.key}`}>
                        <polyline points={(points[col.key] || []).map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={col.color} strokeWidth="2" />
                        {(points[col.key] || []).map((p, i) => ( <circle key={`overlay-point-${col.key}-${i}`} cx={p.x} cy={p.y} r="4" fill={col.color} /> ))}
                    </g>
                ))}
            </svg>
        );
    };

    return (
        <div className="relative">
            {showOverlay && <FullOverlayGraph />}
            <div className="overflow-x-auto" ref={tableRef}>
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-800 border-b border-gray-700">
                        <tr>
                            <th className="px-6 py-3 font-medium text-gray-300 w-2/5">Script Segment</th>
                            <th className="px-6 py-3 font-medium text-gray-300">Image</th>
                            {emotionColumns.map(col => ( <th key={col.key} className="px-6 py-3 font-medium text-gray-300">{col.label} <span className="text-gray-500">(0-10)</span></th> ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {scriptData.map((row, index) => (
                            <tr key={row.id} data-id={row.id} className="group hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 text-gray-300">
                                    <div className="flex items-start">
                                        <span 
                                            className="font-mono text-gray-500 mr-4 flex-shrink-0 whitespace-nowrap" 
                                            style={{ paddingLeft: `${row.level * 1}rem` }}
                                        >
                                            {segmentNumbers[row.id]}
                                        </span>
                                        <div className="flex-grow min-w-0">
                                            <EditableSegment 
                                                value={row.segment} 
                                                onChange={newText => onScriptChange(row.id, 'segment', newText)} 
                                            />
                                        </div>
                                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4 flex-shrink-0">
                                            <button onClick={() => onScriptChange(row.id, 'add')} className="p-1 hover:bg-gray-600 rounded" title="Add Row Below"><Plus size={16} /></button>
                                            <button disabled={index === 0} onClick={() => onScriptChange(row.id, 'indent')} className="p-1 hover:bg-gray-600 rounded disabled:opacity-20 disabled:cursor-not-allowed" title="Indent"><ArrowRight size={16} /></button>
                                            <button disabled={row.level === 0} onClick={() => onScriptChange(row.id, 'outdent')} className="p-1 hover:bg-gray-600 rounded disabled:opacity-20 disabled:cursor-not-allowed" title="Outdent"><CornerDownLeft size={16} /></button>
                                            <button onClick={() => onScriptChange(row.id, 'delete')} className="p-1 hover:bg-gray-600 rounded text-red-400" title="Delete Row"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="w-20 h-16">{row.image ? <img src={row.image} alt="Thumbnail" className="w-full h-full object-cover rounded-md cursor-pointer" onClick={() => onImageClick(row.image)} /> : <button onClick={() => onUploadClick(row.id, 'script')} className="w-full h-full border-2 border-dashed border-gray-600 rounded-md flex flex-col items-center justify-center text-gray-500 hover:bg-gray-700 hover:text-gray-400"><FileUp size={20} /><span className="text-xs mt-1">Upload</span></button>}</div>
                                </td>
                                {emotionColumns.map(col => (
                                    <td key={col.key} className="px-6 py-4">
                                        <div className={showOverlay ? 'opacity-0' : 'opacity-100 transition-opacity'}>
                                            <EmotionGraph value={row[col.key] || 0} color={col.color} onValueChange={(newValue) => onEmotionChange(row.id, col.key, newValue)} />
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const StoryboardView = ({ storyboardData, onStoryboardChange, onUploadClick, onImageClick }) => {
    const [layout, setLayout] = useState('grid');
    const [aspectRatio, setAspectRatio] = useState('16/9');
    const [isRatioModalOpen, setIsRatioModalOpen] = useState(false);
    const aspectStyle = { aspectRatio };
    const StoryboardItem = ({ item }) => (<div className="bg-gray-800 rounded-lg overflow-hidden flex flex-col group relative"><button onClick={() => item.image ? onImageClick(item.image) : onUploadClick(item.id, 'storyboard')} className="w-full bg-gray-900/50 border-b border-gray-700 flex items-center justify-center" style={aspectStyle}>{item.image ? <img src={item.image} alt={`Storyboard for ${item.segment}`} className="w-full h-full object-cover" /> : <div className="text-gray-500 flex flex-col items-center"><FileUp size={32} /><p className="text-sm mt-2">Click to upload</p></div>}</button><div className="p-4 text-sm text-gray-300"><EditableSegment value={item.segment} onChange={(newText) => onStoryboardChange(item.id, 'segment', newText)} /></div><div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => onStoryboardChange(item.id, 'delete')} className="p-1 bg-gray-900/50 hover:bg-gray-900 rounded-full text-red-400"><Trash2 size={16} /></button></div></div>);
    return (<div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden"><div className="p-6 border-b border-gray-700"><h2 className="text-xl font-semibold text-white">Storyboard View</h2><p className="text-gray-400 mt-1">Visually plan your shots and script. Choose your preferred layout and aspect ratio below.</p></div><div className="p-4 flex items-center justify-between bg-gray-800/50 border-b border-gray-700"><div className="flex items-center space-x-4"><div className="flex items-center bg-gray-700 p-1 rounded-lg"><button onClick={() => setLayout('grid')} className={`px-3 py-1.5 text-sm rounded-md flex items-center space-x-2 ${layout === 'grid' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:bg-gray-600/50'}`}><LayoutGrid size={16} /><span>Grid View</span></button><button onClick={() => setLayout('panel')} className={`px-3 py-1.5 text-sm rounded-md flex items-center space-x-2 ${layout === 'panel' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:bg-gray-600/50'}`}><List size={16} /><span>Panel List View</span></button></div><button onClick={() => setIsRatioModalOpen(true)} className="px-3 py-1.5 text-sm rounded-lg flex items-center space-x-2 bg-gray-700 text-gray-300 hover:bg-gray-600/50"><Crop size={16} /><span>Aspect Ratio</span></button></div><button onClick={() => onStoryboardChange(null, 'add')} className="px-3 py-1.5 text-sm rounded-lg flex items-center space-x-2 bg-amber-600 text-white hover:bg-amber-700"><Plus size={16} /><span>Add Panel</span></button></div><div className="p-6">{layout === 'grid' ? <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{storyboardData.map(item => <StoryboardItem key={item.id} item={item} />)}</div> : <div className="space-y-6">{storyboardData.map(item => (<div key={item.id} className="bg-gray-800 rounded-lg overflow-hidden flex items-stretch border border-gray-700 group relative"><div className="w-1/3 flex-shrink-0"><button onClick={() => item.image ? onImageClick(item.image) : onUploadClick(item.id, 'storyboard')} className="w-full h-full bg-gray-900/50 flex items-center justify-center" style={aspectStyle}>{item.image ? <img src={item.image} alt={`Storyboard for ${item.segment}`} className="w-full h-full object-cover" /> : <div className="text-gray-500 flex flex-col items-center p-4 text-center"><FileUp size={24} /><p className="text-xs mt-2">Click to upload</p></div>}</button></div><div className="p-4 text-sm text-gray-300 flex-grow"><EditableSegment value={item.segment} onChange={(newText) => onStoryboardChange(item.id, 'segment', newText)} /></div><div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => onStoryboardChange(item.id, 'delete')} className="p-1 bg-gray-900/50 hover:bg-gray-900 rounded-full text-red-400"><Trash2 size={16} /></button></div></div>))}</div>}</div><AspectRatioModal isOpen={isRatioModalOpen} onClose={() => setIsRatioModalOpen(false)} currentRatio={aspectRatio} onSetRatio={setAspectRatio} /></div>);
};

const EmotionTimelineChart = ({ data, columns }) => {
    const padding = { top: 20, right: 20, bottom: 60, left: 40 }, width = 800, height = 400;
    const chartWidth = width - padding.left - padding.right, chartHeight = height - padding.top - padding.bottom;
    if (!data || data.length < 2) return <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg mt-8 p-6 text-center text-gray-400">Add at least two script segments to see the timeline.</div>;
    const segmentNumbers = generateSegmentNumbers(data);
    const xScale = (i) => padding.left + (i / (data.length - 1)) * chartWidth, yScale = (v) => padding.top + chartHeight - (v / 10) * chartHeight;
    return (<div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg mt-8"><div className="p-6"><h2 className="text-xl font-semibold text-white">Emotion Timeline</h2><p className="text-gray-400 mt-1">Visual representation of how emotions change.</p></div><div className="p-6"><svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto"><g className="text-gray-500 text-xs">{[0, 2, 4, 6, 8, 10].map(v => (<g key={`y-${v}`}><line x1={padding.left} y1={yScale(v)} x2={width-padding.right} y2={yScale(v)} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" /><text x={padding.left-8} y={yScale(v)} dy="0.32em" textAnchor="end">{v}</text></g>))}<text transform={`translate(${padding.left-30}, ${padding.top+chartHeight/2}) rotate(-90)`} textAnchor="middle" className="fill-current text-gray-400 text-sm">Intensity</text></g><g className="text-gray-500 text-xs"><line x1={padding.left} y1={yScale(0)} x2={width-padding.right} y2={yScale(0)} stroke="currentColor" strokeWidth="0.5" />{data.map((d, i) => (<text key={`x-${i}`} x={xScale(i)} y={height-padding.bottom+20} textAnchor="middle">{segmentNumbers[d.id]}</text>))}<text x={padding.left+chartWidth/2} y={height-5} textAnchor="middle" className="fill-current text-gray-400 text-sm">Script Segments</text></g>{columns.map(c => (<polyline key={`l-${c.key}`} fill="none" stroke={c.color} strokeWidth="2" points={data.map((d, i) => `${xScale(i)},${yScale(d[c.key])}`).join(' ')} />))}{columns.map(c => (<g key={`p-${c.key}`}>{data.map((d, i) => (<circle key={`p-${c.key}-${i}`} cx={xScale(i)} cy={yScale(d[c.key])} r="4" fill={c.color}><title>{`${c.label}: ${d[c.key]}`}</title></circle>))}</g>))}</svg><div className="flex justify-center items-center space-x-6 mt-4 flex-wrap">{columns.map(c => (<div key={`lg-${c.key}`} className="flex items-center space-x-2 text-sm mb-2"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }}></span><span className="text-gray-300">{c.label}</span></div>))}</div></div></div>);
};

// --- NEW: Workflow View Component ---
const WorkflowView = () => {
    // This component renders the static workflow chart.
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
                    <h1 className="text-3xl md:text-4xl font-bold text-white">Personal Animation Workflow</h1>
                    <p className="text-lg text-gray-400 mt-2">A flexible and iterative visual guide for solo creators.</p>
                </header>
                <div className="stage-container">
                    {/* Stage 0: Project Foundation */}
                    <div className="stage">
                        <h2 className="stage-title" style={{ color: '#3b82f6' }}>
                            <svg className="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6.375a.625.625 0 0 1 .625.625v3.75a.625.625 0 0 1-.625.625H9v-5Zm0 6.25h6.375a.625.625 0 0 1 .625.625v3.75a.625.625 0 0 1-.625.625H9v-5Z" /></svg>
                            0. Project Foundation
                        </h2>
                        <div className="card-grid">
                            <div className="card" style={{ borderColor: '#3b82f6' }}><h3 className="card-title">Project Initialization</h3><p className="card-description">Set up clear folder structure & version control.</p></div>
                            <div className="card" style={{ borderColor: '#3b82f6' }}><h3 className="card-title">Task System Setup</h3><p className="card-description">Set up board in Jira/Trello, define labels.</p></div>
                        </div>
                    </div>
                    <div className="arrow">↓</div>
                    {/* Stage 1: Pre-Production */}
                    <div className="stage">
                        <h2 className="stage-title" style={{ color: '#10b981' }}>
                            <svg className="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a7.5 7.5 0 0 1-7.5 0c-1.421-.455-2.5-1.683-2.75-3.182S4.5 14.19 4.5 13.5v-1.5c0-.69.055-1.379.168-2.042M12 18V10.5m0 7.5H8.25m3.75 0H15.75m-7.5 0H5.625m7.5 0H18.375m-7.5 0h.008v.015h-.008V18Zm-7.5 0h.008v.015h-.008V18Zm7.5 0h.008v.015h-.008V18Zm7.5 0h.008v.015h-.008V18Z" /></svg>
                            1. Pre-Production
                        </h2>
                        <div className="card-grid">
                            <div className="card" style={{ borderColor: '#10b981' }}><h3 className="card-title">Core Concept & Script</h3><p className="card-description">Define the core story and text.</p></div>
                            <div className="card" style={{ borderColor: '#10b981' }}><h3 className="card-title">Script Analysis & Emotion Definition</h3><p className="card-description">Use the emotion table to define the emotional curve for each scene.</p></div>
                            <div className="card" style={{ borderColor: '#10b981' }}><h3 className="card-title">Visual Reference & Mood Board</h3><p className="card-description">Gather images, colors, lighting references to establish the atmosphere.</p></div>
                            <div className="card" style={{ borderColor: '#10b981' }}><h3 className="card-title">Storyboard & Animatic</h3><p className="card-description">Draw sketches to define composition, pacing, and shot meaning.</p></div>
                            <div className="card" style={{ borderColor: '#10b981' }}><h3 className="card-title">Asset List & Tech R&D</h3><p className="card-description">Break down required 3D assets, test key VFX.</p></div>
                        </div>
                    </div>
                    <div className="arrow">↓</div>
                    {/* Stage 2: Production */}
                    <div className="stage">
                        <h2 className="stage-title" style={{ color: '#f97316' }}>
                            <svg className="icon loop-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.691v4.992h-4.992m0 0-3.181-3.183a8.25 8.25 0 0 1 11.667 0l3.181 3.183" /></svg>
                            2. Production - (Iterate per Shot)
                        </h2>
                        <div className="card-grid">
                            <div className="card" style={{ borderColor: '#f97316' }}><h3 className="card-title">Asset Acquisition & Integration</h3><p className="card-description">Get assets from online libraries (Fab, Sketchfab) or create them.</p></div>
                            <div className="card" style={{ borderColor: '#f97316' }}><h3 className="card-title">Music & Sound Selection</h3><p className="card-description">Select key music for the current shot to guide the rhythm.</p></div>
                            <div className="card" style={{ borderColor: '#f97316' }}><h3 className="card-title">Shot Layout</h3><p className="card-description">Build the scene, set up camera positions.</p></div>
                            <div className="card" style={{ borderColor: '#f97316' }}><h3 className="card-title">Lighting & Color Draft</h3><p className="card-description">Establish color palette, set up key and mood lighting based on references.</p></div>
                            <div className="card" style={{ borderColor: '#f97316' }}><h3 className="card-title">Animation</h3><p className="card-description">Create character, object, and camera movements.</p></div>
                            <div className="card" style={{ borderColor: '#f97316' }}><h3 className="card-title">Visual Effects (VFX)</h3><p className="card-description">Create or integrate necessary visual effects.</p></div>
                            <div className="card" style={{ borderColor: '#f97316' }}><h3 className="card-title">Rendering</h3><p className="card-description">Output image sequences or video clips.</p></div>
                        </div>
                    </div>
                    <div className="arrow">↓</div>
                     {/* Stage 3: Post-Production */}
                    <div className="stage">
                        <h2 className="stage-title" style={{ color: '#ec4899' }}>
                            <svg className="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>
                            3. Post-Production
                        </h2>
                        <div className="card-grid">
                            <div className="card" style={{ borderColor: '#ec4899' }}><h3 className="card-title">Editing</h3><p className="card-description">Assemble rendered shots.</p></div>
                            <div className="card" style={{ borderColor: '#ec4899' }}><h3 className="card-title">Color Grading</h3><p className="card-description">Unify color tone, enhance mood and style.</p></div>
                            <div className="card" style={{ borderColor: '#ec4899' }}><h3 className="card-title">Sound Design & Mixing</h3><p className="card-description">Add ambient sounds, foley, and mix audio tracks.</p></div>
                            <div className="card" style={{ borderColor: '#ec4899' }}><h3 className="card-title">Final Tuning & Export</h3><p className="card-description">Make final adjustments and export the final video.</p></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Main Application Component ---
export default function App() {
    const [appData, setAppData] = useState(createInitialData);
    const [isClient, setIsClient] = useState(false);
    const [activeView, setActiveView] = useState('Table');
    const [modalImageUrl, setModalImageUrl] = useState(null);
    const [activeUpload, setActiveUpload] = useState({ id: null, type: null });
    const [showOverlay, setShowOverlay] = useState(false);
    const [isEmotionSettingsOpen, setIsEmotionSettingsOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const fileUploadRef = useRef(null);
    const importFileRef = useRef(null);
    const emotionSettingsRef = useRef(null);

    useEffect(() => { setIsClient(true); }, []);
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emotionSettingsRef.current && !emotionSettingsRef.current.contains(event.target)) {
                setIsEmotionSettingsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleUploadClick = (id, type) => { setActiveUpload({ id, type }); fileUploadRef.current.click(); };
    
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file || !activeUpload.id) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Image = e.target.result;
            const { id, type } = activeUpload;
            setAppData(prev => {
                const dataKey = type === 'script' ? 'scriptData' : 'storyboardData';
                const updatedData = prev[dataKey].map(row => row.id === id ? { ...row, image: base64Image } : row);
                return { ...prev, [dataKey]: updatedData };
            });
        };
        reader.readAsDataURL(file);

        event.target.value = null; 
        setActiveUpload({ id: null, type: null });
    };

    const handleScriptChange = (id, action, value) => {
        setAppData(prev => {
            const newScriptData = [...prev.scriptData];
            const currentIndex = newScriptData.findIndex(row => row.id === id);
            if (currentIndex === -1) return prev;
            switch (action) {
                case 'segment': newScriptData[currentIndex].segment = value; break;
                case 'add':
                    const newRow = { id: crypto.randomUUID(), level: newScriptData[currentIndex].level, segment: 'New Segment', image: null };
                    prev.emotionColumns.forEach(col => newRow[col.key] = 0);
                    newScriptData.splice(currentIndex + 1, 0, newRow);
                    break;
                case 'delete': if (newScriptData.length > 1) newScriptData.splice(currentIndex, 1); break;
                case 'indent': if (currentIndex > 0) newScriptData[currentIndex].level = Math.min(newScriptData[currentIndex].level + 1, 5); break;
                case 'outdent': newScriptData[currentIndex].level = Math.max(newScriptData[currentIndex].level - 1, 0); break;
                default: break;
            }
            return { ...prev, scriptData: newScriptData };
        });
    };
    
    const handleStoryboardChange = (id, action, value) => {
        setAppData(prev => {
            let newStoryboardData = [...prev.storyboardData];
            if (action === 'add') {
                const newPanel = { id: crypto.randomUUID(), segment: 'New Panel', image: null };
                newStoryboardData.push(newPanel);
            } else {
                const currentIndex = newStoryboardData.findIndex(p => p.id === id);
                if (currentIndex === -1) return prev;
                if (action === 'segment') newStoryboardData[currentIndex].segment = value;
                else if (action === 'delete') newStoryboardData.splice(currentIndex, 1);
            }
            return { ...prev, storyboardData: newStoryboardData };
        });
    };

    const handleEmotionChange = (rowId, emotionKey, newValue) => { setAppData(prev => ({ ...prev, scriptData: prev.scriptData.map(row => row.id === rowId ? { ...row, [emotionKey]: Math.max(0, Math.min(10, newValue)) } : row) })); };
    const handleReset = () => { setAppData(createInitialData()); setIsResetModalOpen(false); };
    const handleAddEmotion = (emotionName) => { setAppData(prev => { const newEmotionKey = emotionName.toLowerCase().replace(/\s+/g, '-'); if (prev.emotionColumns.some(e => e.key === newEmotionKey)) { console.warn("Emotion already exists."); return prev; } const newEmotion = { key: newEmotionKey, label: emotionName, color: getRandomColor() }; const newEmotionColumns = [...prev.emotionColumns, newEmotion]; const newScriptData = prev.scriptData.map(row => ({...row, [newEmotionKey]: 0})); return {...prev, emotionColumns: newEmotionColumns, scriptData: newScriptData}; }); };
    const handleDeleteEmotion = (emotionKey) => { setAppData(prev => { const newEmotionColumns = prev.emotionColumns.filter(e => e.key !== emotionKey); const newScriptData = prev.scriptData.map(row => { const newRow = {...row}; delete newRow[emotionKey]; return newRow; }); return {...prev, emotionColumns: newEmotionColumns, scriptData: newScriptData}; }); };

    const handleExport = () => {
        const jsonString = JSON.stringify(appData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'film-tools-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => { importFileRef.current.click(); };
    const handleImportFile = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                // Basic validation
                if (importedData.scriptData && importedData.storyboardData && importedData.emotionColumns) {
                    setAppData(importedData);
                } else { throw new Error("Invalid file format."); }
            } catch (error) {
                console.error("Failed to import file:", error);
                alert("Error: Could not import the file. It may be invalid or corrupted.");
            }
        };
        reader.readAsText(file);
        event.target.value = null;
    };
    
    if (!isClient) {
        return null;
    }

    return (
        <div className="bg-gray-900 text-gray-200 min-h-screen font-sans">
            <header className="py-6 px-4 sm:px-6 lg:px-8"><div className="text-center"><h1 className="text-4xl font-bold text-amber-400" style={{fontFamily: "'Brush Script MT', cursive"}}> Film Tools</h1></div></header>
            <main className="px-4 sm:px-6 lg:px-8 pb-12">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                        <div className="flex items-center space-x-2">
                            <button onClick={() => setActiveView('Table')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'Table' ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>Table</button>
                            <button onClick={() => setActiveView('Storyboard')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'Storyboard' ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>Storyboard</button>
                            <button onClick={() => setActiveView('Workflow')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'Workflow' ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>Workflow</button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button onClick={handleImportClick} className="p-2 rounded-md text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 flex items-center space-x-2"><Upload size={16}/><span>Import</span></button>
                            <button onClick={handleExport} className="p-2 rounded-md text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 flex items-center space-x-2"><Download size={16}/><span>Export</span></button>
                            <button onClick={() => setIsResetModalOpen(true)} className="p-2 rounded-md text-sm font-medium bg-gray-700 text-red-400 hover:bg-gray-600 flex items-center space-x-2"><RefreshCw size={16}/><span>Reset</span></button>
                        </div>
                    </div>
                    
                    {activeView === 'Table' && (
                        <>
                            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
                                <div className="p-6"><h2 className="text-xl font-semibold text-white">Table & Analysis View</h2><p className="text-gray-400 mt-1">Detailed script analysis, image uploads, and emotion tracking.</p></div>
                                <div className="p-6 border-t border-gray-700 flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center space-x-6 text-sm">
                                        <div ref={emotionSettingsRef} className="relative">
                                            <button onClick={() => setIsEmotionSettingsOpen(o => !o)} className="flex items-center space-x-2 text-gray-300 hover:text-white"><Settings size={16} /><span>Emotion Settings</span></button>
                                            {isEmotionSettingsOpen && <EmotionSettingsPopup emotions={appData.emotionColumns} onAddEmotion={handleAddEmotion} onDeleteEmotion={handleDeleteEmotion} />}
                                        </div>
                                        <button className="flex items-center space-x-2 text-gray-300 hover:text-white"><Copy size={16} /><span>Copy Script</span></button>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <label className="text-sm text-gray-300">Overlay Graphs</label>
                                        <button onClick={() => setShowOverlay(!showOverlay)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${showOverlay ? 'bg-amber-500' : 'bg-gray-600'}`}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${showOverlay ? 'translate-x-6' : 'translate-x-1'}`} /></button>
                                    </div>
                                </div>
                                <TableView 
                                    scriptData={appData.scriptData} 
                                    emotionColumns={appData.emotionColumns} 
                                    showOverlay={showOverlay}
                                    onScriptChange={handleScriptChange}
                                    onEmotionChange={handleEmotionChange} 
                                    onUploadClick={handleUploadClick} 
                                    onImageClick={setModalImageUrl} 
                                />
                            </div>
                            <EmotionTimelineChart data={appData.scriptData} columns={appData.emotionColumns} />
                        </>
                    )}
                    {activeView === 'Storyboard' && (
                        <StoryboardView 
                            storyboardData={appData.storyboardData}
                            onStoryboardChange={handleStoryboardChange}
                            onUploadClick={handleUploadClick}
                            onImageClick={setModalImageUrl}
                        />
                    )}
                    {activeView === 'Workflow' && (
                        <WorkflowView />
                    )}
                </div>
            </main>
            <input type="file" ref={fileUploadRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <input type="file" ref={importFileRef} onChange={handleImportFile} accept=".json" className="hidden" />
            <ImageModal imageUrl={modalImageUrl} onClose={() => setModalImageUrl(null)} />
            <ConfirmationModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} onConfirm={handleReset} title="Reset Project?"><p>Are you sure you want to reset all data?</p></ConfirmationModal>
        </div>
    );
}
