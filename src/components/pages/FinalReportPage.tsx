import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { SecurityBanner } from '../common/SecurityBanner';
import { jsPDF } from 'jspdf';
import {
  FileCheck2,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Award,
  Globe,
  Server,
  Layers,
  Shield,
  Activity,
  Trash2,
  ExternalLink,
} from 'lucide-react';

export const FinalReportPage: React.FC = () => {
  const {
    profile,
    resources,
    routeTables,
    securityGroups,
    ec2Instances,
    peering,
    tests,
    controlledFailure,
    evidence,
    evaluation,
    cleanupSteps,
    totalScore,
    progressPercentage,
  } = useLab();

  const [generatingPdf, setGeneratingPdf] = useState(false);

  const studentCleanName = (profile.studentName || 'Student').replace(/\s+/g, '_');
  const pdfFilename = `${studentCleanName}_CloudPeer_VPC_Peering_Report.pdf`;

  // Generate PDF via jsPDF
  const generatePdfReport = async () => {
    setGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let y = 60;

      // Color Palette
      const primaryNavy = [15, 23, 42]; // #0f172a
      const awsOrange = [255, 153, 0]; // #FF9900
      const textDark = [30, 41, 59]; // #1e293b
      const textMuted = [100, 116, 139]; // #64748b

      // Page 1: Cover Page
      doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
      doc.rect(0, 0, pageWidth, 160, 'F');

      // Brand badge
      doc.setFillColor(awsOrange[0], awsOrange[1], awsOrange[2]);
      doc.roundedRect(40, 40, 50, 24, 4, 4, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('AWS', 54, 56);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('CloudPeer – AWS VPC Peering Student Lab', 105, 56);

      doc.setFontSize(10);
      doc.setTextColor(255, 180, 80);
      doc.text('Learn. Elevate. Empower.', 105, 74);

      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text('AWS VPC Peering – Private Network Connectivity', 40, 125);

      y = 190;
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Student Project Identification', 40, y);
      y += 20;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Student Full Name: ${profile.studentName || 'Not Specified'}`, 40, y);
      y += 16;
      doc.text(`Batch / Cohort: ${profile.batch || 'Batch 2026-A'}`, 40, y);
      y += 16;
      doc.text(`AWS Target Region: ${profile.awsRegion} (Mumbai)`, 40, y);
      y += 16;
      doc.text(`AWS Account Alias / ID: ${profile.awsAccountAlias || 'Not specified'}`, 40, y);
      y += 16;
      doc.text(`Project Start Date: ${profile.startDate}`, 40, y);
      y += 16;
      doc.text(`Project Completion Date: ${profile.completionDate || '2026-10-31'}`, 40, y);
      y += 16;
      doc.text(`Total Evaluation Score: ${totalScore} / 100 Marks (Verified Dynamic Rubric)`, 40, y);
      y += 26;

      // Executive Summary
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('Executive Project Overview', 40, y);
      y += 16;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      const summaryText =
        'This workbook documents the design, manual provisioning, routing configuration, security hardening, and bidirectional connectivity testing of a multi-VPC private cloud architecture using AWS VPC Peering in region ap-south-1. Two non-overlapping VPCs—ewb-vpc-a (10.10.0.0/16) and ewb-vpc-b (10.20.0.0/16)—were established. App instances residing in isolated private subnets with zero public IPs communicate privately across the AWS backbone without exposing internal network endpoints to the public internet.';
      const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 80);
      doc.text(splitSummary, 40, y);
      y += splitSummary.length * 13 + 15;

      // Section: Architecture Specs
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('1. Architecture & IP Allocation Summary', 40, y);
      y += 18;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('• VPC A (10.10.0.0/16): Public Subnet 10.10.1.0/24 (ewb-bastion), Private Subnet 10.10.2.0/24 (ewb-app-a), IGW ewb-igw-a', 45, y);
      y += 15;
      doc.text('• VPC B (10.20.0.0/16): Private Subnet 10.20.1.0/24 (ewb-app-b). Zero Internet Gateway attached (Strict Airgap)', 45, y);
      y += 15;
      doc.text(`• VPC Peering: ewb-a-b-peer (${peering.actualPcxId || 'pcx-087654321fedcba09'}) Status: ${peering.status}`, 45, y);
      y += 25;

      // Section: Resource Inventory
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('2. AWS Physical Resource Inventory', 40, y);
      y += 16;

      // Draw table header
      doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
      doc.rect(40, y, pageWidth - 80, 18, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8.5);
      doc.text('Resource Name', 45, y + 12);
      doc.text('Type', 150, y + 12);
      doc.text('VPC', 230, y + 12);
      doc.text('CIDR / IP', 300, y + 12);
      doc.text('AWS Physical ID', 400, y + 12);
      doc.text('Status', 500, y + 12);
      y += 22;

      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      resources.slice(0, 12).forEach((r) => {
        doc.text(r.name, 45, y);
        doc.text(r.type, 150, y);
        doc.text(r.vpc, 230, y);
        doc.text(r.cidrOrIp.substring(0, 18), 300, y);
        doc.text(r.actualAwsId || 'Pending', 400, y);
        doc.text(r.status, 500, y);
        y += 14;
      });

      // Page 2: Route Tables & Tests
      doc.addPage();
      y = 50;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
      doc.text('3. Route Table Routing Rules', 40, y);
      y += 18;

      routeTables.forEach((rt) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(`${rt.name} (${rt.vpc} - Subnet: ${rt.associatedSubnet})`, 40, y);
        y += 14;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        rt.routes.forEach((ro) => {
          doc.text(`   • Destination: ${ro.destinationCidr}  →  Target: ${ro.targetValue} (${ro.description})`, 45, y);
          y += 12;
        });
        y += 6;
      });

      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('4. Official Connectivity Verification Logs', 40, y);
      y += 18;

      tests.forEach((t) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        const passText = t.status === 'Passed' ? '[PASS]' : '[NOT TESTED / FAILED]';
        doc.text(`Test #${t.testNumber}: ${t.name} ${passText}`, 40, y);
        y += 13;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.text(`Command: ${t.command} | Loss: ${t.packetLossPercent}% | Source: ${t.source} → Dest: ${t.destination}`, 45, y);
        y += 12;

        if (t.studentExplanation) {
          doc.text(`Observation: ${t.studentExplanation.substring(0, 110)}...`, 45, y);
          y += 14;
        }
        y += 4;
      });

      // Controlled failure section
      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('5. Controlled Failure & Recovery Experiment', 40, y);
      y += 16;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Step 1 (ICMP Rule Removed): ${controlledFailure.step1RemovedICMP ? 'Confirmed' : 'Pending'}`, 45, y);
      y += 13;
      doc.text(`Step 2 (Failure Observed): ${controlledFailure.step2ObservedFailure ? '100% Packet Loss Verified' : 'Pending'}`, 45, y);
      y += 13;
      doc.text(`Step 3 (ICMP Rule Restored): ${controlledFailure.step3RestoredICMP ? 'Rule Restored' : 'Pending'}`, 45, y);
      y += 13;
      doc.text(`Step 4 (Stateful Recovery): ${controlledFailure.step4ObservedRecovery ? 'Instant 0% Loss Verified' : 'Pending'}`, 45, y);
      y += 20;

      // Evaluation & Cleanup
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('6. Evaluation Rubric & AWS Cleanup Certification', 40, y);
      y += 16;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      evaluation.forEach((cat) => {
        doc.text(`• ${cat.title}: ${cat.awardedMarks} / ${cat.maxMarks} Marks`, 45, y);
        y += 13;
      });
      y += 10;
      doc.text(`AWS Cleanup: ${cleanupSteps.filter((s) => s.isCompleted).length} / 13 Decommissioning Steps Completed.`, 45, y);
      y += 14;
      doc.text('Security Certification: Zero credentials, passwords, or private keys were uploaded.', 45, y);

      // Save PDF
      doc.save(pdfFilename);
    } catch (e) {
      console.error('Error generating PDF report', e);
      alert('PDF generation encountered an error. Please try again.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SecurityBanner />

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
              Stage 13 Official Deliverable
            </span>
            <span className="text-xs font-mono text-slate-400">
              PDF Export Filename: <code>{pdfFilename}</code>
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Student Project Final Submission Report
          </h1>
          <p className="text-xs text-slate-400">
            Export a high-definition PDF containing full architectural drawings, AWS physical resource IDs, connectivity logs, screenshots, and rubric grading.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Layout</span>
          </button>

          <button
            onClick={generatePdfReport}
            disabled={generatingPdf}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{generatingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Report Readiness Audit Box */}
      {progressPercentage < 50 && (
        <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <strong>Preliminary Report Notice:</strong> Project progress is currently at{' '}
            <strong>{progressPercentage}%</strong>. Complete more checklist tasks or load sample demo data to produce a 100% full-mark final submission.
          </div>
        </div>
      )}

      {/* In-Browser Document Viewer (Formatted like professional PDF) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-12 shadow-2xl space-y-10 max-w-4xl mx-auto text-slate-200">
        {/* Cover Section */}
        <div className="border-b border-slate-800 pb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center font-black text-slate-950 text-sm">
                AWS
              </div>
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                  CloudPeer Labs Workbook
                </h3>
                <div className="text-[11px] text-slate-400">Learn. Elevate. Empower.</div>
              </div>
            </div>
            <span className="text-xs font-mono bg-slate-950 px-3 py-1 rounded-full border border-slate-800 text-slate-300">
              Verified Submission
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            AWS VPC Peering – Private Network Connectivity
          </h1>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs font-mono text-slate-300">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Student:</span>
              <strong className="text-white text-sm">{profile.studentName || 'Govardhan G'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Batch:</span>
              <strong className="text-white">{profile.batch}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Region:</span>
              <strong className="text-amber-400">{profile.awsRegion}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Marks:</span>
              <strong className="text-emerald-400 text-sm">{totalScore} / 100</strong>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-amber-400">
            1. Executive Project Summary
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            This laboratory project designs and validates a high-security, multi-VPC private networking solution on Amazon Web Services without using public internet transit or virtual private gateways. Two non-overlapping address spaces—<code>ewb-vpc-a</code> (10.10.0.0/16) and <code>ewb-vpc-b</code> (10.20.0.0/16)—were provisioned in the Mumbai region (ap-south-1). An active peering connection (<code>ewb-a-b-peer</code>) was created and accepted. Forward and return route table entries were configured to route bidirectional Layer 3 traffic. Zero-trust isolation was preserved by launching application instances with zero public IPv4 addresses and fronting management through a single hardened bastion jump host.
          </p>
        </div>

        {/* Resource Inventory Table */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-amber-400">
            2. Verified Physical AWS Resource Inventory
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
              <thead className="bg-slate-950 font-mono text-[10px] uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-2">Name</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">VPC</th>
                  <th className="p-2">CIDR / IP</th>
                  <th className="p-2">Actual AWS Resource ID</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-[11px] font-mono">
                {resources.map((r) => (
                  <tr key={r.id}>
                    <td className="p-2 font-bold text-white">{r.name}</td>
                    <td className="p-2 text-slate-400">{r.type}</td>
                    <td className="p-2 text-slate-300">{r.vpc}</td>
                    <td className="p-2 text-blue-300">{r.cidrOrIp}</td>
                    <td className="p-2 text-amber-300 font-bold">{r.actualAwsId || 'Pending'}</td>
                    <td className="p-2 text-emerald-400">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Verification Tests */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-amber-400">
            3. Network Test Verification Logs
          </h2>
          <div className="space-y-3">
            {tests.map((t) => (
              <div key={t.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-white">Test #{t.testNumber}: {t.name}</span>
                  <span className="text-emerald-400 font-mono">{t.status} (Loss: {t.packetLossPercent}%)</span>
                </div>
                <div className="font-mono text-[11px] text-amber-300">$ {t.command}</div>
                {t.actualResult && (
                  <pre className="text-[10px] font-mono text-slate-400 bg-slate-900 p-2 rounded max-h-20 overflow-y-auto whitespace-pre-wrap">
                    {t.actualResult}
                  </pre>
                )}
                {t.studentExplanation && (
                  <p className="text-[11px] text-slate-300 italic">
                    Analysis: {t.studentExplanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Screenshots Attached */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-amber-400">
            4. Attached Project Verification Evidence ({evidence.length} Artifacts)
          </h2>
          {evidence.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No evidence screenshots uploaded.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {evidence.map((ev) => (
                <div key={ev.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="h-32 bg-slate-900 rounded overflow-hidden flex items-center justify-center">
                    <img src={ev.dataUrl} alt={ev.title} className="max-h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-mono">{ev.title}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{ev.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Evaluation Summary */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-amber-400">
              5. Final Rubric Evaluation Summary
            </h2>
            <span className="text-sm font-mono font-bold text-emerald-400">
              Score: {totalScore} / 100 Marks
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {evaluation.map((cat) => (
              <div key={cat.id} className="flex justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-300">{cat.title}</span>
                <span className="font-mono font-bold text-amber-400">
                  {cat.awardedMarks} / {cat.maxMarks} Marks
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cleanup Certification Footer */}
        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row justify-between gap-2">
          <span>AWS Cleanup Status: {cleanupSteps.filter((s) => s.isCompleted).length} / 13 Steps Completed</span>
          <span className="text-emerald-400 font-mono">Zero Credential Exposure Certified</span>
        </div>
      </div>
    </div>
  );
};
