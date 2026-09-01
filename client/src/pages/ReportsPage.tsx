import React, { useState, useEffect } from 'react';
import { Download, FileText, Sparkles, CheckCircle2, Shield, Calendar, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { ReportApi } from '../services/reportApi';
import { ApiClient } from '../services/api';
import { ReportRecord } from '../types/reports';
import { BirthProfile } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const ReportsPage: React.FC = () => {
  const [profiles, setProfiles] = useState<BirthProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [profRes, repRes] = await Promise.all([
        ApiClient.getProfiles(),
        ReportApi.listReports(),
      ]);

      if (profRes.success && profRes.data.profiles) {
        setProfiles(profRes.data.profiles);
        if (profRes.data.profiles.length > 0 && !selectedProfileId) {
          const primary = profRes.data.profiles.find((p: BirthProfile) => p.isPrimary);
          setSelectedProfileId(primary ? primary.id : profRes.data.profiles[0].id);
        }
      }

      if (repRes.success && repRes.data.reports) {
        setReports(repRes.data.reports);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateReport = async () => {
    if (!selectedProfileId) return;

    try {
      setGenerating(true);
      setError(null);

      const res = await ReportApi.generateKundliReport({
        profileId: selectedProfileId,
        language,
      });

      if (res.success && res.data.report) {
        setReports((prev) => [res.data.report, ...prev]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate Kundli PDF report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (report: ReportRecord) => {
    try {
      setDownloadingId(report.id);
      await ReportApi.downloadReport(report.id, report.fileName);
    } catch (err: any) {
      setError(err.message || 'Failed to download report');
    } finally {
      setDownloadingId(null);
    }
  };

  const selectedProfile = profiles.find((p: BirthProfile) => p.id === selectedProfileId);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.8rem' }}>📜</span>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Vedic Horoscope & Kundli Reports
            </h1>
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Authoritative, print-ready multi-page PDF dossiers compiled with precision Lahiri Ayanamsa and Parashari principles.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Generator Control Card */}
      <Card style={{ padding: '24px', background: 'rgba(18, 24, 38, 0.75)', border: '1px solid var(--border-gold)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--gold-primary)" />
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Generate New Horoscope Dossier</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Select Birth Profile
              </label>
              <select
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(13, 17, 24, 0.9)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', outline: 'none' }}
              >
                {profiles.map((p: BirthProfile) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.dateOfBirth}) {p.isPrimary ? '★ Primary' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Report Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(13, 17, 24, 0.9)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', outline: 'none' }}
              >
                <option value="en">English (Jyotish Terminology)</option>
                <option value="hi">Hindi (हिन्दी)</option>
              </select>
            </div>
          </div>

          {selectedProfile && (
            <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} color="var(--gold-primary)" />
                <span>{selectedProfile.dateOfBirth} at {selectedProfile.timeOfBirth}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="var(--gold-primary)" />
                <span>{selectedProfile.placeName} ({selectedProfile.latitude.toFixed(2)}°, {selectedProfile.longitude.toFixed(2)}°)</span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <Shield size={14} color="#10B981" />
              <span>Includes D1/D9/D10, 120-Yr Dasha Tree, Panchang, Muhurta & Real-time Transits</span>
            </div>

            <Button
              variant="gold"
              onClick={handleGenerateReport}
              disabled={generating || !selectedProfileId}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {generating ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Compiling Vector PDF...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Generate Report PDF</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Generated Reports List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-primary)' }}>Your Generated Reports</h2>
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span style={{ marginLeft: '6px' }}>Refresh</span>
          </Button>
        </div>

        {reports.length === 0 ? (
          <Card style={{ padding: '48px 24px', textAlign: 'center', background: 'rgba(18, 24, 38, 0.4)' }}>
            <FileText size={48} color="var(--gold-primary)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ margin: '0 0 8px', color: 'var(--text-primary)' }}>No Reports Generated Yet</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Select a birth profile above and click "Generate Report PDF" to create your first authoritative horoscope dossier.
            </p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reports.map((report) => (
              <Card
                key={report.id}
                style={{ padding: '16px 20px', background: 'rgba(18, 24, 38, 0.6)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(200, 157, 60, 0.1)', border: '1px solid rgba(200, 157, 60, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} color="var(--gold-primary)" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>{report.title}</h4>
                      <Badge variant="gold">
                        {report.language.toUpperCase()}
                      </Badge>
                      <Badge variant="success">
                        <CheckCircle2 size={12} style={{ marginRight: '4px' }} />
                        Ready
                      </Badge>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '12px' }}>
                      <span>Size: {((report.fileSize || 0) / 1024).toFixed(1)} KB</span>
                      <span>•</span>
                      <span>Generated: {report.generatedAt ? new Date(report.generatedAt).toLocaleString() : '—'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Button
                    variant="gold"
                    onClick={() => handleDownload(report)}
                    disabled={downloadingId === report.id}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={14} />
                    <span>{downloadingId === report.id ? 'Downloading...' : 'Download PDF'}</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default ReportsPage;
