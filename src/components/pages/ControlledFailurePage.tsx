import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { SecurityBanner } from '../common/SecurityBanner';
import {
  Flame,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Shield,
  Play,
  Camera,
  ArrowRight,
  Info,
  Check,
  Edit2,
  Save,
} from 'lucide-react';

export const ControlledFailurePage: React.FC = () => {
  const { controlledFailure, updateControlledFailure, setActivePage } = useLab();
  const [form, setForm] = useState(controlledFailure);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    updateControlledFailure(form);
    setIsEditing(false);
  };

  const toggleStep = (stepKey: keyof typeof controlledFailure) => {
    const updated = { ...controlledFailure, [stepKey]: !controlledFailure[stepKey] };
    updateControlledFailure(updated);
    setForm(updated);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SecurityBanner />

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              Stage 11 Controlled Experiment
            </span>
            <span className="text-xs font-mono text-slate-400">
              Positive & Negative Security Verification
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Controlled Failure & Instant Recovery Verification
          </h1>
          <p className="text-xs text-slate-400">
            Scientifically demonstrate that AWS Security Groups actively enforce stateful packet filtering by temporarily removing the ICMP Echo rule.
          </p>
        </div>

        <button
          onClick={() => setActivePage('troubleshooting')}
          className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer shrink-0"
        >
          <span>Next: Troubleshooting Matrix</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Interactive Step Execution Checkpoints */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            key: 'step1RemovedICMP',
            title: '1. Remove ICMP Rule',
            desc: 'Delete only the ICMP rule (Type 8 Code 0 from 10.10.2.10/32) from ewb-sg-app-b. Keep SSH intact.',
          },
          {
            key: 'step2ObservedFailure',
            title: '2. Observe 100% Drop',
            desc: 'Ping from App-A now drops with 100% loss. SSH session via ProxyJump remains alive.',
          },
          {
            key: 'step3RestoredICMP',
            title: '3. Restore ICMP Rule',
            desc: 'Re-add ICMP Echo Request Type 8 Code 0 with Source 10.10.2.10/32 in ewb-sg-app-b.',
          },
          {
            key: 'step4ObservedRecovery',
            title: '4. Verify Instant Recovery',
            desc: 'App-A ping immediately resumes with 0% packet loss without rebooting instances.',
          },
        ].map((s) => {
          const checked = Boolean(controlledFailure[s.key as keyof typeof controlledFailure]);
          return (
            <button
              key={s.key}
              onClick={() => toggleStep(s.key as any)}
              className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                checked
                  ? 'bg-emerald-950/20 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold font-mono text-white">{s.title}</span>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                      checked
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'border-slate-700 bg-slate-950'
                    }`}
                  >
                    {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{s.desc}</p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                {checked ? (
                  <span className="text-emerald-400 font-bold">✓ Checkpoint Satisfied</span>
                ) : (
                  <span className="text-slate-500">Click to mark complete</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 3 Separate Test States Display */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Three Distinct Observational States</h2>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Observations'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* State 1: Before Rule Removal */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">
                State 1: Baseline
              </span>
              <span className="text-[11px] text-emerald-400 font-mono font-bold">0% Loss</span>
            </div>
            <h3 className="text-xs font-bold text-white">Before Rule Removal</h3>
            <p className="text-[11px] text-slate-400">
              ICMP Echo rule is present in <code>ewb-sg-app-b</code>.
            </p>
            {isEditing ? (
              <textarea
                rows={3}
                value={form.baselinePingResult}
                onChange={(e) => setForm({ ...form, baselinePingResult: e.target.value })}
                placeholder="4 packets transmitted, 4 received, 0% packet loss..."
                className="w-full bg-slate-900 border border-slate-700 p-2 text-xs font-mono text-white rounded"
              />
            ) : (
              <pre className="font-mono text-[10px] text-emerald-300 bg-slate-900/80 p-2.5 rounded border border-slate-800 max-h-24 overflow-y-auto whitespace-pre-wrap">
                {controlledFailure.baselinePingResult || '4 packets transmitted, 4 received, 0% packet loss (normal state)'}
              </pre>
            )}
          </div>

          {/* State 2: During Controlled Failure */}
          <div className="p-4 bg-slate-950 rounded-xl border border-red-500/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-bold">
                State 2: Failure
              </span>
              <span className="text-[11px] text-red-400 font-mono font-bold">100% Loss</span>
            </div>
            <h3 className="text-xs font-bold text-white">During Controlled Failure</h3>
            <p className="text-[11px] text-slate-400">
              ICMP rule temporarily removed from <code>ewb-sg-app-b</code>.
            </p>
            {isEditing ? (
              <textarea
                rows={3}
                value={form.failurePingResult}
                onChange={(e) => setForm({ ...form, failurePingResult: e.target.value })}
                placeholder="4 packets transmitted, 0 received, 100% packet loss..."
                className="w-full bg-slate-900 border border-slate-700 p-2 text-xs font-mono text-white rounded"
              />
            ) : (
              <pre className="font-mono text-[10px] text-red-300 bg-slate-900/80 p-2.5 rounded border border-slate-800 max-h-24 overflow-y-auto whitespace-pre-wrap">
                {controlledFailure.failurePingResult || '4 packets transmitted, 0 received, 100% packet loss (ICMP rule deleted)'}
              </pre>
            )}
          </div>

          {/* State 3: After Recovery */}
          <div className="p-4 bg-slate-950 rounded-xl border border-emerald-500/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                State 3: Recovery
              </span>
              <span className="text-[11px] text-emerald-400 font-mono font-bold">0% Loss</span>
            </div>
            <h3 className="text-xs font-bold text-white">After Rule Restored</h3>
            <p className="text-[11px] text-slate-400">
              Exact ICMP Echo rule restored in <code>ewb-sg-app-b</code>.
            </p>
            {isEditing ? (
              <textarea
                rows={3}
                value={form.recoveryPingResult}
                onChange={(e) => setForm({ ...form, recoveryPingResult: e.target.value })}
                placeholder="4 packets transmitted, 4 received, 0% packet loss..."
                className="w-full bg-slate-900 border border-slate-700 p-2 text-xs font-mono text-white rounded"
              />
            ) : (
              <pre className="font-mono text-[10px] text-emerald-300 bg-slate-900/80 p-2.5 rounded border border-slate-800 max-h-24 overflow-y-auto whitespace-pre-wrap">
                {controlledFailure.recoveryPingResult || '4 packets transmitted, 4 received, 0% packet loss (rule restored)'}
              </pre>
            )}
          </div>
        </div>

        {/* Student Observation Field */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
          <label className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono block">
            Student Engineering Explanation
          </label>
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                rows={3}
                value={form.studentObservations}
                onChange={(e) => setForm({ ...form, studentObservations: e.target.value })}
                placeholder="Explain what this experiment proves regarding AWS Security Groups..."
                className="w-full bg-slate-900 border border-slate-700 p-2.5 text-xs text-white rounded"
              />
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Experiment Data</span>
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-300 leading-relaxed">
              {controlledFailure.studentObservations ||
                'This experiment scientifically proves that AWS Security Groups actively enforce stateful packet filtering. Removing the ICMP rule causes immediate ping failure while SSH ProxyJump connectivity remains intact. Restoring the rule restores ping within 1 second without server reboots.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
