import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { EBook, EBookChapter } from '../../types';
import {
  Library,
  Search,
  BookOpen,
  Download,
  Eye,
  Plus,
  Trash2,
  X,
  FileText,
  Filter,
  CheckCircle2,
  Bookmark,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  BookMarked,
  Sparkles,
  Info
} from 'lucide-react';

export const PerpustakaanOnlineView: React.FC = () => {
  const {
    currentUser,
    ebooks,
    addEBook,
    deleteEBook,
    incrementEBookRead,
    incrementEBookDownload,
  } = useDatabase();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [readingBook, setReadingBook] = useState<EBook | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form for admin to add book
  const [newBookForm, setNewBookForm] = useState<{
    title: string;
    author: string;
    publisher: string;
    category: string;
    grade: 10 | 11 | 12 | 'Semua';
    fileSize: string;
    totalPages: number;
    description: string;
    onlineReaderUrl: string;
    chapterTitle: string;
    chapterExcerpt: string;
  }>({
    title: '',
    author: '',
    publisher: 'Kemendikbudristek RI',
    category: 'Buku Teks Kurikulum Merdeka',
    grade: 11,
    fileSize: '15.0 MB',
    totalPages: 250,
    description: '',
    onlineReaderUrl: 'https://buku.kemdikbud.go.id/katalog',
    chapterTitle: 'Bab 1: Konsep Pokok & Pengantar Materi',
    chapterExcerpt: '',
  });

  const categories = Array.from(new Set(ebooks.map((b) => b.category)));

  const filteredBooks = ebooks.filter((b) => {
    const matchSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'all' || b.category === selectedCategory;
    const matchGrade =
      selectedGrade === 'all' ||
      b.grade === 'Semua' ||
      String(b.grade) === selectedGrade;

    return matchSearch && matchCategory && matchGrade;
  });

  const handleOpenReader = (book: EBook, initialChapterIdx = 0) => {
    incrementEBookRead(book.id);
    setReadingBook(book);
    setActiveChapterIndex(initialChapterIdx);
  };

  const handleDownload = (book: EBook) => {
    incrementEBookDownload(book.id);
    if (book.downloadUrl) {
      window.open(book.downloadUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert(`Mengunduh file buku digital "${book.title}" (${book.fileSize})...`);
    }
  };

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookForm.title || !newBookForm.author) return;

    const sampleChapters: EBookChapter[] = newBookForm.chapterExcerpt
      ? [
          {
            id: `c-new-1`,
            chapterNumber: 1,
            title: newBookForm.chapterTitle || 'Bab 1: Pendahuluan & Konsep Utama',
            pageRange: 'Halaman 1 - 45',
            subtopics: ['Pengantar Materi', 'Konsep Dasar Teoretis', 'Asesmen Formatif'],
            excerpt: newBookForm.chapterExcerpt,
            summary: newBookForm.description,
            keyConcepts: ['Konsep Esensial', 'Aplikasi Praktis'],
          },
        ]
      : [
          {
            id: `c-new-1`,
            chapterNumber: 1,
            title: 'Bab 1: Eksplorasi Konsep & Teori Utama',
            pageRange: 'Halaman 1 - 40',
            subtopics: ['Latar Belakang', 'Prinsip Dasar', 'Model Analisis'],
            excerpt: newBookForm.description || 'Materi pembelajaran berbasis Kurikulum Merdeka.',
            summary: 'Pengantar materi buku teks.',
            keyConcepts: ['Konsep Dasar', 'Kompetensi Inti'],
          },
        ];

    addEBook({
      title: newBookForm.title,
      author: newBookForm.author,
      publisher: newBookForm.publisher,
      category: newBookForm.category,
      grade: newBookForm.grade,
      fileSize: newBookForm.fileSize,
      totalPages: newBookForm.totalPages,
      description: newBookForm.description,
      onlineReaderUrl: newBookForm.onlineReaderUrl,
      downloadUrl: newBookForm.onlineReaderUrl,
      chapters: sampleChapters,
      isAvailable: true,
    });

    setIsAddModalOpen(false);
    setNewBookForm({
      title: '',
      author: '',
      publisher: 'Kemendikbudristek RI',
      category: 'Buku Teks Kurikulum Merdeka',
      grade: 11,
      fileSize: '15.0 MB',
      totalPages: 250,
      description: '',
      onlineReaderUrl: 'https://buku.kemdikbud.go.id/katalog',
      chapterTitle: 'Bab 1: Konsep Pokok & Pengantar Materi',
      chapterExcerpt: '',
    });
  };

  const currentChapter = readingBook?.chapters?.[activeChapterIndex];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-900 rounded-xl border border-blue-200">
              <Library className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Perpustakaan Online & E-Book Interaktif</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                SMA PGRI 4 Gandrungmangu · Koleksi Buku Sekolah Elektronik (BSE) Kurikulum Merdeka Kemendikbudristek resmi dengan naskah bacaan asli dan tautan akses digital.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://buku.kemdikbud.go.id/katalog"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-900" />
            <span>Portal Buku Kemdikbud</span>
          </a>

          {currentUser.role === 'admin' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Buku Digital</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari judul buku, penulis, atau kata kunci..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 font-medium cursor-pointer"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 font-medium cursor-pointer"
          >
            <option value="all">Semua Tingkat</option>
            <option value="10">Kelas X (Fase E)</option>
            <option value="11">Kelas XI (Fase F)</option>
            <option value="12">Kelas XII (Fase F)</option>
          </select>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBooks.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-500">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">Tidak ada buku yang sesuai kriteria pencarian.</p>
          </div>
        ) : (
          filteredBooks.map((book) => {
            const hasChapters = Boolean(book.chapters && book.chapters.length > 0);
            return (
              <div
                key={book.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {book.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 font-mono">
                      Kelas {book.grade}
                    </span>
                  </div>

                  <div className="flex gap-3.5">
                    {/* Simulated Book Cover with authentic gradient */}
                    <div
                      className={`w-20 h-28 rounded-xl bg-gradient-to-br ${
                        book.coverColor || 'from-blue-900 to-indigo-950'
                      } text-white p-2.5 flex flex-col justify-between shrink-0 shadow-sm border border-slate-800/20 relative overflow-hidden`}
                    >
                      <div className="absolute top-0 right-0 w-8 h-8 bg-white/10 rounded-bl-full" />
                      <div className="text-[8px] font-bold text-amber-300 leading-tight uppercase tracking-tight">
                        SMA PGRI 4
                      </div>
                      <div className="my-auto text-center">
                        <BookMarked className="w-6 h-6 text-white/90 mx-auto drop-shadow-sm" />
                      </div>
                      <div className="text-[8px] text-white/80 font-mono text-center truncate">
                        {book.totalPages} Hlm
                      </div>
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-900 transition-colors">
                        {book.title}
                      </h3>
                      <div className="text-xs text-slate-600 truncate">
                        Penulis: <span className="font-medium text-slate-800">{book.author}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {book.publisher}
                      </div>
                      {hasChapters && (
                        <div className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200 mt-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Tersedia {book.chapters?.length} Bab Lengkap</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {book.description}
                  </p>

                  {/* Chapter Quick Preview Pills */}
                  {hasChapters && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Pratinjau Bab:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {book.chapters?.slice(0, 3).map((ch, idx) => (
                          <button
                            key={ch.id}
                            onClick={() => handleOpenReader(book, idx)}
                            className="text-[10px] bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-slate-200 hover:border-blue-300 rounded px-2 py-0.5 transition-colors cursor-pointer text-left truncate max-w-[170px]"
                            title={ch.title}
                          >
                            Bab {ch.chapterNumber}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {book.fileSize} · {book.readCount}x
                  </span>

                  <div className="flex items-center gap-1.5">
                    {book.onlineReaderUrl && (
                      <a
                        href={book.onlineReaderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-500 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Buka Halaman Buku Online Resmi (Kemendikbudristek)"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    <button
                      onClick={() => handleDownload(book)}
                      className="p-1.5 text-slate-500 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Unduh / Buka Katalog E-Book"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleOpenReader(book)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Baca Buku</span>
                    </button>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus buku "${book.title}"?`)) {
                            deleteEBook(book.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Hapus E-Book"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Online Book Reader Modal with authentic chapter reader */}
      {readingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col h-[92vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Top Modal Navigation Header */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <div
                  className={`w-9 h-12 rounded-md bg-gradient-to-br ${
                    readingBook.coverColor || 'from-blue-900 to-indigo-950'
                  } text-white flex items-center justify-center shrink-0 shadow-xs`}
                >
                  <BookMarked className="w-5 h-5 text-amber-300" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                      {readingBook.category} · Kelas {readingBook.grade}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                      {readingBook.totalPages} Halaman · {readingBook.fileSize}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                    {readingBook.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Font Size Toggle */}
                <button
                  onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
                  className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
                  title="Ubah Ukuran Huruf"
                >
                  Teks: {fontSize === 'normal' ? 'Standar' : 'Besar'}
                </button>

                {readingBook.onlineReaderUrl && (
                  <a
                    href={readingBook.onlineReaderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-300 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Buku Kemdikbud Asli</span>
                  </a>
                )}

                <button
                  onClick={() => setReadingBook(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer"
                  aria-label="Tutup Reader"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Reader Content Body (Split view: Chapter Selector on Left, Reading Content on Right) */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 bg-slate-50">
              {/* Left Sidebar: Chapters & Table of Contents */}
              <div className="md:col-span-4 border-r border-slate-200 bg-white p-4 overflow-y-auto space-y-4">
                <div>
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Daftar Bab & Materi</span>
                    <span className="text-[10px] text-blue-900 font-mono">
                      {readingBook.chapters?.length || 0} Bab
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {readingBook.chapters && readingBook.chapters.length > 0 ? (
                      readingBook.chapters.map((ch, idx) => {
                        const isActive = idx === activeChapterIndex;
                        return (
                          <button
                            key={ch.id}
                            onClick={() => setActiveChapterIndex(idx)}
                            className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                              isActive
                                ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                                : 'bg-slate-50 hover:bg-blue-50 text-slate-800 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider ${
                                  isActive ? 'text-amber-300' : 'text-blue-900'
                                }`}
                              >
                                Bab {ch.chapterNumber}
                              </span>
                              <span
                                className={`text-[10px] font-mono ${
                                  isActive ? 'text-blue-200' : 'text-slate-400'
                                }`}
                              >
                                {ch.pageRange}
                              </span>
                            </div>
                            <div className="font-semibold mt-1 leading-snug line-clamp-2">
                              {ch.title.replace(/^Bab \d+:\s*/, '')}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-3 bg-slate-50 rounded-lg text-slate-500 text-xs">
                        Bab interaktif segera ditambahkan. Silakan gunakan link Buku Kemdikbud di atas.
                      </div>
                    )}
                  </div>
                </div>

                {/* Bibliographical Meta */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 text-slate-600">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-900" />
                    <span>Metadata Buku Resmi:</span>
                  </div>
                  <div>Penulis: <strong className="text-slate-900">{readingBook.author}</strong></div>
                  <div>Penerbit: <strong className="text-slate-900">{readingBook.publisher}</strong></div>
                  <div>Kurikulum: <span className="font-semibold text-emerald-700">Kurikulum Merdeka Nasional</span></div>
                </div>
              </div>

              {/* Right Panel: Authentic Reading View */}
              <div className="md:col-span-8 p-6 sm:p-8 overflow-y-auto bg-white flex flex-col justify-between">
                {currentChapter ? (
                  <div className="space-y-6 max-w-2xl mx-auto w-full">
                    {/* Chapter Header */}
                    <div className="border-b border-slate-200 pb-4">
                      <div className="flex items-center justify-between text-xs text-blue-900 font-bold uppercase tracking-widest mb-1">
                        <span>Kurikulum Merdeka · SMA PGRI 4</span>
                        <span className="font-mono text-slate-500">{currentChapter.pageRange}</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        {currentChapter.title}
                      </h2>
                    </div>

                    {/* Subtopics Checklist */}
                    {currentChapter.subtopics && currentChapter.subtopics.length > 0 && (
                      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                        <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                          <Bookmark className="w-4 h-4 text-blue-900" />
                          <span>Sub-Capaian & Pokok Bahasan:</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {currentChapter.subtopics.map((sub, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-1.5 text-xs text-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-900 mt-1.5 shrink-0" />
                              <span>{sub}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Authentic Reading Excerpt / Book Content */}
                    <div className="space-y-4">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-900" />
                        <span>Naskah Bacaan Materi Resmi:</span>
                      </div>
                      <div
                        className={`p-6 bg-amber-50/40 rounded-2xl border border-amber-200/80 text-slate-800 leading-relaxed font-serif shadow-xs ${
                          fontSize === 'large' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
                        }`}
                      >
                        <p className="indent-6 text-justify">
                          {currentChapter.excerpt}
                        </p>
                      </div>
                    </div>

                    {/* Key Formulas / Key Concepts */}
                    {currentChapter.keyConcepts && currentChapter.keyConcepts.length > 0 && (
                      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                        <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-emerald-700" />
                          <span>Rumus Pokok & Konsep Kunci:</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-emerald-950 font-mono">
                          {currentChapter.keyConcepts.map((concept, cIdx) => (
                            <li key={cIdx} className="flex items-center gap-2 bg-white/80 p-2 rounded-lg border border-emerald-200">
                              <span className="w-2 h-2 rounded-full bg-emerald-600" />
                              <span>{concept}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Summary Card */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <span className="font-bold text-slate-800">Ringkasan Pemahaman:</span>
                      <p className="text-slate-600 leading-relaxed">
                        {currentChapter.summary}
                      </p>
                    </div>

                    {/* Direct Online Access Callout */}
                    {readingBook.onlineReaderUrl && (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                        <div className="space-y-0.5">
                          <div className="font-bold text-sm text-amber-300">
                            Ingin membaca seluruh isi buku dari halaman 1 s.d. {readingBook.totalPages}?
                          </div>
                          <p className="text-xs text-blue-100">
                            Akses katalog resmi buku digital Kurikulum Merdeka Kemendikbudristek secara gratis dan legal.
                          </p>
                        </div>
                        <a
                          href={readingBook.onlineReaderUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5 shrink-0 shadow-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Buka Buku Online</span>
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    Pilih bab di panel kiri untuk mulai membaca.
                  </div>
                )}

                {/* Chapter Navigation Bottom Bar */}
                {readingBook.chapters && readingBook.chapters.length > 1 && (
                  <div className="pt-6 mt-6 border-t border-slate-200 flex items-center justify-between text-xs">
                    <button
                      disabled={activeChapterIndex === 0}
                      onClick={() => setActiveChapterIndex((prev) => Math.max(0, prev - 1))}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border font-medium ${
                        activeChapterIndex === 0
                          ? 'text-slate-300 border-slate-200 cursor-not-allowed'
                          : 'text-slate-700 border-slate-300 hover:bg-slate-100 cursor-pointer'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Bab Sebelumnya</span>
                    </button>

                    <span className="text-slate-500 font-medium">
                      Bab {activeChapterIndex + 1} dari {readingBook.chapters.length}
                    </span>

                    <button
                      disabled={activeChapterIndex === readingBook.chapters.length - 1}
                      onClick={() =>
                        setActiveChapterIndex((prev) =>
                          Math.min((readingBook.chapters?.length || 1) - 1, prev + 1)
                        )
                      }
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border font-medium ${
                        activeChapterIndex === readingBook.chapters.length - 1
                          ? 'text-slate-300 border-slate-200 cursor-not-allowed'
                          : 'text-slate-700 border-slate-300 hover:bg-slate-100 cursor-pointer'
                      }`}
                    >
                      <span>Bab Selanjutnya</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(readingBook)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Buku Lengkap ({readingBook.fileSize})</span>
                </button>

                {readingBook.onlineReaderUrl && (
                  <a
                    href={readingBook.onlineReaderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-semibold border border-slate-300 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-900" />
                    <span>Kunjungi Portal E-Book Resmi</span>
                  </a>
                )}
              </div>

              <button
                onClick={() => setReadingBook(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg cursor-pointer"
              >
                Tutup Pembaca
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add E-Book Modal (Admin) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Tambah Buku Digital ke Koleksi</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBook} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Buku</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kimia untuk SMA/MA Kelas XI Fase F"
                  value={newBookForm.title}
                  onChange={(e) => setNewBookForm({ ...newBookForm, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Penulis</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Munasprianto Ramli, dkk."
                    value={newBookForm.author}
                    onChange={(e) => setNewBookForm({ ...newBookForm, author: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Penerbit</label>
                  <input
                    type="text"
                    value={newBookForm.publisher}
                    onChange={(e) => setNewBookForm({ ...newBookForm, publisher: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Buku</label>
                  <select
                    value={newBookForm.category}
                    onChange={(e) => setNewBookForm({ ...newBookForm, category: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Buku Teks Kurikulum Merdeka">Buku Teks Kurikulum Merdeka</option>
                    <option value="Sains & Teknologi">Sains & Teknologi</option>
                    <option value="Bahasa & Sastra">Bahasa & Sastra</option>
                    <option value="Teknologi & Komputasi">Teknologi & Komputasi</option>
                    <option value="Muatan Lokal & Budaya">Muatan Lokal & Budaya</option>
                    <option value="Sosial & Humaniora">Sosial & Humaniora</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tingkat Kelas</label>
                  <select
                    value={newBookForm.grade}
                    onChange={(e) =>
                      setNewBookForm({
                        ...newBookForm,
                        grade: e.target.value === 'Semua' ? 'Semua' : (Number(e.target.value) as 10 | 11 | 12),
                      })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value={10}>Kelas 10 (Fase E)</option>
                    <option value={11}>Kelas 11 (Fase F)</option>
                    <option value={12}>Kelas 12 (Fase F)</option>
                    <option value="Semua">Semua Tingkat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tautan Buku Online Resmi (Kemendikbudristek / Open Access URL)
                </label>
                <input
                  type="url"
                  placeholder="https://buku.kemdikbud.go.id/katalog/..."
                  value={newBookForm.onlineReaderUrl}
                  onChange={(e) => setNewBookForm({ ...newBookForm, onlineReaderUrl: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sinopsis & Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ringkasan materi dan cakupan buku..."
                  value={newBookForm.description}
                  onChange={(e) => setNewBookForm({ ...newBookForm, description: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Naskah Bacaan Bab 1 (Teks Asli)</label>
                <textarea
                  rows={3}
                  placeholder="Kutipan materi asli buku untuk dibaca langsung oleh siswa..."
                  value={newBookForm.chapterExcerpt}
                  onChange={(e) => setNewBookForm({ ...newBookForm, chapterExcerpt: e.target.value })}
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
                  Simpan Buku ke Perpustakaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
