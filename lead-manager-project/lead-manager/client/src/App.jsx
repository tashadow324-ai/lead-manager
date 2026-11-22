import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Search, Users, UserRoundCheck, Clock3, CircleCheck, CircleX, Pencil, Trash2, X, ChevronDown, RefreshCw, LayoutDashboard } from 'lucide-react';

const STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'];
const SOURCES = ['Website', 'Referral', 'Social Media', 'LinkedIn', 'Cold Call', 'Other'];
const emptyForm = { name: '', email: '', phone: '', company: '', source: 'Website', status: 'New' };
const statusClass = (status) => status.toLowerCase();

async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  if (response.status === 204) return null;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(body.message || 'Request failed.'); error.fields = body.errors || {}; throw error; }
  return body;
}

function LeadModal({ lead, onClose, onSave }) {
  const [form, setForm] = useState(lead || emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const change = (event) => { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); setErrors((current) => ({ ...current, [event.target.name]: '' })); };
  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required.';
    if (!form.email.trim()) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Enter a valid email address.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true); setMessage('');
    try { await onSave({ ...form, name: form.name.trim(), email: form.email.trim() }); onClose(); }
    catch (error) { setErrors(error.fields || {}); setMessage(error.message); }
    finally { setSaving(false); }
  };
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-head"><div><span className="eyebrow">LEAD DETAILS</span><h2 id="modal-title">{lead ? 'Edit lead' : 'Add a new lead'}</h2><p>Keep your customer information up to date.</p></div><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={19}/></button></div>
      {message && <div className="alert">{message}</div>}
      <form onSubmit={submit} noValidate>
        <div className="form-grid">
          <Field label="Full name" required error={errors.name}><input autoFocus name="name" value={form.name} onChange={change} placeholder="e.g. Alex Morgan" maxLength="100"/></Field>
          <Field label="Email address" required error={errors.email}><input name="email" type="email" value={form.email} onChange={change} placeholder="alex@company.com" maxLength="150"/></Field>
          <Field label="Phone number" error={errors.phone}><input name="phone" value={form.phone || ''} onChange={change} placeholder="+1 555 000 0000" maxLength="30"/></Field>
          <Field label="Company" error={errors.company}><input name="company" value={form.company || ''} onChange={change} placeholder="Company name" maxLength="100"/></Field>
          <Field label="Lead source" error={errors.source}><div className="select-wrap"><select name="source" value={form.source} onChange={change}>{SOURCES.map(s => <option key={s}>{s}</option>)}</select><ChevronDown size={16}/></div></Field>
          <Field label="Status" error={errors.status}><div className="select-wrap"><select name="status" value={form.status} onChange={change}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select><ChevronDown size={16}/></div></Field>
        </div>
        <div className="modal-actions"><button type="button" className="btn btn-quiet" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : lead ? 'Save changes' : 'Create lead'}</button></div>
      </form>
    </section>
  </div>;
}
function Field({ label, required, error, children }) { return <label className="field"><span>{label}{required && <b> *</b>}</span>{children}{error && <small className="field-error">{error}</small>}</label>; }
function StatCard({ label, value, tone, icon: Icon, caption }) { return <article className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19}/></div><div className="stat-copy"><span>{label}</span><strong>{value}</strong><small>{caption}</small></div></article>; }

