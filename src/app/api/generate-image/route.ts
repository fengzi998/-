import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/lib/replicate';
import { uploadImageToCOS } from '@/lib/cos';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, projectId, width, height } = body;

    // 验证请求
    if (!prompt) {
      return NextResponse.json(
        { error: '请输入图片描述' },
        { status: 400 }
      );
    }

    // 调用 Replicate API 生成图片
    console.log(`[Replicate] Generating image with prompt: "${prompt}"`);
    const imageUrl = await generateImage(prompt, {
      width: width || 1024,
      height: height || 1024,
      numOutputs: 1,
    });

    // 下载图片并上传到腾讯云 COS
    let finalUrl = imageUrl;
    try {
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      const fileName = `${Date.now()}.png`;

      finalUrl = await uploadImageToCOS(imageBuffer, fileName, 'image/png');
      console.log(`[COS] Image uploaded: ${finalUrl}`);
    } catch (cosError) {
      console.error('Failed to upload to COS, using Replicate URL:', cosError);
      // 如果 COS 上传失败，仍然使用 Replicate 的 URL
    }

    // 如果提供了 projectId，保存到数据库
    if (projectId) {
      try {
        const asset = await prisma.asset.create({
          data: {
            projectId,
            type: 'poster',
            url: finalUrl,
            title: prompt.substring(0, 50),
            metadata: {
              prompt,
              width,
              height,
            },
          },
        });
        console.log(`[DB] Asset saved: ${asset.id}`);
      } catch (dbError) {
        console.error('Failed to save asset to database:', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      url: finalUrl,
    });
  } catch (error) {
    console.error('Error in /api/generate-image:', error);

    return NextResponse.json(
      {
        error: '图片生成失败，请重试',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
