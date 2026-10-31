import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { SecurityBanner } from '../common/SecurityBanner';
import {
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Camera,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Upload,
} from 'lucide-react';

export const CleanupPage: React.FC = () => {
  const { cleanupSteps, toggleCleanupStep, evidence, addEvidence, setActivePage } = useLab();
  const [showProofUpload, setShowProofUpload] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofDataUrl, setProofDataUrl] = useState<string | null>(null);

  const completedCount = cleanupSteps.filter((s) => s.isCompleted).length;
  const isAllComplete = completedCount === cleanupSteps.length;

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setProofDataUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofDataUrl) return;

    addEvidence({
      title: 'AWS Resource Teardown & Billing Zero-Cost Verification',
      description: 'AWS Management Console verification showing 0 running instances, 0 unattached volumes, and deleted lab VPCs.',
      category: 'Cleanup',
      stageId: 'Stage 15',
      dataUrl: proofDataUrl,
      fileName: proofFile?.name || 'cleanup_verification.png',
      fileSize: proofFile ? `${Math.round(proofFile.size / 1024)} KB` : '310 KB',
    });

    setShowProofUpload(false);
    setProofFile(null);
    setProofDataUrl(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SecurityBanner />

      {/* Prominent Warning Banner */}
      <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-red-950/60 border-l-4 border-l-red-500 border border-red-500/40 rounded-2xl p-6 shadow-2xl space-y-2">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
          <h2 className="text-base font-extrabold text-red-300 tracking-tight uppercase font-mono">
            Critical Cost Warning: Cloud Resources Incur Hourly Charges
          </h2>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed">
          Running EC2 instances, provisioned EBS disk storage, and unattached Elastic IPs accumulate continuous AWS charges.
          <strong> Do not proceed with cleanup until all project screenshots and connectivity logs have been saved!</strong>
          Once evidence is safely saved, complete the 13 teardown steps in the exact sequence outlined below.
        </p>
      </div>

      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 font-bold">
              Stage 15 Infrastructure Teardown
            </span>
            <span className="text-xs font-mono text-slate-400">
              13-Step Disciplined Decommissioning
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            AWS Account Resource Teardown Checklist
          </h1>
          <p className="text-xs text-slate-400">
            Follow dependency order: Instances → Peering → Security Groups → Subnets → Route Tables → IGW → VPCs.
          </p>
        </div>

        {/* Progress & Upload Button */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xl font-black font-mono text-amber-400">
              {completedCount} / 13
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">Steps Completed</span>
          </div>

          <button
            onClick={() => setShowProofUpload(true)}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>Upload Cleanup Proof</span>
          </button>
        </div>
      </div>

      {/* 13 Checklist Steps */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        {cleanupSteps.map((step) => {
          return (
            <div
              key={step.id}
              onClick={() => toggleCleanupStep(step.id)}
              className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-all cursor-pointer ${
                step.isCompleted
                  ? 'bg-slate-950/60 border-slate-800/80 opacity-70'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={step.isCompleted}
                  onChange={() => toggleCleanupStep(step.id)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 mt-1 cursor-pointer"
                />

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      Step {step.stepNumber}:
                    </span>
                    <h3
                      className={`text-xs font-bold ${
                        step.isCompleted ? 'text-slate-400 line-through' : 'text-white'
                      }`}
                    >
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">{step.description}</p>

                  <div className="text-[10px] font-mono text-slate-300">
                    Target: <span className="text-slate-200">{step.resourceTarget}</span>
                  </div>
                </div>
              </div>

              {step.isCompleted && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold shrink-0">
                  Completed {step.completedAt || ''}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Teardown Proof Upload Modal */}
      {showProofUpload && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-400" />
              Upload AWS Cleanup Evidence Screenshot
            </h3>
            <p className="text-xs text-slate-400">
              Provide a screenshot of your AWS EC2 Console showing 0 running instances or AWS Billing page showing zero active charges.
            </p>

            <form onSubmit={handleSaveProof} className="space-y-4 text-xs">
              <div>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleProofChange}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-lg text-slate-300 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-400 cursor-pointer"
                />
              </div>

              {proofDataUrl && (
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 max-h-36 overflow-hidden flex items-center justify-center">
                  <img src={proofDataUrl} alt="Preview" className="max-h-32 object-contain rounded" />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProofUpload(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  Save Cleanup Evidence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
