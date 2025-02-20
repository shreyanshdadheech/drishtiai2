import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, password, serverPath } = req.body;

    if (!email || !password || !serverPath) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const usersFilePath = path.join(serverPath, 'bioscan_users.json');

    try {
      fs.writeFileSync(usersFilePath, JSON.stringify({ email, password }));
      return res.status(200).json({ message: 'User data saved successfully' });
    } catch (error) {
      console.error('Failed to save user data:', error);
      return res.status(500).json({ error: 'Failed to save user data' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
