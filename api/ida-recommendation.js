import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const jsonPath = path.join(process.cwd(), 'ida_recommendation_latest.json');
    if (fs.existsSync(jsonPath)) {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      return res.status(200).json(data);
    }
    
    // In caz ca fisierul e la un nivel mai sus sau nu exista pe Vercel
    res.status(200).json({
      status: "fallback",
      message: "No latest JSON found"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
