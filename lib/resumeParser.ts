import { generateResponse } from './gemini';

export async function parseResume(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const text = await extractTextFromPDF(arrayBuffer);

    const prompt = `
    Extract the following information from the given resume:
    - Name
    - Email
    - Phone
    - Skills
    - Work Experience
    - Education

    Resume:
    ${text}

    Output the information in a JSON format.
    `;

    const result = await generateResponse(prompt);
    return result;
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw error;
  }
}

async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  // We'll use a client-side PDF parsing library here
  const pdfjsLib = await import('pdfjs-dist');
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ');
  }
  return text;
}