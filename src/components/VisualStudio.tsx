'use client';

import { useState, useRef } from 'react';
import { Rnd } from 'react-rnd';
import html2canvas from 'html2canvas';
import { motion } from 'framer-motion';

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  color: string;
  fontWeight: string;
}

interface Sticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
}

const PRESET_PROMPTS = [
  '医疗美容宣传海报 - 现代简约风格',
  '护肤产品广告 - 清新自然',
  '美容院促销活动 - 奢华质感',
  '医美项目介绍 - 专业科技感',
  '美妆教程封面 - 潮流时尚',
];

const EMOJI_STICKERS = ['✨', '💎', '🌸', '💅', '🦋', '⭐', '🌟', '💫', '🎀', '💕'];

const FONT_COLORS = [
  '#000000', '#FFFFFF', '#7C3AED', '#EC4899', '#F59E0B',
  '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#F97316',
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 42];

interface VisualStudioProps {
  strategy?: string;
}

export default function VisualStudio({ strategy }: VisualStudioProps) {
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);

  // 生成图片（调用 Replicate API）
  const handleGenerateImage = async (prompt: string) => {
    setGenerating(true);
    setShowPromptModal(false);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, width: 1024, height: 1024 }),
      });

      const data = await response.json();
      if (data.url) {
        setImages((prev) => [data.url, ...prev]);
        setSelectedImage(data.url);
        // 清除之前的图层
        setTextOverlays([]);
        setStickers([]);
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
      alert('图片生成失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  // 添加文字图层
  const addTextOverlay = () => {
    const newText: TextOverlay = {
      id: Date.now().toString(),
      text: '双击编辑文字',
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      fontSize: 24,
      color: '#000000',
      fontWeight: 'normal',
    };
    setTextOverlays((prev) => [...prev, newText]);
    setSelectedOverlay(newText.id);
  };

  // 更新文字图层
  const updateTextOverlay = (id: string, updates: Partial<TextOverlay>) => {
    setTextOverlays((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  // 删除图层
  const deleteOverlay = (id: string) => {
    setTextOverlays((prev) => prev.filter((item) => item.id !== id));
    setStickers((prev) => prev.filter((item) => item.id !== id));
    if (selectedOverlay === id) setSelectedOverlay(null);
  };

  // 添加贴纸
  const addSticker = (emoji: string) => {
    const newSticker: Sticker = {
      id: Date.now().toString(),
      emoji,
      x: 150,
      y: 150,
      size: 48,
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedOverlay(newSticker.id);
  };

  // 下载图片
  const handleDownload = async () => {
    if (!selectedImage) {
      alert('请先生成图片');
      return;
    }

    const element = canvasRef.current;
    if (element) {
      try {
        const canvas = await html2canvas(element, {
          backgroundColor: null,
          scale: 2,
          useCORS: true,
        });
        const link = document.createElement('a');
        link.download = `poster-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('Download failed:', error);
        alert('下载失败，请重试');
      }
    }
  };

  // 删除图片
  const deleteImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    if (selectedImage === images[index]) {
      setSelectedImage(newImages[0] || '');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <button
          onClick={() => setShowPromptModal(true)}
          disabled={generating}
          className="px-4 py-2 bg-gradient-primary text-white rounded-lg hover:opacity-90 disabled:bg-gray-300 text-sm flex items-center gap-2"
        >
          {generating ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              生成中
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              生成图片
            </>
          )}
        </button>
        <button
          onClick={addTextOverlay}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          添加文字
        </button>
        <div className="relative group">
          <button className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 text-sm flex items-center gap-2">
            <span>✨</span>
            贴纸
          </button>
          <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl p-2 hidden group-hover:flex gap-1 flex-wrap z-10 w-48 border">
            {EMOJI_STICKERS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => addSticker(emoji)}
                className="text-2xl hover:bg-gray-100 rounded p-1 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleDownload}
          disabled={!selectedImage}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 text-sm flex items-center gap-2 ml-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          下载
        </button>
      </div>

      {/* 主编辑区域 */}
      <div className="flex-1 flex gap-3 min-h-0">
        {/* 图片列表 */}
        <div className="w-20 flex flex-col gap-2 overflow-y-auto">
          {images.map((img, idx) => (
            <div key={idx} className="relative group">
              <div
                onClick={() => setSelectedImage(img)}
                className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage === img ? 'border-purple-500 ring-2 ring-purple-200' : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img src={img} alt={`Generated ${idx}`} className="w-full h-auto" />
              </div>
              <button
                onClick={() => deleteImage(idx)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* 画布 */}
        <div className="flex-1 bg-gray-100 rounded-xl overflow-auto flex items-center justify-center">
          {selectedImage ? (
            <div
              ref={canvasRef}
              className="relative inline-block"
              style={{ minWidth: '400px', minHeight: '400px' }}
            >
              <img src={selectedImage} alt="Selected" className="max-w-full max-h-[500px] rounded-lg" />

              {/* 贴纸 */}
              {stickers.map((sticker) => (
                <Rnd
                  key={sticker.id}
                  size={{ width: sticker.size, height: sticker.size }}
                  position={{ x: sticker.x, y: sticker.y }}
                  onDragStop={(e, d) => {
                    setStickers((prev) =>
                      prev.map((item) => (item.id === sticker.id ? { ...item, x: d.x, y: d.y } : item))
                    );
                  }}
                  onResizeStop={(e, direction, ref, delta, position) => {
                    setStickers((prev) =>
                      prev.map((item) =>
                        item.id === sticker.id
                          ? {
                              ...item,
                              size: parseInt(ref.style.width),
                            }
                          : item
                      )
                    );
                  }}
                  onClick={() => setSelectedOverlay(sticker.id)}
                  className={`absolute cursor-move ${
                    selectedOverlay === sticker.id ? 'ring-2 ring-purple-500' : ''
                  }`}
                >
                  <span className="text-4xl select-none">{sticker.emoji}</span>
                  {selectedOverlay === sticker.id && (
                    <button
                      onClick={() => deleteOverlay(sticker.id)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  )}
                </Rnd>
              ))}

              {/* 文字图层 */}
              {textOverlays.map((overlay) => (
                <Rnd
                  key={overlay.id}
                  size={{ width: overlay.width, height: overlay.height }}
                  position={{ x: overlay.x, y: overlay.y }}
                  onDragStop={(e, d) => {
                    setTextOverlays((prev) =>
                      prev.map((item) => (item.id === overlay.id ? { ...item, x: d.x, y: d.y } : item))
                    );
                  }}
                  onResizeStop={(e, direction, ref, delta, position) => {
                    setTextOverlays((prev) =>
                      prev.map((item) =>
                        item.id === overlay.id
                          ? {
                              ...item,
                              width: parseInt(ref.style.width),
                              height: parseInt(ref.style.height),
                            }
                          : item
                      )
                    );
                  }}
                  onClick={() => setSelectedOverlay(overlay.id)}
                  className={`absolute border-2 border-dashed ${
                    selectedOverlay === overlay.id
                      ? 'border-purple-500 bg-purple-50/30'
                      : 'border-gray-300 hover:border-purple-300'
                  }`}
                >
                  <input
                    type="text"
                    value={overlay.text}
                    onChange={(e) => updateTextOverlay(overlay.id, { text: e.target.value })}
                    className="w-full h-full bg-transparent text-center outline-none"
                    style={{
                      fontSize: `${overlay.fontSize}px`,
                      color: overlay.color,
                      fontWeight: overlay.fontWeight,
                    }}
                  />
                  {selectedOverlay === overlay.id && (
                    <>
                      <button
                        onClick={() => deleteOverlay(overlay.id)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                      {/* 样式控制 */}
                      <div className="absolute -bottom-10 left-0 bg-white rounded-lg shadow-lg p-2 flex gap-2 border">
                        <select
                          value={overlay.fontSize}
                          onChange={(e) => updateTextOverlay(overlay.id, { fontSize: parseInt(e.target.value) })}
                          className="text-xs border rounded px-1"
                        >
                          {FONT_SIZES.map((size) => (
                            <option key={size} value={size}>
                              {size}px
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-1">
                          {FONT_COLORS.map((color) => (
                            <button
                              key={color}
                              onClick={() => updateTextOverlay(overlay.id, { color })}
                              className={`w-5 h-5 rounded border-2 ${
                                overlay.color === color ? 'border-gray-500' : 'border-gray-200'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <button
                          onClick={() =>
                            updateTextOverlay(overlay.id, {
                              fontWeight: overlay.fontWeight === 'bold' ? 'normal' : 'bold',
                            })
                          }
                          className={`text-xs px-2 rounded ${
                            overlay.fontWeight === 'bold' ? 'bg-purple-500 text-white' : 'bg-gray-200'
                          }`}
                        >
                          B
                        </button>
                      </div>
                    </>
                  )}
                </Rnd>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium">开始创作您的海报</p>
              <p className="text-xs mt-1">点击"生成图片"使用 AI 创建</p>
            </div>
          )}
        </div>
      </div>

      {/* 提示词选择弹窗 */}
      {showPromptModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowPromptModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">选择图片风格</h3>
            <div className="space-y-2 mb-4">
              {PRESET_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleGenerateImage(prompt)}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-colors text-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <div className="border-t pt-4">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="或输入自定义描述..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm mb-2"
                onKeyPress={(e) => e.key === 'Enter' && customPrompt && handleGenerateImage(customPrompt)}
              />
              <button
                onClick={() => customPrompt && handleGenerateImage(customPrompt)}
                disabled={!customPrompt}
                className="w-full px-4 py-2 bg-gradient-primary text-white rounded-lg hover:opacity-90 disabled:bg-gray-300 text-sm"
              >
                生成自定义图片
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
