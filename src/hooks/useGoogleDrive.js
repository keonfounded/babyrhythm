import { useState, useCallback, useEffect } from 'react';

// Google Drive API configuration
// Users need to set up their own Google Cloud project and add client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const BACKUP_FILENAME = 'babyrhythm-backup.json';
const BACKUP_FOLDER_NAME = 'BabyRhythm Backups';

/**
 * Hook for Google Drive backup functionality
 */
export const useGoogleDrive = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [lastBackupTime, setLastBackupTime] = useState(() => {
    try {
      return localStorage.getItem('babyRhythm_lastBackupTime');
    } catch {
      return null;
    }
  });
  const [tokenClient, setTokenClient] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  // Check if Google API is configured
  const isConfigured = Boolean(GOOGLE_CLIENT_ID);

  // Initialize Google Identity Services
  useEffect(() => {
    if (!isConfigured) return;

    const initializeGIS = () => {
      if (window.google?.accounts?.oauth2) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: SCOPES,
          callback: (response) => {
            if (response.access_token) {
              setAccessToken(response.access_token);
              setIsSignedIn(true);
              fetchUserInfo(response.access_token);
            }
          },
          error_callback: (err) => {
            console.error('OAuth error:', err);
            setError('Failed to sign in with Google');
            setIsLoading(false);
          }
        });
        setTokenClient(client);
      }
    };

    // Load Google Identity Services script
    if (!window.google?.accounts?.oauth2) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGIS;
      document.body.appendChild(script);
    } else {
      initializeGIS();
    }
  }, [isConfigured]);

  // Fetch user info
  const fetchUserInfo = async (token) => {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setUserEmail(data.email);
    } catch (err) {
      console.error('Failed to fetch user info:', err);
    }
  };

  // Sign in with Google
  const signIn = useCallback(() => {
    if (!tokenClient) {
      setError('Google Sign-In not initialized');
      return;
    }
    setIsLoading(true);
    setError(null);
    tokenClient.requestAccessToken();
  }, [tokenClient]);

  // Sign out
  const signOut = useCallback(() => {
    if (accessToken) {
      window.google?.accounts?.oauth2?.revoke(accessToken);
    }
    setAccessToken(null);
    setIsSignedIn(false);
    setUserEmail(null);
  }, [accessToken]);

  // Find or create backup folder
  const getOrCreateBackupFolder = async (token) => {
    // Search for existing folder
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${BACKUP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const searchData = await searchResponse.json();

    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }

    // Create new folder
    const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: BACKUP_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder'
      })
    });
    const createData = await createResponse.json();
    return createData.id;
  };

  // Find existing backup file
  const findBackupFile = async (token, folderId) => {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${BACKUP_FILENAME}' and '${folderId}' in parents and trashed=false`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await response.json();
    return data.files && data.files.length > 0 ? data.files[0].id : null;
  };

  // Backup data to Google Drive
  const backup = useCallback(async (data) => {
    if (!accessToken) {
      setError('Not signed in');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const folderId = await getOrCreateBackupFolder(accessToken);
      const existingFileId = await findBackupFile(accessToken, folderId);

      const backupData = {
        version: 2,
        backupDate: new Date().toISOString(),
        ...data
      };

      const metadata = {
        name: BACKUP_FILENAME,
        mimeType: 'application/json',
        parents: existingFileId ? undefined : [folderId]
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' }));

      const url = existingFileId
        ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`
        : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

      const response = await fetch(url, {
        method: existingFileId ? 'PATCH' : 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form
      });

      if (!response.ok) {
        throw new Error('Failed to upload backup');
      }

      const now = new Date().toISOString();
      setLastBackupTime(now);
      localStorage.setItem('babyRhythm_lastBackupTime', now);
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Backup error:', err);
      setError(err.message || 'Failed to backup');
      setIsLoading(false);
      return false;
    }
  }, [accessToken]);

  // Restore data from Google Drive
  const restore = useCallback(async () => {
    if (!accessToken) {
      setError('Not signed in');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const folderId = await getOrCreateBackupFolder(accessToken);
      const fileId = await findBackupFile(accessToken, folderId);

      if (!fileId) {
        setError('No backup found');
        setIsLoading(false);
        return null;
      }

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!response.ok) {
        throw new Error('Failed to download backup');
      }

      const data = await response.json();
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Restore error:', err);
      setError(err.message || 'Failed to restore');
      setIsLoading(false);
      return null;
    }
  }, [accessToken]);

  // Check if backup exists
  const checkBackupExists = useCallback(async () => {
    if (!accessToken) return false;

    try {
      const folderId = await getOrCreateBackupFolder(accessToken);
      const fileId = await findBackupFile(accessToken, folderId);
      return Boolean(fileId);
    } catch {
      return false;
    }
  }, [accessToken]);

  return {
    isConfigured,
    isSignedIn,
    isLoading,
    error,
    userEmail,
    lastBackupTime,
    signIn,
    signOut,
    backup,
    restore,
    checkBackupExists
  };
};
