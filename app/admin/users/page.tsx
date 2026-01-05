'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  isPlatformAdmin: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user?.id) {
      router.push('/auth/signin');
      return;
    }

    fetchUsers();
  }, [status, session, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    setUpdating(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPlatformAdmin: !currentStatus }),
      });

      if (!response.ok) throw new Error('Failed to update user');
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, isPlatformAdmin: !currentStatus } : u
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setUpdating(null);
    }
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
    (u.name?.toLowerCase().includes(searchEmail.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-brand-light py-10">
      <div className="mx-auto max-w-7xl px-4">
        {/* Back Button */}
        <Link href="/admin" className="text-brand-primary hover:text-brand-secondary mb-4 inline-block font-semibold">
          ← Back to Admin Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-dark">Manage Users</h1>
          <p className="text-brand-secondary mt-2">View all users and manage admin access</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg font-semibold">
            {error}
          </div>
        )}

        {/* Search Box */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="w-full max-w-md border border-brand-accent/30 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          />
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="text-center py-8 text-brand-secondary">Loading users...</div>
        ) : filteredUsers.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-brand-light border-b border-brand-accent/20">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-brand-dark">Email</th>
                    <th className="px-6 py-4 text-left font-semibold text-brand-dark">Name</th>
                    <th className="px-6 py-4 text-left font-semibold text-brand-dark">Phone</th>
                    <th className="px-6 py-4 text-left font-semibold text-brand-dark">Admin Status</th>
                    <th className="px-6 py-4 text-left font-semibold text-brand-dark">Joined</th>
                    <th className="px-6 py-4 text-left font-semibold text-brand-dark">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-brand-accent/10 hover:bg-brand-light/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-brand-dark">{user.email}</td>
                      <td className="px-6 py-4 text-brand-secondary">{user.name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-brand-secondary">{user.phone || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          user.isPlatformAdmin
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.isPlatformAdmin ? '✓ Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-brand-secondary">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleAdmin(user.id, user.isPlatformAdmin)}
                          disabled={updating === user.id}
                          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                            user.isPlatformAdmin
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'bg-green-100 text-green-600 hover:bg-green-200'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {updating === user.id
                            ? 'Updating...'
                            : user.isPlatformAdmin
                            ? 'Remove Admin'
                            : 'Make Admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-8 text-center">
            <p className="text-brand-secondary">No users found</p>
          </div>
        )}

        {/* Summary */}
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="bg-white rounded-lg p-4 border border-brand-accent/20">
            <p className="text-sm text-brand-secondary">Total Users</p>
            <p className="text-2xl font-bold text-brand-dark">{users.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-brand-accent/20">
            <p className="text-sm text-brand-secondary">Admins</p>
            <p className="text-2xl font-bold text-green-600">{users.filter(u => u.isPlatformAdmin).length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-brand-accent/20">
            <p className="text-sm text-brand-secondary">Regular Users</p>
            <p className="text-2xl font-bold text-blue-600">{users.filter(u => !u.isPlatformAdmin).length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
