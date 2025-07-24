import { useState, useEffect } from "react";
import AdminLayout from '@/components/AdminLayout';
import styles from "@/styles/Home.module.css";

export default function Settings() {
  const [settings, setSettings] = useState({
    // Social Proof Settings
    socialProofEnabled: true,
    socialProofInterval: 8000,
    socialProofDuration: 4000,
    socialProofBannerColor: '#28a745',
    socialProofTextColor: '#ffffff',
    
    // Product Settings
    productName: 'KelasGPT - Belajar GPT-4 macam pro!',
    productPrice: 99.00,
    discountamount: 0,
    baseproductprice: 197.00,
    productDescription: 'Belajar cara menggunakan GPT-4 untuk tingkatkan produktiviti dan bina penyelesaian AI anda sendiri.',
    productDownloadLink: 'https://drive.google.com/file/d/example/view',
    
    // Email Settings
    emailFromName: 'KelasGPT Team',
    emailFromAddress: 'noreply@kelasgpt.my',
    emailSubject: 'Terima kasih! Link download KelasGPT anda',
    
    // Site Settings
    siteTitle: 'KelasGPT - Belajar GPT-4 macam pro!',
    siteDescription: 'Belajar cara menggunakan GPT-4 untuk tingkatkan produktiviti dan bina penyelesaian AI anda sendiri. Sertai sekarang!',
    maintenanceMode: false
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [analyticsStats, setAnalyticsStats] = useState({
    currentRecords: 0,
    oldestRecord: null,
    canCleanup: false,
    recordsToCleanup: 0
  });

  useEffect(() => {
    loadSettings();
    fetchAnalyticsStats();
  }, []);

  const fetchAnalyticsStats = async () => {
    const response = await fetch('/api/admin/analytics-stats');
    const data = await response.json();
    setAnalyticsStats(data);
  };

  const handleAnalyticsCleanup = async () => {
    const response = await fetch('/api/admin/cleanup-analytics', { method: 'POST' });
    const result = await response.json();
    // Show cleanup results and refresh stats
    fetchAnalyticsStats();
    setMessage(result.message || 'Cleanup process completed.');
    setTimeout(() => setMessage(''), 5000);
  };

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Convert API format to component format
        const apiSettings = result.data;
        const componentSettings = {};
        
        Object.keys(apiSettings).forEach(key => {
          componentSettings[key] = apiSettings[key].value;
        });
        
        setSettings(prev => ({ ...prev, ...componentSettings }));
      } else {
        throw new Error(result.message || 'Failed to load settings');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage('Failed to load settings. Using defaults.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setMessage('Settings saved successfully!');
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error(result.message || 'Failed to save settings');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage(error.message || 'Error saving settings. Please try again.');
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    marginBottom: '15px'
  };

  const sectionStyle = {
    background: 'white',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    marginBottom: '20px'
  };

  return (
    <AdminLayout title="Settings">
      <h1 className={styles.title}>Platform Settings</h1>

      {message && (
        <div style={{
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px',
          background: message.includes('Error') ? '#f8d7da' : '#d4edda',
          color: message.includes('Error') ? '#721c24' : '#155724',
          border: `1px solid ${message.includes('Error') ? '#f5c6cb' : '#c3e6cb'}`
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Site Settings */}
        <div style={sectionStyle}>
          <h2 style={{ marginTop: 0, color: '#333' }}>Site Configuration</h2>
          
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
            Site Title
          </label>
          <input
            type="text"
            name="siteTitle"
            value={settings.siteTitle}
            onChange={handleInputChange}
            style={inputStyle}
          />

          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
            Site Description
          </label>
          <textarea
            name="siteDescription"
            value={settings.siteDescription}
            onChange={handleInputChange}
            rows={3}
            style={inputStyle}
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              name="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={handleInputChange}
            />
            <span>Enable Maintenance Mode</span>
          </label>
        </div>

        {/* Product Settings */}
        <div style={sectionStyle}>
          <h2 style={{ marginTop: 0, color: '#333' }}>Product Configuration</h2>
          
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
            Product Name
          </label>
          <input
            type="text"
            name="productName"
            value={settings.productName}
            onChange={handleInputChange}
            style={inputStyle}
          />

          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
            Base Product Price (RM)
          </label>
          <input
            type="number"
            name="baseproductprice"
            value={settings.baseproductprice}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            style={inputStyle}
          />

          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
            Discount Amount (RM)
          </label>
          <input
            type="number"
            name="discountamount"
            value={settings.discountamount}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            style={inputStyle}
          />

          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
            Product Price (RM)
          </label>
          <input
            type="number"
            name="productPrice"
            value={settings.productPrice}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            style={inputStyle}
          />

          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
            Product Description
          </label>
          <textarea
            name="productDescription"
            value={settings.productDescription}
            onChange={handleInputChange}
            rows={3}
            style={inputStyle}
          />

          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
            Product Download Link
          </label>
          <input
            type="url"
            name="productDownloadLink"
            value={settings.productDownloadLink}
            onChange={handleInputChange}
            placeholder="https://drive.google.com/file/d/example/view"
            style={inputStyle}
          />
        </div>

        {/* Social Proof Settings */}
        <div style={sectionStyle}>
          <h2 style={{ marginTop: 0, color: '#333' }}>Social Proof Notifications</h2>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
            <input
              type="checkbox"
              name="socialProofEnabled"
              checked={settings.socialProofEnabled}
              onChange={handleInputChange}
            />
            <span>Enable Social Proof Notifications</span>
          </label>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                Banner Color
              </label>
              <input
                type="color"
                name="socialProofBannerColor"
                value={settings.socialProofBannerColor}
                onChange={handleInputChange}
                style={{ ...inputStyle, height: '40px' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                Text Color
              </label>
              <input
                type="color"
                name="socialProofTextColor"
                value={settings.socialProofTextColor}
                onChange={handleInputChange}
                style={{ ...inputStyle, height: '40px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                Display Duration (ms)
              </label>
              <input
                type="number"
                name="socialProofDuration"
                value={settings.socialProofDuration}
                onChange={handleInputChange}
                min="1000"
                max="10000"
                step="500"
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                Interval Between (ms)
              </label>
              <input
                type="number"
                name="socialProofInterval"
                value={settings.socialProofInterval}
                onChange={handleInputChange}
                min="3000"
                max="20000"
                step="500"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div style={sectionStyle}>
          <h2 style={{ marginTop: 0, color: '#333' }}>Email Configuration</h2>
          
          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                From Name
              </label>
              <input
                type="text"
                name="emailFromName"
                value={settings.emailFromName}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                From Email Address
              </label>
              <input
                type="email"
                name="emailFromAddress"
                value={settings.emailFromAddress}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </div>
          </div>

          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
            Email Subject
          </label>
          <input
            type="text"
            name="emailSubject"
            value={settings.emailSubject}
            onChange={handleInputChange}
            style={inputStyle}
          />
        </div>

        {/* Analytics Data Management */}
        <div style={sectionStyle}>
          <h2 style={{ marginTop: 0, color: '#333' }}>Analytics Data Management</h2>
          <div className={styles.analyticsStats}>
            <p>Current records: {analyticsStats.currentRecords}</p>
            <p>Oldest record: {analyticsStats.oldestRecord}</p>
            {analyticsStats.canCleanup && (
              <button onClick={handleAnalyticsCleanup} className={styles.primary} style={{marginTop: '10px'}}>
                Archive {analyticsStats.recordsToCleanup} old records
              </button>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button 
            type="submit" 
            className={styles.primary}
            disabled={loading}
            style={{ 
              minWidth: '200px',
              padding: '12px 24px',
              fontSize: '16px',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
