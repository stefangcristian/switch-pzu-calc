export default async function handler(req, res) {
  // CORS setup just in case it's called cross-origin
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Generate dates for the current day (yesterday 21:00 to today 21:00)
    // Transelectrica uses intervals like this for the operational day.
    // For simplicity, we just take the last 24h.
    const toDate = new Date();
    toDate.setMinutes(toDate.getMinutes() + 60); // give some buffer
    const fromDate = new Date(toDate.getTime() - 24 * 60 * 60 * 1000);

    const fromStr = fromDate.toISOString();
    const toStr = toDate.toISOString();

    const url = `https://newmarkets.transelectrica.ro/usy-durom-publicreportg01/00121002500000000000000000000100/publicReport/estimatedImbalancePrices?timeInterval.from=${encodeURIComponent(fromStr)}&timeInterval.to=${encodeURIComponent(toStr)}&pageInfo.pageSize=3000`;

    const fetchRes = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Vercel-Proxy'
      }
    });

    if (!fetchRes.ok) {
      throw new Error(`Failed to fetch from Transelectrica: ${fetchRes.status}`);
    }

    const data = await fetchRes.json();
    
    // We just return the entire itemList, frontend will process it to find the current interval
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
