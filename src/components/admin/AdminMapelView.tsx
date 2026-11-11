import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Subject, SubjectCategory, SubjectPhase, SubjectGroup } from '../../types';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit,
  X,
  Search,
  Filter,
  CheckCircle2,
  Award,
  Layers,
  Clock,
  Printer,
  Sparkles,
  Info,
  GraduationCap
} from 'lucide-react';

export const AdminMapelView: React.FC = () => {
  const { subjects, schedules, users, addSubject, updateSubject, deleteSubject } = useDatabase();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [form, setForm] = useState<{
    code: string;
    name: string;
    category: SubjectCategory;
    phase: SubjectPhase;
    group: SubjectGroup;
    weeklyHours: number;
    minPassingGrade: number;
    description: string;
  }>({
    code: '',
    name: '',
    category: 'Wajib Umum',
    phase: 'Semua Fase',
    group: 'Mata Pelajaran Wajib',
    weeklyHours: 3,
    minPassingGrade: 75,
    description: '',
  });

  const handleOpenAddModal = () => {
    setEditingSubject(null);
    setForm({
      code: `MP-${subjects.length + 101}`,
      name: '',
      category: 'Wajib Umum',
      phase: 'Semua Fase',
      group: 'Mata Pelajaran Wajib',
      weeklyHours: 3,
      minPassingGrade: 75,
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sub: Subject) => {
    setEditingSubject(sub);
    setForm({
      code: sub.code,
      name: sub.name,
      category: sub.category,
      phase: sub.phase || 'Semua Fase',
      group: sub.group || (sub.category === 'Pilihan Fase F' ? 'Pilihan Rumpun MIPA' : 'Mata Pelajaran Wajib'),
      weeklyHours: sub.weeklyHours,
      minPassingGrade: sub.minPassingGrade,
      description: sub.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      alert('Mohon isi kode dan nama mata pelajaran.');
      return;
    }

    if (editingSubject) {
      updateSubject(editingSubject.id, form);
    } else {
      addSubject(form);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Yakin ingin menghapus mata pelajaran "${name}"? Jadwal dan modul yang terhubung akan terpengaruh.`)) {
      deleteSubject(id);
    }
  };

  // Filtered list
  const filteredSubjects = subjects.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.group && s.group.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterMode === 'all') return true;
    if (filterMode === 'wajib' || filterMode === 'umum') return s.category === 'Wajib Umum' || s.group === 'Mata Pelajaran Wajib' || s.category === 'Umum' || s.group === 'Kelompok Umum';
    if (filterMode === 'pilihan-mipa') return s.group === 'Pilihan Rumpun MIPA';
    if (filterMode === 'pilihan-ips') return s.group === 'Pilihan Rumpun IPS';
    if (filterMode === 'pilihan-bahasa') return s.group === 'Pilihan Rumpun Bahasa & Budaya';
    if (filterMode === 'pilihan-vokasi') return s.group === 'Pilihan Rumpun Vokasi & Prakarya';
    if (filterMode === 'mulok') return s.category === 'Muatan Lokal' || s.group === 'Muatan Lokal';

    return true;
  });

  const totalJP = subjects.reduce((acc, curr) => acc + curr.weeklyHours, 0);
  const wajibCount = subjects.filter((s) => s.category === 'Wajib Umum' || s.group === 'Mata Pelajaran Wajib' || s.category === 'Umum' || s.group === 'Kelompok Umum').length;
  const pilihanCount = subjects.filter((s) => s.category === 'Pilihan Fase F').length;
  const mulokCount = subjects.filter((s) => s.category === 'Muatan Lokal').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Permendikbudristek 12/2024 Reference */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-900 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Kelola Mata Pelajaran Sekolah</h2>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Standar Kurikulum Merdeka Nasional (Permendikbudristek No. 12 Tahun 2024)</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Master Data Kurikulum SMA PGRI 4 Gandrungmangu: Mata Pelajaran Wajib Nasional, Kelompok Pilihan (Rumpun MIPA, IPS, Bahasa, Vokasi/PKWU), dan Muatan Lokal Daerah.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => window.print()}
            className="no-print inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Kurikulum</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mata Pelajaran</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Structure aligned with Permendikbudristek 12/2024 */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Mapel</span>
            <BookOpen className="w-4 h-4 text-blue-900" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{subjects.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Kurikulum Nasional Terpadu</p>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Mapel Wajib</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-2">{wajibCount} Mapel</div>
          <p className="text-[11px] text-slate-500 mt-0.5">PABP, PPKn, BIN, MAT, dll.</p>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Mapel Pilihan</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-700 mt-2">{pilihanCount} Mapel</div>
          <p className="text-[11px] text-slate-500 mt-0.5">MIPA, IPS, Bahasa, Vokasi</p>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Muatan Lokal</span>
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700 mt-2">{mulokCount} Mapel</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Bahasa Jawa Banyumasan</p>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Beban Jam (JP)</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-purple-700 mt-2">{totalJP} JP</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Total jam belajar mingguan</p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kode, nama, atau rumpun mata pelajaran..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 bg-slate-50"
            />
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5 self-end md:self-auto">
            <span>Menampilkan <strong>{filteredSubjects.length}</strong> dari {subjects.length} mata pelajaran</span>
          </div>
        </div>

        {/* Kurikulum Merdeka Phase/Rumpun Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter Mapel:
          </span>
          {[
            { id: 'all', label: `Semua Mapel (${subjects.length})` },
            { id: 'wajib', label: `Mapel Wajib (${wajibCount})` },
            { id: 'pilihan-mipa', label: 'Pilihan MIPA (4)' },
            { id: 'pilihan-ips', label: 'Pilihan IPS (4)' },
            { id: 'pilihan-bahasa', label: 'Pilihan Bahasa (3)' },
            { id: 'pilihan-vokasi', label: 'Pilihan Vokasi/PKWU (1)' },
            { id: 'mulok', label: 'Muatan Lokal (1)' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterMode(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                filterMode === cat.id
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subject Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Kode</th>
                <th className="py-3.5 px-4">Nama Mata Pelajaran</th>
                <th className="py-3.5 px-4">Fase & Rumpun</th>
                <th className="py-3.5 px-4 text-center">Beban (JP)</th>
                <th className="py-3.5 px-4 text-center">KKTP</th>
                <th className="py-3.5 px-4">Guru Pengampu Terdaftar</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ditemukan mata pelajaran yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((sub, idx) => {
                  // Teachers mapped
                  const assignedTeachers = users.filter((u) => u.subjectsTaught?.includes(sub.id));

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px]">
                          {sub.code}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{sub.name}</div>
                        {sub.description && (
                          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {sub.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              sub.category === 'Muatan Lokal'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : sub.category === 'Pilihan Fase F' || sub.group?.includes('Pilihan')
                                ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {sub.category === 'Muatan Lokal'
                              ? 'Muatan Lokal'
                              : sub.category === 'Pilihan Fase F'
                              ? 'Mapel Pilihan'
                              : 'Mapel Wajib'}
                          </span>
                          {sub.group && sub.group !== 'Mata Pelajaran Wajib' && sub.group !== 'Kelompok Umum' && (
                            <div className="text-[10px] text-slate-500 font-medium">
                              {sub.group}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900">
                        {sub.weeklyHours} JP
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-bold">
                          {sub.minPassingGrade}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {assignedTeachers.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {assignedTeachers.map((t) => (
                              <span
                                key={t.id}
                                className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] border border-slate-200 font-medium"
                              >
                                {t.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Belum dipetakan guru</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(sub)}
                            className="p-1.5 text-slate-500 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            title="Edit Mata Pelajaran"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(sub.id, sub.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Hapus Mata Pelajaran"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-900" />
                <h3 className="font-bold text-slate-900 text-base">
                  {editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
                </h3>
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
                  <label className="block font-semibold text-slate-700 mb-1">Kode Mapel *</label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="Contoh: BIO-F / IPA-E"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Utama *</label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value as SubjectCategory,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 bg-white"
                  >
                    <option value="Wajib Umum">Wajib Umum</option>
                    <option value="Pilihan Fase F">Pilihan Fase F</option>
                    <option value="Muatan Lokal">Muatan Lokal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Mata Pelajaran *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: IPA Terintegrasi / Biologi"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenjang / Fase *</label>
                  <select
                    value={form.phase}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phase: e.target.value as SubjectPhase,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 bg-white"
                  >
                    <option value="Fase E (Kelas X)">Fase E (Kelas X)</option>
                    <option value="Fase F (Kelas XI & XII)">Fase F (Kelas XI & XII)</option>
                    <option value="Semua Fase">Semua Fase</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rumpun Kurikulum *</label>
                  <select
                    value={form.group}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        group: e.target.value as SubjectGroup,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 bg-white"
                  >
                    <option value="Mata Pelajaran Wajib">Mata Pelajaran Wajib</option>
                    <option value="Pilihan Rumpun MIPA">Pilihan Rumpun MIPA</option>
                    <option value="Pilihan Rumpun IPS">Pilihan Rumpun IPS</option>
                    <option value="Pilihan Rumpun Bahasa & Budaya">Pilihan Rumpun Bahasa & Budaya</option>
                    <option value="Pilihan Rumpun Vokasi & Prakarya">Pilihan Rumpun Vokasi & Prakarya</option>
                    <option value="Muatan Lokal">Muatan Lokal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Beban Jam Pelajaran (JP/Minggu) *</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    required
                    value={form.weeklyHours}
                    onChange={(e) => setForm({ ...form, weeklyHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kriteria Ketuntasan (KKTP) *</label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    required
                    value={form.minPassingGrade}
                    onChange={(e) => setForm({ ...form, minPassingGrade: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Capaian Pembelajaran</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ringkasan capaian pembelajaran dan lingkup materi..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900/20"
                />
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
                  {editingSubject ? 'Simpan Perubahan' : 'Tambah Mata Pelajaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
