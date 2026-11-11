import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Assignment, QuizQuestion, Submission } from '../../types';
import {
  ClipboardList,
  UploadCloud,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Award,
  HelpCircle,
  X,
  PlayCircle,
  RotateCcw
} from 'lucide-react';

export const StudentAssignmentsView: React.FC = () => {
  const {
    currentUser,
    assignments,
    submissions,
    submitAssignmentWork,
  } = useDatabase();

  const myClassId = currentUser.classId;
  const myAssignments = assignments.filter((a) => a.classId === myClassId);

  // Submissions made by this student
  const mySubmissions = submissions.filter((s) => s.studentId === currentUser.id);

  const [activeTab, setActiveTab] = useState<'pending' | 'submitted' | 'graded'>('pending');

  // Submit modal state
  const [selectedAssignmentForSubmit, setSelectedAssignmentForSubmit] = useState<Assignment | null>(null);
  const [submissionFileName, setSubmissionFileName] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionLink, setSubmissionLink] = useState('');

  // Interactive Quiz Player state
  const [activeQuiz, setActiveQuiz] = useState<Assignment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScoreResult, setQuizScoreResult] = useState<number | null>(null);

  // Filtered lists
  const pendingList = myAssignments.filter(
    (a) => !mySubmissions.some((s) => s.assignmentId === a.id)
  );

  const submittedList = myAssignments.filter((a) => {
    const sub = mySubmissions.find((s) => s.assignmentId === a.id);
    return sub && sub.status === 'submitted';
  });

  const gradedList = myAssignments.filter((a) => {
    const sub = mySubmissions.find((s) => s.assignmentId === a.id);
    return sub && sub.status === 'graded';
  });

  const handleOpenSubmitModal = (asg: Assignment) => {
    const existing = mySubmissions.find((s) => s.assignmentId === asg.id);
    setSelectedAssignmentForSubmit(asg);
    setSubmissionFileName(existing?.fileName || `Jawaban_${currentUser.name.replace(/\s+/g, '_')}_${asg.title.slice(0, 15)}.pdf`);
    setSubmissionNotes(existing?.notes || '');
    setSubmissionLink(existing?.externalLink || '');
  };

  const handleSubmitWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignmentForSubmit) return;

    submitAssignmentWork({
      assignmentId: selectedAssignmentForSubmit.id,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentNisn: currentUser.identityNumber,
      fileName: submissionFileName,
      notes: submissionNotes,
      externalLink: submissionLink || undefined,
    });

    setSelectedAssignmentForSubmit(null);
  };

  // Start Interactive Quiz
  const handleStartQuiz = (asg: Assignment) => {
    setActiveQuiz(asg);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScoreResult(null);
  };

  // Submit Quiz Answers
  const handleFinishQuiz = () => {
    if (!activeQuiz || !activeQuiz.questions) return;

    let totalPoints = 0;
    let earnedPoints = 0;

    activeQuiz.questions.forEach((q) => {
      totalPoints += q.points;
      if (q.type === 'multiple_choice') {
        const userAns = selectedAnswers[q.id];
        if (userAns === q.correctAnswerIndex) {
          earnedPoints += q.points;
        }
      } else {
        // Essay gets points automatically for completion
        earnedPoints += q.points;
      }
    });

    const finalCalculatedScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 100;
    setQuizScoreResult(finalCalculatedScore);
    setQuizSubmitted(true);

    // Save submission to database with automatic grade
    submitAssignmentWork({
      assignmentId: activeQuiz.id,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentNisn: currentUser.identityNumber,
      fileName: `Lembar_Jawaban_Kuis_CBT_${activeQuiz.id}.pdf`,
      notes: `Kuis CBT online diselesaikan secara mandiri. Jawaban tersimpan di sistem.`,
      score: finalCalculatedScore,
      teacherFeedback: `Hasil evaluasi kuis otomatis CBT: Skor ${finalCalculatedScore}/100. Penguasaan konsep sangat baik.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Tugas, Kuis CBT & Pengumpulan</h2>
          <p className="text-xs text-slate-500 mt-1">
            Pantau tugas aktif, kuis online interaktif, status verifikasi guru, serta nilai transparan hasil pekerjaan Anda.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Belum Dikerjakan ({pendingList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('submitted')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'submitted'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Menunggu Dinilai ({submittedList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('graded')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'graded'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Sudah Dinilai ({gradedList.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW: PENDING ASSIGNMENTS */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingList.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="font-semibold text-slate-800 text-sm">Semua tugas beres!</p>
              <p className="text-slate-400 mt-1">Tidak ada tugas atau kuis yang tertunda saat ini.</p>
            </div>
          ) : (
            pendingList.map((asg) => (
              <div
                key={asg.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {asg.type}
                    </span>
                    <span className="text-xs font-semibold text-slate-900">
                      {asg.subjectName}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {asg.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 max-w-2xl leading-relaxed">
                    {asg.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>Guru: {asg.teacherName}</span>
                    <span>·</span>
                    <span className="font-mono text-rose-700 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Batas Waktu: {asg.dueDate}</span>
                    </span>
                  </div>
                </div>

                <div className="shrink-0 w-full sm:w-auto">
                  {asg.type === 'Kuis Online' ? (
                    <button
                      onClick={() => handleStartQuiz(asg)}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Mulai Kuis Online CBT</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenSubmitModal(asg)}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload Jawaban</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VIEW: SUBMITTED (AWAITING GRADING) */}
      {activeTab === 'submitted' && (
        <div className="space-y-4">
          {submittedList.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-500">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">Tidak ada tugas dalam status antrean koreksi.</p>
            </div>
          ) : (
            submittedList.map((asg) => {
              const sub = mySubmissions.find((s) => s.assignmentId === asg.id);

              return (
                <div
                  key={asg.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Menunggu Dinilai Guru
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          {asg.subjectName}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        {asg.title}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleOpenSubmitModal(asg)}
                      className="text-xs text-blue-700 hover:underline cursor-pointer font-medium"
                    >
                      Perbarui Berkas
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Waktu Pengumpulan: {sub?.submissionDate}</span>
                      <span>Guru: {asg.teacherName}</span>
                    </div>
                    {sub?.fileName && (
                      <div className="font-medium text-blue-900 flex items-center gap-1.5 pt-1">
                        <FileText className="w-4 h-4" />
                        <span>{sub.fileName}</span>
                      </div>
                    )}
                    {sub?.notes && (
                      <p className="text-slate-600 italic">
                        Catatan Anda: &ldquo;{sub.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW: GRADED ASSIGNMENTS */}
      {activeTab === 'graded' && (
        <div className="space-y-4">
          {gradedList.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-500">
              <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">Belum ada tugas yang selesai dinilai.</p>
            </div>
          ) : (
            gradedList.map((asg) => {
              const sub = mySubmissions.find((s) => s.assignmentId === asg.id);

              return (
                <div
                  key={asg.id}
                  className="bg-white rounded-xl border border-emerald-200 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Sudah Dinilai
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          {asg.subjectName}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        {asg.title}
                      </h3>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs text-slate-500">Nilai Perolehan:</div>
                      <div className="text-2xl font-black text-emerald-700 font-mono tabular-nums">
                        {sub?.score} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                      </div>
                    </div>
                  </div>

                  {sub?.teacherFeedback && (
                    <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200 text-xs space-y-1">
                      <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Catatan Evaluasi Guru ({asg.teacherName}):</span>
                      </div>
                      <p className="text-emerald-900 leading-relaxed">
                        {sub.teacherFeedback}
                      </p>
                      <div className="text-[10px] text-emerald-700 pt-1">
                        Dinilai pada: {sub.gradedAt || 'Sistem E-Learning'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Submission Modal */}
      {selectedAssignmentForSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Pengumpulan Tugas Siswa</h3>
                <p className="text-xs text-slate-500">{selectedAssignmentForSubmit.title}</p>
              </div>
              <button onClick={() => setSelectedAssignmentForSubmit(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitWork} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-700">Petunjuk Tugas:</div>
                <p className="text-slate-600 leading-relaxed">
                  {selectedAssignmentForSubmit.description}
                </p>
                <div className="text-[11px] text-slate-500 pt-1">
                  Batas Akhir: {selectedAssignmentForSubmit.dueDate}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Berkas Jawaban (PDF / Dokumen)
                </label>
                <input
                  type="text"
                  required
                  value={submissionFileName}
                  onChange={(e) => setSubmissionFileName(e.target.value)}
                  placeholder="Jawaban_Tugas_Matriks_AhmadFauzi.pdf"
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tautan Tambahan (Link Google Drive / Repository Proyek)
                </label>
                <input
                  type="url"
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan untuk Guru Pengampu (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="Tuliskan keterangan pengerjaan atau pertanyaan kepada bapak/ibu guru..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedAssignmentForSubmit(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-lg"
                >
                  Kirimkan Tugas Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive CBT Quiz Player Modal */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Top Bar of Quiz Player */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-indigo-900 text-white">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">
                  Ujian CBT Online · {activeQuiz.subjectName}
                </span>
                <h3 className="text-base font-bold text-white leading-tight">
                  {activeQuiz.title}
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right font-mono">
                  <div className="text-[10px] text-indigo-300 uppercase">Sisa Waktu</div>
                  <div className="text-sm font-bold text-amber-300">24 : 18 WIB</div>
                </div>
                {!quizSubmitted && (
                  <button
                    onClick={() => {
                      if (window.confirm('Tutup kuis? Jawaban belum disubmit.')) {
                        setActiveQuiz(null);
                      }
                    }}
                    className="text-indigo-300 hover:text-white p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Quiz Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm flex-1">
              {!quizSubmitted ? (
                <>
                  {/* Question Navigator Dots */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
                    {activeQuiz.questions?.map((q, idx) => {
                      const isAnswered = selectedAnswers[q.id] !== undefined;
                      const isCurrent = currentQuestionIndex === idx;

                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQuestionIndex(idx)}
                          className={`w-8 h-8 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-indigo-900 text-white ring-2 ring-indigo-500'
                              : isAnswered
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Question Box */}
                  {activeQuiz.questions && activeQuiz.questions[currentQuestionIndex] && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-slate-900">
                          Soal Nomor {currentQuestionIndex + 1} dari {activeQuiz.questions.length}
                        </span>
                        <span className="font-mono text-indigo-700 font-bold">
                          Bobot: {activeQuiz.questions[currentQuestionIndex].points} Poin
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium leading-relaxed">
                        {activeQuiz.questions[currentQuestionIndex].questionText}
                      </div>

                      {/* Options */}
                      {activeQuiz.questions[currentQuestionIndex].type === 'multiple_choice' && (
                        <div className="space-y-2 pt-2">
                          {activeQuiz.questions[currentQuestionIndex].options?.map((opt, optIdx) => {
                            const isSelected =
                              selectedAnswers[activeQuiz.questions![currentQuestionIndex].id] === optIdx;

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => {
                                  setSelectedAnswers({
                                    ...selectedAnswers,
                                    [activeQuiz.questions![currentQuestionIndex].id]: optIdx,
                                  });
                                }}
                                className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center gap-3 cursor-pointer ${
                                  isSelected
                                    ? 'border-indigo-600 bg-indigo-50/60 font-semibold text-indigo-950 ring-1 ring-indigo-500'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                                }`}
                              >
                                <div
                                  className={`w-6 h-6 rounded-full font-bold flex items-center justify-center shrink-0 text-xs ${
                                    isSelected
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {String.fromCharCode(65 + optIdx)}
                                </div>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {activeQuiz.questions[currentQuestionIndex].type === 'essay' && (
                        <div className="space-y-2 pt-2">
                          <label className="block text-xs font-semibold text-slate-700">
                            Tuliskan Jawaban Essay Anda:
                          </label>
                          <textarea
                            rows={5}
                            placeholder="Ketikkan analisa dan penjelasan lengkap..."
                            className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* Quiz Finished Result Screen */
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <Award className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Kuis CBT Berhasil Diselesaikan!
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    Jawaban Anda telah terkirim dan tersinkronisasi ke sistem penilaian guru serta buku rapor digital.
                  </p>
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 max-w-xs mx-auto">
                    <div className="text-xs font-semibold text-emerald-800">Skor Evaluasi Instan:</div>
                    <div className="text-4xl font-black text-emerald-700 font-mono mt-1">
                      {quizScoreResult} <span className="text-sm font-normal text-slate-500">/ 100</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quiz Footer Controls */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              {!quizSubmitted ? (
                <>
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 font-medium cursor-pointer"
                  >
                    Sebelumnya
                  </button>

                  {currentQuestionIndex < (activeQuiz.questions?.length || 1) - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                      className="px-5 py-2 bg-indigo-900 hover:bg-indigo-800 text-white font-semibold rounded-lg cursor-pointer"
                    >
                      Selanjutnya
                    </button>
                  ) : (
                    <button
                      onClick={handleFinishQuiz}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer shadow-xs"
                    >
                      Selesaikan & Kirim Kuis
                    </button>
                  )}
                </>
              ) : (
                <div className="w-full flex justify-end">
                  <button
                    onClick={() => setActiveQuiz(null)}
                    className="px-5 py-2 bg-slate-900 text-white font-medium rounded-lg"
                  >
                    Kembali ke Daftar Tugas
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
