import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Announcement } from '../../types';
import {
  Bell,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  X,
  Users,
  GraduationCap,
  Sparkles
} from 'lucide-react';

export const AnnouncementsManagement: React.FC = () => {
  const { announcements, addAnnouncement, deleteAnnouncement, currentUser } = useDatabase();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState<{
    title: string;
    content: string;
    targetRole: 'all' | 'guru' | 'siswa';
    priority: 'Normal' | 'Penting';
  }>({
    title: '',
    content: '',
    targetRole: 'all',
    priority: 'Normal',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) return;

    addAnnouncement({
      title: form.title,
      content: form.content,
      targetRole: form.targetRole,
      authorName: `${currentUser.name} (Admin)`,
      priority: form.priority,
    });

    setForm({
      title: '',
      content: '',
      targetRole: 'all',
      priority: 'Normal',
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pusat Informasi & Pengumuman Sekolah</h2>
          <p className="text-xs text-slate-500 mt-1">
            Siarkan maklumat resmi, agenda kegiatan, jadwal ujian, dan surat edaran ke akun Guru serta Siswa secara real-time.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Pengumuman Baru</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {announcements.map((ann) => {
          const isHighPriority = ann.priority === 'Penting';

          const getTargetBadge = (target: string) => {
            switch (target) {
              case 'all':
                return 'Semua Warga Sekolah';
              case 'guru':
                return 'Khusus Dewan Guru';
              case 'siswa':
                return 'Khusus Peserta Didik';
              default:
                return target;
            }
          };

          return (
            <div
              key={ann.id}
              className={`rounded-xl border p-5 transition-all bg-white shadow-xs ${
                isHighPriority ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isHighPriority ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {ann.priority}
                  </span>
                  <span className="text-[11px] text-blue-800 bg-blue-50 px-2 py-0.5 rounded font-medium border border-blue-200">
                    {getTargetBadge(ann.targetRole)}
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (window.confirm(`Hapus pengumuman "${ann.title}"?`)) {
                      deleteAnnouncement(ann.id);
                    }
                  }}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-2.5 leading-snug">
                {ann.title}
              </h3>

              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {ann.content}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Penerbit: {ann.authorName}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{ann.date}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Publikasi Pengumuman Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Pengumuman</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Jadwal Pembagian Rapor Semester Ganjil"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Sasaran</label>
                  <select
                    value={form.targetRole}
                    onChange={(e) => setForm({ ...form, targetRole: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs"
                  >
                    <option value="all">Semua Warga Sekolah</option>
                    <option value="guru">Hanya Dewan Guru</option>
                    <option value="siswa">Hanya Peserta Didik (Siswa)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tingkat Prioritas</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Penting">Penting / Darurat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Isi Pesan / Maklumat</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Tuliskan detail pengumuman secara rinci..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-lg"
                >
                  Siarkan Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
