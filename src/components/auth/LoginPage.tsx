import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  School,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Calendar,
  Layers,
  Phone,
  Mail,
  X
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, users, activeAcademicYear } = useDatabase();

  const [activeRoleTab, setActiveRoleTab] = useState<'siswa' | 'guru' | 'admin'>('siswa');
  const [identifier, setIdentifier] = useState('0072819401'); // default to Ahmad Fauzi
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Switch role tab and pre-fill realistic sample credentials
  const handleSelectRoleTab = (role: 'siswa' | 'guru' | 'admin') => {
    setActiveRoleTab(role);
    setErrorMessage(null);
    if (role === 'siswa') {
      const student = users.find((u) => u.role === 'siswa') || { identityNumber: '0072819401' };
      setIdentifier(student.identityNumber);
      setPassword('123456');
    } else if (role === 'guru') {
      const teacher = users.find((u) => u.role === 'guru') || { identityNumber: '198205142008012015' };
      setIdentifier(teacher.identityNumber);
      setPassword('123456');
    } else {
      const admin = users.find((u) => u.role === 'admin') || { identityNumber: '196804121994031002' };
      setIdentifier(admin.identityNumber);
      setPassword('123456');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = login(identifier, password);
      setIsLoading(false);
      if (!result.success) {
        setErrorMessage(result.error || 'Identitas atau kata sandi tidak valid.');
      }
    }, 350);
  };

  // Quick 1-Click Login for Demo
  const handleQuickLogin = (demoUserId: string) => {
    const user = users.find((u) => u.id === demoUserId);
    if (user) {
      setIdentifier(user.identityNumber);
      setPassword('123456');
      setActiveRoleTab(user.role);
      setIsLoading(true);
      setTimeout(() => {
        login(user.identityNumber, '123456');
        setIsLoading(false);
      }, 250);
    }
  };

  const sampleAdmin = users.find((u) => u.role === 'admin');
  const sampleGuru = users.find((u) => u.role === 'guru');
  const sampleSiswa = users.find((u) => u.role === 'siswa');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans selection:bg-amber-400 selection:text-slate-900">
      {/* Top Brand Bar */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-md py-3 px-4 sm:px-8 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <img
            src="/src/assets/images/school_crest_pgri_1794327906967.jpg"
            alt="Logo PGRI"
            className="w-8 h-8 rounded-full border border-amber-400/80 object-cover bg-white"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="font-extrabold text-white text-sm tracking-tight">
              SMA PGRI 4 GANDRUNGMANGU
            </div>
            <div className="text-[11px] text-amber-400 font-medium">
              Sistem Informasi Akademik & E-Learning Terpadu
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
          <span>NPSN: <strong>20300712</strong></span>
          <span>•</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Kurikulum Merdeka Mandiri
          </span>
          <span>•</span>
          <span>T.A. {activeAcademicYear.year} ({activeAcademicYear.semester})</span>
        </div>
      </header>

      {/* Main Split Body */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-4 sm:p-8 lg:p-12 max-w-7xl w-full mx-auto gap-8 lg:gap-12">
        {/* Left Section: Institutional Hero & Features */}
        <div className="flex-1 max-w-xl space-y-6 text-center lg:text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/60 border border-blue-700/50 text-blue-200 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Portal Pembelajaran Daring & E-Raport Resmi</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Selamat Datang di <span className="text-amber-400">SIAS E-Learning</span> SMA PGRI 4
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Platform terpadu untuk civitas akademika SMA PGRI 4 Gandrungmangu Kabupaten Cilacap. Mendukung KBM Kurikulum Merdeka, ujian CBT online, bank soal, transparansi buku nilai, dan e-raport digital.
          </p>

          {/* Highlights 4 Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-left">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-amber-400 font-bold text-sm flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>32 Mapel Nasional</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Sesuai Permendikbudristek No. 12 Tahun 2024 (Fase E & Fase F).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>E-Raport Otomatis</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Sinkronisasi buku nilai guru & capaian KKTP secara real-time.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-blue-400 font-bold text-sm flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>Ujian CBT Online</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Timer presisi, pencegahan kecurangan, dan koreksi instan.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-purple-400 font-bold text-sm flex items-center gap-1.5">
                <School className="w-4 h-4" />
                <span>Presensi Digital</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Rekap absensi harian, sakit, izin, dan persentase kehadiran.
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Form Login Card */}
        <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="text-center pb-4 border-b border-slate-100">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Masuk Akun Pengguna
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Pilih peran Anda dan masukkan kredensial yang telah terdaftar.
              </p>
            </div>

            {/* Role Tab Selector */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl my-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleSelectRoleTab('siswa')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg cursor-pointer transition-all ${
                  activeRoleTab === 'siswa'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Siswa</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRoleTab('guru')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg cursor-pointer transition-all ${
                  activeRoleTab === 'guru'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Guru</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRoleTab('admin')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg cursor-pointer transition-all ${
                  activeRoleTab === 'admin'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  {activeRoleTab === 'siswa'
                    ? 'NISN (Nomor Induk Siswa Nasional)'
                    : activeRoleTab === 'guru'
                    ? 'NIP / NUPTK Guru'
                    : 'ID Administrator / Email'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      activeRoleTab === 'siswa'
                        ? 'Contoh: 0072819401'
                        : activeRoleTab === 'guru'
                        ? 'Contoh: 198205142008012015'
                        : 'Contoh: 196804121994031002'
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700">
                    Kata Sandi (Password)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsHelpModalOpen(true)}
                    className="text-blue-900 hover:underline text-[11px] font-medium cursor-pointer"
                  >
                    Lupa Sandi?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi akun..."
                    className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Lihat password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-blue-900 focus:ring-blue-900 w-3.5 h-3.5"
                  />
                  <span>Ingat saya di perangkat ini</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-900 hover:bg-blue-800 active:scale-[0.99] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Memverifikasi Identitas...</span>
                ) : (
                  <>
                    <span>Masuk ke SIAS E-Learning</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Demo Acccount Switcher (Evaluator friendly) */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Akses Cepat Pengujian (1-Klik):</span>
              <Sparkles className="w-3 h-3 text-amber-500" />
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px]">
              {sampleAdmin && (
                <button
                  type="button"
                  onClick={() => handleQuickLogin(sampleAdmin.id)}
                  className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors cursor-pointer group"
                  title="Masuk sebagai Administrator Sekolah"
                >
                  <div className="font-bold text-slate-900 group-hover:text-blue-900 truncate">
                    Admin
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Drs. Mulyono
                  </div>
                </button>
              )}

              {sampleGuru && (
                <button
                  type="button"
                  onClick={() => handleQuickLogin(sampleGuru.id)}
                  className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors cursor-pointer group"
                  title="Masuk sebagai Guru Pengampu"
                >
                  <div className="font-bold text-slate-900 group-hover:text-blue-900 truncate">
                    Guru
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Siti R, S.Pd.
                  </div>
                </button>
              )}

              {sampleSiswa && (
                <button
                  type="button"
                  onClick={() => handleQuickLogin(sampleSiswa.id)}
                  className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors cursor-pointer group"
                  title="Masuk sebagai Siswa Aktif"
                >
                  <div className="font-bold text-slate-900 group-hover:text-blue-900 truncate">
                    Siswa
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Ahmad Fauzi
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-white/10 bg-slate-950/90 py-4 px-4 sm:px-8 text-center sm:text-left text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span>&copy; {new Date().getFullYear()} SMA PGRI 4 Gandrungmangu. Hak Cipta Dilindungi Undang-Undang.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Jl. Raya Gandrungmangu No. 45, Gandrungmangu, Cilacap</span>
            <span className="text-slate-600">|</span>
            <span>Telp: (0280) 5260199</span>
          </div>
        </div>
      </footer>

      {/* Lupa Kata Sandi Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white text-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-900" />
                <h3 className="font-bold text-slate-900 text-base">Bantuan Lupa Kata Sandi</h3>
              </div>
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Untuk alasan keamanan data akademik sekolah, pemulihan akun dilakukan secara terverifikasi melalui prosedur berikut:
              </p>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-blue-950">
                <div className="font-bold">1. Peserta Didik (Siswa):</div>
                <p className="text-[11px] text-blue-900">
                  Silakan hubungi <strong>Wali Kelas</strong> Anda atau Operator TU SMA PGRI 4 Gandrungmangu untuk mereset kata sandi awal menggunakan NISN Anda.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-slate-900">
                <div className="font-bold">2. Dewan Guru & Tenaga Pendidik:</div>
                <p className="text-[11px] text-slate-600">
                  Hubungi <strong>Administrator Kurikulum / IT Sekolah</strong> di Ruang Tata Usaha untuk penerbitan token sandi baru.
                </p>
              </div>

              <div className="pt-2 text-[11px] text-slate-500">
                Layanan bantuan teknis: <strong>info@smapgri4gandrungmangu.sch.id</strong> atau nomor telepon sekolah pada hari kerja Senin - Sabtu.
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-semibold text-xs cursor-pointer shadow-xs"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
