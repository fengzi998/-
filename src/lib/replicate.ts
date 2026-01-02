// Replicate API 客户端

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN?.replace('export REPLICATE_API_TOKEN=', '');

export interface ReplicateImageRequest {
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
  num_outputs?: number;
}

export interface ReplicateImageResponse {
  url?: string;
  error?: string;
  output?: string[];
}

/**
 * 调用 Replicate API 生成图片（使用 Flux-schnell 模型）
 */
export async function generateImage(
  prompt: string,
  options: {
    width?: number;
    height?: number;
    numOutputs?: number;
  } = {}
): Promise<string> {
  try {
    // 清理 token
    const token = REPLICATE_API_TOKEN?.trim();
    if (!token) {
      throw new Error('REPLICATE_API_TOKEN is not configured');
    }

    // Flux-schnell 模型
    const model = 'black-forest-labs/flux-schnell';

    // 启动预测
    const startResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: '55e2faacfa42c4ae0eb11b7d413c78f5fdedcb5c4e3424a4e0265dc4b74f757e', // Flux-schnell
        input: {
          prompt,
          width: options.width || 1024,
          height: options.height || 1024,
          num_outputs: options.numOutputs || 1,
        },
      }),
    });

    if (!startResponse.ok) {
      const errorText = await startResponse.text();
      throw new Error(`Replicate API error: ${startResponse.status} - ${errorText}`);
    }

    let prediction = await startResponse.json();

    // 轮询直到生成完成
    let status = prediction.status;
    while (status === 'starting' || status === 'processing') {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const statusResponse = await fetch(prediction.urls.get, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      prediction = await statusResponse.json();
      status = prediction.status;
    }

    if (status === 'succeeded' && prediction.output && prediction.output.length > 0) {
      return prediction.output[0];
    } else if (status === 'failed') {
      throw new Error(`Image generation failed: ${prediction.error}`);
    } else {
      throw new Error('Unknown error occurred during image generation');
    }
  } catch (error) {
    console.error('Failed to generate image:', error);
    throw error;
  }
}
