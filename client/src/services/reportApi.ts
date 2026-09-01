import { ApiSuccessResponse } from '../types';
import { ReportRecord, GenerateReportRequest } from '../types/reports';

export class ReportApi {
  public static async generateKundliReport(
    payload: GenerateReportRequest
  ): Promise<ApiSuccessResponse<{ report: ReportRecord }>> {
    const token = localStorage.getItem('astrologer_access_token');
    const res = await fetch('/api/v1/reports/kundli', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return res.json();
  }

  public static async listReports(): Promise<ApiSuccessResponse<{ reports: ReportRecord[]; count: number }>> {
    const token = localStorage.getItem('astrologer_access_token');
    const res = await fetch('/api/v1/reports', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return res.json();
  }

  public static async getReport(id: string): Promise<ApiSuccessResponse<{ report: ReportRecord }>> {
    const token = localStorage.getItem('astrologer_access_token');
    const res = await fetch(`/api/v1/reports/${id}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return res.json();
  }

  public static async downloadReport(id: string, fileName = 'Kundli_Report.pdf'): Promise<void> {
    const token = localStorage.getItem('astrologer_access_token');
    const res = await fetch(`/api/v1/reports/${id}/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Download failed: ${res.statusText}`);
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  public static async deleteReport(id: string): Promise<ApiSuccessResponse<{}>> {
    const token = localStorage.getItem('astrologer_access_token');
    const res = await fetch(`/api/v1/reports/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.json();
  }
}
