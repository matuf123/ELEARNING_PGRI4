import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Calendar,
  Clock,
  MapPin,
  ClipboardList,
  BookOpen,
  Award,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  Bell,
  GraduationCap
} from 'lucide-react';

interface SiswaDashboardProps {
  onNavigate: (tabId: string) => void;
}

export const SiswaDashboard: React.FC<SiswaDashboardProps> = ({ onNavigate }) => {
  const {
    currentUser,
    schedules,
    assignments,
    submissions,
    announcements,
    activeAcademicYear,
    getStudentAttendanceStats,
  } = useDatabase();

  const myClassId = currentUser.classId;

  // Schedules for my class
  const mySchedules = schedules.filter((s) => s.classId === myClassId);

  // Day names in Indonesian
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayDayName = dayNames[new Date().getDay()] || 'Senin';

  // Fallback to 'Senin' or first scheduled day for simulation
  const effectiveDay = mySchedules.some((s) => s.day === todayDayName)
    ? todayDayName
    : mySchedules[0]?.day || 'Senin';

  const todaySchedules = mySchedules.filter((s) => s.day === effectiveDay);

  // Assignments for my class
  const myAssignments = assignments.filter((a) => a.classId === myClassId);

  // Submissions made by this student
  const mySubmissions = submissions.filter((s) => s.studentId === currentUser.id);

  // Unsubmitted assignments
  const pendingAssignments = myAssignments.filter(
    (a) => !mySubmissions.some((s) => s.assignmentId === a.id)
  );

  // Personal attendance stats
  const attendanceStats = getStudentAttendanceStats(currentUser.id);

  // Relevant announcements
  const relevantAnnouncements = announcements.filter(
    (a) => a.targetRole === 'all' || a.targetRole === 'siswa'
  );

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner with Library/Study Background */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 text-white shadow-sm">
        <img
          src="/images/digital_library_study_1794327907820.jpg"
          alt="Siswa Belajar di Perpustakaan"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          referrerPolicy="no-referrer"
        />
        <div className="relative p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Portal Peserta Didik · {currentUser.className || 'Kelas XI'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Halo, {currentUser.name}!
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              NISN: <span className="font-mono text-amber-300 font-semibold">{currentUser.identityNumber}</span> · Tahun Ajaran {activeAcademicYear.year} ({activeAcademicYear.semester}). Tetap semangat belajar dan capai prestasi terbaikmu di SMA PGRI 4 Gandrungmangu!
            </p>
          </div>

          {/* Quick Attendance Badge */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shrink-0 w-full md:w-auto">
            <div className="text-xs text-slate-300 font-medium">Persentase Kehadiran</div>
            <div className="text-3xl font-extrabold text-emerald-400 mt-1 tabular-nums">
              {attendanceStats.percentage}%
            </div>
            <div className="text-[11px] text-slate-300 mt-1">
              Hadir: {attendanceStats.hadir} · Izin: {attendanceStats.izin} · Sakit: {attendanceStats.sakit}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Urgent Deadlines, Today Schedule, Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Urgent Tasks & Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Urgent Assignments Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Tugas & Kuis Mendekati Deadline
                </h3>
                <p className="text-xs text-slate-500">
                  {pendingAssignments.length} tugas aktif belum Anda selesaikan.
                </p>
              </div>
              <button
                onClick={() => onNavigate('siswa-assignments')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Semua Tugas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingAssignments.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-emerald-50/50 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                <p className="font-bold text-emerald-900">Luar biasa! Semua tugas sudah dikerjakan.</p>
                <p className="text-emerald-700 mt-0.5">Tidak ada penugasan tertunda saat ini.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingAssignments.slice(0, 3).map((asg) => (
                  <div
                    key={asg.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50/70 transition-all gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                          {asg.type}
                        </span>
                        <span className="text-xs font-semibold text-slate-900">
                          {asg.subjectName}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {asg.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>Guru: {asg.teacherName}</span>
                        <span>·</span>
                        <span className="font-mono text-rose-700 font-semibold">
                          Batas: {asg.dueDate}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate('siswa-assignments')}
                      className="w-full sm:w-auto px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      Kerjakan Sekarang
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Classes */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Jadwal Pelajaran Hari Ini ({effectiveDay})
                </h3>
                <p className="text-xs text-slate-500">
                  Rombel {currentUser.className || 'Kelas XI'} · Ruang Teori & Praktik Lab
                </p>
              </div>
              <button
                onClick={() => onNavigate('siswa-schedule')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Jadwal Mingguan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todaySchedules.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                Tidak ada jadwal KBM pada hari {effectiveDay}. Manfaatkan waktu untuk belajar mandiri.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {todaySchedules.map((sch) => (
                  <div
                    key={sch.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-600 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{sch.startTime} - {sch.endTime} WIB</span>
                      </span>
                      <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {sch.room}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">
                      {sch.subjectName}
                    </h4>

                    <div className="text-xs text-slate-600 flex items-center gap-1.5 pt-1 border-t border-slate-200/60">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      <span>{sch.teacherName}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Announcements & Shortcuts */}
        <div className="space-y-6">
          {/* Quick Nav Shortcuts */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Akses Cepat Siswa
            </h4>
            <button
              onClick={() => onNavigate('siswa-materials')}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-blue-900" />
                <span className="text-xs font-semibold text-slate-800">Modul & Bahan Belajar</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigate('siswa-report')}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-semibold text-slate-800">Transkrip Nilai & Rapor</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigate('siswa-profile')}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-purple-700" />
                <span className="text-xs font-semibold text-slate-800">Biodata & Keamanan Akun</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Announcements Feed */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Pengumuman Sekolah
              </h4>
              <Bell className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-3">
              {relevantAnnouncements.slice(0, 3).map((ann) => (
                <div key={ann.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                      {ann.priority}
                    </span>
                    <span className="text-[10px] text-slate-400">{ann.date}</span>
                  </div>
                  <h5 className="font-bold text-slate-900 leading-snug">
                    {ann.title}
                  </h5>
                  <p className="text-[11px] text-slate-600 line-clamp-3">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
