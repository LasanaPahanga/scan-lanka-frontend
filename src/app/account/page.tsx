'use client';

import Link from 'next/link';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/components/AuthProvider';
import { authApi } from '@/lib/auth';
import { SavedAddresses } from '@/components/SavedAddresses';
import { textLink } from '@/components/formStyles';

function AccountContent() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const initial = (user.name?.trim() || user.email).charAt(0).toUpperCase();

  async function logoutEverywhere() {
    await authApi.logoutAll();
    await logout();
  }

  return (
    <main className="account-page">
      <h1>Your account</h1>

      {!user.emailVerified && (
        <div className="account-alert">
          Verify your email to save your cart and unlock account features.{' '}
          <a href={`/verify-email?email=${encodeURIComponent(user.email)}`} style={textLink}>
            Verify now
          </a>
        </div>
      )}

      <div className="account-grid">
        <section className="account-card">
          <h2>Profile</h2>
          <div className="account-profile">
            <div className="account-avatar" aria-hidden>
              {initial}
            </div>
            <div className="account-profile-meta">
              <strong>{user.name ?? 'Customer'}</strong>
              <span>{user.email}</span>
              <span>Role: {user.role}</span>
            </div>
          </div>
          <div className="account-actions">
            <button type="button" className="btn-account btn-account--primary" onClick={() => void logout()}>
              Sign out
            </button>
            <button type="button" className="btn-account btn-account--ghost" onClick={() => void logoutEverywhere()}>
              Sign out everywhere
            </button>
          </div>
        </section>

        <section className="account-card">
          <h2>Orders &amp; shopping</h2>
          <div className="account-quick-links">
            <Link href="/account/orders" className="account-quick-link">
              <strong>Order history</strong>
              <span>View past orders and receipts</span>
            </Link>
            <Link href="/orders/lookup" className="account-quick-link">
              <strong>Track guest order</strong>
              <span>Look up an order without signing in</span>
            </Link>
            <Link href="/wishlist" className="account-quick-link">
              <strong>Wishlist</strong>
              <span>Saved products you love</span>
            </Link>
          </div>
        </section>

        {user.emailVerified && (
          <section className="account-card">
            <SavedAddresses />
          </section>
        )}
      </div>
    </main>
  );
}

export default function AccountPage() {
  return (
    <AuthGuard>
      <AccountContent />
    </AuthGuard>
  );
}
