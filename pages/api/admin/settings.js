import { supabase } from "../../../lib/supabase";
import { requireAuth } from "../../../lib/adminAuth";

async function handler(req, res) {
  if (req.method === 'GET') {
    return getSettings(req, res);
  } else if (req.method === 'POST') {
    return updateSettings(req, res);
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}

async function getSettings(req, res) {
  try {
    // Get all settings from the settings table
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('setting_key, setting_value, setting_type, description, updated_at');

    if (settingsError) {
      throw settingsError;
    }

    // Convert to key-value object for easier frontend consumption
    const settingsObject = {};
    settings.forEach(setting => {
      settingsObject[setting.setting_key] = {
        value: setting.setting_value,
        type: setting.setting_type,
        description: setting.description,
        updated_at: setting.updated_at
      };
    });

    // Provide default values if settings don't exist
    const defaultSettings = {
      // Social Proof Settings
      socialProofEnabled: { value: true, type: 'boolean' },
      socialProofInterval: { value: 8000, type: 'number' },
      socialProofDuration: { value: 4000, type: 'number' },
      socialProofBannerColor: { value: '#28a745', type: 'color' },
      socialProofTextColor: { value: '#ffffff', type: 'color' },
      
      // Product Settings
      productName: { value: 'KelasGPT - Belajar GPT-4 macam pro!', type: 'string' },
      productPrice: { value: 99.00, type: 'number' },
      productDescription: { 
        value: 'Belajar cara menggunakan GPT-4 untuk tingkatkan produktiviti dan bina penyelesaian AI anda sendiri.',
        type: 'string'
      },
      productDownloadLink: { 
        value: 'https://drive.google.com/file/d/example/view',
        type: 'url'
      },
      
      // Email Settings
      emailFromName: { value: 'KelasGPT Team', type: 'string' },
      emailFromAddress: { value: 'noreply@kelasgpt.my', type: 'email' },
      emailSubject: { value: 'Terima kasih! Link download KelasGPT anda', type: 'string' },
      
      // Site Settings
      siteTitle: { value: 'KelasGPT - Belajar GPT-4 macam pro!', type: 'string' },
      siteDescription: { 
        value: 'Belajar cara menggunakan GPT-4 untuk tingkatkan produktiviti dan bina penyelesaian AI anda sendiri. Sertai sekarang!',
        type: 'string'
      },
      maintenanceMode: { value: false, type: 'boolean' }
    };

    // Merge defaults with existing settings
    const finalSettings = { ...defaultSettings };
    Object.keys(settingsObject).forEach(key => {
      if (finalSettings[key]) {
        finalSettings[key] = settingsObject[key];
      }
    });

    res.status(200).json({
      success: true,
      data: finalSettings
    });

  } catch (error) {
    console.error('Get settings API error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function updateSettings(req, res) {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Settings object is required'
      });
    }

    const adminId = req.admin.admin_id;
    const timestamp = new Date().toISOString();

    // Validate and process each setting
    const validatedSettings = {};
    const errors = [];

    for (const [key, value] of Object.entries(settings)) {
      const validation = validateSetting(key, value);
      if (validation.isValid) {
        validatedSettings[key] = validation.value;
      } else {
        errors.push(`${key}: ${validation.error}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors
      });
    }

    // Update settings in database using upsert
    const settingUpdates = [];
    
    for (const [key, value] of Object.entries(validatedSettings)) {
      settingUpdates.push({
        setting_key: key,
        setting_value: value,
        setting_type: getSettingType(key),
        updated_at: timestamp,
        updated_by: adminId
      });
    }

    // Perform upsert operations
    const updatePromises = settingUpdates.map(setting => 
      supabase
        .from('settings')
        .upsert(setting, { 
          onConflict: 'setting_key',
          returning: 'minimal'
        })
    );

    const results = await Promise.all(updatePromises);
    
    // Check for errors
    const updateErrors = results.filter(result => result.error);
    if (updateErrors.length > 0) {
      console.error('Settings update errors:', updateErrors);
      throw new Error('Failed to update some settings');
    }

    // Log the settings update
    console.log(`Settings updated by admin ${req.admin.username}:`, Object.keys(validatedSettings));

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        updatedSettings: Object.keys(validatedSettings),
        timestamp
      }
    });

  } catch (error) {
    console.error('Update settings API error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Helper function to validate individual settings
function validateSetting(key, value) {
  const validations = {
    // Boolean settings
    socialProofEnabled: (val) => typeof val === 'boolean',
    maintenanceMode: (val) => typeof val === 'boolean',
    
    // Number settings
    socialProofInterval: (val) => typeof val === 'number' && val >= 3000 && val <= 20000,
    socialProofDuration: (val) => typeof val === 'number' && val >= 1000 && val <= 10000,
    productPrice: (val) => typeof val === 'number' && val >= 0 && val <= 9999.99,
    
    // String settings
    productName: (val) => typeof val === 'string' && val.length > 0 && val.length <= 200,
    productDescription: (val) => typeof val === 'string' && val.length > 0 && val.length <= 1000,
    emailFromName: (val) => typeof val === 'string' && val.length > 0 && val.length <= 100,
    emailSubject: (val) => typeof val === 'string' && val.length > 0 && val.length <= 200,
    siteTitle: (val) => typeof val === 'string' && val.length > 0 && val.length <= 200,
    siteDescription: (val) => typeof val === 'string' && val.length > 0 && val.length <= 500,
    
    // Color settings
    socialProofBannerColor: (val) => typeof val === 'string' && /^#[0-9A-Fa-f]{6}$/.test(val),
    socialProofTextColor: (val) => typeof val === 'string' && /^#[0-9A-Fa-f]{6}$/.test(val),
    
    // Email settings
    emailFromAddress: (val) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return typeof val === 'string' && emailRegex.test(val);
    },
    
    // URL settings
    productDownloadLink: (val) => {
      if (typeof val !== 'string') return false;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }
  };

  const validator = validations[key];
  if (!validator) {
    return { isValid: false, error: 'Unknown setting' };
  }

  if (validator(value)) {
    return { isValid: true, value };
  } else {
    return { isValid: false, error: 'Invalid value' };
  }
}

// Helper function to get setting type
function getSettingType(key) {
  const types = {
    socialProofEnabled: 'ui_config',
    socialProofInterval: 'ui_config',
    socialProofDuration: 'ui_config',
    socialProofBannerColor: 'ui_config',
    socialProofTextColor: 'ui_config',
    
    productName: 'product_config',
    productPrice: 'product_config',
    productDescription: 'product_config',
    productDownloadLink: 'product_config',
    
    emailFromName: 'email_config',
    emailFromAddress: 'email_config',
    emailSubject: 'email_config',
    
    siteTitle: 'site_config',
    siteDescription: 'site_config',
    maintenanceMode: 'site_config'
  };

  return types[key] || 'general';
}

export default requireAuth(handler);