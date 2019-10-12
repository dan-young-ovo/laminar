import { laminar } from '@ovotech/laminar';
import { createJwtSecurity, JWTContext, JWTSecurity } from '@ovotech/laminar-jwt';
import { createOapi } from '@ovotech/laminar-oapi';
import { join } from 'path';

const start = async (): Promise<void> => {
  const jwtSecurity = createJwtSecurity('secret');
  const app = await createOapi<JWTContext>({
    api: join(__dirname, 'oapi.yaml'),
    security: { JWTSecurity },
    paths: {
      '/session': {
        post: ({ createSession, body }) => createSession(body),
      },
      '/test': {
        get: ({ authInfo }) => ({ text: 'ok', user: authInfo }),
        post: ({ authInfo }) => ({ text: 'ok', user: authInfo }),
      },
    },
  });
  const server = await laminar({ port: 3333, app: jwtSecurity(app) });
  console.log('Started', server.address());
};

start();
