import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { SecurityBanner } from '../common/SecurityBanner';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Database,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    profile,
    exportBackupJson,
    importBackupJson,
    resetToDefaults,
    loadSampleData,
    progressPercentage,
    evidenceCount,
  } = useLab();

  const [resetConfirm, setResetConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleExport = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CloudPeer_VPC_Peering_Backup_${profile.studentName.replace(/\s+/g, '_') || 'Student'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setSuccessMsg('Project state exported successfully!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importBackupJson(content);
      if (success) {
        setSuccessMsg('Project state restored successfully!');
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        alert('Failed to parse backup JSON. Please check file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SecurityBanner />

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">
              Local Persistence & Portability
            </span>
            <span className="text-xs font-mono text-slate-400">
              Offline First / Zero Cloud Lock-In
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Lab Persistence, Backup & Reset Center
          </h1>
          <p className="text-xs text-slate-400">
            Export your entire workbook progress, test outputs, and evidence artifacts as a portable JSON file or restore from a previous session.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Storage & Backup Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Backup Export */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 w-fit">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Export Project Backup</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Downloads a complete JSON representation of your profile, 17 resources, route tables, tests, screenshots, and cleanup checks.
            </p>
          </div>

          <button
            onClick={handleExport}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Backup (.json)</span>
          </button>
        </div>

        {/* Restore Import */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 w-fit">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Restore from Backup</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Resume your project on any device or browser by uploading a previously exported <code>.json</code> backup file.
            </p>
          </div>

          <label className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Select Backup File</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>

        {/* Sample Demo Data Loader */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 w-fit">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Load 100% Completed Project</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instantly fills in realistic AWS resource IDs, sample terminal ping logs, mock console screenshots, and 100/100 marks for showcase.
            </p>
          </div>

          <button
            onClick={loadSampleData}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Autofill Sample Project</span>
          </button>
        </div>
      </div>

      {/* Danger Zone: Reset Lab */}
      <div className="bg-red-950/20 border border-red-500/30 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-white">Danger Zone: Reset Entire Lab</h3>
            <p className="text-xs text-slate-400">
              Clear all student progress, recorded IDs, test executions, and evidence artifacts, restoring the workbook to factory defaults.
            </p>
          </div>
        </div>

        {resetConfirm ? (
          <div className="p-4 bg-slate-950 rounded-xl border border-red-500/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-red-300 font-semibold">
              Are you sure? This action cannot be undone unless you exported a backup!
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setResetConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetToDefaults();
                  setResetConfirm(false);
                  setSuccessMsg('Lab has been reset to defaults.');
                  setTimeout(() => setSuccessMsg(null), 3000);
                }}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
              >
                Yes, Clear All Data
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setResetConfirm(true)}
            className="px-4 py-2 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-300 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Lab to Fresh Defaults</span>
          </button>
        )}
      </div>
    </div>
  );
};
