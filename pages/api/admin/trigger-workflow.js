import { requireAuth } from "../../../lib/adminAuth";

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const GITHUB_TOKEN = process.env.GITHUB_PAT;
    const REPO_OWNER = 'luqtech-official';
    const REPO_NAME = 'kelasgpt-public-resources';
    const WORKFLOW_ID = 'social-noti.yml';
    
    if (!GITHUB_TOKEN) {
      return res.status(500).json({ success: false, message: 'GitHub Token (GITHUB_PAT) not configured on server.' });
    }

    const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_ID}/dispatches`, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ref: 'main' })
    });

    if (response.status === 204) {
      return res.status(200).json({ success: true, message: 'Workflow triggered successfully.' });
    } else {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ 
        success: false, 
        message: 'Failed to trigger workflow.', 
        details: errorData 
      });
    }

  } catch (error) {
    console.error('Trigger workflow API error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal Server Error',
      error: error.message 
    });
  }
}

export default requireAuth(handler);
