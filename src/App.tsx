/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DatabaseProvider, useDatabase } from './context/DatabaseContext';
import { Sidebar } from './components/layout/Sidebar';
import { RoleSwitcherModal } from './components/common/RoleSwitcherModal';

// Admin Components (10 Menus)
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserManagementView } from './components/admin/UserManagementView';
import { AdminAkademikView } from './components/admin/AdminAkademikView';
import { AdminMapelView } from './components/admin/AdminMapelView';
import { AdminJadwalView } from './components/admin/AdminJadwalView';
import { MonitoringReportsView } from './components/admin/MonitoringReportsView';
import { AdminPengaturanView } from './components/admin/AdminPengaturanView';

// Guru Components (10 Menus)
import { GuruDashboard } from './components/guru/GuruDashboard';
import { GuruJadwalView } from './components/guru/GuruJadwalView';
import { ClassMaterialsView } from './components/guru/ClassMaterialsView';
import { AssessmentsView } from './components/guru/AssessmentsView';
import { GuruUjianView } from './components/guru/GuruUjianView';
import { AttendanceView } from './components/guru/AttendanceView';
import { GradebookView } from './components/guru/GradebookView';
import { GuruRaportValidationView } from './components/guru/GuruRaportValidationView';
import { GuruProfileView } from './components/guru/GuruProfileView';

// Siswa Components (10 Menus)
import { SiswaDashboard } from './components/siswa/SiswaDashboard';
import { StudentMaterialsView } from './components/siswa/StudentMaterialsView';
import { StudentAssignmentsView } from './components/siswa/StudentAssignmentsView';
import { StudentOnlineExamView } from './components/siswa/StudentOnlineExamView';
import { StudentAbsensiView } from './components/siswa/StudentAbsensiView';
import { StudentNilaiView } from './components/siswa/StudentNilaiView';
import { StudentReportCardView } from './components/siswa/StudentReportCardView';
import { StudentProfileView } from './components/siswa/StudentProfileView';
import { StudentScheduleView } from './components/siswa/StudentScheduleView';

// Common Integrated Components
import { PerpustakaanOnlineView } from './components/common/PerpustakaanOnlineView';
import { PengumumanPesanView } from './components/common/PengumumanPesanView';

import { LoginPage } from './components/auth/LoginPage';

