import { test } from 'node:test';
import assert from 'node:assert/strict';
import { API_ORIGIN, localUrl, readEndpoints, buildRequest, localFetch } from '../public/api.js';

const spec = {
  openapi: '3.0.3',
  servers: [{ url: 'https://example.com' }],
  paths: {
    '/pets/{petId}': {
      parameters: [{ name: 'petId', in: 'path', required: true }],
      get: {
        summary: 'Get pet',
        parameters: [{ name: 'limit', in: 'query' }],
        responses: { 200: { description: 'OK' } },
      },
      post: {
        parameters: [{ name: 'limit', in: 'query', required: true }],
      },
    },
  },
};

test('extracts operations and inherited parameters, ignoring external servers', () => {
  const endpoints = readEndpoints(spec);
  assert.equal(endpoints.length, 2);
  assert.equal(endpoints[0].method, 'GET');
  assert.equal(endpoints[0].parameters[0].name, 'petId');
  assert.equal(localUrl(endpoints[0].path).origin, API_ORIGIN);
});

test('operation parameters override path-level parameters', () => {
  const endpoints = readEndpoints({
    openapi: '3.1.0',
    paths: {
      '/pets': {
        parameters: [{ name: 'limit', in: 'query', required: false }],
        get: { parameters: [{ name: 'limit', in: 'query', required: true }] },
      },
    },
  });
  assert.deepEqual(endpoints[0].parameters, [{ name: 'limit', in: 'query', required: true }]);
});

test('rejects invalid specifications and remote URL paths', () => {
  for (const value of [null, {}, { swagger: '2.0', paths: {} }, { openapi: '3.0.3', paths: [] }]) {
    assert.throws(() => readEndpoints(value), /OpenAPI/);
  }
  for (const path of ['https://example.com', '//example.com/pets', '/\\example.com', '/pets?x=1', '/pets#x']) {
    assert.throws(() => localUrl(path));
  }
  assert.equal(localUrl('/openapi.json').href, `${API_ORIGIN}/openapi.json`);
});

test('encodes path and query input without changing the target origin', () => {
  const endpoint = readEndpoints(spec)[0];
  const { url, options } = buildRequest(endpoint, new Map([
    ['path:petId', '//example.com/a?b#c'],
    ['query:limit', '10&admin=true'],
  ]), '');
  assert.equal(url.origin, API_ORIGIN);
  assert.equal(url.pathname, '/pets/%2F%2Fexample.com%2Fa%3Fb%23c');
  assert.equal(url.searchParams.get('limit'), '10&admin=true');
  assert.equal(url.searchParams.has('admin'), false);
  assert.equal(options.credentials, 'omit');
  assert.equal(options.redirect, 'error');
});

test('requires path parameters and rejects dot segments and unresolved placeholders', () => {
  const endpoint = readEndpoints(spec)[0];
  for (const value of ['', '.', '..']) {
    assert.throws(() => buildRequest(endpoint, new Map([['path:petId', value]]), ''));
  }
  assert.throws(() => buildRequest({ ...endpoint, parameters: [] }, new Map(), ''), /unresolved/);
});

test('validates required query parameters and JSON bodies', () => {
  const endpoint = readEndpoints(spec)[1];
  assert.throws(() => buildRequest(endpoint, new Map([['path:petId', '1']]), ''), /limit/);
  const values = new Map([['path:petId', '1'], ['query:limit', '5']]);
  assert.throws(() => buildRequest(endpoint, values, 'not json'), SyntaxError);
  const { options } = buildRequest(endpoint, values, '{"name":"pet"}');
  assert.equal(options.body, '{"name":"pet"}');
  assert.equal(options.headers['Content-Type'], 'application/json');
  assert.throws(() => buildRequest(readEndpoints(spec)[0], values, '{}'), /cannot have a body/);
});

test('fetch refuses remote origins before making a network request', async () => {
  await assert.rejects(localFetch(new URL('https://example.com')), /Invalid API target/);
});
