import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { SecurityBanner } from '../common/SecurityBanner';
import {
  Layers,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Info,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

// Helper for CIDR overlap calculation
function ipToInt(ip: string): number {
  return ip
    .split('.')
    .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function parseCidr(cidr: string): { start: number; end: number; mask: number; valid: boolean } {
  try {
    const [ip, maskStr] = cidr.trim().split('/');
    const mask = parseInt(maskStr, 10);
    if (!ip || isNaN(mask) || mask < 0 || mask > 32) return { start: 0, end: 0, mask: 0, valid: false };

    const ipInt = ipToInt(ip);
    const bitMask = mask === 0 ? 0 : (~0 << (32 - mask)) >>> 0;
    const netStart = (ipInt & bitMask) >>> 0;
    const netEnd = (netStart | ~bitMask) >>> 0;

    return { start: netStart, end: netEnd, mask, valid: true };
  } catch {
    return { start: 0, end: 0, mask: 0, valid: false };
  }
}

function checkCidrOverlap(cidrA: string, cidrB: string): { overlap: boolean; reason: string } {
  const a = parseCidr(cidrA);
  const b = parseCidr(cidrB);

  if (!a.valid || !b.valid) {
    return { overlap: false, reason: 'Please enter valid IPv4 CIDR notations (e.g. 10.10.0.0/16).' };
  }

  // Check if intervals [a.start, a.end] and [b.start, b.end] intersect
  const overlap = Math.max(a.start, b.start) <= Math.min(a.end, b.end);

  if (overlap) {
    return {
      overlap: true,
      reason: `CIDR collision detected! ${cidrA} and ${cidrB} overlap in address space. AWS VPC Peering will fail.`,
    };
  }

  return {
    overlap: false,
    reason: `Clean non-overlapping blocks! ${cidrA} and ${cidrB} are distinct. Perfect for AWS VPC Peering.`,
  };
}

export const NetworkSetupPage: React.FC = () => {
  const { resources, updateResource, setActivePage } = useLab();

  // Active sub-stage
  const [activeStage, setActiveStage] = useState<'stage-1' | 'stage-2' | 'stage-3'>('stage-1');

  // CIDR Calculator state
  const [calcCidrA, setCalcCidrA] = useState('10.10.0.0/16');
  const [calcCidrB, setCalcCidrB] = useState('10.20.0.0/16');
  const overlapResult = checkCidrOverlap(calcCidrA, calcCidrB);

  // Copied alert
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Checkpoint trackers for Stage 2 & 3
  const [vpcAChecks, setVpcAChecks] = useState<Record<string, boolean>>({
    'vpca-1': true,
    'vpca-2': true,
    'vpca-3': true,
    'vpca-4': true,
    'vpca-5': true,
    'vpca-6': true,
    'vpca-7': true,
  });

  const [vpcBChecks, setVpcBChecks] = useState<Record<string, boolean>>({
    'vpcb-1': true,
    'vpcb-2': true,
    'vpcb-3': true,
    'vpcb-4': true,
    'vpcb-5': true,
  });

  const toggleVpcACheck = (key: string) => {
    setVpcAChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleVpcBCheck = (key: string) => {
    setVpcBChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SecurityBanner />

      {/* Stage Selector Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveStage('stage-1')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeStage === 'stage-1'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4" />
          Stage 1: Planning & CIDR Overlap Tool
        </button>
        <button
          onClick={() => setActiveStage('stage-2')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeStage === 'stage-2'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4 text-blue-400" />
          Stage 2: Create VPC A (10.10.0.0/16)
        </button>
        <button
          onClick={() => setActiveStage('stage-3')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeStage === 'stage-3'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4 text-purple-400" />
          Stage 3: Create VPC B (10.20.0.0/16)
        </button>
      </div>

      {/* Stage 1: Planning & CIDR Calculator */}
      {activeStage === 'stage-1' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Interactive CIDR Overlap Calculator */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-amber-400" />
                  <h2 className="text-base font-bold text-white">Interactive CIDR Overlap Calculator</h2>
                </div>
                <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                  Live RFC 1918 Validator
                </span>
              </div>

              <p className="text-xs text-slate-300 mb-5 leading-relaxed">
                AWS VPC Peering does not allow peering connections between VPCs with matching or overlapping IPv4 CIDR blocks. Test any two CIDR blocks below to verify if they can be peered.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>VPC A CIDR Block:</span>
                    <span className="text-[11px] font-mono text-blue-400">10.10.0.0/16</span>
                  </label>
                  <input
                    type="text"
                    value={calcCidrA}
                    onChange={(e) => setCalcCidrA(e.target.value)}
                    placeholder="e.g. 10.10.0.0/16"
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                  <div className="text-[11px] text-slate-400">
                    65,536 IPs (10.10.0.0 - 10.10.255.255)
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>VPC B CIDR Block:</span>
                    <span className="text-[11px] font-mono text-purple-400">10.20.0.0/16</span>
                  </label>
                  <input
                    type="text"
                    value={calcCidrB}
                    onChange={(e) => setCalcCidrB(e.target.value)}
                    placeholder="e.g. 10.20.0.0/16"
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                  <div className="text-[11px] text-slate-400">
                    65,536 IPs (10.20.0.0 - 10.20.255.255)
                  </div>
                </div>
              </div>

              {/* Overlap Result Box */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                  overlapResult.overlap
                    ? 'bg-red-950/30 border-red-500/50 text-red-200'
                    : 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                }`}
              >
                {overlapResult.overlap ? (
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="text-xs font-bold font-mono">
                    {overlapResult.overlap ? 'VALIDATION STATUS: OVERLAPPING (INVALID)' : 'VALIDATION STATUS: CLEAN (VALID PEERING)'}
                  </div>
                  <p className="text-xs leading-relaxed">{overlapResult.reason}</p>
                </div>
              </div>
            </div>

            {/* Why Overlapping CIDRs Fail Deep Dive */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400" />
                Why AWS Strictly Prohibits Overlapping CIDRs in VPC Peering
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Network routers operate on the <strong>Longest Prefix Match (LPM)</strong> algorithm. In an AWS VPC, local traffic is matched by the default <code>local</code> route target. If VPC A (10.10.0.0/16) and VPC B (10.10.0.0/16) both contained the address <code>10.10.1.10</code>:
              </p>
              <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside bg-slate-950 p-4 rounded-lg border border-slate-800">
                <li>
                  A packet destined for 10.10.1.10 could never leave VPC A because the router would match the local rule first and deliver it to the local VPC A host.
                </li>
                <li>
                  AWS VPC routers have no mechanism to differentiate between overlapping IP addresses across a standard VPC peering connection without Network Address Translation (NAT).
                </li>
                <li>
                  Therefore, Amazon VPC API rejects peering requests if any existing primary or secondary CIDR block overlaps.
                </li>
              </ul>
            </div>
          </div>

          {/* Right Architecture Planning Table */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono text-slate-400 mb-3">
                Subnet Allocation Plan
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="flex justify-between font-bold text-blue-400 font-mono">
                    <span>ewb-a-public</span>
                    <span>10.10.1.0/24</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Hosts <code>ewb-bastion</code> (10.10.1.10). Route table has <code>0.0.0.0/0 → ewb-igw-a</code>.
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="flex justify-between font-bold text-indigo-400 font-mono">
                    <span>ewb-a-private</span>
                    <span>10.10.2.0/24</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Hosts <code>ewb-app-a</code> (10.10.2.10). Isolated from public internet.
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="flex justify-between font-bold text-purple-400 font-mono">
                    <span>ewb-b-private</span>
                    <span>10.20.1.0/24</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Hosts <code>ewb-app-b</code> (10.20.1.10). In VPC B. Zero internet gateway.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-5 text-xs text-amber-200">
              <h4 className="font-bold flex items-center gap-1.5 text-amber-300 mb-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Cost & Free Tier Note
              </h4>
              <p className="leading-relaxed text-[11px]">
                VPCs, subnets, route tables, and security groups are 100% free of charge in AWS. VPC peering within the same Availability Zone is free; across AZs, intra-region data transfer is billed at $0.01/GB. Running three t3.micro EC2 instances costs ~$0.0104/hour each if outside AWS Free Tier.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stage 2: Create VPC A Guide */}
      {activeStage === 'stage-2' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-bold">
                Stage 2 Workflow
              </span>
              <h2 className="text-base font-bold text-white mt-1">
                Creating ewb-vpc-a (10.10.0.0/16) and Subnets
              </h2>
            </div>
            <button
              onClick={() => setActivePage('inventory')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Record VPC A ID in Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {[
              {
                id: 'vpca-1',
                step: 'Step 1: Create VPC A',
                desc: 'In AWS VPC Console -> Create VPC -> Select "VPC only". Name tag: ewb-vpc-a. IPv4 CIDR: 10.10.0.0/16. Tenancy: Default.',
                cmd: 'aws ec2 create-vpc --cidr-block 10.10.0.0/16 --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=ewb-vpc-a}]"',
              },
              {
                id: 'vpca-2',
                step: 'Step 2: Create Public Subnet (ewb-a-public)',
                desc: 'VPC -> Subnets -> Create Subnet. Select ewb-vpc-a. Subnet name: ewb-a-public. Availability Zone: e.g. ap-south-1a. IPv4 subnet CIDR block: 10.10.1.0/24.',
                cmd: 'aws ec2 create-subnet --vpc-id VPC_A_ID --cidr-block 10.10.1.0/24 --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=ewb-a-public}]"',
              },
              {
                id: 'vpca-3',
                step: 'Step 3: Create Private Subnet (ewb-a-private)',
                desc: 'Create Subnet. Select ewb-vpc-a. Subnet name: ewb-a-private. Availability Zone: same as public (ap-south-1a). IPv4 subnet CIDR: 10.10.2.0/24.',
                cmd: 'aws ec2 create-subnet --vpc-id VPC_A_ID --cidr-block 10.10.2.0/24 --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=ewb-a-private}]"',
              },
              {
                id: 'vpca-4',
                step: 'Step 4: Create & Attach Internet Gateway (ewb-igw-a)',
                desc: 'VPC -> Internet Gateways -> Create internet gateway. Name: ewb-igw-a. Once created, select Actions -> Attach to VPC -> select ewb-vpc-a.',
                cmd: 'aws ec2 create-internet-gateway --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=ewb-igw-a}]"',
              },
              {
                id: 'vpca-5',
                step: 'Step 5: Create Public Route Table (ewb-rt-a-public)',
                desc: 'VPC -> Route Tables -> Create route table. Name: ewb-rt-a-public. VPC: ewb-vpc-a. Edit routes -> Add route: Destination 0.0.0.0/0 -> Target: Internet Gateway (ewb-igw-a). Associate subnet ewb-a-public.',
                cmd: 'aws ec2 create-route --route-table-id RTB_A_PUB_ID --destination-cidr-block 0.0.0.0/0 --gateway-id IGW_A_ID',
              },
              {
                id: 'vpca-6',
                step: 'Step 6: Create Private Route Table (ewb-rt-a-private)',
                desc: 'VPC -> Route Tables -> Create route table. Name: ewb-rt-a-private. VPC: ewb-vpc-a. Associate subnet ewb-a-private. Do NOT add 0.0.0.0/0!',
                cmd: '# Keep default 10.10.0.0/16 -> local only. Peering route will be added in Stage 9.',
              },
            ].map((st) => (
              <div
                key={st.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={vpcAChecks[st.id]}
                      onChange={() => toggleVpcACheck(st.id)}
                      className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                    />
                    <h3 className="text-xs font-bold text-white">{st.step}</h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-300">
                    {vpcAChecks[st.id] ? 'Verified' : 'Pending'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 pl-6 leading-relaxed">{st.desc}</p>

                <div className="pl-6 pt-1 flex items-center justify-between bg-slate-900/80 p-2 rounded border border-slate-800 text-[11px] font-mono text-slate-300">
                  <span className="truncate">{st.cmd}</span>
                  <button
                    onClick={() => copyToClipboard(st.cmd)}
                    className="p-1 text-slate-400 hover:text-amber-400 cursor-pointer shrink-0 ml-2"
                    title="Copy AWS CLI command reference"
                  >
                    {copiedText === st.cmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage 3: Create VPC B Guide */}
      {activeStage === 'stage-3' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-bold">
                Stage 3 Workflow
              </span>
              <h2 className="text-base font-bold text-white mt-1">
                Creating ewb-vpc-b (10.20.0.0/16) and Private Subnet
              </h2>
            </div>
            <button
              onClick={() => setActivePage('inventory')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Record VPC B ID in Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {[
              {
                id: 'vpcb-1',
                step: 'Step 1: Create VPC B',
                desc: 'VPC -> Create VPC -> "VPC only". Name: ewb-vpc-b. IPv4 CIDR: 10.20.0.0/16. Region: ap-south-1.',
                cmd: 'aws ec2 create-vpc --cidr-block 10.20.0.0/16 --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=ewb-vpc-b}]"',
              },
              {
                id: 'vpcb-2',
                step: 'Step 2: Create Private Subnet (ewb-b-private)',
                desc: 'Create Subnet. Select ewb-vpc-b. Name: ewb-b-private. CIDR: 10.20.1.0/24. Confirm "Auto-assign public IPv4" is DISABLED.',
                cmd: 'aws ec2 create-subnet --vpc-id VPC_B_ID --cidr-block 10.20.1.0/24 --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=ewb-b-private}]"',
              },
              {
                id: 'vpcb-3',
                step: 'Step 3: Create Private Route Table (ewb-rt-b-private)',
                desc: 'Create route table: ewb-rt-b-private. Associate with ewb-b-private. Only contains 10.20.0.0/16 -> local. NO IGW route.',
                cmd: '# Only local route initially. Peering return route 10.10.0.0/16 will be added in Stage 9.',
              },
              {
                id: 'vpcb-4',
                step: 'Step 4: Confirm Zero IGW Attached',
                desc: 'Verify that NO internet gateway is created or attached to ewb-vpc-b. VPC B must remain completely airgapped from the public internet.',
                cmd: '# Architecture requirement: VPC B possesses zero internet gateways.',
              },
            ].map((st) => (
              <div
                key={st.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={vpcBChecks[st.id]}
                      onChange={() => toggleVpcBCheck(st.id)}
                      className="rounded border-slate-700 text-purple-500 focus:ring-purple-500 cursor-pointer"
                    />
                    <h3 className="text-xs font-bold text-white">{st.step}</h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-300">
                    {vpcBChecks[st.id] ? 'Verified' : 'Pending'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 pl-6 leading-relaxed">{st.desc}</p>

                <div className="pl-6 pt-1 flex items-center justify-between bg-slate-900/80 p-2 rounded border border-slate-800 text-[11px] font-mono text-slate-300">
                  <span className="truncate">{st.cmd}</span>
                  <button
                    onClick={() => copyToClipboard(st.cmd)}
                    className="p-1 text-slate-400 hover:text-amber-400 cursor-pointer shrink-0 ml-2"
                    title="Copy command"
                  >
                    {copiedText === st.cmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
