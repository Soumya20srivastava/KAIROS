// Settings Page
'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { authService } from '@/services/auth';
import { databaseService } from '@/services/database';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn, getApiError } from '@/lib/utils';
import {
  User,
  Mail,
  Lock,
  Key,
  Database,
  Terminal,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Bell,
  Shield,
  Trash2,
} from 'lucide-react';

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'integrations' | 'notifications' | 'danger'>('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile
  const [username, setUsername] = useState(user?.username || '');
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [bio, setBio] = useState(user?.bio || '');

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Integrations
  const [anthropicKey, setAnthropicKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [githubToken, setGithubToken] = useState('');

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [runNotifications, setRunNotifications] = useState(true);
  const [errorNotifications, setErrorNotifications] = useState(true);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleProfileSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await databaseService.updateProfile(user.id, {
        username,
        display_name: displayName,
        bio,
      });
      useAuthStore.getState().setUser({ ...user, username, display_name: displayName, bio });
      showMessage('success', 'Profile updated successfully');
    } catch (err: unknown) {
      showMessage('error', getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
      showMessage('error', 'Please check your passwords');
      return;
    }
    if (newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showMessage('success', 'Password updated successfully');
    } catch (err: unknown) {
      showMessage('error', getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'danger', label: 'Danger Zone', icon: Trash2 },
  ];

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-orbitron text-3xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground font-techno tracking-wider">
          MANAGE YOUR KAIROS CONFIGURATION
        </p>
      </div>

      {message && (
        <div className={cn(
          'flex items-center gap-3 rounded-md p-4 border animate-fade-in',
          message.type === 'success'
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-destructive/10 border-destructive/30 text-destructive'
        )}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <Card className="p-1">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all',
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-[0_0_10px_hsl(var(--primary)/0.3)]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card>
          <h3 className="font-orbitron text-lg font-semibold text-foreground mb-6">
            Profile Settings
          </h3>
          <div className="space-y-4 max-w-md">
            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={<User className="h-4 w-4" />}
              helper="3-30 alphanumeric characters or underscores"
            />
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              icon={<User className="h-4 w-4" />}
            />
            <Input
              label="Email"
              value={user.email}
              disabled
              icon={<Mail className="h-4 w-4" />}
              helper="Email cannot be changed. Contact support if needed."
            />
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full h-24 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>
            <Button variant="primary" onClick={handleProfileSave} loading={loading}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Card>
          <h3 className="font-orbitron text-lg font-semibold text-foreground mb-6">
            Security Settings
          </h3>
          <div className="space-y-4 max-w-md">
            <div className="nerv-panel p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Key className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Change Password</h4>
                  <p className="text-sm text-muted-foreground">Update your account password</p>
                </div>
              </div>
              <div className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  icon={<Lock className="h-4 w-4" />}
                />
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  icon={<Lock className="h-4 w-4" />}
                  helper="At least 6 characters"
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<Lock className="h-4 w-4" />}
                />
                <Button variant="primary" onClick={handlePasswordChange} loading={loading}>
                  Update Password
                </Button>
              </div>
            </div>

            <div className="nerv-panel p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
              </div>
              <Button variant="outline">Enable 2FA</Button>
            </div>

            <div className="nerv-panel p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Active Sessions</h4>
                  <p className="text-sm text-muted-foreground">Manage your logged-in devices</p>
                </div>
              </div>
              <Button variant="outline">View Sessions</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <Card>
          <h3 className="font-orbitron text-lg font-semibold text-foreground mb-6">
            API Integrations
          </h3>
          <div className="space-y-4 max-w-xl">
            <div className="nerv-panel p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Terminal className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Anthropic (Claude)</h4>
                  <p className="text-sm text-muted-foreground">LLM provider for agent reasoning</p>
                </div>
              </div>
              <Input
                label="API Key"
                type="password"
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                placeholder="sk-ant-..."
                icon={<Key className="h-4 w-4" />}
                helper="Stored securely, never exposed to client"
              />
            </div>

            <div className="nerv-panel p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Terminal className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">OpenAI</h4>
                  <p className="text-sm text-muted-foreground">Alternative LLM provider</p>
                </div>
              </div>
              <Input
                label="API Key"
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                icon={<Key className="h-4 w-4" />}
              />
            </div>

            <div className="nerv-panel p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
                  <Database className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">GitHub</h4>
                  <p className="text-sm text-muted-foreground">Repository access for code operations</p>
                </div>
              </div>
              <Input
                label="Personal Access Token"
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_..."
                icon={<Key className="h-4 w-4" />}
              />
            </div>

            <Button variant="primary">
              <Save className="mr-2 h-4 w-4" />
              Save API Keys
            </Button>
          </div>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card>
          <h3 className="font-orbitron text-lg font-semibold text-foreground mb-6">
            Notification Preferences
          </h3>
          <div className="space-y-4 max-w-md">
            {[
              { id: 'email', label: 'Email Notifications', desc: 'Receive email updates about your runs', enabled: emailNotifications, setEnabled: setEmailNotifications },
              { id: 'runs', label: 'Run Completion', desc: 'Notify when agent runs complete', enabled: runNotifications, setEnabled: setRunNotifications },
              { id: 'errors', label: 'Error Alerts', desc: 'Notify when runs fail or encounter errors', enabled: errorNotifications, setEnabled: setErrorNotifications },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.enabled}
                    onChange={(e) => item.setEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted-foreground/30 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
            <Button variant="primary">Save Preferences</Button>
          </div>
        </Card>
      )}

      {/* Danger Zone Tab */}
      {activeTab === 'danger' && (
        <Card className="border-destructive/30">
          <h3 className="font-orbitron text-lg font-semibold text-destructive mb-6">
            Danger Zone
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            These actions are irreversible. Proceed with caution.
          </p>
          <div className="space-y-4 max-w-md">
            <div className="nerv-panel p-4 border border-destructive/30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">Delete All Data</h4>
                  <p className="text-sm text-muted-foreground">Permanently delete all your objectives, plans, runs, and decisions</p>
                </div>
                <Button variant="danger">Delete All Data</Button>
              </div>
            </div>
            <div className="nerv-panel p-4 border border-destructive/30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">Delete Account</h4>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data</p>
                </div>
                <Button variant="danger">Delete Account</Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}