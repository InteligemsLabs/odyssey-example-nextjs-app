export default async function handler(req, res) {
  const { slug } = req.query;

  const response = await fetch(
    `${process.env.API_ENDPOINT}/api/teams/${slug}/members`,
    {
      headers: {
        "x-api-key": process.env.API_KEY,
      },
    }
  );

  if (response.ok) {
    const data = await response.json();
    return res.status(200).json(data);
  }

  return res.status(response.status).json({ message: response.statusText });
}