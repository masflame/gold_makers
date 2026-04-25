import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { accountSupabase } from '../utils/accountSupabase';

const AuthContext = createContext(null);

function sanitizeProfile(input = {}) {
  return {
    first_name: input.first_name?.trim() || '',
    last_name: input.last_name?.trim() || '',
    username: input.username?.trim() || '',
    email: input.email?.trim().toLowerCase() || '',
    phone: input.phone?.trim() || '',
    gender: input.gender?.trim() || '',
  };
}

async function upsertGoldMakersUser(profile) {
  if (!accountSupabase || !profile.email) {
    return { error: null };
  }

  const clean = sanitizeProfile(profile);
  const { data: existing, error: lookupError } = await accountSupabase
    .from('GoldMakers_Users')
    .select('id, purchase_count')
    .eq('email', clean.email)
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    return { error: lookupError };
  }

  if (existing?.id) {
    const { error } = await accountSupabase
      .from('GoldMakers_Users')
      .update({
        first_name: clean.first_name || null,
        last_name: clean.last_name || null,
        username: clean.username || null,
        phone: clean.phone || null,
        gender: clean.gender || null,
      })
      .eq('id', existing.id);
    return { error };
  }

  const { error } = await accountSupabase
    .from('GoldMakers_Users')
    .insert([
      {
        ...clean,
        purchase_count: 0,
      },
    ]);

  return { error };
}

async function getGoldMakersUserByEmail(email) {
  if (!accountSupabase || !email) {
    return { data: null, error: null };
  }

  const { data, error } = await accountSupabase
    .from('GoldMakers_Users')
    .select('*')
    .eq('email', email.toLowerCase())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return { data, error };
}

function mapUserMetadata(user) {
  const md = user?.user_metadata || {};

  return {
    first_name: md.first_name || md.given_name || '',
    last_name: md.last_name || md.family_name || '',
    username: md.username || md.preferred_username || '',
    email: user?.email || '',
    phone: md.phone || '',
    gender: md.gender || '',
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    if (!accountSupabase) {
      setLoading(false);
      return undefined;
    }

    accountSupabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;

      const currentSession = data.session;
      const currentUser = currentSession?.user || null;

      setSession(currentSession || null);
      setUser(currentUser);

      if (currentUser?.email) {
        const ensuredProfile = mapUserMetadata(currentUser);
        await upsertGoldMakersUser(ensuredProfile);
        const { data: dbProfile } = await getGoldMakersUserByEmail(currentUser.email);
        if (mounted) setProfile(dbProfile || null);
      }

      if (mounted) setLoading(false);
    });

    const { data: listener } = accountSupabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession || null);
      setUser(nextSession?.user || null);

      if (nextSession?.user?.email) {
        const ensuredProfile = mapUserMetadata(nextSession.user);
        await upsertGoldMakersUser(ensuredProfile);
        const { data: dbProfile } = await getGoldMakersUserByEmail(nextSession.user.email);
        if (mounted) setProfile(dbProfile || null);
      } else {
        setProfile(null);
      }

      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({
    loading,
    session,
    user,
    profile,
    hasClient: !!accountSupabase,
    signUpWithEmail: async ({ firstName, lastName, username, email, phone, gender, password }) => {
      if (!accountSupabase) {
        return { error: new Error('Account service is not configured.') };
      }

      const normalizedEmail = email.trim().toLowerCase();
      const profilePayload = {
        first_name: firstName,
        last_name: lastName,
        username,
        email: normalizedEmail,
        phone,
        gender,
      };

      const { data, error } = await accountSupabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            username,
            phone,
            gender,
          },
          emailRedirectTo: `${window.location.origin}/account`,
        },
      });

      if (error) {
        return { data, error };
      }

      const { error: profileError } = await upsertGoldMakersUser(profilePayload);
      return { data, error: profileError || null };
    },
    signInWithEmail: async ({ email, password }) => {
      if (!accountSupabase) {
        return { error: new Error('Account service is not configured.') };
      }

      return accountSupabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
    },
    signInWithGoogle: async () => {
      if (!accountSupabase) {
        return { error: new Error('Account service is not configured.') };
      }

      return accountSupabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/account`,
        },
      });
    },
    signOut: async () => {
      if (!accountSupabase) return;
      await accountSupabase.auth.signOut();
    },
    refreshProfile: async () => {
      if (!user?.email) {
        setProfile(null);
        return;
      }

      const { data } = await getGoldMakersUserByEmail(user.email);
      setProfile(data || null);
    },
  }), [loading, profile, session, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
