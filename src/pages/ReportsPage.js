import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Filter, Search, Calendar, ExternalLink } from 'lucide-react';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import DataGrid from '../components/ui/DataGrid';

const ReportsPage = () => {
  const navigate = useNavigate();

  // One example report — real reports will appear here after running simulations
  const reports = [
    { id: 'SIM-042', name: 'Optimization Test #42 — Milling Thermal Analysis', type: 'SIM', date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-studio-text-main tracking-tight">Simulation Reports</h1>
          <p className="text-sm text-studio-text-muted mt-1">Access generated analysis and compliance documents.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={Filter} size="sm">Filter</Button>
        </div>
      </div>

      <Panel>
        <div className="flex items-center gap-4 mb-6 p-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-studio-text-dim" />
            <input
              type="text"
              placeholder="Search reports by name or ID..."
              className="w-full bg-studio-surface/70 border border-studio-border/70 rounded-lg pl-10 pr-4 py-2 text-sm text-studio-text-main focus:ring-2 focus:ring-studio-primary/20 outline-none"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-studio-text-muted border border-studio-border/70 rounded-lg px-3 py-2 bg-studio-panel/80">
            <Calendar className="w-4 h-4" />
            <span>Last 30 Days</span>
          </div>
        </div>

        <DataGrid
          headers={['Reference ID', 'Document Name', 'Format', 'Date', 'Action']}
          data={reports.map(r => ({
            id: <span className="font-mono text-xs text-studio-text-muted">{r.id}</span>,
            name: <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-studio-primary" /><span className="font-medium text-studio-text-main">{r.name}</span></div>,
            type: <span className="text-[10px] uppercase font-bold text-studio-text-dim bg-studio-canvas px-2 py-0.5 rounded">{r.type}</span>,
            date: r.date,
            action: (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                icon={ExternalLink}
                onClick={() => navigate(`/simulation/${r.id}`)}
              >
                View &amp; Export
              </Button>
            )
          }))}
        />

        {reports.length <= 1 && (
          <div className="mt-6 text-center py-8 border-t border-studio-border/40">
            <p className="text-sm text-studio-text-dim">
              Run a simulation to generate reports here.
            </p>
            <Button
              variant="primary"
              size="sm"
              className="mt-3"
              onClick={() => navigate('/simulation/setup')}
            >
              New Simulation
            </Button>
          </div>
        )}
      </Panel>
    </div>
  );
};

export default ReportsPage;
