import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Material, Subject } from '../../types';
import {
  BookOpen,
  FileText,
  Video,
  Download,
  ExternalLink,
  Eye,
  X,
  Search,
  Filter,
  GraduationCap,
  Clock,
  Award,
  Layers,
  CheckCircle2,
  BookmarkCheck,
  Sparkles
} from 'lucide-react';

export const StudentMaterialsView: React.FC = () => {
  const { currentUser, materials, subjects, schedules, users, incrementMaterialDownload } = useDatabase();

  const [activeTab, setActiveTab] = useState<'subjects' | 'materials'>('subjects');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);

  const myClassId = currentUser.classId;
  const isKelas10 = currentUser.className?.includes('X-') || currentUser.className?.startsWith('X');
  const myPhase = isKelas10 ? 'Fase E' : 'Fase F';

  // Filter subjects applicable to student
  const mySubjects = subjects.filter((s) => {
    if (isKelas10) {
      // Kelas X gets standard compulsory subjects + Muatan Lokal
      return s.category === 'Wajib Umum' || s.group === 'Mata Pelajaran Wajib' || s.category === 'Muatan Lokal';
    } else {
      // Kelas XI & XII get general subjects + pilihan + Muatan Lokal
      return true;
    }
  });

  // Materials uploaded for my class
  const myMaterials = materials.filter((m) => m.classId === myClassId);

  const filteredMaterials = myMaterials.filter((m) => {
    const matchSubject = selectedSubjectFilter === 'all' || m.subjectId === selectedSubjectFilter;
    const matchSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subjectName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubject && matchSearch;
  });

  const filteredSubjectList = mySubjects.filter((s) => {
    return (
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.group && s.group.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-600" />;
      case 'video':
        return <Video className="w-5 h-5 text-indigo-600" />;
      default:
        return <BookOpen className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-900 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Mapel & Materi Belajar Siswa</h2>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kurikulum Merdeka Mandiri (Permendikbudristek No. 12 Tahun 2024)</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Daftar lengkap mata pelajaran dan modul ajar resmi rombel <strong>{currentUser.className || 'Kelas XI'}</strong> ({myPhase}).
          </p>
        </div>

        {/* Tab Toggle: Mapel vs Modul */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium self-end md:self-auto shrink-0">
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-3.5 py-1.5 rounded-md cursor-pointer transition-colors ${
              activeTab === 'subjects'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Mata Pelajaran ({mySubjects.length})
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-3.5 py-1.5 rounded-md cursor-pointer transition-colors ${
              activeTab === 'materials'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Modul & Bahan Belajar ({myMaterials.length})
          </button>
        </div>
      </div>

      {/* TAB 1: DAFTAR MATA PELAJARAN NASIONAL */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama atau kode mapel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 bg-slate-50"
              />
            </div>
            <div className="text-xs text-slate-500">
              Mata Pelajaran Aktif: <strong>{filteredSubjectList.length}</strong> Mapel
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubjectList.map((sub) => {
              // Find teachers teaching this subject
              const teachersForSubject = users.filter((u) => u.subjectsTaught?.includes(sub.id));
              const subjectMaterials = myMaterials.filter((m) => m.subjectId === sub.id);

              return (
                <div
                  key={sub.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono font-bold text-xs text-slate-900">
                        {sub.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          sub.category === 'Wajib Umum' || sub.group === 'Mata Pelajaran Wajib' || sub.category === 'Umum'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : sub.category === 'Pilihan Fase F'
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {sub.category === 'Wajib Umum' || sub.group === 'Mata Pelajaran Wajib' ? 'Mapel Wajib' : (sub.group || sub.category)}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm mt-3 leading-snug">
                      {sub.name}
                    </h3>

                    {sub.description && (
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {sub.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Beban Belajar:
                      </span>
                      <strong className="text-slate-900 font-mono">{sub.weeklyHours} JP/Minggu</strong>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        KKTP (Kriteria Tuntas):
                      </span>
                      <strong className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-mono">
                        {sub.minPassingGrade}
                      </strong>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                        {teachersForSubject.length > 0 ? (
                          <span>Guru: <strong>{teachersForSubject[0].name}</strong></span>
                        ) : (
                          <span className="italic text-slate-400">Guru pengampu</span>
                        )}
                      </div>

                      {subjectMaterials.length > 0 ? (
                        <button
                          onClick={() => {
                            setSelectedSubjectFilter(sub.id);
                            setActiveTab('materials');
                          }}
                          className="text-xs text-blue-900 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <span>{subjectMaterials.length} Modul &rarr;</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Belum ada modul</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MODUL & BAHAN BELAJAR */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari materi atau topik bahasan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 bg-slate-50"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter Mapel:</span>
              <select
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 font-medium cursor-pointer"
              >
                <option value="all">Semua Mata Pelajaran ({subjects.length})</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    [{s.code}] {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Materials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.length === 0 ? (
              <div className="col-span-full bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-500">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">Tidak ada materi yang sesuai kriteria pencarian.</p>
                <p className="text-slate-400 mt-1">Coba gunakan kata kunci lain atau pilih mata pelajaran yang berbeda.</p>
              </div>
            ) : (
              filteredMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                        {getFileTypeIcon(mat.fileType)}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {mat.subjectName}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mt-3 leading-snug">
                      {mat.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {mat.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        {mat.teacherName}
                      </span>
                      <span>{mat.uploadDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPreviewMaterial(mat)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Buka / Baca</span>
                      </button>

                      <button
                        onClick={() => incrementMaterialDownload(mat.id)}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg transition-colors cursor-pointer"
                        title="Unduh Berkas"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 animate-in fade-in duration-150">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                  {getFileTypeIcon(previewMaterial.fileType)}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {previewMaterial.subjectName}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {previewMaterial.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Oleh {previewMaterial.teacherName} · Diunggah pada {previewMaterial.uploadDate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewMaterial(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-slate-700 mb-1">Deskripsi & Capaian Pembelajaran</h4>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                  {previewMaterial.description}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Tautan Berkas Pembelajaran Digital</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Format: <span className="uppercase font-semibold">{previewMaterial.fileType}</span> · Siap diakses daring
                  </div>
                </div>

                <a
                  href={previewMaterial.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => incrementMaterialDownload(previewMaterial.id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Berkas</span>
                </a>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setPreviewMaterial(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer"
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
