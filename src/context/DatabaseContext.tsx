import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  AcademicYear,
  SchoolClass,
  Subject,
  Schedule,
  Material,
  Assignment,
  Submission,
  AttendanceSession,
  GradeRecord,
  Announcement,
  AcademicCalendarEvent,
  SystemLog,
  UserRole,
  EBook,
  ChatMessage,
  HomeroomValidation,
} from '../types';
import {
  INITIAL_ACADEMIC_YEARS,
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_USERS,
  INITIAL_SCHEDULES,
  INITIAL_MATERIALS,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_ATTENDANCES,
  INITIAL_GRADES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_SYSTEM_LOGS,
  INITIAL_EBOOKS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_HOMEROOM_VALIDATIONS,
} from '../data/initialData';

interface DatabaseContextType {
  // Current session, Auth & RBAC
  currentUser: User;
  isAuthenticated: boolean;
  login: (identifier: string, password?: string) => { success: boolean; error?: string; user?: User };
  logout: () => void;
  setCurrentUser: (user: User) => void;
  switchUserById: (userId: string) => void;

  // Active Academic Year
  academicYears: AcademicYear[];
  activeAcademicYear: AcademicYear;
  setActiveAcademicYear: (id: string) => void;
  addAcademicYear: (year: Omit<AcademicYear, 'id'>) => void;

  // Core Relational Entities
  users: User[];
  classes: SchoolClass[];
  subjects: Subject[];
  schedules: Schedule[];
  materials: Material[];
  assignments: Assignment[];
  submissions: Submission[];
  attendances: AttendanceSession[];
  grades: GradeRecord[];
  announcements: Announcement[];
  calendarEvents: AcademicCalendarEvent[];
  systemLogs: SystemLog[];
  ebooks: EBook[];
  chatMessages: ChatMessage[];
  homeroomValidations: HomeroomValidation[];

  // E-Books
  addEBook: (book: Omit<EBook, 'id' | 'readCount' | 'downloadCount'>) => void;
  updateEBook: (id: string, updates: Partial<EBook>) => void;
  deleteEBook: (id: string) => void;
  incrementEBookRead: (id: string) => void;
  incrementEBookDownload: (id: string) => void;

  // Messaging & Chat
  sendChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp' | 'isRead'>) => void;

  // Homeroom Validation
  updateHomeroomValidation: (validation: Omit<HomeroomValidation, 'id'>) => void;

  // Entity Actions & Mutations
  // Users
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  bulkImportUsers: (newUsers: Omit<User, 'id'>[]) => { successCount: number; errors: string[] };
  resetUserPassword: (id: string) => void;

  // Classes
  addClass: (cls: Omit<SchoolClass, 'id'>) => void;
  updateClass: (id: string, updates: Partial<SchoolClass>) => void;
  deleteClass: (id: string) => void;

