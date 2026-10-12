import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const getServerBaseUrl = () => {
  // 1. Web browser: Use window.location.origin on cloud/Vercel or localhost:3000
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname || '';
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://${hostname}:3000`;
    }
    if (window.location.origin) {
      return window.location.origin;
    }
  }
  // 2. EXPO_PUBLIC_API_URL if set
  if (process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }
  // 3. Dynamic Expo hostUri (auto-detects PC LAN IP on physical mobile devices)
  try {
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost || Constants.manifest2?.extra?.expoGo?.debuggerHost || Constants.expoGoConfig?.debuggerHost;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'undefined' && !ip.includes('ngrok') && !ip.includes('expo')) {
        return `http://${ip}:3000`;
      }
    }
  } catch (e) {}
  // 4. Default active LAN IP
  return 'http://192.168.1.16:3000';
};

const SUPABASE_URL = "https://ooojsesybzkjlaylxiij.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vb2pzZXN5YnpramxheWx4aWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MzE4ODEsImV4cCI6MjA5NjIwNzg4MX0.G74IXhK2EVJYtSfx27nV6HNQtBas99ClUn2YqP1AcrM";

// Custom Cross-Platform Storage Adapter for Web & Mobile
export const customStorage = {
  getItem: async (key) => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return await AsyncStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (e) {}
  },
  removeItem: async (key) => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (e) {}
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  }
});

// Helper function to check if a user is an admin by userId or email ID
export const checkIsAdmin = async (userId, userEmail = '') => {
  const ADMIN_EMAILS = [
    'admin@gandharva.com',
    'admin@gandharvasound.com',
    'admin@studio.com',
    'prasanthm4734h@gmail.com'
  ];

  if (userEmail) {
    const cleanEmail = userEmail.trim().toLowerCase();
    if (ADMIN_EMAILS.includes(cleanEmail) || cleanEmail.startsWith('admin@')) {
      return true;
    }
  }

  if (!userId) return false;
  
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (data && !error) {
      return true;
    }
  } catch (error) {
    // console.log('Exception checking admin status:', error);
  }

  return false;
};

// Local storage helper for resilient real-time registration
const LOCAL_USERS_KEY = 'gandharva_registered_users_db';
const LOCAL_SESSION_KEY = 'gandharva_active_session';

export const getLocalUsers = async () => {
  try {
    const raw = await customStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveLocalUser = async (userObj) => {
  try {
    const users = await getLocalUsers();
    const index = users.findIndex(u => u.email.toLowerCase() === userObj.email.toLowerCase());
    if (index >= 0) {
      users[index] = { ...users[index], ...userObj };
    } else {
      users.push(userObj);
    }
    await customStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('saveLocalUser error:', e);
  }
};

// Unified Resilient Register User Service
export const registerUser = async (email, password, fullName = '') => {
  const cleanEmail = email.trim().toLowerCase();
  const userName = fullName.trim() || cleanEmail.split('@')[0];
  const role = (cleanEmail === 'prasanthm4734h@gmail.com' || cleanEmail.startsWith('admin@')) ? 'admin' : 'artist';
  const userId = 'usr_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();

  const localUser = {
    id: userId,
    email: cleanEmail,
    password: password,
    full_name: userName,
    role: role,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // 1. Always save to local database immediately
  await saveLocalUser(localUser);

  const sessionObj = {
    user: {
      id: userId,
      email: cleanEmail,
      user_metadata: { full_name: userName },
    },
    role: role,
  };
  await customStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(sessionObj));

  // 2. Try Supabase cloud register in background
  try {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: password,
      options: { data: { full_name: userName } }
    });

    if (data?.user) {
      localUser.id = data.user.id;
      await saveLocalUser(localUser);
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: cleanEmail,
          full_name: userName,
          role: role,
          created_at: new Date().toISOString()
        }, { onConflict: 'id' });
      } catch (pe) {}
    }
  } catch (cloudErr) {
    console.log('[Supabase Cloud Offline] Registered locally:', cleanEmail);
  }

  return { success: true, user: localUser, session: sessionObj };
};

// Unified Resilient Sign In User Service
export const authenticateUser = async (email, password) => {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Direct Admin Verification
  if (cleanEmail === 'prasanthm4734h@gmail.com' && password === 'Gandharva.01.') {
    const adminSession = {
      user: { id: 'admin_master', email: cleanEmail, user_metadata: { full_name: 'Studio Director' } },
      role: 'admin',
    };
    await customStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(adminSession));
    return { success: true, user: adminSession.user, role: 'admin' };
  }

  // 2. Try Supabase Cloud Sign In
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    });

    if (data?.session?.user && !error) {
      const user = data.session.user;
      const isAdmin = await checkIsAdmin(user.id, user.email);
      const sessionObj = { user, role: isAdmin ? 'admin' : 'artist' };
      await customStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(sessionObj));
      return { success: true, user, role: sessionObj.role };
    }
  } catch (e) {
    console.log('[Supabase Cloud Offline] Attempting local verification...');
  }

  // 3. Check Local Registered Users Database
  const localUsers = await getLocalUsers();
  const foundUser = localUsers.find(u => u.email.toLowerCase() === cleanEmail);

  if (foundUser) {
    if (foundUser.password === password) {
      const sessionObj = {
        user: {
          id: foundUser.id,
          email: foundUser.email,
          user_metadata: { full_name: foundUser.full_name },
        },
        role: foundUser.role || 'artist',
      };
      await customStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(sessionObj));
      return { success: true, user: sessionObj.user, role: sessionObj.role };
    } else {
      return { success: false, error: 'Invalid password. Please check your credentials.' };
    }
  }

  return { success: false, error: 'User not found. Please register as a new user.' };
};

