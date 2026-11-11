import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Calendar,
  Clock,
  MapPin,
  FileCheck,
  BookOpen,
  Award,
  Users,
  AlertCircle,
  ChevronRight,
  Sparkles,
  ClipboardList
} from 'lucide-react';

interface GuruDashboardProps {
  onNavigate: (tabId: string) => void;
}

export const GuruDashboard: React.FC<GuruDashboardProps> = ({ onNavigate }) => {
  const {
    currentUser,
    schedules,
    assignments,
    submissions,
    announcements,
    activeAcademicYear,
    getPendingGradingCount,
  } = useDatabase();

  // Filter schedules taught by this guru
  const mySchedules = schedules.filter((s) => s.teacherId === currentUser.id);

  // In Indonesian day names
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayDayName = dayNames[new Date().getDay()] || 'Senin';

  // For simulation if today has no schedules, let's fallback to 'Senin' or first available schedule day
  const effectiveDay = mySchedules.some((s) => s.day === todayDayName)
    ? todayDayName
    : mySchedules[0]?.day || 'Senin';

  const todaySchedules = mySchedules.filter((s) => s.day === effectiveDay);

  // Pending grading count
  const pendingCount = getPendingGradingCount(currentUser.id);

  // Announcements targeted to guru or all
  const relevantAnnouncements = announcements.filter(
    (a) => a.targetRole === 'all' || a.targetRole === 'guru'
  );

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-sm border border-blue-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Portal Pendidik · Kurikulum Merdeka</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Selamat Datang, {currentUser.name}
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
            NIP: {currentUser.identityNumber} · Tahun Ajaran {activeAcademicYear.year} ({activeAcademicYear.semester}). Anda memiliki {mySchedules.length} jam pertemuan terjadwal minggu ini.
          </p>
        </div>

        {/* Quick Pending Grading Action Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shrink-0 w-full md:w-auto">
          <div className="text-xs text-blue-200 font-medium">Tugas Belum Dikoreksi</div>
          <div className="text-3xl font-extrabold text-white mt-1 tabular-nums">
            {pendingCount}
          </div>
          <button
            onClick={() => onNavigate('guru-assessments')}
            className="mt-3 w-full px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Koreksi Sekarang</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Today's Schedule & Pending Assessments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Schedule & Quick Navigation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Teaching Schedule */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Jadwal Mengajar Hari Ini ({effectiveDay})
                </h3>
                <p className="text-xs text-slate-500">
                  Daftar kelas tatap muka yang perlu dipresensi dan materi ajar.
                </p>
              </div>
              <button
                onClick={() => onNavigate('guru-attendance')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Form Presensi</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todaySchedules.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                Tidak ada jadwal mengajar pada hari {effectiveDay}. Anda dapat mempersiapkan materi atau memeriksa tugas siswa.
              </div>
            ) : (
              <div className="space-y-3">
                {todaySchedules.map((sch) => (
                  <div
                    key={sch.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 hover:border-blue-300 transition-all gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-900 bg-blue-100/80 px-2.5 py-0.5 rounded text-xs">
                          {sch.className}
                        </span>
                        <span className="text-xs font-semibold text-slate-900">
                          {sch.subjectName}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono">{sch.startTime} - {sch.endTime} WIB</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{sch.room}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => onNavigate('guru-attendance')}
                        className="flex-1 sm:flex-none px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                      >
                        Isi Absensi
                      </button>
                      <button
                        onClick={() => onNavigate('guru-materials')}
                        className="flex-1 sm:flex-none px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                      >
                        Bahan Ajar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Teacher Quick Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => onNavigate('guru-materials')}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition-all text-left cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="text-sm font-bold text-slate-900">Manajemen Materi</div>
              <div className="text-xs text-slate-500 mt-1">
                Upload modul PDF, link video, dan materi ajar.
              </div>
            </button>

            <button
              onClick={() => onNavigate('guru-assessments')}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-xs transition-all text-left cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <ClipboardList className="w-4 h-4" />
              </div>
              <div className="text-sm font-bold text-slate-900">Tugas & Kuis</div>
              <div className="text-xs text-slate-500 mt-1">
                Buat asesmen mandiri, bank soal, dan koreksi jawaban.
              </div>
            </button>

            <button
              onClick={() => onNavigate('guru-gradebook')}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 hover:shadow-xs transition-all text-left cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-sm font-bold text-slate-900">Buku Nilai Rapor</div>
              <div className="text-xs text-slate-500 mt-1">
                Input nilai harian, PTS, PAS, dan capaian kompetensi.
              </div>
            </button>
          </div>
        </div>

        {/* Right Col: Announcements & Info Feed */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Pengumuman Sekolah</h3>
            <span className="text-[11px] text-slate-400">SMA PGRI 4</span>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[460px] pr-1">
            {relevantAnnouncements.length === 0 ? (
              <div className="text-xs text-slate-400 py-6 text-center">
                Belum ada pengumuman saat ini.
              </div>
            ) : (
              relevantAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      {ann.priority}
                    </span>
                    <span className="text-[11px] text-slate-400">{ann.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {ann.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {ann.content}
                  </p>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                    Oleh: {ann.authorName}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
