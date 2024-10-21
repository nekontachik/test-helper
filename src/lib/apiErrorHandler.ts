import { NextApiResponse } from 'next';

export const apiErrorHandler = (res: NextApiResponse, error: unknown) => {
  console.error(error);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
};
