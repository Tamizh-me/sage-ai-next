import { readFile } from 'fs/promises';
import pdf from 'pdf-parse';
import { generateResponse } from './gemini';

export async function parseResume(filePath: string): Promise<string> {
  try {
    const dataBuffer = await readFile(filePath);
    const data = await pdf(dataBuffer);
    
    const prompt = `
    Extract the following information from the given resume:
    - Name
    - Email
    - Phone
    - Skills
    - Work Experience
    - Education

    Resume:
    ${data.text}

    Output the information in a JSON format.
    `;

    const result = await generateResponse(prompt);
    return result;
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw error;
  }
}