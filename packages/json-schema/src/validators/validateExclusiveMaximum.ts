import { HasError, NoErrors } from '../helpers';
import { Validator } from '../types';

export const validateExclusiveMaximum: Validator = (schema, value, { name }) =>
  typeof schema.exclusiveMaximum === 'number' && value >= schema.exclusiveMaximum!
    ? HasError('exclusiveMaximum', name, schema.exclusiveMaximum)
    : NoErrors;
