import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { SecurityBanner } from '../common/SecurityBanner';
import { SecurityGroupRule } from '../../types/lab';
import {
  ShieldCheck,
  Lock,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Edit2,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';

export const SecurityGroupsPage: React.FC = () => {
  const {
    securityGroups,
    profile,
    updateProfile,
    updateSecurityGroup,
    addSecurityGroupRule,
    removeSecurityGroupRule,
    setActivePage,
  } = useLab();

  const [activeSgId, setActiveSgId] = useState<string>('sg-bastion');
  const [editingActualId, setEditingActualId] = useState<string | null>(null);
  const [actualIdVal, setActualIdVal] = useState('');

  // New rule form modal
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [newRule, setNewRule] = useState<Partial<SecurityGroupRule>>({
    type: 'SSH',
    protocol: 'TCP',
    portRange: '22',
    source: '10.10.1.10/32',
    description: 'Inbound management rule',
  });

  const selectedSg = securityGroups.find((sg) => sg.id === activeSgId) || securityGroups[0];

  const handleSaveActualId = (sgId: string) => {
    updateSecurityGroup(sgId, { actualAwsId: actualIdVal });
    setEditingActualId(null);
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.type || !newRule.source) return;

    const rule: SecurityGroupRule = {
      id: `rule-${Date.now()}`,
      type: newRule.type as any,
      protocol: newRule.protocol as any,
      portRange: newRule.portRange || '22',
      icmpType: newRule.type === 'ICMP Echo Request' ? 8 : undefined,
      icmpCode: newRule.type === 'ICMP Echo Request' ? 0 : undefined,
      source: newRule.source,
      description: newRule.description || 'Custom rule',
    };

    addSecurityGroupRule(selectedSg.id, rule);
    setShowAddRuleModal(false);
  };

  // Rule safety analysis
  const hasUnsafeRule = (source: string) => {
    return source.includes('0.0.0.0/0') || source.trim() === 'any';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SecurityBanner />

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              Stage 4 Security Controls
            </span>
            <span className="text-xs font-mono text-slate-400">
              Stateful Instance-Level Firewalls
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Least-Privilege Security Groups Configuration
          </h1>
          <p className="text-xs text-slate-400">
            Enforce granular /32 CIDR sources. SSH port 22 belongs in port range; host private IP belongs in the Source field.
          </p>
        </div>

        {/* Student Public IP shortcut */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 block text-[10px] uppercase font-mono">Your Public IPv4 (/32):</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono font-bold text-amber-400">
              {profile.studentPublicIp ? `${profile.studentPublicIp}/32` : 'Not Set'}
            </span>
            <button
              onClick={() => setActivePage('overview')}
              className="text-[10px] text-slate-300 hover:text-white underline cursor-pointer"
            >
              Update IP
            </button>
          </div>
        </div>
      </div>

      {/* Security Warning Notice */}
      <div className="bg-red-950/20 border-l-4 border-l-red-500 border border-red-500/30 rounded-xl p-4 text-xs text-slate-300">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-red-400 text-xs uppercase tracking-wider font-mono">
              Strict Engineering Anti-Pattern: Never Use 0.0.0.0/0 on SSH or ICMP
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Exposing port 22 or ICMP to <code>0.0.0.0/0</code> will trigger automated internet-wide port scans, automated brute-force password bots, and immediate point deduction during lab grading. Always bound SSH to your student IP /32 and private App nodes to the Bastion private IP <code>10.10.1.10/32</code>.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Security Group Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {securityGroups.map((sg) => {
          const isSelected = sg.id === activeSgId;
          const isBastion = sg.id === 'sg-bastion';
          return (
            <button
              key={sg.id}
              onClick={() => setActiveSgId(sg.id)}
              className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                      isBastion
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    }`}
                  >
                    {sg.vpc}
                  </span>
                  {sg.actualAwsId && (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      {sg.actualAwsId}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white font-mono">{sg.name}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {sg.inboundRules.length} inbound rule{sg.inboundRules.length === 1 ? '' : 's'} defined
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                <span>{isBastion ? 'For ewb-bastion' : `For ewb-${sg.id.replace('sg-', '')}`}</span>
                <span className="text-amber-400 font-mono text-[10px]">Inspect Rules →</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Security Group Rules Inspector */}
      {selectedSg && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white font-mono">{selectedSg.name}</h2>
                <span className="text-xs font-mono text-slate-400">({selectedSg.vpc})</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Attach this security group during EC2 instance launch in the AWS Management Console.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Actual AWS ID Editor */}
              {editingActualId === selectedSg.id ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={actualIdVal}
                    onChange={(e) => setActualIdVal(e.target.value)}
                    placeholder="sg-0a1b2c3d4e..."
                    className="bg-slate-950 border border-amber-500 px-2.5 py-1 text-xs text-amber-300 font-mono rounded"
                  />
                  <button
                    onClick={() => handleSaveActualId(selectedSg.id)}
                    className="p-1 rounded bg-emerald-600 text-white cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingActualId(null)}
                    className="p-1 rounded bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">AWS ID:</span>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                    {selectedSg.actualAwsId || 'Not set'}
                  </span>
                  <button
                    onClick={() => {
                      setEditingActualId(selectedSg.id);
                      setActualIdVal(selectedSg.actualAwsId);
                    }}
                    className="text-slate-400 hover:text-white p-1 cursor-pointer"
                    title="Edit actual AWS SG ID"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <button
                onClick={() => setShowAddRuleModal(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Rule</span>
              </button>
            </div>
          </div>

          {/* Inbound Rules Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Inbound Rules (Default-Deny Model)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Protocol</th>
                    <th className="py-2.5 px-3">Port Range</th>
                    <th className="py-2.5 px-3">Source CIDR</th>
                    <th className="py-2.5 px-3">Description / Purpose</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {selectedSg.inboundRules.map((rule) => {
                    const isUnsafe = hasUnsafeRule(rule.source);
                    return (
                      <tr key={rule.id} className="hover:bg-slate-850/50">
                        <td className="py-2.5 px-3 font-semibold text-white">
                          <span className="font-mono">{rule.type}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">{rule.protocol}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">
                          {rule.type === 'ICMP Echo Request' ? (
                            <span className="text-cyan-400">Type 8, Code 0</span>
                          ) : (
                            rule.portRange
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-bold ${
                                isUnsafe
                                  ? 'text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/40'
                                  : 'text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20'
                              }`}
                            >
                              {rule.source}
                            </span>
                            {isUnsafe && (
                              <span title="Dangerous 0.0.0.0/0 exposure!" className="text-red-400">
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                          {rule.description}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => removeSecurityGroupRule(selectedSg.id, rule.id)}
                            className="p-1 text-slate-500 hover:text-red-400 cursor-pointer"
                            title="Remove rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Outbound rules explanation */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              <span className="font-semibold text-slate-300">Outbound Rules: </span>
              <span>All traffic allowed (0.0.0.0/0). Kept as default for this project.</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Stateful Connection Tracking Active
            </span>
          </div>
        </div>
      )}

      {/* Educational Deep Dive on Stateful vs Stateless */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2.5">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            Why AWS Security Groups Are Stateful
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            When App-A pings App-B, the ICMP Echo Request is inspected against App-B's inbound rules. Once admitted, the reply packet (ICMP Echo Reply) is <strong>automatically tracked and permitted outbound</strong> without needing an explicit outbound rule. Connection states are preserved across the session.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2.5">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            Port vs Source Field Confusion Trap
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            A common student error in the AWS console is typing the private IP address into the Port field. <strong>SSH always operates on TCP Port 22</strong>. The IP address (e.g. <code>10.10.1.10/32</code>) belongs strictly in the <strong>Source</strong> field with a /32 single-host subnet mask.
          </p>
        </div>
      </div>

      {/* Add Rule Modal */}
      {showAddRuleModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Add Inbound Rule to {selectedSg.name}</h3>
              <button
                onClick={() => setShowAddRuleModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRule} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Rule Type</label>
                <select
                  value={newRule.type}
                  onChange={(e) => {
                    const t = e.target.value as any;
                    setNewRule({
                      ...newRule,
                      type: t,
                      protocol: t === 'ICMP Echo Request' ? 'ICMP' : 'TCP',
                      portRange: t === 'SSH' ? '22' : 'N/A',
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded text-white font-mono"
                >
                  <option value="SSH">SSH (TCP Port 22)</option>
                  <option value="ICMP Echo Request">ICMP Echo Request (Type 8 Code 0)</option>
                  <option value="Custom">Custom TCP Rule</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Source CIDR</label>
                <input
                  type="text"
                  required
                  value={newRule.source}
                  onChange={(e) => setNewRule({ ...newRule, source: e.target.value })}
                  placeholder="e.g. 10.10.1.10/32"
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  placeholder="Purpose of rule..."
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRuleModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  Add Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