export default function App() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All statuses');
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const loadLeads = useCallback(async () => {
    setLoading(true); setError('');
    try { const result = await api('/leads'); setLeads(result.data); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [refreshKey]);
  useEffect(() => { loadLeads(); }, [loadLeads]);
  const counts = useMemo(() => Object.fromEntries(['All', ...STATUSES].map(s => [s, s === 'All' ? leads.length : leads.filter(l => l.status === s).length])), [leads]);
  const visible = useMemo(() => leads.filter(l => l.name.toLowerCase().includes(search.toLowerCase().trim()) && (filter === 'All statuses' || l.status === filter)), [leads, search, filter]);
  const saveLead = async (form) => {
    if (modal?.id) await api(`/leads/${modal.id}`, { method: 'PUT', body: JSON.stringify(form) });
    else await api('/leads', { method: 'POST', body: JSON.stringify(form) });
    setNotice(modal?.id ? 'Lead updated successfully.' : 'Lead created successfully.');
    setRefreshKey(k => k + 1);
  };
  const deleteLead = async (lead) => {
    if (!window.confirm(`Delete ${lead.name}? This action cannot be undone.`)) return;
    try { await api(`/leads/${lead.id}`, { method: 'DELETE' }); setNotice('Lead deleted successfully.'); setRefreshKey(k => k + 1); }
    catch (e) { setError(e.message); }
  };
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 3200); return () => clearTimeout(timer); }, [notice]);
  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><div className="brand-mark"><LayoutDashboard size={20}/></div><span>lead<span className="brand-light">flow</span></span></div><div className="side-label">WORKSPACE</div><div className="side-link active"><Users size={17}/> Leads <span className="side-count">{leads.length}</span></div><div className="sidebar-bottom"><div className="avatar">LM</div><div><strong>Lead Manager</strong><span>Workspace</span></div></div></aside>
    <main className="main-content"><header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>Leads</strong></div><div className="topbar-right"><span className="live-dot"></span><span>All changes saved</span><div className="user-avatar">A</div></div></header>
      <div className="page-wrap"><div className="page-heading"><div><span className="eyebrow">SALES OVERVIEW</span><h1>Lead management</h1><p>Track, organize, and build stronger customer relationships.</p></div><button className="btn btn-primary" onClick={() => setModal({})}><Plus size={17}/> Add lead</button></div>
        {notice && <div className="toast"><CircleCheck size={17}/>{notice}</div>}
        {error && <div className="alert page-alert">{error}<button onClick={() => setRefreshKey(k => k + 1)} className="retry">Try again</button></div>}
        <section className="stats-grid"><StatCard label="Total leads" value={counts.All ?? 0} tone="purple" icon={Users} caption="Across all statuses"/><StatCard label="New leads" value={counts.New ?? 0} tone="blue" icon={Clock3} caption="Waiting for follow-up"/><StatCard label="Qualified" value={counts.Qualified ?? 0} tone="green" icon={UserRoundCheck} caption="Ready for next steps"/><StatCard label="Lost leads" value={counts.Lost ?? 0} tone="orange" icon={CircleX} caption="Not moving forward"/></section>
        <section className="table-panel"><div className="panel-heading"><div><h2>All leads</h2><p>A complete view of your potential customers</p></div><button className="icon-btn refresh-btn" onClick={() => setRefreshKey(k => k + 1)} aria-label="Refresh"><RefreshCw size={17}/></button></div>
          <div className="toolbar"><div className="search-box"><Search size={17}/><input aria-label="Search leads by name" placeholder="Search by name…" value={search} onChange={e => setSearch(e.target.value)}/>{search && <button onClick={() => setSearch('')} aria-label="Clear search"><X size={15}/></button>}</div><div className="filter-wrap"><span>Status:</span><div className="select-wrap"><select aria-label="Filter by status" value={filter} onChange={e => setFilter(e.target.value)}><option>All statuses</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select><ChevronDown size={15}/></div></div></div>
          <div className="table-scroll"><table><thead><tr><th>LEAD</th><th>COMPANY</th><th>PHONE</th><th>SOURCE</th><th>STATUS</th><th className="actions-heading">ACTIONS</th></tr></thead><tbody>
            {loading ? <tr><td colSpan="6" className="empty-state">Loading your leads…</td></tr> : visible.length === 0 ? <tr><td colSpan="6" className="empty-state"><div className="empty-icon"><Search size={22}/></div><strong>{leads.length ? 'No matching leads' : 'No leads yet'}</strong><span>{leads.length ? 'Try changing your search or filter.' : 'Add your first lead to get started.'}</span>{!leads.length && <button className="btn btn-primary btn-small" onClick={() => setModal({})}><Plus size={15}/> Add your first lead</button>}</td></tr> : visible.map(lead => <tr key={lead.id}><td><div className="lead-cell"><div className="lead-avatar">{lead.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}</div><div><strong>{lead.name}</strong><span>{lead.email}</span></div></div></td><td>{lead.company || <span className="muted">—</span>}</td><td>{lead.phone || <span className="muted">—</span>}</td><td><span className="source-tag">{lead.source}</span></td><td><span className={`status status-${statusClass(lead.status)}`}><i></i>{lead.status}</span></td><td><div className="row-actions"><button className="icon-btn" onClick={() => setModal(lead)} aria-label={`Edit ${lead.name}`} title="Edit"><Pencil size={16}/></button><button className="icon-btn danger-hover" onClick={() => deleteLead(lead)} aria-label={`Delete ${lead.name}`} title="Delete"><Trash2 size={16}/></button></div></td></tr>)}
          </tbody></table></div><div className="table-footer"><span>Showing <strong>{visible.length}</strong> of <strong>{leads.length}</strong> leads</span><span>Updated in real time <span className="live-dot"></span></span></div>
        </section><footer className="footer">Leadflow <span>·</span> Lead management workspace</footer>
      </div>
    </main>{modal && <LeadModal lead={modal.id ? modal : null} onClose={() => setModal(null)} onSave={saveLead}/>}
  </div>;
}
