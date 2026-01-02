'use client';

import { useState } from 'react';

interface Prize {
  id: number;
  name: string;
  probability: number;
}

export default function InteractionSetup() {
  const [prizes, setPrizes] = useState<Prize[]>([
    { id: 1, name: '免费体验券', probability: 0.1 },
    { id: 2, name: '8折优惠券', probability: 0.2 },
    { id: 3, name: '9折优惠券', probability: 0.3 },
    { id: 4, name: '精美礼品', probability: 0.15 },
    { id: 5, name: '再接再厉', probability: 0.25 },
  ]);

  const [linkGenerated, setLinkGenerated] = useState(false);
  const [drawLink, setDrawLink] = useState('');

  // 更新奖品
  const updatePrize = (id: number, field: 'name' | 'probability', value: string | number) => {
    setPrizes((prev) =>
      prev.map((prize) =>
        prize.id === id ? { ...prize, [field]: value } : prize
      )
    );
  };

  // 添加奖品
  const addPrize = () => {
    const newId = Math.max(...prizes.map((p) => p.id)) + 1;
    setPrizes((prev) => [
      ...prev,
      { id: newId, name: '新奖品', probability: 0.1 },
    ]);
  };

  // 删除奖品
  const removePrize = (id: number) => {
    setPrizes((prev) => prev.filter((prize) => prize.id !== id));
  };

  // 生成抽奖链接
  const generateDrawLink = () => {
    const data = {
      prizes: prizes.map((p) => ({
        id: p.id,
        name: p.name,
        probability: p.probability,
      })),
    };

    // Base64 编码
    const encoded = btoa(JSON.stringify(data));
    const link = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/h5/draw?data=${encodeURIComponent(encoded)}`;

    setDrawLink(link);
    setLinkGenerated(true);
  };

  // 复制链接
  const copyLink = () => {
    navigator.clipboard.writeText(drawLink);
    alert('链接已复制到剪贴板！');
  };

  return (
    <div className="h-full flex flex-col">
      {/* 奖品列表 */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {prizes.map((prize) => (
          <div key={prize.id} className="flex gap-2 items-center">
            <input
              type="text"
              value={prize.name}
              onChange={(e) => updatePrize(prize.id, 'name', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="奖品名称"
            />
            <input
              type="number"
              value={prize.probability}
              onChange={(e) => updatePrize(prize.id, 'probability', parseFloat(e.target.value) || 0)}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="概率"
              min="0"
              max="1"
              step="0.01"
            />
            <button
              onClick={() => removePrize(prize.id)}
              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
            >
              删除
            </button>
          </div>
        ))}
      </div>

      {/* 操作按钮 */}
      <div className="space-y-2">
        <button
          onClick={addPrize}
          className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
        >
          添加奖品
        </button>
        <button
          onClick={generateDrawLink}
          className="w-full px-4 py-2 bg-[#7C3AED] text-white rounded-lg hover:bg-[#6D28D9] text-sm"
        >
          生成抽奖链接
        </button>

        {linkGenerated && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-600 mb-2">抽奖链接：</p>
            <p className="text-xs text-gray-800 break-all mb-2">{drawLink}</p>
            <button
              onClick={copyLink}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
            >
              复制链接
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
