import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { AttendanceRecord, AttendanceStatus } from '../../types';
import {
  Users,
  CheckCircle2,
  Calendar,
  Clock,
  Save,
  Check,
  AlertCircle,
  RotateCcw
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const {
    currentUser,
    classes,
    subjects,
    schedules,
    users,
    saveAttendanceSession,
  } = useDatabase();

  const mySchedules = schedules.filter((s) => s.teacherId === currentUser.id);
  const myClassIds = Array.from(new Set(mySchedules.map((s) => s.classId)));
  const myClasses = classes.filter((c) => myClassIds.includes(c.id));
  const mySubjectIds = Array.from(new Set(mySchedules.map((s) => s.subjectId)));
  const mySubjects = subjects.filter((s) => mySubjectIds.includes(s.id));

  const availableClasses = myClasses.length > 0 ? myClasses : classes;
  const availableSubjects = mySubjects.length > 0 ? mySubjects : subjects;

  const [selectedClassId, setSelectedClassId] = useState<string>(availableClasses[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(availableSubjects[0]?.id || '');
  const [sessionDate, setSessionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [sessionHour, setSessionHour] = useState<string>('Jam Ke 1-2 (07:30 - 09:00)');
  const [topic, setTopic] = useState<string>('Pertemuan Tatap Muka KBM Reguler');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Students in selected class
  const classStudents = users.filter((u) => u.role === 'siswa' && u.classId === selectedClassId);

  // Roster records
  const [records, setRecords] = useState<
    Record<string, { status: AttendanceStatus; notes: string }>
  >({});

  // Ensure every student has a status (default 'Hadir')
  const getStudentStatus = (studentId: string): AttendanceStatus => {
    return records[studentId]?.status || 'Hadir';
  };

  const getStudentNotes = (studentId: string): string => {
    return records[studentId]?.notes || '';
  };

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        status,
        notes: prev[studentId]?.notes || '',
      },
    }));
  };

  const setNotes = (studentId: string, notes: string) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status || 'Hadir',
        notes,
      },
    }));
  };

  const markAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; notes: string }> = {};
    classStudents.forEach((student) => {
      updated[student.id] = {
        status: 'Hadir',
        notes: records[student.id]?.notes || '',
      };
    });
    setRecords(updated);
  };

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClass = classes.find((c) => c.id === selectedClassId);
    const targetSubject = subjects.find((s) => s.id === selectedSubjectId);

    if (!targetClass || !targetSubject) return;

    const formattedRecords: AttendanceRecord[] = classStudents.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      studentNisn: s.identityNumber,
      status: getStudentStatus(s.id),
      notes: getStudentNotes(s.id),
    }));

    saveAttendanceSession({
      classId: selectedClassId,
      className: targetClass.name,
      subjectId: selectedSubjectId,
      subjectName: targetSubject.name,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      date: sessionDate,
      sessionHour,
      topic,
      records: formattedRecords,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Status counts
  let hadirCount = 0;
  let izinCount = 0;
  let sakitCount = 0;
  let alpaCount = 0;

  classStudents.forEach((s) => {
    const st = getStudentStatus(s.id);
    if (st === 'Hadir') hadirCount++;
    else if (st === 'Izin') izinCount++;
    else if (st === 'Sakit') sakitCount++;
    else if (st === 'Alpa') alpaCount++;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Presensi Kehadiran Siswa di Kelas</h2>
          <p className="text-xs text-slate-500 mt-1">
            Input absensi real-time saat jam pelajaran berlangsung (Hadir, Izin, Sakit, Alpa). Data langsung tersinkron ke profil siswa dan monitoring admin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>Presensi Berhasil Disimpan!</span>
            </div>
          )}

          <button
            onClick={markAllPresent}
            type="button"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer"
          >
            Tandai Semua Hadir
          </button>

          <button
            onClick={handleSaveAttendance}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Absensi</span>
          </button>
        </div>
      </div>

      {/* Session Details Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Rombel / Kelas</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
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
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg bg-white"
          >
            {availableSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Tanggal Pertemuan</label>
          <input
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Sesi / Jam Pelajaran</label>
          <input
            type="text"
            value={sessionHour}
            onChange={(e) => setSessionHour(e.target.value)}
            placeholder="Jam Ke 1-2 (07:30 - 09:00)"
            className="w-full p-2 border border-slate-300 rounded-lg"
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-4">
          <label className="block font-semibold text-slate-700 mb-1">Topik Bahasan / Aktivitas KBM</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Contoh: Pemaparan Materi Matriks dan Diskusi Kelompok"
            className="w-full p-2 border border-slate-300 rounded-lg"
          />
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-4 gap-3 text-center text-xs">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <div className="font-bold text-emerald-800">Hadir</div>
          <div className="text-xl font-extrabold text-emerald-700 tabular-nums">{hadirCount}</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <div className="font-bold text-blue-800">Izin</div>
          <div className="text-xl font-extrabold text-blue-700 tabular-nums">{izinCount}</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="font-bold text-amber-800">Sakit</div>
          <div className="text-xl font-extrabold text-amber-700 tabular-nums">{sakitCount}</div>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
          <div className="font-bold text-rose-800">Alpa</div>
          <div className="text-xl font-extrabold text-rose-700 tabular-nums">{alpaCount}</div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-4 min-w-[180px]">Nama Siswa & NISN</th>
                <th className="py-3 px-4 text-center min-w-[280px]">Status Kehadiran</th>
                <th className="py-3 px-4 min-w-[220px]">Catatan / Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    Tidak ada siswa terdaftar dalam kelas ini.
                  </td>
                </tr>
              ) : (
                classStudents.map((student, index) => {
                  const currentStatus = getStudentStatus(student.id);
                  const currentNotes = getStudentNotes(student.id);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-400 font-mono">
                        {index + 1}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{student.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">NISN: {student.identityNumber}</div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
                          {(['Hadir', 'Izin', 'Sakit', 'Alpa'] as AttendanceStatus[]).map((status) => {
                            const isSelected = currentStatus === status;

                            let activeColor = 'bg-slate-900 text-white';
                            if (status === 'Hadir') activeColor = 'bg-emerald-600 text-white';
                            if (status === 'Izin') activeColor = 'bg-blue-600 text-white';
                            if (status === 'Sakit') activeColor = 'bg-amber-600 text-white';
                            if (status === 'Alpa') activeColor = 'bg-rose-600 text-white';

                            return (
                              <button
                                key={status}
                                type="button"
                                onClick={() => setStatus(student.id, status)}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                                  isSelected
                                    ? activeColor + ' shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                {status}
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="Keterangan izin/sakit (opsional)..."
                          value={currentNotes}
                          onChange={(e) => setNotes(student.id, e.target.value)}
                          className="w-full p-1.5 text-xs border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={handleSaveAttendance}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Absensi Kelas</span>
          </button>
        </div>
      </div>
    </div>
  );
};
