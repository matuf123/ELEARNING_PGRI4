import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Assignment, QuizQuestion, Submission } from '../../types';
import {
  ClipboardList,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Trash2,
  X,
  ExternalLink,
  MessageSquare,
  Award,
  Layers,
  HelpCircle
} from 'lucide-react';

export const AssessmentsView: React.FC = () => {
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
    gradeSubmission,
  } = useDatabase();

  const mySchedules = schedules.filter((s) => s.teacherId === currentUser.id);
  const myClassIds = Array.from(new Set(mySchedules.map((s) => s.classId)));
  const myClasses = classes.filter((c) => myClassIds.includes(c.id));
  const mySubjectIds = Array.from(new Set(mySchedules.map((s) => s.subjectId)));
  const mySubjects = subjects.filter((s) => mySubjectIds.includes(s.id));

  const availableClasses = myClasses.length > 0 ? myClasses : classes;
  const availableSubjects = mySubjects.length > 0 ? mySubjects : subjects;

  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(
    assignments[0] || null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);

  // Form for grading
  const [inputScore, setInputScore] = useState<number>(85);
  const [inputFeedback, setInputFeedback] = useState<string>('');

  // Form for creating new Assignment
  const [form, setForm] = useState<{
    title: string;
    description: string;
    classId: string;
    subjectId: string;
    dueDate: string;
    type: 'Tugas Mandiri' | 'Tugas Proyek' | 'Kuis Online' | 'Ulangan Harian';
    durationMinutes: number;
    allowFileUpload: boolean;
    questions: QuizQuestion[];
  }>({
    title: '',
    description: '',
    classId: availableClasses[0]?.id || '',
    subjectId: availableSubjects[0]?.id || '',
    dueDate: '2026-11-25 23:59',
    type: 'Tugas Mandiri',
    durationMinutes: 30,
    allowFileUpload: true,
    questions: [
      {
        id: 'q-new-1',
        questionText: '',
        type: 'multiple_choice',
        options: ['', '', '', ''],
        correctAnswerIndex: 0,
        points: 50,
      },
    ],
  });

  // Filter teacher's assignments
  const teacherAssignments = assignments.filter((a) => a.teacherId === currentUser.id);

  // Submissions for the currently selected assignment
  const currentSubmissions = selectedAssignment
    ? submissions.filter((s) => s.assignmentId === selectedAssignment.id)
    : [];

  // Students in this assignment's class
  const classStudents = selectedAssignment
    ? users.filter((u) => u.role === 'siswa' && u.classId === selectedAssignment.classId)
    : [];

  const handleSaveAssignment = (e: React.FormEvent) => {
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
      type: form.type,
      allowFileUpload: form.allowFileUpload,
      durationMinutes: form.type === 'Kuis Online' ? form.durationMinutes : undefined,
      questions: form.type === 'Kuis Online' ? form.questions : undefined,
    });

    setIsCreateModalOpen(false);
  };

  const handleOpenGradeModal = (sub: Submission) => {
    setGradingSubmission(sub);
    setInputScore(sub.score || 85);
    setInputFeedback(sub.teacherFeedback || 'Pekerjaan sudah sesuai dengan instruksi yang diberikan.');
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    gradeSubmission(gradingSubmission.id, Number(inputScore), inputFeedback);
    setGradingSubmission(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Asesmen, Tugas & Kuis Online</h2>
          <p className="text-xs text-slate-500 mt-1">
            Buat penugasan terstruktur, kuis pilihan ganda dengan kunci jawaban, dan koreksi hasil pekerjaan siswa.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Tugas / Kuis Baru</span>
        </button>
      </div>

      {/* Main Split Layout: Left list of assignments, Right submission review */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: Assignment Selector List */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Daftar Asesmen Aktif ({teacherAssignments.length})
          </span>

          {teacherAssignments.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              Belum ada tugas atau kuis yang dibuat.
            </div>
          ) : (
            teacherAssignments.map((asg) => {
              const isSelected = selectedAssignment?.id === asg.id;
              const subCount = submissions.filter((s) => s.assignmentId === asg.id).length;
              const pendingSubCount = submissions.filter(
                (s) => s.assignmentId === asg.id && s.status === 'submitted'
              ).length;

              return (
                <div
                  key={asg.id}
                  onClick={() => setSelectedAssignment(asg)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-900 bg-blue-50/50 shadow-xs ring-1 ring-blue-900'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded">
                      {asg.type} · {asg.className}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Hapus tugas "${asg.title}"?`)) {
                          deleteAssignment(asg.id);
                          if (selectedAssignment?.id === asg.id) {
                            setSelectedAssignment(null);
                          }
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-2 leading-snug">
                    {asg.title}
                  </h3>

                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <span>{asg.subjectName}</span>
                    <span>·</span>
                    <span>Deadline: {asg.dueDate}</span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">
                      Terkumpul: <strong>{subCount}</strong> siswa
                    </span>
                    {pendingSubCount > 0 && (
                      <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[10px] font-bold border border-rose-200">
                        {pendingSubCount} Perlu Koreksi
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right 7 Cols: Selected Assignment Details & Student Submissions */}
        <div className="lg:col-span-7 space-y-4">
          {selectedAssignment ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Assignment Top Header */}
              <div className="p-5 border-b border-slate-200 bg-slate-50/70">
                <div className="flex items-center justify-between">
                  <div className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-900">
                    {selectedAssignment.type} · {selectedAssignment.className}
                  </div>
                  <span className="text-xs text-slate-500">
                    Batas Pengumpulan: <strong>{selectedAssignment.dueDate}</strong>
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2">
                  {selectedAssignment.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {selectedAssignment.description}
                </p>
                {selectedAssignment.questions && (
                  <div className="mt-2 text-xs font-semibold text-indigo-700 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" />
                    <span>Kuis Memiliki {selectedAssignment.questions.length} Butir Soal Terintegrasi</span>
                  </div>
                )}
              </div>

              {/* Submissions Table */}
              <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Lembar Pengumpulan & Nilai Siswa
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Siswa terdaftar: {classStudents.length} · Sudah mengumpulkan: {currentSubmissions.length}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                      <th className="py-2.5 px-4">Nama Siswa & NISN</th>
                      <th className="py-2.5 px-4">Waktu Pengumpulan</th>
                      <th className="py-2.5 px-4">Berkas / Jawaban</th>
                      <th className="py-2.5 px-4 text-center">Nilai</th>
                      <th className="py-2.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {classStudents.map((student) => {
                      const sub = currentSubmissions.find((s) => s.studentId === student.id);

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{student.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">NISN: {student.identityNumber}</div>
                          </td>

                          <td className="py-3 px-4 text-slate-600">
                            {sub ? sub.submissionDate : <span className="text-slate-400 italic">Belum Mengumpulkan</span>}
                          </td>

                          <td className="py-3 px-4 text-slate-700">
                            {sub ? (
                              <div className="space-y-1">
                                {sub.fileName && (
                                  <div className="flex items-center gap-1 text-blue-900 font-medium">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span className="truncate max-w-[120px]">{sub.fileName}</span>
                                  </div>
                                )}
                                {sub.notes && (
                                  <p className="text-[10px] text-slate-500 italic truncate max-w-[150px]">
                                    &ldquo;{sub.notes}&rdquo;
                                  </p>
                                )}
                                {sub.quizAnswers && (
                                  <div className="text-[10px] text-indigo-700 font-semibold">
                                    Terkirim via Kuis CBT Online
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center">
                            {sub && sub.score !== undefined ? (
                              <span className="font-mono font-bold text-emerald-700 text-sm bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                {sub.score}
                              </span>
                            ) : sub ? (
                              <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200">
                                Menunggu Koreksi
                              </span>
                            ) : (
                              <span className="text-slate-300 text-xs">0</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            {sub ? (
                              <button
                                onClick={() => handleOpenGradeModal(sub)}
                                className="px-2.5 py-1 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                              >
                                {sub.score !== undefined ? 'Ubah Nilai' : 'Beri Nilai'}
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[11px]">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-500">
              Pilih salah satu tugas atau kuis di sebelah kiri untuk melihat daftar pengumpulan.
            </div>
          )}
        </div>
      </div>

      {/* Grading Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Koreksi & Penilaian Tugas</h3>
                <p className="text-xs text-slate-500">{gradingSubmission.studentName} ({gradingSubmission.studentNisn})</p>
              </div>
              <button onClick={() => setGradingSubmission(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                <div className="text-[11px] text-slate-500">Catatan Pengiriman Siswa:</div>
                <div className="text-slate-700 italic">
                  {gradingSubmission.notes || 'Tidak ada catatan tambahan dari siswa.'}
                </div>
                {gradingSubmission.fileName && (
                  <div className="text-blue-900 font-semibold flex items-center gap-1 pt-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{gradingSubmission.fileName}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nilai Angka (Skala 0 - 100)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={inputScore}
                  onChange={(e) => setInputScore(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-lg font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Umpan Balik Guru (Feedback / Catatan Perbaikan)
                </label>
                <textarea
                  rows={3}
                  required
                  value={inputFeedback}
                  onChange={(e) => setInputFeedback(e.target.value)}
                  placeholder="Berikan apresiasi dan catatan konstruktif untuk siswa..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-lg"
                >
                  Simpan & Sinkron ke Rapor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Buat Asesmen / Tugas / Kuis Baru</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="p-6 overflow-y-auto space-y-4 text-xs">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Asesmen</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Tugas Mandiri">Tugas Mandiri</option>
                    <option value="Tugas Proyek">Tugas Proyek</option>
                    <option value="Kuis Online">Kuis CBT Online (Soal Interaktif)</option>
                    <option value="Ulangan Harian">Ulangan Harian</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batas Waktu (Deadline)</label>
                  <input
                    type="text"
                    required
                    placeholder="YYYY-MM-DD HH:mm"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Asesmen / Tugas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Latihan Soal Terstruktur Aljabar Matriks"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Petunjuk & Deskripsi Tugas</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan petunjuk pengerjaan secara jelas..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              {form.type === 'Kuis Online' && (
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-3">
                  <div className="font-bold text-indigo-900 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-indigo-700" />
                      <span>Konfigurasi Soal Kuis Pilihan Ganda & Essay</span>
                    </span>
                    <span className="text-[11px] text-indigo-700 font-mono">
                      Durasi: 30 Menit
                    </span>
                  </div>

                  {form.questions.map((q, qIndex) => (
                    <div key={q.id} className="p-3 bg-white rounded-lg border border-indigo-100 space-y-2">
                      <div className="font-semibold text-slate-800">
                        Soal Nomor {qIndex + 1}:
                      </div>
                      <input
                        type="text"
                        placeholder="Ketikkan teks pertanyaan di sini..."
                        value={q.questionText}
                        onChange={(e) => {
                          const updated = [...form.questions];
                          updated[qIndex].questionText = e.target.value;
                          setForm({ ...form, questions: updated });
                        }}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                      />
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {q.options?.map((opt, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-500 text-[11px]">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            <input
                              type="text"
                              placeholder={`Pilihan ${String.fromCharCode(65 + optIndex)}`}
                              value={opt}
                              onChange={(e) => {
                                const updated = [...form.questions];
                                if (updated[qIndex].options) {
                                  updated[qIndex].options![optIndex] = e.target.value;
                                  setForm({ ...form, questions: updated });
                                }
                              }}
                              className="w-full p-1.5 border border-slate-300 rounded text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-lg"
                >
                  Terbitkan Asesmen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
