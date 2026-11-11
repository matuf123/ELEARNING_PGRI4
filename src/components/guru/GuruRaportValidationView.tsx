import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { HomeroomValidation } from '../../types';
import {
  FileCheck,
  CheckCircle2,
  Clock,
  Edit,
  Save,
  Check,
  Award,
  Users,
  Printer
} from 'lucide-react';

export const GuruRaportValidationView: React.FC = () => {
  const {
    currentUser,
    classes,
    users,
    homeroomValidations,
    updateHomeroomValidation,
    activeAcademicYear,
    grades,
  } = useDatabase();

  // Find class where current teacher is homeroom teacher
  const homeroomClass = classes.find((c) => c.homeroomTeacherId === currentUser.id) || classes[0];
  const students = users.filter((u) => u.role === 'siswa' && u.classId === homeroomClass.id);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Active student validation record
  const currentValidation = homeroomValidations.find(
    (h) => h.studentId === selectedStudentId && h.academicYearId === activeAcademicYear.id
  );

  const [characterNote, setCharacterNote] = useState<string>(
    currentValidation?.characterNote ||
      'Menunjukkan integritas tinggi, sopan santun, disiplin belajar, dan aktif berkontribusi dalam kegiatan kelas.'
  );
  const [extracurricularNote, setExtracurricularNote] = useState<string>(
    currentValidation?.extracurricularNote || 'Pramuka Penegak (Aktif) dan Palang Merah Remaja (PMR).'
  );
  const [attendanceNote, setAttendanceNote] = useState<string>(
    currentValidation?.attendanceNote || 'Kehadiran sangat memuaskan, konsisten hadir tepat waktu.'
  );
  const [isApproved, setIsApproved] = useState<boolean>(currentValidation?.isApproved ?? true);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  // Student grades for quick preview
  const studentGrades = grades.filter(
    (g) => g.studentId === selectedStudentId && g.academicYearId === activeAcademicYear.id
  );

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    const existing = homeroomValidations.find(
      (h) => h.studentId === studentId && h.academicYearId === activeAcademicYear.id
    );
    if (existing) {
      setCharacterNote(existing.characterNote);
      setExtracurricularNote(existing.extracurricularNote);
      setAttendanceNote(existing.attendanceNote);
      setIsApproved(existing.isApproved);
    } else {
      setCharacterNote('Menunjukkan integritas tinggi, sopan santun, disiplin belajar, dan aktif berkontribusi.');
      setExtracurricularNote('Pramuka Penegak (Aktif).');
      setAttendanceNote('Kehadiran sangat baik tanpa alpa.');
      setIsApproved(true);
    }
  };

  const handleSaveValidation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    updateHomeroomValidation({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      studentNisn: selectedStudent.identityNumber,
      classId: homeroomClass.id,
      academicYearId: activeAcademicYear.id,
      semester: activeAcademicYear.semester,
      characterNote,
      extracurricularNote,
      attendanceNote,
      isApproved,
      approvedDate: new Date().toISOString().split('T')[0],
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-700" />
            <h2 className="text-xl font-bold text-slate-900">Validasi Raport & Catatan Wali Kelas</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Penulisan catatan perkembangan karakter profil pelajar Pancasila, kegiatan ekstrakurikuler, serta pengesahan e-raport kelas binaan Anda.
          </p>
        </div>

        <div className="bg-emerald-50 text-emerald-900 font-bold px-3.5 py-1.5 rounded-lg border border-emerald-200 text-xs">
          Wali Kelas: {homeroomClass.name}
        </div>
      </div>

      {/* Main Grid: Student list on left, validation form on right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left 4 Cols: Student List */}
        <div className="md:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
              Daftar Siswa Kelas {homeroomClass.name}
            </h3>
            <p className="text-[11px] text-slate-500">{students.length} Siswa Terdaftar</p>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[500px]">
            {students.map((st) => {
              const isSelected = selectedStudentId === st.id;
              const val = homeroomValidations.find(
                (h) => h.studentId === st.id && h.academicYearId === activeAcademicYear.id
              );

              return (
                <button
                  key={st.id}
                  onClick={() => handleSelectStudent(st.id)}
                  className={`w-full p-3.5 text-left transition-colors flex items-center justify-between cursor-pointer ${
                    isSelected ? 'bg-blue-50/80 border-r-2 border-blue-900' : 'hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900">{st.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">NISN: {st.identityNumber}</div>
                  </div>
                  {val?.isApproved ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Valid</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Draft
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 8 Cols: Homeroom Notes & Approval Form */}
        <div className="md:col-span-8 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          {selectedStudent ? (
            <form onSubmit={handleSaveValidation} className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Formulir Validasi Rapor: {selectedStudent.name}
                  </h3>
                  <p className="text-slate-500 font-mono text-[11px]">
                    NISN: {selectedStudent.identityNumber} · Kelas {homeroomClass.name}
                  </p>
                </div>

                {saveSuccess && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Catatan Berhasil Disimpan!</span>
                  </span>
                )}
              </div>

              {/* Grades Preview Strip */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="font-semibold text-slate-700 mb-1.5">
                  Rata-rata Capaian Nilai Rapor Semester Ini:
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {studentGrades.map((g) => (
                    <span
                      key={g.id}
                      className="px-2 py-1 bg-white border border-slate-200 rounded font-medium text-[11px]"
                    >
                      {g.subjectName}: <strong className="font-mono text-blue-900">{g.finalScore} ({g.letterGrade})</strong>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  1. Catatan Perkembangan Karakter & Dimensi Profil Pelajar Pancasila
                </label>
                <textarea
                  rows={3}
                  required
                  value={characterNote}
                  onChange={(e) => setCharacterNote(e.target.value)}
                  placeholder="Deskripsi pencapaian akhlak, kemandirian, dan gotong royong..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  2. Keterangan Partisipasi Kegiatan Ekstrakurikuler
                </label>
                <textarea
                  rows={2}
                  required
                  value={extracurricularNote}
                  onChange={(e) => setExtracurricularNote(e.target.value)}
                  placeholder="Nama kegiatan ekstrakurikuler dan predikat keaktifan..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  3. Catatan Kedisiplinan & Presensi Kehadiran
                </label>
                <input
                  type="text"
                  required
                  value={attendanceNote}
                  onChange={(e) => setAttendanceNote(e.target.value)}
                  placeholder="Contoh: Kehadiran sangat baik tanpa catatan alpa..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-blue-900">Pengesahan Status E-Raport Semester</div>
                  <div className="text-[11px] text-blue-700">
                    Menyetujui bahwa seluruh nilai dan catatan telah diverifikasi oleh Wali Kelas.
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isApproved}
                    onChange={(e) => setIsApproved(e.target.checked)}
                    className="rounded text-blue-900 w-4 h-4 cursor-pointer"
                  />
                  <span className="font-bold text-blue-900">Sah & Valid</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Catatan & Validasi Rapor</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400">
              Pilih siswa di sebelah kiri untuk mengisi catatan wali kelas.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
