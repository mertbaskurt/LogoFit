import React, { useState, useCallback } from 'react';
import { Upload, X, ImageIcon, Layout, Settings, FileImage } from 'lucide-react';
import { Button } from './components/Button';
import { LogoProcessor } from './components/LogoProcessor';
import { ImageState, Dimensions, DEFAULT_DIMENSIONS } from './types';

export default function App() {
  const [imageState, setImageState] = useState<ImageState>({
    file: null,
    element: null,
    name: '',
  });

  const [dimensions, setDimensions] = useState<Dimensions>(DEFAULT_DIMENSIONS);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG).');
      return;
    }

    setError(null);
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      setImageState({
        file: file,
        element: img,
        name: file.name,
      });
    };

    img.onerror = () => {
      setError('Failed to load image.');
      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setImageState({ file: null, element: null, name: '' });
    setError(null);
  };

  const handleDimensionChange = (key: keyof Dimensions, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      setDimensions(prev => ({ ...prev, [key]: numValue }));
    } else if (value === "") {
        // Allow clearing for UX, though we generally want numbers
    }
  };

  return (
    <div className="min-h-screen text-slate-800 p-6 md:p-12 font-sans selection:bg-slate-200">
      <main className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white text-slate-900 mb-6 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
            <Layout className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-3">
            Logo Centering Tool
          </h1>
          <p className="text-slate-500 text-lg max-w-lg mx-auto leading-relaxed font-medium">
            Upload your logo and fit it perfectly into your reference frame.
          </p>
        </header>

        <div className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">
          
          {/* Left Column: Settings & Upload */}
          <div className="flex flex-col gap-6">
            
            {/* Dimensions Settings */}
            <div className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
               <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-50">
                <Settings className="w-4 h-4 text-slate-400" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                  Canvas Size
                </h2>
               </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Width</label>
                  <div className="relative group">
                    <input
                      type="number"
                      min="1"
                      value={dimensions.width}
                      onChange={(e) => handleDimensionChange('width', e.target.value)}
                      className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                      title="Target width in pixels"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">px</span>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Height</label>
                  <div className="relative group">
                    <input
                      type="number"
                      min="1"
                      value={dimensions.height}
                      onChange={(e) => handleDimensionChange('height', e.target.value)}
                      className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                      title="Target height in pixels"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">px</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Source Image Upload */}
            <div className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
              <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-50">
                <FileImage className="w-4 h-4 text-slate-400" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                  Source Image
                </h2>
               </div>
              
              {!imageState.file ? (
                <div 
                  className={`
                    relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ease-out flex flex-col items-center justify-center text-center gap-4 cursor-pointer group
                    ${dragActive 
                      ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02] shadow-xl shadow-indigo-100 ring-4 ring-indigo-500/10' 
                      : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50 hover:shadow-md'
                    }
                  `}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/webp"
                  />
                  <div className={`
                    w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm
                    ${dragActive ? 'bg-indigo-100 text-indigo-600 rotate-12' : 'bg-white border border-slate-100 text-slate-400 group-hover:scale-110 group-hover:text-indigo-500 group-hover:border-indigo-200'}
                  `}>
                    <Upload className="w-7 h-7" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className={`font-semibold text-sm transition-colors duration-300 ${dragActive ? 'text-indigo-800' : 'text-slate-700'}`}>
                      {dragActive ? 'Drop file here' : 'Click to upload image'}
                    </p>
                    <p className={`text-xs mt-1.5 transition-colors duration-300 ${dragActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                      JPG, PNG or WebP
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 group hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden shadow-sm">
                       {/* Thumbnail preview */}
                       <img src={imageState.element?.src} className="w-full h-full object-cover" alt="thumbnail" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate" title={imageState.name}>
                        {imageState.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Original: {imageState.element?.naturalWidth} × {imageState.element?.naturalHeight}
                      </p>
                    </div>
                    <button 
                      onClick={handleClear}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-medium text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                    Ready to center
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="mb-3 text-xs font-bold text-slate-900 uppercase tracking-widest">How it works</p>
              <ol className="space-y-2 text-sm text-slate-600">
                <li className="flex gap-2">
                  <span className="font-semibold text-slate-900">1.</span>
                  <span>Set dimensions for your output.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-slate-900">2.</span>
                  <span>Upload your high-res logo.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-slate-900">3.</span>
                  <span>Click <strong className="text-slate-900">Ortala</strong> to fit & download.</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Right Column: Preview Area */}
          <div className="bg-white p-6 md:p-10 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col items-center min-h-[600px] justify-center relative overflow-hidden">
             
             {imageState.file ? (
                <>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-200 via-slate-400 to-slate-200 opacity-20"></div>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-8 w-full text-center opacity-50">
                    Workspace
                  </h2>
                  <LogoProcessor 
                    imageState={imageState} 
                    onClear={handleClear} 
                    targetDimensions={dimensions}
                  />
                </>
             ) : (
               <div className="flex flex-col items-center justify-center w-full h-full text-center max-w-sm mx-auto animate-in fade-in zoom-in-95 duration-500">
                 <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
                    <ImageIcon className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
                 </div>
                 <h3 className="text-slate-900 font-semibold text-lg mb-2">No Image Selected</h3>
                 <p className="text-slate-400 text-sm leading-relaxed mb-6">
                   Upload an image to see the preview here. It will be scaled to fit your <span className="font-mono text-slate-600 bg-slate-100 px-1 py-0.5 rounded text-xs">{dimensions.width}×{dimensions.height}</span> frame.
                 </p>
                 <div className="w-16 h-1 bg-slate-100 rounded-full"></div>
               </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
}