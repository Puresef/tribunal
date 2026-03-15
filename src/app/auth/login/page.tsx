'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import styles from './login.module.css';

function LoginContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/';
  const error = searchParams.get('error');
  const supabase = createClient();

  const [isEmailSent, setIsEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [loginMethod, setLoginMethod] = useState<'magic_link' | 'password'>('magic_link');
  const [isLoading, setIsLoading] = useState(false);

  const handleOAuthLogin = async (provider: 'twitter' | 'google') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
      },
    });
  };

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (loginMethod === 'magic_link') {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
        },
      });

      if (error) {
        window.location.href = `/auth/login?error=auth_failed&msg=${encodeURIComponent(error.message)}`;
        setIsLoading(false);
        return;
      }

      setSubmittedEmail(email);
      setIsEmailSent(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        window.location.href = `/auth/login?error=auth_failed&msg=${encodeURIComponent(error.message)}`;
        setIsLoading(false);
        return;
      }
      window.location.href = redirectTo;
    }

    setIsLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {isEmailSent ? (
          <div className={styles.successState}>
            <span className={styles.successIcon}>✉️</span>
            <h2 className={styles.successTitle}>Check Your Inbox</h2>
            <p className={styles.successText}>
              We sent a secure login link to <span className={styles.successEmail}>{submittedEmail}</span>.
              <br /><br />
              Click the link to instantly enter The Tribunal.
            </p>
            <button
              onClick={() => setIsEmailSent(false)}
              className={styles.emailButton}
              style={{ marginTop: 'var(--space-4)', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-card)', color: 'var(--text-primary)' }}
            >
              Try another method
            </button>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <span className={styles.icon}>⚖</span>
              <h1 className={styles.title}>Join The Tribunal</h1>
              <p className={styles.subtitle}>
                You are scoring evidence quality, not truth.<br />
                You can&apos;t be wrong. Disagreement is the point.
              </p>
            </div>

            {error && (
              <div className={styles.error}>
                Authentication failed: {searchParams.get('msg') || 'Please try again.'}
              </div>
            )}

            <div className={styles.socialButtons}>
              <button
                onClick={() => handleOAuthLogin('twitter')}
                className={styles.socialButton}
              >
                <span className={styles.socialIcon}>𝕏</span>
                Continue with X
              </button>

              <button
                onClick={() => handleOAuthLogin('google')}
                className={styles.socialButton}
              >
                <span className={styles.socialIcon}>G</span>
                Continue with Google
              </button>
            </div>

            <div className={styles.divider}>
              <span>or</span>
            </div>

            <form onSubmit={handleEmailLogin} className={styles.emailForm}>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                <button
                  type="button"
                  onClick={() => setLoginMethod('magic_link')}
                  style={{ flex: 1, padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', background: loginMethod === 'magic_link' ? 'var(--bg-elevated)' : 'transparent', border: '1px solid', borderColor: loginMethod === 'magic_link' ? 'var(--text-primary)' : 'var(--border-subtle)', color: loginMethod === 'magic_link' ? 'var(--text-primary)' : 'var(--text-muted)' }}
                >
                  Magic Link
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('password')}
                  style={{ flex: 1, padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', background: loginMethod === 'password' ? 'var(--bg-elevated)' : 'transparent', border: '1px solid', borderColor: loginMethod === 'password' ? 'var(--text-primary)' : 'var(--border-subtle)', color: loginMethod === 'password' ? 'var(--text-primary)' : 'var(--text-muted)' }}
                >
                  Password
                </button>
              </div>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                className={styles.emailInput}
                disabled={isLoading}
              />
              
              {loginMethod === 'password' && (
                <input
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  required
                  className={styles.emailInput}
                  disabled={isLoading}
                />
              )}

              <button type="submit" className={styles.emailButton} disabled={isLoading}>
                {isLoading ? 'Authenticating...' : loginMethod === 'magic_link' ? 'Send Magic Link' : 'Sign In'}
              </button>
            </form>

            <p className={styles.legal}>
              By continuing, you agree to The Tribunal&apos;s Terms of Service.
              Tribunal scores are community opinion, not fact declarations.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
