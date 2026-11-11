import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { User, UserRole } from '../../types';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  KeyRound,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  UploadCloud
} from 'lucide-react';

export const UserManagementView: React.FC = () => {
  const {
    users,
    classes,
    subjects,
    addUser,
    updateUser,
    deleteUser,
    bulkImportUsers,
    resetUserPassword,
  } = useDatabase();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [resetSuccessId, setResetSuccessId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    identityNumber: string;
    role: UserRole;
    phone: string;
    address: string;
    gender: 'L' | 'P';
    classId: string;
    subjectsTaught: string[];
  }>({
    name: '',
    email: '',
    identityNumber: '',
    role: 'siswa',
    phone: '',
    address: '',
    gender: 'L',
    classId: classes[0]?.id || '',
    subjectsTaught: [],
  });

  // Bulk import state
  const [bulkInputText, setBulkInputText] = useState('');
  const [bulkResult, setBulkResult] = useState<{ successCount: number; errors: string[] } | null>(null);

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.identityNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchClass = classFilter === 'all' || u.classId === classFilter;

    return matchSearch && matchRole && matchClass;
  });

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      identityNumber: '',
      role: 'siswa',
      phone: '',
      address: '',
      gender: 'L',
      classId: classes[0]?.id || '',
      subjectsTaught: [],
    });
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      identityNumber: user.identityNumber,
      role: user.role,
      phone: user.phone || '',
      address: user.address || '',
      gender: user.gender,
      classId: user.classId || classes[0]?.id || '',
      subjectsTaught: user.subjectsTaught || [],
    });
    setIsAddEditModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.identityNumber) {
      alert('Mohon lengkapi Nama, Email, dan Nomor Identitas (NISN/NIP).');
      return;
    }

    const selectedClass = classes.find((c) => c.id === formData.classId);

    if (editingUser) {
      updateUser(editingUser.id, {
        name: formData.name,
        email: formData.email,
        identityNumber: formData.identityNumber,
        role: formData.role,
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
        classId: formData.role === 'siswa' ? formData.classId : undefined,
        className: formData.role === 'siswa' ? selectedClass?.name : undefined,
        subjectsTaught: formData.role === 'guru' ? formData.subjectsTaught : undefined,
      });
    } else {
      addUser({
        name: formData.name,
        email: formData.email,
        identityNumber: formData.identityNumber,
        role: formData.role,
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
        classId: formData.role === 'siswa' ? formData.classId : undefined,
        className: formData.role === 'siswa' ? selectedClass?.name : undefined,
        subjectsTaught: formData.role === 'guru' ? formData.subjectsTaught : undefined,
        isActive: true,
      });
    }

    setIsAddEditModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Nama Lengkap', 'Role', 'NIP/NISN', 'Email', 'Kelas', 'No. HP', 'Alamat'];
    const rows = filteredUsers.map((u) => [
      u.id,
      `"${u.name}"`,
      u.role.toUpperCase(),
      `'${u.identityNumber}`,
      u.email,
      u.className || '-',
      u.phone || '-',
      `"${u.address || '-'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Data_Pengguna_SMA_PGRI_4_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleProcessBulkImport = () => {
    if (!bulkInputText.trim()) return;

    // Parse CSV lines
    // Expected format: Nama,Email,Role(siswa/guru/admin),NISN_or_NIP,JenisKelamin(L/P),NamaKelas(opsional),NoHP
    const lines = bulkInputText.trim().split('\n');
    const parsedList: Omit<User, 'id'>[] = [];

    lines.forEach((line) => {
      // Ignore comments or header if contains 'Nama'
      if (line.toLowerCase().startsWith('nama') || line.startsWith('#')) return;

      const cols = line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length >= 4) {
        const [name, email, roleRaw, identityNumber, genderRaw, targetClassName, phone] = cols;
        const role = (['admin', 'guru', 'siswa'].includes(roleRaw?.toLowerCase())
          ? roleRaw.toLowerCase()
          : 'siswa') as UserRole;
        const gender = genderRaw?.toUpperCase() === 'P' ? 'P' : 'L';

        const matchedClass = classes.find((c) => c.name.toLowerCase() === targetClassName?.toLowerCase());

        parsedList.push({
          name,
          email,
          role,
          identityNumber,
          gender,
          classId: role === 'siswa' ? matchedClass?.id || classes[0]?.id : undefined,
          className: role === 'siswa' ? matchedClass?.name || classes[0]?.name : undefined,
          phone: phone || '',
          isActive: true,
        });
      }
    });

    if (parsedList.length === 0) {
      setBulkResult({
        successCount: 0,
        errors: ['Format data tidak valid. Pastikan minimal berisi Nama, Email, Role, dan NISN/NIP dipisahkan koma.'],
      });
      return;
    }

    const result = bulkImportUsers(parsedList);
    setBulkResult(result);
    if (result.successCount > 0) {
      setBulkInputText('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manajemen Pengguna Terpadu</h2>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan data master akun Siswa, Guru, dan Administrator dengan sinkronisasi ke modul akademik.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-900 hover:bg-blue-850 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Pengguna</span>
          </button>

          <button
            onClick={() => {
              setBulkResult(null);
              setIsBulkModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Import CSV / Excel</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-300"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, NISN, NIP, atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Role Filter Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium w-full sm:w-auto">
            {['all', 'siswa', 'guru', 'admin'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-md capitalize transition-colors cursor-pointer ${
                  roleFilter === role
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {role === 'all' ? 'Semua Role' : role}
              </button>
            ))}
          </div>

          {/* Class Filter if Siswa */}
          {(roleFilter === 'all' || roleFilter === 'siswa') && (
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Semua Kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Table of Users */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Nama Lengkap & Email</th>
                <th className="py-3 px-4">Peran (Role)</th>
                <th className="py-3 px-4">NIP / NISN</th>
                <th className="py-3 px-4">Kelas / Mata Pelajaran</th>
                <th className="py-3 px-4">Kontak & Alamat</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Tidak ditemukan pengguna yang sesuai kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isReset = resetSuccessId === user.id;

                  const getRoleStyle = (role: UserRole) => {
                    switch (role) {
                      case 'admin':
                        return 'text-amber-800 bg-amber-50 border-amber-200';
                      case 'guru':
                        return 'text-blue-800 bg-blue-50 border-blue-200';
                      case 'siswa':
                        return 'text-emerald-800 bg-emerald-50 border-emerald-200';
                    }
                  };

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{user.name}</div>
                        <div className="text-[11px] text-slate-500">{user.email}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getRoleStyle(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {user.identityNumber}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {user.role === 'siswa' && (user.className || 'Belum diplot')}
                        {user.role === 'guru' &&
                          (user.subjectsTaught && user.subjectsTaught.length > 0
                            ? subjects
                                .filter((s) => user.subjectsTaught?.includes(s.id))
                                .map((s) => s.name)
                                .join(', ')
                            : 'Pengajar Umum')}
                        {user.role === 'admin' && 'Staf Administrasi & Kepala Sekolah'}
                      </td>

                      <td className="py-3 px-4 text-slate-500">
                        <div>{user.phone || '-'}</div>
                        <div className="text-[10px] truncate max-w-[150px]">{user.address || '-'}</div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                          Aktif
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reset Password Button */}
                          <button
                            onClick={() => {
                              resetUserPassword(user.id);
                              setResetSuccessId(user.id);
                              setTimeout(() => setResetSuccessId(null), 2500);
                            }}
                            title="Reset Kata Sandi"
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors cursor-pointer"
                          >
                            {isReset ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <KeyRound className="w-4 h-4" />
                            )}
                          </button>

                          {/* Edit User Button */}
                          <button
                            onClick={() => openEditModal(user)}
                            title="Edit Data"
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete User Button */}
                          {user.id !== 'usr-admin-1' && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Hapus pengguna ${user.name} (${user.role.toUpperCase()})?`)) {
                                  deleteUser(user.id);
                                }
                              }}
                              title="Hapus Pengguna"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
          <span>Menampilkan {filteredUsers.length} dari total {users.length} pengguna</span>
          <span>SMA PGRI 4 Gandrungmangu Database</span>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {editingUser ? 'Perbarui Data Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Peran Akun (Role)</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="siswa">Peserta Didik (Siswa)</option>
                    <option value="guru">Guru Pengampu</option>
                    <option value="admin">Administrator Sekolah</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {formData.role === 'siswa' ? 'NISN' : formData.role === 'guru' ? 'NIP / ID Guru' : 'ID Admin'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 0072819401"
                    value={formData.identityNumber}
                    onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Siti Rahmawati, S.Pd."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Alamat Email</label>
                  <input
                    type="email"
                    required
                    placeholder="nama@smapgri4gandrungmangu.sch.id"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp / HP</label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="L">Laki-Laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                {formData.role === 'siswa' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Rombel / Kelas</label>
                    <select
                      value={formData.classId}
                      onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.phase})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {formData.role === 'guru' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mata Pelajaran yang Diampu
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
                    {subjects.map((s) => {
                      const isChecked = formData.subjectsTaught.includes(s.id);
                      return (
                        <label key={s.id} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  subjectsTaught: [...formData.subjectsTaught, s.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  subjectsTaught: formData.subjectsTaught.filter((id) => id !== s.id),
                                });
                              }
                            }}
                            className="rounded text-blue-600"
                          />
                          <span className="text-[11px] text-slate-700 truncate">{s.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Tempat Tinggal</label>
                <input
                  type="text"
                  placeholder="Ds. Gandrungmanis RT 02/RW 03, Gandrungmangu"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-lg transition-colors cursor-pointer"
                >
                  {editingUser ? 'Simpan Perubahan' : 'Tambahkan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Import Data Pengguna Massal (CSV / Excel)
                </h3>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-blue-700" />
                  Format Baris CSV:
                </div>
                <code className="block bg-white p-2 rounded text-[11px] font-mono text-slate-800 border border-blue-100 overflow-x-auto">
                  Nama,Email,Role(siswa/guru/admin),NISN_NIP,Gender(L/P),NamaKelas(opsional),NoHP
                </code>
                <p className="text-[11px] text-blue-700">
                  Contoh: <br />
                  <span className="font-mono">Rina Agustina,rina@siswa.sch.id,siswa,0079911223,P,XI Fase F-1,08571234567</span>
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tempelkan Baris Data CSV / Teks Spreadsheet:
                </label>
                <textarea
                  rows={8}
                  value={bulkInputText}
                  onChange={(e) => setBulkInputText(e.target.value)}
                  placeholder={`Rina Agustina,rina@siswa.sch.id,siswa,0079911223,P,XI Fase F-1,08571234567\nBudi Raharjo,budi@guru.sch.id,guru,198005122006041001,L,,08129876543`}
                  className="w-full p-3 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Sample Quick Insert Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[11px]">Gunakan Sampel Data:</span>
                <button
                  type="button"
                  onClick={() => {
                    setBulkInputText(
                      `Rina Agustina,rina.agustina@siswa.sch.id,siswa,0079911223,P,XI Fase F-1,08571234567\n` +
                      `Danu Pratama,danu.pratama@siswa.sch.id,siswa,0079911224,L,XI Fase F-1,08571234568\n` +
                      `Tri Hartati S.Pd,tri.hartati@guru.sch.id,guru,198302152009022004,P,,081399887766`
                    );
                  }}
                  className="text-[11px] text-blue-700 hover:underline cursor-pointer font-medium"
                >
                  Muat 3 Pengguna Contoh
                </button>
              </div>

              {/* Result display */}
              {bulkResult && (
                <div
                  className={`p-3 rounded-lg border text-xs ${
                    bulkResult.errors.length > 0
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <div className="font-bold">
                    Hasil Import: {bulkResult.successCount} pengguna berhasil ditambahkan.
                  </div>
                  {bulkResult.errors.length > 0 && (
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-amber-800">
                      {bulkResult.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleProcessBulkImport}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-lg transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Proses Import Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
