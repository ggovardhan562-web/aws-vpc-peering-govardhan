import React from 'react';
import { useLab } from '../../context/LabContext';
import {
  LayoutDashboard,
  BookOpen,
  Network,
  Boxes,
  Layers,
  ShieldCheck,
  Server,
  Terminal,
  Waypoints,
  Route,
  Activity,
  Flame,
  Wrench,
  Camera,
  Award,
  FileCheck2,
  Trash2,
  Settings,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const {
    activePage,
    setActivePage,
    progressPercentage,
    totalTasks,
    completedTasks,
    failedChecks,
    evidenceCount,
    totalScore,
  } = useLab();

  const navGroups: NavGroup[] = [
    {
      groupName: 'Core Lab',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'overview', label: 'Project Setup & Brief', icon: BookOpen },
        { id: 'architecture', label: 'Network Architecture', icon: Network, badge: 'Interactive' },
        { id: 'inventory', label: 'Resource Inventory', icon: Boxes, badge: '17 Res' },
      ],
    },
    {
      groupName: 'Infrastructure Build',
      items: [
        { id: 'network', label: 'Network Setup & CIDR', icon: Layers },
        { id: 'security', label: 'Security Groups', icon: ShieldCheck },
        { id: 'ec2', label: 'EC2 Instances', icon: Server, badge: '3 Nodes' },
        { id: 'ssh', label: 'SSH Configuration', icon: Terminal, badge: 'ProxyJump' },
      ],
    },
    {
      groupName: 'Peering & Routing',
      items: [
        { id: 'peering', label: 'VPC Peering', icon: Waypoints },
        { id: 'routes', label: 'Route Tables', icon: Route },
      ],
    },
    {
      groupName: 'Testing & Hardening',
      items: [
        { id: 'testing', label: 'Connectivity Tests', icon: Activity, badge: '5 Tests' },
        { id: 'failure-recovery', label: 'Controlled Failure', icon: Flame, badge: 'Exp 11' },
        { id: 'troubleshooting', label: 'Troubleshooting & Tree', icon: Wrench },
      ],
    },
    {
      groupName: 'Submission & Teardown',
      items: [
        { id: 'evidence', label: 'Evidence Gallery', icon: Camera, badge: `${evidenceCount}` },
        { id: 'evaluation', label: '100-Mark Rubric', icon: Award, badge: `${totalScore}/100`, badgeColor: 'bg-emerald-500/20 text-emerald-400' },
        { id: 'report', label: 'PDF Report Generator', icon: FileCheck2 },
        { id: 'cleanup', label: 'AWS Cleanup Checklist', icon: Trash2, badge: '13 Steps' },
        { id: 'settings', label: 'Lab Settings & Backup', icon: Settings },
      ],
    },
  ];

  const handleSelectPage = (id: string) => {
    setActivePage(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-black text-slate-950 text-xs shadow-md shadow-amber-500/10">
              CP
            </div>
            <div>
              <div className="font-bold text-xs tracking-wider text-slate-200 uppercase">
                CloudPeer Lab
              </div>
              <div className="text-[10px] text-amber-400 font-mono">
                AWS VPC Peering Studio
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Progress Card */}
        <div className="p-4 mx-3 my-3 bg-gradient-to-br from-slate-900 to-slate-900/60 rounded-xl border border-slate-800/90 shadow-inner">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Project Progress
            </span>
            <span className="font-mono font-bold text-amber-400 text-sm">
              {progressPercentage}%
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2.5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800/60">
            <div className="flex items-center gap-1 text-slate-400">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{completedTasks} of {totalTasks} tasks</span>
            </div>
            <div className="flex items-center justify-end gap-1 text-slate-400">
              {failedChecks > 0 ? (
                <>
                  <AlertCircle className="w-3 h-3 text-red-400" />
                  <span className="text-red-400 font-bold">{failedChecks} Failed</span>
                </>
              ) : (
                <span className="text-emerald-400 font-mono font-medium">{totalScore}/100 Marks</span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
          {navGroups.map((group) => (
            <div key={group.groupName} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-300 font-mono">
                {group.groupName}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectPage(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                        isActive
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold shadow-xs'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-amber-400' : 'text-slate-300 group-hover:text-slate-200'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full shrink-0 ${
                            item.badgeColor ||
                            (isActive
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-slate-800 text-slate-400')
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950 text-slate-400 text-[11px] text-center">
          <div className="flex items-center justify-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AWS Lab Companion</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Workbook Authoritative Rules
          </div>
        </div>
      </aside>
    </>
  );
};
