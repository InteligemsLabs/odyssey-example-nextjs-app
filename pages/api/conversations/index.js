export default async function handler(req, res) {
  const { workspaceId } = req.query;
  const { userid } = req.headers;

  if (req.method === 'GET') {
    const response = await fetch(
      `${process.env.API_ENDPOINT}/api/conversations?workspaceId=${workspaceId}`,
      {
        headers: {
          "x-api-key": process.env.API_KEY,
          userId: userid,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return res.status(200).json(data);
    }

    return res.status(response.status).json({ message: response.statusText });
  }
  
  else if (req.method === 'POST') {
    try {
      const response = await fetch(
        `${process.env.API_ENDPOINT}/api/conversations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.API_KEY,
            userId: userid,
          },
          body: JSON.stringify({
            ...req.body,
            workspaceId,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return res.status(201).json(data);
      }

      return res.status(response.status).json({ message: response.statusText });
    } catch (error) {
      console.error('Error creating conversation:', error);
      return res.status(500).json({ message: 'Failed to create conversation' });
    }
  }
  
  else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}