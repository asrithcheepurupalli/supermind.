import React from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Shield,
  Brain,
  Monitor,
  Download,
  Upload,
  Trash2,
  Moon,
  Sun,
  Laptop,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import SecurityBadge from '../SecurityBadge';
import toast from 'react-hot-toast';

const settingsSections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Reminders', icon: Bell },
  { id: 'ai', label: 'Smart Features', icon: Brain },
  { id: 'display', label: 'Display', icon: Monitor },
];

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-12 h-6 rounded-full transition-all duration-200 flex-shrink-0 ${
        value ? 'bg-emerald-500' : 'bg-gray-600'
      }`}
    >
      <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
        value ? 'translate-x-6' : 'translate-x-0.5'
      }`} />
    </button>
  );
}

export default function SettingsModal() {
  const {
    isSettingsModalOpen,
    setSettingsModalOpen,
    settingsSection,
    settings,
    updateSettings,
    exportContent,
    importContent,
    deleteAllContent,
    user,
    content,
    getSecurityScore,
    isEncryptionSetup,
    setEncryptionModalOpen,
    lock,
  } = useStore();

  const [activeSection, setActiveSection] = React.useState('profile');
  const importInputRef = React.useRef<HTMLInputElement>(null);
  const securityScore = getSecurityScore();

  // Open on the section requested by the caller (e.g. Profile → Privacy & Security).
  React.useEffect(() => {
    if (isSettingsModalOpen) {
      setActiveSection(settingsSection || 'profile');
    }
  }, [isSettingsModalOpen, settingsSection]);

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
    toast.success(`Theme changed to ${theme}`);
  };

  const handleExport = () => {
    exportContent();
    toast.success('Backup downloaded');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const count = importContent(data);
        if (count > 0) {
          toast.success(`Imported ${count} item${count !== 1 ? 's' : ''}`);
        } else {
          toast('No new items to import (duplicates are skipped).', { icon: 'ℹ️' });
        }
      } catch {
        toast.error('Invalid file format — expected a supermind JSON export');
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteAll = () => {
    if (!window.confirm(`Permanently delete all ${content.length} items? This cannot be undone. Consider exporting a backup first.`)) {
      return;
    }
    deleteAllContent();
    toast.success('All content deleted');
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xl">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">{user?.name || 'User'}</h3>
          {user?.email && <p className="text-gray-400">{user.email}</p>}
          <span className="inline-block px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full mt-1">
            Local profile — data stays on this device
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-800/30 rounded-xl">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{content.length}</div>
          <div className="text-sm text-gray-400">Total Items</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{content.filter(c => c.isFavorite).length}</div>
          <div className="text-sm text-gray-400">Favorites</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {content.length > 0
              ? Math.round(content.reduce((acc, c) => acc + c.tags.length, 0) / content.length)
              : 0}
          </div>
          <div className="text-sm text-gray-400">Avg Tags</div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="bg-gray-800/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Security Overview</h3>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Score:</span>
            <span className={`font-bold ${securityScore >= 80 ? 'text-emerald-400' : securityScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
              {securityScore}%
            </span>
          </div>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
          <div
            className={`h-3 rounded-full transition-all duration-1000 ${
              securityScore >= 80 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
              securityScore >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
              'bg-gradient-to-r from-red-500 to-red-600'
            }`}
            style={{ width: `${securityScore}%` }}
          />
        </div>

        <SecurityBadge variant="detailed" showDetails={true} />
      </div>

      {/* Encryption */}
      <div className="space-y-4">
        <h4 className="text-white font-medium">Encryption & Privacy</h4>

        <div className="bg-gray-800/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Lock size={18} className="text-emerald-400" />
              </div>
              <div>
                <h5 className="text-white font-medium">Encryption at Rest</h5>
                <p className="text-gray-400 text-sm">
                  {settings.security.encryptionEnabled
                    ? 'Your content is encrypted with AES-256-GCM before it touches storage'
                    : 'Encrypt your content with a passphrase only you know'}
                </p>
              </div>
            </div>
            {settings.security.encryptionEnabled ? (
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <Shield size={16} />
                <span>Active</span>
              </div>
            ) : (
              <Button
                onClick={() => {
                  setSettingsModalOpen(false);
                  setEncryptionModalOpen(true);
                }}
                size="sm"
                variant="primary"
              >
                Enable
              </Button>
            )}
          </div>
        </div>

        {settings.security.encryptionEnabled && isEncryptionSetup && (
          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
            <div>
              <h5 className="text-white font-medium">Lock Now</h5>
              <p className="text-gray-400 text-sm">Clear the key from memory — you'll need your passphrase to continue</p>
            </div>
            <Button onClick={() => { lock(); setSettingsModalOpen(false); }} size="sm" variant="secondary">
              <Lock size={14} />
              Lock
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
          <div>
            <h5 className="text-white font-medium">Auto-Lock</h5>
            <p className="text-gray-400 text-sm">
              {settings.security.encryptionEnabled
                ? 'Automatically lock the workspace after inactivity'
                : 'Requires encryption to be enabled'}
            </p>
          </div>
          <Toggle
            value={settings.security.autoLock}
            onChange={() => updateSettings({
              security: { ...settings.security, autoLock: !settings.security.autoLock },
            })}
          />
        </div>

        {settings.security.autoLock && (
          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
            <div>
              <h5 className="text-white font-medium">Auto-Lock Timeout</h5>
              <p className="text-gray-400 text-sm">Lock after {settings.security.autoLockTimeout} minutes of inactivity</p>
            </div>
            <select
              value={settings.security.autoLockTimeout}
              onChange={(e) => updateSettings({
                security: { ...settings.security, autoLockTimeout: parseInt(e.target.value) },
              })}
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
            >
              <option value={5}>5 min</option>
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={60}>1 hour</option>
            </select>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {!settings.security.encryptionEnabled && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-yellow-400 mt-0.5" size={18} />
            <div>
              <h4 className="text-yellow-400 font-medium mb-2">Recommendation</h4>
              <p className="text-gray-400 text-sm">
                Enable encryption at rest so your content is unreadable even if someone
                gains access to this device's browser storage.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
        <div>
          <h4 className="text-white font-medium">Smart Reminders</h4>
          <p className="text-gray-400 text-sm">
            Detect deadlines and follow-ups in your notes and surface them in the reminders panel
          </p>
        </div>
        <Toggle
          value={settings.notifications.reminders}
          onChange={() => updateSettings({
            notifications: { ...settings.notifications, reminders: !settings.notifications.reminders },
          })}
        />
      </div>
      <p className="text-gray-500 text-sm px-1">
        supermind is fully local — there are no emails or push notifications, so there's
        nothing else to configure here.
      </p>
    </div>
  );

  const renderAiSection = () => (
    <div className="space-y-4">
      {([
        { key: 'autoTagging' as const, label: 'Auto-Tagging', desc: 'Generate tags from content as you save it' },
        { key: 'smartSummaries' as const, label: 'Smart Summaries', desc: 'Extract a short summary from each item' },
        { key: 'contentSuggestions' as const, label: 'Suggestions', desc: 'Show related items and review suggestions in Insights' },
      ]).map(({ key, label, desc }) => (
        <div key={key} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
          <div>
            <h4 className="text-white font-medium">{label}</h4>
            <p className="text-gray-400 text-sm">{desc}</p>
          </div>
          <Toggle
            value={settings.ai[key]}
            onChange={() => updateSettings({ ai: { ...settings.ai, [key]: !settings.ai[key] } })}
          />
        </div>
      ))}
      <p className="text-gray-500 text-sm px-1">
        All processing runs on your device. Nothing is sent to any server.
      </p>
    </div>
  );

  const renderDisplaySection = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-white font-medium mb-3">Theme</h4>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'light', icon: Sun, label: 'Light' },
            { value: 'dark', icon: Moon, label: 'Dark' },
            { value: 'system', icon: Laptop, label: 'System' },
          ].map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => handleThemeChange(value as 'light' | 'dark' | 'system')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                settings.theme === value
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                  : 'bg-gray-800/30 border-gray-700/50 text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {([
          { key: 'showPreviews' as const, label: 'Show Previews', desc: 'Display image and media previews on cards' },
          { key: 'animationsEnabled' as const, label: 'Animations', desc: 'Enable smooth transitions and motion' },
        ]).map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
            <div>
              <h4 className="text-white font-medium">{label}</h4>
              <p className="text-gray-400 text-sm">{desc}</p>
            </div>
            <Toggle
              value={settings.display[key]}
              onChange={() => updateSettings({ display: { ...settings.display, [key]: !settings.display[key] } })}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderDataSection = () => (
    <div className="space-y-4">
      <div className="p-4 bg-gray-800/30 rounded-xl">
        <h4 className="text-white font-medium mb-2">Export Data</h4>
        <p className="text-gray-400 text-sm mb-4">Download all {content.length} items as a JSON backup</p>
        <Button onClick={handleExport} variant="secondary" size="sm">
          <Download size={16} />
          Export Content
        </Button>
      </div>

      <div className="p-4 bg-gray-800/30 rounded-xl">
        <h4 className="text-white font-medium mb-2">Import Data</h4>
        <p className="text-gray-400 text-sm mb-4">Restore a previously exported supermind backup</p>
        <input
          ref={importInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImport}
          className="hidden"
        />
        <Button onClick={() => importInputRef.current?.click()} variant="secondary" size="sm">
          <Upload size={16} />
          Import Content
        </Button>
      </div>

      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
        <h4 className="text-red-400 font-medium mb-2">Danger Zone</h4>
        <p className="text-gray-400 text-sm mb-4">Permanently delete all your saved content</p>
        <Button onClick={handleDeleteAll} variant="destructive" size="sm">
          <Trash2 size={16} />
          Delete All Data
        </Button>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'profile': return renderProfileSection();
      case 'security': return renderSecuritySection();
      case 'notifications': return renderNotificationsSection();
      case 'ai': return renderAiSection();
      case 'display': return renderDisplaySection();
      default: return renderDataSection();
    }
  };

  return (
    <Modal
      isOpen={isSettingsModalOpen}
      onClose={() => setSettingsModalOpen(false)}
      title="Settings"
      size="xl"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-64 space-y-2">
          {settingsSections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                activeSection === id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Icon size={18} />
              <span className="font-medium">{label}</span>
            </button>
          ))}

          <div className="pt-4 border-t border-gray-700/50">
            <button
              onClick={() => setActiveSection('data')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                activeSection === 'data'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Download size={18} />
              <span className="font-medium">Data & Storage</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderSection()}
          </motion.div>
        </div>
      </div>
    </Modal>
  );
}
