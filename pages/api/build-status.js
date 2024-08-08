export default async function handler(req, res) {
  const { userid } = req.headers;

  console.log('userId', req.headers)
  const response = await fetch(
    `${process.env.API_ENDPOINT}/api/build-status`,
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

  console.log(response)

  return res.status(response.status).json({ message: response.statusText });
}