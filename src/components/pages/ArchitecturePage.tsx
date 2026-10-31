import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { SecurityBanner } from '../common/SecurityBanner';
import {
  Network,
  Globe,
  Laptop,
  Shield,
  Server,
  ArrowRight,
  Info,
  CheckCircle2,
  Clock,
  Layers,
  Route,
  Activity,
  X,
  Play,
  RotateCcw,
} from 'lucide-react';

export const ArchitecturePage: React.FC = () => {
  const {
    resources,
    peering,
    updatePeering,
    ec2Instances,
    routeTables,
    securityGroups,
    setActivePage,
  } = useLab();

  // Selected resource for inspector drawer
  const [selectedNode, setSelectedNode] = useState<string | null>('ewb-a-b-peer');

  // Active communication simulation path: 'none' | 'laptop-bastion-appa' | 'laptop-bastion-appb' | 'appa-appb-peer'
  const [simulatedPath, setSimulatedPath] = useState<
    'none' | 'laptop-bastion-appa' | 'laptop-bastion-appb' | 'appa-appb-peer'
  >('appa-appb-peer');

  const bastion = ec2Instances.find((i) => i.id === 'ec2-bastion');
  const appA = ec2Instances.find((i) => i.id === 'ec2-app-a');
  const appB = ec2Instances.find((i) => i.id === 'ec2-app-b');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SecurityBanner />

      {/* Top Header & Simulation Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                Topology Visualizer
              </span>
              <span className="text-xs font-mono text-slate-400">
                Non-Overlapping VPC Peering (ap-south-1)
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">
              Interactive AWS VPC Peering Architecture
            </h1>
            <p className="text-xs text-slate-400">
              Click any AWS resource box to inspect its configuration and rules. Use simulation toggles to trace exact packet paths.
            </p>
          </div>

          {/* Peering status quick toggle */}
          <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <div className="text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Peering Status:</span>
              <span
                className={`font-mono font-bold ${
                  peering.status === 'Active'
                    ? 'text-emerald-400'
                    : peering.status === 'Pending acceptance'
                    ? 'text-amber-400'
                    : 'text-slate-400'
                }`}
              >
                {peering.status}
              </span>
            </div>
            <select
              value={peering.status}
              onChange={(e) => updatePeering({ status: e.target.value as any })}
              className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 font-mono focus:outline-none cursor-pointer"
            >
              <option value="Not created">Not created</option>
              <option value="Pending acceptance">Pending acceptance</option>
              <option value="Active">Active (Operational)</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Path Simulation Buttons */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mr-2">
            <Play className="w-3.5 h-3.5 text-amber-400" />
            Trace Packet Flow:
          </span>

          <button
            onClick={() => setSimulatedPath('laptop-bastion-appa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
              simulatedPath === 'laptop-bastion-appa'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <span>1. Laptop → Bastion → App-A</span>
            <span className="text-[10px] opacity-80">(SSH VPC A)</span>
          </button>

          <button
            onClick={() => setSimulatedPath('laptop-bastion-appb')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
              simulatedPath === 'laptop-bastion-appb'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <span>2. Laptop → Bastion → App-B</span>
            <span className="text-[10px] opacity-80">(SSH Peered)</span>
          </button>

          <button
            onClick={() => setSimulatedPath('appa-appb-peer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
              simulatedPath === 'appa-appb-peer'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <span>3. App-A ↔ App-B (Private Ping)</span>
            <span className="text-[10px] opacity-80">(Bidirectional)</span>
          </button>

          <button
            onClick={() => setSimulatedPath('none')}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="Reset active packet trace"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Visual Canvas & Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Diagram Area */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-inner relative overflow-hidden">
          {/* External Internet & Laptop Zone */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-dashed border-slate-800">
            {/* Student Laptop */}
            <div
              onClick={() => setSelectedNode('laptop')}
              className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                selectedNode === 'laptop'
                  ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                  : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
              } ${
                simulatedPath.includes('laptop') ? 'ring-2 ring-amber-400 animate-pulse' : ''
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-800 text-amber-400">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Student Laptop</div>
                <div className="text-[11px] font-mono text-slate-400">Public IP: {bastion?.actualPublicIp || '49.207.x.x'}</div>
                <div className="text-[10px] text-amber-400/90 font-mono">SSH Client with ~/.ssh/ewb-lab.pem</div>
              </div>
            </div>

            {/* Simulated flow connection arrow to IGW */}
            <div className="hidden md:flex items-center gap-2 text-slate-500 text-xs font-mono">
              <span className="h-0.5 w-16 bg-gradient-to-r from-amber-500/60 to-cyan-500/60" />
              <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                TCP Port 22 (SSH)
              </span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </div>

            {/* Internet Gateway Node */}
            <div
              onClick={() => setSelectedNode('ewb-igw-a')}
              className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                selectedNode === 'ewb-igw-a'
                  ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                  : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
              } ${
                simulatedPath.includes('laptop') ? 'ring-2 ring-cyan-400' : ''
              }`}
            >
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">ewb-igw-a</div>
                <div className="text-[11px] font-mono text-slate-400">Internet Gateway</div>
                <div className="text-[10px] text-cyan-400 font-mono">Attached strictly to VPC A</div>
              </div>
            </div>
          </div>

          {/* Dual VPC Architecture Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {/* VPC A Container */}
            <div
              onClick={() => setSelectedNode('ewb-vpc-a')}
              className={`rounded-2xl border-2 p-5 transition-all relative ${
                selectedNode === 'ewb-vpc-a'
                  ? 'border-blue-500 bg-blue-950/15'
                  : 'border-blue-500/30 bg-slate-900/40 hover:border-blue-500/50'
              }`}
            >
              {/* VPC A Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 font-bold">
                    VPC A (Requester)
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1">ewb-vpc-a</h3>
                </div>
                <span className="font-mono text-xs font-bold text-blue-400 bg-slate-950 px-2.5 py-1 rounded border border-blue-500/30">
                  10.10.0.0/16
                </span>
              </div>

              {/* Subnet 1: Public Subnet */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode('ewb-a-public');
                }}
                className={`mb-4 rounded-xl border p-4 transition-all cursor-pointer ${
                  selectedNode === 'ewb-a-public'
                    ? 'border-emerald-500 bg-emerald-950/20'
                    : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-bold text-white">ewb-a-public</span>
                    <span className="text-[10px] font-mono text-emerald-400">(Public Subnet)</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-300">10.10.1.0/24</span>
                </div>

                {/* Bastion Host Box */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode('ewb-bastion');
                  }}
                  className={`p-3 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                    selectedNode === 'ewb-bastion'
                      ? 'border-amber-500 bg-amber-500/15'
                      : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                  } ${
                    simulatedPath.includes('bastion') ? 'ring-2 ring-amber-400 animate-pulse' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded bg-slate-800 text-amber-400">
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">ewb-bastion</div>
                      <div className="text-[10px] font-mono text-slate-400">Private: 10.10.1.10</div>
                      <div className="text-[10px] font-mono text-cyan-400">
                        Public IPv4: {bastion?.actualPublicIp || 'Dynamic / User-entered'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                    Jump Box
                  </span>
                </div>
              </div>

              {/* Subnet 2: Private Subnet A */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode('ewb-a-private');
                }}
                className={`rounded-xl border p-4 transition-all cursor-pointer ${
                  selectedNode === 'ewb-a-private'
                    ? 'border-indigo-500 bg-indigo-950/20'
                    : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span className="font-bold text-white">ewb-a-private</span>
                    <span className="text-[10px] font-mono text-indigo-400">(Private Subnet)</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-300">10.10.2.0/24</span>
                </div>

                {/* App-A EC2 Box */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode('ewb-app-a');
                  }}
                  className={`p-3 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                    selectedNode === 'ewb-app-a'
                      ? 'border-indigo-500 bg-indigo-500/15'
                      : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                  } ${
                    simulatedPath === 'laptop-bastion-appa' || simulatedPath === 'appa-appb-peer'
                      ? 'ring-2 ring-indigo-400 animate-pulse'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded bg-slate-800 text-indigo-400">
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">ewb-app-a</div>
                      <div className="text-[10px] font-mono text-slate-400">Private: 10.10.2.10</div>
                      <div className="text-[10px] font-mono text-red-400 font-semibold">NO Public IP (Airgapped)</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded">
                    App Node A
                  </span>
                </div>
              </div>
            </div>

            {/* VPC B Container */}
            <div
              onClick={() => setSelectedNode('ewb-vpc-b')}
              className={`rounded-2xl border-2 p-5 transition-all relative ${
                selectedNode === 'ewb-vpc-b'
                  ? 'border-purple-500 bg-purple-950/15'
                  : 'border-purple-500/30 bg-slate-900/40 hover:border-purple-500/50'
              }`}
            >
              {/* VPC B Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30 font-bold">
                    VPC B (Accepter)
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1">ewb-vpc-b</h3>
                </div>
                <span className="font-mono text-xs font-bold text-purple-400 bg-slate-950 px-2.5 py-1 rounded border border-purple-500/30">
                  10.20.0.0/16
                </span>
              </div>

              {/* Subnet 1: Private Subnet B (Only Subnet in VPC B) */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode('ewb-b-private');
                }}
                className={`rounded-xl border p-4 transition-all cursor-pointer ${
                  selectedNode === 'ewb-b-private'
                    ? 'border-purple-500 bg-purple-950/20'
                    : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span className="font-bold text-white">ewb-b-private</span>
                    <span className="text-[10px] font-mono text-purple-400">(Private Subnet)</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-300">10.20.1.0/24</span>
                </div>

                {/* App-B EC2 Box */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode('ewb-app-b');
                  }}
                  className={`p-3 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                    selectedNode === 'ewb-app-b'
                      ? 'border-purple-500 bg-purple-500/15'
                      : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                  } ${
                    simulatedPath === 'laptop-bastion-appb' || simulatedPath === 'appa-appb-peer'
                      ? 'ring-2 ring-purple-400 animate-pulse'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded bg-slate-800 text-purple-400">
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">ewb-app-b</div>
                      <div className="text-[10px] font-mono text-slate-400">Private: 10.20.1.10</div>
                      <div className="text-[10px] font-mono text-red-400 font-semibold">NO Public IP (Airgapped)</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded">
                    App Node B
                  </span>
                </div>
              </div>

              {/* Crucial Architectural Warning Notice for VPC B */}
              <div className="mt-4 p-3 rounded-lg bg-red-950/20 border border-red-500/20 text-[11px] text-slate-400">
                <span className="text-red-400 font-bold block mb-1">VPC B Isolation Guarantee:</span>
                VPC B possesses <strong>NO Internet Gateway</strong>. App-B is 100% inaccessible from the public internet. Peering does NOT pass internet traffic to VPC B.
              </div>
            </div>
          </div>

          {/* VPC Peering Connection Bridge (Middle Anchor) */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col items-center">
            <div
              onClick={() => setSelectedNode('ewb-a-b-peer')}
              className={`p-4 rounded-xl border-2 flex items-center justify-between gap-4 max-w-xl w-full cursor-pointer transition-all ${
                selectedNode === 'ewb-a-b-peer'
                  ? 'border-emerald-500 bg-emerald-950/30 shadow-lg shadow-emerald-500/10'
                  : 'border-emerald-500/40 bg-slate-900/90 hover:border-emerald-500/70'
              } ${
                simulatedPath !== 'none' ? 'ring-2 ring-emerald-400' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Network className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>ewb-a-b-peer</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        peering.status === 'Active'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {peering.status}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    {peering.actualPcxId || 'pcx-087654321fedcba09'} (1:1 Private Peering)
                  </div>
                </div>
              </div>

              <div className="text-right text-[11px] font-mono text-slate-300">
                <div>10.10.0.0/16 ↔ 10.20.0.0/16</div>
                <div className="text-[10px] text-emerald-400 font-sans">AWS Private Backbone</div>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Inspector Drawer */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Resource Inspector
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {selectedNode || 'Overview'}
              </span>
            </div>

            {/* Dynamic Content based on selectedNode */}
            {selectedNode === 'ewb-a-b-peer' && (
              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-emerald-400 text-sm">VPC Peering Connection</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Direct Layer 3 point-to-point connection between ewb-vpc-a and ewb-vpc-b.
                  </p>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400">Requester VPC: </span>
                    <span className="text-white">ewb-vpc-a (10.10.0.0/16)</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Accepter VPC: </span>
                    <span className="text-white">ewb-vpc-b (10.20.0.0/16)</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Connection ID: </span>
                    <span className="text-amber-400">{peering.actualPcxId || 'pcx-xxxx (Pending)'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Status: </span>
                    <span className="text-emerald-400 font-bold">{peering.status}</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-300 space-y-1">
                  <p className="font-bold text-white">Three-Tier Requirement:</p>
                  <p>1. Peering connection in Active state.</p>
                  <p>2. Forward route in VPC A and return route in VPC B.</p>
                  <p>3. Destination Security Groups permitting ICMP/SSH traffic.</p>
                </div>
              </div>
            )}

            {selectedNode === 'ewb-bastion' && (
              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-amber-400 text-sm">ewb-bastion (Jump Host)</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Hardened bastion instance in ewb-a-public used to jump into private App nodes.
                  </p>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400">Private IP: </span>
                    <span className="text-white">10.10.1.10</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Public IP: </span>
                    <span className="text-cyan-400">{bastion?.actualPublicIp || 'Enter in inventory'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Security Group: </span>
                    <span className="text-amber-400">ewb-sg-bastion</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Key Pair: </span>
                    <span className="text-slate-300">ewb-lab</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-300">
                  Runs OpenSSH with ProxyJump support. Port 22 is strictly restricted to student IP /32.
                </p>
              </div>
            )}

            {selectedNode === 'ewb-app-a' && (
              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-indigo-400 text-sm">ewb-app-a (VPC A Private Node)</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Private application instance residing in ewb-a-private.
                  </p>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400">Private IP: </span>
                    <span className="text-white">10.10.2.10</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Public IP: </span>
                    <span className="text-emerald-400 font-bold">None (Disabled)</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Security Group: </span>
                    <span className="text-indigo-400">ewb-sg-app-a</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-300">
                  Allows SSH from Bastion (10.10.1.10/32) and ICMP Echo Request from App-B (10.20.1.10/32).
                </p>
              </div>
            )}

            {selectedNode === 'ewb-app-b' && (
              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-purple-400 text-sm">ewb-app-b (VPC B Private Node)</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Target private workload residing in isolated ewb-b-private.
                  </p>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400">Private IP: </span>
                    <span className="text-white">10.20.1.10</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Public IP: </span>
                    <span className="text-emerald-400 font-bold">None (Disabled)</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Security Group: </span>
                    <span className="text-purple-400">ewb-sg-app-b</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-300">
                  Target for forward ping test and controlled failure experiment.
                </p>
              </div>
            )}

            {selectedNode === 'ewb-igw-a' && (
              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-cyan-400 text-sm">ewb-igw-a (Internet Gateway)</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Provides horizontal scaling internet entry and exit point for VPC A public subnet.
                  </p>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400">Attached to: </span>
                    <span className="text-white">ewb-vpc-a (vpc-xxxx)</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Public Route: </span>
                    <span className="text-cyan-400">0.0.0.0/0 → ewb-igw-a</span>
                  </div>
                </div>
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded text-[11px]">
                  <strong>Non-Transitive Rule:</strong> VPC B cannot route out to the internet through this gateway via peering!
                </div>
              </div>
            )}

            {(!selectedNode || selectedNode === 'laptop' || selectedNode.includes('vpc') || selectedNode.includes('public') || selectedNode.includes('private')) && (
              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-white text-sm">VPC Peering Summary</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Click any specific resource icon to see port configurations and routing rules.
                  </p>
                </div>
                <div className="space-y-2 text-slate-300 text-[11px]">
                  <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                    <strong className="text-amber-400">Forward Path:</strong> App-A (10.10.2.10) → VPC A Router (matches 10.20.0.0/16 → pcx) → AWS Peering Fabric → App-B (10.20.1.10).
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                    <strong className="text-cyan-400">Return Path:</strong> App-B (10.20.1.10) → VPC B Router (matches 10.10.0.0/16 → pcx) → AWS Peering Fabric → App-A (10.10.2.10).
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => setActivePage('routes')}
              className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Route className="w-4 h-4 text-amber-400" />
              <span>Configure Route Tables</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
