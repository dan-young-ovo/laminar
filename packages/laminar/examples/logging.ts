import { get, put, laminar, router, createLogging } from '@ovotech/laminar';

const users: { [key: string]: string } = {
  '1': 'John',
  '2': 'Foo',
};

const logging = createLogging(console);

laminar({
  port: 3333,
  app: logging(
    router(
      get('/.well-known/health-check', () => ({ health: 'ok' })),
      get('/users', () => users),
      get('/users/{id}', ({ path }) => users[path.id]),
      put('/users/{id}', ({ path, body, logger }) => {
        logger.log('info', 'putting');
        users[path.id] = body;
        return users[path.id];
      }),
    ),
  ),
});