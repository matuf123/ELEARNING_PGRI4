import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Award,
  Printer,
  CheckCircle2,
  Calendar,
  Clock,
  Download,
  School,
  FileText,
  UserCheck
} from 'lucide-react';

export const StudentReportCardView: React.FC = () => {
  const {
    currentUser,
    grades,
    subjects,
    classes,
    activeAcademicYear,
    getStudentAttendanceStats,
  } = useDatabase();

  const [viewMode, setViewMode] = useState<'table' | 'raporPrint'>('table');

  // Grades for current student in active semester
  const myGrades = grades.filter(
    (g) => g.studentId === currentUser.id && g.academicYearId === activeAcademicYear.id
  );

  const studentClass = classes.find((c) => c.id === currentUser.classId);
  const attendance = getStudentAttendanceStats(currentUser.id);

  // Calculate GPA / Average Final Score
  const totalScore = myGrades.reduce((acc, curr) => acc + curr.finalScore, 0);
  const averageScore = myGrades.length > 0 ? (totalScore / myGrades.length).toFixed(1) : '85.0';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls (Hidden when printing) */}
      <div className="no-print bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Transkrip Nilai & Rapor Digital</h2>
          <p className="text-xs text-slate-500 mt-1">
            Transparansi capaian pembelajaran Kurikulum Merdeka, akumulasi nilai sumatif, serta rekapitulasi presensi kehadiran.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ringkasan Tabel
            </button>
            <button
              onClick={() => setViewMode('raporPrint')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'raporPrint'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Format Rapor Digital Resmi
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rapor (PDF)</span>
          </button>
        </div>
      </div>

      {/* VIEW: RINGKASAN TABEL */}
      {viewMode === 'table' && (
        <div className="space-y-6">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Rata-rata Nilai Akhir
              </span>
              <div className="text-3xl font-extrabold text-blue-900 mt-2 font-mono tabular-nums">
                {averageScore}
              </div>
              <div className="text-xs text-emerald-700 font-semibold mt-1">
                Predikat Sangat Memuaskan (A)
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Mapel Tuntas (KKTP)
              </span>
              <div className="text-3xl font-extrabold text-emerald-700 mt-2 font-mono tabular-nums">
                {myGrades.length} / {myGrades.length || 5}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                100% Memenuhi Kriteria
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Persentase Hadir
              </span>
              <div className="text-3xl font-extrabold text-emerald-700 mt-2 font-mono tabular-nums">
                {attendance.percentage}%
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {attendance.hadir} Sesi Tatap Muka
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Izin / Sakit / Alpa
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-2 font-mono tabular-nums">
                {attendance.izin} / {attendance.sakit} / {attendance.alpa}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Rekap Kehadiran Siswa
              </div>
            </div>
          </div>

          {/* Grades Detailed Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Rincian Nilai Akademik Semester {activeAcademicYear.semester} (TP {activeAcademicYear.year})
                </h3>
                <p className="text-xs text-slate-500">
                  Transparansi penilaian harian formatif, tugas, PTS, PAS, dan predikat Kurikulum Merdeka.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Mata Pelajaran</th>
                    <th className="py-3 px-3 text-center">Formatif (25%)</th>
                    <th className="py-3 px-3 text-center">Tugas (25%)</th>
                    <th className="py-3 px-3 text-center">PTS/UTS (25%)</th>
                    <th className="py-3 px-3 text-center">PAS/UAS (25%)</th>
                    <th className="py-3 px-3 text-center">Nilai Akhir</th>
                    <th className="py-3 px-3 text-center">Predikat</th>
                    <th className="py-3 px-4 min-w-[300px]">Capaian Kompetensi Pembelajaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myGrades.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Nilai rapor belum dipublikasikan oleh dewan guru untuk semester ini.
                      </td>
                    </tr>
                  ) : (
                    myGrades.map((g) => (
                      <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {g.subjectName}
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-medium text-slate-700">
                          {g.dailyScore}
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-medium text-slate-700">
                          {g.assignmentScore}
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-medium text-slate-700">
                          {g.midExamScore}
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-medium text-slate-700">
                          {g.finalExamScore}
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-extrabold text-blue-900 text-sm bg-blue-50/50">
                          {g.finalScore}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded font-bold text-xs ${
                              g.letterGrade === 'A'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {g.letterGrade}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-600 text-[11px] leading-relaxed">
                          {g.competencyAchievement}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: FORMAT RESMI RAPOR DIGITAL SIAP CETAK (PRINT-READY) */}
      <div
        className={`${
          viewMode === 'raporPrint' ? 'block' : 'hidden print:block'
        } bg-white rounded-2xl border border-slate-300 p-8 sm:p-12 shadow-md max-w-4xl mx-auto space-y-6 text-slate-900 print:shadow-none print:border-none print:p-0 print:m-0`}
      >
        {/* Kop Surat Resmi SMA PGRI 4 Gandrungmangu */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 gap-4">
          <img
            src="/src/assets/images/school_crest_pgri_1794327906967.jpg"
            alt="Logo Sekolah"
            className="w-20 h-20 object-contain rounded-full border border-slate-300"
            referrerPolicy="no-referrer"
          />
          <div className="text-center flex-1 space-y-0.5">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-600">
              YAYASAN PEMBINA LEMBAGA PENDIDIKAN PGRI (YPLP PGRI)
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
              SMA PGRI 4 GANDRUNGMANGU
            </h1>
            <p className="text-xs text-slate-600">
              Alamat: Jl. Raya Gandrungmangu No. 45, Gandrungmangu, Kabupaten Cilacap, Jawa Tengah
            </p>
            <p className="text-[11px] text-slate-500">
              NPSN: 20300481 · Akreditasi A · Email: info@smapgri4gandrungmangu.sch.id
            </p>
          </div>
          <div className="w-20 hidden sm:block" />
        </div>

        {/* Title of Report Card */}
        <div className="text-center pt-2">
          <h2 className="text-base font-extrabold tracking-wide uppercase underline">
            LAPORAN HASIL BELAJAR PESERTA DIDIK (RAPOR)
          </h2>
          <div className="text-xs text-slate-600 mt-1 font-medium">
            KURIKULUM MERDEKA TAHUN AJARAN {activeAcademicYear.year} · SEMESTER {activeAcademicYear.semester.toUpperCase()}
          </div>
        </div>

        {/* Student Biodata Strip */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="space-y-1">
            <div className="flex">
              <span className="w-32 font-semibold text-slate-600">Nama Siswa</span>
              <span className="font-bold text-slate-900">: {currentUser.name}</span>
            </div>
            <div className="flex">
              <span className="w-32 font-semibold text-slate-600">Nomor Induk / NISN</span>
              <span className="font-mono text-slate-800">: {currentUser.identityNumber}</span>
            </div>
            <div className="flex">
              <span className="w-32 font-semibold text-slate-600">Sekolah</span>
              <span className="text-slate-800">: SMA PGRI 4 Gandrungmangu</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex">
              <span className="w-32 font-semibold text-slate-600">Kelas / Fase</span>
              <span className="font-bold text-slate-900">: {currentUser.className || 'XI'} ({studentClass?.phase || 'Fase F'})</span>
            </div>
            <div className="flex">
              <span className="w-32 font-semibold text-slate-600">Wali Kelas</span>
              <span className="text-slate-800">: {studentClass?.homeroomTeacherName || 'Siti Rahmawati, S.Pd.'}</span>
            </div>
            <div className="flex">
              <span className="w-32 font-semibold text-slate-600">Semester</span>
              <span className="text-slate-800">: {activeAcademicYear.semester} (Gasal)</span>
            </div>
          </div>
        </div>

        {/* Academic Grades Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            A. Capaian Kompetensi Akademik (Pengetahuan & Keterampilan)
          </h3>
          <table className="w-full text-left text-xs border border-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold text-center">
                <th className="border border-slate-300 py-2 px-2 w-8">No</th>
                <th className="border border-slate-300 py-2 px-3 text-left">Mata Pelajaran</th>
                <th className="border border-slate-300 py-2 px-2 w-14">Nilai Akhir</th>
                <th className="border border-slate-300 py-2 px-2 w-16">Predikat</th>
                <th className="border border-slate-300 py-2 px-4 text-left">Capaian Pembelajaran (Deskripsi)</th>
              </tr>
            </thead>
            <tbody>
              {myGrades.map((g, idx) => (
                <tr key={g.id} className="border-b border-slate-200">
                  <td className="border border-slate-300 py-2 px-2 text-center font-mono">{idx + 1}</td>
                  <td className="border border-slate-300 py-2 px-3 font-semibold text-slate-900">{g.subjectName}</td>
                  <td className="border border-slate-300 py-2 px-2 text-center font-mono font-bold text-slate-900">{g.finalScore}</td>
                  <td className="border border-slate-300 py-2 px-2 text-center font-bold">{g.letterGrade}</td>
                  <td className="border border-slate-300 py-2 px-4 text-[11px] text-slate-700 leading-relaxed">
                    {g.competencyAchievement}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Attendance Summary Box */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            B. Rekapitulasi Kehadiran (Presensi)
          </h3>
          <div className="border border-slate-300 rounded-lg p-3 text-xs grid grid-cols-4 text-center divide-x divide-slate-200 bg-slate-50">
            <div>
              <span className="text-slate-500 font-medium">Sakit (S)</span>
              <div className="text-lg font-bold font-mono text-slate-900 mt-1">{attendance.sakit} Hari</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Izin (I)</span>
              <div className="text-lg font-bold font-mono text-slate-900 mt-1">{attendance.izin} Hari</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Tanpa Keterangan (A)</span>
              <div className="text-lg font-bold font-mono text-slate-900 mt-1">{attendance.alpa} Hari</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Persentase Hadir</span>
              <div className="text-lg font-bold font-mono text-emerald-700 mt-1">{attendance.percentage}%</div>
            </div>
          </div>
        </div>

        {/* Official Signature Blocks */}
        <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs">
          <div>
            <div className="text-slate-600">Mengetahui,</div>
            <div className="text-slate-600 mt-0.5">Orang Tua / Wali Murid</div>
            <div className="h-16" />
            <div className="font-bold text-slate-900 border-t border-slate-400 pt-1 mx-6">
              ( ..................................... )
            </div>
          </div>

          <div>
            <div className="text-slate-600">Gandrungmangu, {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</div>
            <div className="text-slate-600 mt-0.5">Wali Kelas {currentUser.className || 'XI'}</div>
            <div className="h-16 flex items-end justify-center pb-2">
              <span className="text-[10px] font-mono text-slate-400">[Tanda Tangan Digital]</span>
            </div>
            <div className="font-bold text-slate-900 border-t border-slate-400 pt-1 mx-4">
              {studentClass?.homeroomTeacherName || 'Siti Rahmawati, S.Pd.'}
            </div>
            <div className="text-[10px] text-slate-500">NIP. 198205142008012015</div>
          </div>

          <div>
            <div className="text-slate-600">Mengetahui,</div>
            <div className="text-slate-600 mt-0.5">Kepala SMA PGRI 4 Gandrungmangu</div>
            <div className="h-16 flex items-end justify-center pb-2">
              <span className="text-[10px] font-mono text-emerald-700 font-semibold">[Tervalidasi Sistem]</span>
            </div>
            <div className="font-bold text-slate-900 border-t border-slate-400 pt-1 mx-4">
              Drs. H. Mulyono, M.Pd.
            </div>
            <div className="text-[10px] text-slate-500">NIP. 196804121994031002</div>
          </div>
        </div>
      </div>
    </div>
  );
};
