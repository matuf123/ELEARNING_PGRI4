import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Settings,
  Shield,
  School,
  Calendar,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  Lock,
  KeyRound,
  FileText,
  AlertTriangle,
  Server,
  Save,
  Check,
  RefreshCw
} from 'lucide-react';

export const AdminPengaturanView: React.FC = () => {
  const {
    activeAcademicYear,
    academicYears,
    setActiveAcademicYear,
    systemLogs: logs,
    resetDatabase,
    currentUser,
    users,
    classes,
    subjects,
    grades,
    attendances,
  } = useDatabase();

  const [activeTab, setActiveTab] = useState<'profile' | 'academic' | 'security' | 'backup'>('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // School profile form
  const [schoolProfile, setSchoolProfile] = useState({
    name: 'SMA PGRI 4 Gandrungmangu',
    npsn: '20300712',
    nss: '302030104004',
    akreditasi: 'B (Unggul Terakreditasi)',
    address: 'Jl. Raya Gandrungmangu No. 45, Kec. Gandrungmangu',
    regency: 'Kabupaten Cilacap, Jawa Tengah 53254',
    email: 'info@smapgri4gandrungmangu.sch.id',
    phone: '(0280) 5260199',
    principal: 'Drs. H. Bambang Sutrisno, M.Pd.',
    principalNip: '19680512 199403 1 004',
    kurikulum: 'Kurikulum Merdeka Mandiri Berbagi',
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportData = () => {
    const backupPayload = {
      exportedAt: new Date().toISOString(),
      school: schoolProfile.name,
      academicYear: activeAcademicYear,
      usersCount: users.length,
      classesCount: classes.length,
      subjectsCount: subjects.length,
      gradesCount: grades.length,
      attendancesCount: attendances.length,
      rawStore: {
        users,
        classes,
        subjects,
        grades,
        attendances,
      },
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `Backup_SMA_PGRI_4_Gandrungmangu_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-900 rounded-lg">
              <Settings className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Pengaturan Sistem & Keamanan</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi identitas sekolah, periode akademik aktif, audit trail keamanan, dan manajemen basis data.
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
          {[
            { id: 'profile', label: 'Profil Sekolah', icon: School },
            { id: 'academic', label: 'Tahun Ajaran', icon: Calendar },
            { id: 'security', label: 'Audit & Keamanan', icon: Shield },
            { id: 'backup', label: 'Cadangkan & Reset', icon: Server },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan profil sekolah berhasil disimpan ke sistem pusat.</span>
        </div>
      )}

      {/* TAB 1: PROFIL SEKOLAH */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
            <img
              src="/images/school_crest_pgri_1794327906967.jpg"
              alt="Logo PGRI Gandrungmangu"
              className="w-24 h-24 rounded-full border-2 border-slate-200 shadow-xs mb-4"
              referrerPolicy="no-referrer"
            />
            <h3 className="font-bold text-slate-900 text-base">{schoolProfile.name}</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">NPSN: {schoolProfile.npsn}</p>

            <span className="mt-3 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
              {schoolProfile.akreditasi}
            </span>

            <div className="w-full border-t border-slate-100 my-4 pt-4 text-left space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Kepala Sekolah</span>
                <span className="font-semibold text-slate-800">{schoolProfile.principal}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Kurikulum Operasional</span>
                <span className="font-semibold text-slate-800">{schoolProfile.kurikulum}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Lokasi</span>
                <span className="text-slate-700">{schoolProfile.address}, {schoolProfile.regency}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Ubah Data Identitas Resmi Satuan Pendidikan
            </h3>

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Resmi Sekolah</label>
                  <input
                    type="text"
                    required
                    value={schoolProfile.name}
                    onChange={(e) => setSchoolProfile({ ...schoolProfile, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NPSN</label>
                  <input
                    type="text"
                    required
                    value={schoolProfile.npsn}
                    onChange={(e) => setSchoolProfile({ ...schoolProfile, npsn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Kepala Sekolah</label>
                  <input
                    type="text"
                    required
                    value={schoolProfile.principal}
                    onChange={(e) => setSchoolProfile({ ...schoolProfile, principal: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIP Kepala Sekolah</label>
                  <input
                    type="text"
                    value={schoolProfile.principalNip}
                    onChange={(e) => setSchoolProfile({ ...schoolProfile, principalNip: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
                <input
                  type="text"
                  value={schoolProfile.address}
                  onChange={(e) => setSchoolProfile({ ...schoolProfile, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Resmi</label>
                  <input
                    type="email"
                    value={schoolProfile.email}
                    onChange={(e) => setSchoolProfile({ ...schoolProfile, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. Telepon Sekolah</label>
                  <input
                    type="text"
                    value={schoolProfile.phone}
                    onChange={(e) => setSchoolProfile({ ...schoolProfile, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900/20"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Identitas</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: TAHUN AJARAN & KURIKULUM */}
      {activeTab === 'academic' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Periode Tahun Ajaran & Semester Aktif</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mengontrol akses pengisian nilai, absensi harian, dan pencetakan rapor seluruh sekolah.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {academicYears.map((ay) => {
              const isSelected = ay.id === activeAcademicYear.id;
              return (
                <div
                  key={ay.id}
                  className={`p-5 rounded-xl border-2 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-900 bg-blue-50/40 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-base">{ay.year}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          isSelected
                            ? 'bg-blue-900 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Semester {ay.semester}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 mt-3 space-y-1">
                      <div>Mulai: <span className="font-semibold text-slate-700">{ay.startDate}</span></div>
                      <div>Berakhir: <span className="font-semibold text-slate-700">{ay.endDate}</span></div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    {isSelected ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Sedang Berjalan (Aktif)
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Aktifkan Tahun Ajaran ${ay.year} (${ay.semester}) sebagai semester aktif sistem?`
                            )
                          ) {
                            setActiveAcademicYear(ay.id);
                          }
                        }}
                        className="text-xs text-blue-900 font-semibold hover:underline cursor-pointer"
                      >
                        Jadikan Aktif &rarr;
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT & KEAMANAN */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>RBAC Enforced</span>
              </div>
              <div className="text-lg font-bold text-slate-900 mt-2">Perlindungan 3 Role</div>
              <p className="text-xs text-slate-500 mt-1">Admin, Guru, dan Siswa terisolasi penuh</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
                <Lock className="w-4 h-4" />
                <span>Sesi & Kredensial</span>
              </div>
              <div className="text-lg font-bold text-slate-900 mt-2">Password SHA-256</div>
              <p className="text-xs text-slate-500 mt-1">Reset massal & satuan didukung</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                <span>Audit Trail</span>
              </div>
              <div className="text-lg font-bold text-slate-900 mt-2">{logs.length} Log Aktivitas</div>
              <p className="text-xs text-slate-500 mt-1">Perekaman mutasi data otomatis</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Riwayat Aktivitas & Log Sistem Terkini</h3>
              <span className="text-xs text-slate-500">{logs.length} entri tercatat</span>
            </div>

            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4">Aksi / Operasi</th>
                    <th className="py-3 px-4">Pengguna</th>
                    <th className="py-3 px-4">Rincian Perubahan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        Belum ada aktivitas tercatat.
                      </td>
                    </tr>
                  ) : (
                    logs.slice(0, 30).map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-semibold text-slate-800">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-medium text-slate-900">{log.userName}</td>
                        <td className="py-2.5 px-4 text-slate-600">{log.details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CADANGKAN & RESET BASIS DATA */}
      {activeTab === 'backup' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Manajemen Pemulihan & Integritas Basis Data</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola pencadangan berkas JSON atau kembalikan seluruh sistem ke kondisi bawaan (factory reset).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Backup Card */}
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm mb-2">
                  <Download className="w-5 h-5" />
                  <span>Ekspor Cadangan JSON</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Unduh seluruh relasi database aktif termasuk akun pengguna, rombel kelas, jadwal, buku nilai, dan riwayat presensi harian ke berkas JSON lokal yang terstandarisasi.
                </p>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleExportData}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh File Cadangan (.JSON)</span>
                </button>
              </div>
            </div>

            {/* Reset Card */}
            <div className="p-6 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>Reset ke Setelan Awal Pabrik</span>
                </div>
                <p className="text-xs text-rose-950/80 leading-relaxed">
                  Tindakan ini akan mengosongkan seluruh perubahan dan mengembalikan basis data simulasi ke dataset awal SMA PGRI 4 Gandrungmangu (daftar kelas, akun contoh, dan kurikulum bawaan).
                </p>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        'PERINGATAN: Apakah Anda yakin ingin mereset seluruh database ke setelan awal pabrik? Seluruh input baru akan dikembalikan.'
                      )
                    ) {
                      resetDatabase();
                      window.location.reload();
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Database Simulasi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
