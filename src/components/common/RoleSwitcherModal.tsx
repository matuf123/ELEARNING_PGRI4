import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { ShieldCheck, GraduationCap, UserCheck, Check, X, RotateCcw } from 'lucide-react';
import { UserRole } from '../../types';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { users, currentUser, switchUserById, resetDatabase } = useDatabase();

  if (!isOpen) return null;

  const admins = users.filter((u) => u.role === 'admin');
  const teachers = users.filter((u) => u.role === 'guru');
  const students = users.filter((u) => u.role === 'siswa');

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="w-5 h-5 text-amber-600" />;
      case 'guru':
        return <GraduationCap className="w-5 h-5 text-blue-600" />;
      case 'siswa':
        return <UserCheck className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Administrator</span>;
      case 'guru':
        return <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Guru Pengampu</span>;
      case 'siswa':
        return <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Peserta Didik</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Ganti Akun & Simulasi Role</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih pengguna untuk menguji alur sinkronisasi relasional Admin, Guru, dan Siswa secara langsung.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Admin Group */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1. Pengelola Sistem (Admin)
              </span>
              <span className="text-xs text-slate-400">Hak Akses Penuh Sistem & Data Pokok</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {admins.map((u) => {
                const isSelected = currentUser.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUserById(u.id);
                      onClose();
                    }}
                    className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-500'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        {getRoleIcon(u.role)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{u.name}</div>
                        <div className="text-xs text-slate-500">
                          NIP: {u.identityNumber} · {u.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getRoleBadge(u.role)}
                      {isSelected && <Check className="w-5 h-5 text-amber-600" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Guru Group */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Pengajar & Pengelola Kelas (Guru)
              </span>
              <span className="text-xs text-slate-400">Upload Materi, Penilaian, Presensi</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {teachers.map((u) => {
                const isSelected = currentUser.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUserById(u.id);
                      onClose();
                    }}
                    className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        {getRoleIcon(u.role)}
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-slate-900 text-xs truncate">{u.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">NIP: {u.identityNumber}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Siswa Group */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                3. Peserta Didik (Siswa)
              </span>
              <span className="text-xs text-slate-400">Akses Belajar, Kumpul Tugas, Rapor Digital</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {students.map((u) => {
                const isSelected = currentUser.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUserById(u.id);
                      onClose();
                    }}
                    className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        {getRoleIcon(u.role)}
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-slate-900 text-xs truncate">{u.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">
                          NISN: {u.identityNumber} · {u.className}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50 text-xs">
          <button
            onClick={() => {
              if (window.confirm('Reset semua data kembali ke default awal simulasi SMA PGRI 4?')) {
                resetDatabase();
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-slate-500 hover:text-rose-600 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Database Awal</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
