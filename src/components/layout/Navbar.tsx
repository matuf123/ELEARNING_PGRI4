import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Users,
  Calendar,
  BookOpen,
  ClipboardList,
  Award,
  Layers,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  School,
  Clock,
  RotateCcw
} from 'lucide-react';
import { RoleSwitcherModal } from '../common/RoleSwitcherModal';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const { currentUser, activeAcademicYear, getPendingGradingCount, resetDatabase } = useDatabase();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Tab definitions based on active role
  const getNavLinks = () => {
    switch (currentUser.role) {
      case 'admin':
        return [
          { id: 'admin-dashboard', label: 'Dashboard' },
          { id: 'admin-users', label: 'Manajemen Pengguna' },
          { id: 'admin-academic', label: 'Akademik & Kurikulum' },
          { id: 'admin-monitoring', label: 'Monitoring & Laporan' },
          { id: 'admin-announcements', label: 'Pengumuman' },
        ];
      case 'guru':
        return [
          { id: 'guru-dashboard', label: 'Dashboard' },
          { id: 'guru-materials', label: 'Materi & Kelas' },
          { id: 'guru-assessments', label: 'Tugas & Kuis' },
          { id: 'guru-gradebook', label: 'Buku Nilai (Rapor)' },
          { id: 'guru-attendance', label: 'Presensi Siswa' },
        ];
      case 'siswa':
        return [
          { id: 'siswa-dashboard', label: 'Dashboard' },
          { id: 'siswa-schedule', label: 'Jadwal & Kalender' },
          { id: 'siswa-materials', label: 'Modul Belajar' },
          { id: 'siswa-assignments', label: 'Tugas & Kuis' },
          { id: 'siswa-report', label: 'Transkrip & Rapor' },
          { id: 'siswa-profile', label: 'Profil Saya' },
        ];
    }
  };

  const navLinks = getNavLinks();
  const pendingGrading = currentUser.role === 'guru' ? getPendingGradingCount(currentUser.id) : 0;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        {/* Top utility alert / Academic Year strip */}
        <div className="bg-slate-900 text-slate-300 text-[11px] px-6 py-1.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white tracking-wide">
              SMA PGRI 4 GANDRUNGMANGU
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">
              Tahun Ajaran: <strong className="text-amber-400 font-medium">{activeAcademicYear.year} ({activeAcademicYear.semester})</strong>
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-emerald-400">Kurikulum Merdeka</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSwitcherOpen(true)}
              className="text-amber-300 hover:text-amber-200 font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Simulasi Ganti Role</span>
            </button>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 hidden md:inline">
              NPSN: 20300481 · Gandrungmangu, Cilacap
            </span>
          </div>
        </div>

        {/* 3-Zone Top Bar Contract */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single Brand element */}
          <div className="flex items-center gap-3 shrink-0">
            <img
              src="/src/assets/images/school_crest_pgri_1794327906967.jpg"
              alt="Logo SMA PGRI 4 Gandrungmangu"
              className="w-10 h-10 object-contain rounded-full shadow-xs border border-slate-200"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={() => onSelectTab(navLinks[0].id)}
              className="text-left cursor-pointer group"
            >
              <div className="text-base font-bold text-slate-900 tracking-tight leading-tight group-hover:text-blue-900 transition-colors">
                E-Learning SMA PGRI 4
              </div>
              <div className="text-[11px] text-slate-500 font-medium leading-none">
                Gandrungmangu · Cilacap
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Clean single-line prose) */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onSelectTab(link.id)}
                  className={`relative text-sm font-medium whitespace-nowrap transition-colors py-2 cursor-pointer ${
                    isActive
                      ? 'text-blue-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                  {link.id === 'guru-assessments' && pendingGrading > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                      {pendingGrading}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-900 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action / User Profile Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsSwitcherOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left cursor-pointer"
              title="Klik untuk mengganti akun atau simulasi role"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs uppercase">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[130px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-500 capitalize leading-none">
                  Role: <span className="font-semibold text-blue-700">{currentUser.role}</span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Mobile menu hamburger toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Buka Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    onSelectTab(link.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg font-medium transition-colors flex items-center justify-between ${
                    isActive
                      ? 'bg-blue-50 text-blue-900 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.id === 'guru-assessments' && pendingGrading > 0 && (
                    <span className="px-1.5 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                      {pendingGrading}
                    </span>
                  )}
                </button>
              );
            })}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSwitcherOpen(true);
                }}
                className="w-full text-center py-2 px-3 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg border border-amber-200"
              >
                Ganti Akun / Role Simulasi
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Role Switcher Modal */}
      <RoleSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />
    </>
  );
};
