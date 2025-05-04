// pages/api/pixels/generate.ts
import { NextApiRequest, NextApiResponse } from 'next';

// 生成随机十六进制颜色
const getRandomColor = (): string => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // 只允许GET请求
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // 从查询参数获取尺寸，默认为2000x2000
    const width = parseInt(req.query.width as string) || 2000;
    const height = parseInt(req.query.height as string) || 2000;
    
    // 限制最大尺寸防止内存问题
    const MAX_SIZE = 5000;
    if (width > MAX_SIZE || height > MAX_SIZE) {
      return res.status(400).json({ error: `尺寸不能超过${MAX_SIZE}x${MAX_SIZE}` });
    }

    // 生成像素数据 - 使用扁平化结构 { "x_y": "#color" }
    const pixels: Record<string, string> = {};
    
    // 你可以调整这个循环来生成更少数据用于测试
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        // 随机决定是否设置像素（模拟稀疏数据）
        if (Math.random() > 0.7) { // 约30%的像素会有颜色
          pixels[`${x}_${y}`] = getRandomColor();
        }
      }
    }

    res.status(200).json({
      width,
      height,
      pixels,
      generatedAt: new Date().toISOString(),
      totalPixels: Object.keys(pixels).length
    });
  } catch (error) {
    console.error('生成像素数据时出错:', error);
    res.status(500).json({ error: '生成像素数据时出错' });
  }
}