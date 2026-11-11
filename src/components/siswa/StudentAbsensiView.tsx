import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  FileText,
  Upload,
  Check,
  ShieldCheck,
  X
} from 'lucide-react';

export const StudentAbsensiView: React.FC = () => {
  const { currentUser, attendances, getStudentAttendanceStats } = useDatabase();

  const stats = getStudentAttendanceStats(currentUser.id);

  // Student's session records
  const myAttendanceRecords = attendances
    .map((session) => {
      const rec = session.records.find((r) => r.studentId === currentUser.id);
      return {
        session,
        record: rec,
      };
    })
    .filter((item) => item.record !== undefined);

  // Excuse letter submission form state
  const [isPermitModalOpen, setIsPermitModalOpen] = useState(false);
  const [permitReason, setPermitReason] = useState<'Izin' | 'Sakit'>('Izin');
  const [permitDate, setPermitDate] = useState(new Date().toISOString().split('T')[0]);
  const [permitNotes, setPermitNotes] = useState('');
  const [permitSuccess, setPermitSuccess] = useState(false);

  const handleSubmitPermit = (e: React.FormEvent) => {
    e.preventDefault();
    setPermitSuccess(true);
    setTimeout(() => {
      setPermitSuccess(false);
      setIsPermitModalOpen(false);
      setPermitNotes('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-emerald-700" />
            <h2 className="text-xl font-bold text-slate-900">Absensi & Riwayat Kehadiran Siswa</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rekapitulasi presensi harian tatap muka pada setiap sesi mata pelajaran kelas {currentUser.className || 'Anda'}.
          </p>
        </div>

        <button
          onClick={() => setIsPermitModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Kirim Surat Izin / Sakit</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Tingkat Kehadiran
          </span>
          <div className="text-3xl font-extrabold text-emerald-700 mt-2 font-mono tabular-nums">
            {stats.percentage}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {stats.hadir} dari {stats.total} Pertemuan KBM
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Izin Sah
          </span>
          <div className="text-3xl font-extrabold text-blue-700 mt-2 font-mono tabular-nums">
            {stats.izin}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Keperluan keluarga / dinas
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Sakit
          </span>
          <div className="text-3xl font-extrabold text-amber-700 mt-2 font-mono tabular-nums">
            {stats.sakit}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Surat dokter terlampir
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Tanpa Keterangan (Alpa)
          </span>
          <div className="text-3xl font-extrabold text-rose-700 mt-2 font-mono tabular-nums">
            {stats.alpa}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Batas toleransi maksimal 3x
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Log Riwayat Presensi per Sesi Pelajaran
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {myAttendanceRecords.length} Sesi Terdata
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Tanggal & Waktu Sesi</th>
                <th className="py-3 px-4">Mata Pelajaran</th>
                <th className="py-3 px-4">Guru Pengampu</th>
                <th className="py-3 px-4">Topik Bahasan KBM</th>
                <th className="py-3 px-4 text-center">Status Kehadiran</th>
                <th className="py-3 px-4">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myAttendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Belum ada riwayat sesi presensi yang dimasukkan untuk akun Anda.
                  </td>
                </tr>
              ) : (
                myAttendanceRecords.map((item, index) => {
                  const status = item.record?.status;

                  let badgeColor = 'bg-slate-100 text-slate-700';
                  if (status === 'Hadir') badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                  if (status === 'Izin') badgeColor = 'bg-blue-50 text-blue-800 border-blue-200';
                  if (status === 'Sakit') badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
                  if (status === 'Alpa') badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';

                  return (
                    <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.session.date}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{item.session.sessionHour}</div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {item.session.subjectName}
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        {item.session.teacherName}
                      </td>

                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {item.session.topic || 'KBM Tatap Muka'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold border ${badgeColor}`}>
                          {status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-500 italic">
                        {item.record?.notes || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permit Submission Modal */}
      {isPermitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Kirim Pemberitahuan Izin / Sakit</h3>
              <button onClick={() => setIsPermitModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {permitSuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Pemberitahuan Berhasil Dikirim!</h4>
                <p className="text-xs text-slate-500">
                  Wali kelas dan guru pengampu hari ini telah menerima notifikasi permohonan izin Anda.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitPermit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Ketidakhadiran</label>
                  <select
                    value={permitReason}
                    onChange={(e) => setPermitReason(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Izin">Izin (Keperluan Keluarga / Dinas)</option>
                    <option value="Sakit">Sakit (Istirahat / Berobat)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Tidak Hadir</label>
                  <input
                    type="date"
                    required
                    value={permitDate}
                    onChange={(e) => setPermitDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Keterangan Alasan</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Tuliskan keterangan detail keperluan atau kondisi sakit..."
                    value={permitNotes}
                    onChange={(e) => setPermitNotes(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lampirkan Foto Surat Dokter / Bukti (Simulasi)
                  </label>
                  <div className="border border-dashed border-slate-300 rounded-lg p-4 text-center text-slate-500 space-y-1">
                    <FileText className="w-5 h-5 text-slate-400 mx-auto" />
                    <div className="font-medium text-slate-700">Surat_Dokter_{currentUser.name.slice(0, 5)}.jpg</div>
                    <div className="text-[10px] text-slate-400">Berkas terunggah otomatis</div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsPermitModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-lg"
                  >
                    Kirim Surat Izin
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
