import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { SecurityBanner } from '../common/SecurityBanner';
import { ConnectivityTestItem } from '../../types/lab';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
  Terminal,
  Edit2,
  Check,
  X,
  Upload,
  Camera,
  Copy,
  Clock,
  ExternalLink,
} from 'lucide-react';

export const ConnectivityTestsPage: React.FC = () => {
  const { tests, updateTest, evidence, setActivePage } = useLab();
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ConnectivityTestItem>>({});
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const startEdit = (t: ConnectivityTestItem) => {
    setEditingTestId(t.id);
    setForm({
      actualResult: t.actualResult,
      status: t.status,
      packetLossPercent: t.packetLossPercent,
      testDate: t.testDate || new Date().toLocaleString(),
      studentExplanation: t.studentExplanation,
      screenshotId: t.screenshotId,
    });
  };

  const saveEdit = (id: string) => {
    updateTest(id, form);
    setEditingTestId(null);
  };

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SecurityBanner />

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
              Stage 7 & 10 Verification
            </span>
            <span className="text-xs font-mono text-slate-400">
              5 Authoritative Project Verification Tests
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Network Connectivity & Security Isolation Tests
          </h1>
          <p className="text-xs text-slate-400">
            Execute each command in your terminal via SSH and record the exact terminal response below.
          </p>
        </div>

        <button
          onClick={() => setActivePage('failure-recovery')}
          className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer shrink-0"
        >
          <span>Next: Controlled Failure Experiment</span>
          <Activity className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5 Tests Grid / List */}
      <div className="space-y-6">
        {tests.map((test) => {
          const isEditing = editingTestId === test.id;
          const isPassed = test.status === 'Passed';
          const isFailed = test.status === 'Failed';
          const linkedEvidence = evidence.find((e) => e.id === test.screenshotId);

          return (
            <div
              key={test.id}
              className={`bg-slate-900 border rounded-2xl p-6 shadow-xl transition-all space-y-4 ${
                isPassed
                  ? 'border-emerald-500/40'
                  : isFailed
                  ? 'border-red-500/40'
                  : 'border-slate-800'
              }`}
            >
              {/* Test Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-800 font-mono text-xs font-bold text-amber-400 flex items-center justify-center shrink-0 border border-slate-700">
                    #{test.testNumber}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{test.name}</h3>
                    <div className="text-xs font-mono text-slate-400 mt-0.5">
                      Source: <span className="text-blue-300 font-semibold">{test.source}</span> → Destination:{' '}
                      <span className="text-purple-300 font-semibold">{test.destination}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-mono px-3 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                      isPassed
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isFailed
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : isFailed ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    {test.status}
                  </span>

                  {!isEditing && (
                    <button
                      onClick={() => startEdit(test)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3 text-amber-400" />
                      <span>Record Test</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Command bar */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between font-mono text-xs text-amber-300">
                <div className="flex items-center gap-2 truncate">
                  <Terminal className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="truncate">{test.command}</span>
                </div>
                <button
                  onClick={() => copyCommand(test.command)}
                  className="p-1.5 text-slate-400 hover:text-white cursor-pointer ml-2"
                  title="Copy command"
                >
                  {copiedCmd === test.command ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Expected vs Actual Outputs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                    Expected Workbook Result
                  </span>
                  <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                    {test.expectedResult}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                    Actual Recorded Terminal Output
                  </span>
                  {isEditing ? (
                    <textarea
                      rows={4}
                      value={form.actualResult || ''}
                      onChange={(e) => setForm({ ...form, actualResult: e.target.value })}
                      placeholder="Paste terminal output here..."
                      className="w-full bg-slate-900 border border-slate-700 p-2 text-xs font-mono text-white rounded focus:outline-none focus:border-amber-500"
                    />
                  ) : test.actualResult ? (
                    <pre className="font-mono text-[11px] text-emerald-300 whitespace-pre-wrap overflow-x-auto max-h-36">
                      {test.actualResult}
                    </pre>
                  ) : (
                    <span className="text-slate-500 italic text-[11px]">
                      No terminal output recorded yet. Click "Record Test" above.
                    </span>
                  )}
                </div>
              </div>

              {/* Edit Form Controls for Status, Loss %, and Explanation */}
              {isEditing && (
                <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/40 space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Result Outcome</label>
                      <select
                        value={form.status || 'Not tested'}
                        onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                        className="w-full bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-white rounded font-mono"
                      >
                        <option value="Not tested">Not tested</option>
                        <option value="Passed">Passed (Matches Expected)</option>
                        <option value="Failed">Failed (Unexpected Packet Drop)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Packet Loss %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={form.packetLossPercent ?? 0}
                        onChange={(e) =>
                          setForm({ ...form, packetLossPercent: parseInt(e.target.value, 10) })
                        }
                        className="w-full bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-white rounded font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Execution Timestamp</label>
                      <input
                        type="text"
                        value={form.testDate || ''}
                        onChange={(e) => setForm({ ...form, testDate: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-white rounded font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Student Engineering Explanation / Observations
                    </label>
                    <textarea
                      rows={2}
                      value={form.studentExplanation || ''}
                      onChange={(e) => setForm({ ...form, studentExplanation: e.target.value })}
                      placeholder="Explain the packet routing path and why this test validates the architecture..."
                      className="w-full bg-slate-900 border border-slate-700 p-2 text-xs text-white rounded"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setEditingTestId(null)}
                      className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveEdit(test.id)}
                      className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                    >
                      Save Verification
                    </button>
                  </div>
                </div>
              )}

              {/* Student explanation preview */}
              {!isEditing && test.studentExplanation && (
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-300">
                  <strong className="text-amber-400 font-mono text-[11px] block mb-0.5">
                    Engineering Observation:
                  </strong>
                  {test.studentExplanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
