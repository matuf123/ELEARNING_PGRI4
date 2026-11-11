import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { EBook } from '../../types';
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
  Bookmark
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
  }>({
    title: '',
    author: '',
    publisher: 'Kemendikbudristek RI',
    category: 'Buku Teks Kurikulum Merdeka',
    grade: 11,
    fileSize: '15.0 MB',
    totalPages: 250,
    description: '',
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

  const handleOpenReader = (book: EBook) => {
    incrementEBookRead(book.id);
    setReadingBook(book);
  };

  const handleDownload = (book: EBook) => {
    incrementEBookDownload(book.id);
    alert(`Mengunduh file buku digital "${book.title}" (${book.fileSize})...`);
  };

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookForm.title || !newBookForm.author) return;

    addEBook({
      ...newBookForm,
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
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Library className="w-5 h-5 text-blue-900" />
            <h2 className="text-xl font-bold text-slate-900">Perpustakaan Online & E-Book</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Koleksi Buku Sekolah Elektronik (BSE) Kurikulum Merdeka Kemendikbudristek, buku referensi, dan modul ajar SMA PGRI 4 Gandrungmangu.
          </p>
        </div>

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
          filteredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
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
                  <div className="w-16 h-22 rounded-lg bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-2 flex flex-col justify-between shrink-0 shadow-xs border border-blue-800">
                    <div className="text-[9px] font-bold text-amber-300 leading-tight line-clamp-2">
                      SMA PGRI 4
                    </div>
                    <BookOpen className="w-5 h-5 text-blue-200 mx-auto" />
                    <div className="text-[8px] text-blue-200 text-center font-mono">
                      {book.fileSize}
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                      {book.title}
                    </h3>
                    <div className="text-xs text-slate-600 truncate">
                      Penulis: {book.author}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {book.publisher}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {book.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  {book.totalPages} Hlm · {book.readCount}x Dibaca
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDownload(book)}
                    className="p-1.5 text-slate-500 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Unduh E-Book"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenReader(book)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Baca E-Book</span>
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
          ))
        )}
      </div>

      {/* Online Book Reader Simulator Modal */}
      {readingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="min-w-0 pr-4">
                <span className="text-[10px] uppercase font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                  {readingBook.category} · Kelas {readingBook.grade}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1 truncate">
                  {readingBook.title}
                </h3>
              </div>
              <button
                onClick={() => setReadingBook(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 text-sm">Informasi Bibliografi:</div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>Penulis: <strong className="text-slate-900">{readingBook.author}</strong></div>
                  <div>Penerbit: <strong className="text-slate-900">{readingBook.publisher}</strong></div>
                  <div>Jumlah Halaman: <strong className="text-slate-900">{readingBook.totalPages} Halaman</strong></div>
                  <div>Ukuran Berkas: <strong className="text-slate-900">{readingBook.fileSize}</strong></div>
                </div>
                <p className="text-slate-600 pt-2 border-t border-slate-200 leading-relaxed">
                  {readingBook.description}
                </p>
              </div>

              {/* Reader Simulation Canvas */}
              <div className="p-6 rounded-xl border border-slate-300 bg-slate-100 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center mx-auto">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Pratinjau Lembar Belajar Buku Digital
                </h4>
                <p className="text-slate-500 max-w-md mx-auto text-xs leading-relaxed">
                  Buku ini disajikan dalam format interaktif standar Kurikulum Merdeka Kemendikbudristek untuk menunjang pembelajaran di SMA PGRI 4 Gandrungmangu.
                </p>
                <div className="p-4 bg-white rounded-lg border border-slate-200 max-w-lg mx-auto text-left space-y-2 text-xs">
                  <div className="font-bold text-slate-800">Daftar Isi & Capaian Pembelajaran:</div>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>Bab 1: Konsep Dasar & Eksplorasi Teori</li>
                    <li>Bab 2: Analisis Model & Penerapan Kasus Nyata</li>
                    <li>Bab 3: Pemecahan Masalah & Asesmen Formatif</li>
                    <li>Bab 4: Pengayaan Karakter & Profil Pelajar Pancasila</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => handleDownload(readingBook)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Buku Lengkap ({readingBook.fileSize})</span>
              </button>

              <button
                onClick={() => setReadingBook(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs rounded-lg"
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
                <label className="block font-semibold text-slate-700 mb-1">Sinopsis & Deskripsi Singkat</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ringkasan materi dan cakupan bab..."
                  value={newBookForm.description}
                  onChange={(e) => setNewBookForm({ ...newBookForm, description: e.target.value })}
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
