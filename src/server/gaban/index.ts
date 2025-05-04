// /src/server/gaban/index.ts
import { connectToDatabase } from '@/lib/db';
import { GabanDocument } from '@/models/types';
import { Router } from 'express';
import { ObjectId } from 'mongodb';

const router = Router();

router.get('', async (req, res) => {
  const { db } = await connectToDatabase();
  const { id } = req.query;

  try {
    let gaban: GabanDocument | null = null;

    if (id) {
      gaban = await db.collection<GabanDocument>('gaban').findOne({
        _id: new ObjectId(id as string)
      });
    }

    if (!gaban) {
      gaban = await db.collection<GabanDocument>('gaban').findOne({
        name: 'default'
      });
    }

    if (!gaban) {
      const newGaban = {
        name: 'default',
        creater: 'System',
        created: Date.now(),
        pixels: {},
        size: { x: 300, y: 300 }
      };

      const result = await db.collection('gaban').insertOne(newGaban);
      gaban = { ...newGaban, _id: result.insertedId };
    }

    res.status(200).json({
      ...gaban,
      _id: gaban._id.toString()
    });
  } catch (err) {
    res.status(500).json({ error: err + "" });
  }
});

export default router;