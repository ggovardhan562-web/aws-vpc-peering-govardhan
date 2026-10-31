import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { SecurityBanner } from '../common/SecurityBanner';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const EvaluationPage: React.FC = () => {
  const {
    evaluation,
    updateEvaluationMarks,
    totalScore,
    progressPercentage,
    evidenceCount,
    tests,
    cleanupSteps,
    setActivePage,
  } = useLab();

  const [instructorMode, setInstructorMode] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [marksInput, setMarksInput] = useState<number>(0);
  const [feedbackInput, setFeedbackInput] = useState<string>('');

  const startEditCategory = (catId: string, currentMarks: number, currentFeedback?: string) => {
    setEditingCatId(catId);
    setMarksInput(currentMarks);
    setFeedbackInput(currentFeedback || '');
  };

  const saveCategory = (catId: string) => {
    updateEvaluationMarks(catId, marksInput, true, feedbackInput);
    setEditingCatId(null);
  };

  const getGradeRating = (score: number) => {
    if (score >= 90) return { label: 'Grade O (Outstanding / Industry Ready)', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
    if (score >= 75) return { label: 'Grade A+ (Distinction)', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' };
    if (score >= 60) return { label: 'Grade A (First Class)', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
    if (score >= 40) return { label: 'Grade B (Pass / Conditional)', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' };
    return { label: 'Unverified / Incomplete Project', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' };
  };

  const rating = getGradeRating(totalScore);

  // Recommendations for improvement
  const getImprovements = () => {
    const list: string[] = [];
    if (evidenceCount < 5) list.push(`Upload at least 5 verification screenshots (currently ${evidenceCount}).`);
    const passedTests = tests.filter((t) => t.status === 'Passed').length;
    if (passedTests < 5) list.push(`Complete and log all 5 connectivity verification tests (currently ${passedTests}/5).`);
    const completedCleanup = cleanupSteps.filter((s) => s.isCompleted).length;
    if (completedCleanup < 12) list.push(`Complete AWS account cleanup checklist (currently ${completedCleanup}/13 steps).`);
    return list;
  };

  const improvements = getImprovements();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SecurityBanner />

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              Stage 14 Official Rubric
            </span>
            <span className="text-xs font-mono text-slate-400">
              100-Mark Academic Assessment
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Student Project Evaluation & Scoring Matrix
          </h1>
          <p className="text-xs text-slate-400">
            Scores are calculated dynamically from actual recorded resource IDs, verified route tables, testing logs, and cleanup artifacts.
          </p>
        </div>

        {/* Instructor Mode Switch */}
        <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <div className="text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Instructor Mode:</span>
            <span className="font-semibold text-slate-200">
              {instructorMode ? 'Override Enabled' : 'Auto-Calculated'}
            </span>
          </div>
          <button
            onClick={() => setInstructorMode(!instructorMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              instructorMode
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {instructorMode ? 'Active' : 'Toggle'}
          </button>
        </div>
      </div>

      {/* Big Score Card Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Award className="w-10 h-10 text-amber-400" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase text-slate-400">Total Project Score</div>
            <div className="text-4xl font-black font-mono text-white mt-0.5">
              <span className="text-amber-400">{totalScore}</span>
              <span className="text-base text-slate-500 font-normal"> / 100 Marks</span>
            </div>
            <div className={`mt-2 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full inline-block border ${rating.bg} ${rating.color}`}>
              {rating.label}
            </div>
          </div>
        </div>

        <button
          onClick={() => setActivePage('report')}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <span>Generate Final PDF Report</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Improvement Suggestions */}
      {improvements.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 space-y-1.5">
          <div className="font-bold flex items-center gap-2 text-amber-400">
            <AlertCircle className="w-4 h-4" />
            <span>Actionable Items to Reach 100/100 Marks:</span>
          </div>
          <ul className="list-disc list-inside pl-6 space-y-1 text-slate-300">
            {improvements.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Rubric Breakdown (6 Categories) */}
      <div className="space-y-4">
        {evaluation.map((cat) => {
          const isEditing = editingCatId === cat.id;

          return (
            <div
              key={cat.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white">{cat.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{cat.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-lg font-black font-mono text-amber-400">
                      {cat.awardedMarks}
                    </span>
                    <span className="text-xs font-mono text-slate-500"> / {cat.maxMarks} Marks</span>
                    {cat.instructorOverride && (
                      <span className="block text-[9px] font-mono text-cyan-400">Instructor Override</span>
                    )}
                  </div>

                  {instructorMode && !isEditing && (
                    <button
                      onClick={() => startEditCategory(cat.id, cat.awardedMarks, cat.feedback)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                      title="Adjust marks manually"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Criteria items list */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                  Evaluation Criteria:
                </span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {cat.criteriaList.map((crit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400">•</span>
                      <span>{crit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructor Edit Mode */}
              {isEditing && (
                <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/40 space-y-3 text-xs">
                  <div className="flex items-center gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold block">Adjust Marks (Max {cat.maxMarks}):</label>
                      <input
                        type="number"
                        min="0"
                        max={cat.maxMarks}
                        value={marksInput}
                        onChange={(e) => setMarksInput(parseInt(e.target.value, 10))}
                        className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded font-mono text-amber-300 text-sm w-28"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-slate-300 font-semibold block">Instructor Remarks:</label>
                      <input
                        type="text"
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        placeholder="Evaluation feedback..."
                        className="w-full bg-slate-900 border border-slate-700 px-3 py-1.5 rounded text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setEditingCatId(null)}
                      className="px-3 py-1 rounded bg-slate-800 text-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveCategory(cat.id)}
                      className="px-4 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                    >
                      Apply Marks
                    </button>
                  </div>
                </div>
              )}

              {/* Feedback display if present */}
              {!isEditing && cat.feedback && (
                <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800 text-[11px] text-cyan-300">
                  <strong>Instructor Remark:</strong> {cat.feedback}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