import {
  Menu,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  Calendar,
  CheckCircle2,
  ChevronRight,
  School,
  Bell,
  LogOut
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, activeAcademicYear, resetDatabase, announcements, isAuthenticated, logout } = useDatabase();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  // Set default initial tab based on role
  const getDefaultTabForRole = (role: string) => {
    switch (role) {
      case 'admin':
        return 'admin-dashboard';
      case 'guru':
        return 'guru-dashboard';
      case 'siswa':
        return 'siswa-dashboard';
      default:
        return 'admin-dashboard';
    }
  };

  const [currentTab, setCurrentTab] = useState<string>(() =>
    getDefaultTabForRole(currentUser.role)
  );

  // RBAC Guard: If role changes, ensure current tab belongs to that role
  useEffect(() => {
    const isTabPermitted = () => {
      if (currentUser.role === 'admin') return currentTab.startsWith('admin-');
      if (currentUser.role === 'guru') return currentTab.startsWith('guru-');
      if (currentUser.role === 'siswa') return currentTab.startsWith('siswa-');
      return false;
    };

    if (!isTabPermitted()) {
      setCurrentTab(getDefaultTabForRole(currentUser.role));
    }
  }, [currentUser.role]);

  // Tab Title helper for Topbar breadcrumb
  const getMenuTitle = () => {
    switch (currentTab) {
      // Siswa
      case 'siswa-dashboard':
        return 'Dashboard Siswa';
      case 'siswa-mapel':
      case 'siswa-materials':
        return 'Mapel (Mata Pelajaran & Materi Belajar)';
      case 'siswa-tugas':
      case 'siswa-assignments':
        return 'Tugas (Pengumpulan & Riwayat Tugas)';
      case 'siswa-ujian':
        return 'Ujian Online (Kuis, CBT, & Evaluasi)';
      case 'siswa-absensi':
        return 'Absensi (Kehadiran Harian & Riwayat)';
      case 'siswa-nilai':
        return 'Nilai (Buku Nilai & Transkrip Harian/UTS/UAS)';
      case 'siswa-raport':
      case 'siswa-report':
        return 'Raport (E-Raport / Hasil Belajar Semester)';
      case 'siswa-perpus':
        return 'Perpustakaan Online (Digital Library / E-Book)';
      case 'siswa-pesan':
        return 'Pengumuman & Pesan (Informasi Sekolah & Chat/Notifikasi)';
      case 'siswa-profil':
      case 'siswa-profile':
        return 'Profil (Biodata & Pengaturan Akun Siswa)';
      case 'siswa-schedule':
        return 'Jadwal Pelajaran Mingguan';

      // Guru
      case 'guru-dashboard':
        return 'Dashboard Guru';
      case 'guru-jadwal':
        return 'Jadwal & Kelas Mengajar';
      case 'guru-materi':
      case 'guru-materials':
        return 'Kelola Mapel & Materi';
      case 'guru-tugas':
      case 'guru-assessments':
        return 'Buat & Koreksi Tugas';
      case 'guru-ujian':
        return 'Kelola Ujian Online';
      case 'guru-absensi':
      case 'guru-attendance':
        return 'Input & Rekap Absensi Siswa';
      case 'guru-nilai':
      case 'guru-gradebook':
        return 'Input & Kelola Nilai Siswa';
      case 'guru-raport':
        return 'Validasi Raport / Catatan Wali Kelas';
      case 'guru-pesan':
        return 'Pengumuman & Pesan';
      case 'guru-profil':
        return 'Profil Guru';

      // Admin
      case 'admin-dashboard':
        return 'Dashboard Admin (Statistik Sistem & Log Aktivitas)';
      case 'admin-users':
        return 'Manajemen Pengguna (Data Siswa, Guru, & Admin)';
      case 'admin-akademik':
      case 'admin-academic':
        return 'Master Data Akademik (Tahun Ajaran, Kurikulum, & Kelas)';
      case 'admin-mapel':
        return 'Kelola Mata Pelajaran Sekolah';
      case 'admin-jadwal':
        return 'Penjadwalan Pelajaran & Ruang Kelas';
      case 'admin-absensi':
        return 'Monitoring Absensi Seluruh Sekolah';
      case 'admin-raport':
      case 'admin-monitoring':
        return 'Monitoring Rekapitulasi Nilai & E-Raport';
      case 'admin-perpus':
        return 'Pengaturan Perpustakaan & E-Book';
      case 'admin-pesan':
      case 'admin-announcements':
        return 'Broadcast Pengumuman & Sistem Pesan';
      case 'admin-pengaturan':
        return 'Pengaturan Sistem & Keamanan';

      default:
        return 'E-Learning SMA PGRI 4 Gandrungmangu';
    }
  };

  // Render view according to current tab with RBAC check
  const renderCurrentView = () => {
    // ADMIN ROLE (10 Menus)
    if (currentUser.role === 'admin') {
      switch (currentTab) {
        case 'admin-dashboard':
          return <AdminDashboard onNavigate={setCurrentTab} />;
        case 'admin-users':
          return <UserManagementView />;
        case 'admin-akademik':
        case 'admin-academic':
          return <AdminAkademikView />;
        case 'admin-mapel':
          return <AdminMapelView />;
        case 'admin-jadwal':
          return <AdminJadwalView />;
        case 'admin-absensi':
          return <MonitoringReportsView initialTab="attendance" />;
        case 'admin-raport':
        case 'admin-monitoring':
          return <MonitoringReportsView initialTab="grades" />;
        case 'admin-perpus':
          return <PerpustakaanOnlineView />;
        case 'admin-pesan':
        case 'admin-announcements':
          return <PengumumanPesanView />;
        case 'admin-pengaturan':
          return <AdminPengaturanView />;
        default:
          return <AdminDashboard onNavigate={setCurrentTab} />;
      }
    }

    // GURU ROLE (10 Menus)
    if (currentUser.role === 'guru') {
      switch (currentTab) {
        case 'guru-dashboard':
          return <GuruDashboard onNavigate={setCurrentTab} />;
        case 'guru-jadwal':
          return <GuruJadwalView onNavigate={setCurrentTab} />;
        case 'guru-materi':
        case 'guru-materials':
          return <ClassMaterialsView />;
        case 'guru-tugas':
        case 'guru-assessments':
          return <AssessmentsView />;
        case 'guru-ujian':
          return <GuruUjianView />;
        case 'guru-absensi':
        case 'guru-attendance':
          return <AttendanceView />;
        case 'guru-nilai':
        case 'guru-gradebook':
          return <GradebookView />;
        case 'guru-raport':
          return <GuruRaportValidationView />;
        case 'guru-pesan':
          return <PengumumanPesanView />;
        case 'guru-profil':
          return <GuruProfileView />;
        default:
          return <GuruDashboard onNavigate={setCurrentTab} />;
      }
    }

    // SISWA ROLE (10 Menus)
    if (currentUser.role === 'siswa') {
      switch (currentTab) {
        case 'siswa-dashboard':
          return <SiswaDashboard onNavigate={setCurrentTab} />;
        case 'siswa-mapel':
        case 'siswa-materials':
          return <StudentMaterialsView />;
        case 'siswa-tugas':
        case 'siswa-assignments':
          return <StudentAssignmentsView />;
        case 'siswa-ujian':
          return <StudentOnlineExamView />;
        case 'siswa-absensi':
          return <StudentAbsensiView />;
        case 'siswa-nilai':
          return <StudentNilaiView />;
        case 'siswa-raport':
        case 'siswa-report':
          return <StudentReportCardView />;
        case 'siswa-perpus':
          return <PerpustakaanOnlineView />;
        case 'siswa-pesan':
          return <PengumumanPesanView />;
        case 'siswa-profil':
        case 'siswa-profile':
          return <StudentProfileView />;
        case 'siswa-schedule':
          return <StudentScheduleView />;
        default:
          return <SiswaDashboard onNavigate={setCurrentTab} />;
      }
    }

    // RBAC Security Fallback
    return (
      <div className="bg-white rounded-xl border border-rose-200 p-12 text-center text-xs space-y-3">
        <ShieldAlert className="w-10 h-10 text-rose-600 mx-auto" />
        <h3 className="text-base font-bold text-rose-900">Akses Tidak Diizinkan (RBAC)</h3>
        <p className="text-slate-500 max-w-md mx-auto">
          Peran akun Anda saat ini tidak memiliki hak akses untuk membuka modul ini. Silakan kembali ke menu beranda utama.
        </p>
        <button
          onClick={() => setCurrentTab(getDefaultTabForRole(currentUser.role))}
          className="px-4 py-2 bg-blue-900 text-white rounded-lg font-medium cursor-pointer"
        >
          Kembali ke Menu Utama
        </button>
      </div>
    );
  };

  // If not authenticated, display official Login Page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased selection:bg-blue-900 selection:text-white">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Wrapper (offset by sidebar on desktop) */}
      <div className="flex-1 flex flex-col md:pl-72 sm:md:pl-80 min-w-0 transition-all duration-300">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs no-print">
          <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            {/* Left: Mobile hamburger & Breadcrumb */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                aria-label="Buka Menu Samping"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium truncate">
                  <span>SMA PGRI 4 Gandrungmangu</span>
                  <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
                  <span className="capitalize font-semibold text-slate-600">
                    {currentUser.role === 'admin'
                      ? 'Admin'
                      : currentUser.role === 'guru'
                      ? 'Guru'
                      : 'Siswa'}
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  {getMenuTitle()}
                </h2>
              </div>
            </div>

            {/* Right: Academic Status & Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Academic Year Tag (hidden on extra small screens) */}
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-700 border border-slate-200">
                <Calendar className="w-3.5 h-3.5 text-blue-900" />
                <span>
                  T.A. {activeAcademicYear.year} ({activeAcademicYear.semester})
                </span>
              </div>

              {/* Quick Role Switcher Button */}
              <button
                onClick={() => setIsSwitcherOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                title="Ganti Peran Pengguna (Admin, Guru, Siswa)"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Simulasi Role</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={() => {
                  if (window.confirm('Keluar dari sistem E-Learning SMA PGRI 4 Gandrungmangu?')) {
                    logout();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                title="Keluar dari akun Anda"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderCurrentView()}
        </main>

        {/* Institutional Footer (Hidden during print) */}
        <footer className="no-print bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/src/assets/images/school_crest_pgri_1794327906967.jpg"
                alt="Logo PGRI"
                className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="font-bold text-slate-900">
                  SMA PGRI 4 Gandrungmangu
                </div>
                <div className="text-[11px] text-slate-500">
                  Sistem Informasi E-Learning & Rapor Digital Terintegrasi Kurikulum Merdeka
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-center sm:text-right">
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      'Kembalikan basis data simulasi ke pengaturan bawaan awal SMA PGRI 4 Gandrungmangu?'
                    )
                  ) {
                    resetDatabase();
                    window.location.reload();
                  }
                }}
                className="flex items-center gap-1.5 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                title="Reset seluruh database simulasi"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Database Awal</span>
              </button>
              <span className="text-slate-300">|</span>
              <span>&copy; {new Date().getFullYear()} SMA PGRI 4 Gandrungmangu. Hak Cipta Dilindungi.</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Role Switcher Modal */}
      {isSwitcherOpen && (
        <RoleSwitcherModal isOpen={isSwitcherOpen} onClose={() => setIsSwitcherOpen(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <DatabaseProvider>
      <AppContent />
    </DatabaseProvider>
  );
}
