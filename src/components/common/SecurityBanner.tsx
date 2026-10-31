import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export const SecurityBanner: React.FC<{ condensed?: boolean }> = ({ condensed = false }) => {
  if (condensed) {
    return (
      <div className="bg-amber-950/40 border border-amber-600/40 rounded-lg px-3 py-2 text-xs flex items-center justify-between text-amber-200">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span><strong>Zero-Credential Policy:</strong> Never input AWS passwords, secret access keys, or private SSH keys.</span>
        </div>
        <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-300 font-mono">STRICT AIRGAP</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border-l-4 border-l-amber-500 border border-amber-500/30 rounded-xl p-4 shadow-lg mb-6">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-amber-300">AWS Security & Privacy Boundary Notice</h4>
            <span className="text-[10px] uppercase tracking-wider bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono px-2 py-0.5 rounded-full font-bold">
              Safe Educational Environment
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            This platform acts as an educational project workbook and local verification companion. You create actual resources manually in the <strong>AWS Management Console</strong> and record resource IDs, routes, and test outputs here.
            <strong> Under no circumstances will this application ask for or store AWS passwords, IAM secret access keys, or private SSH key files (.pem).</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
