import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Assignment, QuizQuestion } from '../../types';
import {
  HelpCircle,
  PlayCircle,
  Clock,
  Award,
  CheckCircle2,
  Calendar,
  AlertCircle,
  X,
  FileText,
  RotateCcw
} from 'lucide-react';

export const StudentOnlineExamView: React.FC = () => {
  const { currentUser, assignments, submissions, submitAssignmentWork } = useDatabase();

  const myClassId = currentUser.classId;

  // Filter assignments that are quizzes / exams
  const examAssignments = assignments.filter(
    (a) =>
      a.classId === myClassId &&
      (a.type === 'Kuis Online' || a.type === 'Ulangan Harian' || a.questions !== undefined)
  );

  const mySubmissions = submissions.filter((s) => s.studentId === currentUser.id);

  // Active quiz being taken
  const [activeQuiz, setActiveQuiz] = useState<Assignment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScoreResult, setQuizScoreResult] = useState<number | null>(null);

  const handleStartExam = (asg: Assignment) => {
    setActiveQuiz(asg);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScoreResult(null);
  };

  const handleFinishExam = () => {
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
        earnedPoints += q.points; // Essay gets full points on completion in demo
      }
    });

    const finalScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 100;
    setQuizScoreResult(finalScore);
    setQuizSubmitted(true);

    submitAssignmentWork({
      assignmentId: activeQuiz.id,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentNisn: currentUser.identityNumber,
      fileName: `Lembar_Jawaban_CBT_${activeQuiz.id}.pdf`,
      notes: 'Ujian CBT online selesai dan tersimpan di server sekolah.',
      score: finalScore,
      teacherFeedback: `Hasil Ujian CBT Otomatis: Skor perolehan ${finalScore}/100. Sangat baik.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-700" />
            <h2 className="text-xl font-bold text-slate-900">Ujian Online & CBT (Computer Based Test)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Portal asesmen sumatif, ulangan harian, try-out, dan evaluasi CBT terjadwal Kurikulum Merdeka SMA PGRI 4 Gandrungmangu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">
            Sistem CBT Terverifikasi
          </span>
        </div>
      </div>

      {/* Exam List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {examAssignments.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-500">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-800 text-sm">Tidak ada jadwal ujian aktif.</p>
            <p className="text-slate-400 mt-1">Seluruh jadwal ujian atau kuis CBT akan diumumkan oleh guru pengampu.</p>
          </div>
        ) : (
          examAssignments.map((exam) => {
            const sub = mySubmissions.find((s) => s.assignmentId === exam.id);
            const isCompleted = sub !== undefined && sub.score !== undefined;

            return (
              <div
                key={exam.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                      {exam.type} · CBT
                    </span>
                    <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Durasi: {exam.durationMinutes || 30} Menit</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {exam.title}
                  </h3>

                  <div className="text-xs text-slate-600">
                    Mata Pelajaran: <strong>{exam.subjectName}</strong> · Guru: {exam.teacherName}
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {exam.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {isCompleted ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Sudah Dikerjakan
                      </span>
                      <span className="font-mono font-black text-emerald-700 text-sm">
                        Nilai: {sub.score}/100
                      </span>
                    </div>
                  ) : (
                    <span className="text-rose-700 font-semibold font-mono text-[11px]">
                      Batas: {exam.dueDate}
                    </span>
                  )}

                  {!isCompleted ? (
                    <button
                      onClick={() => handleStartExam(exam)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Masuk Ujian CBT</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartExam(exam)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Buka Review Soal
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CBT Player Modal */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Top Bar of Quiz Player */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-indigo-950 text-white">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">
                  Ujian CBT Online SMA PGRI 4 Gandrungmangu
                </span>
                <h3 className="text-base font-bold text-white leading-tight">
                  {activeQuiz.title} · {activeQuiz.subjectName}
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right font-mono">
                  <div className="text-[10px] text-indigo-300 uppercase">Timer Ujian</div>
                  <div className="text-sm font-bold text-amber-300">24 : 18 WIB</div>
                </div>
                {!quizSubmitted && (
                  <button
                    onClick={() => {
                      if (window.confirm('Tutup lembar ujian CBT?')) {
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
                  {/* Question Navigator */}
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
                          Butir Soal Nomor {currentQuestionIndex + 1} dari {activeQuiz.questions.length}
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
                            Lembar Jawaban Essay Anda:
                          </label>
                          <textarea
                            rows={5}
                            placeholder="Ketikkan argumen dan langkah penyelesaian..."
                            className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <Award className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Evaluasi CBT Selesai Terverifikasi!
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    Jawaban Anda telah tersimpan di server sekolah dan disinkronkan ke rekapitulasi penilaian guru.
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

            {/* Footer */}
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
                      onClick={handleFinishExam}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer shadow-xs"
                    >
                      Kirimkan Lembar Ujian CBT
                    </button>
                  )}
                </>
              ) : (
                <div className="w-full flex justify-end">
                  <button
                    onClick={() => setActiveQuiz(null)}
                    className="px-5 py-2 bg-slate-900 text-white font-medium rounded-lg"
                  >
                    Kembali ke Beranda Ujian
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
