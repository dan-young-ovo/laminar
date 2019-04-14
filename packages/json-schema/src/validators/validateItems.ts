import { childOptions, CombineResults, isJsonSchema, NoErrors, validateSchema } from '../helpers';
import { Validator } from '../types';

export const validateItems: Validator = (schema, value, options) => {
  if (isJsonSchema(schema) && schema.items !== undefined && Array.isArray(value)) {
    const { items, additionalItems } = schema;
    return CombineResults(
      value.map((item, index) => {
        const additional = additionalItems === undefined ? {} : additionalItems;
        const itemSchema = Array.isArray(items)
          ? items[index] === undefined
            ? additional
            : items[index]
          : items;
        return validateSchema(itemSchema, item, childOptions(index, options));
      }, []),
    );
  }
  return NoErrors;
};