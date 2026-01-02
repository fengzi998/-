'use client';

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Slide {
  title: string;
  content: string;
  imageUrl?: string;
}

export default function ReportPreview() {
  const [slides, setSlides] = useState<Slide[]>([
    { title: '营销策略', content: '根据您的需求，我们制定了以下营销策略...' },
    { title: '目标用户', content: '主要针对25-35岁的都市女性...' },
    { title: '推广渠道', content: '建议通过社交媒体、线下活动等渠道...' },
  ]);
  const [loading, setLoading] = useState(false);

  // 模拟从策略生成报告幻灯片
  const generateSlides = async (strategy: string) => {
    setLoading(true);
    // 这里可以调用 API 解析策略并生成幻灯片
    // const response = await fetch('/api/generate-slides', ...
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => generateSlides('')}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 text-sm"
        >
          {loading ? '生成中...' : '生成报告'}
        </button>
        <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm">
          预览
        </button>
      </div>

      {/* 手机模型预览 */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-[280px] h-[560px] bg-black rounded-[3rem] p-3 shadow-2xl">
          {/* 手机屏幕 */}
          <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
            {slides.length > 0 ? (
              <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                className="h-full"
              >
                {slides.map((slide, idx) => (
                  <SwiperSlide key={idx} className="flex flex-col items-center justify-center p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">{slide.title}</h3>
                    {slide.imageUrl && (
                      <img src={slide.imageUrl} alt={slide.title} className="w-full h-32 object-cover rounded-lg mb-4" />
                    )}
                    <p className="text-sm text-gray-600 text-center">{slide.content}</p>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <p className="text-sm">暂无报告</p>
              </div>
            )}
          </div>

          {/* 手机刘海 */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-10" />
        </div>
      </div>
    </div>
  );
}