  // Subjects
  addSubject: (subj: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // Schedules
  addSchedule: (sch: Omit<Schedule, 'id'>) => void;
  updateSchedule: (id: string, updates: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => void;

  // Materials
  addMaterial: (mat: Omit<Material, 'id' | 'uploadDate' | 'downloadCount'>) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  incrementMaterialDownload: (id: string) => void;

  // Assignments & Quizzes
  addAssignment: (asg: Omit<Assignment, 'id' | 'createdAt'>) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;

  // Submissions
  submitAssignmentWork: (sub: Omit<Submission, 'id' | 'submissionDate' | 'status'>) => void;
  gradeSubmission: (submissionId: string, score: number, feedback: string) => void;

  // Attendance
  saveAttendanceSession: (session: Omit<AttendanceSession, 'id'>) => void;

  // Grades
  saveGradeRecord: (record: Omit<GradeRecord, 'id'>) => void;
  batchSaveGrades: (records: Omit<GradeRecord, 'id'>[]) => void;

  // Announcements
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'date'>) => void;
  deleteAnnouncement: (id: string) => void;

  // Reset System State to Factory Initial
  resetDatabase: () => void;

  // Utility Queries
  getStudentAttendanceStats: (studentId: string) => { hadir: number; izin: number; sakit: number; alpa: number; total: number; percentage: number };
  getSchoolAttendanceStats: () => { hadirCount: number; izinCount: number; sakitCount: number; alpaCount: number; totalRecords: number; rate: number };
  getPendingGradingCount: (teacherId: string) => number;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

const STORAGE_PREFIX = 'smapgri4_elearning_v6_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State Initialization
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(() =>
    loadFromStorage('academicYears', INITIAL_ACADEMIC_YEARS)
  );
  const [classes, setClasses] = useState<SchoolClass[]>(() =>
    loadFromStorage('classes', INITIAL_CLASSES)
  );
  const [subjects, setSubjects] = useState<Subject[]>(() =>
    loadFromStorage('subjects', INITIAL_SUBJECTS)
  );
  const [users, setUsers] = useState<User[]>(() =>
    loadFromStorage('users', INITIAL_USERS)
  );
  const [schedules, setSchedules] = useState<Schedule[]>(() =>
    loadFromStorage('schedules', INITIAL_SCHEDULES)
  );
  const [materials, setMaterials] = useState<Material[]>(() =>
    loadFromStorage('materials', INITIAL_MATERIALS)
  );
  const [assignments, setAssignments] = useState<Assignment[]>(() =>
    loadFromStorage('assignments', INITIAL_ASSIGNMENTS)
  );
  const [submissions, setSubmissions] = useState<Submission[]>(() =>
    loadFromStorage('submissions', INITIAL_SUBMISSIONS)
  );
  const [attendances, setAttendances] = useState<AttendanceSession[]>(() =>
    loadFromStorage('attendances', INITIAL_ATTENDANCES)
  );
  const [grades, setGrades] = useState<GradeRecord[]>(() =>
    loadFromStorage('grades', INITIAL_GRADES)
  );
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    loadFromStorage('announcements', INITIAL_ANNOUNCEMENTS)
  );
  const [calendarEvents] = useState<AcademicCalendarEvent[]>(() =>
    loadFromStorage('calendarEvents', INITIAL_CALENDAR_EVENTS)
  );
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>(() =>
    loadFromStorage('systemLogs', INITIAL_SYSTEM_LOGS)
  );
  const [ebooks, setEbooks] = useState<EBook[]>(() =>
    loadFromStorage('ebooks', INITIAL_EBOOKS)
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() =>
    loadFromStorage('chatMessages', INITIAL_CHAT_MESSAGES)
  );
  const [homeroomValidations, setHomeroomValidations] = useState<HomeroomValidation[]>(() =>
    loadFromStorage('homeroomValidations', INITIAL_HOMEROOM_VALIDATIONS)
  );

