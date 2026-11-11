import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  FileCheck,
  ShieldAlert,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (tabId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const {
    users,
    classes,
    subjects,
    schedules,
    grades,
    systemLogs,
    academicYears,
    activeAcademicYear,
    setActiveAcademicYear,
    getSchoolAttendanceStats,
  } = useDatabase();

  const totalSiswa = users.filter((u) => u.role === 'siswa').length;
  const totalGuru = users.filter((u) => u.role === 'guru').length;
  const totalAdmin = users.filter((u) => u.role === 'admin').length;
  const totalKelas = classes.length;
  const totalMapel = subjects.length;

  const schoolAttendance = getSchoolAttendanceStats();

  // Calculate grade completion: how many scheduled subjects have grades recorded
  const totalSchedules = schedules.length;
  const gradesRecorded = grades.length;
  const gradeCompletionRate = totalSchedules > 0 ? Math.min(100, Math.round((gradesRecorded / (totalSchedules * 4)) * 100)) : 85;

  return (
    <div className="space-y-6">
      {/* Top Banner with Campus Image & Active Year Control */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 text-white shadow-sm">
        <img
          src="/src/assets/images/sma_pgri_campus_1794327907338.jpg"
          alt="Gedung SMA PGRI 4 Gandrungmangu"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
          referrerPolicy="no-referrer"
        />
        <div className="relative p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Portal Pengelola Utama Sekolah
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              SMA PGRI 4 Gandrungmangu
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Pusat kendali operasional pembelajaran digital, data pokok kependidikan, sinkronisasi kurikulum merdeka, dan monitoring akademik terintegrasi.
            </p>
          </div>

          {/* Academic Year Control Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shrink-0 w-full md:w-auto">
            <div className="text-xs text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              <span>Tahun Ajaran Aktif</span>
            </div>
            <select
              value={activeAcademicYear.id}
              onChange={(e) => setActiveAcademicYear(e.target.value)}
              className="w-full bg-slate-800 text-white text-xs font-semibold rounded-lg px-3 py-2 border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>
                  TP {ay.year} · Semester {ay.semester} {ay.isActive ? '(Aktif)' : ''}
                </option>
              ))}
            </select>
            <div className="text-[11px] text-slate-400 mt-2">
              Status Sinkronisasi:{' '}
              <span className="text-emerald-400 font-semibold">Tersambung (Online)</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Siswa */}
        <div
          onClick={() => onNavigate('admin-users')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Siswa
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {totalSiswa}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>Aktif di {totalKelas} Rombel</span>
              <ArrowUpRight className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Total Guru */}
        <div
          onClick={() => onNavigate('admin-users')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Guru Pengampu
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {totalGuru}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>Tersertifikasi & Terdaftar</span>
              <ArrowUpRight className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Rombel / Kelas */}
        <div
          onClick={() => onNavigate('admin-academic')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Rombel / Kelas
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {totalKelas}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>Fase E (X) & Fase F (XI-XII)</span>
              <ArrowUpRight className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Total Mata Pelajaran */}
        <div
          onClick={() => onNavigate('admin-academic')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Mata Pelajaran
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {totalMapel}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>Wajib, Pilihan & Mulok</span>
              <ArrowUpRight className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Section: Quick Modules & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Operational Highlights & Shortcut Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* School Performance Metrics */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Ringkasan Kinerja & Monitoring Sekolah
                </h3>
                <p className="text-xs text-slate-500">
                  Data agregat presensi kehadiran dan pengumpulan nilai rapor semester ini.
                </p>
              </div>
              <button
                onClick={() => onNavigate('admin-monitoring')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Laporan Lengkap</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Presensi Agregat */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Rata-rata Presensi Siswa</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Sangat Baik
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-slate-900 mt-2 tabular-nums">
                  {schoolAttendance.rate}%
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${schoolAttendance.rate}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-2">
                  <span>Hadir: {schoolAttendance.hadirCount}</span>
                  <span>Izin: {schoolAttendance.izinCount}</span>
                  <span>Sakit: {schoolAttendance.sakitCount}</span>
                  <span>Alpa: {schoolAttendance.alpaCount}</span>
                </div>
              </div>

              {/* Progress Nilai Rapor */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Progres Nilai Rapor Guru</span>
                  <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    Sedang Berjalan
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-slate-900 mt-2 tabular-nums">
                  {gradeCompletionRate}%
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${gradeCompletionRate}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-2">
                  <span>Terisi: {gradesRecorded} Nilai</span>
                  <span>Target: Semester Gasal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => onNavigate('admin-users')}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition-all text-left cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <div className="text-sm font-bold text-slate-900">Kelola Pengguna</div>
              <div className="text-xs text-slate-500 mt-1">
                Input satuan atau Import massal via Excel/CSV.
              </div>
            </button>

            <button
              onClick={() => onNavigate('admin-academic')}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 hover:shadow-xs transition-all text-left cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="text-sm font-bold text-slate-900">Jadwal & Rombel</div>
              <div className="text-xs text-slate-500 mt-1">
                Mapping guru pengampu, kelas, hari, dan jam tatap muka.
              </div>
            </button>

            <button
              onClick={() => onNavigate('admin-announcements')}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-amber-400 hover:shadow-xs transition-all text-left cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FileCheck className="w-4 h-4" />
              </div>
              <div className="text-sm font-bold text-slate-900">Pengumuman Sekolah</div>
              <div className="text-xs text-slate-500 mt-1">
                Siarkan agenda resmi kepada guru dan siswa.
              </div>
            </button>
          </div>
        </div>

        {/* Right Col: Real-Time System Activity Feed */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Log Aktivitas Sistem</h3>
              <p className="text-xs text-slate-500">Sinkronisasi aksi antar-role terkini</p>
            </div>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[460px] pr-1">
            {systemLogs.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-8">
                Belum ada aktivitas tercatat.
              </div>
            ) : (
              systemLogs.map((log) => {
                const getRoleBadgeColor = (role: string) => {
                  switch (role) {
                    case 'admin':
                      return 'bg-amber-100 text-amber-800';
                    case 'guru':
                      return 'bg-blue-100 text-blue-800';
                    case 'siswa':
                      return 'bg-emerald-100 text-emerald-800';
                    default:
                      return 'bg-slate-100 text-slate-800';
                  }
                };

                return (
                  <div key={log.id} className="text-xs border-b border-slate-100 pb-3 last:border-none">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${getRoleBadgeColor(log.role)}`}>
                          {log.role}
                        </span>
                        <span className="font-semibold text-slate-900 truncate">
                          {log.userName}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {log.timestamp}
                      </span>
                    </div>
                    <div className="font-medium text-slate-700 mt-1">
                      {log.action}
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                      {log.details}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
