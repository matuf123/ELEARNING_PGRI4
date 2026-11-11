import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { SchoolClass, Subject, Schedule } from '../../types';
import {
  Layers,
  BookOpen,
  Calendar,
  Plus,
  Trash2,
  Edit,
  X,
  Clock,
  MapPin,
  GraduationCap,
  Users
} from 'lucide-react';

export const AcademicCurriculumView: React.FC = () => {
  const {
    classes,
    subjects,
    schedules,
    users,
    activeAcademicYear,
    addClass,
    updateClass,
    deleteClass,
    addSubject,
    updateSubject,
    deleteSubject,
    addSchedule,
    deleteSchedule,
  } = useDatabase();

  const [activeTab, setActiveTab] = useState<'classes' | 'subjects' | 'schedules'>('classes');

  // Modals state
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Forms state
  const [classForm, setClassForm] = useState<{
    name: string;
    grade: 10 | 11 | 12;
    phase: 'Fase E' | 'Fase F';
    track: string;
    homeroomTeacherId: string;
    capacity: number;
  }>({
    name: '',
    grade: 10,
    phase: 'Fase E',
    track: 'Umum Pondasi',
    homeroomTeacherId: users.find((u) => u.role === 'guru')?.id || '',
    capacity: 36,
  });

  const [subjectForm, setSubjectForm] = useState<{
    code: string;
    name: string;
    category: 'Umum' | 'Wajib Umum' | 'Pilihan Fase F' | 'Muatan Lokal';
    weeklyHours: number;
    minPassingGrade: number;
    description: string;
  }>({
    code: '',
    name: '',
    category: 'Umum',
    weeklyHours: 3,
    minPassingGrade: 75,
    description: '',
  });

  const [scheduleForm, setScheduleForm] = useState<{
    classId: string;
    subjectId: string;
    teacherId: string;
    day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
    startTime: string;
    endTime: string;
    room: string;
  }>({
    classId: classes[0]?.id || '',
    subjectId: subjects[0]?.id || '',
    teacherId: users.find((u) => u.role === 'guru')?.id || '',
    day: 'Senin',
    startTime: '07:30',
    endTime: '09:00',
    room: 'Ruang Teori 1',
  });

  const teachers = users.filter((u) => u.role === 'guru');

  // Handle Add Class
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
  };

  // Handle Add Subject
  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    addSubject({
      code: subjectForm.code,
      name: subjectForm.name,
      category: subjectForm.category,
      weeklyHours: subjectForm.weeklyHours,
      minPassingGrade: subjectForm.minPassingGrade,
      description: subjectForm.description,
    });
    setIsSubjectModalOpen(false);
  };

  // Handle Add Schedule
  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClass = classes.find((c) => c.id === scheduleForm.classId);
    const targetSubject = subjects.find((s) => s.id === scheduleForm.subjectId);
    const targetTeacher = teachers.find((t) => t.id === scheduleForm.teacherId);

    if (!targetClass || !targetSubject || !targetTeacher) return;

    addSchedule({
      classId: scheduleForm.classId,
      className: targetClass.name,
      subjectId: scheduleForm.subjectId,
      subjectName: targetSubject.name,
      teacherId: scheduleForm.teacherId,
      teacherName: targetTeacher.name,
      day: scheduleForm.day,
      startTime: scheduleForm.startTime,
      endTime: scheduleForm.endTime,
      room: scheduleForm.room,
    });
    setIsScheduleModalOpen(false);
  };

  // Selected schedule class filter
  const [selectedScheduleClass, setSelectedScheduleClass] = useState<string>('all');
  const filteredSchedules = schedules.filter((s) =>
    selectedScheduleClass === 'all' ? true : s.classId === selectedScheduleClass
  );

  return (
    <div className="space-y-6">
      {/* Header & Academic Tab Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Akademik & Kurikulum Merdeka</h2>
          <p className="text-xs text-slate-500 mt-1">
            Pengaturan Rombongan Belajar, Master Mata Pelajaran, serta Pemetaan Jadwal KBM Sekolah.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('classes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'classes'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Rombel / Kelas ({classes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('subjects')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'subjects'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Mata Pelajaran ({subjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('schedules')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'schedules'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Jadwal Pelajaran ({schedules.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: KELAS / ROMBEL */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Daftar Rombongan Belajar Aktif (TP {activeAcademicYear.year})
            </span>
            <button
              onClick={() => setIsClassModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buka Kelas Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((c) => {
              const studentsInClass = users.filter((u) => u.role === 'siswa' && u.classId === c.id);
              return (
                <div
                  key={c.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 mb-1.5">
                        {c.phase} · Tingkat {c.grade}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{c.name}</h3>
                      <p className="text-xs text-slate-500">{c.track || 'Kurikulum Merdeka'}</p>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm(`Hapus rombel ${c.name}?`)) {
                          deleteClass(c.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                      title="Hapus Rombel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
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
                        <span>Jumlah Siswa:</span>
                      </span>
                      <span className="font-bold text-slate-900 tabular-nums">
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
      )}

      {/* TAB 2: MATA PELAJARAN */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Struktur Master Mata Pelajaran (Kurikulum Merdeka)
            </span>
            <button
              onClick={() => setIsSubjectModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Mata Pelajaran</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Kode Mapel</th>
                    <th className="py-3 px-4">Nama Mata Pelajaran</th>
                    <th className="py-3 px-4">Kategori Kurikulum</th>
                    <th className="py-3 px-4 text-center">Beban (JP/Minggu)</th>
                    <th className="py-3 px-4 text-center">KKTP Minimal</th>
                    <th className="py-3 px-4">Deskripsi / Capaian Pembelajaran</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjects.map((s) => {
                    const getCategoryBadge = (cat: string) => {
                      switch (cat) {
                        case 'Umum':
                        case 'Wajib Umum':
                          return 'bg-blue-50 text-blue-800 border-blue-200';
                        case 'Pilihan Fase F':
                          return 'bg-purple-50 text-purple-800 border-purple-200';
                        case 'Muatan Lokal':
                          return 'bg-amber-50 text-amber-800 border-amber-200';
                        default:
                          return 'bg-slate-50 text-slate-800 border-slate-200';
                      }
                    };

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {s.code}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {s.name}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryBadge(s.category)}`}>
                            {s.category === 'Wajib Umum' ? 'Umum' : s.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-800 tabular-nums">
                          {s.weeklyHours} JP
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-700 tabular-nums">
                          {s.minPassingGrade}
                        </td>
                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                          {s.description || '-'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus mapel ${s.name}?`)) {
                                deleteSubject(s.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PENJADWALAN PELAJARAN */}
      {activeTab === 'schedules' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Filter Rombel:
              </span>
              <select
                value={selectedScheduleClass}
                onChange={(e) => setSelectedScheduleClass(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 font-medium cursor-pointer"
              >
                <option value="all">Semua Rombel ({classes.length} Kelas)</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phase})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Jadwalkan Mata Pelajaran</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Hari & Jam</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4">Mata Pelajaran</th>
                    <th className="py-3 px-4">Guru Pengampu</th>
                    <th className="py-3 px-4">Ruang Kelas / Lab</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSchedules.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        Belum ada jadwal yang diplot untuk filter kelas ini.
                      </td>
                    </tr>
                  ) : (
                    filteredSchedules.map((sch) => (
                      <tr key={sch.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{sch.day}</div>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{sch.startTime} - {sch.endTime} WIB</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded text-[11px] border border-blue-200">
                            {sch.className}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {sch.subjectName}
                        </td>

                        <td className="py-3 px-4 text-slate-700">
                          {sch.teacherName}
                        </td>

                        <td className="py-3 px-4 text-slate-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{sch.room}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus jadwal ${sch.subjectName} di ${sch.className}?`)) {
                                deleteSchedule(sch.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Class Modal */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
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
                <label className="block font-semibold text-slate-700 mb-1">Peminatan / Jurusan</label>
                <input
                  type="text"
                  placeholder="Contoh: Peminatan Sains & Teknologi"
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

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kapasitas Maksimal Siswa</label>
                <input
                  type="number"
                  min={10}
                  max={45}
                  value={classForm.capacity}
                  onChange={(e) => setClassForm({ ...classForm, capacity: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
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

      {/* Subject Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Tambah Mata Pelajaran</h3>
              <button onClick={() => setIsSubjectModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveSubject} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kode Mapel</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SOS-02"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={subjectForm.category}
                    onChange={(e) => setSubjectForm({ ...subjectForm, category: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Umum">Umum</option>
                    <option value="Pilihan Fase F">Pilihan Fase F</option>
                    <option value="Muatan Lokal">Muatan Lokal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Mata Pelajaran</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sosiologi (Fase F)"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Beban Jam (JP / Minggu)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={subjectForm.weeklyHours}
                    onChange={(e) => setSubjectForm({ ...subjectForm, weeklyHours: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">KKTP Minimum</label>
                  <input
                    type="number"
                    min={60}
                    max={100}
                    value={subjectForm.minPassingGrade}
                    onChange={(e) => setSubjectForm({ ...subjectForm, minPassingGrade: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Ringkas</label>
                <textarea
                  rows={3}
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-lg"
                >
                  Simpan Mapel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Jadwalkan Mata Pelajaran</h3>
              <button onClick={() => setIsScheduleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveSchedule} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rombel / Kelas</label>
                <select
                  value={scheduleForm.classId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, classId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phase})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                <select
                  value={scheduleForm.subjectId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, subjectId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) - {s.category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Guru Pengampu</label>
                <select
                  value={scheduleForm.teacherId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, teacherId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} (NIP: {t.identityNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hari</label>
                  <select
                    value={scheduleForm.day}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    required
                    value={scheduleForm.startTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    required
                    value={scheduleForm.endTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ruangan / Laboratorium</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Lab Komputer 1 / Ruang Teori 11-A"
                  value={scheduleForm.room}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, room: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-lg"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
