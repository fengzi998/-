import StrategyBrain from '@/components/StrategyBrain';
import VisualStudio from '@/components/VisualStudio';
import ReportPreview from '@/components/ReportPreview';
import InteractionSetup from '@/components/InteractionSetup';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-medical-100 to-purple-50 p-4 md:p-6">
      {/* Header */}
      <header className="mb-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">医疗美容 AI 营销平台</h1>
            <p className="text-sm text-gray-500">AI-Powered Marketing SaaS for Medical Aesthetics</p>
          </div>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6 h-[calc(100vh-140px)]">
        {/* Left: StrategyBrain (40%) */}
        <div className="lg:col-span-2 card-base card-hover animate-fade-in overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">策略生成</h2>
            </div>
            <span className="text-xs px-2 py-1 bg-gradient-primary text-white rounded-full shadow-sm">AI</span>
          </div>
          <StrategyBrain />
        </div>

        {/* Right: Vertical Stack (60%) */}
        <div className="lg:col-span-3 flex flex-col gap-4 md:gap-6">
          {/* VisualStudio */}
          <div className="card-base card-hover animate-fade-in overflow-hidden" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-800">图片编辑</h2>
              </div>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">Flux AI</span>
            </div>
            <VisualStudio />
          </div>

          {/* ReportPreview + InteractionSetup (Row) */}
          <div className="flex gap-4 md:gap-6 flex-1">
            {/* ReportPreview */}
            <div className="card-base card-hover animate-fade-in overflow-hidden flex-1" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-base font-semibold text-gray-800">报告预览</h2>
                </div>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded-full">H5</span>
              </div>
              <ReportPreview />
            </div>

            {/* InteractionSetup */}
            <div className="card-base card-hover animate-fade-in overflow-hidden flex-1" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <h2 className="text-base font-semibold text-gray-800">抽奖配置</h2>
                </div>
                <span className="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded-full">H5</span>
              </div>
              <InteractionSetup />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
