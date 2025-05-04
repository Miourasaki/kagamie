import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '../../../lib/db'
import { ObjectId } from 'mongodb'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { db } = await connectToDatabase()
  
  if (req.method === 'GET') {
    const { gabanId, x, y } = req.query
    if (!gabanId || x === undefined || y === undefined) {
      return res.status(400).json({ error: 'Missing parameters' })
    }
    
    try {
      const gaban = await db.collection('gaban').findOne({
        _id: new ObjectId(gabanId as string)
      })
      
      if (!gaban) return res.status(404).json({ error: 'Gaban not found' })
      
      const xNum = Number(x)
      const yNum = Number(y)
      
      if (
        isNaN(xNum) || isNaN(yNum) ||
        xNum < 0 || xNum >= gaban.size.x ||
        yNum < 0 || yNum >= gaban.size.y
      ) {
        return res.status(400).json({ error: 'Invalid coordinates' })
      }
      
      const records = await db.collection('records')
        .find({
          gaban: new ObjectId(gabanId as string),
          'location.x': xNum,
          'location.y': yNum
        })
        .sort({ created: -1 })
        .toArray()
      
      res.status(200).json(records.map(r => ({
        ...r,
        _id: r._id.toString(),
        gaban: r.gaban.toString()
      })))
    } catch (err) {
      res.status(500).json({ error: err + '' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}