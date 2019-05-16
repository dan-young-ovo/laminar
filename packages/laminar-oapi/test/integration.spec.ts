import { laminar, response } from '@ovotech/laminar';
import { oapi } from '@ovotech/laminar-oapi';
import { createServer, Server } from 'http';
import fetch from 'node-fetch';
import { join } from 'path';

let server: Server;

export type Pet = NewPet & {
  id: number;
  [key: string]: any;
};

export interface NewPet {
  name: string;
  tag?: string;
  [key: string]: any;
}

describe('Integration', () => {
  afterEach(async () => {
    await new Promise(resolve => server.close(resolve));
  });

  it('Should process response', async () => {
    const db: Pet[] = [{ id: 111, name: 'Catty', tag: 'kitten' }, { id: 222, name: 'Doggy' }];
    const yamlFile = join(__dirname, 'integration.yaml');

    const paths = {
      '/pets': {
        get: () => db,
        post: ({ body }: { body: NewPet }) => {
          const pet = { ...body, id: db.reduce((id, item) => Math.max(item.id, id), 0) + 1 };
          db.push(pet);
          return pet;
        },
      },
      '/pets/{id}': {
        get: ({ path }: { path: { id: string } }) =>
          db.find(item => item.id === Number(path.id)) ||
          response({ status: 404, body: { code: 123, message: 'Not Found' } }),
        delete: ({ path }: { path: { id: string } }) => {
          const index = db.findIndex(item => item.id === Number(path.id));
          if (index !== -1) {
            delete db[index];
            return response({ status: 204 });
          } else {
            return response({ status: 404, body: { code: 12, message: 'Item not found' } });
          }
        },
      },
    };

    const app = await oapi({ yamlFile, paths });
    server = createServer(laminar(app));

    await new Promise(resolve => server.listen(8093, resolve));

    const baseUrl = 'http://localhost:8093';

    expect(await (await fetch(`${baseUrl}/pets`)).json()).toEqual([
      { id: 111, name: 'Catty', tag: 'kitten' },
      { id: 222, name: 'Doggy' },
    ]);

    const added = await fetch(`${baseUrl}/pets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Puppy' }),
    });

    expect(await added.json()).toEqual({ id: 223, name: 'New Puppy' });

    expect(await (await fetch(`${baseUrl}/pets/111`)).json()).toEqual({
      id: 111,
      name: 'Catty',
      tag: 'kitten',
    });

    expect(await (await fetch(`${baseUrl}/pets/223`)).json()).toEqual({
      id: 223,
      name: 'New Puppy',
    });

    expect(await (await fetch(`${baseUrl}/pets`)).json()).toEqual([
      { id: 111, name: 'Catty', tag: 'kitten' },
      { id: 222, name: 'Doggy' },
      { id: 223, name: 'New Puppy' },
    ]);

    const deleteReponse = await fetch(`${baseUrl}/pets/222`, {
      method: 'DELETE',
    });

    expect(deleteReponse.status).toEqual(204);
  });
});
