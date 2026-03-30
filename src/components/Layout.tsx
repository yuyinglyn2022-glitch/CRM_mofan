import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, LayoutDashboard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                  <LayoutDashboard className="text-white w-6 h-6" />
                </div>
                <span className="text-xl font-bold tracking-tight">旅程 CRM</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-200">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
                <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                  {user?.email}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                title="退出登录"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pb-20">
        {children}
      </main>
    </div>
  );
}
