import React, { useState, useEffect } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { GradeRecord } from '../../types';
import {
  Award,
  Save,
  Download,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  RotateCcw
} from 'lucide-react';

export const GradebookView: React.FC = () => {
  const {
    currentUser,
    classes,
    subjects,
    schedules,
    users,
    grades,
    activeAcademicYear,
    batchSaveGrades,
  } = useDatabase();

  // Find classes & subjects taught by this teacher
  const mySchedules = schedules.filter((s) => s.teacherId === currentUser.id);
  const myClassIds = Array.from(new Set(mySchedules.map((s) => s.classId)));
  const myClasses = classes.filter((c) => myClassIds.includes(c.id));
  const mySubjectIds = Array.from(new Set(mySchedules.map((s) => s.subjectId)));
  const mySubjects = subjects.filter((s) => mySubjectIds.includes(s.id));

  const availableClasses = myClasses.length > 0 ? myClasses : classes;
  const availableSubjects = mySubjects.length > 0 ? mySubjects : subjects;

  const [selectedClassId, setSelectedClassId] = useState<string>(availableClasses[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(availableSubjects[0]?.id || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Students in selected class
  const classStudents = users.filter((u) => u.role === 'siswa' && u.classId === selectedClassId);

  // Editable row records
  const [rows, setRows] = useState<
    {
      studentId: string;
      studentName: string;
      studentNisn: string;
      dailyScore: number;
      assignmentScore: number;
      midExamScore: number;
      finalExamScore: number;
      finalScore: number;
      letterGrade: 'A' | 'B' | 'C' | 'D';
      competencyAchievement: string;
    }[]
  >([]);

  // Load existing grades into local rows when class or subject changes
  useEffect(() => {
    const newRows = classStudents.map((student) => {
      const existing = grades.find(
        (g) =>
          g.studentId === student.id &&
          g.subjectId === selectedSubjectId &&
          g.academicYearId === activeAcademicYear.id
      );

      if (existing) {
        return {
          studentId: student.id,
          studentName: student.name,
          studentNisn: student.identityNumber,
          dailyScore: existing.dailyScore,
          assignmentScore: existing.assignmentScore,
          midExamScore: existing.midExamScore,
          finalExamScore: existing.finalExamScore,
          finalScore: existing.finalScore,
          letterGrade: existing.letterGrade,
          competencyAchievement: existing.competencyAchievement,
        };
      }

      // Default baseline
      const defaultDaily = 82;
      const defaultAsg = 85;
      const defaultMid = 80;
      const defaultFinal = 84;
      const finalScore = Math.round(
        defaultDaily * 0.25 + defaultAsg * 0.25 + defaultMid * 0.25 + defaultFinal * 0.25
      );
      const letterGrade: 'A' | 'B' | 'C' | 'D' = finalScore >= 88 ? 'A' : finalScore >= 78 ? 'B' : 'C';
      return {
        studentId: student.id,
        studentName: student.name,
        studentNisn: student.identityNumber,
        dailyScore: defaultDaily,
        assignmentScore: defaultAsg,
        midExamScore: defaultMid,
        finalExamScore: defaultFinal,
        finalScore,
        letterGrade,
        competencyAchievement: 'Menunjukkan pemahaman materi dengan baik sesuai capaian pembelajaran.',
      };
    });

    setRows(newRows);
  }, [selectedClassId, selectedSubjectId, grades]);

  // Recalculate row
  const handleScoreChange = (
    index: number,
    field: 'dailyScore' | 'assignmentScore' | 'midExamScore' | 'finalExamScore',
    value: number
  ) => {
    const updated = [...rows];
    const clamped = Math.max(0, Math.min(100, isNaN(value) ? 0 : value));
    updated[index][field] = clamped;

    // 25% daily + 25% assignment + 25% PTS + 25% PAS
    const final = Math.round(
      updated[index].dailyScore * 0.25 +
      updated[index].assignmentScore * 0.25 +
      updated[index].midExamScore * 0.25 +
      updated[index].finalExamScore * 0.25
    );

    updated[index].finalScore = final;
    let letter: 'A' | 'B' | 'C' | 'D' = 'D';
    if (final >= 88) letter = 'A';
    else if (final >= 78) letter = 'B';
    else if (final >= 68) letter = 'C';
    updated[index].letterGrade = letter;

    setRows(updated);
  };

  const handleAchievementChange = (index: number, text: string) => {
    const updated = [...rows];
    updated[index].competencyAchievement = text;
    setRows(updated);
  };

  const handleSaveAllGrades = () => {
    const targetSubject = subjects.find((s) => s.id === selectedSubjectId);
    if (!targetSubject) return;

    const recordsToSave: Omit<GradeRecord, 'id'>[] = rows.map((r) => ({
      studentId: r.studentId,
      studentName: r.studentName,
      studentNisn: r.studentNisn,
      classId: selectedClassId,
      subjectId: selectedSubjectId,
      subjectName: targetSubject.name,
      academicYearId: activeAcademicYear.id,
      semester: activeAcademicYear.semester,
      dailyScore: r.dailyScore,
      assignmentScore: r.assignmentScore,
      midExamScore: r.midExamScore,
      finalExamScore: r.finalExamScore,
      finalScore: r.finalScore,
      letterGrade: r.letterGrade,
      competencyAchievement: r.competencyAchievement,
    }));

    batchSaveGrades(recordsToSave);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Buku Nilai & Rapor Digital Guru</h2>
          <p className="text-xs text-slate-500 mt-1">
            Input nilai harian formatif, sumatif tengah semester (PTS), sumatif akhir semester (PAS), serta capaian kompetensi Kurikulum Merdeka.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Nilai Berhasil Disimpan ke Rapor!</span>
            </div>
          )}

          <button
            onClick={handleSaveAllGrades}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Nilai Kelas Ini</span>
          </button>
        </div>
      </div>

      {/* Class & Subject Selector Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Pilih Rombongan Belajar (Kelas)
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 font-medium"
          >
            {availableClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phase}) - {c.track || 'Umum'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Pilih Mata Pelajaran
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 font-medium"
          >
            {availableSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code}) - KKTP: {s.minPassingGrade}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gradebook Spreadsheet */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs">
            <span className="font-bold text-slate-900">
              Daftar Siswa Kelas {selectedClass?.name}
            </span>
            <span className="text-slate-400 mx-1.5">|</span>
            <span className="text-slate-600">
              Mata Pelajaran: <strong>{selectedSubject?.name}</strong>
            </span>
            <span className="text-slate-400 mx-1.5">|</span>
            <span className="text-blue-900 font-medium">
              KKTP Minimum: {selectedSubject?.minPassingGrade || 75}
            </span>
          </div>

          <div className="text-[11px] text-slate-500">
            Bobot: 25% Harian + 25% Tugas + 25% PTS + 25% PAS
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-4 min-w-[180px]">Nama Siswa & NISN</th>
                <th className="py-3 px-2 w-24 text-center">Formatif (25%)</th>
                <th className="py-3 px-2 w-24 text-center">Tugas (25%)</th>
                <th className="py-3 px-2 w-24 text-center">PTS/UTS (25%)</th>
                <th className="py-3 px-2 w-24 text-center">PAS/UAS (25%)</th>
                <th className="py-3 px-2 w-24 text-center">Nilai Akhir</th>
                <th className="py-3 px-2 w-20 text-center">Predikat</th>
                <th className="py-3 px-4 min-w-[280px]">Deskripsi Capaian Kompetensi Kurikulum Merdeka</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Tidak ada siswa terdaftar dalam kelas ini.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => {
                  const isPassing = row.finalScore >= (selectedSubject?.minPassingGrade || 75);

                  return (
                    <tr key={row.studentId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                        {index + 1}
                      </td>

                      <td className="py-2.5 px-4">
                        <div className="font-bold text-slate-900">{row.studentName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">NISN: {row.studentNisn}</div>
                      </td>

                      {/* Daily Score Input */}
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={row.dailyScore}
                          onChange={(e) => handleScoreChange(index, 'dailyScore', Number(e.target.value))}
                          className="w-16 p-1.5 text-center font-mono font-semibold border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                        />
                      </td>

                      {/* Assignment Score Input */}
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={row.assignmentScore}
                          onChange={(e) => handleScoreChange(index, 'assignmentScore', Number(e.target.value))}
                          className="w-16 p-1.5 text-center font-mono font-semibold border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                        />
                      </td>

                      {/* Mid Exam Score Input */}
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={row.midExamScore}
                          onChange={(e) => handleScoreChange(index, 'midExamScore', Number(e.target.value))}
                          className="w-16 p-1.5 text-center font-mono font-semibold border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                        />
                      </td>

                      {/* Final Exam Score Input */}
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={row.finalExamScore}
                          onChange={(e) => handleScoreChange(index, 'finalExamScore', Number(e.target.value))}
                          className="w-16 p-1.5 text-center font-mono font-semibold border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                        />
                      </td>

                      {/* Calculated Final Score */}
                      <td className="py-2 px-2 text-center font-mono font-extrabold text-sm">
                        <span
                          className={`inline-block px-2.5 py-1 rounded ${
                            isPassing ? 'text-blue-950 bg-blue-50 font-bold' : 'text-rose-700 bg-rose-50'
                          }`}
                        >
                          {row.finalScore}
                        </span>
                      </td>

                      {/* Letter Predicate */}
                      <td className="py-2 px-2 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-bold text-xs ${
                            row.letterGrade === 'A'
                              ? 'bg-emerald-100 text-emerald-800'
                              : row.letterGrade === 'B'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {row.letterGrade}
                        </span>
                      </td>

                      {/* Competency Achievement Description */}
                      <td className="py-2 px-4">
                        <input
                          type="text"
                          value={row.competencyAchievement}
                          onChange={(e) => handleAchievementChange(index, e.target.value)}
                          placeholder="Deskripsi capaian kompetensi..."
                          className="w-full p-1.5 text-[11px] border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500">
            Total {rows.length} siswa dalam buku nilai kelas {selectedClass?.name}.
          </div>
          <button
            onClick={handleSaveAllGrades}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan Nilai</span>
          </button>
        </div>
      </div>
    </div>
  );
};
