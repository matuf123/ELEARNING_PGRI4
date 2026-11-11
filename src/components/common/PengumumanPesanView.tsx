import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { Announcement, ChatMessage, User } from '../../types';
import {
  Bell,
  MessageSquare,
  Send,
  Plus,
  Trash2,
  Calendar,
  Clock,
  UserCheck,
  GraduationCap,
  ShieldCheck,
  X,
  AlertCircle
} from 'lucide-react';

export const PengumumanPesanView: React.FC = () => {
  const {
    currentUser,
    announcements,
    addAnnouncement,
    deleteAnnouncement,
    chatMessages,
    sendChatMessage,
    users,
  } = useDatabase();

  const [activeTab, setActiveTab] = useState<'announcements' | 'messages'>('announcements');

  // Announcement creation form state (for admin/guru)
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [annForm, setAnnForm] = useState<{
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

  // Chat conversation state
  // Filter other users available for chat
  const availableChatContacts = users.filter((u) => u.id !== currentUser.id);

  // Default active contact: if student, pick first teacher; if teacher, pick first student; if admin, pick teacher
  const defaultContact =
    currentUser.role === 'siswa'
      ? users.find((u) => u.role === 'guru') || availableChatContacts[0]
      : availableChatContacts[0];

  const [activeContact, setActiveContact] = useState<User | null>(defaultContact || null);
  const [messageText, setMessageText] = useState('');

  // Messages between currentUser and activeContact (or public broadcast messages)
  const conversationMessages = chatMessages.filter((msg) => {
    if (!activeContact) return false;
    const isDirect =
      (msg.senderId === currentUser.id && msg.receiverId === activeContact.id) ||
      (msg.senderId === activeContact.id && msg.receiverId === currentUser.id);
    const isBroadcast = msg.receiverId === 'all';
    return isDirect || isBroadcast;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeContact) return;

    sendChatMessage({
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      receiverId: activeContact.id,
      receiverName: activeContact.name,
      text: messageText.trim(),
    });

    setMessageText('');
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annForm.title || !annForm.content) return;

    addAnnouncement({
      title: annForm.title,
      content: annForm.content,
      targetRole: annForm.targetRole,
      authorName: `${currentUser.name} (${currentUser.role.toUpperCase()})`,
      priority: annForm.priority,
    });

    setAnnForm({
      title: '',
      content: '',
      targetRole: 'all',
      priority: 'Normal',
    });
    setIsAnnModalOpen(false);
  };

  const relevantAnnouncements = announcements.filter((a) => {
    if (currentUser.role === 'admin') return true;
    return a.targetRole === 'all' || a.targetRole === currentUser.role;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-900" />
            <h2 className="text-xl font-bold text-slate-900">Pengumuman & Sistem Pesan Sekolah</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pusat informasi resmi sekolah, surat edaran, serta sarana konsultasi tanya-jawab langsung antara Siswa, Guru, dan Administrator.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'announcements'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Pengumuman Sekolah ({relevantAnnouncements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'messages'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Konsultasi & Chat Langsung</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PENGUMUMAN SEKOLAH */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Warta & Informasi Resmi SMA PGRI 4 Gandrungmangu
            </span>

            {(currentUser.role === 'admin' || currentUser.role === 'guru') && (
              <button
                onClick={() => setIsAnnModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Siarkan Pengumuman</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relevantAnnouncements.map((ann) => {
              const isHighPriority = ann.priority === 'Penting';

              return (
                <div
                  key={ann.id}
                  className={`rounded-xl border p-5 transition-all bg-white shadow-xs ${
                    isHighPriority ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isHighPriority ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {ann.priority}
                      </span>
                      <span className="text-[11px] text-blue-900 bg-blue-50 px-2 py-0.5 rounded font-medium border border-blue-200">
                        Target: {ann.targetRole === 'all' ? 'Semua' : ann.targetRole}
                      </span>
                    </div>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus pengumuman "${ann.title}"?`)) {
                            deleteAnnouncement(ann.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-2.5 leading-snug">
                    {ann.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {ann.content}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Oleh: {ann.authorName}</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{ann.date}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PESAN & KONSULTASI LANGSUNG (CHAT) */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
          {/* Left 4 Cols: Contact List */}
          <div className="md:col-span-4 border-r border-slate-200 bg-slate-50 flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-white">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Daftar Kontak Konsultasi
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Kirim pertanyaan akademik langsung ke guru pengampu atau wali kelas.
              </p>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-slate-100 max-h-[480px]">
              {availableChatContacts.map((contact) => {
                const isSelected = activeContact?.id === contact.id;

                return (
                  <button
                    key={contact.id}
                    onClick={() => setActiveContact(contact)}
                    className={`w-full p-3.5 text-left transition-colors flex items-center gap-3 cursor-pointer ${
                      isSelected ? 'bg-blue-50/80 border-r-2 border-blue-900' : 'hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs uppercase text-slate-700 shrink-0">
                      {contact.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {contact.name}
                      </div>
                      <div className="text-[11px] text-slate-500 capitalize flex items-center gap-1.5 mt-0.5">
                        <span className="font-semibold text-blue-800">{contact.role}</span>
                        {contact.className && <span>· {contact.className}</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 8 Cols: Chat Conversation Panel */}
          <div className="md:col-span-8 flex flex-col justify-between bg-slate-50/30">
            {activeContact ? (
              <>
                {/* Active Chat Header */}
                <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center">
                      {activeContact.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {activeContact.name}
                      </h4>
                      <div className="text-[11px] text-slate-500">
                        {activeContact.role.toUpperCase()} · {activeContact.email}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Online / Siap Menjawab
                  </span>
                </div>

                {/* Messages Feed */}
                <div className="p-4 overflow-y-auto space-y-3 flex-1 max-h-[380px]">
                  {conversationMessages.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      Belum ada pesan dengan {activeContact.name}. Mulai sapa dan tanyakan materi sekarang!
                    </div>
                  ) : (
                    conversationMessages.map((msg) => {
                      const isMe = msg.senderId === currentUser.id;

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1 shadow-xs ${
                              isMe
                                ? 'bg-blue-900 text-white rounded-br-none'
                                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                            }`}
                          >
                            <div className="text-[10px] font-semibold opacity-75">
                              {msg.senderName} ({msg.senderRole})
                            </div>
                            <p className="leading-relaxed">{msg.text}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono mt-1 px-1">
                            {msg.timestamp}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Chat Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
                >
                  <input
                    type="text"
                    required
                    placeholder={`Tulis pesan atau pertanyaan ke ${activeContact.name}...`}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 p-2.5 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl transition-colors cursor-pointer"
                    title="Kirim Pesan"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="p-12 text-center text-xs text-slate-400">
                Pilih kontak di sebelah kiri untuk memulai percakapan.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Broadcast Announcement Modal (Admin/Guru) */}
      {isAnnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Publikasi Maklumat Baru</h3>
              <button onClick={() => setIsAnnModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Pengumuman</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Jadwal Pelaksanaan Ujian CBT Semester Gasal"
                  value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Sasaran</label>
                  <select
                    value={annForm.targetRole}
                    onChange={(e) => setAnnForm({ ...annForm, targetRole: e.target.value as any })}
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
                    value={annForm.priority}
                    onChange={(e) => setAnnForm({ ...annForm, priority: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Penting">Penting / Darurat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Isi Pengumuman</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Ketikkan teks maklumat resmi secara detail..."
                  value={annForm.content}
                  onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAnnModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-lg"
                >
                  Publikasikan Maklumat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
