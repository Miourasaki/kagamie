import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

export function withMethod(allowedMethods: string[], handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (!allowedMethods.includes(req.method!)) {
      res.setHeader('Allow', allowedMethods)
      return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
    return handler(req, res)
  }
}