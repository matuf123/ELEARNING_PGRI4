import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Assignment, QuizQuestion } from '../../types';
import {
  HelpCircle,
  Plus,
  Clock,
  Award,
  Users,
  CheckCircle2,
  Trash2,
  X,
  FileText,
  AlertCircle
} from 'lucide-react';

export const GuruUjianView: React.FC = () => {
  const {
    currentUser,
    assignments,
    submissions,
    classes,
    subjects,
    schedules,
    users,
    addAssignment,
    deleteAssignment,
  } = useDatabase();

  const mySchedules = schedules.filter((s) => s.teacherId === currentUser.id);
  const myClassIds = Array.from(new Set(mySchedules.map((s) => s.classId)));
  const myClasses = classes.filter((c) => myClassIds.includes(c.id));
  const mySubjectIds = Array.from(new Set(mySchedules.map((s) => s.subjectId)));
  const mySubjects = subjects.filter((s) => mySubjectIds.includes(s.id));

  const availableClasses = myClasses.length > 0 ? myClasses : classes;
  const availableSubjects = mySubjects.length > 0 ? mySubjects : subjects;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExamResult, setSelectedExamResult] = useState<Assignment | null>(null);

  // Filter exams created by this guru
  const myExams = assignments.filter(
    (a) => a.teacherId === currentUser.id && (a.type === 'Kuis Online' || a.type === 'Ulangan Harian')
  );

  const [form, setForm] = useState<{
    title: string;
    description: string;
    classId: string;
    subjectId: string;
    dueDate: string;
    durationMinutes: number;
    questions: QuizQuestion[];
  }>({
    title: '',
    description: '',
    classId: availableClasses[0]?.id || '',
    subjectId: availableSubjects[0]?.id || '',
    dueDate: '2026-11-28 23:59',
    durationMinutes: 45,
    questions: [
      {
        id: 'q1',
        questionText: 'Pertanyaan butir nomor 1...',
        type: 'multiple_choice',
        options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
        correctAnswerIndex: 0,
        points: 50,
      },
      {
        id: 'q2',
        questionText: 'Pertanyaan butir nomor 2 (Essay)...',
        type: 'essay',
        points: 50,
      },
    ],
  });

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClass = classes.find((c) => c.id === form.classId);
    const targetSubject = subjects.find((s) => s.id === form.subjectId);
    if (!targetClass || !targetSubject || !form.title) return;

    addAssignment({
      title: form.title,
      description: form.description,
      classId: form.classId,
      className: targetClass.name,
      subjectId: form.subjectId,
      subjectName: targetSubject.name,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      dueDate: form.dueDate,
      maxScore: 100,
      type: 'Kuis Online',
      durationMinutes: form.durationMinutes,
      allowFileUpload: false,
      questions: form.questions,
    });

    setIsModalOpen(false);
  };

  const handleAddQuestion = () => {
    setForm({
      ...form,
      questions: [
        ...form.questions,
        {
          id: `q-${Date.now()}`,
          questionText: '',
          type: 'multiple_choice',
          options: ['', '', '', ''],
          correctAnswerIndex: 0,
          points: 25,
        },
      ],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-700" />
            <h2 className="text-xl font-bold text-slate-900">Kelola Ujian Online & Bank Soal CBT</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Buat paket ujian berbasis komputer (CBT), susun butir soal pilihan ganda dengan kunci jawaban otomatis, dan pantau hasil pengerjaan siswa.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Paket Ujian CBT Baru</span>
        </button>
      </div>

      {/* Exam Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myExams.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-500">
            <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">Belum ada paket ujian online yang dibuat.</p>
            <p className="text-slate-400 mt-1">Klik tombol di atas untuk membuat ujian CBT baru.</p>
          </div>
        ) : (
          myExams.map((exam) => {
            const examSubs = submissions.filter((s) => s.assignmentId === exam.id);
            const classStudents = users.filter((u) => u.role === 'siswa' && u.classId === exam.classId);

            return (
              <div
                key={exam.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {exam.className} · {exam.subjectName}
                    </span>
                    <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.durationMinutes || 30} Menit</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {exam.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {exam.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-indigo-700 font-medium pt-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{exam.questions?.length || 0} Butir Soal Terkonfigurasi</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono text-[11px]">
                    Terkumpul: <strong>{examSubs.length}</strong> / {classStudents.length} Siswa
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedExamResult(exam)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Lihat Hasil Siswa
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Hapus paket ujian "${exam.title}"?`)) {
                          deleteAssignment(exam.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Results Modal */}
      {selectedExamResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <span className="text-[10px] font-bold uppercase text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded">
                  {selectedExamResult.className} · {selectedExamResult.subjectName}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Rekapitulasi Skor Peserta Ujian CBT
                </h3>
              </div>
              <button onClick={() => setSelectedExamResult(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                    <th className="py-2.5 px-3">Nama Siswa</th>
                    <th className="py-2.5 px-3">NISN</th>
                    <th className="py-2.5 px-3">Waktu Selesai</th>
                    <th className="py-2.5 px-3 text-center">Skor Evaluasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users
                    .filter((u) => u.role === 'siswa' && u.classId === selectedExamResult.classId)
                    .map((st) => {
                      const sub = submissions.find(
                        (s) => s.assignmentId === selectedExamResult.id && s.studentId === st.id
                      );

                      return (
                        <tr key={st.id}>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{st.name}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{st.identityNumber}</td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {sub ? sub.submissionDate : <span className="text-slate-400 italic">Belum Mengikuti</span>}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold">
                            {sub && sub.score !== undefined ? (
                              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-sm">
                                {sub.score}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedExamResult(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg font-medium text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create CBT Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-indigo-950 text-white">
              <h3 className="text-base font-bold text-white">Buat Paket Ujian CBT Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rombel Sasaran</label>
                  <select
                    value={form.classId}
                    onChange={(e) => setForm({ ...form, classId: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {availableClasses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phase})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                  <select
                    value={form.subjectId}
                    onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {availableSubjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Ujian CBT</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sumatif Tengah Semester (STS) Gasal 2026"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Durasi Pengerjaan (Menit)</label>
                  <input
                    type="number"
                    min={15}
                    max={120}
                    value={form.durationMinutes}
                    onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batas Waktu Akses</label>
                  <input
                    type="text"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Petunjuk Umum Peserta</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Kerjakan secara mandiri dengan teliti dan jujur..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              {/* Questions list */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>Daftar Butir Soal ({form.questions.length})</span>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="text-xs text-indigo-700 hover:underline cursor-pointer font-semibold"
                  >
                    + Tambah Soal
                  </button>
                </div>

                {form.questions.map((q, idx) => (
                  <div key={q.id} className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                    <div className="font-semibold text-slate-800">
                      Soal #{idx + 1} ({q.type === 'multiple_choice' ? 'Pilihan Ganda' : 'Essay'}):
                    </div>
                    <input
                      type="text"
                      placeholder="Pertanyaan soal..."
                      value={q.questionText}
                      onChange={(e) => {
                        const copy = [...form.questions];
                        copy[idx].questionText = e.target.value;
                        setForm({ ...form, questions: copy });
                      }}
                      className="w-full p-1.5 border border-slate-300 rounded text-xs"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-medium rounded-lg"
                >
                  Terbitkan Ujian CBT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
