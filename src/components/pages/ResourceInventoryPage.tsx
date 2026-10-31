import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { SecurityBanner } from '../common/SecurityBanner';
import { ResourceItem, ResourceStatus } from '../../types/lab';
import {
  Boxes,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Edit2,
  Check,
  X,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const ResourceInventoryPage: React.FC = () => {
  const { resources, updateResource, loadSampleData } = useLab();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterVpc, setFilterVpc] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ResourceItem>>({});

  const startEdit = (res: ResourceItem) => {
    setEditingId(res.id);
    setEditForm({
      actualAwsId: res.actualAwsId,
      status: res.status,
      cidrOrIp: res.cidrOrIp,
      notes: res.notes,
    });
  };

  const saveEdit = (id: string) => {
    updateResource(id, editForm);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Filtered resources
  const filtered = resources.filter((res) => {
    const matchesSearch =
      res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.actualAwsId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.cidrOrIp.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || res.type === filterType;
    const matchesVpc = filterVpc === 'all' || res.vpc === filterVpc;

    return matchesSearch && matchesType && matchesVpc;
  });

  // Export to CSV
  const exportToCsv = () => {
    const headers = [
      'Resource Name',
      'Resource Type',
      'VPC',
      'Subnet',
      'CIDR / Private IP',
      'Expected IP',
      'Actual AWS Resource ID',
      'Status',
      'Notes',
    ];
    const rows = resources.map((r) => [
      `"${r.name}"`,
      `"${r.type}"`,
      `"${r.vpc}"`,
      `"${r.subnet || 'N/A'}"`,
      `"${r.cidrOrIp}"`,
      `"${r.expectedCidrOrIp}"`,
      `"${r.actualAwsId}"`,
      `"${r.status}"`,
      `"${r.notes.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'AWS_VPC_Peering_Resource_Inventory.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Count verified
  const recordedCount = resources.filter((r) => r.actualAwsId.trim().length > 0).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SecurityBanner />

      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              AWS Inventory Ledger
            </span>
            <span className="text-xs font-mono text-slate-400">
              17 Authoritative Project Components
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            AWS Resource Inventory & Physical ID Mapping
          </h1>
          <p className="text-xs text-slate-400">
            Record actual AWS-generated resource IDs (e.g. <code>vpc-xxxx</code>, <code>subnet-xxxx</code>, <code>i-xxxx</code>, <code>pcx-xxxx</code>) created via your AWS console.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCsv}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, type, CIDR or AWS ID..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Filters and Stats */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="VPC">VPC</option>
              <option value="Subnet">Subnet</option>
              <option value="Internet Gateway">Internet Gateway</option>
              <option value="Route Table">Route Table</option>
              <option value="Security Group">Security Group</option>
              <option value="EC2 Instance">EC2 Instance</option>
              <option value="VPC Peering">VPC Peering</option>
              <option value="Key Pair">Key Pair</option>
            </select>

            <select
              value={filterVpc}
              onChange={(e) => setFilterVpc(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="all">All VPCs</option>
              <option value="ewb-vpc-a">ewb-vpc-a</option>
              <option value="ewb-vpc-b">ewb-vpc-b</option>
              <option value="N/A">Global / Peering</option>
            </select>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Recorded: <strong className="text-amber-400">{recordedCount}</strong> / 17
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Resource Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">VPC Scope</th>
                <th className="py-3 px-4">Subnet</th>
                <th className="py-3 px-4">CIDR / Private IP</th>
                <th className="py-3 px-4">Actual AWS Resource ID</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((res) => {
                const isEditing = editingId === res.id;
                const ipMismatch =
                  res.type === 'EC2 Instance' &&
                  res.cidrOrIp !== res.expectedCidrOrIp &&
                  res.cidrOrIp.trim().length > 0;

                return (
                  <tr
                    key={res.id}
                    className={`hover:bg-slate-850/60 transition ${
                      isEditing ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    {/* Name */}
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{res.name}</span>
                        {ipMismatch && (
                          <span
                            title={`IP mismatch alert! Expected ${res.expectedCidrOrIp}`}
                            className="text-amber-400"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans font-normal truncate max-w-xs mt-0.5">
                        {res.notes}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4 text-slate-300">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {res.type}
                      </span>
                    </td>

                    {/* VPC Scope */}
                    <td className="py-3 px-4 font-mono text-slate-300">
                      <span
                        className={
                          res.vpc === 'ewb-vpc-a'
                            ? 'text-blue-400 font-semibold'
                            : res.vpc === 'ewb-vpc-b'
                            ? 'text-purple-400 font-semibold'
                            : 'text-slate-500'
                        }
                      >
                        {res.vpc}
                      </span>
                    </td>

                    {/* Subnet */}
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {res.subnet || '—'}
                    </td>

                    {/* CIDR or Private IP */}
                    <td className="py-3 px-4 font-mono">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.cidrOrIp || ''}
                          onChange={(e) => setEditForm({ ...editForm, cidrOrIp: e.target.value })}
                          className="bg-slate-950 border border-slate-700 px-2 py-1 rounded text-xs text-white font-mono w-36"
                        />
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span
                            className={
                              res.cidrOrIp.includes('10.10.')
                                ? 'text-blue-300'
                                : res.cidrOrIp.includes('10.20.')
                                ? 'text-purple-300'
                                : 'text-slate-300'
                            }
                          >
                            {res.cidrOrIp}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Actual AWS ID */}
                    <td className="py-3 px-4 font-mono">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.actualAwsId || ''}
                          onChange={(e) => setEditForm({ ...editForm, actualAwsId: e.target.value })}
                          placeholder="e.g. vpc-0a1b2c3..."
                          className="bg-slate-950 border border-amber-500/80 px-2.5 py-1 rounded text-xs text-amber-300 font-mono w-44 focus:outline-none"
                        />
                      ) : res.actualAwsId ? (
                        <span className="text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {res.actualAwsId}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Pending AWS creation</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <select
                          value={editForm.status || 'Not started'}
                          onChange={(e) =>
                            setEditForm({ ...editForm, status: e.target.value as ResourceStatus })
                          }
                          className="bg-slate-950 border border-slate-700 text-xs text-white rounded px-2 py-1 font-mono"
                        >
                          <option value="Not started">Not started</option>
                          <option value="Creating">Creating</option>
                          <option value="Available">Available</option>
                          <option value="Failed">Failed</option>
                          <option value="Deleted">Deleted</option>
                        </select>
                      ) : (
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                            res.status === 'Available'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : res.status === 'Creating'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : res.status === 'Failed'
                              ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                              : res.status === 'Deleted'
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-slate-800/80 text-slate-500'
                          }`}
                        >
                          {res.status}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => saveEdit(res.id)}
                            className="p-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                            title="Save changes"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(res)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-medium flex items-center gap-1 ml-auto cursor-pointer transition"
                        >
                          <Edit2 className="w-3 h-3 text-amber-400" />
                          <span>Edit</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
