import axios from 'axios';
import { generateResponse } from './gemini';

export async function scrapeLinkedIn(profileUrl: string): Promise<any> {
  const options = {
    method: 'POST',
    url: 'https://linkedin-bulk-data-scraper.p.rapidapi.com/person_data_with_open_to_work_flag',
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      'x-rapidapi-host': 'linkedin-bulk-data-scraper.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    data: {
      link: profileUrl
    }
  };

  try {
    const response = await axios.request(options);
    const linkedinData = response.data;

    const prompt = `
    Summarize the following LinkedIn profile data:
    ${JSON.stringify(linkedinData)}

    Provide a concise summary focusing on key professional details.
    `;

    const summary = await generateResponse(prompt);
    return summary;
  } catch (error) {
    console.error('Error scraping LinkedIn:', error);
    throw error;
  }
}