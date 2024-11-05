import { ObjectSchema, AnyObject } from 'yup';

declare module 'yup' {
  interface ObjectSchema<
    TShape extends AnyObject,
    TContext = any,
    TOut = TShape extends {
      [key: string]: any;
    }
      ? TShape
      : any
  > extends ObjectSchema<TShape, TContext, TOut> {}
}
