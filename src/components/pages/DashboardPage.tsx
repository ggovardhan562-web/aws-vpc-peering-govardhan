import React from 'react';
import { useLab } from '../../context/LabContext';
import { SecurityBanner } from '../common/SecurityBanner';
import {
  Layers,
  Shield,
  Server,
  Waypoints,
  Route,
  Activity,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Award,
  Globe,
  Camera,
  Info,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    profile,
    resources,
    routeTables,
    securityGroups,
    ec2Instances,
    peering,
    tests,
    evidence,
    cleanupSteps,
    progressPercentage,
    totalTasks,
    completedTasks,
    pendingTasks,
    failedChecks,
    evidenceCount,
    totalScore,
    isReportReady,
    setActivePage,
    loadSampleData,
  } = useLab();

  // Smart next task locator
  const getNextTask = () => {
    if (!profile.studentName) return { page: 'overview', title: 'Fill Student Profile & Region' };
    const missingRes = resources.find((r) => !r.actualAwsId);
    if (missingRes) return { page: 'inventory', title: `Record AWS ID for ${missingRes.name}` };
    if (peering.status !== 'Active') return { page: 'peering', title: 'Accept Peering Connection ewb-a-b-peer' };
    const untransmittedTest = tests.find((t) => t.status === 'Not tested');
    if (untransmittedTest) return { page: 'testing', title: `Execute ${untransmittedTest.name}` };
    if (evidenceCount < 3) return { page: 'evidence', title: 'Upload Lab Verification Screenshots' };
    const pendingCleanup = cleanupSteps.find((s) => !s.isCompleted);
    if (pendingCleanup) return { page: 'cleanup', title: `Execute Cleanup: ${pendingCleanup.title}` };
    return { page: 'report', title: 'Generate Final PDF Submission Report' };
  };

  const nextTask = getNextTask();

  // Sub-cards statistics
  const cards = [
    {
      title: 'Architecture & CIDR',
      page: 'architecture',
      icon: Layers,
      color: 'from-blue-500/20 to-blue-600/10 text-blue-400 border-blue-500/30',
      status: '10.10.0.0/16 ↔ 10.20.0.0/16',
      progressText: 'Non-overlapping CIDR Plan',
      isComplete: true,
    },
    {
      title: 'Resource Inventory',
      page: 'inventory',
      icon: Layers,
      color: 'from-amber-500/20 to-amber-600/10 text-amber-400 border-amber-500/30',
      status: `${resources.filter((r) => r.actualAwsId).length}/17 IDs Recorded`,
      progressText: `${resources.filter((r) => r.actualAwsId).length} verified in console`,
      isComplete: resources.filter((r) => r.actualAwsId).length === 17,
    },
    {
      title: 'Security Groups',
      page: 'security',
      icon: Shield,
      color: 'from-indigo-500/20 to-indigo-600/10 text-indigo-400 border-indigo-500/30',
      status: '3 SGs Configured',
      progressText: 'Restricted /32 SSH & ICMP Rules',
      isComplete: securityGroups.every((sg) => sg.inboundRules.length > 0),
    },
    {
      title: 'EC2 Instances',
      page: 'ec2',
      icon: Server,
      color: 'from-cyan-500/20 to-cyan-600/10 text-cyan-400 border-cyan-500/30',
      status: `${ec2Instances.filter((i) => i.actualInstanceId).length}/3 Launched`,
      progressText: 'Bastion + 2 Private App Nodes',
      isComplete: ec2Instances.every((i) => i.actualInstanceId),
    },
    {
      title: 'VPC Peering',
      page: 'peering',
      icon: Waypoints,
      color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/30',
      status: peering.status,
      progressText: peering.actualPcxId ? peering.actualPcxId : 'Pending creation',
      isComplete: peering.status === 'Active',
    },
    {
      title: 'Routing Tables',
      page: 'routes',
      icon: Route,
      color: 'from-violet-500/20 to-violet-600/10 text-violet-400 border-violet-500/30',
      status: `${routeTables.filter((r) => r.isVerified || r.routes.some((ro) => ro.targetType === 'pcx')).length}/3 Configured`,
      progressText: 'Forward & Return Peering Routes',
      isComplete: routeTables.every((r) => r.routes.some((ro) => ro.targetType === 'pcx')),
    },
    {
      title: 'Connectivity Testing',
      page: 'testing',
      icon: Activity,
      color: 'from-rose-500/20 to-rose-600/10 text-rose-400 border-rose-500/30',
      status: `${tests.filter((t) => t.status === 'Passed').length}/5 Passed`,
      progressText: `${tests.filter((t) => t.status === 'Not tested').length} pending tests`,
      isComplete: tests.every((t) => t.status === 'Passed'),
    },
    {
      title: 'Evidence & Screenshots',
      page: 'evidence',
      icon: Camera,
      color: 'from-teal-500/20 to-teal-600/10 text-teal-400 border-teal-500/30',
      status: `${evidenceCount} Screenshots Uploaded`,
      progressText: evidenceCount >= 5 ? 'Meets submission standard' : 'Min 5 recommended',
      isComplete: evidenceCount >= 5,
    },
    {
      title: 'AWS Resource Cleanup',
      page: 'cleanup',
      icon: Trash2,
      color: 'from-red-500/20 to-red-600/10 text-red-400 border-red-500/30',
      status: `${cleanupSteps.filter((s) => s.isCompleted).length}/13 Steps Done`,
      progressText: 'Avoid residual AWS charges',
      isComplete: cleanupSteps.every((s) => s.isCompleted),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SecurityBanner />

      {/* Top Banner / Student Brief */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                AWS Networking Project
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                Region: <strong className="text-slate-200">{profile.awsRegion}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {profile.projectTitle}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
              <div>
                Student:{' '}
                <strong className="text-white">
                  {profile.studentName || 'Not Set (Click to edit)'}
                </strong>
              </div>
              <span className="text-slate-600">•</span>
              <div>
                Batch: <strong className="text-slate-200">{profile.batch}</strong>
              </div>
              <span className="text-slate-600">•</span>
              <div>
                Account Alias:{' '}
                <strong className="text-amber-400 font-mono">
                  {profile.awsAccountAlias || 'student-lab-default'}
                </strong>
              </div>
            </div>
          </div>

          {/* Quick Continue Button & Score */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActivePage(nextTask.page)}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <span>Continue Project:</span>
              <span className="underline decoration-slate-950/40">{nextTask.title}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {progressPercentage < 100 && (
              <button
                onClick={loadSampleData}
                className="px-3.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Autofill Sample Demo</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress bar container */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 font-medium">Overall Lab Completion Progress</span>
            <span className="font-mono font-bold text-amber-400 text-sm">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 transition-all duration-700"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Top 4 Key Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Tasks Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {completedTasks}{' '}
            <span className="text-xs font-normal text-slate-300">/ {totalTasks}</span>
          </div>
          <div className="text-[11px] text-slate-300 mt-1">
            {pendingTasks} remaining checkpoints
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Validation Checks</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {failedChecks > 0 ? (
              <span className="text-red-400">{failedChecks} Failed</span>
            ) : (
              <span className="text-emerald-400">All Passing</span>
            )}
          </div>
          <div className="text-[11px] text-slate-300 mt-1">
            {tests.filter((t) => t.status === 'Passed').length} tests verified
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Evidence Collected</span>
            <Camera className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {evidenceCount}{' '}
            <span className="text-xs font-normal text-slate-300">Screenshots</span>
          </div>
          <div className="text-[11px] text-slate-300 mt-1">
            {evidenceCount >= 5 ? '✓ Report Ready' : 'Minimum 5 for full marks'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Evaluation Marks</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">
            {totalScore}{' '}
            <span className="text-xs font-normal text-slate-300">/ 100</span>
          </div>
          <div className="text-[11px] text-slate-300 mt-1">
            {isReportReady ? (
              <span className="text-emerald-400 font-medium">Report Ready to Download</span>
            ) : (
              <span className="text-amber-400">Needs 40%+ to export</span>
            )}
          </div>
        </div>
      </div>

      {/* 9 Stage Modules Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white tracking-tight">Project Architecture Modules</h2>
          <span className="text-xs text-slate-300">Click any card to inspect or edit configuration</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.title}
                onClick={() => setActivePage(c.page)}
                className="text-left bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all duration-200 group relative flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`p-2 rounded-lg bg-gradient-to-br ${c.color} border flex items-center justify-center`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    {c.isComplete ? (
                      <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        Complete
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        In Progress
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                    {c.title}
                  </h3>
                  <div className="text-xs font-mono text-slate-300 mt-1">{c.status}</div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300">
                  <span className="truncate">{c.progressText}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity & Important Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Workbook Execution Stages
          </h3>

          <div className="space-y-3">
            {[
              {
                num: '1 - 3',
                title: 'Network Planning & VPC Subnets',
                desc: 'VPC A (10.10.0.0/16) with Public & Private subnets; VPC B (10.20.0.0/16) Private subnet with zero IGW.',
                done: resources.filter((r) => r.type === 'VPC' && r.actualAwsId).length === 2,
              },
              {
                num: '4 - 6',
                title: 'Security Groups & SSH ProxyJump',
                desc: 'Port 22 restricted to student IP /32 on Bastion; App-A/B restricted to Bastion private IP 10.10.1.10.',
                done: securityGroups.every((sg) => sg.inboundRules.length > 0),
              },
              {
                num: '7 - 9',
                title: 'Baseline Failure, Peering & Routing',
                desc: 'Observe initial ping failure. Accept ewb-a-b-peer, configure forward route in A and return route in B.',
                done: peering.status === 'Active' && tests.some((t) => t.id === 'test-1-baseline' && t.status === 'Passed'),
              },
              {
                num: '10 - 12',
                title: 'Bidirectional Testing & Controlled Failure',
                desc: 'Verify 0% packet loss ping across VPCs. Remove App-B ICMP rule, confirm failure, restore rule, verify recovery.',
                done: tests.some((t) => t.id === 'test-2-forward' && t.status === 'Passed'),
              },
              {
                num: '13 - 15',
                title: 'Deliverables, Viva Prep & AWS Cleanup',
                desc: 'Export YourName_EWB_VPC_Peering.pdf, study 10 viva questions, and complete 13-step teardown to prevent charges.',
                done: cleanupSteps.filter((s) => s.isCompleted).length >= 10,
              },
            ].map((stage, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/50 border border-slate-800/80"
              >
                <div
                  className={`w-7 h-7 rounded-md font-mono text-xs flex items-center justify-center font-bold shrink-0 ${
                    stage.done
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {stage.num}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-200">{stage.title}</h4>
                    {stage.done ? (
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Done
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-300 font-mono">In Progress</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{stage.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips and Educational Reminder */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              Critical Networking Rules
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>
                  <strong>No Transitive Routing:</strong> VPC B cannot reach the internet through VPC A’s Internet Gateway.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>
                  <strong>Return Route Mandatory:</strong> Packets reach VPC B, but reply packets will be dropped without 10.10.0.0/16 → pcx in ewb-rt-b-private.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>
                  <strong>Zero-Trust IP Hygiene:</strong> App-A and App-B must never have public IPv4 addresses.
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
            <strong>Viva Tip:</strong> Security Groups are stateful; return traffic is automatically permitted regardless of inbound rules. Network ACLs are stateless.
          </div>
        </div>
      </div>
    </div>
  );
};
