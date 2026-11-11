import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Calendar,
  Clock,
  MapPin,
  GraduationCap,
  Users,
  BookOpen,
  ChevronRight
} from 'lucide-react';

interface GuruJadwalViewProps {
  onNavigate?: (tabId: string) => void;
}

export const GuruJadwalView: React.FC<GuruJadwalViewProps> = ({ onNavigate }) => {
  const { currentUser, schedules, classes, users } = useDatabase();

  const mySchedules = schedules.filter((s) => s.teacherId === currentUser.id);

  // Group schedules by day
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const;
  const [selectedDay, setSelectedDay] = useState<string>('all');

  const filteredSchedules = mySchedules.filter((s) =>
    selectedDay === 'all' ? true : s.day === selectedDay
  );

  // Classes taught by this guru
  const myClassIds = Array.from(new Set(mySchedules.map((s) => s.classId)));
  const myClasses = classes.filter((c) => myClassIds.includes(c.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-900" />
            <h2 className="text-xl font-bold text-slate-900">Jadwal & Rombel Kelas Mengajar</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Penugasan jam mengajar resmi, jadwal mingguan tatap muka, serta data rombongan belajar yang Anda ampu.
          </p>
        </div>

        <div className="bg-blue-50 text-blue-900 font-bold px-3.5 py-1.5 rounded-lg border border-blue-200 text-xs">
          Total Beban: {mySchedules.length * 2} JP / Minggu
        </div>
      </div>

      {/* Rombel Summary Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Rombongan Belajar yang Diampu ({myClasses.length} Kelas)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myClasses.map((cls) => {
            const countStudents = users.filter((u) => u.role === 'siswa' && u.classId === cls.id).length;
            const clsSchedules = mySchedules.filter((s) => s.classId === cls.id);

            return (
              <div
                key={cls.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {cls.phase}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 font-mono">
                    {countStudents} Siswa
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900">{cls.name}</h4>
                  <p className="text-xs text-slate-500">{cls.track || 'Kurikulum Merdeka'}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Wali Kelas:</span>
                    <strong className="text-slate-900">{cls.homeroomTeacherName}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Jadwal Tatap Muka:</span>
                    <strong className="text-blue-900 font-mono">{clsSchedules.length} Sesi/Minggu</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Schedule Filter & List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Jadwal Tatap Muka Mingguan Guru
            </h3>
            <p className="text-xs text-slate-500">
              Pemetaan hari, jam sesi, ruangan, dan kelas.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedDay('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                selectedDay === 'all'
                  ? 'bg-blue-900 text-white font-semibold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Semua Hari
            </button>
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  selectedDay === day
                    ? 'bg-blue-900 text-white font-semibold'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Hari & Jam Sesi</th>
                <th className="py-3 px-4">Rombel Kelas</th>
                <th className="py-3 px-4">Mata Pelajaran</th>
                <th className="py-3 px-4">Ruang Kelas / Lab</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    Tidak ada jadwal mengajar pada hari yang dipilih.
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
                      <span className="font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded text-[11px] border border-blue-200">
                        {sch.className}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {sch.subjectName}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sch.room}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Aktif Terjadwal
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
