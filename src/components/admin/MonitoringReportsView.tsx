import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  Download,
  Calendar,
  BarChart3,
  TrendingUp,
  Percent
} from 'lucide-react';

interface MonitoringReportsViewProps {
  initialTab?: 'attendance' | 'grades';
}

export const MonitoringReportsView: React.FC<MonitoringReportsViewProps> = ({ initialTab = 'attendance' }) => {
  const {
    attendances,
    classes,
    subjects,
    schedules,
    users,
    grades,
    activeAcademicYear,
    getSchoolAttendanceStats,
  } = useDatabase();

  const [reportType, setReportType] = useState<'attendance' | 'grades'>(initialTab);

  const attendanceStats = getSchoolAttendanceStats();
  const teachers = users.filter((u) => u.role === 'guru');

  // Calculate teacher grade submission status
  const teacherStatusList = teachers.map((teacher) => {
    // schedules taught by this teacher
    const teacherSchedules = schedules.filter((s) => s.teacherId === teacher.id);
    const assignedClasses = Array.from(new Set(teacherSchedules.map((s) => s.classId)));

    let totalExpectedSubmissions = 0;
    let actualGradesRecorded = 0;

    teacherSchedules.forEach((sch) => {
      const studentsInClass = users.filter((u) => u.role === 'siswa' && u.classId === sch.classId);
      totalExpectedSubmissions += studentsInClass.length;

      const recorded = grades.filter(
        (g) =>
          g.classId === sch.classId &&
          g.subjectId === sch.subjectId &&
          g.academicYearId === activeAcademicYear.id
      );
      actualGradesRecorded += recorded.length;
    });

    const completionRate =
      totalExpectedSubmissions > 0
        ? Math.min(100, Math.round((actualGradesRecorded / totalExpectedSubmissions) * 100))
        : 100;

    return {
      teacher,
      teacherSchedules,
      assignedClassesCount: assignedClasses.length,
      totalExpectedSubmissions,
      actualGradesRecorded,
      completionRate,
      isComplete: completionRate >= 90,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Monitoring & Laporan Terpadu</h2>
          <p className="text-xs text-slate-500 mt-1">
            Pengawasan rekapitulasi kehadiran warga sekolah dan kepatuhan pengumpulan nilai rapor guru.
          </p>
        </div>

        {/* Report Selector Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setReportType('attendance')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md transition-colors cursor-pointer ${
              reportType === 'attendance'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Rekap Kehadiran Sekolah</span>
          </button>

          <button
            onClick={() => setReportType('grades')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md transition-colors cursor-pointer ${
              reportType === 'grades'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Monitoring Nilai Rapor Guru</span>
          </button>
        </div>
      </div>

      {/* REPORT TYPE: ATTENDANCE */}
      {reportType === 'attendance' && (
        <div className="space-y-6">
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Tingkat Kehadiran (Hadir)
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-2 tabular-nums">
                {attendanceStats.rate}%
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {attendanceStats.hadirCount} presensi hadir tercatat
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Izin
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-700 mt-2 tabular-nums">
                {attendanceStats.izinCount}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Dengan surat izin sah
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Sakit
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 mt-2 tabular-nums">
                {attendanceStats.sakitCount}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Surat keterangan dokter
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Tanpa Keterangan (Alpa)
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-700 mt-2 tabular-nums">
                {attendanceStats.alpaCount}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Perlu tindak lanjut BK
              </div>
            </div>
          </div>

          {/* Attendance Sessions Log Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Daftar Sesi Presensi KBM Harian
                </h3>
                <p className="text-xs text-slate-500">
                  Riwayat absensi yang telah diisi langsung oleh guru saat jam pelajaran.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Tanggal & Sesi</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4">Mata Pelajaran</th>
                    <th className="py-3 px-4">Guru Pengampu</th>
                    <th className="py-3 px-4">Materi / Topik Bahasan</th>
                    <th className="py-3 px-4 text-center">Rekap Peserta (H / I / S / A)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendances.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        Belum ada data presensi yang dimasukkan.
                      </td>
                    </tr>
                  ) : (
                    attendances.map((att) => {
                      const h = att.records.filter((r) => r.status === 'Hadir').length;
                      const i = att.records.filter((r) => r.status === 'Izin').length;
                      const s = att.records.filter((r) => r.status === 'Sakit').length;
                      const a = att.records.filter((r) => r.status === 'Alpa').length;

                      return (
                        <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-medium text-slate-900">
                            <div>{att.date}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{att.sessionHour}</div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded text-[11px] border border-blue-200">
                              {att.className}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {att.subjectName}
                          </td>

                          <td className="py-3 px-4 text-slate-700">
                            {att.teacherName}
                          </td>

                          <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                            {att.topic || '-'}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex items-center gap-1.5 font-mono text-[11px]">
                              <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">H: {h}</span>
                              <span className="text-blue-700 font-medium bg-blue-50 px-1.5 py-0.5 rounded">I: {i}</span>
                              <span className="text-amber-700 font-medium bg-amber-50 px-1.5 py-0.5 rounded">S: {s}</span>
                              <span className="text-rose-700 font-medium bg-rose-50 px-1.5 py-0.5 rounded">A: {a}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT TYPE: GRADES MONITORING */}
      {reportType === 'grades' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Status Pengumpulan Nilai Rapor Digital per Guru Pengampu
                </h3>
                <p className="text-xs text-slate-500">
                  Monitoring kesiapan pengisian nilai formatif, sumatif tengah semester (PTS), sumatif akhir semester (PAS), dan capaian kompetensi Kurikulum Merdeka.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Nama Guru & NIP</th>
                    <th className="py-3 px-4">Kelas & Mapel yang Diampu</th>
                    <th className="py-3 px-4 text-center">Total Target Siswa</th>
                    <th className="py-3 px-4 text-center">Nilai Terinput</th>
                    <th className="py-3 px-4">Progres Persentase</th>
                    <th className="py-3 px-4 text-center">Status Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teacherStatusList.map((item) => (
                    <tr key={item.teacher.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.teacher.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">NIP: {item.teacher.identityNumber}</div>
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        {item.teacherSchedules.length > 0 ? (
                          <div className="space-y-0.5">
                            {item.teacherSchedules.map((s) => (
                              <div key={s.id} className="text-[11px]">
                                <span className="font-semibold text-slate-900">{s.subjectName}</span> · {s.className}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400">Belum ada kelas terjadwal</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-slate-800 tabular-nums">
                        {item.totalExpectedSubmissions} Siswa
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-blue-900 tabular-nums">
                        {item.actualGradesRecorded} Siswa
                      </td>

                      <td className="py-3 px-4">
                        <div className="w-36 space-y-1">
                          <div className="flex justify-between text-[11px] font-semibold">
                            <span>{item.completionRate}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                item.completionRate >= 90
                                  ? 'bg-emerald-600'
                                  : item.completionRate >= 50
                                  ? 'bg-blue-600'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${item.completionRate}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {item.isComplete ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Lengkap & Siap Cetak</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Proses Pengisian</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
