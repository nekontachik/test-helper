import type { AnyObject } from 'yup';
import type { ObjectSchema as _ObjectSchema } from 'yup';

declare module 'yup' {
  // Using type alias instead of empty interface
  type ExtendedObjectSchema<
    TShape extends AnyObject,
    TContext = unknown,
    TOut = TShape extends {
      [key: string]: unknown;
    }
      ? TShape
      : unknown
  > = _ObjectSchema<TShape, TContext, TOut>;
}
