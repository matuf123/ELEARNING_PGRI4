export type UserRole = 'admin' | 'guru' | 'siswa';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  identityNumber: string; // NIP for teacher, NISN for student, ID for admin
  phone?: string;
  address?: string;
  gender: 'L' | 'P';
  birthDate?: string;
  classId?: string; // For siswa
  className?: string; // Denormalized for display
  subjectsTaught?: string[]; // Array of subject IDs for guru
  avatarUrl?: string;
  isActive: boolean;
}

export interface AcademicYear {
  id: string;
  year: string; // e.g., '2026/2027'
  semester: 'Ganjil' | 'Genap';
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g., 'X-A', 'XI Fase F-1'
  grade: 10 | 11 | 12;
  phase: 'Fase E' | 'Fase F';
  track?: string; // e.g., 'Umum', 'MIPA / Sains', 'IPS / Humaniora'
  homeroomTeacherId: string;
  homeroomTeacherName?: string;
  academicYearId: string;
  capacity: number;
}

export type SubjectCategory = 'Umum' | 'Wajib Umum' | 'Pilihan Fase F' | 'Muatan Lokal';
export type SubjectPhase = 'Fase E (Kelas X)' | 'Fase F (Kelas XI & XII)' | 'Semua Fase';
export type SubjectGroup =
  | 'Kelompok Umum'
  | 'Mata Pelajaran Wajib'
  | 'Pilihan Rumpun MIPA'
  | 'Pilihan Rumpun IPS'
  | 'Pilihan Rumpun Bahasa & Budaya'
  | 'Pilihan Rumpun Vokasi & Prakarya'
  | 'Muatan Lokal';

export interface Subject {
  id: string;
  code: string;
  name: string;
  category: SubjectCategory;
  phase?: SubjectPhase;
  group?: SubjectGroup;
  weeklyHours: number;
  minPassingGrade: number; // KKTP (Kriteria Ketercapaian Tujuan Pembelajaran)
  description?: string;
}

export interface Schedule {
  id: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  startTime: string; // '07:00'
  endTime: string;   // '08:30'
  room: string;
}

export interface Material {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  fileType: 'pdf' | 'video' | 'link' | 'doc' | 'text';
  fileUrl?: string;
  fileName?: string;
  externalLink?: string;
  contentText?: string;
  uploadDate: string;
  downloadCount: number;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  type: 'multiple_choice' | 'essay';
  options?: string[]; // 4 options A, B, C, D
  correctAnswerIndex?: number; // 0, 1, 2, 3
  points: number;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  dueDate: string; // 'YYYY-MM-DD HH:mm'
  maxScore: number;
  type: 'Tugas Mandiri' | 'Tugas Proyek' | 'Kuis Online' | 'Ulangan Harian';
  questions?: QuizQuestion[];
  durationMinutes?: number; // For online quizzes
  allowFileUpload: boolean;
  createdAt: string;
}

export interface SubmissionAnswer {
  questionId: string;
  selectedOption?: number;
  essayAnswer?: string;
  isCorrect?: boolean;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentNisn: string;
  submissionDate: string;
  fileUrl?: string;
  fileName?: string;
  externalLink?: string;
  notes?: string;
  quizAnswers?: SubmissionAnswer[];
  score?: number;
  teacherFeedback?: string;
  gradedAt?: string;
  status: 'submitted' | 'graded';
}

export type AttendanceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  studentNisn: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface AttendanceSession {
  id: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  date: string; // 'YYYY-MM-DD'
  sessionHour: string; // e.g. 'Jam Ke 1-2'
  topic: string;
  records: AttendanceRecord[];
}

export interface GradeRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentNisn: string;
  classId: string;
  subjectId: string;
  subjectName: string;
  academicYearId: string;
  semester: 'Ganjil' | 'Genap';
  dailyScore: number;       // Rata-rata Nilai Harian / Formatif
  assignmentScore: number;  // Rata-rata Tugas
  midExamScore: number;     // PTS / Sumatif Tengah Semester
  finalExamScore: number;   // PAS / Sumatif Akhir Semester
  finalScore: number;       // Nilai Akhir Rapor (Calculated)
  letterGrade: 'A' | 'B' | 'C' | 'D';
  competencyAchievement: string; // Deskripsi Capaian Kompetensi Kurikulum Merdeka
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRole: 'all' | 'guru' | 'siswa';
  authorName: string;
  date: string;
  priority: 'Normal' | 'Penting';
}

export interface AcademicCalendarEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  category: 'KBM' | 'Ujian' | 'Libur' | 'Kegiatan';
  description: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  userName: string;
  role: UserRole;
  action: string;
  details: string;
}

export interface EBook {
  id: string;
  title: string;
  author: string;
  publisher: string;
  category: string;
  grade: 10 | 11 | 12 | 'Semua';
  fileSize: string;
  totalPages: number;
  readCount: number;
  downloadCount: number;
  description: string;
  isAvailable: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverId: string;
  receiverName: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface HomeroomValidation {
  id: string;
  studentId: string;
  studentName: string;
  studentNisn: string;
  classId: string;
  academicYearId: string;
  semester: 'Ganjil' | 'Genap';
  characterNote: string;
  extracurricularNote: string;
  attendanceNote: string;
  isApproved: boolean;
  approvedDate?: string;
}
