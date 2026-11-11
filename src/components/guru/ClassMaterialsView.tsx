import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Material } from '../../types';
import {
  BookOpen,
  Plus,
  FileText,
  Video,
  Link,
  Download,
  Trash2,
  Eye,
  X,
  FileCheck,
  Calendar,
  ExternalLink,
  Layers
} from 'lucide-react';

export const ClassMaterialsView: React.FC = () => {
  const {
    currentUser,
    materials,
    classes,
    subjects,
    schedules,
    addMaterial,
    deleteMaterial,
    incrementMaterialDownload,
  } = useDatabase();

  // Find classes & subjects taught by this teacher
  const mySchedules = schedules.filter((s) => s.teacherId === currentUser.id);
  const myClassIds = Array.from(new Set(mySchedules.map((s) => s.classId)));
  const myClasses = classes.filter((c) => myClassIds.includes(c.id));
  const mySubjectIds = Array.from(
    new Set([...mySchedules.map((s) => s.subjectId), ...(currentUser.subjectsTaught || [])])
  );
  const mySubjects = subjects.filter((s) => mySubjectIds.includes(s.id));

  // If teacher has no schedules yet, fallback to all classes/subjects
  const availableClasses = myClasses.length > 0 ? myClasses : classes;
  const availableSubjects = mySubjects.length > 0 ? mySubjects : subjects;

  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);

  const [form, setForm] = useState<{
    title: string;
    description: string;
    subjectId: string;
    classId: string;
    fileType: 'pdf' | 'video' | 'link' | 'doc' | 'text';
    fileName: string;
    externalLink: string;
    contentText: string;
  }>({
    title: '',
    description: '',
    subjectId: availableSubjects[0]?.id || '',
    classId: availableClasses[0]?.id || '',
    fileType: 'pdf',
    fileName: '',
    externalLink: '',
    contentText: '',
  });

  // Filter materials uploaded by this teacher (or for all if filter selected)
  const teacherMaterials = materials.filter((m) => {
    const isTeacher = m.teacherId === currentUser.id;
    const matchClass = selectedClassFilter === 'all' || m.classId === selectedClassFilter;
    return isTeacher && matchClass;
  });

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClass = classes.find((c) => c.id === form.classId);
    const targetSubject = subjects.find((s) => s.id === form.subjectId);

    if (!targetClass || !targetSubject || !form.title) return;

    addMaterial({
      title: form.title,
      description: form.description,
      subjectId: form.subjectId,
      subjectName: targetSubject.name,
      classId: form.classId,
      className: targetClass.name,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      fileType: form.fileType,
      fileName: form.fileName || (form.fileType === 'pdf' ? `${form.title.replace(/\s+/g, '_')}.pdf` : undefined),
      externalLink: form.externalLink || undefined,
      contentText: form.contentText || undefined,
    });

    setIsAddModalOpen(false);
    setForm({
      title: '',
      description: '',
      subjectId: availableSubjects[0]?.id || '',
      classId: availableClasses[0]?.id || '',
      fileType: 'pdf',
      fileName: '',
      externalLink: '',
      contentText: '',
    });
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-600" />;
      case 'video':
        return <Video className="w-5 h-5 text-indigo-600" />;
      case 'doc':
        return <FileCheck className="w-5 h-5 text-blue-600" />;
      case 'link':
        return <ExternalLink className="w-5 h-5 text-emerald-600" />;
      default:
        return <BookOpen className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manajemen Kelas & Bahan Ajar</h2>
          <p className="text-xs text-slate-500 mt-1">
            Unggah modul ajar, materi digital, video pembelajaran interaktif, dan lembar kerja untuk kelas yang Anda ampu.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Materi Baru</span>
        </button>
      </div>

      {/* Class Selector Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <Layers className="w-4 h-4 text-blue-900" />
          <span>Filter Rombel:</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedClassFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedClassFilter === 'all'
                ? 'bg-blue-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Semua Kelas Ampuan
          </button>
          {availableClasses.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedClassFilter(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedClassFilter === c.id
                  ? 'bg-blue-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teacherMaterials.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-500">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">Belum ada materi pembelajaran yang diunggah.</p>
            <p className="text-slate-400 mt-1">
              Klik tombol &ldquo;Upload Materi Baru&rdquo; di atas untuk membagikan modul ke siswa.
            </p>
          </div>
        ) : (
          teacherMaterials.map((mat) => (
            <div
              key={mat.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                      {getFileTypeIcon(mat.fileType)}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {mat.className}
                      </span>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {mat.subjectName}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus materi "${mat.title}"?`)) {
                        deleteMaterial(mat.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                    title="Hapus Materi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-3 leading-snug">
                  {mat.title}
                </h3>

                <p className="text-xs text-slate-600 mt-1.5 line-clamp-3 leading-relaxed">
                  {mat.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  {mat.uploadDate} · Diunduh {mat.downloadCount}x
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPreviewMaterial(mat)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Pratinjau</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Material Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Upload Materi Pembelajaran Baru</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rombel Sasaran</label>
                  <select
                    value={form.classId}
                    onChange={(e) => setForm({ ...form, classId: e.target.value })}
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
                    value={form.subjectId}
                    onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {availableSubjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Materi / Bab</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Modul Bab 4: Fluida Dinamis & Hukum Bernoulli"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi & Instruksi Siswa</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan ringkasan isi materi dan apa yang harus dipelajari siswa..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipe Media Bahan Ajar</label>
                  <select
                    value={form.fileType}
                    onChange={(e) => setForm({ ...form, fileType: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="pdf">Modul Dokumen PDF</option>
                    <option value="video">Video Pembelajaran (YouTube / Stream)</option>
                    <option value="doc">Dokumen Word / Presentasi PPT</option>
                    <option value="link">Tautan Eksternal / Google Drive</option>
                    <option value="text">Artikel / Teks Ringkasan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {form.fileType === 'video' || form.fileType === 'link'
                      ? 'URL Video / Link Drive'
                      : 'Nama File Dokumen'}
                  </label>
                  {form.fileType === 'video' || form.fileType === 'link' ? (
                    <input
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={form.externalLink}
                      onChange={(e) => setForm({ ...form, externalLink: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder="Contoh: Modul_Fluida_Lengkap.pdf"
                      value={form.fileName}
                      onChange={(e) => setForm({ ...form, fileName: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Konten Ringkasan / Isi Materi Tertulis (Opsional)
                </label>
                <textarea
                  rows={4}
                  placeholder="Ketikkan ringkasan rumus, poin penting, atau konsep kunci yang langsung dibaca siswa..."
                  value={form.contentText}
                  onChange={(e) => setForm({ ...form, contentText: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-lg"
                >
                  Publikasikan Materi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                  {previewMaterial.className} · {previewMaterial.subjectName}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {previewMaterial.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewMaterial(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="font-semibold text-slate-700">Deskripsi Modul:</div>
                <p className="text-slate-600 leading-relaxed">
                  {previewMaterial.description}
                </p>
                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span>Guru: {previewMaterial.teacherName}</span>
                  <span>Diunggah: {previewMaterial.uploadDate}</span>
                </div>
              </div>

              {previewMaterial.contentText && (
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-900" />
                    <span>Catatan & Ringkasan Konsep Kunci:</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
                    {previewMaterial.contentText}
                  </p>
                </div>
              )}

              {previewMaterial.fileType === 'video' && (
                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold">
                    <Video className="w-5 h-5 text-indigo-700" />
                    <span>Tautan Video Pembelajaran Interaktif:</span>
                  </div>
                  <div className="text-slate-600 font-mono text-[11px] truncate bg-white p-2 rounded border border-indigo-100">
                    {previewMaterial.externalLink || 'https://youtube.com/watch?v=learning_material'}
                  </div>
                  <a
                    href={previewMaterial.externalLink || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <span>Buka Video di Tab Baru</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {previewMaterial.fileName && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-rose-600" />
                    <div>
                      <div className="font-semibold text-slate-900">{previewMaterial.fileName}</div>
                      <div className="text-[11px] text-slate-500">Berkas Bahan Ajar Resmi SMA PGRI 4</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      incrementMaterialDownload(previewMaterial.id);
                      alert(`Mengunduh file ${previewMaterial.fileName}...`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-medium cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Dokumen</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end p-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setPreviewMaterial(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
