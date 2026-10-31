import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import {
  Globe,
  User,
  Sparkles,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  Menu,
  X,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface HeaderProps {
  onMobileMenuToggle: () => void;
  mobileMenuOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle, mobileMenuOpen }) => {
  const {
    profile,
    updateProfile,
    progressPercentage,
    totalScore,
    loadSampleData,
    resetToDefaults,
    setActivePage,
    exportBackupJson,
    importBackupJson,
  } = useLab();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importBackupJson(content);
      if (success) {
        setImportNotice('Lab data successfully imported!');
        setTimeout(() => setImportNotice(null), 3500);
      } else {
        alert('Invalid backup file. Please provide a valid JSON export.');
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CloudPeer_VPC_Peering_Backup_${profile.studentName.replace(/\s+/g, '_') || 'Student'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Branding title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-black text-slate-950 text-sm shadow-md shadow-orange-500/20">
              AWS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">
                  CloudPeer: AWS VPC Peering Lab
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Workbook v3.2
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden md:block">
                Learn. Elevate. Empower. – Private Network Connectivity
              </p>
            </div>
          </div>
        </div>

        {/* Center: Quick Progress Badge */}
        <div className="hidden xl:flex items-center gap-4 bg-slate-950/60 border border-slate-800/80 px-4 py-1.5 rounded-full">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Progress:</span>
            <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="font-mono font-bold text-amber-400">{progressPercentage}%</span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Grade:</span>
            <span className="font-mono font-bold text-emerald-400">{totalScore}/100</span>
          </div>
        </div>

        {/* Right: Region, Demo loader, Profile shortcut */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Region selector */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-800/70 border border-slate-700/60 px-2.5 py-1.5 rounded-lg text-xs text-slate-300">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={profile.awsRegion}
              onChange={(e) => updateProfile({ awsRegion: e.target.value })}
              className="bg-transparent text-slate-200 text-xs font-mono focus:outline-none cursor-pointer"
            >
              <option value="ap-south-1" className="bg-slate-900 text-white">ap-south-1 (Mumbai)</option>
              <option value="us-east-1" className="bg-slate-900 text-white">us-east-1 (N. Virginia)</option>
              <option value="us-west-2" className="bg-slate-900 text-white">us-west-2 (Oregon)</option>
              <option value="eu-west-1" className="bg-slate-900 text-white">eu-west-1 (Ireland)</option>
            </select>
          </div>

          {/* Quick Demo button */}
          <button
            onClick={loadSampleData}
            title="Populate complete demo project with sample configurations, tests, and evidence"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 transition-all shadow-sm shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Load Sample Data</span>
            <span className="sm:hidden">Sample</span>
          </button>

          {/* Reset button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            title="Reset lab to fresh workbook defaults"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Backup menu button */}
          <button
            onClick={handleDownloadBackup}
            title="Export full project backup JSON"
            className="hidden lg:flex items-center gap-1 p-1.5 px-2.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup</span>
          </button>

          {/* Import file label button */}
          <label
            title="Import project JSON backup"
            className="hidden lg:flex items-center gap-1 p-1.5 px-2.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Restore</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          {/* Student Profile Quick View */}
          <button
            onClick={() => setActivePage('overview')}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs transition cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-amber-400 font-semibold text-[10px]">
              {profile.studentName ? profile.studentName.charAt(0).toUpperCase() : <User className="w-3 h-3" />}
            </div>
            <div className="text-left hidden md:block">
              <div className="font-semibold text-slate-200 truncate max-w-[110px]">
                {profile.studentName || 'Guest Student'}
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[110px]">
                {profile.batch || 'Batch 2026'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {importNotice && (
        <div className="bg-emerald-900/90 border-b border-emerald-500 text-emerald-200 text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{importNotice}</span>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl text-slate-100">
            <div className="flex items-center gap-3 text-amber-400 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <h3 className="text-lg font-bold">Reset Project to Workbook Defaults?</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              This will clear all student-entered AWS resource IDs, test outputs, and evidence screenshots, resetting the lab workbook to its fresh starting state.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetToDefaults();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
