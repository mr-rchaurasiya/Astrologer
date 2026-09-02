import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Calendar, Clock, MapPin, Globe, Shield, Plus, Star, Trash2, Edit3, CheckCircle2, AlertCircle, Loader2, Compass } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ApiClient } from '../services/api';
import { BirthProfile, RelationshipType, GenderType } from '../types';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<BirthProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingProfile, setEditingProfile] = useState<BirthProfile | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    relationship: RelationshipType;
    dateOfBirth: string;
    timeOfBirth: string;
    placeName: string;
    latitude: number;
    longitude: number;
    timezone: string;
    timezoneOffset: number;
    gender: GenderType;
    isPrimary: boolean;
  }>({
    name: '',
    relationship: 'self',
    dateOfBirth: '1995-05-15',
    timeOfBirth: '08:30:00',
    placeName: 'Ujjain, Madhya Pradesh, India',
    latitude: 23.1765,
    longitude: 75.7885,
    timezone: 'Asia/Kolkata',
    timezoneOffset: 5.5,
    gender: 'male',
    isPrimary: false,
  });

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiClient.getProfiles();
      if (res.success && res.data) {
        setProfiles(res.data.profiles);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load birth profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleOpenAdd = () => {
    setEditingProfile(null);
    setFormData({
      name: user?.name || '',
      relationship: profiles.length === 0 ? 'self' : 'partner',
      dateOfBirth: '1995-05-15',
      timeOfBirth: '08:30:00',
      placeName: 'Ujjain, Madhya Pradesh, India',
      latitude: 23.1765,
      longitude: 75.7885,
      timezone: 'Asia/Kolkata',
      timezoneOffset: 5.5,
      gender: 'male',
      isPrimary: profiles.length === 0,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (profile: BirthProfile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      relationship: profile.relationship,
      dateOfBirth: profile.dateOfBirth,
      timeOfBirth: profile.timeOfBirth,
      placeName: profile.placeName,
      latitude: profile.latitude,
      longitude: profile.longitude,
      timezone: profile.timezone,
      timezoneOffset: profile.timezoneOffset,
      gender: profile.gender,
      isPrimary: profile.isPrimary,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingProfile) {
        await ApiClient.updateProfile(editingProfile.id, formData);
      } else {
        await ApiClient.createProfile(formData);
      }
      setShowModal(false);
      await fetchProfiles();
    } catch (err: any) {
      setError(err.message || 'Failed to save birth profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this birth profile?')) return;
    try {
      await ApiClient.deleteProfile(id);
      await fetchProfiles();
    } catch (err: any) {
      setError(err.message || 'Failed to delete profile');
    }
  };

  const handleSetPrimary = async (profile: BirthProfile) => {
    try {
      await ApiClient.updateProfile(profile.id, { isPrimary: true });
      await fetchProfiles();
    } catch (err: any) {
      setError(err.message || 'Failed to set primary profile');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '960px', paddingTop: '40px', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Birth Profile Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Store and manage birth parameters for astronomical chart generation
          </p>
        </div>
        <Button variant="gold" icon={<Plus size={16} />} onClick={handleOpenAdd}>
          Add Birth Profile
        </Button>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', fontSize: '0.875rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} flex-shrink="0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px auto', color: 'var(--accent-gold)' }} />
          <div>Loading your birth profiles...</div>
        </div>
      ) : profiles.length === 0 ? (
        <Card glow style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(245, 208, 97, 0.15)', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: 'var(--accent-gold)' }}>
            <Calendar size={28} />
          </div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>No Birth Profiles Saved Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 24px auto' }}>
            Create your primary birth profile to enable astronomical chart calculations, D1/D9 generation, and personalized AI readings.
          </p>
          <Button variant="gold" icon={<Plus size={16} />} onClick={handleOpenAdd}>
            Create Primary Profile
          </Button>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '20px' }}>
          {profiles.map((profile) => (
            <Card key={profile.id} glow={profile.isPrimary}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: profile.isPrimary ? 'linear-gradient(135deg, rgba(245, 208, 97, 0.3) 0%, rgba(99, 102, 241, 0.2) 100%)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${profile.isPrimary ? 'var(--border-gold)' : 'var(--border-subtle)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: profile.isPrimary ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  }}>
                    <User size={20} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.15rem' }}>{profile.name}</h3>
                      {profile.isPrimary && (
                        <Badge variant="gold" icon={<Star size={12} fill="var(--accent-gold)" />}>
                          Primary
                        </Badge>
                      )}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {profile.relationship} • {profile.gender}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => handleOpenEdit(profile)}
                    className="btn btn-outline"
                    style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                    title="Edit Profile"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(profile.id)}
                    className="btn btn-outline"
                    style={{ padding: '6px 10px', fontSize: '0.75rem', color: '#FCA5A5', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                    title="Delete Profile"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '14px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', marginBottom: '16px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                  <Calendar size={14} color="var(--accent-gold)" />
                  <span>{profile.dateOfBirth}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                  <Clock size={14} color="var(--accent-gold)" />
                  <span>{profile.timeOfBirth}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', gridColumn: '1 / -1' }}>
                  <MapPin size={14} color="var(--accent-gold)" flex-shrink="0" />
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{profile.placeName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', gridColumn: '1 / -1' }}>
                  <Globe size={13} />
                  <span>{profile.latitude.toFixed(4)}° N, {profile.longitude.toFixed(4)}° E ({profile.timezone}, UTC {profile.timezoneOffset >= 0 ? `+${profile.timezoneOffset}` : profile.timezoneOffset})</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link
                  to={`/kundli?profile=${profile.id}`}
                  className="btn btn-gold"
                  style={{ flex: 1, padding: '7px 12px', fontSize: '0.825rem', textAlign: 'center' }}
                >
                  <Compass size={14} /> View Kundli
                </Link>

                {!profile.isPrimary && (
                  <Button
                    variant="outline"
                    style={{ padding: '7px 12px', fontSize: '0.8rem' }}
                    onClick={() => handleSetPrimary(profile)}
                  >
                    <Star size={14} /> Set Primary
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Profile Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '20px',
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-gold)', boxShadow: 'var(--shadow-gold)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
              <h3 style={{ fontSize: '1.3rem' }}>{editingProfile ? 'Edit Birth Profile' : 'New Birth Profile'}</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="input-label">Full Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label">Relationship *</label>
                  <select
                    className="input-field"
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value as RelationshipType })}
                  >
                    <option value="self">Self</option>
                    <option value="partner">Partner</option>
                    <option value="parent">Parent</option>
                    <option value="child">Child</option>
                    <option value="sibling">Sibling</option>
                    <option value="friend">Friend</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="input-label">Date of Birth *</label>
                  <input
                    type="date"
                    className="input-field"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label">Time of Birth *</label>
                  <input
                    type="time"
                    step="1"
                    className="input-field"
                    required
                    value={formData.timeOfBirth}
                    onChange={(e) => setFormData({ ...formData, timeOfBirth: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label">Gender</label>
                  <select
                    className="input-field"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as GenderType })}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="undisclosed">Undisclosed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="input-label">Birth Place / City *</label>
                <input
                  type="text"
                  className="input-field"
                  required
                  placeholder="e.g. Ujjain, Madhya Pradesh, India"
                  value={formData.placeName}
                  onChange={(e) => setFormData({ ...formData, placeName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="input-label">Latitude (-90 to 90) *</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="input-field"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="input-label">Longitude (-180 to 180) *</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="input-field"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label className="input-label">Timezone *</label>
                  <input
                    type="text"
                    className="input-field"
                    required
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label">UTC Offset</label>
                  <input
                    type="number"
                    step="0.5"
                    className="input-field"
                    required
                    value={formData.timezoneOffset}
                    onChange={(e) => setFormData({ ...formData, timezoneOffset: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '6px 0' }}>
                <input
                  type="checkbox"
                  id="isPrimaryCheck"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                />
                <label htmlFor="isPrimaryCheck" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  Set this profile as primary for quick astrological calculations
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} /> Save Profile
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security notice */}
      <div style={{ marginTop: '36px', padding: '14px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Shield size={20} color="var(--accent-gold)" />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Birth details are strictly encrypted and isolated per user account. Only your authenticated session can access your birth profiles.
        </span>
      </div>
    </div>
  );
};
