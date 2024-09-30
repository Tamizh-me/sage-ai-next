import type { NextApiRequest, NextApiResponse } from 'next'
import { generateResponse } from '../../../lib/gemini'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { prompt } = req.body
    try {
      const response = await generateResponse(prompt)
      res.status(200).json({ response })
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate response' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}