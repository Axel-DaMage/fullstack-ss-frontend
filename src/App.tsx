import { useState } from 'react';
import './components/styles.css';
import { eventEmitter } from './lib/EventEmitter';
import { Events } from './lib/events';

type Section = 
  | 'dashboard' 
  | 'pets' 
  | 'matches' 
  | 'locations' 
  | 'api-explorer'
  | 'jwt-test'
  | 'sql-console';

const API_BASE = '/api';

function App() {
  const [currentSection, setCurrentSection] = useState<Section>('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNavigate = (section: Section) => {
    setCurrentSection(section);
    eventEmitter.emit(Events.SECTION_CHANGED, section);
  };

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'api-explorer':
        return <ApiExplorer key={refreshKey} baseUrl={API_BASE} />;
      case 'jwt-test':
        return <JwtTester key={refreshKey} baseUrl={API_BASE} />;
      case 'sql-console':
        return <SqlConsole key={refreshKey} baseUrl={API_BASE} />;
      default:
        return <StandardView key={refreshKey} section={currentSection} onRefresh={handleRefresh} baseUrl={API_BASE} />;
    }
  };

  const navItems: { id: Section; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'pets', label: 'Pets' },
    { id: 'matches', label: 'Matches' },
    { id: 'locations', label: 'Locations' },
    { id: 'api-explorer', label: 'API Explorer' },
    { id: 'jwt-test', label: 'JWT Test' },
    { id: 'sql-console', label: 'SQL Console' },
  ];

  return (
    <div className="app">
      <nav className="navbar">
        <h1 className="app-title">Sanos y Salvos - Dev Panel</h1>
        <div className="nav-links">
          {navItems.map(item => (
            <button
              key={item.id}
              className={currentSection === item.id ? 'active' : ''}
              onClick={() => handleNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>
      <main className="app-content">
        {renderSection()}
      </main>
    </div>
  );
}

function StandardView({ section, onRefresh, baseUrl }: { section: Section; onRefresh: () => void; baseUrl: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endpoints: Record<Section, { url: string; title: string }> = {
    dashboard: { url: `${baseUrl}/dashboard`, title: 'Dashboard' },
    pets: { url: `${baseUrl}/pets`, title: 'Pets' },
    matches: { url: `${baseUrl}/matches`, title: 'Matches' },
    locations: { url: `${baseUrl}/locations`, title: 'Locations' },
    'api-explorer': { url: '', title: '' },
    'jwt-test': { url: '', title: '' },
    'sql-console': { url: '', title: '' },
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoints[section].url);
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        if (!res.ok) {
          setError(`HTTP ${res.status}: ${json.error || json.message || text}`);
          setData(null);
        } else {
          setData(json);
        }
      } catch {
        setData(text);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="standard-view">
      <div className="section-header">
        <h2>{endpoints[section].title}</h2>
        <button onClick={fetchData} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Data'}
        </button>
      </div>
      {error && <div className="error-box">{error}</div>}
      {data && (
        <div className="data-display">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

const ENDPOINTS = [
  { category: 'Pets', methods: [
    { method: 'GET', path: '/pets', desc: 'List all pets' },
    { method: 'POST', path: '/pets', desc: 'Create pet', body: { name: 'string', race: 'string', color: 'string', size: 'string', status: 'LOST|FOUND', description: 'string' } },
    { method: 'GET', path: '/pets/{id}', desc: 'Get pet by ID' },
    { method: 'PUT', path: '/pets/{id}', desc: 'Update pet' },
    { method: 'DELETE', path: '/pets/{id}', desc: 'Delete pet' },
    { method: 'GET', path: '/pets/search/race/{race}', desc: 'Search by race' },
    { method: 'GET', path: '/pets/search/status/{status}', desc: 'Search by status' },
    { method: 'GET', path: '/pets/totals/status', desc: 'Totals by status' },
  ]},
  { category: 'Locations', methods: [
    { method: 'GET', path: '/locations', desc: 'List all locations' },
    { method: 'POST', path: '/locations', desc: 'Create location', body: { latitude: 'number', longitude: 'number', zone: 'string', petId: 'number' } },
    { method: 'GET', path: '/locations/{id}', desc: 'Get location by ID' },
    { method: 'PUT', path: '/locations/{id}', desc: 'Update location' },
    { method: 'DELETE', path: '/locations/{id}', desc: 'Delete location' },
    { method: 'GET', path: '/locations/search/zone/{zone}', desc: 'Search by zone' },
    { method: 'GET', path: '/locations/search/pet/{petId}', desc: 'Search by pet' },
    { method: 'GET', path: '/locations/totals/zone', desc: 'Totals by zone' },
  ]},
  { category: 'Matches', methods: [
    { method: 'GET', path: '/matches', desc: 'List all matches' },
    { method: 'POST', path: '/matches', desc: 'Create match', body: { petLostId: 'number', petFoundId: 'number' } },
    { method: 'GET', path: '/matches/{id}', desc: 'Get match by ID' },
    { method: 'PUT', path: '/matches/{id}/confirm', desc: 'Confirm match' },
    { method: 'PUT', path: '/matches/{id}/reject', desc: 'Reject match' },
    { method: 'DELETE', path: '/matches/{id}', desc: 'Delete match' },
    { method: 'POST', path: '/matching/run-automatic', desc: 'Run automatic matching' },
  ]},
  { category: 'Dashboard', methods: [
    { method: 'GET', path: '/dashboard', desc: 'Dashboard stats' },
  ]},
  { category: 'Health', methods: [
    { method: 'GET', path: '/health', desc: 'Health check' },
  ]},
];

const METHOD_COLORS: Record<string, string> = {
  GET: '#89b4fa',
  POST: '#a6e3a1',
  PUT: '#f9e2af',
  DELETE: '#f38ba8',
};

function ApiExplorer({ baseUrl }: { baseUrl: string }) {
  const [activeCategory, setActiveCategory] = useState('Pets');
  const [selectedEndpoint, setSelectedEndpoint] = useState<any>(null);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [pathParams, setPathParams] = useState<Record<string, string>>({});
  const [bodyParams, setBodyParams] = useState<Record<string, string>>({});
  const [jwtToken, setJwtToken] = useState('');
  const [useAuth, setUseAuth] = useState(false);
  const [customHeaders, setCustomHeaders] = useState('');

  const executeRequest = async () => {
    if (!selectedEndpoint) return;
    setLoading(true);
    setResponse(null);

    let url = `${baseUrl}${selectedEndpoint.path}`;
    Object.entries(pathParams).forEach(([k, v]) => {
      url = url.replace(`{${k}}`, v);
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (useAuth && jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`;
    }
    if (customHeaders) {
      try {
        const h = JSON.parse(customHeaders);
        Object.assign(headers, h);
      } catch {}
    }

    const options: RequestInit = { method: selectedEndpoint.method, headers };
    if (!['GET', 'DELETE'].includes(selectedEndpoint.method) && Object.keys(bodyParams).length > 0) {
      const body: Record<string, any> = {};
      Object.entries(bodyParams).forEach(([k, v]) => {
        if (v) body[k] = v;
      });
      options.body = JSON.stringify(body);
    }

    try {
      const res = await fetch(url, options);
      let data;
      try { data = await res.json(); } catch { data = await res.text(); }
      setResponse({ status: res.status, statusText: res.statusText, data });
    } catch (err: any) {
      setResponse({ status: 0, statusText: 'Error', data: err.message });
    } finally {
      setLoading(false);
    }
  };

  const getSampleBody = () => {
    if (!selectedEndpoint?.body) return '{}';
    const sample: Record<string, string> = {};
    Object.keys(selectedEndpoint.body).forEach(k => {
      sample[k] = '';
    });
    return JSON.stringify(sample, null, 2);
  };

  return (
    <div className="api-explorer">
      <div className="api-sidebar">
        <div className="auth-section">
          <label className="checkbox-label">
            <input type="checkbox" checked={useAuth} onChange={e => setUseAuth(e.target.checked)} />
            Use JWT Auth
          </label>
          {useAuth && (
            <input
              type="text"
              placeholder="Bearer token"
              value={jwtToken}
              onChange={e => setJwtToken(e.target.value)}
              className="full-width"
            />
          )}
          <textarea
            placeholder='Custom headers JSON {"X-Custom":"value"}'
            value={customHeaders}
            onChange={e => setCustomHeaders(e.target.value)}
            className="full-width"
            rows={2}
          />
        </div>
        <div className="category-tabs">
          {ENDPOINTS.map(cat => (
            <button
              key={cat.category}
              className={activeCategory === cat.category ? 'active' : ''}
              onClick={() => setActiveCategory(cat.category)}
            >
              {cat.category}
            </button>
          ))}
        </div>
        <div className="endpoints-list">
          {ENDPOINTS.find(c => c.category === activeCategory)?.methods.map((ep, idx) => (
            <div
              key={idx}
              className={`endpoint-item ${selectedEndpoint === ep ? 'selected' : ''}`}
              onClick={() => { setSelectedEndpoint(ep); setResponse(null); setPathParams({}); setBodyParams({}); }}
            >
              <span className="method-badge" style={{ backgroundColor: METHOD_COLORS[ep.method] }}>
                {ep.method}
              </span>
              <span className="endpoint-path">{ep.path}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="api-main">
        {selectedEndpoint ? (
          <>
            <div className="endpoint-header">
              <span className="method-badge large" style={{ backgroundColor: METHOD_COLORS[selectedEndpoint.method] }}>
                {selectedEndpoint.method}
              </span>
              <code>{baseUrl}{selectedEndpoint.path}</code>
              <span className="endpoint-desc">{selectedEndpoint.desc}</span>
            </div>
            {selectedEndpoint.path.includes('{') && (
              <div className="params-section">
                <h4>Path Parameters</h4>
                <div className="params-grid">
                  {selectedEndpoint.path.match(/{(\w+)}/g)?.map((p: string) => {
                    const key = p.replace(/{|}/g, '');
                    return (
                      <div key={key} className="param-field">
                        <label>{key} <span className="path-param">(path)</span></label>
                        <input
                          type="text"
                          value={pathParams[key] || ''}
                          onChange={e => setPathParams({ ...pathParams, [key]: e.target.value })}
                          placeholder={key}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {selectedEndpoint.body && (
              <div className="body-section">
                <h4>Request Body (JSON)</h4>
                <textarea
                  value={getSampleBody()}
                  onChange={e => {
                    try { setBodyParams(JSON.parse(e.target.value)); } catch {}
                  }}
                  rows={6}
                />
              </div>
            )}
            <button className="execute-btn" onClick={executeRequest} disabled={loading}>
              {loading ? 'Executing...' : 'Execute Request'}
            </button>
            {response && (
              <div className="response-section">
                <h4>Response</h4>
                <div className={`status-badge ${response.status >= 200 && response.status < 300 ? 'success' : 'error'}`}>
                  {response.status} {response.statusText}
                </div>
                <pre className="response-body">
                  {typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2)}
                </pre>
              </div>
            )}
          </>
        ) : (
          <div className="no-selection">
            <h3>Select an endpoint to test</h3>
            <p>Use the sidebar to browse available endpoints</p>
          </div>
        )}
      </div>
    </div>
  );
}

function JwtTester({ baseUrl }: { baseUrl: string }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [token, setToken] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const login = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        setResponse({ success: true, token: data.token });
        addTestResult('Login', res.status, 'Success');
      } else {
        setResponse({ success: false, error: data });
        addTestResult('Login', res.status, 'Failed');
      }
    } catch (err: any) {
      setResponse({ error: err.message });
      addTestResult('Login', 0, err.message);
    } finally {
      setLoading(false);
    }
  };

  const testToken = async () => {
    if (!token) return;
    setLoading(true);
    const tests = [
      { name: 'GET /pets', url: `${baseUrl}/pets` },
      { name: 'GET /matches', url: `${baseUrl}/matches` },
      { name: 'GET /dashboard', url: `${baseUrl}/dashboard` },
    ];
    const results = [];
    for (const t of tests) {
      try {
        const res = await fetch(t.url, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        results.push({ name: t.name, status: res.status, ok: res.ok });
      } catch {
        results.push({ name: t.name, status: 0, ok: false, error: 'Network error' });
      }
    }
    setTestResults(results);
    setLoading(false);
  };

  const addTestResult = (name: string, status: number, result: string) => {
    setTestResults(prev => [...prev, { name, status, result, time: new Date().toLocaleTimeString() }]);
  };

  const clearToken = () => {
    setToken('');
    setResponse(null);
    setTestResults([]);
  };

  return (
    <div className="jwt-tester">
      <div className="jwt-section">
        <h3>Login</h3>
        <div className="form-row">
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={login} disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </div>
      </div>
      {token && (
        <div className="jwt-section">
          <div className="token-header">
            <h3>Token</h3>
            <button className="clear-btn" onClick={clearToken}>Clear</button>
          </div>
          <textarea readOnly value={token} rows={4} />
          <button onClick={testToken} disabled={loading} className="test-btn">
            {loading ? 'Testing...' : 'Test Token on All Endpoints'}
          </button>
        </div>
      )}
      {response && (
        <div className="response-box">
          <h4>Login Response</h4>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
      {testResults.length > 0 && (
        <div className="test-results">
          <h4>Token Test Results</h4>
          <table>
            <thead>
              <tr>
                <th>Endpoint</th>
                <th>Status</th>
                <th>Result</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((r, i) => (
                <tr key={i}>
                  <td>{r.name}</td>
                  <td><span className={`status-code ${r.status >= 200 && r.status < 300 ? 'ok' : 'err'}`}>{r.status}</span></td>
                  <td>{r.result || (r.ok ? 'OK' : r.error || 'Failed')}</td>
                  <td>{r.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SqlConsole({ baseUrl }: { baseUrl: string }) {
  const [query, setQuery] = useState('SELECT * FROM pet LIMIT 10');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const executeQuery = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch(`${baseUrl}/sql/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setResponse({ status: res.status, data });
    } catch (err: any) {
      setResponse({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const presetQueries = [
    { label: 'Pets Table', query: 'SELECT * FROM pet LIMIT 20' },
    { label: 'Locations Table', query: 'SELECT * FROM location LIMIT 20' },
    { label: 'Matches Table', query: 'SELECT * FROM `match` LIMIT 20' },
    { label: 'Count Pets', query: 'SELECT status, COUNT(*) as count FROM pet GROUP BY status' },
    { label: 'Count Locations', query: 'SELECT zone, COUNT(*) as count FROM location GROUP BY zone' },
  ];

  return (
    <div className="sql-console">
      <div className="sql-presets">
        <h4>Preset Queries</h4>
        <div className="preset-buttons">
          {presetQueries.map((q, i) => (
            <button key={i} onClick={() => setQuery(q.query)}>{q.label}</button>
          ))}
        </div>
      </div>
      <div className="sql-input">
        <h4>SQL Query</h4>
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          rows={6}
          placeholder="Enter SQL query..."
        />
        <button onClick={executeQuery} disabled={loading}>
          {loading ? 'Executing...' : 'Execute Query'}
        </button>
      </div>
      {response && (
        <div className="sql-result">
          <h4>Result {response.status && <span className={`status-badge ${response.status === 200 ? 'success' : 'error'}`}>{response.status}</span>}</h4>
          <pre>{JSON.stringify(response.data || response.error, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;