import { ApiSuccessResponse } from '../types';
import { AccountDetails } from '../types/account';

export class AccountApi {
  public static async getAccountDetails(): Promise<ApiSuccessResponse<AccountDetails>> {
    const token = localStorage.getItem('astrologer_access_token');
    const res = await fetch('/api/v1/account/me', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return res.json();
  }

  public static async exportData(): Promise<void> {
    const token = localStorage.getItem('astrologer_access_token');
    const res = await fetch('/api/v1/account/export', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to export account data');
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `astrologer_user_data_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  public static async deleteAccount(password: string): Promise<ApiSuccessResponse<{ deleted: boolean }>> {
    const token = localStorage.getItem('astrologer_access_token');
    const res = await fetch('/api/v1/account', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        password,
        confirmationText: 'DELETE',
      }),
    });
    return res.json();
  }
}
