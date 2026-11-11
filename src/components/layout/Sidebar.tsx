import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  FileCheck,
  UserCheck,
  Award,
  ScrollText,
  Library,
  Megaphone,
  UserCog,
  CalendarDays,
  ClipboardEdit,
  FileQuestion,
  CheckSquare,
  Users,
  Layers,
  Calendar,
  FileSpreadsheet,
  ShieldCheck,
  Settings,
  Sparkles,
  X,
  ChevronRight,
  School,
  GraduationCap,
  Shield,
  LogOut
} from 'lucide-react';
import { RoleSwitcherModal } from '../common/RoleSwitcherModal';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface MenuItem {
  id: string;
  num: number;
  label: string;
  shortLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string | null;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
}) => {
  const {
    currentUser,
    activeAcademicYear,
    assignments,
    submissions,
    announcements,
    chatMessages,
    getPendingGradingCount,
    logout,
  } = useDatabase();

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  // Dynamic badge calculations
  const pendingAssignmentsForStudent =
    currentUser.role === 'siswa'
      ? assignments.filter(
          (a) =>
            a.classId === currentUser.classId &&
            !submissions.some((s) => s.assignmentId === a.id && s.studentId === currentUser.id)
        ).length
      : 0;

  const pendingGradingForTeacher =
    currentUser.role === 'guru' ? getPendingGradingCount(currentUser.id) : 0;

  const totalAnnouncements = announcements.length;

  // 1. MENU UTAMA SISWA (Wajib Urutan 1-10)
  const siswaMenus: MenuItem[] = [
    {
      id: 'siswa-dashboard',
      num: 1,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'siswa-mapel',
      num: 2,
      label: 'Mapel (Mata Pelajaran & Materi Belajar)',
      icon: BookOpen,
    },
    {
      id: 'siswa-tugas',
      num: 3,
      label: 'Tugas (Pengumpulan & Riwayat Tugas)',
      icon: ClipboardList,
      badge: pendingAssignmentsForStudent > 0 ? pendingAssignmentsForStudent : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'siswa-ujian',
      num: 4,
      label: 'Ujian Online (Kuis, CBT, & Evaluasi)',
      icon: FileQuestion,
    },
    {
      id: 'siswa-absensi',
      num: 5,
      label: 'Absensi (Kehadiran Harian & Riwayat)',
      icon: UserCheck,
    },
    {
      id: 'siswa-nilai',
      num: 6,
      label: 'Nilai (Buku Nilai & Transkrip Harian/UTS/UAS)',
      icon: Award,
    },
    {
      id: 'siswa-raport',
      num: 7,
      label: 'Raport (E-Raport / Hasil Belajar Semester)',
      icon: ScrollText,
    },
    {
      id: 'siswa-perpus',
      num: 8,
      label: 'Perpustakaan Online (Digital Library / E-Book)',
      icon: Library,
    },
    {
      id: 'siswa-pesan',
      num: 9,
      label: 'Pengumuman & Pesan (Informasi Sekolah & Chat/Notifikasi)',
      icon: Megaphone,
      badge: totalAnnouncements > 0 ? totalAnnouncements : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'siswa-profil',
      num: 10,
      label: 'Profil (Biodata & Pengaturan Akun Siswa)',
      icon: UserCog,
    },
  ];

  // 2. MENU GURU (Menyesuaikan & Sinkron dengan Siswa - Urutan 1-10)
  const guruMenus: MenuItem[] = [
    {
      id: 'guru-dashboard',
      num: 1,
      label: 'Dashboard Guru',
      icon: LayoutDashboard,
    },
    {
      id: 'guru-jadwal',
      num: 2,
      label: 'Jadwal & Kelas Mengajar',
      icon: CalendarDays,
    },
    {
      id: 'guru-materi',
      num: 3,
      label: 'Kelola Mapel & Materi',
      icon: BookOpen,
    },
    {
      id: 'guru-tugas',
      num: 4,
      label: 'Buat & Koreksi Tugas',
      icon: ClipboardEdit,
      badge: pendingGradingForTeacher > 0 ? pendingGradingForTeacher : null,
      badgeColor: 'bg-amber-500 text-slate-900 font-bold',
    },
    {
      id: 'guru-ujian',
      num: 5,
      label: 'Kelola Ujian Online',
      icon: FileQuestion,
    },
    {
      id: 'guru-absensi',
      num: 6,
      label: 'Input & Rekap Absensi Siswa',
      icon: UserCheck,
    },
    {
      id: 'guru-nilai',
      num: 7,
      label: 'Input & Kelola Nilai Siswa',
      icon: Award,
    },
    {
      id: 'guru-raport',
      num: 8,
      label: 'Validasi Raport / Catatan Wali Kelas',
      icon: CheckSquare,
    },
    {
      id: 'guru-pesan',
      num: 9,
      label: 'Pengumuman & Pesan',
      icon: Megaphone,
      badge: totalAnnouncements > 0 ? totalAnnouncements : null,
      badgeColor: 'bg-blue-600 text-white',
    },
    {
      id: 'guru-profil',
      num: 10,
      label: 'Profil Guru',
      icon: UserCog,
    },
  ];

  // 3. MENU ADMIN (Kontrol Penuh & Sinkronisasi Sistem - Urutan 1-10)
  const adminMenus: MenuItem[] = [
    {
      id: 'admin-dashboard',
      num: 1,
      label: 'Dashboard Admin (Statistik Sistem & Log Aktivitas)',
      icon: LayoutDashboard,
    },
    {
      id: 'admin-users',
      num: 2,
      label: 'Manajemen Pengguna (Data Siswa, Guru, & Admin)',
      icon: Users,
    },
    {
      id: 'admin-akademik',
      num: 3,
      label: 'Master Data Akademik (Tahun Ajaran, Kurikulum, & Kelas)',
      icon: Layers,
    },
    {
      id: 'admin-mapel',
      num: 4,
      label: 'Kelola Mata Pelajaran Sekolah',
      icon: BookOpen,
    },
    {
      id: 'admin-jadwal',
      num: 5,
      label: 'Penjadwalan Pelajaran & Ruang Kelas',
      icon: Calendar,
    },
    {
      id: 'admin-absensi',
      num: 6,
      label: 'Monitoring Absensi Seluruh Sekolah',
      icon: UserCheck,
    },
    {
      id: 'admin-raport',
      num: 7,
      label: 'Monitoring Rekapitulasi Nilai & E-Raport',
      icon: FileSpreadsheet,
    },
    {
      id: 'admin-perpus',
      num: 8,
      label: 'Pengaturan Perpustakaan & E-Book',
      icon: Library,
    },
    {
      id: 'admin-pesan',
      num: 9,
      label: 'Broadcast Pengumuman & Sistem Pesan',
      icon: Megaphone,
    },
    {
      id: 'admin-pengaturan',
      num: 10,
      label: 'Pengaturan Sistem & Keamanan',
      icon: ShieldCheck,
    },
  ];

  // Pick current role menus
  const activeMenus =
    currentUser.role === 'admin'
      ? adminMenus
      : currentUser.role === 'guru'
      ? guruMenus
      : siswaMenus;

  const handleMenuClick = (id: string) => {
    onSelectTab(id);
    onCloseMobile();
  };

  const getRoleLabel = () => {
    switch (currentUser.role) {
      case 'admin':
        return {
          title: 'Administrator',
          badge: 'Admin Sistem',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      case 'guru':
        return {
          title: 'Dewan Guru',
          badge: 'Guru Pengampu',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      case 'siswa':
        return {
          title: 'Peserta Didik',
          badge: 'Siswa Aktif',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
        };
    }
  };

  const roleInfo = getRoleLabel();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header: School Branding */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-linear-to-b from-blue-950 to-slate-900 text-white shrink-0 relative">
          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden absolute top-4 right-4 p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <img
              src="/images/school_crest_pgri_1794327906967.jpg"
              alt="Logo SMA PGRI 4"
              className="w-11 h-11 rounded-full border-2 border-amber-400/80 shadow-md object-cover bg-white shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <h1 className="font-extrabold text-white text-sm sm:text-base leading-tight tracking-tight truncate">
                SMA PGRI 4
              </h1>
              <div className="text-[11px] font-semibold text-amber-400 tracking-wider uppercase truncate">
                Gandrungmangu
              </div>
              <div className="text-[10px] text-slate-300 font-mono mt-0.5 truncate">
                NPSN: 20300712 · Cilacap
              </div>
            </div>
          </div>

          {/* Academic Info Strip */}
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>T.A. {activeAcademicYear.year} ({activeAcademicYear.semester})</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${roleInfo.color}`}
            >
              {roleInfo.badge}
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
            <span>Menu Utama ({activeMenus.length})</span>
            <span className="font-mono text-[9px] text-slate-400">Kurikulum Merdeka</span>
          </div>

          <nav className="space-y-1" aria-label="Menu Samping">
            {activeMenus.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group cursor-pointer relative ${
                    isActive
                      ? 'bg-blue-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-blue-950 hover:bg-slate-100/90 font-medium'
                  }`}
                >
                  {/* Left Active Notch */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1.5 bg-amber-400 rounded-r-full" />
                  )}

                  {/* Icon & Sequence Number */}
                  <div
                    className={`p-1.5 rounded-lg shrink-0 transition-colors mt-0.5 ${
                      isActive
                        ? 'bg-white/15 text-amber-300'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Menu Label & Sequence */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-mono px-1 rounded ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200/60 text-slate-500'
                        }`}
                      >
                        {item.num}
                      </span>
                      <span className="text-xs leading-snug break-words">
                        {item.label}
                      </span>
                    </div>
                  </div>

                  {/* Notification Badge */}
                  {item.badge !== undefined && item.badge !== null && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 tabular-nums self-center ${
                        item.badgeColor || 'bg-blue-600 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer: User Profile & Quick Role Switcher */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/80 shrink-0 space-y-2">
          {/* User Profile Card */}
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-900 to-indigo-900 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>

            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs text-slate-900 truncate">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-slate-500 truncate font-mono">
                {currentUser.role === 'admin'
                  ? 'Administrator Utama'
                  : currentUser.role === 'guru'
                  ? `NIP: ${currentUser.identityNumber || '-'}`
                  : `NISN: ${currentUser.identityNumber || '-'}`}
              </div>
            </div>
          </div>

          {/* Quick Simulation Role Switcher and Logout Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsSwitcherOpen(true)}
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300/60 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              title="Ganti Peran Pengguna (Simulasi)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Ganti Role</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Keluar dari sistem E-Learning SMA PGRI 4 Gandrungmangu?')) {
                  logout();
                }
              }}
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              title="Keluar dari akun Anda"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Role Switcher Modal */}
      {isSwitcherOpen && (
        <RoleSwitcherModal isOpen={isSwitcherOpen} onClose={() => setIsSwitcherOpen(false)} />
      )}
    </>
  );
};
