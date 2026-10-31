import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { SecurityBanner } from '../common/SecurityBanner';
import { EC2InstanceConfig } from '../../types/lab';
import {
  Server,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Check,
  X,
  ExternalLink,
  Cpu,
  Key,
  Globe,
  Radio,
} from 'lucide-react';

export const EC2InstancesPage: React.FC = () => {
  const { ec2Instances, updateEC2Instance, setActivePage } = useLab();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<EC2InstanceConfig>>({});

  const startEdit = (inst: EC2InstanceConfig) => {
    setEditingId(inst.id);
    setForm({
      actualInstanceId: inst.actualInstanceId,
      actualPublicIp: inst.actualPublicIp,
      privateIp: inst.privateIp,
      state: inst.state,
      az: inst.az,
      instanceType: inst.instanceType,
    });
  };

  const saveEdit = (id: string) => {
    updateEC2Instance(id, form);
    setEditingId(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SecurityBanner />

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
              Stage 5 Compute Nodes
            </span>
            <span className="text-xs font-mono text-slate-400">
              Amazon Linux 2023 (t3.micro)
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            EC2 Instance Provisioning & Host Identity
          </h1>
          <p className="text-xs text-slate-400">
            Launch three instances: One public bastion jump host and two isolated private application servers.
          </p>
        </div>

        <button
          onClick={() => setActivePage('ssh')}
          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer shrink-0"
        >
          <span>Configure SSH ProxyJump</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Zero Public IP Isolation Guarantee Banner */}
      <div className="bg-emerald-950/20 border-l-4 border-l-emerald-500 border border-emerald-500/30 rounded-xl p-4 text-xs text-slate-300">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider font-mono">
              Strict Airgap Verification: Zero Public IPs on Application Nodes
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Verify in the AWS Console that <strong>ewb-app-a</strong> and <strong>ewb-app-b</strong> have NO public IPv4 addresses assigned. They are only reachable through private IPs across the VPC peering connection and through <strong>ewb-bastion</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Instance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ec2Instances.map((inst) => {
          const isEditing = editingId === inst.id;
          const isBastion = inst.id === 'ec2-bastion';
          const ipMismatch = inst.privateIp !== inst.expectedPrivateIp;

          return (
            <div
              key={inst.id}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between ${
                isBastion ? 'border-amber-500/30' : 'border-slate-800'
              }`}
            >
              <div className="space-y-4">
                {/* Card Title & Badges */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                      isBastion
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : inst.vpc === 'ewb-vpc-a'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}
                  >
                    {inst.vpc}
                  </span>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 font-bold ${
                      inst.state === 'running'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Radio className="w-3 h-3" />
                    {inst.state}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-white font-mono flex items-center gap-2">
                    <Server className="w-4 h-4 text-amber-400" />
                    {inst.name}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Subnet: <span className="font-mono text-slate-300">{inst.subnet}</span>
                  </div>
                </div>

                {/* Instance Attributes Table */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                  {/* Instance ID */}
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">AWS Instance ID:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={form.actualInstanceId || ''}
                        onChange={(e) => setForm({ ...form, actualInstanceId: e.target.value })}
                        placeholder="i-0a1b2c3d4e..."
                        className="w-full bg-slate-900 border border-amber-500/80 px-2 py-1 text-xs text-amber-300 rounded font-mono mt-0.5"
                      />
                    ) : (
                      <span className="font-bold text-amber-300">
                        {inst.actualInstanceId || 'Not recorded'}
                      </span>
                    )}
                  </div>

                  {/* Private IP */}
                  <div className="pt-1 border-t border-slate-900">
                    <span className="text-slate-400 block text-[10px] uppercase">Private IPv4:</span>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{inst.privateIp}</span>
                      {ipMismatch && (
                        <span className="text-[10px] text-amber-400 bg-amber-500/20 px-1.5 py-0.2 rounded font-sans">
                          Expected {inst.expectedPrivateIp}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Public IP */}
                  <div className="pt-1 border-t border-slate-900">
                    <span className="text-slate-400 block text-[10px] uppercase">Public IPv4:</span>
                    {isBastion ? (
                      isEditing ? (
                        <input
                          type="text"
                          value={form.actualPublicIp || ''}
                          onChange={(e) => setForm({ ...form, actualPublicIp: e.target.value })}
                          placeholder="e.g. 13.235.112.84"
                          className="w-full bg-slate-900 border border-cyan-500/80 px-2 py-1 text-xs text-cyan-300 rounded font-mono mt-0.5"
                        />
                      ) : (
                        <span className="font-bold text-cyan-400">
                          {inst.actualPublicIp || 'Enter Bastion Public IP'}
                        </span>
                      )
                    ) : (
                      <span className="text-emerald-400 font-bold">None (Airgapped)</span>
                    )}
                  </div>

                  {/* Security Group & Key Pair */}
                  <div className="pt-1 border-t border-slate-900 flex justify-between text-[11px]">
                    <span className="text-slate-400">SG: {inst.securityGroup}</span>
                    <span className="text-slate-400">Key: {inst.keyPair}</span>
                  </div>
                </div>
              </div>

              {/* Edit / Save Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-end">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => saveEdit(inst.id)}
                      className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(inst)}
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3 text-amber-400" />
                    <span>Edit EC2 Details</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
