This project demonstrates how to integrate and utilize the powerful Odyssey API to create a dynamic and interactive chat application. With this example, you'll learn how to fetch and post data using the Odyssey API in a Next.js environment, making it easier to build robust applications.

## Getting Started

Create .env file in root directory with following environment variables:

```bash
API_KEY=
API_ENDPOINT=https://app.odysseyai.ai
```

[How to get API Key](https://odyssey-docs-preview.vercel.app/docs/intro#getting-an-api-key)

Install dependencies:

```bash
npm i
# or
yarn install
```

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

All Odyssey API calls are made from `pages/api/*` routes.

## Example API Calls

### Get Team Members

```javascript
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
```

### Get Workspace ID

```javascript
export default async function handler(req, res) {
  const { userid } = req.headers;

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
```

### Get Conversations

```javascript
export default async function handler(req, res) {
  const { workspaceId } = req.query;
  const { userid } = req.headers;

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
```

### Get messages

```javascript
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
```

### Send message

```javascript
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
```

## Learn More

To learn more about Odyssey, take a look at the following resources:

- [Documentation](https://odyssey-docs-preview.vercel.app/) - learn about Odyssey API
- [Odyssey AI](https://app.odysseyai.ai/) - use Odyssey AI App

