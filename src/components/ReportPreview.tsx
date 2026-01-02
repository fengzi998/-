'use client';

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { motion } from 'framer-motion';

interface Slide {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  order: number;
}

interface ReportPreviewProps {
  strategy?: string;
  onGenerate?: () => void;
}

// 全局事件监听，用于接收策略生成结果
let strategyUpdateCallback: ((strategy: string) => void) | null = null;

export function notifyStrategyGenerated(strategy: string) {
  if (strategyUpdateCallback) {
    strategyUpdateCallback(strategy);
  }
}

export default function ReportPreview({ strategy, onGenerate }: ReportPreviewProps) {
  const [slides, setSlides] = useState<Slide[]>([
    { id: '1', title: '欢迎使用', content: '在左侧输入营销需求，AI 将为您生成营销策略报告', order: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');

  // 监听策略生成完成事件
  useEffect(() => {
    strategyUpdateCallback = handleStrategyGenerated;
    return () => {
      strategyUpdateCallback = null;
    };
  }, []);

  // 处理策略生成完成
  const handleStrategyGenerated = (generatedStrategy: string) => {
    generateSlidesFromStrategy(generatedStrategy);
  };

  // 当 strategy prop 变化时也生成报告
  useEffect(() => {
    if (strategy) {
      generateSlidesFromStrategy(strategy);
    }
  }, [strategy]);

  // 从策略内容生成幻灯片
  const generateSlidesFromStrategy = async (strategyText: string) => {
    setLoading(true);
    try {
      // 调用 API 生成幻灯片
      const response = await fetch('/api/generate-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy: strategyText }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.slides && data.slides.length > 0) {
          setSlides(data.slides);
        } else {
          // 如果 API 失败，使用简单的解析
          parseStrategyToSlides(strategyText);
        }
      } else {
        // API 不可用时，简单解析
        parseStrategyToSlides(strategyText);
      }
    } catch (error) {
      // 出错时使用简单解析
      parseStrategyToSlides(strategyText);
    } finally {
      setLoading(false);
    }
  };

  // 简单的策略解析（作为后备方案）
  const parseStrategyToSlides = (strategyText: string) => {
    const lines = strategyText.split('\n').filter((line) => line.trim());
    const newSlides: Slide[] = [];

    // 封面页
    newSlides.push({
      id: 'cover',
      title: '营销策略报告',
      content: 'AI 智能生成的医疗美容营销方案',
      order: 0,
    });

    // 简单解析：每500个字符或每个段落作为一个幻灯片
    let contentBuffer = '';
    let slideCount = 1;

    for (const line of lines) {
      // 检测是否为标题
      if (line.startsWith('##') || line.startsWith('###') || /^[一二三四五六七八九十]+[、\.]\s*/.test(line)) {
        // 如果有缓存内容，先保存
        if (contentBuffer.trim()) {
          newSlides.push({
            id: `slide-${slideCount++}`,
            title: '策略详情',
            content: contentBuffer.trim(),
            order: newSlides.length,
          });
          contentBuffer = '';
        }
        // 添加标题幻灯片
        const title = line.replace(/^#+\s*/, '').replace(/^[一二三四五六七八九十]+[、\.]\s*/, '');
        newSlides.push({
          id: `slide-${slideCount++}`,
          title: title,
          content: '',
          order: newSlides.length,
        });
      } else {
        contentBuffer += line + '\n';
        // 当内容达到一定长度时，创建新幻灯片
        if (contentBuffer.length > 400) {
          newSlides.push({
            id: `slide-${slideCount++}`,
            title: '策略详情',
            content: contentBuffer.trim(),
            order: newSlides.length,
          });
          contentBuffer = '';
        }
      }
    }

    // 保存剩余内容
    if (contentBuffer.trim()) {
      newSlides.push({
        id: `slide-${slideCount++}`,
        title: '策略详情',
        content: contentBuffer.trim(),
        order: newSlides.length,
      });
    }

    // 如果解析失败，至少保留封面和原始内容
    if (newSlides.length === 1 && lines.length > 0) {
      newSlides.push({
        id: 'content',
        title: '策略内容',
        content: strategyText.substring(0, 500) + (strategyText.length > 500 ? '...' : ''),
        order: 1,
      });
    }

    setSlides(newSlides);
  };

  // 生成分享链接
  const generateShareLink = () => {
    const data = {
      slides: slides.map((s) => ({ title: s.title, content: s.content, imageUrl: s.imageUrl })),
      timestamp: Date.now(),
    };
    const encoded = btoa(JSON.stringify(data));
    const link = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/h5/report?data=${encodeURIComponent(encoded)}`;
    setShareLink(link);
    setShowShareModal(true);
  };

  // 复制链接
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('链接已复制到剪贴板！');
  };

  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => onGenerate && onGenerate()}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 text-sm flex items-center gap-2"
        >
          {loading ? (
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              生成报告
            </>
          )}
        </button>
        <button
          onClick={() => setPreviewMode(previewMode === 'mobile' ? 'desktop' : 'mobile')}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {previewMode === 'mobile' ? '桌面预览' : '手机预览'}
        </button>
        <button
          onClick={generateShareLink}
          disabled={slides.length <= 1}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 text-sm flex items-center gap-2 ml-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          分享
        </button>
      </div>

      {/* 预览区域 */}
      <div className="flex-1 flex items-center justify-center">
        {previewMode === 'mobile' ? (
          // 手机预览
          <div className="relative w-[260px] h-[520px] bg-black rounded-[2.5rem] p-2 shadow-2xl">
            <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden">
              {slides.length > 0 ? (
                <Swiper
                  modules={[Navigation, Pagination]}
                  navigation
                  pagination={{ clickable: true }}
                  className="h-full"
                  spaceBetween={0}
                >
                  {slides.map((slide) => (
                    <SwiperSlide key={slide.id} className="flex flex-col">
                      {/* 封面页样式 */}
                      {slide.order === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center bg-gradient-primary p-6 text-white">
                          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <h3 className="text-2xl font-bold mb-2 text-center">{slide.title}</h3>
                          <p className="text-sm text-white/80 text-center">{slide.content}</p>
                        </div>
                      ) : (
                        // 内容页样式
                        <div className="flex-1 flex flex-col p-4">
                          <h3 className="text-lg font-bold text-gray-800 mb-3">{slide.title}</h3>
                          {slide.imageUrl && (
                            <img src={slide.imageUrl} alt={slide.title} className="w-full h-24 object-cover rounded-lg mb-3" />
                          )}
                          <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{slide.content}</p>
                        </div>
                      )}
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <p className="text-xs text-center px-4">在左侧生成营销策略后，这里将自动生成报告</p>
                </div>
              )}
            </div>
            {/* 手机刘海 */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-10" />
          </div>
        ) : (
          // 桌面预览
          <div className="w-full h-full bg-white rounded-xl shadow-lg p-6 overflow-y-auto">
            {slides.length > 0 ? (
              <div className="space-y-6">
                {slides.map((slide, idx) => (
                  <motion.div
                    key={slide.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-6 rounded-xl ${
                      slide.order === 0
                        ? 'bg-gradient-primary text-white'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <h3 className={`text-xl font-bold mb-3 ${slide.order === 0 ? 'text-white' : 'text-gray-800'}`}>
                      {slide.order === 0 && idx === 0 ? '📄 ' : ''}{slide.title}
                    </h3>
                    {slide.imageUrl && (
                      <img src={slide.imageUrl} alt={slide.title} className="w-full h-40 object-cover rounded-lg mb-3" />
                    )}
                    <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                      slide.order === 0 ? 'text-white/90' : 'text-gray-600'
                    }`}>
                      {slide.content}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <p>暂无报告</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 分享链接弹窗 */}
      {showShareModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowShareModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">分享报告</h3>
            <div className="bg-gray-100 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-600 mb-2">报告链接：</p>
              <p className="text-xs text-gray-800 break-all">{shareLink}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyShareLink}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
              >
                复制链接
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
              >
                关闭
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
