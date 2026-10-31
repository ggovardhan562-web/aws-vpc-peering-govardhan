import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { SecurityBanner } from '../common/SecurityBanner';
import {
  Terminal,
  Copy,
  Check,
  Shield,
  Key,
  ExternalLink,
  Laptop,
  Server,
  ArrowRight,
  Info,
} from 'lucide-react';

export const SSHConfigPage: React.FC = () => {
  const { ec2Instances, updateEC2Instance } = useLab();
  const bastion = ec2Instances.find((i) => i.id === 'ec2-bastion');
  const bastionIp = bastion?.actualPublicIp && bastion.actualPublicIp !== 'Enter Bastion Public IP'
    ? bastion.actualPublicIp
    : 'YOUR_BASTION_PUBLIC_IP';

  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const sshConfigText = `Host ewb-bastion
    HostName ${bastionIp}
    User ec2-user
    IdentityFile ~/.ssh/ewb-lab.pem
    IdentitiesOnly yes

Host ewb-app-a
    HostName 10.10.2.10
    User ec2-user
    IdentityFile ~/.ssh/ewb-lab.pem
    IdentitiesOnly yes
    ProxyJump ewb-bastion

Host ewb-app-b
    HostName 10.20.1.10
    User ec2-user
    IdentityFile ~/.ssh/ewb-lab.pem
    IdentitiesOnly yes
    ProxyJump ewb-bastion`;

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SecurityBanner />

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              Stage 6 Administration
            </span>
            <span className="text-xs font-mono text-slate-400">
              OpenSSH ProxyJump Tunneling
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            SSH Jump Host & Client Configuration Generator
          </h1>
          <p className="text-xs text-slate-400">
            Copy the pre-rendered configuration below into your laptop’s <code>~/.ssh/config</code> file for one-command private connectivity.
          </p>
        </div>

        {/* Quick Bastion IP input */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 block text-[10px] uppercase font-mono">Bastion Public IP:</span>
          <input
            type="text"
            value={bastion?.actualPublicIp || ''}
            onChange={(e) => updateEC2Instance('ec2-bastion', { actualPublicIp: e.target.value })}
            placeholder="e.g. 13.235.112.84"
            className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-amber-400 font-mono mt-1 w-44 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Why Private Key Stays on Laptop Notice */}
      <div className="bg-blue-950/20 border-l-4 border-l-blue-500 border border-blue-500/30 rounded-xl p-4 text-xs text-slate-300">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-blue-400 text-xs uppercase tracking-wider font-mono">
              Zero Key Exposure: Your Private Key (.pem) Never Leaves Your Laptop
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              With SSH ProxyJump, your laptop’s SSH client establishes an encrypted TCP tunnel through <code>ewb-bastion</code>, but authentication is negotiated directly between your laptop and the private instance (App-A or App-B). <strong>You must never copy or upload ewb-lab.pem to the cloud bastion host!</strong>
            </p>
          </div>
        </div>
      </div>

      {/* SSH Config Code Snippet Box */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-slate-900 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono font-bold text-slate-200">
              ~/.ssh/config (macOS / Linux / Windows WSL / PowerShell)
            </span>
          </div>

          <button
            onClick={() => copyText(sshConfigText, 'config')}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            {copiedSection === 'config' ? (
              <>
                <Check className="w-3.5 h-3.5 text-slate-950" />
                <span>Copied Config!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy SSH Config</span>
              </>
            )}
          </button>
        </div>

        <div className="p-5 font-mono text-xs text-amber-300 leading-relaxed overflow-x-auto">
          <pre>{sshConfigText}</pre>
        </div>
      </div>

      {/* Step by Step Execution on Laptop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Permissions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 font-mono text-xs font-bold flex items-center justify-center">
              1
            </span>
            <span className="text-[10px] font-mono text-slate-400">Permission Check</span>
          </div>
          <h3 className="text-xs font-bold text-white">Secure Local Key File</h3>
          <p className="text-[11px] text-slate-400">
            OpenSSH requires private keys to be protected from other users on your local machine.
          </p>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-200">
            <span>chmod 400 ~/.ssh/ewb-lab.pem</span>
            <button
              onClick={() => copyText('chmod 400 ~/.ssh/ewb-lab.pem', 'chmod')}
              className="text-slate-400 hover:text-amber-400 cursor-pointer p-1"
            >
              {copiedSection === 'chmod' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Step 2: Bastion Test */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center">
              2
            </span>
            <span className="text-[10px] font-mono text-slate-400">First Leg</span>
          </div>
          <h3 className="text-xs font-bold text-white">Connect to Bastion</h3>
          <p className="text-[11px] text-slate-400">
            Verifies Internet Gateway route and student IP /32 rule in <code>ewb-sg-bastion</code>.
          </p>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-200">
            <span>ssh ewb-bastion</span>
            <button
              onClick={() => copyText('ssh ewb-bastion', 'bastion')}
              className="text-slate-400 hover:text-amber-400 cursor-pointer p-1"
            >
              {copiedSection === 'bastion' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Step 3: Peered Private SSH */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-400 font-mono text-xs font-bold flex items-center justify-center">
              3
            </span>
            <span className="text-[10px] font-mono text-slate-400">Peered Leg</span>
          </div>
          <h3 className="text-xs font-bold text-white">Connect to App-B (Peered)</h3>
          <p className="text-[11px] text-slate-400">
            Executes ProxyJump across VPC Peering directly into 10.20.1.10.
          </p>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-200">
            <span>ssh ewb-app-b</span>
            <button
              onClick={() => copyText('ssh ewb-app-b', 'appb')}
              className="text-slate-400 hover:text-amber-400 cursor-pointer p-1"
            >
              {copiedSection === 'appb' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