  // Active Current User (Default to Admin: Drs. H. Mulyono, M.Pd.)
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUserId = localStorage.getItem(STORAGE_PREFIX + 'currentUserId');
    const found = users.find((u) => u.id === savedUserId);
    return found || users[0] || INITIAL_USERS[0];
  });

  // Authentication Session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    loadFromStorage('isAuthenticated', false)
  );

  useEffect(() => saveToStorage('isAuthenticated', isAuthenticated), [isAuthenticated]);

  const login = (identifier: string, password?: string) => {
    const trimmed = identifier.trim().toLowerCase();
    if (!trimmed) {
      return { success: false, error: 'Silakan masukkan NISN, NIP, atau Email terdaftar Anda.' };
    }

    const matchedUser = users.find((u) => {
      const matchIdentity = u.identityNumber && u.identityNumber.toLowerCase() === trimmed;
      const matchEmail = u.email && u.email.toLowerCase() === trimmed;
      const matchName = u.name && u.name.toLowerCase() === trimmed;
      return matchIdentity || matchEmail || matchName;
    });

    if (!matchedUser) {
      return {
        success: false,
        error: 'Identitas tidak ditemukan. Pastikan NISN (Siswa), NIP (Guru), atau Email sudah benar.',
      };
    }

    if (!matchedUser.isActive) {
      return {
        success: false,
        error: 'Akun Anda sedang dinonaktifkan oleh administrator sekolah.',
      };
    }

    setCurrentUser(matchedUser);
    setIsAuthenticated(true);
    logAction(
      'Autentikasi Masuk',
      `Pengguna ${matchedUser.name} (${matchedUser.role.toUpperCase()}) berhasil masuk sistem.`,
      matchedUser
    );
    return { success: true, user: matchedUser };
  };

  const logout = () => {
    logAction('Autentikasi Keluar', `Pengguna ${currentUser.name} keluar dari sistem.`);
    setIsAuthenticated(false);
  };

  // Sync state to LocalStorage
  useEffect(() => saveToStorage('academicYears', academicYears), [academicYears]);
  useEffect(() => saveToStorage('classes', classes), [classes]);
  useEffect(() => saveToStorage('subjects', subjects), [subjects]);
  useEffect(() => saveToStorage('users', users), [users]);
  useEffect(() => saveToStorage('schedules', schedules), [schedules]);
  useEffect(() => saveToStorage('materials', materials), [materials]);
  useEffect(() => saveToStorage('assignments', assignments), [assignments]);
  useEffect(() => saveToStorage('submissions', submissions), [submissions]);
  useEffect(() => saveToStorage('attendances', attendances), [attendances]);
  useEffect(() => saveToStorage('grades', grades), [grades]);
  useEffect(() => saveToStorage('announcements', announcements), [announcements]);
  useEffect(() => saveToStorage('systemLogs', systemLogs), [systemLogs]);
  useEffect(() => saveToStorage('ebooks', ebooks), [ebooks]);
  useEffect(() => saveToStorage('chatMessages', chatMessages), [chatMessages]);
  useEffect(() => saveToStorage('homeroomValidations', homeroomValidations), [homeroomValidations]);
  useEffect(() => {
    if (currentUser?.id) {
      localStorage.setItem(STORAGE_PREFIX + 'currentUserId', currentUser.id);
    }
  }, [currentUser]);

  // Derived Active Academic Year
  const activeAcademicYear =
    academicYears.find((ay) => ay.isActive) || academicYears[0];

  const logAction = (action: string, details: string, forcedUser?: User) => {
    const actor = forcedUser || currentUser;
    const newLog: SystemLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      }),
      userName: actor.name,
      role: actor.role,
      action,
      details,
    };
    setSystemLogs((prev) => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs
  };

  const switchUserById = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      logAction('Ganti Peran Pengguna', `Beralih ke akun ${target.name} (${target.role.toUpperCase()})`, target);
    }
  };

  const setActiveAcademicYear = (id: string) => {
    setAcademicYears((prev) =>
      prev.map((ay) => ({
        ...ay,
        isActive: ay.id === id,
      }))
    );
    const targetYear = academicYears.find((ay) => ay.id === id);
    logAction(
      'Ubah Tahun Ajaran Aktif',
      `Tahun ajaran aktif diubah ke ${targetYear?.year} (${targetYear?.semester})`
    );
  };

  const addAcademicYear = (year: Omit<AcademicYear, 'id'>) => {
    const id = `ay-${Date.now()}`;
    const newYear: AcademicYear = { ...year, id };
    if (newYear.isActive) {
      setAcademicYears((prev) =>
        prev.map((ay) => ({ ...ay, isActive: false })).concat(newYear)
      );
    } else {
      setAcademicYears((prev) => [...prev, newYear]);
    }
    logAction('Tambah Tahun Ajaran', `Tahun ajaran ${newYear.year} (${newYear.semester}) ditambahkan.`);
  };

  // User Actions
  const addUser = (userData: Omit<User, 'id'>) => {
    const id = `usr-${userData.role}-${Date.now()}`;
    const newUser: User = { ...userData, id };
    setUsers((prev) => [...prev, newUser]);
    logAction('Tambah Pengguna', `Menambahkan pengguna baru: ${newUser.name} (${newUser.role.toUpperCase()})`);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }
    logAction('Perbarui Pengguna', `Memperbarui profil pengguna ID: ${id}`);
  };

  const deleteUser = (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
    logAction('Hapus Pengguna', `Menghapus akun ${target.name} (${target.role})`);
  };

  const bulkImportUsers = (newUsersList: Omit<User, 'id'>[]) => {
    const added: User[] = [];
    const errors: string[] = [];

    newUsersList.forEach((item, index) => {
      if (!item.name || !item.email || !item.identityNumber) {
        errors.push(`Baris ${index + 1}: Data nama, email, atau NISN/NIP tidak lengkap.`);
        return;
      }
      const isExist = users.some((u) => u.identityNumber === item.identityNumber || u.email === item.email);
      if (isExist) {
        errors.push(`Baris ${index + 1}: Pengguna dengan nomor ${item.identityNumber} atau email ${item.email} sudah terdaftar.`);
        return;
      }

      added.push({
        ...item,
        id: `usr-${item.role}-${Date.now()}-${index}`,
      });
    });

    if (added.length > 0) {
      setUsers((prev) => [...prev, ...added]);
      logAction('Import Massal Pengguna', `Berhasil mengimpor ${added.length} data pengguna secara massal.`);
    }

    return { successCount: added.length, errors };
  };

  const resetUserPassword = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      logAction('Reset Kata Sandi', `Kata sandi akun ${user.name} (${user.identityNumber}) direset ke default.`);
    }
  };

  // Class Actions
  const addClass = (clsData: Omit<SchoolClass, 'id'>) => {
    const id = `cls-${Date.now()}`;
    const newClass: SchoolClass = { ...clsData, id };
    setClasses((prev) => [...prev, newClass]);
    logAction('Tambah Kelas', `Membuka kelas baru: ${newClass.name}`);
  };

  const updateClass = (id: string, updates: Partial<SchoolClass>) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    logAction('Perbarui Kelas', `Memperbarui data kelas ID: ${id}`);
  };

  const deleteClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    logAction('Hapus Kelas', `Menghapus rombongan belajar kelas ID: ${id}`);
  };

  // Subject Actions
  const addSubject = (subjData: Omit<Subject, 'id'>) => {
    const id = `sbj-${Date.now()}`;
    const newSubj: Subject = { ...subjData, id };
    setSubjects((prev) => [...prev, newSubj]);
    logAction('Tambah Mata Pelajaran', `Menambahkan mata pelajaran: ${newSubj.name} (${newSubj.code})`);
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    logAction('Perbarui Mata Pelajaran', `Memperbarui mata pelajaran ID: ${id}`);
  };

  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    logAction('Hapus Mata Pelajaran', `Menghapus mata pelajaran ID: ${id}`);
  };

  // Schedule Actions
  const addSchedule = (schData: Omit<Schedule, 'id'>) => {
    const id = `sch-${Date.now()}`;
    const newSch: Schedule = { ...schData, id };
    setSchedules((prev) => [...prev, newSch]);
    logAction('Tambah Jadwal', `Menjadwalkan ${newSch.subjectName} di kelas ${newSch.className} (${newSch.day})`);
  };

  const updateSchedule = (id: string, updates: Partial<Schedule>) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    logAction('Perbarui Jadwal', `Memperbarui jadwal ID: ${id}`);
  };

  const deleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    logAction('Hapus Jadwal', `Menghapus jadwal pembelajaran ID: ${id}`);
  };

  // Material Actions
  const addMaterial = (matData: Omit<Material, 'id' | 'uploadDate' | 'downloadCount'>) => {
    const id = `mat-${Date.now()}`;
    const newMaterial: Material = {
      ...matData,
      id,
      uploadDate: new Date().toISOString().split('T')[0],
      downloadCount: 0,
    };
    setMaterials((prev) => [newMaterial, ...prev]);
    logAction('Unggah Materi', `Guru ${newMaterial.teacherName} mengunggah modul "${newMaterial.title}" untuk kelas ${newMaterial.className}`);
  };

  const updateMaterial = (id: string, updates: Partial<Material>) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
    logAction('Perbarui Materi', `Memperbarui materi pembelajaran ID: ${id}`);
  };

  const deleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    logAction('Hapus Materi', `Menghapus materi pembelajaran ID: ${id}`);
  };

  const incrementMaterialDownload = (id: string) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, downloadCount: m.downloadCount + 1 } : m))
    );
  };

  // Assignment Actions
  const addAssignment = (asgData: Omit<Assignment, 'id' | 'createdAt'>) => {
    const id = `asg-${Date.now()}`;
    const newAsg: Assignment = {
      ...asgData,
      id,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAssignments((prev) => [newAsg, ...prev]);
    logAction('Buat Tugas / Asesmen', `Guru ${newAsg.teacherName} membuat "${newAsg.title}" untuk kelas ${newAsg.className}`);
  };

  const updateAssignment = (id: string, updates: Partial<Assignment>) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
    logAction('Perbarui Asesmen', `Memperbarui detail tugas ID: ${id}`);
  };

  const deleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    logAction('Hapus Asesmen', `Menghapus penugasan ID: ${id}`);
  };

  // Submission Actions
  const submitAssignmentWork = (subData: Omit<Submission, 'id' | 'submissionDate' | 'status'>) => {
    // Check if already submitted
    const existingIndex = submissions.findIndex(
      (s) => s.assignmentId === subData.assignmentId && s.studentId === subData.studentId
    );

    const dateStr = new Date().toLocaleString('id-ID', {
      dateStyle: 'short',
      timeStyle: 'short',
    });

    if (existingIndex >= 0) {
      const updated: Submission = {
        ...submissions[existingIndex],
        ...subData,
        submissionDate: dateStr,
        status: submissions[existingIndex].status === 'graded' ? 'graded' : 'submitted',
      };
      setSubmissions((prev) => {
        const copy = [...prev];
        copy[existingIndex] = updated;
        return copy;
      });
      logAction('Kirim Ulang Tugas', `Siswa ${subData.studentName} memperbarui pengumpulan tugas.`);
    } else {
      const newSub: Submission = {
        ...subData,
        id: `sub-${Date.now()}`,
        submissionDate: dateStr,
        status: subData.score !== undefined ? 'graded' : 'submitted',
      };
      setSubmissions((prev) => [newSub, ...prev]);
      logAction('Pengumpulan Tugas', `Siswa ${subData.studentName} mengumpulkan tugas baru.`);
    }
  };

  const gradeSubmission = (submissionId: string, score: number, feedback: string) => {
    const gradedAt = new Date().toLocaleString('id-ID', {
      dateStyle: 'short',
      timeStyle: 'short',
    });

    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === submissionId
          ? {
              ...sub,
              score,
              teacherFeedback: feedback,
              gradedAt,
              status: 'graded',
            }
          : sub
      )
    );

    const sub = submissions.find((s) => s.id === submissionId);
    if (sub) {
      logAction('Penilaian Tugas', `Guru memberikan nilai ${score} untuk tugas siswa ${sub.studentName}`);

      // Auto sync or update student's GradeRecord assignment score
      const asg = assignments.find((a) => a.id === sub.assignmentId);
      if (asg) {
        updateOrCreateGradeForStudent(sub.studentId, asg.subjectId, asg.classId, score);
      }
    }
  };

  const updateOrCreateGradeForStudent = (
    studentId: string,
    subjectId: string,
    classId: string,
    newAssignmentScore: number
  ) => {
    const student = users.find((u) => u.id === studentId);
    const subject = subjects.find((s) => s.id === subjectId);
    if (!student || !subject) return;

    setGrades((prev) => {
      const existing = prev.find(
        (g) => g.studentId === studentId && g.subjectId === subjectId && g.academicYearId === activeAcademicYear.id
      );

      if (existing) {
        // Average with existing assignment score
        const updatedAssignmentScore = Math.round((existing.assignmentScore + newAssignmentScore) / 2);
        const finalScore = Math.round(
          existing.dailyScore * 0.25 +
          updatedAssignmentScore * 0.25 +
          existing.midExamScore * 0.25 +
          existing.finalExamScore * 0.25
        );
        let letterGrade: 'A' | 'B' | 'C' | 'D' = 'C';
        if (finalScore >= 88) letterGrade = 'A';
        else if (finalScore >= 78) letterGrade = 'B';
        else if (finalScore >= 68) letterGrade = 'C';
        else letterGrade = 'D';

        return prev.map((g) =>
          g.id === existing.id
            ? {
                ...g,
                assignmentScore: updatedAssignmentScore,
                finalScore,
                letterGrade,
              }
            : g
        );
      } else {
        const finalScore = Math.round(newAssignmentScore * 0.25 + 75 * 0.75);
        let letterGrade: 'A' | 'B' | 'C' | 'D' = 'B';
        if (finalScore >= 88) letterGrade = 'A';
        else if (finalScore >= 78) letterGrade = 'B';
        else if (finalScore >= 68) letterGrade = 'C';
        else letterGrade = 'D';

        const newRec: GradeRecord = {
          id: `grd-${Date.now()}`,
          studentId,
          studentName: student.name,
          studentNisn: student.identityNumber,
          classId,
          subjectId,
          subjectName: subject.name,
          academicYearId: activeAcademicYear.id,
          semester: activeAcademicYear.semester,
          dailyScore: 80,
          assignmentScore: newAssignmentScore,
          midExamScore: 78,
          finalExamScore: 82,
          finalScore,
          letterGrade,
          competencyAchievement: `Menunjukkan pencapaian kompetensi yang baik pada mata pelajaran ${subject.name}.`,
        };
        return [...prev, newRec];
      }
    });
  };

  // Attendance Actions
  const saveAttendanceSession = (sessionData: Omit<AttendanceSession, 'id'>) => {
    const id = `att-${Date.now()}`;
    const newSession: AttendanceSession = { ...sessionData, id };
    setAttendances((prev) => [newSession, ...prev]);
    logAction(
      'Input Presensi',
      `Presensi kelas ${newSession.className} (${newSession.subjectName}) tanggal ${newSession.date} berhasil disimpan.`
    );
  };

  // Grades Actions
  const saveGradeRecord = (recordData: Omit<GradeRecord, 'id'>) => {
    setGrades((prev) => {
      const idx = prev.findIndex(
        (g) =>
          g.studentId === recordData.studentId &&
          g.subjectId === recordData.subjectId &&
          g.academicYearId === recordData.academicYearId
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...recordData, id: prev[idx].id };
        return updated;
      }
      return [...prev, { ...recordData, id: `grd-${Date.now()}` }];
    });
    logAction('Simpan Nilai Rapor', `Nilai ${recordData.subjectName} untuk ${recordData.studentName} diperbarui.`);
  };

  const batchSaveGrades = (records: Omit<GradeRecord, 'id'>[]) => {
    setGrades((prev) => {
      const updatedList = [...prev];
      records.forEach((rec) => {
        const idx = updatedList.findIndex(
          (g) =>
            g.studentId === rec.studentId &&
            g.subjectId === rec.subjectId &&
            g.academicYearId === rec.academicYearId
        );
        if (idx >= 0) {
          updatedList[idx] = { ...rec, id: updatedList[idx].id };
        } else {
          updatedList.push({ ...rec, id: `grd-${Date.now()}-${Math.random()}` });
        }
      });
      return updatedList;
    });
    logAction('Batch Input Nilai Rapor', `Menyimpan ${records.length} data capaian nilai rapor Kurikulum Merdeka.`);
  };

  // Announcement Actions
  const addAnnouncement = (annData: Omit<Announcement, 'id' | 'date'>) => {
    const id = `ann-${Date.now()}`;
    const newAnn: Announcement = {
      ...annData,
      id,
      date: new Date().toISOString().split('T')[0],
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    logAction('Publikasi Pengumuman', `Membuat pengumuman baru: "${newAnn.title}"`);
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    logAction('Hapus Pengumuman', `Menghapus pengumuman ID: ${id}`);
  };

  // EBook Actions
  const addEBook = (bookData: Omit<EBook, 'id' | 'readCount' | 'downloadCount'>) => {
    const id = `eb-${Date.now()}`;
    const newBook: EBook = {
      ...bookData,
      id,
      readCount: 0,
      downloadCount: 0,
    };
    setEbooks((prev) => [newBook, ...prev]);
    logAction('Tambah E-Book', `Menambahkan e-book baru: "${newBook.title}"`);
  };

  const updateEBook = (id: string, updates: Partial<EBook>) => {
    setEbooks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    logAction('Perbarui E-Book', `Memperbarui data buku ID: ${id}`);
  };

  const deleteEBook = (id: string) => {
    setEbooks((prev) => prev.filter((b) => b.id !== id));
    logAction('Hapus E-Book', `Menghapus koleksi buku ID: ${id}`);
  };

  const incrementEBookRead = (id: string) => {
    setEbooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, readCount: b.readCount + 1 } : b))
    );
  };

  const incrementEBookDownload = (id: string) => {
    setEbooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, downloadCount: b.downloadCount + 1 } : b))
    );
  };

  // Chat & Messaging Actions
  const sendChatMessage = (msgData: Omit<ChatMessage, 'id' | 'timestamp' | 'isRead'>) => {
    const id = `msg-${Date.now()}`;
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toISOString().split('T')[0];
    const newMsg: ChatMessage = {
      ...msgData,
      id,
      timestamp: `${dateStr} ${timeStr}`,
      isRead: false,
    };
    setChatMessages((prev) => [...prev, newMsg]);
    logAction('Kirim Pesan', `${newMsg.senderName} mengirim pesan ke ${newMsg.receiverName}`);
  };

  // Homeroom Validation Action
  const updateHomeroomValidation = (valData: Omit<HomeroomValidation, 'id'>) => {
    setHomeroomValidations((prev) => {
      const idx = prev.findIndex(
        (h) => h.studentId === valData.studentId && h.academicYearId === valData.academicYearId
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...valData, id: prev[idx].id };
        return copy;
      }
      return [...prev, { ...valData, id: `hrv-${Date.now()}` }];
    });
    logAction(
      'Validasi Catatan Rapor',
      `Wali kelas memperbarui catatan karakter dan menyetujui e-raport ${valData.studentName}.`
    );
  };

  // Reset to Factory Default
  const resetDatabase = () => {
    localStorage.clear();
    setAcademicYears(INITIAL_ACADEMIC_YEARS);
    setClasses(INITIAL_CLASSES);
    setSubjects(INITIAL_SUBJECTS);
    setUsers(INITIAL_USERS);
    setSchedules(INITIAL_SCHEDULES);
    setMaterials(INITIAL_MATERIALS);
    setAssignments(INITIAL_ASSIGNMENTS);
    setSubmissions(INITIAL_SUBMISSIONS);
    setAttendances(INITIAL_ATTENDANCES);
    setGrades(INITIAL_GRADES);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setSystemLogs(INITIAL_SYSTEM_LOGS);
    setEbooks(INITIAL_EBOOKS);
    setChatMessages(INITIAL_CHAT_MESSAGES);
    setHomeroomValidations(INITIAL_HOMEROOM_VALIDATIONS);
    setCurrentUser(INITIAL_USERS[0]);
    setIsAuthenticated(false);
  };

  // Utility Queries
  const getStudentAttendanceStats = (studentId: string) => {
    let hadir = 0;
    let izin = 0;
    let sakit = 0;
    let alpa = 0;

    attendances.forEach((session) => {
      const rec = session.records.find((r) => r.studentId === studentId);
      if (rec) {
        if (rec.status === 'Hadir') hadir++;
        else if (rec.status === 'Izin') izin++;
        else if (rec.status === 'Sakit') sakit++;
        else if (rec.status === 'Alpa') alpa++;
      }
    });

    const total = hadir + izin + sakit + alpa;
    const percentage = total > 0 ? Math.round((hadir / total) * 100) : 100;
    return { hadir, izin, sakit, alpa, total, percentage };
  };

  const getSchoolAttendanceStats = () => {
    let hadirCount = 0;
    let izinCount = 0;
    let sakitCount = 0;
    let alpaCount = 0;

    attendances.forEach((session) => {
      session.records.forEach((rec) => {
        if (rec.status === 'Hadir') hadirCount++;
        else if (rec.status === 'Izin') izinCount++;
        else if (rec.status === 'Sakit') sakitCount++;
        else if (rec.status === 'Alpa') alpaCount++;
      });
    });

    const totalRecords = hadirCount + izinCount + sakitCount + alpaCount;
    const rate = totalRecords > 0 ? Math.round((hadirCount / totalRecords) * 100) : 98;
    return { hadirCount, izinCount, sakitCount, alpaCount, totalRecords, rate };
  };

  const getPendingGradingCount = (teacherId: string) => {
    const teacherAssignments = assignments.filter((a) => a.teacherId === teacherId);
    const assignmentIds = new Set(teacherAssignments.map((a) => a.id));

    return submissions.filter(
      (s) => assignmentIds.has(s.assignmentId) && s.status === 'submitted'
    ).length;
  };

  return (
    <DatabaseContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        logout,
        setCurrentUser,
        switchUserById,
        academicYears,
        activeAcademicYear,
        setActiveAcademicYear,
        addAcademicYear,
        users,
        classes,
        subjects,
        schedules,
        materials,
        assignments,
        submissions,
        attendances,
        grades,
        announcements,
        calendarEvents,
        systemLogs,
        ebooks,
        chatMessages,
        homeroomValidations,
        addUser,
        updateUser,
        deleteUser,
        bulkImportUsers,
        resetUserPassword,
        addClass,
        updateClass,
        deleteClass,
        addSubject,
        updateSubject,
        deleteSubject,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        incrementMaterialDownload,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        submitAssignmentWork,
        gradeSubmission,
        saveAttendanceSession,
        saveGradeRecord,
        batchSaveGrades,
        addAnnouncement,
        deleteAnnouncement,
        addEBook,
        updateEBook,
        deleteEBook,
        incrementEBookRead,
        incrementEBookDownload,
        sendChatMessage,
        updateHomeroomValidation,
        resetDatabase,
        getStudentAttendanceStats,
        getSchoolAttendanceStats,
        getPendingGradingCount,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
