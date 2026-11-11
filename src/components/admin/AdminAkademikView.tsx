import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { SchoolClass, AcademicYear } from '../../types';
import {
  Layers,
  Calendar,
  Plus,
  Trash2,
  Users,
  GraduationCap,
  X,
  CheckCircle2
} from 'lucide-react';

export const AdminAkademikView: React.FC = () => {
  const {
    classes,
    users,
    academicYears,
    activeAcademicYear,
    setActiveAcademicYear,
    addAcademicYear,
    addClass,
    deleteClass,
  } = useDatabase();

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);

  const [classForm, setClassForm] = useState<{
    name: string;
    grade: 10 | 11 | 12;
    phase: 'Fase E' | 'Fase F';
    track: string;
    homeroomTeacherId: string;
    capacity: number;
  }>({
    name: '',
    grade: 11,
    phase: 'Fase F',
    track: 'Peminatan Sains & Teknologi',
    homeroomTeacherId: users.find((u) => u.role === 'guru')?.id || '',
    capacity: 36,
  });

  const [yearForm, setYearForm] = useState<{
    year: string;
    semester: 'Ganjil' | 'Genap';
    startDate: string;
    endDate: string;
  }>({
    year: '2026/2027',
    semester: 'Ganjil',
    startDate: '2026-07-13',
    endDate: '2026-12-18',
  });

  const teachers = users.filter((u) => u.role === 'guru');

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    const homeroom = teachers.find((t) => t.id === classForm.homeroomTeacherId);
    addClass({
      name: classForm.name,
      grade: classForm.grade,
      phase: classForm.phase,
      track: classForm.track,
      homeroomTeacherId: classForm.homeroomTeacherId,
      homeroomTeacherName: homeroom?.name || 'Belum ditentukan',
      academicYearId: activeAcademicYear.id,
      capacity: classForm.capacity,
    });
    setIsClassModalOpen(false);
    setClassForm({
      name: '',
      grade: 11,
      phase: 'Fase F',
      track: 'Peminatan Sains & Teknologi',
      homeroomTeacherId: teachers[0]?.id || '',
      capacity: 36,
    });
  };

  const handleSaveYear = (e: React.FormEvent) => {
    e.preventDefault();
    addAcademicYear({
      year: yearForm.year,
      semester: yearForm.semester,
      isActive: false,
      startDate: yearForm.startDate,
      endDate: yearForm.endDate,
    });
    setIsYearModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-900" />
            <h2 className="text-xl font-bold text-slate-900">Master Data Akademik</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan Tahun Ajaran, Semester Aktif, Fase Kurikulum Merdeka (E & F), serta Rombongan Belajar (Kelas).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsYearModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Tambah Tahun Ajaran</span>
          </button>

          <button
            onClick={() => setIsClassModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buka Rombel Baru</span>
          </button>
        </div>
      </div>

      {/* Academic Year Control Box */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Status Tahun Ajaran & Semester Sekolah
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {academicYears.map((ay) => {
            const isCurrent = ay.isActive;

            return (
              <div
                key={ay.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    TP {ay.year} · {ay.semester}
                  </span>
                  {isCurrent ? (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      Sedang Aktif
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveAcademicYear(ay.id)}
                      className="text-xs text-blue-700 hover:underline cursor-pointer font-semibold"
                    >
                      Aktifkan
                    </button>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-2 font-mono">
                  {ay.startDate} s.d. {ay.endDate}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rombel / Classes Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Daftar Rombongan Belajar (Kelas) Aktif ({classes.length} Kelas)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((c) => {
            const studentsInClass = users.filter((u) => u.role === 'siswa' && u.classId === c.id);

            return (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200 mb-1.5">
                      {c.phase} · Tingkat {c.grade}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{c.name}</h3>
                    <p className="text-xs text-slate-500">{c.track || 'Kurikulum Merdeka'}</p>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus rombel ${c.name}?`)) {
                        deleteClass(c.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                    title="Hapus Rombel"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1 text-slate-500">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Wali Kelas:</span>
                    </span>
                    <span className="font-semibold text-slate-900">{c.homeroomTeacherName || '-'}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Users className="w-3.5 h-3.5" />
                      <span>Terisi:</span>
                    </span>
                    <span className="font-bold text-slate-900 tabular-nums font-mono">
                      {studentsInClass.length} / {c.capacity} Siswa
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, (studentsInClass.length / c.capacity) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Class Modal */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Buka Rombel Baru</h3>
              <button onClick={() => setIsClassModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveClass} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Rombel / Kelas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: XI Fase F-3"
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tingkat</label>
                  <select
                    value={classForm.grade}
                    onChange={(e) => setClassForm({ ...classForm, grade: Number(e.target.value) as 10 | 11 | 12 })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value={10}>Kelas 10 (Fase E)</option>
                    <option value={11}>Kelas 11 (Fase F)</option>
                    <option value={12}>Kelas 12 (Fase F)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fase Kurikulum</label>
                  <select
                    value={classForm.phase}
                    onChange={(e) => setClassForm({ ...classForm, phase: e.target.value as 'Fase E' | 'Fase F' })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Fase E">Fase E</option>
                    <option value="Fase F">Fase F</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jurusan / Konsentrasi</label>
                <input
                  type="text"
                  value={classForm.track}
                  onChange={(e) => setClassForm({ ...classForm, track: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Wali Kelas</label>
                <select
                  value={classForm.homeroomTeacherId}
                  onChange={(e) => setClassForm({ ...classForm, homeroomTeacherId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} (NIP: {t.identityNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-lg"
                >
                  Simpan Rombel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Year Modal */}
      {isYearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Tambah Tahun Ajaran Baru</h3>
              <button onClick={() => setIsYearModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveYear} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tahun Ajaran</label>
                  <input
                    type="text"
                    required
                    placeholder="2026/2027"
                    value={yearForm.year}
                    onChange={(e) => setYearForm({ ...yearForm, year: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                  <select
                    value={yearForm.semester}
                    onChange={(e) => setYearForm({ ...yearForm, semester: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Ganjil">Ganjil</option>
                    <option value="Genap">Genap</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={yearForm.startDate}
                    onChange={(e) => setYearForm({ ...yearForm, startDate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    required
                    value={yearForm.endDate}
                    onChange={(e) => setYearForm({ ...yearForm, endDate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsYearModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-lg"
                >
                  Simpan Tahun Ajaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
