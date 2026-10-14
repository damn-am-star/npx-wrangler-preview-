export const API_ORIGIN = 'https://localhost:5002';
const methods = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace']);

export function localUrl(path) {
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//') || /[\\?#]/.test(path)) {
    throw new Error('Use an absolute API path, such as /swagger/v1/swagger.json, not a URL.');
  }
  const url = new URL(path, API_ORIGIN);
  if (url.origin !== API_ORIGIN) throw new Error('Requests must stay on https://localhost:5002.');
  return url;
}

export function readEndpoints(spec) {
  if (!spec || !/^3\.\d+\.\d+/.test(spec.openapi) || !spec.paths || typeof spec.paths !== 'object' || Array.isArray(spec.paths)) {
    throw new Error('Expected an OpenAPI 3.x JSON document with a paths object.');
  }
  return Object.entries(spec.paths).flatMap(([path, item]) => {
    localUrl(path);
    if (!item || typeof item !== 'object') return [];
    return Object.entries(item)
      .filter(([method, operation]) => methods.has(method) && operation && typeof operation === 'object')
      .map(([method, operation]) => {
        const parameters = new Map();
        for (const parameter of [...(Array.isArray(item.parameters) ? item.parameters : []), ...(Array.isArray(operation.parameters) ? operation.parameters : [])]) {
          if (parameter && !parameter.$ref && ['path', 'query'].includes(parameter.in) && typeof parameter.name === 'string') {
            parameters.set(`${parameter.in}:${parameter.name}`, parameter);
          }
        }
        return { path, method: method.toUpperCase(), operation, parameters: [...parameters.values()] };
      });
  });
}

export function buildRequest(endpoint, values, body) {
  let path = endpoint.path;
  for (const parameter of endpoint.parameters) {
    const value = values.get(`${parameter.in}:${parameter.name}`) ?? '';
    if ((parameter.required || parameter.in === 'path') && !value.trim()) {
      throw new Error(`Provide ${parameter.name}.`);
    }
    if (parameter.in === 'path') {
      if (value === '.' || value === '..') throw new Error('Path parameters cannot be dot segments.');
      path = path.split(`{${parameter.name}}`).join(encodeURIComponent(value));
    }
  }
  if (/\{[^}]+\}/.test(path)) throw new Error('The endpoint contains unresolved path parameters.');
  const url = localUrl(path);
  for (const parameter of endpoint.parameters.filter(parameter => parameter.in === 'query')) {
    const value = values.get(`query:${parameter.name}`);
    if (value !== undefined && value !== '') url.searchParams.append(parameter.name, value);
  }
  const options = { method: endpoint.method, credentials: 'omit', redirect: 'error', headers: { Accept: 'application/json' } };
  if (body.trim()) {
    if (['GET', 'HEAD'].includes(endpoint.method)) throw new Error('GET and HEAD requests cannot have a body.');
    JSON.parse(body);
    options.body = body;
    options.headers['Content-Type'] = 'application/json';
  }
  return { url, options };
}

export async function localFetch(url, options = {}) {
  if (!(url instanceof URL) || url.origin !== API_ORIGIN) throw new Error('Invalid API target.');
  return fetch(url, { ...options, credentials: 'omit', redirect: 'error', signal: AbortSignal.timeout(15000) });
}
