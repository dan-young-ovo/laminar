import { router, jsonOk, get, put } from '@ovotech/laminar';

const items: Record<string, string> = { 10: 'Dave', 20: 'Bob' };

/**
 * Returns a laminar App object
 */
export const app = router(
  /**
   * You match pathnames with regex.
   * They need to start it with a ^ and should end it with $
   * Though that is not required and you can leave it out to create wildcard routes
   */
  get(/^\/names$/, () => jsonOk(items)),

  /**
   * If a pathname has a capture group in it it would be captured and accessible with the `path` paramters array
   */
  get(/\/names\/(\d+)/, ({ path: [id] }) => jsonOk(items[id])),

  /**
   * You can use other method helpers: get, post, del, patch, put, options are available
   */
  put(/^\/names$/, ({ body }) => {
    items[body.id] = body.name;
    return jsonOk({ success: true });
  }),
);
