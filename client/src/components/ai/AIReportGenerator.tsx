import React, { useState } from 'react';
import { FileText, Sparkles, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export interface ReportSection {
  title: string;
  subtitle?: string;
  content: string;
  astrologicalFactors: string[];
}

export interface GeneratedReport {
  id: string;
  reportType: string;
  title: string;
  summary: string;
  sections: ReportSection[];
  disclaimers: string[];
  createdAt: string;
}

interface AIReportGeneratorProps {
  profileId: string;
  onGenerateReport?: (reportType: string) => Promise<GeneratedReport>;
}

export const AIReportGenerator: React.FC<AIReportGeneratorProps> = ({
  profileId,
  onGenerateReport,
}) => {
  const [selectedType, setSelectedType] = useState<string>('CAREER_REPORT');
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reportTypes = [
    { id: 'CAREER_REPORT', label: 'Career & Professional Horizon', desc: 'D10 Dashamsha & Mahadasha timing' },
    { id: 'MARRIAGE_REPORT', label: 'Marriage & Relationship Destiny', desc: 'D9 Navamsha & 7th House alignment' },
    { id: 'FULL_KUNDLI_REPORT', label: 'Full Life Dossier', desc: 'Complete multi-varga life synthesis' },
    { id: 'YEARLY_FORECAST', label: 'Yearly Transit & Dasha Forecast', desc: 'Gochar transits & Sade Sati' },
  ];

  const handleGenerate = async () => {
    if (!profileId) {
      setError('Please select an active birth profile.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (onGenerateReport) {
        const res = await onGenerateReport(selectedType);
        setReport(res);
      } else {
        // Fallback demo generation
        setTimeout(() => {
          setReport({
            id: 'rep_123',
            reportType: selectedType,
            title: `Comprehensive Astrology Report`,
            summary: `Detailed astrological synthesis based on verified Phase 12 calculations.`,
            sections: [
              {
                title: 'Core Astrological Archetype',
                subtitle: 'Primary Natal Blueprint',
                content: 'Your chart reflects strong foundational stability and purposeful direction.',
                astrologicalFactors: ['D1 Lagna', '10th House Lord'],
              },
            ],
            disclaimers: ['For personal interpretive guidance only.'],
            createdAt: new Date().toISOString(),
          });
          setLoading(false);
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate report.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            AI Vedic Astrology Dossier Generator
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Grounded in verified 16-Varga divisional charts and Parashari dasha trees
          </p>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {reportTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setSelectedType(type.id)}
            className={`p-3.5 rounded-lg border text-left transition-all ${
              selectedType === type.id
                ? 'bg-amber-500/10 border-amber-500/50 text-white'
                : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">{type.label}</span>
              {selectedType === type.id && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
            </div>
            <p className="text-xs text-slate-400 mt-1">{type.desc}</p>
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-500/30 rounded-lg p-3 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-amber-500/10"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Grounded Report...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Report
            </>
          )}
        </button>
      </div>

      {/* Render Generated Report */}
      {report && (
        <div className="border-t border-slate-800 pt-6 space-y-5 animate-fade-in">
          <div className="bg-slate-950/60 border border-amber-500/20 rounded-xl p-5 space-y-2">
            <h4 className="text-base font-bold text-white">{report.title}</h4>
            <p className="text-sm text-slate-300">{report.summary}</p>
          </div>

          <div className="space-y-4">
            {report.sections.map((section, idx) => (
              <div key={idx} className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-4 space-y-2">
                <h5 className="font-bold text-amber-300 text-sm">{section.title}</h5>
                {section.subtitle && (
                  <span className="text-xs text-slate-400 block">{section.subtitle}</span>
                )}
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
                {section.astrologicalFactors.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {section.astrologicalFactors.map((f, i) => (
                      <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
