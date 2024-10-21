import { NextApiRequest } from 'next';

declare global {
  namespace jest {
    interface MockedNextApiRequest extends NextApiRequest {
      _setParameter: (key: string, value?: string) => void;
      _addBody: (key: string, value: any) => void;
    }
  }
}
