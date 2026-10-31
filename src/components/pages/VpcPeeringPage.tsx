import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { SecurityBanner } from '../common/SecurityBanner';
import {
  Waypoints,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  Info,
  ExternalLink,
  Edit2,
  Check,
  X,
  Copy,
} from 'lucide-react';

export const VpcPeeringPage: React.FC = () => {
  const { peering, updatePeering, resources, setActivePage } = useLab();
  const [editingPcx, setEditingPcx] = useState(false);
  const [pcxInput, setPcxInput] = useState(peering.actualPcxId);
  const [copiedCli, setCopiedCli] = useState(false);

  const vpcARes = resources.find((r) => r.id === 'res-vpc-a');
  const vpcBRes = resources.find((r) => r.id === 'res-vpc-b');

  const handleSavePcx = () => {
    updatePeering({ actualPcxId: pcxInput });
    setEditingPcx(false);
  };

  const copyCliCommand = () => {
    const cmd = `aws ec2 create-vpc-peering-connection --vpc-id ${vpcARes?.actualAwsId || 'VPC_A_ID'} --peer-vpc-id ${vpcBRes?.actualAwsId || 'VPC_B_ID'} --tag-specifications "ResourceType=vpc-peering-connection,Tags=[{Key=Name,Value=ewb-a-b-peer}]"`;
    navigator.clipboard.writeText(cmd);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SecurityBanner />

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
              Stage 8 Peering Link
            </span>
            <span className="text-xs font-mono text-slate-400">
              Point-to-Point Layer 3 Tunnel
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Establish VPC Peering Connection (ewb-a-b-peer)
          </h1>
          <p className="text-xs text-slate-400">
            Request peering from <code>ewb-vpc-a</code> to <code>ewb-vpc-b</code>, record the AWS-assigned <code>pcx-</code> ID, and accept the pending request.
          </p>
        </div>

        <button
          onClick={() => setActivePage('routes')}
          className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer shrink-0"
        >
          <span>Next: Configure Route Tables</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Critical Concept Warning */}
      <div className="bg-amber-950/20 border-l-4 border-l-amber-500 border border-amber-500/30 rounded-xl p-4 text-xs text-slate-300">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider font-mono">
              Active Peering Status Alone Does NOT Allow Traffic!
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Accepting the peering request sets the physical connection state to <strong>Active</strong>. However, packets will be blackholed until you configure <strong>Forward and Return routes</strong> in both VPC route tables (Stage 9) and permit ICMP/SSH in security groups (Stage 4).
            </p>
          </div>
        </div>
      </div>

      {/* Peering Configuration Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Waypoints className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white font-mono">{peering.name}</h2>
              <div className="text-xs font-mono text-slate-400">
                10.10.0.0/16 ↔ 10.20.0.0/16 (Intra-Region Peering)
              </div>
            </div>
          </div>

          {/* Peering Status Control */}
          <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-mono">Current Status:</span>
            <select
              value={peering.status}
              onChange={(e) => updatePeering({ status: e.target.value as any })}
              className={`text-xs font-mono font-bold rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer ${
                peering.status === 'Active'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : peering.status === 'Pending acceptance'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              <option value="Not created">Not created</option>
              <option value="Pending acceptance">Pending acceptance</option>
              <option value="Active">Active (Operational)</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Peering Attributes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="text-slate-400 text-[10px] uppercase">Requester VPC (VPC A)</div>
            <div className="text-sm font-bold text-blue-400">ewb-vpc-a</div>
            <div className="text-slate-300">CIDR: 10.10.0.0/16</div>
            <div className="text-slate-400 text-[11px]">
              Actual VPC ID: <span className="text-amber-400">{vpcARes?.actualAwsId || 'vpc-0a89f23b...'}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="text-slate-400 text-[10px] uppercase">Accepter VPC (VPC B)</div>
            <div className="text-sm font-bold text-purple-400">ewb-vpc-b</div>
            <div className="text-slate-300">CIDR: 10.20.0.0/16</div>
            <div className="text-slate-400 text-[11px]">
              Actual VPC ID: <span className="text-amber-400">{vpcBRes?.actualAwsId || 'vpc-0f77bc91...'}</span>
            </div>
          </div>
        </div>

        {/* AWS Peering ID Field */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-slate-300 block">
              Actual AWS Peering Connection ID (pcx-xxxx)
            </span>
            <span className="text-[11px] text-slate-400">
              Copied from AWS VPC Console → Peering Connections
            </span>
          </div>

          {editingPcx ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={pcxInput}
                onChange={(e) => setPcxInput(e.target.value)}
                placeholder="pcx-0a1b2c3d4e5f67890"
                className="bg-slate-900 border border-amber-500 px-3 py-1.5 text-xs text-amber-300 font-mono rounded-lg w-52 focus:outline-none"
              />
              <button
                onClick={handleSavePcx}
                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditingPcx(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-amber-300 text-sm bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                {peering.actualPcxId || 'pcx-087654321fedcba09 (Demo)'}
              </span>
              <button
                onClick={() => {
                  setPcxInput(peering.actualPcxId);
                  setEditingPcx(true);
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                title="Edit pcx ID"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Step by Step Execution Instructions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
          AWS Console Step-by-Step Procedure
        </h3>

        <div className="space-y-2 text-xs text-slate-300">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-3">
            <span className="w-5 h-5 rounded bg-slate-800 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
              1
            </span>
            <div>
              <strong>Create Peering Connection:</strong> In AWS VPC Console → Peering Connections → Create peering connection. Name: <code>ewb-a-b-peer</code>. Requester: select <code>ewb-vpc-a</code>. Accepter: select <code>ewb-vpc-b</code> (My account, Same region).
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-3">
            <span className="w-5 h-5 rounded bg-slate-800 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
              2
            </span>
            <div>
              <strong>Accept Peering Request:</strong> Notice the status changes to <em>Pending acceptance</em>. Select <code>ewb-a-b-peer</code> → Actions → <strong>Accept Request</strong>. Confirm acceptance.
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-3">
            <span className="w-5 h-5 rounded bg-slate-800 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
              3
            </span>
            <div>
              <strong>Verify Active State:</strong> Confirm the status transitions to <strong>Active</strong>. Take a screenshot for your project evidence and proceed to Route Table configuration.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
