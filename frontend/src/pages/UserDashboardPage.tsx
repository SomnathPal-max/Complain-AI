import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FilePlus2,
  RefreshCw,
  Search,
  Wrench,
} from 'lucide-react';
import { useComplaints } from '../context/ComplaintsContext';
import {
  Metric,
  ComplaintTable,
  Pagination,
} from '../components/DashboardParts';
import { STATUS_LIST } from '../types';
const PAGE_SIZE = 6;
export function UserDashboardPage() {
  const { complaints, loading, error, stats, refreshComplaints } =
    useComplaints();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  const active = complaints.filter(
    (item) => !['Resolved', 'Rejected'].includes(item.status)
  ).length;
  const filtered = complaints
    .filter((item) => {
      const matchesQuery = [
        item.title,
        item.public_id,
        item.category,
        item.location,
      ].some((value) =>
        value.toLowerCase().includes(query.trim().toLowerCase())
      );
      return (
        matchesQuery &&
        (!status || item.status === status) &&
        (tab === 'all' ||
          (tab === 'resolved'
            ? item.status === 'Resolved'
            : !['Resolved', 'Rejected'].includes(item.status)))
      );
    })
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  );
  const percent = stats.total
    ? Math.round((stats.resolvedCount / stats.total) * 100)
    : 0;
  const other =
    stats.total - stats.openCount - stats.inProgressCount - stats.resolvedCount;
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Your campus, cared for</p>
          <h1>Your reports. In view.</h1>
          <p>
            Everything you’ve reported, and every step toward getting it sorted.
          </p>
        </div>
        <div className="heading-actions">
          <button
            className="button button-outline button-small"
            onClick={() => void refreshComplaints()}
            disabled={loading}
          >
            <RefreshCw className={loading ? 'spin' : ''} />
            Refresh
          </button>
          <Link to="/submit" className="button button-primary button-small">
            <FilePlus2 />
            New report
          </Link>
        </div>
      </div>
      {error && (
        <div className="error-banner" role="alert">
          <span>{error} Your available records are shown below.</span>
          <button onClick={() => void refreshComplaints()}>Retry</button>
        </div>
      )}
      <div className="metrics-grid">
        <Metric
          label="Total reports"
          value={loading && !complaints.length ? '—' : stats.total}
          note="All your campus reports"
          icon={ClipboardList}
        />
        <Metric
          label="Awaiting action"
          value={stats.openCount}
          note="Submitted, in review or assigned"
          icon={Clock3}
        />
        <Metric
          label="In progress"
          value={stats.inProgressCount}
          note="Currently being worked on"
          icon={Wrench}
        />
        <Metric
          label="Resolved"
          value={stats.resolvedCount}
          note="A little better, thanks to you"
          icon={CheckCircle2}
          tone="resolved"
        />
      </div>
      <div className="dashboard-columns">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Your resolution snapshot</h2>
              <p>A view across all your reports</p>
            </div>
            <span>All time</span>
          </div>
          <div className="panel-body progress-summary">
            <div
              className="resolution-ring"
              role="img"
              aria-label={`${percent}% of your reports resolved`}
            >
              <svg viewBox="0 0 128 128" aria-hidden="true">
                <circle cx="64" cy="64" r="54" />
                <circle
                  className="ring-fill"
                  cx="64"
                  cy="64"
                  r="54"
                  strokeDasharray={`${percent * 3.393} 339.3`}
                />
              </svg>
              <div className="ring-label">
                <strong>{stats.total ? `${percent}%` : '—'}</strong>
                <span>resolved</span>
              </div>
            </div>
            <div className="progress-legend">
              <div className="legend-row">
                <span>
                  <i className="legend-dot" />
                  Awaiting action
                </span>
                <strong>{stats.openCount}</strong>
              </div>
              <div className="legend-row">
                <span>
                  <i className="legend-dot blue" />
                  In progress
                </span>
                <strong>{stats.inProgressCount}</strong>
              </div>
              <div className="legend-row">
                <span>
                  <i className="legend-dot green" />
                  Resolved
                </span>
                <strong>{stats.resolvedCount}</strong>
              </div>
              {other > 0 && (
                <div className="legend-row">
                  <span>
                    <i className="legend-dot" />
                    Reopened or rejected
                  </span>
                  <strong>{other}</strong>
                </div>
              )}
            </div>
          </div>
        </section>
        <aside className="dashboard-nudge">
          <FilePlus2 />
          <div>
            <h2>
              Noticed something
              <br />
              that needs a fix?
            </h2>
            <p>
              A clear description and a location are all you need to get
              started.
            </p>
          </div>
          <Link to="/submit" className="button button-light button-small">
            Make a report
            <ArrowUpRight />
          </Link>
        </aside>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Your report history</h2>
            <p>Open a report to see its full timeline and updates</p>
          </div>
          {loading && (
            <RefreshCw size={15} className="spin" aria-label="Refreshing" />
          )}
        </div>
        <div className="table-tabs" aria-label="Filter reports">
          <button
            aria-pressed={tab === 'all'}
            className={tab === 'all' ? 'active' : ''}
            onClick={() => {
              setTab('all');
              setPage(1);
            }}
          >
            All reports<span className="tab-count">{stats.total}</span>
          </button>
          <button
            aria-pressed={tab === 'active'}
            className={tab === 'active' ? 'active' : ''}
            onClick={() => {
              setTab('active');
              setPage(1);
            }}
          >
            Active<span className="tab-count">{active}</span>
          </button>
          <button
            aria-pressed={tab === 'resolved'}
            className={tab === 'resolved' ? 'active' : ''}
            onClick={() => {
              setTab('resolved');
              setPage(1);
            }}
          >
            Resolved<span className="tab-count">{stats.resolvedCount}</span>
          </button>
        </div>
        <div className="table-toolbar">
          <label className="search-field">
            <Search />
            <span className="sr-only">Search your reports</span>
            <input
              type="search"
              placeholder="Search reports, tracking IDs, locations..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </label>
          <select
            aria-label="Filter by status"
            className="filter-control"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {STATUS_LIST.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          {(query || status || tab !== 'all') && (
            <button
              className="button button-outline button-small"
              onClick={() => {
                setQuery('');
                setStatus('');
                setTab('all');
                setPage(1);
              }}
            >
              Clear filters
            </button>
          )}
        </div>
        <ComplaintTable
          items={filtered.slice(
            (currentPage - 1) * PAGE_SIZE,
            currentPage * PAGE_SIZE
          )}
          loading={loading}
          filtered={Boolean(query || status || tab !== 'all')}
        />
        <Pagination
          page={currentPage}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </section>
    </>
  );
}
