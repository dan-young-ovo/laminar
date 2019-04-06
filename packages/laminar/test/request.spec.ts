import { createServer, Server } from 'http';
import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import { laminar } from '../src';

const app = jest.fn().mockReturnValue('Test');
let server: Server;

describe('Requests', () => {
  beforeAll(async () => {
    server = createServer(laminar(app));
    await new Promise(resolve => server.listen(8090, resolve));
  });

  afterAll(async () => {
    await new Promise(resolve => server.close(resolve));
  });

  beforeEach(() => app.mockClear());

  it('Should process request', async () => {
    const result = await fetch('http://localhost:8090/test2');
    expect(app).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.objectContaining({ pathname: '/test2' }),
        headers: expect.objectContaining({ host: 'localhost:8090' }),
        method: 'GET',
      }),
    );
    expect(result.status).toEqual(200);
    await expect(result.text()).resolves.toEqual('Test');
  });

  it('Should parse headers', async () => {
    const result = await fetch('http://localhost:8090/other-test/123', {
      headers: { Authorization: 'Bearer 234', 'Content-Type': 'text/plain' },
    });
    expect(app).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.objectContaining({ pathname: '/other-test/123' }),
        headers: expect.objectContaining({ authorization: 'Bearer 234' }),
        method: 'GET',
      }),
    );
    await expect(result.text()).resolves.toEqual('Test');
  });

  it('Should parse search query', async () => {
    const result = await fetch('http://localhost:8090/me?this=other&last=new', {
      headers: { 'Content-Type': 'text/plain' },
    });
    expect(app).toHaveBeenCalledWith(
      expect.objectContaining({
        query: { this: 'other', last: 'new' },
      }),
    );
    await expect(result.text()).resolves.toEqual('Test');
  });

  it('Should parse cookies', async () => {
    const result = await fetch('http://localhost:8090/login', {
      headers: { 'Content-Type': 'text/plain', cookie: 'accessToken=1234abc; userId=1234' },
    });
    expect(app).toHaveBeenCalledWith(
      expect.objectContaining({
        cookies: { accessToken: '1234abc', userId: '1234' },
      }),
    );
    await expect(result.text()).resolves.toEqual('Test');
  });

  it('Should parse json', async () => {
    const result = await fetch('http://localhost:8090/login', {
      body: JSON.stringify({ test: 'other' }),
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
    });

    expect(app).toHaveBeenCalledWith(
      expect.objectContaining({ body: { test: 'other' }, method: 'POST' }),
    );
    await expect(result.text()).resolves.toEqual('Test');
  });

  it('Should parse json like', async () => {
    const result = await fetch('http://localhost:8090/swish', {
      body: JSON.stringify({ test: 'other' }),
      method: 'post',
      headers: { 'Content-Type': 'application/vnd.schemaregistry.v1+json' },
    });

    expect(app).toHaveBeenCalledWith(
      expect.objectContaining({ body: { test: 'other' }, method: 'POST' }),
    );

    await expect(result.text()).resolves.toEqual('Test');
  });

  it('Should parse url', async () => {
    const result = await fetch('http://localhost:8090/logout', {
      body: 'one=other',
      method: 'post',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    expect(app).toHaveBeenCalledWith(
      expect.objectContaining({ body: new URLSearchParams({ one: 'other' }), method: 'POST' }),
    );

    await expect(result.text()).resolves.toEqual('Test');
  });

  it('Should parse text', async () => {
    const result = await fetch('http://localhost:8090/post', {
      body: 'document { height: 100%; }',
      method: 'post',
      headers: { 'Content-Type': 'text/css' },
    });

    expect(app).toHaveBeenCalledWith(
      expect.objectContaining({ body: 'document { height: 100%; }', method: 'POST' }),
    );

    await expect(result.text()).resolves.toEqual('Test');
  });
});
