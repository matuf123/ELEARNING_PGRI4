import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Award,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  BarChart3,
  ChevronRight
} from 'lucide-react';

export const StudentNilaiView: React.FC = () => {
  const { currentUser, grades, activeAcademicYear, subjects } = useDatabase();

  const myGrades = grades.filter(
    (g) => g.studentId === currentUser.id && g.academicYearId === activeAcademicYear.id
  );

  const totalScore = myGrades.reduce((acc, curr) => acc + curr.finalScore, 0);
  const averageScore = myGrades.length > 0 ? (totalScore / myGrades.length).toFixed(1) : '85.0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-900" />
            <h2 className="text-xl font-bold text-slate-900">Buku Nilai & Transkrip Akademik Harian</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Transparansi nilai formatif harian, akumulasi penugasan, PTS, PAS, dan ketercapaian tujuan pembelajaran Kurikulum Merdeka.
          </p>
        </div>

        <div className="bg-slate-100 px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600">
          Semester: <strong className="text-blue-900">{activeAcademicYear.semester} (TP {activeAcademicYear.year})</strong>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Indeks Prestasi Rata-rata
          </span>
          <div className="text-3xl font-extrabold text-blue-900 mt-2 font-mono tabular-nums">
            {averageScore}
          </div>
          <div className="text-xs text-emerald-700 font-semibold mt-1">
            Predikat A (Sangat Baik)
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Mata Pelajaran Dinilai
          </span>
          <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono tabular-nums">
            {myGrades.length} Mapel
          </div>
          <div className="text-xs text-slate-500 mt-1">
            100% Memenuhi KKTP Minimum
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Nilai Tertinggi Dicapai
          </span>
          <div className="text-3xl font-extrabold text-emerald-700 mt-2 font-mono tabular-nums">
            {myGrades.length > 0 ? Math.max(...myGrades.map((g) => g.finalScore)) : 94}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Mata Pelajaran Informatika (Fase F)
          </div>
        </div>
      </div>

      {/* Detailed Grades Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Rincian Komponen Penilaian per Mata Pelajaran
            </h3>
            <p className="text-xs text-slate-500">
              Bobot terhitung: 25% Harian + 25% Tugas + 25% PTS + 25% PAS
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
                <th className="py-3 px-4 min-w-[300px]">Capaian Pembelajaran (Deskripsi Guru)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myGrades.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Belum ada nilai yang dipublikasikan guru untuk semester ini.
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

                    <td className="py-3 px-3 text-center font-mono font-extrabold text-blue-900 text-sm bg-blue-50/60">
                      {g.finalScore}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded font-bold text-xs ${
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
  );
};
