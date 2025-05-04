import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI!
const dbName = process.env.MONGODB_DB!

let cachedClient: MongoClient
let cachedDb: Db

export async function connectToDatabase() {
  if (cachedClient && cachedDb) return { client: cachedClient, db: cachedDb }
  
  const client = await MongoClient.connect(uri)
  const db = client.db(dbName)
  
  cachedClient = client
  cachedDb = db
  
  return { client, db }
}