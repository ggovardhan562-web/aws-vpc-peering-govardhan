import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { SecurityBanner } from '../common/SecurityBanner';
import { defaultVivaQuestions } from '../../data/defaultData';
import {
  User,
  Calendar,
  Globe,
  Hash,
  BookOpen,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Sparkles,
  Save,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { profile, updateProfile, setActivePage } = useLab();
  const [formData, setFormData] = useState(profile);
  const [savedNotice, setSavedNotice] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'concepts' | 'viva'>('profile');
  const [openVivaId, setOpenVivaId] = useState<string | null>('viva-1');
  const [selectedConcept, setSelectedConcept] = useState<string>('vpc');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const educationalConcepts: Record<
    string,
    { title: string; subtitle: string; explanation: string; practicalLabUsage: string; rules: string[] }
  > = {
    vpc: {
      title: 'Virtual Private Cloud (VPC)',
      subtitle: 'Isolated virtual network dedicated to your AWS account',
      explanation:
        'An Amazon VPC is a logically isolated virtual network within the AWS Cloud that closely resembles a traditional on-premises data center network, but with the scalable infrastructure of AWS. Within a VPC, you control your IP address range, subnets, route tables, network gateways, and security settings.',
      practicalLabUsage:
        'In this project, we create two distinct VPCs: ewb-vpc-a (10.10.0.0/16) and ewb-vpc-b (10.20.0.0/16). Because they reside in separate address spaces, they act as two physically independent data centers.',
      rules: [
        'Each VPC must have an IPv4 CIDR block between /16 and /28.',
        'VPCs are isolated by default; no traffic crosses VPC boundaries without explicit peering or transit gateways.',
        'Primary CIDR blocks cannot be changed after creation (though secondary CIDRs can be added).',
      ],
    },
    subnet: {
      title: 'Subnets (Public vs Private)',
      subtitle: 'Subdivisions of a VPC CIDR bound to a single Availability Zone',
      explanation:
        'A subnet is a range of IP addresses in your VPC. A subnet that has a direct route to an Internet Gateway (0.0.0.0/0 -> igw) is defined as a Public Subnet. A subnet whose route table lacks a route to an Internet Gateway is a Private Subnet. AWS reserves 5 IP addresses per subnet (.0 network, .1 router, .2 DNS, .3 future use, .255 broadcast).',
      practicalLabUsage:
        'ewb-a-public (10.10.1.0/24) hosts the bastion with IGW route. ewb-a-private (10.10.2.0/24) and ewb-b-private (10.20.1.0/24) have no internet route.',
      rules: [
        'A subnet resides entirely within one Availability Zone (AZ).',
        'Instances in a private subnet can never be directly reached from the public internet.',
        'Subnet CIDRs within a VPC must never overlap.',
      ],
    },
    peering: {
      title: 'AWS VPC Peering',
      subtitle: 'High-bandwidth Layer 3 private connection between two VPCs',
      explanation:
        'VPC Peering is a direct networking connection between two VPCs that routes traffic using private IPv4 or IPv6 addresses. Neither VPC requires an Internet Gateway or Virtual Private Network (VPN) connection. Traffic moves over the private AWS backbone with no bandwidth bottleneck and no single point of failure.',
      practicalLabUsage:
        'ewb-a-b-peer links ewb-vpc-a and ewb-vpc-b. It enables App-A (10.10.2.10) to communicate privately with App-B (10.20.1.10).',
      rules: [
        'Non-transitive: VPC A cannot route VPC B’s traffic to the Internet or another VPC.',
        'Non-overlapping: CIDR blocks must be completely distinct.',
        'Requires 3 pieces: (1) Active Peering, (2) Route table entries in both VPCs, (3) Security group rules allowing traffic.',
      ],
    },
    returnroute: {
      title: 'Return Route Requirement (Asymmetric Routing)',
      subtitle: 'Why replies fail without an explicit reverse routing entry',
      explanation:
        'IP packet delivery is stateless and hop-by-hop. When Host A sends a packet to Host B, Router A forwards it over the peering link. When Host B receives the packet and attempts to reply, Host B consults its OWN local route table. If Host B’s route table has no route for Host A’s network, Host B drops the packet. The forward path and return path are evaluated independently.',
      practicalLabUsage:
        'ewb-rt-a-private contains 10.20.0.0/16 -> pcx. In VPC B, ewb-rt-b-private MUST contain the return route 10.10.0.0/16 -> pcx.',
      rules: [
        'Even if ping requests reach VPC B, replies will not return if the return route is missing.',
        'Route tables only look up destination IP addresses, not source addresses.',
        'Always check both route tables when troubleshooting connectivity.',
      ],
    },
    securitygroups: {
      title: 'Security Groups (Stateful Filtering)',
      subtitle: 'Virtual firewalls operating at the EC2 instance network interface level',
      explanation:
        'Security groups act as stateful firewalls for EC2 instances. If an inbound request is permitted by an inbound rule (e.g. ICMP Echo Request on port 8/0), the outgoing reply packet is automatically permitted back out, regardless of outbound rules. Conversely, Network ACLs are stateless and inspect packets in both directions.',
      practicalLabUsage:
        'ewb-sg-app-b allows ICMP from 10.10.2.10/32. Outbound ping replies flow back freely because of stateful connection tracking.',
      rules: [
        'Security groups are default-deny: everything is blocked unless explicitly permitted.',
        'Rules specify protocol (TCP, UDP, ICMP), port, and source CIDR/Security Group.',
        'Never open port 22 or ICMP to 0.0.0.0/0 in production or in this lab.',
      ],
    },
    proxyjump: {
      title: 'SSH ProxyJump & Bastion Architecture',
      subtitle: 'Secure remote administration without copying private keys to the cloud',
      explanation:
        'A bastion host (or jump box) is a hardened server in a public subnet used to access instances in private subnets. With SSH ProxyJump (-J), your local SSH client opens a TCP tunnel through the bastion directly to the private instance. Authentication is negotiated end-to-end between your laptop and the private instance; your private .pem key never touches the bastion.',
      practicalLabUsage:
        'By running ssh ewb-app-b, the client jumps through ewb-bastion across the VPC peering connection into 10.20.1.10 safely.',
      rules: [
        'Never run chmod 777 on .pem keys; use chmod 400 ~/.ssh/ewb-lab.pem.',
        'Never upload private keys to the bastion or anywhere in the cloud.',
        'Bastion security group must restrict port 22 strictly to your own public IP (/32).',
      ],
    },
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SecurityBanner />

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          Student Profile & AWS Scope
        </button>
        <button
          onClick={() => setActiveTab('concepts')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'concepts'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          AWS Networking Concepts
        </button>
        <button
          onClick={() => setActiveTab('viva')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'viva'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Viva Voce Preparation (10 Q&A)
        </button>
      </div>

      {/* Tab 1: Profile & Project Setup */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Project Identification</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure student identity, batch code, and target AWS region for report generation.
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Authoritative Setup
              </span>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Student Full Name <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    placeholder="e.g. Govardhan G"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Batch / College Code
                  </label>
                  <input
                    type="text"
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    placeholder="e.g. AWS Cloud Architect Batch 2026-A"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Project Title
                </label>
                <input
                  type="text"
                  value={formData.projectTitle}
                  onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    AWS Account Alias or Account ID
                  </label>
                  <input
                    type="text"
                    value={formData.awsAccountAlias}
                    onChange={(e) => setFormData({ ...formData, awsAccountAlias: e.target.value })}
                    placeholder="e.g. ewb-student-lab-01 or 123456789012"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    AWS Target Region
                  </label>
                  <select
                    value={formData.awsRegion}
                    onChange={(e) => setFormData({ ...formData, awsRegion: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  >
                    <option value="ap-south-1">ap-south-1 (Mumbai) [Workbook Default]</option>
                    <option value="us-east-1">us-east-1 (N. Virginia)</option>
                    <option value="us-west-2">us-west-2 (Oregon)</option>
                    <option value="eu-west-1">eu-west-1 (Ireland)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Project Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Project Completion Date
                  </label>
                  <input
                    type="date"
                    value={formData.completionDate}
                    onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Student Laptop Public IPv4 (For Security Group /32 Rule)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Check via curl ifconfig.me</span>
                </label>
                <input
                  type="text"
                  value={formData.studentPublicIp}
                  onChange={(e) => setFormData({ ...formData, studentPublicIp: e.target.value })}
                  placeholder="e.g. 49.207.182.45"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Used automatically to formulate ewb-sg-bastion SSH rule: <code>{formData.studentPublicIp || 'YOUR_IP'}/32</code>.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  Save Student Profile
                </button>

                {savedNotice && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium animate-pulse">
                    <CheckCircle2 className="w-4 h-4" /> Profile Updated
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Right info card: Scope & Authoritative Specs */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider text-slate-400 font-mono mb-3">
                Project Topology Parameters
              </h3>
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">VPC A CIDR:</span>
                  <span className="font-mono text-amber-400 font-bold">10.10.0.0/16</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">VPC B CIDR:</span>
                  <span className="font-mono text-amber-400 font-bold">10.20.0.0/16</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Public Subnet:</span>
                  <span className="font-mono text-slate-200">10.10.1.0/24</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Private Subnets:</span>
                  <span className="font-mono text-slate-200">10.10.2.0/24 & 10.20.1.0/24</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Peering Connection:</span>
                  <span className="font-mono text-emerald-400 font-bold">ewb-a-b-peer</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">EC2 AMI:</span>
                  <span className="font-mono text-slate-300">Amazon Linux 2023 (t3.micro)</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-xs font-bold text-white mb-2">Authoritative Rules</h3>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                <li>No NAT Gateway allowed (preserves isolation).</li>
                <li>No Internet Gateway on VPC B.</li>
                <li>App-A and App-B must have NO public IPv4 addresses.</li>
                <li>Do NOT expose port 22 to 0.0.0.0/0.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: AWS Networking Concepts */}
      {activeTab === 'concepts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Concept selector */}
          <div className="space-y-2">
            {Object.entries(educationalConcepts).map(([key, concept]) => (
              <button
                key={key}
                onClick={() => setSelectedConcept(key)}
                className={`w-full text-left p-3 rounded-xl border text-xs transition cursor-pointer ${
                  selectedConcept === key
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                }`}
              >
                <div className="font-bold">{concept.title}</div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">{concept.subtitle}</div>
              </button>
            ))}
          </div>

          {/* Selected Concept Deep Dive */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Core AWS Concept
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                {educationalConcepts[selectedConcept].title}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {educationalConcepts[selectedConcept].subtitle}
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-200 leading-relaxed">
              <h4 className="font-bold text-amber-400 mb-1.5">Architectural Definition</h4>
              <p>{educationalConcepts[selectedConcept].explanation}</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-200 leading-relaxed">
              <h4 className="font-bold text-cyan-400 mb-1.5">Project Implementation in EWB Lab</h4>
              <p>{educationalConcepts[selectedConcept].practicalLabUsage}</p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white mb-2">Essential Engineering Rules:</h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {educationalConcepts[selectedConcept].rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Viva Voce Preparation */}
      {activeTab === 'viva' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">AWS VPC Peering Viva Voce Questions & Model Answers</h2>
              <p className="text-xs text-slate-400">
                10 comprehensive questions covering routing logic, packet flows, security boundaries, and troubleshooting.
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Exam & Interview Ready
            </span>
          </div>

          <div className="space-y-3">
            {defaultVivaQuestions.map((q, idx) => {
              const isOpen = openVivaId === q.id;
              return (
                <div
                  key={q.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenVivaId(isOpen ? null : q.id)}
                    className="w-full text-left p-4 flex items-start justify-between gap-4 hover:bg-slate-850 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-white leading-snug">
                          {q.question}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                            {q.category}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                              q.importance === 'Critical'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {q.importance} Viva Topic
                          </span>
                        </div>
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-amber-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-800/80 bg-slate-950/60 space-y-3">
                      <div className="p-3.5 bg-slate-900/90 rounded-lg border border-slate-800 text-xs text-slate-200 leading-relaxed">
                        <strong className="text-emerald-400 block mb-1">Model Answer:</strong>
                        {q.answer}
                      </div>

                      <div className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/20 text-xs text-amber-300">
                        <strong>Key Takeaway:</strong> {q.explanation}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
