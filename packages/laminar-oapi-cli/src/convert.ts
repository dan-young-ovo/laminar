import { resolveRefs } from '@ovotech/json-refs';
import { Node, printNode } from '@ovotech/ts-compose';
import { OpenAPIObject, SchemaObject } from 'openapi3-ts';
import { convertOapi } from './convert-oapi';
import { convertSchema } from './convert-schema';
import { Result } from './traverse';

export const printResult = (node: Result): string => {
  const entries = Object.values(node.context.registry);
  const imports = Object.entries(node.context.imports);

  return [
    ...imports.map(([module, names]) =>
      printNode(Node.Import({ named: names.map(item => ({ name: item })), module })),
    ),
    printNode(node.type),
    ...entries.map(entry => printNode(entry)),
  ].join('\n\n');
};

export const oapiTs = async (original: OpenAPIObject) => {
  const { schema, refs } = await resolveRefs(original);
  return printResult(convertOapi({ root: schema, refs, registry: {}, imports: {} }, schema));
};

export const schemaTs = async (api: SchemaObject) => {
  const { schema, refs } = await resolveRefs(api);
  return printResult(convertSchema({ root: schema, refs, registry: {}, imports: {} }, schema));
};
