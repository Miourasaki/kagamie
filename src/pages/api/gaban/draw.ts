import { NextApiRequest } from 'next'
import { connectToDatabase } from '../../../lib/db'
import { ObjectId } from 'mongodb'
import { withMethod } from '@/lib/withMethod'
import { GabanDocument } from '@/models/types'
import SocketManager from '@/lib/socket'
import crypto from 'crypto'
function getClientIp(req: NextApiRequest) {
    const cfIp = req.headers['cf-connecting-ip']
    if (cfIp) return Array.isArray(cfIp) ? cfIp[0] : cfIp

    const forwarded = req.headers['x-forwarded-for']
    if (forwarded) {
        return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]
    }

    return req.socket.remoteAddress || 'unknown'
}
function normalizeColor(color: string): string | null {
    const cleanColor = color.startsWith('#') ? color.slice(1) : color

    if (/^[0-9A-Fa-f]{3}$/.test(cleanColor)) {
        return `#${cleanColor.split('').map(c => c + c).join('')}`.toUpperCase()
    }

    if (/^[0-9A-Fa-f]{6}$/.test(cleanColor)) {
        return `#${cleanColor}`.toUpperCase()
    }

    return null
}


export default withMethod(['POST'], async (req, res) => {
    const { db } = await connectToDatabase()
    const io = SocketManager.getGabanNamespace()

    try {
        const { gabanId, x, y, color, token } = req.body

        // 参数基础校验
        if (!gabanId || x === undefined || y === undefined || !color) {
            return res.status(400).json({ error: 'Missing parameters' })
        }

        const normalizedColor = normalizeColor(color)
        if (!normalizedColor) {
            return res.status(400).json({ error: 'Invalid color format. Must be 3 or 6 character hex code without alpha.' })
        }

        // 坐标类型转换
        const xNum = Number(x)
        const yNum = Number(y)
        if (isNaN(xNum) || isNaN(yNum)) {
            return res.status(400).json({ error: 'Coordinate format error' })
        }

        // 获取画板数据
        const gaban = await db.collection<GabanDocument>('gaban').findOne({
            _id: new ObjectId(gabanId as string)
        })
        if (!gaban) return res.status(404).json({ error: 'Gaban not found' })

        // 坐标边界校验
        if (
            xNum < 0 || xNum >= gaban.size.x ||
            yNum < 0 || yNum >= gaban.size.y
        ) {
            return res.status(400).json({ error: 'Coordinates out of bounds' })
        }

        // 颜色对比校验
        const pixelKey = `${xNum},${yNum}` as const
        const currentColor = gaban.pixels[pixelKey]
        if (currentColor === normalizedColor) {
            return res.status(400).json({ error: 'Color exist' })
        }

        // 生成用户标识（在颜色校验之后）
        let userIdentifier = 'Guest#unknown'
        if (token) {
            // TODO: 用户系统实现
        } else {
            const ip = getClientIp(req)

            const headers = req.headers;
            const fingerprint = {
                userAgent: headers['user-agent'] || '',
                ip: ip,
                accept: headers['accept'] || '',
                acceptEncoding: headers['accept-encoding'] || '',
                acceptLanguage: headers['accept-language'] || '',
                connection: headers['connection'] || '',
                // 可以添加更多头部信息
                screenResolution: req.query.screenResolution || '', // 需要前端传递
                timezone: req.query.timezone || '', // 需要前端传递
                plugins: req.query.plugins || '', // 需要前端传递
                fonts: req.query.fonts || '', // 需要前端传递
                // 添加时间因素减少碰撞
                timestamp: Date.now()
            };
            const fingerprintString = JSON.stringify(fingerprint)
            // const hash = Buffer.from(JSON.stringify(fingerprint)).toString('base64').slice(0, 10)
            const hash = crypto.createHash('sha256')
                .update(fingerprintString)
                .digest('hex')
                .slice(0, 10); // 取前16位
            userIdentifier = `Guest#${hash}`
        }

        // 限流检查（仅在实际修改前执行）
        const lastMinute = Date.now() - 60 * 1000
        const requestCount = await db.collection('records').countDocuments({
            creater: userIdentifier,
            created: { $gte: lastMinute }
        })
        if (requestCount >= 60) {
            return res.status(429).json({ error: 'Too Many Request' })
        }

        // 执行像素更新
        await db.collection('gaban').updateOne(
            { _id: gaban._id },
            { $set: { [`pixels.${pixelKey}`]: normalizedColor } }
        )

        // 记录操作历史
        const record = {
            creater: userIdentifier,
            ip: getClientIp(req),
            created: Date.now(),
            gaban: gaban._id,
            location: { x: xNum, y: yNum },
            color: normalizedColor
        }
        await db.collection('records').insertOne(record)

        io.to('gaban-' + gaban._id.toString()).emit('draw', {
            x: xNum,
            y: yNum,
            color: normalizedColor,
            updatedAt: Date.now()
        })

        return res.status(204).end()
    } catch (err) {
        console.error(err + '')
        return res.status(500).json({ error: err + '' })
    }
})