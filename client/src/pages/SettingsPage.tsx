import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Shield,
  Bell,
  Download,
  Trash2,
  Lock,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Brain,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { AccountApi } from '../services/accountApi';
import { NotificationApi } from '../services/notificationApi';
import { memoryApi } from '../services/memoryApi';
import { AIMemoryItem } from '../types/memory';
import { AccountDetails } from '../types/account';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const SettingsPage: React.FC = () => {
  const { user, logout, updatePassword } = useAuth();
  const { subscription, isPremium } = useSubscription();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'subscription' | 'memory' | 'privacy'>('profile');
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null);
  const [memories, setMemories] = useState<AIMemoryItem[]>([]);
  const [memoryLoading, setMemoryLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [personalizationSettings, setPersonalizationSettings] = useState<{
    astrologyTerminology: 'standard' | 'sanskrit' | 'simplified';
    responseStyle: 'concise' | 'balanced' | 'detailed';
    languagePreference: string;
  }>({
    astrologyTerminology: 'standard',
    responseStyle: 'balanced',
    languagePreference: 'English',
  });

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Deletion Modal State
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>('');
  const [deletePassword, setDeletePassword] = useState<string>('');

  const handleSavePersonalization = async () => {
    setActionLoading(true);
    try {
      const { PersonalizationApi } = await import('../services/personalizationApi');
      await PersonalizationApi.updateSettings(personalizationSettings);
      setMessage({ type: 'success', text: 'AI Consultation preferences saved successfully' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save preferences' });
    } finally {
      setActionLoading(false);
    }
  };

  const loadAccount = async () => {
    setLoading(true);
    try {
      const res = await AccountApi.getAccountDetails();
      if (res.success && res.data) {
        setAccountDetails(res.data);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to load account settings' });
    } finally {
      setLoading(false);
    }
  };

  const loadMemories = async () => {
    setMemoryLoading(true);
    try {
      const list = await memoryApi.getMemories();
      setMemories(list);
    } catch {
      // ignore
    } finally {
      setMemoryLoading(false);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      await memoryApi.deleteMemory(id);
      setMemories((prev) => prev.filter((m) => m.id !== id));
      setMessage({ type: 'success', text: 'AI memory preference removed' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to remove memory' });
    }
  };

  const handleClearAllMemories = async () => {
    try {
      await memoryApi.clearAllMemories();
      setMemories([]);
      setMessage({ type: 'success', text: 'All AI memory preferences cleared' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to clear memories' });
    }
  };

  useEffect(() => {
    loadAccount();
    loadMemories();
  }, []);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      return;
    }

    setActionLoading(true);
    setMessage(null);
    try {
      await updatePassword({ currentPassword, newPassword });
      setMessage({ type: 'success', text: 'Password updated successfully' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update password' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportData = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      await AccountApi.exportData();
      setMessage({ type: 'success', text: 'Data export downloaded successfully' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to export data' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setMessage({ type: 'error', text: 'Please type DELETE to confirm' });
      return;
    }

    setActionLoading(true);
    setMessage(null);
    try {
      await AccountApi.deleteAccount(deletePassword);
      await logout();
      navigate('/login');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete account' });
      setActionLoading(false);
    }
  };

  const handleTogglePreference = async (key: string, currentValue: boolean) => {
    try {
      await NotificationApi.updatePreferences({ [key]: !currentValue });
      if (accountDetails) {
        setAccountDetails({
          ...accountDetails,
          preferences: {
            ...accountDetails.preferences,
            [key]: !currentValue,
          },
        });
      }
      setMessage({ type: 'success', text: 'Preferences updated' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update preferences' });
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '80px 16px', textAlign: 'center' }}>
        <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 16px', color: 'var(--accent-gold)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading account settings...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ margin: '0 0 6px', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Account Settings
        </h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Manage your personal profile, security credentials, notification preferences, and privacy controls.
        </p>
      </div>

      {message && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: message.type === 'success' ? '#86EFAC' : '#FCA5A5',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem',
          }}
        >
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Navigation Sidebar */}
        <Card style={{ padding: '12px', background: 'rgba(18, 24, 38, 0.6)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'profile' ? 'rgba(200, 157, 60, 0.15)' : 'transparent',
                color: activeTab === 'profile' ? 'var(--gold-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'profile' ? 700 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <UserIcon size={16} /> Profile & Overview
            </button>

            <button
              onClick={() => setActiveTab('security')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'security' ? 'rgba(200, 157, 60, 0.15)' : 'transparent',
                color: activeTab === 'security' ? 'var(--gold-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'security' ? 700 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <Lock size={16} /> Security & Password
            </button>

            <button
              onClick={() => setActiveTab('preferences')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'preferences' ? 'rgba(200, 157, 60, 0.15)' : 'transparent',
                color: activeTab === 'preferences' ? 'var(--gold-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'preferences' ? 700 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <Bell size={16} /> Notifications & Alerts
            </button>

            <button
              onClick={() => setActiveTab('subscription')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'subscription' ? 'rgba(200, 157, 60, 0.15)' : 'transparent',
                color: activeTab === 'subscription' ? 'var(--gold-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'subscription' ? 700 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <Zap size={16} /> Subscription Plan
            </button>

            <button
              onClick={() => setActiveTab('memory')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'memory' ? 'rgba(147, 51, 234, 0.15)' : 'transparent',
                color: activeTab === 'memory' ? '#C084FC' : 'var(--text-secondary)',
                fontWeight: activeTab === 'memory' ? 700 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <Brain size={16} /> AI Memory & Preferences
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'privacy' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                color: activeTab === 'privacy' ? '#FCA5A5' : 'var(--text-secondary)',
                fontWeight: activeTab === 'privacy' ? 700 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <Shield size={16} /> Privacy & Data Export
            </button>
          </div>
        </Card>

        {/* Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {activeTab === 'profile' && (
            <Card style={{ padding: '24px', background: 'rgba(18, 24, 38, 0.75)', border: '1px solid var(--border-gold)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Profile Overview</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Full Name</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Email Address</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.email}</div>
                </div>

                <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Account Role</div>
                  <Badge variant={user?.role === 'admin' ? 'gold' : 'indigo'}>
                    {user?.role?.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Resource Summary</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(200, 157, 60, 0.05)', border: '1px solid rgba(200, 157, 60, 0.2)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold-primary)' }}>{accountDetails?.stats?.profileCount || 0}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Birth Profiles</div>
                </div>

                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(200, 157, 60, 0.05)', border: '1px solid rgba(200, 157, 60, 0.2)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold-primary)' }}>{accountDetails?.stats?.sessionCount || 0}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI Chat Sessions</div>
                </div>

                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(200, 157, 60, 0.05)', border: '1px solid rgba(200, 157, 60, 0.2)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold-primary)' }}>{accountDetails?.stats?.reportCount || 0}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PDF Reports</div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card style={{ padding: '24px', background: 'rgba(18, 24, 38, 0.75)', border: '1px solid var(--border-gold)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Update Password</h3>
              <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '420px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(13, 17, 24, 0.9)', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>New Password (min 8 chars)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(13, 17, 24, 0.9)', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(13, 17, 24, 0.9)', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                  />
                </div>

                <Button variant="gold" type="submit" disabled={actionLoading} style={{ marginTop: '8px' }}>
                  {actionLoading ? 'Updating Password...' : 'Save New Password'}
                </Button>
              </form>
            </Card>
          )}

          {activeTab === 'preferences' && (
            <Card style={{ padding: '24px', background: 'rgba(18, 24, 38, 0.75)', border: '1px solid var(--border-gold)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Notification Channels</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>In-App Notifications</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Display badge indicators and notification drawer</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={accountDetails?.preferences?.inAppEnabled ?? true}
                    onChange={() => handleTogglePreference('inAppEnabled', accountDetails?.preferences?.inAppEnabled ?? true)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Daily Vedic Insight Digests</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Receive morning astrological alignment digests</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={accountDetails?.preferences?.dailyInsight ?? true}
                    onChange={() => handleTogglePreference('dailyInsight', accountDetails?.preferences?.dailyInsight ?? true)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Major Transit & Gochar Alerts</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Notifications for Jupiter/Saturn sign ingresses and Sade Sati milestones</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={accountDetails?.preferences?.transitEvents ?? true}
                    onChange={() => handleTogglePreference('transitEvents', accountDetails?.preferences?.transitEvents ?? true)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'subscription' && (
            <Card style={{ padding: '24px', background: 'rgba(18, 24, 38, 0.75)', border: '1px solid var(--border-gold)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Subscription Status</h3>
                <Badge variant={isPremium ? 'gold' : 'indigo'}>
                  {subscription ? subscription.plan.toUpperCase() : 'FREE'}
                </Badge>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                {isPremium
                  ? 'Your Cosmic Premium membership is currently active with full access to multi-decade Life Curves, vector PDF reports, and priority AI consultation.'
                  : 'You are currently on the Cosmic Free tier with standard chart calculations and daily quotas.'}
              </p>

              <Button variant="gold" onClick={() => navigate('/subscription')}>
                <Sparkles size={16} style={{ marginRight: '6px' }} />
                <span>{isPremium ? 'Manage Billing & Invoices' : 'Upgrade to Cosmic Premium'}</span>
              </Button>
            </Card>
          )}

          {activeTab === 'memory' && (
            <Card style={{ padding: '24px', background: 'rgba(18, 24, 38, 0.75)', border: '1px solid var(--border-gold)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Personalized AI Memory</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Your AI Astrologer remembers your preferences and consultation context to deliver tailored Jyotish guidance.
                  </p>
                </div>
                {memories.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllMemories}
                    style={{ color: '#FCA5A5', borderColor: 'rgba(239, 68, 68, 0.3)', fontSize: '0.8rem' }}
                  >
                    Clear All Memory
                  </Button>
                )}
              </div>

              {memoryLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <Loader2 className="animate-spin" size={24} />
                </div>
              ) : memories.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed var(--border-subtle)' }}>
                  <Brain size={32} style={{ margin: '0 auto 12px', color: 'var(--text-muted)', opacity: 0.5 }} />
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    No AI memories recorded yet. As you consult with the AI Astrologer, key preferences and topics will automatically appear here.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {memories.map((mem) => (
                    <div
                      key={mem.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              background: 'rgba(147, 51, 234, 0.1)',
                              border: '1px solid rgba(147, 51, 234, 0.2)',
                              color: '#C084FC',
                              fontWeight: 600,
                            }}
                          >
                            {mem.category.replace('_', ' ')}
                          </span>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{mem.key}</strong>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{mem.value}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteMemory(mem.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '4px',
                        }}
                        title="Forget this memory"
                        aria-label="Forget this memory"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {activeTab === 'privacy' && (
            <Card style={{ padding: '24px', background: 'rgba(18, 24, 38, 0.75)', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Privacy & Data Governance</h3>

              {/* AI Personalization Preferences */}
              <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 8px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="var(--gold-primary)" /> AI Consultation Preferences
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginTop: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Astrology Terminology</label>
                    <select
                      value={personalizationSettings.astrologyTerminology}
                      onChange={(e) => setPersonalizationSettings({ ...personalizationSettings, astrologyTerminology: e.target.value as any })}
                      className="input-field"
                      style={{ width: '100%', padding: '8px', background: '#07090E', color: '#FFF', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}
                    >
                      <option value="standard">Standard (English & Vedic)</option>
                      <option value="sanskrit">Traditional Sanskrit (Jyotish Shastra)</option>
                      <option value="simplified">Simplified / Beginner Friendly</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>AI Response Style</label>
                    <select
                      value={personalizationSettings.responseStyle}
                      onChange={(e) => setPersonalizationSettings({ ...personalizationSettings, responseStyle: e.target.value as any })}
                      className="input-field"
                      style={{ width: '100%', padding: '8px', background: '#07090E', color: '#FFF', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}
                    >
                      <option value="concise">Concise & Direct (Action-oriented)</option>
                      <option value="balanced">Balanced (Astrological + Practical)</option>
                      <option value="detailed">In-Depth Philosophical Analysis</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Consultation Language</label>
                    <select
                      value={personalizationSettings.languagePreference}
                      onChange={(e) => setPersonalizationSettings({ ...personalizationSettings, languagePreference: e.target.value })}
                      className="input-field"
                      style={{ width: '100%', padding: '8px', background: '#07090E', color: '#FFF', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi (हिंदी)</option>
                      <option value="Sanskrit">Sanskrit (संस्कृत)</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="gold" size="sm" onClick={handleSavePersonalization} disabled={actionLoading}>
                    Save AI Preferences
                  </Button>
                </div>
              </div>

              {/* Data Export */}
              <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 6px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Download size={16} color="var(--gold-primary)" /> Export Account Data
                </h4>
                <p style={{ margin: '0 0 14px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Download a complete, machine-readable JSON copy of your birth profiles, chat transcripts, reports metadata, and billing records.
                </p>
                <Button variant="outline" onClick={handleExportData} disabled={actionLoading}>
                  {actionLoading ? 'Exporting...' : 'Download JSON Export'}
                </Button>
              </div>

              {/* Account Deletion */}
              <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <h4 style={{ margin: '0 0 6px', color: '#FCA5A5', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Trash2 size={16} /> Danger Zone: Delete Account
                </h4>
                <p style={{ margin: '0 0 14px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Permanently deletes your account, birth profiles, chat consultations, and saved PDF files. This action cannot be undone.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(true)}
                  style={{ color: '#FCA5A5', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                >
                  Request Account Deletion
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <Card style={{ maxWidth: '440px', width: '100%', padding: '24px', background: '#0D1118', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
            <h3 style={{ margin: '0 0 10px', color: '#FCA5A5', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} /> Permanently Delete Account?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
              All your birth profiles, chat histories, and PDF files will be permanently purged. Type <strong>DELETE</strong> to confirm.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <input
                type="text"
                placeholder='Type "DELETE"'
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-subtle)', color: '#FFF' }}
              />

              <input
                type="password"
                placeholder="Confirm password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-subtle)', color: '#FFF' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button
                variant="gold"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || actionLoading}
                style={{ background: '#EF4444', color: '#FFF' }}
              >
                {actionLoading ? 'Deleting...' : 'Permanently Delete'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
export default SettingsPage;