const extractErrorMessage = (err, fallback = 'Failed to dispatch verification code.') => {
  if (!err) return fallback;
  if (typeof err === 'string') {
    const trimmed = err.trim();
    if (trimmed && trimmed !== '{}' && trimmed !== '[object Object]') return trimmed;
    return fallback;
  }
  if (typeof err === 'object') {
    if (typeof err.message === 'string' && err.message.trim() && err.message !== '{}') {
      return err.message.trim();
    }
    if (typeof err.error_description === 'string' && err.error_description.trim()) {
      return err.error_description.trim();
    }
    if (typeof err.error === 'string' && err.error.trim()) {
      return err.error.trim();
    }
  }
  return fallback;
};

// 1. Send Authentic Email Verification Code (OTP) to User's Email
export const sendEmailVerificationCode = async (email, name = '') => {
  const cleanEmail = email.trim().toLowerCase();
  const baseUrl = getServerBaseUrl();

  // 1. Dispatch through Backend Email Service
  let backendErrDetail = null;
  try {
    const response = await fetch(`${baseUrl}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, name })
    });

    let data = null;
    let rawText = '';
    try {
      rawText = await response.text();
      data = JSON.parse(rawText);
    } catch (_) {}

    if (response.ok && data?.success) {
      console.log(`[Email Dispatch] Real OTP email dispatched to ${cleanEmail}`);
      return { success: true, email: cleanEmail };
    }

    if (response.status === 401) {
      backendErrDetail = 'Vercel Deployment Protection is active on this preview deployment URL. Please disable Vercel Authentication under Project Settings > Deployment Protection in Vercel, or use the main production domain.';
    } else if (data?.error) {
      backendErrDetail = extractErrorMessage(data.error, `Authentication server returned error (HTTP ${response.status})`);
    } else if (rawText && rawText.includes('FUNCTION_INVOCATION_FAILED')) {
      backendErrDetail = 'Vercel serverless function initialization failed (FUNCTION_INVOCATION_FAILED).';
    } else {
      backendErrDetail = extractErrorMessage(rawText, `Authentication server returned error (HTTP ${response.status})`);
    }
    console.warn('[Email Dispatch Backend Error]:', backendErrDetail);
  } catch (backendErr) {
    backendErrDetail = backendErr.message || 'Unable to connect to authentication server.';
    console.warn('[Email Dispatch Connection Error]:', backendErrDetail);
  }

  // 2. Secondary Direct Supabase OTP Dispatch
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: { shouldCreateUser: true }
    });
    if (!error) {
      return { success: true, email: cleanEmail };
    }
    const supaErr = extractErrorMessage(error, null);
    return { success: false, error: supaErr || backendErrDetail || 'Unable to dispatch verification code. Please check your credentials.' };
  } catch (supaErr) {
    return { success: false, error: backendErrDetail || 'Unable to connect to authentication server.' };
  }
};

// 2. Verify Authentic Email OTP Code Received in Email
export const verifyEmailVerificationCode = async (email, enteredCode, fullName = '') => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = (enteredCode || '').trim();
  const baseUrl = getServerBaseUrl();

  // 1. Verify with Backend OTP Service
  try {
    const response = await fetch(`${baseUrl}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, code: cleanCode, name: fullName })
    });

    let data = null;
    try {
      data = await response.json();
    } catch (_) {}

    if (response.ok && data?.success) {
      const userName = fullName.trim() || cleanEmail.split('@')[0];
      const result = await registerUser(cleanEmail, 'OTP_Verified_Session_2026', userName);
      return { success: true, user: result.user, role: data.role || result.user.role, session: result.session };
    } else if (data && data.error) {
      return { success: false, error: extractErrorMessage(data.error, 'Invalid verification code.') };
    }
  } catch (beErr) {
    console.warn(`[Backend Verify Note]: ${beErr.message}`);
  }

  // 2. Secondary: Supabase OTP verification
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanCode,
      type: 'email'
    });
    if (data?.session && !error) {
      const userName = fullName.trim() || cleanEmail.split('@')[0];
      const result = await registerUser(cleanEmail, 'OTP_Verified_Session_2026', userName);
      return { success: true, user: result.user, role: result.user.role, session: result.session };
    } else if (error) {
      return { success: false, error: extractErrorMessage(error, 'Invalid or expired verification code.') };
    }
  } catch (e) {}

  return { success: false, error: 'Invalid or expired 6-digit verification code. Please check your inbox and try again.' };
};

// 3. Realtime Google OAuth Sign In (redirects to Google Accounts chooser with consent prompt)
export const signInWithGoogleOAuth = async () => {
  const redirectUrl = Platform.OS === 'web' && typeof window !== 'undefined' 
    ? window.location.origin 
    : undefined;

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.warn('[Google OAuth]:', err.message);
    // If Supabase OAuth provider is not configured in dashboard, open Google Accounts directly
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open('https://accounts.google.com/signin/v2/usernamerecovery', '_blank');
    }
    throw err;
  }
};


