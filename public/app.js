import { API_ORIGIN, localUrl, readEndpoints, buildRequest, localFetch } from './api.js';

const element = id => document.getElementById(id);
let endpoints = [];
let selected = null;
let sending = false;
const parameterInputs = new Map();

function showTab(name) {
  for (const tab of document.querySelectorAll('[role="tab"]')) {
    const active = tab.dataset.tab === name;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    element(tab.dataset.tab).hidden = !active;
  }
}

for (const tab of document.querySelectorAll('[role="tab"]')) {
  tab.addEventListener('click', () => showTab(tab.dataset.tab));
  tab.addEventListener('keydown', event => {
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    let index = tabs.indexOf(tab);
    if (event.key === 'ArrowRight') index = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') index = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = tabs.length - 1;
    else return;
    event.preventDefault();
    showTab(tabs[index].dataset.tab);
    tabs[index].focus();
  });
}

function renderEndpoints() {
  const search = element('search').value.toLowerCase();
  const method = element('method-filter').value;
  const visible = endpoints.filter(endpoint =>
    (!method || endpoint.method === method) &&
    `${endpoint.path} ${endpoint.method} ${endpoint.operation.summary ?? ''}`.toLowerCase().includes(search));
  element('endpoint-count').textContent = `${visible.length} endpoints`;
  element('endpoints').replaceChildren();
  for (const endpoint of visible) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'endpoint';
    button.setAttribute('aria-pressed', String(endpoint === selected));
    const methodLabel = document.createElement('strong');
    methodLabel.textContent = ` [${endpoint.method}]`;
    const summary = document.createElement('small');
    summary.textContent = endpoint.operation.summary || 'API Definition · OpenAPI Specification';
    button.append(endpoint.path, methodLabel, summary);
    button.addEventListener('click', () => selectEndpoint(endpoint));
    element('endpoints').append(button);
  }
  if (!visible.length) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = endpoints.length ? 'No matching endpoints.' : 'No endpoints loaded.';
    element('endpoints').append(empty);
  }
}

function selectEndpoint(endpoint) {
  selected = endpoint;
  renderEndpoints();
  element('operation-title').textContent = `${endpoint.method} ${endpoint.path}`;
  element('operation-description').textContent = endpoint.operation.description || endpoint.operation.summary || 'No description provided.';
  element('operation-doc').textContent = JSON.stringify({
    parameters: endpoint.parameters,
    requestBody: endpoint.operation.requestBody,
    responses: endpoint.operation.responses,
  }, null, 2);
  element('request-title').textContent = `${endpoint.method} ${API_ORIGIN}${endpoint.path}`;
  element('parameters').replaceChildren();
  parameterInputs.clear();
  for (const [index, parameter] of endpoint.parameters.entries()) {
    const input = document.createElement('input');
    input.id = `parameter-${index}`;
    input.required = Boolean(parameter.required || parameter.in === 'path');
    input.placeholder = parameter.description || parameter.name;
    const label = document.createElement('label');
    label.htmlFor = input.id;
    label.textContent = `${parameter.name} (${parameter.in})${input.required ? ' *' : ''}`;
    element('parameters').append(label, input);
    parameterInputs.set(`${parameter.in}:${parameter.name}`, input);
  }
  element('request-body').value = '';
  element('request-body').disabled = ['GET', 'HEAD'].includes(endpoint.method);
  element('response').textContent = 'No request sent.';
  element('send').disabled = sending;
}

element('search').addEventListener('input', renderEndpoints);
element('method-filter').addEventListener('change', renderEndpoints);

element('connect-form').addEventListener('submit', async event => {
  event.preventDefault();
  element('connect').disabled = true;
  element('status').textContent = 'Connecting…';
  try {
    const response = await localFetch(localUrl(element('spec-path').value), { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Specification request returned HTTP ${response.status}.`);
    const spec = await response.json();
    const loaded = readEndpoints(spec);
    endpoints = loaded;
    selected = null;
    parameterInputs.clear();
    element('parameters').replaceChildren();
    element('send').disabled = true;
    element('request-title').textContent = 'Select an endpoint';
    element('request-body').value = '';
    element('response').textContent = 'No request sent.';
    element('operation-title').textContent = 'Select an endpoint';
    element('operation-description').textContent = 'This specification contains no endpoints.';
    element('operation-doc').textContent = '';
    element('specification').textContent = JSON.stringify(spec, null, 2);
    renderEndpoints();
    if (endpoints.length) selectEndpoint(endpoints[0]);
    element('status').textContent = `Connected to ${API_ORIGIN} · ${spec.info?.title || 'API'} · ${endpoints.length} endpoints`;
  } catch (error) {
    element('status').textContent = `Connection failed: ${error.message} Check the specification path, trusted HTTPS certificate, and API CORS settings.`;
  } finally {
    element('connect').disabled = false;
  }
});

element('request-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (!selected || sending) return;
  const endpoint = selected;
  sending = true;
  element('send').disabled = true;
  element('response').textContent = 'Sending…';
  try {
    const values = new Map([...parameterInputs].map(([key, input]) => [key, input.value]));
    const { url, options } = buildRequest(endpoint, values, element('request-body').value);
    const response = await localFetch(url, options);
    const text = await response.text();
    let formatted = text;
    try { formatted = JSON.stringify(JSON.parse(text), null, 2); } catch { /* Display non-JSON responses as text. */ }
    if (selected === endpoint) element('response').textContent = `HTTP ${response.status} ${response.statusText}\n\n${formatted || '(empty response)'}`;
  } catch (error) {
    if (selected === endpoint) element('response').textContent = `Request failed: ${error.message}\nCheck API availability, CORS, and the HTTPS certificate.`;
  } finally {
    sending = false;
    element('send').disabled = !selected;
  }
});
