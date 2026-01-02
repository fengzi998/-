// Dify API 客户端

const DIFY_API_KEY = process.env.DIFY_API_KEY;
const DIFY_API_URL = process.env.DIFY_API_URL || 'https://api.dify.ai/v1';

export interface DifyGenerateRequest {
  inputs: {
    goal: string;
    budget?: string;
  };
  response_mode?: 'blocking' | 'streaming';
  user: string;
}

export interface DifyGenerateResponse {
  answer?: string;
  data?: {
    answer: string;
  };
  error?: string;
}

/**
 * 调用 Dify API 生成营销策略
 */
export async function generateMarketingPlan(
  goal: string,
  budget?: string,
  userId: string = 'anonymous'
): Promise<string> {
  try {
    const payload: DifyGenerateRequest = {
      inputs: {
        goal,
        budget: budget || 'medium',
      },
      response_mode: 'blocking',
      user: userId,
    };

    const response = await fetch(`${DIFY_API_URL}/datasets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Dify API error: ${response.status} - ${errorText}`);
    }

    const data: DifyGenerateResponse = await response.json();

    // 根据实际 API 响应结构提取答案
    if (data.answer) {
      return data.answer;
    } else if (data.data?.answer) {
      return data.data.answer;
    } else {
      throw new Error('Invalid response format from Dify API');
    }
  } catch (error) {
    console.error('Failed to generate marketing plan:', error);
    throw error;
  }
}
