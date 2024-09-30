import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateResponse(prompt: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-002' })
  const result = await model.generateContent(prompt)
  return result.response.text()
}