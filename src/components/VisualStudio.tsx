'use client';

import { useState } from 'react';
import { Rnd } from 'react-rnd';
import html2canvas from 'html2canvas';

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
}

export default function VisualStudio() {
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [generating, setGenerating] = useState(false);

  // 生成图片（调用 Replicate API）
  const handleGenerateImage = async (prompt: string) => {
    setGenerating(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      if (data.url) {
        setImages((prev) => [...prev, data.url]);
        setSelectedImage(data.url);
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setGenerating(false);
    }
  };

  // 添加文字图层
  const addTextOverlay = () => {
    const newText: TextOverlay = {
      id: Date.now().toString(),
      text: '双击编辑文字',
      x: 50,
      y: 50,
      width: 200,
      height: 50,
      fontSize: 16,
    };
    setTextOverlays((prev) => [...prev, newText]);
  };

  // 下载图片
  const handleDownload = async () => {
    if (!selectedImage) return;

    const element = document.getElementById('canvas-container');
    if (element) {
      const canvas = await html2canvas(element);
      const link = document.createElement('a');
      link.download = `poster-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => handleGenerateImage('医疗美容宣传海报')}
          disabled={generating}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 text-sm"
        >
          {generating ? '生成中...' : '生成图片'}
        </button>
        <button
          onClick={addTextOverlay}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
        >
          添加文字
        </button>
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
        >
          下载
        </button>
      </div>

      {/* 图片预览区域 */}
      <div className="flex-1 flex gap-4">
        {/* 图片列表 */}
        <div className="w-20 flex flex-col gap-2 overflow-y-auto">
          {images.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedImage(img)}
              className={`cursor-pointer rounded-lg overflow-hidden border-2 ${
                selectedImage === img ? 'border-[#7C3AED]' : 'border-transparent'
              }`}
            >
              <img src={img} alt={`Generated ${idx}`} className="w-full h-auto" />
            </div>
          ))}
        </div>

        {/* 画布 */}
        <div className="flex-1 bg-gray-100 rounded-xl overflow-auto">
          {selectedImage ? (
            <div
              id="canvas-container"
              className="relative inline-block"
              style={{ minWidth: '400px', minHeight: '400px' }}
            >
              <img src={selectedImage} alt="Selected" className="max-w-full" />
              {textOverlays.map((overlay) => (
                <Rnd
                  key={overlay.id}
                  size={{ width: overlay.width, height: overlay.height }}
                  position={{ x: overlay.x, y: overlay.y }}
                  onDragStop={(e, d) => {
                    setTextOverlays((prev) =>
                      prev.map((item) =>
                        item.id === overlay.id ? { ...item, x: d.x, y: d.y } : item
                      )
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
                  className="absolute border-2 border-dashed border-gray-400 hover:border-[#7C3AED]"
                >
                  <input
                    type="text"
                    defaultValue={overlay.text}
                    className="w-full h-full bg-transparent text-center outline-none"
                    style={{ fontSize: `${overlay.fontSize}px` }}
                  />
                </Rnd>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <p>点击"生成图片"开始创作</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
