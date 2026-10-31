import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { SecurityBanner } from '../common/SecurityBanner';
import { RouteEntry } from '../../types/lab';
import {
  Route,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Info,
  Edit2,
  Check,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const RouteTablesPage: React.FC = () => {
  const {
    routeTables,
    updateRouteTable,
    addRouteToTable,
    removeRouteFromTable,
    peering,
    setActivePage,
  } = useLab();

  const [activeTableId, setActiveTableId] = useState<string>('rt-a-private');
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [newRouteDest, setNewRouteDest] = useState('');
  const [newRouteTargetType, setNewRouteTargetType] = useState<'local' | 'igw' | 'pcx'>('pcx');
  const [newRouteTargetVal, setNewRouteTargetVal] = useState('');
  const [newRouteDesc, setNewRouteDesc] = useState('');

  const selectedTable = routeTables.find((rt) => rt.id === activeTableId) || routeTables[0];

  // Route validator: check for required routes in each table
  const validateTable = (tableId: string) => {
    const table = routeTables.find((t) => t.id === tableId);
    if (!table) return { status: 'Missing', issues: ['Table not found'] };

    const issues: string[] = [];

    if (tableId === 'rt-a-public') {
      const hasLocal = table.routes.some((r) => r.destinationCidr === '10.10.0.0/16' && r.targetType === 'local');
      const hasIgw = table.routes.some((r) => r.destinationCidr === '0.0.0.0/0' && (r.targetType === 'igw' || r.targetValue.includes('igw')));
      const hasPcx = table.routes.some((r) => r.destinationCidr === '10.20.0.0/16' && (r.targetType === 'pcx' || r.targetValue.includes('pcx')));

      if (!hasLocal) issues.push('Missing local route (10.10.0.0/16 -> local)');
      if (!hasIgw) issues.push('Missing internet route (0.0.0.0/0 -> ewb-igw-a)');
      if (!hasPcx) issues.push('Missing peering route (10.20.0.0/16 -> pcx) for Bastion to jump into VPC B');
    }

    if (tableId === 'rt-a-private') {
      const hasLocal = table.routes.some((r) => r.destinationCidr === '10.10.0.0/16' && r.targetType === 'local');
      const hasPcx = table.routes.some((r) => r.destinationCidr === '10.20.0.0/16' && (r.targetType === 'pcx' || r.targetValue.includes('pcx')));
      const hasDangerousIgw = table.routes.some((r) => r.destinationCidr === '0.0.0.0/0');

      if (!hasLocal) issues.push('Missing local route (10.10.0.0/16 -> local)');
      if (!hasPcx) issues.push('Missing forward peering route (10.20.0.0/16 -> pcx)');
      if (hasDangerousIgw) issues.push('Security warning: 0.0.0.0/0 should NOT exist in private route table!');
    }

    if (tableId === 'rt-b-private') {
      const hasLocal = table.routes.some((r) => r.destinationCidr === '10.20.0.0/16' && r.targetType === 'local');
      const hasReturnPcx = table.routes.some((r) => r.destinationCidr === '10.10.0.0/16' && (r.targetType === 'pcx' || r.targetValue.includes('pcx')));
      const hasDangerousIgw = table.routes.some((r) => r.destinationCidr === '0.0.0.0/0');

      if (!hasLocal) issues.push('Missing local route (10.20.0.0/16 -> local)');
      if (!hasReturnPcx) issues.push('CRITICAL: Missing return peering route (10.10.0.0/16 -> pcx)');
      if (hasDangerousIgw) issues.push('Violation: VPC B has no IGW; 0.0.0.0/0 is invalid!');
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  };

  const handleAddRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteDest) return;

    const route: RouteEntry = {
      id: `route-${Date.now()}`,
      destinationCidr: newRouteDest,
      targetType: newRouteTargetType,
      targetValue: newRouteTargetVal || (newRouteTargetType === 'pcx' ? peering.actualPcxId || 'pcx-087654321fedcba09' : 'local'),
      description: newRouteDesc || 'Custom route',
      isCustom: true,
    };

    addRouteToTable(selectedTable.id, route);
    setShowAddRouteModal(false);
    setNewRouteDest('');
    setNewRouteDesc('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SecurityBanner />

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 font-bold">
              Stage 9 Routing Logic
            </span>
            <span className="text-xs font-mono text-slate-400">
              Forward & Return Route Tables
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            VPC Route Table Configuration & Validation
          </h1>
          <p className="text-xs text-slate-400">
            Routing is hop-by-hop. Forward packets require a destination rule; return packets require an explicit return rule in the peer table.
          </p>
        </div>

        <button
          onClick={() => setActivePage('testing')}
          className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer shrink-0"
        >
          <span>Next: Run Connectivity Tests</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3 Route Table Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {routeTables.map((rt) => {
          const isSelected = rt.id === activeTableId;
          const validation = validateTable(rt.id);
          return (
            <button
              key={rt.id}
              onClick={() => setActiveTableId(rt.id)}
              className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                      rt.vpc === 'ewb-vpc-a'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}
                  >
                    {rt.vpc}
                  </span>

                  {validation.isValid ? (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      Correct
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1 font-bold">
                      <AlertTriangle className="w-3 h-3" />
                      Missing Routes
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white font-mono">{rt.name}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Subnet: <span className="font-mono text-slate-300">{rt.associatedSubnet}</span>
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                <span>{rt.routes.length} active routes</span>
                <span className="text-amber-400 font-mono text-[10px]">Inspect Table →</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Route Table Details */}
      {selectedTable && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Route className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white font-mono">{selectedTable.name}</h2>
                <span className="text-xs font-mono text-slate-400">({selectedTable.vpc})</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Subnet Association:{' '}
                <strong className="text-amber-300 font-mono">{selectedTable.associatedSubnet}</strong>
              </p>
            </div>

            <button
              onClick={() => setShowAddRouteModal(true)}
              className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Route</span>
            </button>
          </div>

          {/* Validation Status Notice */}
          {(() => {
            const validation = validateTable(selectedTable.id);
            if (validation.isValid) {
              return (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>All authoritative routes and targets for <strong>{selectedTable.name}</strong> are verified and correctly provisioned.</span>
                </div>
              );
            }
            return (
              <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-1 text-xs text-amber-200">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Validation Warning for {selectedTable.name}:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300 pl-6">
                  {validation.issues.map((iss, i) => (
                    <li key={i}>{iss}</li>
                  ))}
                </ul>
              </div>
            );
          })()}

          {/* Routes Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Destination CIDR</th>
                  <th className="py-3 px-4">Target Type</th>
                  <th className="py-3 px-4">Target Value / ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {selectedTable.routes.map((r) => {
                  return (
                    <tr key={r.id} className="hover:bg-slate-850/50">
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        <span
                          className={
                            r.destinationCidr === '0.0.0.0/0'
                              ? 'text-cyan-400'
                              : r.destinationCidr.includes('10.20.')
                              ? 'text-purple-400'
                              : 'text-blue-400'
                          }
                        >
                          {r.destinationCidr}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-300">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                          {r.targetType}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-amber-300 font-semibold">
                        {r.targetValue}
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                          Active
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-400 text-[11px] max-w-sm">
                        {r.description}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {r.targetType !== 'local' ? (
                          <button
                            onClick={() => removeRouteFromTable(selectedTable.id, r.id)}
                            className="p-1 text-slate-500 hover:text-red-400 cursor-pointer"
                            title="Delete route"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-slate-600 text-[10px] font-mono">Immutable</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Educational Deep Dive on Longest-Prefix-Match */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            Longest Prefix Match (LPM) Routing Rule
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            When multiple routes in a route table match a packet's destination IP, AWS routers <strong>always evaluate the most specific route</strong> (the one with the largest subnet mask prefix number).
          </p>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
            <div>1. <code>10.10.1.10/32</code> (Most specific, host route)</div>
            <div>2. <code>10.10.0.0/16</code> (Local VPC route)</div>
            <div>3. <code>0.0.0.0/0</code> (Default fallback internet route)</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400" />
            Why ewb-rt-a-public Needs the Peering Route
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            The bastion host resides in <code>ewb-a-public</code>, not <code>ewb-a-private</code>. When you run <code>ssh ewb-app-b</code> via ProxyJump, the bastion must route packets to <code>10.20.1.10</code>. If <code>ewb-rt-a-public</code> lacks <code>10.20.0.0/16 → pcx</code>, the bastion will send those packets out to the Internet Gateway, causing connection timeout!
          </p>
        </div>
      </div>

      {/* Add Route Modal */}
      {showAddRouteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Add Route to {selectedTable.name}</h3>
              <button
                onClick={() => setShowAddRouteModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRoute} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Destination CIDR</label>
                <input
                  type="text"
                  required
                  value={newRouteDest}
                  onChange={(e) => setNewRouteDest(e.target.value)}
                  placeholder="e.g. 10.20.0.0/16 or 0.0.0.0/0"
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Type</label>
                <select
                  value={newRouteTargetType}
                  onChange={(e) => setNewRouteTargetType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded text-white font-mono"
                >
                  <option value="pcx">Peering Connection (pcx-xxxx)</option>
                  <option value="igw">Internet Gateway (igw-xxxx)</option>
                  <option value="local">Local VPC</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Value / ID</label>
                <input
                  type="text"
                  value={newRouteTargetVal}
                  onChange={(e) => setNewRouteTargetVal(e.target.value)}
                  placeholder="e.g. pcx-087654321fedcba09"
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={newRouteDesc}
                  onChange={(e) => setNewRouteDesc(e.target.value)}
                  placeholder="Route description..."
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRouteModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  Save Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
