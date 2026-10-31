import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { SecurityBanner } from '../common/SecurityBanner';
import {
  Wrench,
  Search,
  CheckCircle2,
  AlertCircle,
  GitBranch,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Check,
} from 'lucide-react';

export const TroubleshootingPage: React.FC = () => {
  const { troubleshooting, toggleTroubleshootingCheck } = useLab();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'matrix' | 'tree'>('matrix');
  const [treeStep, setTreeStep] = useState<number>(1);
  const [treeAnswers, setTreeAnswers] = useState<Record<string, boolean>>({});

  const filtered = troubleshooting.filter((item) => {
    return (
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.problem.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.symptoms.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SecurityBanner />

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              Stage 12 Diagnostics
            </span>
            <span className="text-xs font-mono text-slate-400">
              Root-Cause Isolation Matrix & Decision Tree
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            AWS VPC Peering Troubleshooting Companion
          </h1>
          <p className="text-xs text-slate-400">
            Systematically isolate issues across physical peering, route table forward/return paths, and stateful security group rules.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Issue Matrix (7 Scenarios)
          </button>
          <button
            onClick={() => setActiveTab('tree')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tree'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            Decision Tree
          </button>
        </div>
      </div>

      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search error messages e.g. 'timed out', 'permission denied', 'overlapping', 'no route'..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 shadow-sm"
            />
          </div>

          {/* Issue Cards */}
          <div className="space-y-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  </div>

                  {item.isResolved ? (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> All Checks Passed
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                      {item.checklist.filter((c) => c.checked).length} of {item.checklist.length} Verified
                    </span>
                  )}
                </div>

                <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-xl text-xs text-red-200">
                  <strong className="text-red-400 font-mono text-[10px] uppercase block mb-0.5">
                    Problem Symptom:
                  </strong>
                  {item.problem}
                </div>

                {/* Interactive Diagnostic Checklist */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-2">
                    Diagnostic Inspection Checklist
                  </h4>
                  <div className="space-y-2">
                    {item.checklist.map((chk) => (
                      <label
                        key={chk.id}
                        className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:bg-slate-950 cursor-pointer text-xs transition"
                      >
                        <input
                          type="checkbox"
                          checked={chk.checked}
                          onChange={() => toggleTroubleshootingCheck(item.id, chk.id)}
                          className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 mt-0.5 cursor-pointer"
                        />
                        <span className={chk.checked ? 'text-slate-400 line-through' : 'text-slate-200'}>
                          {chk.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Resolution Guide */}
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-emerald-400 font-mono text-[11px] block mb-1">
                    Workbook Resolution Guide:
                  </strong>
                  {item.resolutionGuide}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Troubleshooting Decision Tree */}
      {activeTab === 'tree' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <GitBranch className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white">Interactive Network Diagnostic Tree</h2>
              <p className="text-xs text-slate-400">
                Answer diagnostic prompts sequentially to pinpoint your networking misconfiguration.
              </p>
            </div>
          </div>

          <div className="max-w-xl mx-auto space-y-6 py-4">
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-4">
              <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold">
                Diagnostic Step {treeStep}
              </span>

              {treeStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-white">
                    Can you connect to ewb-bastion via SSH from your laptop?
                  </h3>
                  <p className="text-xs text-slate-400">
                    Run: <code>ssh ec2-user@BASTION_PUBLIC_IP</code>
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => setTreeStep(2)}
                      className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                    >
                      Yes, Bastion SSH Works
                    </button>
                    <button
                      onClick={() => setTreeStep(10)}
                      className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer"
                    >
                      No, Bastion SSH Times Out
                    </button>
                  </div>
                </div>
              )}

              {treeStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-white">
                    Is the VPC Peering connection status "Active" in both VPCs?
                  </h3>
                  <p className="text-xs text-slate-400">
                    Check AWS VPC Console → Peering Connections → ewb-a-b-peer
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => setTreeStep(3)}
                      className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                    >
                      Yes, Status is Active
                    </button>
                    <button
                      onClick={() => setTreeStep(20)}
                      className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer"
                    >
                      No, Pending or Failed
                    </button>
                  </div>
                </div>
              )}

              {treeStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-white">
                    Does ewb-rt-b-private contain the RETURN route (10.10.0.0/16 → pcx)?
                  </h3>
                  <p className="text-xs text-slate-400">
                    VPC B route table must have explicit return destination for VPC A traffic.
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => setTreeStep(4)}
                      className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                    >
                      Yes, Return Route Present
                    </button>
                    <button
                      onClick={() => setTreeStep(30)}
                      className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer"
                    >
                      No, Missing in VPC B Table
                    </button>
                  </div>
                </div>
              )}

              {treeStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-white">
                    Does ewb-sg-app-b allow ICMP Echo Request from 10.10.2.10/32?
                  </h3>
                  <p className="text-xs text-slate-400">
                    Security Group inbound rules filter ICMP independently of TCP.
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => setTreeStep(5)}
                      className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                    >
                      Yes, ICMP Rule Present
                    </button>
                    <button
                      onClick={() => setTreeStep(40)}
                      className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer"
                    >
                      No, Missing ICMP Rule
                    </button>
                  </div>
                </div>
              )}

              {treeStep === 5 && (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Network Path is Healthy!</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    All key dependencies (Bastion IGW route, Active Peering, Forward/Return routes, and ICMP Security Group rules) are verified. Pings between 10.10.2.10 and 10.20.1.10 should succeed with 0% packet loss.
                  </p>
                  <button
                    onClick={() => setTreeStep(1)}
                    className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold cursor-pointer mt-2"
                  >
                    Restart Diagnosis
                  </button>
                </div>
              )}

              {/* Failure Branches */}
              {treeStep === 10 && (
                <div className="space-y-3 text-left p-4 bg-red-950/20 border border-red-500/40 rounded-xl">
                  <h4 className="text-xs font-bold text-red-400">Root Cause Identified: Bastion Unreachable</h4>
                  <p className="text-xs text-slate-300">
                    1. Check <code>ewb-sg-bastion</code>: Inbound rule must allow port 22 from your current public IP /32. (Your home IP may have changed).<br />
                    2. Check <code>ewb-rt-a-public</code>: Must have <code>0.0.0.0/0 → ewb-igw-a</code>.<br />
                    3. Check IGW: Must be in "attached" state to <code>ewb-vpc-a</code>.
                  </p>
                  <button
                    onClick={() => setTreeStep(1)}
                    className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold cursor-pointer"
                  >
                    Back to Step 1
                  </button>
                </div>
              )}

              {treeStep === 20 && (
                <div className="space-y-3 text-left p-4 bg-amber-950/20 border border-amber-500/40 rounded-xl">
                  <h4 className="text-xs font-bold text-amber-400">Root Cause Identified: Peering Inactive</h4>
                  <p className="text-xs text-slate-300">
                    If status is <em>Pending acceptance</em>, select <code>ewb-a-b-peer</code> in the AWS console, click <strong>Actions → Accept Request</strong>.
                  </p>
                  <button
                    onClick={() => setTreeStep(1)}
                    className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold cursor-pointer"
                  >
                    Back to Step 1
                  </button>
                </div>
              )}

              {treeStep === 30 && (
                <div className="space-y-3 text-left p-4 bg-red-950/20 border border-red-500/40 rounded-xl">
                  <h4 className="text-xs font-bold text-red-400">Root Cause: Asymmetric Route Dropping Reply Packets</h4>
                  <p className="text-xs text-slate-300">
                    Packets from App-A reach App-B, but App-B has no route to return reply packets! Open <code>ewb-rt-b-private</code> and add: <code>10.10.0.0/16 → pcx-xxxx</code>.
                  </p>
                  <button
                    onClick={() => setTreeStep(1)}
                    className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold cursor-pointer"
                  >
                    Back to Step 1
                  </button>
                </div>
              )}

              {treeStep === 40 && (
                <div className="space-y-3 text-left p-4 bg-red-950/20 border border-red-500/40 rounded-xl">
                  <h4 className="text-xs font-bold text-red-400">Root Cause: Security Group Blocking ICMP</h4>
                  <p className="text-xs text-slate-300">
                    SSH port 22 does not allow ping! Open <code>ewb-sg-app-b</code> and add an inbound rule: <strong>Custom ICMP Rule - IPv4 Echo Request (Type 8, Code 0)</strong> with source <code>10.10.2.10/32</code>.
                  </p>
                  <button
                    onClick={() => setTreeStep(1)}
                    className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold cursor-pointer"
                  >
                    Back to Step 1
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
