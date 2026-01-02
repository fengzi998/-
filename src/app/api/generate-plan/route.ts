import { NextRequest, NextResponse } from 'next/server';
import { generateMarketingPlan } from '@/lib/dify';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, userId } = body;

    // 验证请求
    if (!prompt) {
      return NextResponse.json(
        { error: '请输入营销需求' },
        { status: 400 }
      );
    }

    // 调用 Dify API 生成策略
    const strategy = await generateMarketingPlan(prompt, undefined, userId || 'anonymous');

    // 如果提供了 userId，保存到数据库
    if (userId) {
      // TODO: 实际项目中保存用户输入和生成的策略
      console.log(`[DB] Strategy saved for user ${userId}`);
    }

    return NextResponse.json({
      success: true,
      strategy,
    });
  } catch (error) {
    console.error('Error in /api/generate-plan:', error);

    return NextResponse.json(
      {
        error: '策略生成失败，请重试',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
