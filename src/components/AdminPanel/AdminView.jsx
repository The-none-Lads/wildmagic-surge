import { useState } from 'react';
import { useSurgeStore } from '../../store/useSurgeStore';

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    if (inQuotes) {
      if (ch === '"') {
        if (normalized[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(field.trim()); field = '';
      } else if (ch === '\n') {
        row.push(field.trim()); field = '';
        if (row.some(c => c !== '')) rows.push(row);
        row = [];
      } else {
        field += ch;
      }
    }
  }
  if (field || row.length) {
    row.push(field.trim());
    if (row.some(c => c !== '')) rows.push(row);
  }
  return rows;
}

export default function AdminView() {
  const {
    activeVersion, setActiveVersion,
    manualOverrideId, setManualOverrideId,
    entries, loadEntries, mergeEntries,
    history
  } = useSurgeStore();

  const [dataText, setDataText] = useState(JSON.stringify(entries, null, 2));
  const [action, setAction] = useState('merge');
  const [fileContent, setFileContent] = useState('');

const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState('');

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setFileContent(ev.target.result);
    reader.readAsText(file);
  };

  const applyImport = () => {
    let parsed;
    const isCSV = fileName?.toLowerCase().endsWith('.csv') ||
      (fileContent.trim() && !fileContent.trim().startsWith('[') && /id[,;]effect[,;]severity/i.test(fileContent.trim().split('\n')[0]));

    if (isCSV) {
      const rows = parseCSV(fileContent);
      if (rows.length < 2) return setStatus('⚠️ CSV needs at least a header + 1 row.');
      const header = rows[0].map(h => h.toLowerCase().trim());
      for (const r of ['id', 'effect', 'severity']) {
        if (!header.includes(r)) return setStatus(`❌ CSV missing "${r}" column.`);
      }
      parsed = [];
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        const obj = {};
        for (let j = 0; j < header.length; j++) obj[header[j]] = cols[j] != null ? cols[j] : '';
        parsed.push(obj);
      }
    } else {
      try { parsed = JSON.parse(fileContent); if (!Array.isArray(parsed)) throw new Error('Root must be an array'); }
      catch (e) { return setStatus(`❌ Invalid JSON: ${e.message}`); }
    }

    const valid = parsed.filter(p => p && p.id != null && p.effect && p.severity);
    const invalidCount = parsed.length - valid.length;
    if (invalidCount > 0) setStatus(`⚠️ Skipped ${invalidCount} malformed row(s).`);

    if (action === 'replace') {
      loadEntries(valid);
      setStatus(`✅ Replaced with ${valid.length} valid entries.`);
    } else {
      mergeEntries(valid);
      setStatus(`✅ Merged ${valid.length} valid entries.`);
    }
    setDataText(JSON.stringify(entries, null, 2));
    setFileContent('');
    setFileName('');
  };

  return (
    <div className="admin-view">
      <h2>Admin Panel</h2>
      <p className="sub">Manage entries & state. Roll uses uniform random index.</p>
      {status && <p className="status" style={{ margin: '6px 0', fontSize: '0.9rem', fontWeight: 600 }}>{status}</p>}
      <div className="field">
        <label>Entry Count</label>
        <span style={{ fontWeight: 700, color: '#c8b6ff' }}>{entries.length} entries</span>
      </div>
      <div className="field">
        <label>Active Version</label>
        <select value={activeVersion} onChange={(e) => setActiveVersion(e.target.value)}>
          <option value="all">All Entries</option>
          <option value="d100">D100 Only (filter)</option>
          <option value="phb2024">PHB 2024 Only</option>
          <option value="homebrew">Homebrew / Custom</option>
        </select>
      </div>
      <div className="field">
        <label>Manual Override (Admin only)</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input type="number" min={1} max={9999} placeholder="Enter ID" value={manualOverrideId ?? ''} onChange={(e) => {
            const v = e.target.value;
            setManualOverrideId(v === '' ? null : parseInt(v) || null);
          }} />
          <button onClick={() => setManualOverrideId(null)}>Clear Override</button>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '4px' }}>
          Leave blank for a uniform random roll. Enter an ID to force that surge (admin only).
        </p>
      </div>
      <div className="field">
        <label>Import File (.json or .csv)</label>
        <input type="file" accept=".json,.csv" onChange={handleFile} style={{ marginTop: '6px', fontFamily: 'monospace' }} />
        {fileName && <small>📄 {fileName} loaded. Apply below.</small>}
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="replace">Replace store</option>
            <option value="merge">Merge with store</option>
          </select>
          <button onClick={applyImport}>Apply Import</button>
        </div>
        <small>CSV: `id,effect,severity,source`. JSON: array of objects.</small>
      </div>
      <div className="field">
        <label>JSONTable Data (Manual)</label>

<textarea value={dataText} onChange={(e) => setDataText(e.target.value)} rows={12} style={{ fontFamily: 'monospace', fontSize: '13px', width: '100%' }} />
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="replace">Replace store</option>
            <option value="merge">Merge with store</option>
          </select>
          <button onClick={() => {
            try {
              const parsed = JSON.parse(dataText);
              if (Array.isArray(parsed)) {
                action === 'replace' ? loadEntries(parsed) : mergeEntries(parsed);
                setStatus(`✅ ${action === 'replace' ? 'Replaced' : 'Merged'} ${parsed.length} entries.`);
                setDataText(JSON.stringify(entries, null, 2));
              } else setStatus('❌ Expected JSON array.');
            } catch (e) { setStatus(`❌ Invalid JSON: ${e.message}`); }
          }}>Apply JSON</button>
        </div>
      </div>
      <div className="field">
        <label>State (History)</label>
        <div style={{ maxHeight: '200px', overflowY: 'auto', background: '#0e0e1a', padding: '8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(history.slice(-15), null, 2) || 'No rolls yet.'}
        </div>
      </div>
    </div>
  );
}
