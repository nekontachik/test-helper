import { NextApiRequest, NextApiResponse } from 'next';
import { Schema } from 'joi';
import { ValidationError } from '@/lib/errors';

export function validationMiddleware(schema: Schema) {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const { error } = schema.validate(req.body);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }
    next();
  };
}
