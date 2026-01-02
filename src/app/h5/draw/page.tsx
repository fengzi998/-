'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

interface Prize {
  id: number;
  name: string;
  probability: number;
}

function DrawPageContent() {
  const searchParams = useSearchParams();
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [resultVisible, setResultVisible] = useState(false);
  const [winningPrize, setWinningPr] = useState<{ name: string; code: string } | null>(null);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const decoded = JSON.parse(atob(decodeURIComponent(data)));
        setPrizes(decoded.prizes || []);
      } catch (error) {
        console.error('Failed to decode prize data:', error);
      }
    } else {
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
    if (spinning) return;
    setSpinning(true);

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

    const segmentAngle = 360 / prizes.length;
    const targetAngle = 360 * 5 + (360 - winningPrizeIndex * segmentAngle - segmentAngle / 2);
    setRotation(targetAngle);

    setTimeout(() => {
      setSpinning(false);
      const prize = prizes[winningPrizeIndex];
      const redeemCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      setWinningPr({ name: prize.name, code: redeemCode });
      setResultVisible(true);
    }, 3000);
  };

  const getPrizeColor = (index: number) => {
    const colors = ['#7C3AED', '#A855F7', '#C084FC', '#9333EA', '#6D28D9'];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-draw flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-300 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
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

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {prizes.length > 0 ? (
            <div className="flex flex-col items-center">
              <div className="relative w-64 h-64">
                <svg
                  className="w-full h-full transition-transform duration-3000 ease-out"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                  }}
                  viewBox="0 0 200 200"
                >
                  {prizes.map((prize, index) => {
                    const angle = (index * 360) / prizes.length;
                    const nextAngle = ((index + 1) * 360) / prizes.length;
                    const startAngle = (angle - 90) * (Math.PI / 180);
                    const endAngle = (nextAngle - 90) * (Math.PI / 180);
                    const largeArcFlag = nextAngle - angle > 180 ? 1 : 0;

                    const x1 = 100 + 95 * Math.cos(startAngle);
                    const y1 = 100 + 95 * Math.sin(startAngle);
                    const x2 = 100 + 95 * Math.cos(endAngle);
                    const y2 = 100 + 95 * Math.sin(endAngle);

                    return (
                      <g key={prize.id}>
                        <path
                          d={`M 100 100 L ${x1} ${y1} A 95 95 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                          fill={getPrizeColor(index)}
                          stroke="#fff"
                          strokeWidth="2"
                        />
                        <text
                          x={100 + 60 * Math.cos((startAngle + endAngle) / 2)}
                          y={100 + 60 * Math.sin((startAngle + endAngle) / 2)}
                          fill="white"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`rotate(${angle + nextAngle - 90}, ${100 + 60 * Math.cos((startAngle + endAngle) / 2)}, ${100 + 60 * Math.sin((startAngle + endAngle) / 2)})`}
                        >
                          {prize.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform"
                     onClick={handleDraw}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  {spinning ? '抽奖中...' : '点击转盘开始抽奖'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-20">
              <div className="animate-pulse">加载中...</div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <p className="text-white/70 text-xs">
            活动最终解释权归主办方所有
          </p>
        </div>
      </div>

      {resultVisible && winningPrize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                🎉 恭喜中奖
              </h3>
              <p className="text-2xl font-bold text-purple-600 mb-4">
                {winningPrize.name}
              </p>
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">兑换码</p>
                <p className="text-xl font-mono font-bold text-purple-600 select-all tracking-wider">
                  {winningPrize.code}
                </p>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                请截图保存兑换码，凭码领取奖品
              </p>
              <button
                onClick={() => setResultVisible(false)}
                className="w-full bg-gradient-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DrawPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-draw flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    }>
      <DrawPageContent />
    </Suspense>
  );
}
