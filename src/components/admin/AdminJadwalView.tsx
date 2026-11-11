import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Schedule } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Printer,
  Filter,
  User,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  X,
  Layers
} from 'lucide-react';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const AdminJadwalView: React.FC = () => {
  const {
    schedules,
    classes,
    subjects,
    users,
    activeAcademicYear,
    addSchedule,
    deleteSchedule,
  } = useDatabase();

  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const teachers = users.filter((u) => u.role === 'guru');

  const [form, setForm] = useState<{
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
    teacherId: teachers[0]?.id || '',
    day: 'Senin',
    startTime: '07:15',
    endTime: '08:45',
    room: 'Ruang 101',
  });

  const handleOpenAdd = () => {
    setForm({
      classId: classes[0]?.id || '',
      subjectId: subjects[0]?.id || '',
      teacherId: teachers[0]?.id || '',
      day: 'Senin',
      startTime: '07:15',
      endTime: '08:45',
      room: 'Ruang 101',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.classId || !form.subjectId || !form.teacherId) {
      alert('Mohon lengkapi semua data jadwal.');
      return;
    }

    // Check potential conflicts
    const conflict = schedules.find(
      (s) =>
        s.day === form.day &&
        s.startTime === form.startTime &&
        (s.teacherId === form.teacherId || (s.room === form.room && s.classId !== form.classId))
    );

    if (conflict) {
      const isTeacherConflict = conflict.teacherId === form.teacherId;
      if (
        !window.confirm(
          `Peringatan bentrok jadwal: ${
            isTeacherConflict ? 'Guru pengampu' : 'Ruang kelas'
          } sudah dijadwalkan pada hari dan jam yang sama. Tetap simpan?`
        )
      ) {
        return;
      }
    }

    const cls = classes.find((c) => c.id === form.classId);
    const sub = subjects.find((s) => s.id === form.subjectId);
    const teacher = users.find((u) => u.id === form.teacherId);

    addSchedule({
      classId: form.classId,
      className: cls?.name || 'Kelas',
      subjectId: form.subjectId,
      subjectName: sub?.name || 'Mata Pelajaran',
      teacherId: form.teacherId,
      teacherName: teacher?.name || 'Guru',
      day: form.day,
      startTime: form.startTime,
      endTime: form.endTime,
      room: form.room,
    });
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus jadwal pelajaran ini?')) {
      deleteSchedule(id);
    }
  };

  // Filtered schedules
  const activeSchedules = schedules;
  const filteredSchedules = activeSchedules.filter((s) => {
    const matchesClass = selectedClassId === 'all' || s.classId === selectedClassId;
    const matchesDay = selectedDay === 'all' || s.day === selectedDay;
    return matchesClass && matchesDay;
  });

  // Calculate stats
  const totalSlots = activeSchedules.length;
  const uniqueRooms = Array.from(new Set(activeSchedules.map((s) => s.room))).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-900 rounded-lg">
              <Calendar className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Penjadwalan Pelajaran & Ruang Kelas</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pengaturan jadwal mengajar resmi, alokasi ruang kelas, dan pemetaan guru pengampu SMA PGRI 4 Gandrungmangu.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="no-print inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Jadwal</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tahun Pelajaran</div>
          <div className="text-lg sm:text-xl font-bold text-blue-900 mt-2">
            {activeAcademicYear.year} ({activeAcademicYear.semester})
          </div>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Semester Berjalan
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sesi Pelajaran</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{totalSlots} Sesi</div>
          <p className="text-[11px] text-slate-500 mt-1">Terjadwal per minggu</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ruang Kelas Aktif</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-700 mt-2">{uniqueRooms} Ruang</div>
          <p className="text-[11px] text-slate-500 mt-1">Gedung Utama & Lab</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kelas Terlayani</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-2">{classes.length} Rombel</div>
          <p className="text-[11px] text-slate-500 mt-1">Fase E & Fase F</p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Pilih Rombel / Kelas:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 font-medium"
            >
              <option value="all">Semua Rombel ({classes.length})</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.phase})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Hari:</span>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 font-medium"
            >
              <option value="all">Semua Hari</option>
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium self-end md:self-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
              viewMode === 'table' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tabel Daftar
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
              viewMode === 'grid' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Grid Mingguan
          </button>
        </div>
      </div>

      {/* VIEW: TABLE MODE */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">Hari & Jam</th>
                  <th className="py-3.5 px-4">Kelas (Rombel)</th>
                  <th className="py-3.5 px-4">Mata Pelajaran</th>
                  <th className="py-3.5 px-4">Guru Pengampu</th>
                  <th className="py-3.5 px-4">Ruang</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Tidak ada jadwal yang sesuai dengan filter yang dipilih.
                    </td>
                  </tr>
                ) : (
                  filteredSchedules.map((sch, idx) => {
                    const cls = classes.find((c) => c.id === sch.classId);
                    const sub = subjects.find((s) => s.id === sch.subjectId);
                    const teacher = users.find((u) => u.id === sch.teacherId);

                    return (
                      <tr key={sch.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{sch.day}</div>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {sch.startTime} - {sch.endTime} WIB
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 px-2 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 rounded text-xs">
                            {cls?.name || 'Kelas -'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{sub?.name || 'Mapel -'}</div>
                          <div className="text-[11px] text-slate-500">{sub?.category}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-[10px]">
                              {teacher?.name?.charAt(0) || 'G'}
                            </div>
                            <span className="font-medium text-slate-900">{teacher?.name || 'Guru -'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {sch.room}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleDelete(sch.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Hapus Jadwal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: WEEKLY GRID MODE */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DAYS.map((dayName) => {
            const daySchedules = filteredSchedules
              .filter((s) => s.day === dayName)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));

            return (
              <div key={dayName} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">{dayName}</h3>
                  <span className="text-[11px] font-semibold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                    {daySchedules.length} Sesi
                  </span>
                </div>

                <div className="p-3 space-y-2.5 flex-1 divide-y divide-slate-100">
                  {daySchedules.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs italic">
                      Tidak ada jam pelajaran
                    </div>
                  ) : (
                    daySchedules.map((sch) => {
                      const cls = classes.find((c) => c.id === sch.classId);
                      const sub = subjects.find((s) => s.id === sch.subjectId);
                      const teacher = users.find((u) => u.id === sch.teacherId);

                      return (
                        <div key={sch.id} className="pt-2.5 first:pt-0">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-blue-950 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3 text-blue-900" />
                              {sch.startTime} - {sch.endTime}
                            </span>
                            <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-semibold text-slate-600">
                              {sch.room}
                            </span>
                          </div>

                          <div className="mt-1 font-bold text-slate-900 text-xs">
                            {sub?.name || 'Mata Pelajaran'}
                          </div>

                          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-600">
                            <span className="font-semibold text-blue-900">{cls?.name}</span>
                            <span className="truncate max-w-[140px] text-slate-500">{teacher?.name}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-900" />
                <h3 className="font-bold text-slate-900 text-base">Tambah Jadwal Pelajaran</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rombel / Kelas *</label>
                  <select
                    required
                    value={form.classId}
                    onChange={(e) => setForm({ ...form, classId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 bg-white"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.phase})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hari Pelajaran *</label>
                  <select
                    value={form.day}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        day: e.target.value as 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu',
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 bg-white"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran *</label>
                <select
                  required
                  value={form.subjectId}
                  onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 bg-white"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      [{sub.code}] {sub.name} ({sub.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Guru Pengampu *</label>
                <select
                  required
                  value={form.teacherId}
                  onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 bg-white"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} (NIP: {t.identityNumber || '-'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jam Mulai *</label>
                  <input
                    type="time"
                    required
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jam Selesai *</label>
                  <input
                    type="time"
                    required
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ruang Kelas *</label>
                  <input
                    type="text"
                    required
                    value={form.room}
                    onChange={(e) => setForm({ ...form, room: e.target.value })}
                    placeholder="Contoh: R-101 / Lab Komputer"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-semibold cursor-pointer shadow-xs"
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
