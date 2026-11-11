import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Calendar,
  Clock,
  MapPin,
  GraduationCap,
  CalendarDays,
  Bookmark,
  ChevronRight
} from 'lucide-react';

export const StudentScheduleView: React.FC = () => {
  const { currentUser, schedules, calendarEvents } = useDatabase();
  const [activeTab, setActiveTab] = useState<'schedule' | 'calendar'>('schedule');

  const myClassId = currentUser.classId;
  const mySchedules = schedules.filter((s) => s.classId === myClassId);

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const;
  const [selectedDay, setSelectedDay] = useState<string>('Senin');

  const schedulesForDay = mySchedules.filter((s) => s.day === selectedDay);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Ujian':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Kegiatan':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Libur':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'KBM':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Jadwal Pelajaran & Kalender Akademik</h2>
          <p className="text-xs text-slate-500 mt-1">
            Jadwal mingguan kelas {currentUser.className || 'Anda'} serta agenda resmi kegiatan sekolah semester berjalan.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'schedule'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Jadwal Mingguan</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Kalender Akademik</span>
          </button>
        </div>
      </div>

      {/* VIEW: JADWAL MINGGUAN */}
      {activeTab === 'schedule' && (
        <div className="space-y-5">
          {/* Day selection tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {days.map((day) => {
              const count = mySchedules.filter((s) => s.day === day).length;
              const isSelected = selectedDay === day;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <span>{day}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isSelected ? 'bg-blue-800 text-blue-100' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count} Mapel
                  </span>
                </button>
              );
            })}
          </div>

          {/* Schedule list for selected day */}
          <div className="space-y-3">
            {schedulesForDay.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-500">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">Tidak ada jadwal KBM pada hari {selectedDay}.</p>
                <p className="text-slate-400 mt-1">Kegiatan kokurikuler, ekstrakurikuler, atau istirahat mandiri.</p>
              </div>
            ) : (
              schedulesForDay.map((sch, index) => (
                <div
                  key={sch.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex flex-col items-center justify-center shrink-0 text-blue-900 font-bold">
                      <span className="text-[10px] uppercase font-mono">Ke</span>
                      <span className="text-base leading-none">{index + 1}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500 font-mono">
                          {sch.startTime} - {sch.endTime} WIB
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {sch.room}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">
                        {sch.subjectName}
                      </h3>

                      <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-0.5">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        <span>Guru Pengampu: <strong>{sch.teacherName}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-xs text-slate-500 shrink-0">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                      Rombel {sch.className}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW: KALENDER AKADEMIK */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {calendarEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor(
                      event.category
                    )}`}
                  >
                    {event.category}
                  </span>

                  <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{event.startDate} s.d. {event.endDate}</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {event.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {event.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
