# 🔒 Scripts Directory

**⚠️ SECURITY NOTICE**: This directory contains administrative scripts that may include sensitive credentials. All `.js` files are excluded from git tracking except `.example.js` templates.

## Available Templates

### `create-admin.example.js`
Template for creating admin users with bcrypt passwords.

**Usage:**
1. Copy to `create-admin.js`
2. Update credentials in the script
3. Run: `node scripts/create-admin.js`
4. Delete the file after use

### `cleanup-sessions.example.js`  
Template for cleaning up expired admin sessions.

**Usage:**
1. Copy to `cleanup-sessions.js` if needed
2. Run: `node scripts/cleanup-sessions.js`
3. Can be run as a cron job for maintenance

## Security Guidelines

1. **Never commit scripts with real credentials**
2. **Always use environment variables when possible**
3. **Delete temporary scripts after use**
4. **Use strong, unique passwords for admin accounts**

## Environment Variables Required

Scripts require these environment variables in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Production Setup

For production admin creation:
1. Use the example templates
2. Generate strong, unique credentials
3. Run scripts locally, not on production server
4. Verify admin access before deploying