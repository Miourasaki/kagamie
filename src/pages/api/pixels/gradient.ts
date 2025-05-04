// pages/api/gradient/generate.ts
import { NextApiRequest, NextApiResponse } from 'next';

// 修正后的颜色混合函数
const mixColors = (color1: string, color2: string, ratio: number): string => {
  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);
  
  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);
  
  const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
  const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// 生成更复杂的多色渐变
const generateGradient = (x: number, y: number, width: number, height: number): string => {
  // 定义4个角颜色
  const topLeft = '#FF0000';     // 红
  const topRight = '#00FF00';    // 绿
  const bottomLeft = '#0000FF';  // 蓝
  const bottomRight = '#FFFF00'; // 黄
  
  // 计算水平和垂直比例
  const xRatio = x / width;
  const yRatio = y / height;
  
  // 先水平混合顶部和底部
  const topColor = mixColors(topLeft, topRight, xRatio);
  const bottomColor = mixColors(bottomLeft, bottomRight, xRatio);
  
  // 然后垂直混合结果
  return mixColors(topColor, bottomColor, yRatio);
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const width = parseInt(req.query.width as string) || 2000;
    const height = parseInt(req.query.height as string) || 2000;
    
    const MAX_SIZE = 5000;
    if (width > MAX_SIZE || height > MAX_SIZE) {
      return res.status(400).json({ error: `尺寸不能超过${MAX_SIZE}x${MAX_SIZE}` });
    }

    const pixels: Record<string, string> = {};
    
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        // 使用改进的渐变生成函数
        pixels[`${x}_${y}`] = generateGradient(x, y, width, height);
      }
    }

    res.status(200).json({
      width,
      height,
      pixels,
      generatedAt: new Date().toISOString(),
      totalPixels: width * height,
      description: "四角渐变(红、绿、蓝、黄)"
    });
  } catch (error) {
    console.error('生成渐变数据时出错:', error);
    res.status(500).json({ error: '生成渐变数据时出错' });
  }
}