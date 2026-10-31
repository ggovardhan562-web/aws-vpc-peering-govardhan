import React, { useState } from 'react';
import { useLab } from '../../context/LabContext';
import { SecurityBanner } from '../common/SecurityBanner';
import { EvidenceCategory, EvidenceItem } from '../../types/lab';
import {
  Camera,
  Upload,
  Trash2,
  Eye,
  Filter,
  Plus,
  AlertCircle,
  CheckCircle2,
  X,
  FileImage,
  ExternalLink,
} from 'lucide-react';

const ALL_CATEGORIES: EvidenceCategory[] = [
  'Architecture',
  'VPC',
  'Subnets',
  'Route tables',
  'Security groups',
  'EC2',
  'Peering',
  'Connectivity',
  'SSH',
  'Controlled failure',
  'Recovery',
  'Cleanup',
];

export const EvidencePage: React.FC = () => {
  const { evidence, addEvidence, deleteEvidence, setActivePage } = useLab();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [previewItem, setPreviewItem] = useState<EvidenceItem | null>(null);

  // New evidence form state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadCategory, setUploadCategory] = useState<EvidenceCategory>('Connectivity');
  const [uploadStage, setUploadStage] = useState('Stage 10');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDataUrl, setUploadDataUrl] = useState<string | null>(null);

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadDataUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle || !uploadDataUrl) {
      alert('Please provide a title and select a screenshot file.');
      return;
    }

    addEvidence({
      title: uploadTitle,
      description: uploadDesc,
      category: uploadCategory,
      stageId: uploadStage,
      dataUrl: uploadDataUrl,
      fileName: uploadFile?.name || 'screenshot.png',
      fileSize: uploadFile ? `${Math.round(uploadFile.size / 1024)} KB` : '250 KB',
    });

    // Reset form
    setShowUploadModal(false);
    setUploadTitle('');
    setUploadDesc('');
    setUploadFile(null);
    setUploadDataUrl(null);
  };

  // Find which categories are missing
  const missingCategories = ALL_CATEGORIES.filter(
    (cat) => !evidence.some((e) => e.category === cat)
  );

  const filteredEvidence = evidence.filter((e) => {
    return filterCategory === 'all' || e.category === filterCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SecurityBanner />

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold">
              Stage 10 Project Evidence
            </span>
            <span className="text-xs font-mono text-slate-400">
              {evidence.length} Artifacts Collected
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Screenshot & Verification Artifacts Management
          </h1>
          <p className="text-xs text-slate-400">
            Upload and organize authentic AWS Management Console and terminal verification screenshots for your final project report.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Screenshot</span>
        </button>
      </div>

      {/* Missing Evidence Audit Banner */}
      {missingCategories.length > 0 ? (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 text-xs text-amber-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <AlertCircle className="w-4 h-4" />
              <span>Evidence Completeness Audit: {missingCategories.length} Recommended Categories Pending</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Affects Final Report Score
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {missingCategories.map((cat) => (
              <span
                key={cat}
                className="text-[10px] font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300"
              >
                Missing: {cat}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 text-xs text-emerald-300 flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Outstanding! All required project evidence categories have verified screenshot attachments.</span>
        </div>
      )}

      {/* Filter Category Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400 font-mono">Category:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories ({evidence.length})</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat} ({evidence.filter((e) => e.category === cat).length})
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-mono text-slate-400">
          Showing {filteredEvidence.length} screenshots
        </span>
      </div>

      {/* Evidence Gallery Grid */}
      {filteredEvidence.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Camera className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Evidence Uploaded in this Category</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Take screenshots of your AWS console or terminal outputs and click "Upload Screenshot" to record them.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" /> Upload Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvidence.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden shadow-lg transition-all flex flex-col justify-between group"
            >
              {/* Image Preview Thumbnail */}
              <div
                onClick={() => setPreviewItem(item)}
                className="relative h-44 bg-slate-950 border-b border-slate-800 cursor-pointer overflow-hidden flex items-center justify-center"
              >
                <img
                  src={item.dataUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-slate-900/90 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700">
                    <Eye className="w-3.5 h-3.5" /> View Full
                  </span>
                </div>
                <span className="absolute top-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/80 text-amber-400 border border-slate-800">
                  {item.category}
                </span>
              </div>

              {/* Card Meta & Actions */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white line-clamp-1">{item.title}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {item.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{item.fileSize}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="text-slate-300 hover:text-white cursor-pointer"
                      title="Preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteEvidence(item.id)}
                      className="text-slate-400 hover:text-red-400 cursor-pointer"
                      title="Delete evidence"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                Upload Project Verification Screenshot
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Artifact Title <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. AWS Console Peering Active Status"
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as EvidenceCategory)}
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-lg text-white font-mono"
                  >
                    {ALL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Project Stage</label>
                  <input
                    type="text"
                    value={uploadStage}
                    onChange={(e) => setUploadStage(e.target.value)}
                    placeholder="e.g. Stage 8"
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Screenshot File</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleFileChange}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-lg text-slate-300 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-750 cursor-pointer"
                />
              </div>

              {uploadDataUrl && (
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 max-h-36 overflow-hidden flex items-center justify-center">
                  <img src={uploadDataUrl} alt="Preview" className="max-h-32 object-contain rounded" />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder="Explain what this screenshot demonstrates in your AWS configuration..."
                  className="w-full bg-slate-950 border border-slate-700 p-2.5 rounded-lg text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  Save to Evidence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                  {previewItem.category} • {previewItem.stageId}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{previewItem.title}</h3>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 rounded-xl p-2 border border-slate-800 flex items-center justify-center overflow-hidden">
              <img
                src={previewItem.dataUrl}
                alt={previewItem.title}
                className="max-h-[55vh] object-contain rounded"
              />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
              {previewItem.description || 'No description recorded.'}
            </p>

            <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-2">
              <span>File: {previewItem.fileName} ({previewItem.fileSize})</span>
              <span>Uploaded: {previewItem.uploadedAt}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
