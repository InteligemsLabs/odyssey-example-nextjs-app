export default async function handler(req, res) {
  const { workspaceId, conversationId, message } = req.body;
  const { userid } = req.headers;

  const response = await fetch(
    `${process.env.API_ENDPOINT}/api/chat/message`,
    {
      method: 'POST',
      headers: {
        "x-api-key": process.env.API_KEY,
        userId: userid,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspaceId,
        conversationId,
        message
      }),
    }
  );

  if (response.ok) {
    const data = await response.json();
    return res.status(200).json(data);
  }

  return res.status(500).json({ message: "Internal server error" });
}
