import * as Yup from 'yup';

declare module 'yup' {
  interface AnyObjectSchema extends Yup.ObjectSchema<any> {}
}
