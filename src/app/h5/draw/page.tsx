'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Turntable, Toast, Dialog } from '@nutui/nutui-react';

interface Prize {
  id: number;
  name: string;
  probability: number;
  color?: string;
}

export default function DrawPage() {
  const searchParams = useSearchParams();
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);
  const [winningPrize, setWinningPr] = useState<{ name: string; code: string } | null>(null);

  useEffect(() => {
    // 从 URL 参数读取并解码数据
    const data = searchParams.get('data');
    if (data) {
      try {
        const decoded = JSON.parse(atob(decodeURIComponent(data)));
        setPrizes(decoded.prizes || []);
      } catch (error) {
        console.error('Failed to decode prize data:', error);
        Toast.show('数据解析失败');
      }
    } else {
      // 默认演示数据
      setPrizes([
        { id: 1, name: '免费体验券', probability: 0.1 },
        { id: 2, name: '8折优惠券', probability: 0.2 },
        { id: 3, name: '9折优惠券', probability: 0.3 },
        { id: 4, name: '精美礼品', probability: 0.15 },
        { id: 5, name: '再接再厉', probability: 0.25 },
      ]);
    }
  }, [searchParams]);

  const handleDraw = () => {
    setSpinning(true);

    // 客户端随机计算
    const random = Math.random();
    let cumulative = 0;
    let winningPrizeIndex = prizes.length - 1;

    for (let i = 0; i < prizes.length; i++) {
      cumulative += prizes[i].probability;
      if (random <= cumulative) {
        winningPrizeIndex = i;
        break;
      }
    }

    // 模拟转盘动画
    setTimeout(() => {
      setSpinning(false);
      const prize = prizes[winningPrizeIndex];
      const redeemCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      setWinningPr({ name: prize.name, code: redeemCode });
      setResultVisible(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-draw flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-300 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-300 rounded-full blur-3xl"></div>
      </div>

      {/* 内容容器 */}
      <div className="relative z-10 w-full max-w-md">
        {/* 标题 */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            幸运大抽奖
          </h1>
          <p className="text-white/80 text-sm">
            点击转盘开始抽奖，赢取精美礼品
          </p>
        </div>

        {/* 转盘卡片 */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {prizes.length > 0 ? (
            <div className="flex justify-center">
              <Turntable
                prizeList={prizes.map((p) => ({ prizeName: p.name }))}
                onStart={handleDraw}
                spinning={spinning}
                width="260px"
                height="260px"
              />
            </div>
          ) : (
            <div className="text-center text-gray-500 py-20">
              <div className="animate-pulse">加载中...</div>
            </div>
          )}

          {/* 操作提示 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {spinning ? '抽奖中...' : '点击转盘开始抽奖'}
            </p>
          </div>
        </div>

        {/* 底部说明 */}
        <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <p className="text-white/70 text-xs">
            活动最终解释权归主办方所有
          </p>
        </div>
      </div>

      {/* 中奖结果弹窗 */}
      <Dialog
        visible={resultVisible}
        title="🎉 恭喜中奖"
        onClose={() => setResultVisible(false)}
        className="text-center"
      >
        {winningPrize && (
          <div className="py-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {winningPrize.name}
            </h3>
            <div className="bg-gray-100 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-600 mb-1">兑换码</p>
              <p className="text-lg font-mono font-bold text-purple-600 select-all">
                {winningPrize.code}
              </p>
            </div>
            <p className="text-xs text-gray-500">
              请截图保存兑换码，凭码领取奖品
            </p>
          </div>
        )}
      </Dialog>
    </div>
  );
}
