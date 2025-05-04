import { ObjectId } from 'mongodb'

export type GabanDocument = {
  _id: ObjectId
  name: string
  creater: string
  created: number
  pixels: Pixels
  size: {
    x: number
    y: number
  }
}
export type Pixels = Record<`${number},${number}`, string>
export type RecordDocument = {
  _id: ObjectId
  creater: string
  ip: string
  created: number
  gaban: ObjectId
  location: {
    x: number
    y: number
  }
  color: string
}