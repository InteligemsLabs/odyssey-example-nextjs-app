export default async function handler(req, res) {
  const { workspaceId, conversationId } = req.query;
  const { userid } = req.headers;

  const response = await fetch(
    `${process.env.API_ENDPOINT}/api/chat/messages?workspaceId=${workspaceId}&conversationId=${conversationId}`,
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