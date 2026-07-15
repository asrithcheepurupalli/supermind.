import React from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
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
  Key,
  Lock,
  Fingerprint,
  AlertTriangle
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import SecurityBadge from '../SecurityBadge';
import toast from 'react-hot-toast';

const settingsSections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'ai', label: 'AI Features', icon: Brain },
  { id: 'display', label: 'Display', icon: Monitor },
];

export default function SettingsModal() {
  const { 
    isSettingsModalOpen, 
    setSettingsModalOpen, 
    settings, 
    updateSettings,
    exportContent,
    user,
    content,
    getSecurityScore,
    isEncryptionSetup,
    setEncryptionModalOpen
  } = useStore();
  
  const [activeSection, setActiveSection] = React.useState('profile');
  const securityScore = getSecurityScore();

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
    toast.success(`Theme changed to ${theme}`);
  };

  const handleExport = () => {
    exportContent();
    toast.success('Content exported successfully!');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedContent = JSON.parse(e.target?.result as string);
        // In a real app, you'd validate the data structure
        toast.success(`Imported ${importedContent.length} items`);
      } catch (error) {
        toast.error('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xl">{user?.name?.[0] || 'U'}</span>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">{user?.name || 'User'}</h3>
          <p className="text-gray-400">{user?.email || 'user@example.com'}</p>
          <span className="inline-block px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full mt-1">
            {user?.subscription || 'Free'} Plan
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
            {Math.round(content.reduce((acc, c) => acc + c.tags.length, 0) / content.length) || 0}
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

      {/* Encryption Settings */}
      <div className="space-y-4">
        <h4 className="text-white font-medium">Encryption & Privacy</h4>
        
        <div className="bg-gray-800/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Lock size={18} className="text-emerald-400" />
              </div>
              <div>
                <h5 className="text-white font-medium">End-to-End Encryption</h5>
                <p className="text-gray-400 text-sm">
                  {isEncryptionSetup ? 'Your data is encrypted and secure' : 'Protect your data with encryption'}
                </p>
              </div>
            </div>
            {isEncryptionSetup ? (
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <Shield size={16} />
                <span>Active</span>
              </div>
            ) : (
              <Button
                onClick={() => setEncryptionModalOpen(true)}
                size="sm"
                variant="primary"
              >
                Enable
              </Button>
            )}
          </div>
        </div>

        {Object.entries(settings.security).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                {key === 'biometricAuth' && <Fingerprint size={18} className="text-blue-400" />}
                {key === 'autoLock' && <Lock size={18} className="text-blue-400" />}
                {key === 'autoLockTimeout' && <AlertTriangle size={18} className="text-blue-400" />}
              </div>
              <div>
                <h5 className="text-white font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h5>
                <p className="text-gray-400 text-sm">
                  {key === 'biometricAuth' && 'Use fingerprint or face recognition'}
                  {key === 'autoLock' && 'Automatically lock after inactivity'}
                  {key === 'autoLockTimeout' && `Lock after ${value} minutes of inactivity`}
                </p>
              </div>
            </div>
            {key === 'autoLockTimeout' ? (
              <select
                value={value}
                onChange={(e) => updateSettings({
                  security: { ...settings.security, [key]: parseInt(e.target.value) }
                })}
                className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
              >
                <option value={5}>5 min</option>
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={60}>1 hour</option>
              </select>
            ) : (
              <button
                onClick={() => updateSettings({
                  security: { ...settings.security, [key]: !value }
                })}
                className={`w-12 h-6 rounded-full transition-all duration-200 ${
                  value ? 'bg-emerald-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                  value ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Security Recommendations */}
      {securityScore < 100 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-yellow-400 mt-0.5" size={18} />
            <div>
              <h4 className="text-yellow-400 font-medium mb-2">Security Recommendations</h4>
              <ul className="text-gray-400 text-sm space-y-1">
                {!isEncryptionSetup && <li>• Enable end-to-end encryption for maximum security</li>}
                {!settings.security.biometricAuth && <li>• Enable biometric authentication</li>}
                {!settings.security.autoLock && <li>• Enable auto-lock for better security</li>}
                {settings.privacy.analytics && <li>• Disable analytics for better privacy</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-4">
      {Object.entries(settings.notifications).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
          <div>
            <h4 className="text-white font-medium capitalize">{key} Notifications</h4>
            <p className="text-gray-400 text-sm">
              {key === 'email' && 'Receive updates via email'}
              {key === 'push' && 'Browser push notifications'}
              {key === 'reminders' && 'Smart reminder alerts'}
            </p>
          </div>
          <button
            onClick={() => updateSettings({
              notifications: { ...settings.notifications, [key]: !value }
            })}
            className={`w-12 h-6 rounded-full transition-all duration-200 ${
              value ? 'bg-emerald-500' : 'bg-gray-600'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
              value ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      ))}
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
              onClick={() => handleThemeChange(value as any)}
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
        {Object.entries(settings.display).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
            <div>
              <h4 className="text-white font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
              <p className="text-gray-400 text-sm">
                {key === 'compactMode' && 'Show more items in less space'}
                {key === 'showPreviews' && 'Display content previews'}
                {key === 'animationsEnabled' && 'Enable smooth animations'}
              </p>
            </div>
            <button
              onClick={() => updateSettings({
                display: { ...settings.display, [key]: !value }
              })}
              className={`w-12 h-6 rounded-full transition-all duration-200 ${
                value ? 'bg-emerald-500' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                value ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDataSection = () => (
    <div className="space-y-4">
      <div className="p-4 bg-gray-800/30 rounded-xl">
        <h4 className="text-white font-medium mb-2">Export Data</h4>
        <p className="text-gray-400 text-sm mb-4">Download all your content as JSON</p>
        <Button onClick={handleExport} variant="secondary" size="sm">
          <Download size={16} />
          Export Content
        </Button>
      </div>

      <div className="p-4 bg-gray-800/30 rounded-xl">
        <h4 className="text-white font-medium mb-2">Import Data</h4>
        <p className="text-gray-400 text-sm mb-4">Upload previously exported content</p>
        <label className="cursor-pointer">
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <Button variant="secondary" size="sm">
            <Upload size={16} />
            Import Content
          </Button>
        </label>
      </div>

      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
        <h4 className="text-red-400 font-medium mb-2">Danger Zone</h4>
        <p className="text-gray-400 text-sm mb-4">Permanently delete all your data</p>
        <Button variant="destructive" size="sm">
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
      case 'privacy': return renderNotificationsSection(); // Reuse for demo
      case 'ai': return renderNotificationsSection(); // Reuse for demo
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
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 space-y-2">
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