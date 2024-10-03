import type { NextApiRequest, NextApiResponse } from 'next';
import { generateResponse } from '../../../lib/gemini';
import { parseResume } from '../../../lib/resumeParser';
import { scrapeLinkedIn } from '../../../lib/linkedinScraper';

export const config = {
  api: {
    bodyParser: false,
  },
};

let conversationHistory = '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { message, resumePath, linkedinUrl } = req.body;

    try {
      let context = '';

      if (resumePath) {
        const resumeData = await parseResume(resumePath);
        context += `Resume data: ${resumeData}\n\n`;
      }

      if (linkedinUrl) {
        const linkedinData = await scrapeLinkedIn(linkedinUrl);
        context += `LinkedIn data: ${linkedinData}\n\n`;
      }

      conversationHistory += `Human: ${message}\n`;

      const prompt = `
      You are Sage, a wise and friendly AI career advisor designed to help young professionals and freshers discover their potential. Your goal is to create a compelling profile of the candidate through engaging conversation. Follow these guidelines:

      1. Adopt a casual, Gen Z-friendly tone while maintaining professionalism.
      2. Ask open-ended questions that encourage storytelling and self-reflection.
      3. Use a layered questioning approach, starting broad and getting more specific.
      4. Adapt your questions based on the candidate's responses.
      5. Look for unique experiences, skills, and personality traits.
      6. Encourage the candidate to elaborate on their answers.
      7. Summarize key insights periodically.
      8. At the end, generate a comprehensive profile highlighting the candidate's strengths, potential career paths, and areas for growth.

      Context:
      ${context}

      Conversation history:
      ${conversationHistory}

      AI: `;

      const response = await generateResponse(prompt);
      conversationHistory += `AI: ${response}\n`;

      res.status(200).json({ response });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate response' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}