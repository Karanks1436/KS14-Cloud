
import React, { useState, useEffect } from 'react';
import { 
  collection, addDoc, getDocs, deleteDoc, doc, getDoc, query, where, writeBatch 
} from 'firebase/firestore'; 
import { db, auth } from './firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Auth from './Auth'; 
import { 
  LogOut, School, Users, BookOpen, Layout, RefreshCw, Trash2, Plus, 
  Calendar, CheckCircle, AlertCircle, UserCircle 
} from 'lucide-react';
import "./App.css";

// --- Constants ---
const SLOTS = 8; // 8 Lectures per day
const TIME_START = 9; // 9 AM start

export default function App() {
  const [user, setUser] = useState(null); // Auth User
  const [userData, setUserData] = useState(null); // DB User (Role, Name, InstName)
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('home');

  // --- Check Login Status & Fetch Role ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // 1. Try fetching from LocalStorage first for speed
        const localUser = localStorage.getItem('user');
        
        if (localUser) {
          const parsed = JSON.parse(localUser);
          setUserData(parsed);
          setView(parsed.role === 'teacher' ? 'admin' : 'student');
          setLoading(false);
        } else {
          // 2. Fallback to Firestore if not in localstorage
          try {
            const docRef = doc(db, "users", currentUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              setUserData(data);
              localStorage.setItem('user', JSON.stringify(data)); // Sync local
              setView(data.role === 'teacher' ? 'admin' : 'student');
            }
          } catch (e) {
            console.error("Error fetching user data", e);
          } finally {
            setLoading(false);
          }
        }
      } else {
        setUser(null);
        setUserData(null);
        localStorage.removeItem('user');
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('user');
    setUserData(null);
    setView('home');
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center text-indigo-600 font-bold gap-2">
      <RefreshCw className="animate-spin" /> Loading System...
    </div>
  );

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <nav className="bg-indigo-800 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <School className="w-6 h-6" /> Cloud Scheduler
            </h1>
            {/* Display Institution Name */}
            <span className="text-xs text-indigo-300 font-medium tracking-wider ml-8">
              {userData?.displayInstitutionName || userData?.institutionName || "Academic Portal"}
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex gap-4 text-sm font-semibold">
              <button onClick={() => setView('home')} className={`hover:text-indigo-200 ${view === 'home' ? 'text-indigo-200 underline' : ''}`}>Home</button>
              
              {userData?.role === 'teacher' && (
                <button onClick={() => setView('admin')} className={`hover:text-indigo-200 ${view === 'admin' ? 'text-indigo-200 underline' : ''}`}>Admin Panel</button>
              )}
              
              <button onClick={() => setView('student')} className={`hover:text-indigo-200 ${view === 'student' ? 'text-indigo-200 underline' : ''}`}>Timetables</button>
            </div>

            <div className="flex items-center gap-4 bg-indigo-900/50 px-4 py-1 rounded-full">
              <div className="text-right hidden md:block">
                <div className="text-xs text-indigo-200 uppercase tracking-wider font-bold">{userData?.role}</div>
                <div className="text-sm font-bold">{userData?.name || user.email}</div>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 p-2 rounded-full transition shadow-lg"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto p-4 md:p-6">
        {view === 'home' && <Home userData={userData} setView={setView} />}
        {view === 'admin' && userData?.role === 'teacher' && <AdminPanel userData={userData} />}
        {view === 'student' && <StudentPanel userData={userData} />}
        
        {view === 'admin' && userData?.role !== 'teacher' && (
          <div className="text-center p-10 bg-red-50 border border-red-200 rounded-lg text-red-600 font-bold">
            Access Denied. Only authorized teachers can access the Admin Panel.
          </div>
        )}
      </main>
    </div>
  );
}

// --- HOME COMPONENT ---
const Home = ({ setView, userData }) => (
  <div className="flex flex-col items-center justify-center h-[70vh] gap-6 text-center animate-fade-in">
    <div className="bg-white p-8 rounded-full shadow-lg mb-4">
      <School className="w-20 h-20 text-indigo-600" />
    </div>
    <h2 className="text-4xl font-bold text-gray-800">Welcome, {userData?.name}</h2>
    <h3 className="text-xl text-gray-600 font-medium">
      {userData?.displayInstitutionName || userData?.institutionName}
    </h3>
    <p className="text-gray-500 max-w-md">
      You are logged in as a <span className="font-bold text-indigo-600 uppercase">{userData?.role}</span>.
      {userData?.role === 'teacher' 
        ? ' Manage your institution\'s data and generate schedules.' 
        : ' View your daily class schedules.'}
    </p>
    
    <div className="flex gap-4 mt-4">
      {userData?.role === 'teacher' && (
        <button onClick={() => setView('admin')} className="px-8 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 font-bold transition">
          Admin Dashboard
        </button>
      )}
      <button onClick={() => setView('student')} className="px-8 py-3 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 font-bold transition">
        View Timetables
      </button>
    </div>
  </div>
);

// --- ADMIN PANEL ---
const AdminPanel = ({ userData }) => {
  const [tab, setTab] = useState('teachers');

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Sidebar */}
      <div className="md:col-span-3 bg-white rounded-lg shadow p-4 h-fit sticky top-24">
        <h3 className="font-bold text-gray-500 uppercase text-xs mb-3 tracking-wider">Management Console</h3>
        <ul className="space-y-2">
          {[
            { id: 'teachers', label: 'Teachers', icon: <Users size={16}/> },
            { id: 'courses', label: 'Courses', icon: <BookOpen size={16}/> },
            { id: 'sections', label: 'Sections', icon: <Layout size={16}/> },
            { id: 'generator', label: 'Generator', icon: <RefreshCw size={16}/> }
          ].map(t => (
            <li key={t.id}>
              <button 
                onClick={() => setTab(t.id)}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                  tab === t.id 
                    ? 'bg-indigo-100 text-indigo-700 font-bold shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t.icon} {t.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Content Area - Passing userData to all children */}
      <div className="md:col-span-9 animate-in fade-in duration-300">
        {tab === 'teachers' && <ManageTeachers userData={userData} />}
        {tab === 'courses' && <ManageCourses userData={userData} />}
        {tab === 'sections' && <ManageSections userData={userData} />}
        {tab === 'generator' && <Generator userData={userData} />}
      </div>
    </div>
  );
};

// --- 1. MANAGE TEACHERS ---
const ManageTeachers = ({ userData }) => {
  const [teachers, setTeachers] = useState([]);
  const [newName, setNewName] = useState('');

  useEffect(() => { fetchTeachers(); }, []);

  const fetchTeachers = async () => {
    // FILTER: Only show teachers from this institution
    const q = query(
      collection(db, "teachers"), 
      where("institutionName", "==", userData.institutionName)
    );
    const querySnapshot = await getDocs(q);
    setTeachers(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
  };

  const handleAdd = async () => {
    if (!newName) return;
    // SAVE: Include institutionName
    await addDoc(collection(db, "teachers"), { 
      name: newName,
      institutionName: userData.institutionName 
    });
    setNewName('');
    fetchTeachers();
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this teacher?")) return;
    await deleteDoc(doc(db, "teachers", id));
    fetchTeachers();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800"><Users className="text-indigo-600"/> Manage Teachers</h2>
      <div className="flex gap-2 mb-6">
        <input 
          className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 outline-none" 
          placeholder="Enter Teacher Name (e.g. Dr. Sharma)" 
          value={newName} onChange={e => setNewName(e.target.value)}
        />
        <button onClick={handleAdd} className="bg-indigo-600 text-white px-6 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 font-semibold">
          <Plus size={18} /> Add
        </button>
      </div>
      <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {teachers.map(t => (
            <li key={t.id} className="p-4 flex justify-between items-center hover:bg-white transition">
              <span className="font-medium text-gray-700">{t.name}</span>
              <button onClick={() => handleDelete(t.id)} className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50"><Trash2 size={18}/></button>
            </li>
          ))}
          {teachers.length === 0 && <p className="p-4 text-center text-gray-400">No teachers found for this institution.</p>}
        </ul>
      </div>
    </div>
  );
};

// --- 2. MANAGE COURSES ---
const ManageCourses = ({ userData }) => {
  const [courses, setCourses] = useState([]);
  const [courseName, setCourseName] = useState('');
  const [subjects, setSubjects] = useState(''); 

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    const q = query(
      collection(db, "courses"),
      where("institutionName", "==", userData.institutionName)
    );
    const s = await getDocs(q);
    setCourses(s.docs.map(d => ({ ...d.data(), id: d.id })));
  };

  const handleAdd = async () => {
    if (!courseName || !subjects) return;
    const subjectList = subjects.split(',').map(s => s.trim()).filter(s => s);
    
    await addDoc(collection(db, "courses"), { 
      name: courseName, 
      subjects: subjectList,
      institutionName: userData.institutionName
    });
    setCourseName(''); setSubjects('');
    fetchCourses();
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this course?")) return;
    await deleteDoc(doc(db, "courses", id));
    fetchCourses();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800"><BookOpen className="text-indigo-600"/> Manage Courses</h2>
      
      <div className="grid gap-4 mb-8 p-6 bg-indigo-50 rounded-xl border border-indigo-100">
        <h3 className="font-semibold text-indigo-900">Add New Course</h3>
        <input 
          className="border p-3 rounded-lg w-full" 
          placeholder="Course Name (e.g. B.Tech CS Sem-1)"
          value={courseName} onChange={e => setCourseName(e.target.value)}
        />
        <input 
          className="border p-3 rounded-lg w-full" 
          placeholder="Subjects (comma separated: Math, Physics, Java, C++)"
          value={subjects} onChange={e => setSubjects(e.target.value)}
        />
        <button onClick={handleAdd} className="bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 shadow transition">Save Course</button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {courses.map(c => (
          <div key={c.id} className="border border-gray-200 p-4 rounded-lg flex justify-between items-start hover:shadow-md transition bg-white">
            <div>
              <h3 className="font-bold text-lg text-gray-800">{c.name}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {c.subjects.map((s, idx) => (
                  <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">{s}</span>
                ))}
              </div>
            </div>
            <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
          </div>
        ))}
        {courses.length === 0 && <p className="text-center text-gray-400">No courses defined yet.</p>}
      </div>
    </div>
  );
};

// --- 3. MANAGE SECTIONS ---
const ManageSections = ({ userData }) => {
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [newSection, setNewSection] = useState('');

  useEffect(() => {
    const load = async () => {
      const q = query(collection(db, "courses"), where("institutionName", "==", userData.institutionName));
      const c = await getDocs(q);
      setCourses(c.docs.map(d => ({...d.data(), id: d.id})));
      fetchSections();
    };
    load();
  }, []);

  const fetchSections = async () => {
    const q = query(collection(db, "sections"), where("institutionName", "==", userData.institutionName));
    const s = await getDocs(q);
    setSections(s.docs.map(d => ({...d.data(), id: d.id})));
  };

  const handleAdd = async () => {
    if(!selectedCourse || !newSection) return;
    const courseName = courses.find(c => c.id === selectedCourse)?.name;
    
    await addDoc(collection(db, "sections"), { 
      name: newSection, 
      courseId: selectedCourse, 
      courseName: courseName,
      institutionName: userData.institutionName
    });
    setNewSection('');
    fetchSections();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "sections", id));
    fetchSections();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800"><Layout className="text-indigo-600"/> Manage Sections</h2>
      
      <div className="flex flex-col md:flex-row gap-2 mb-6 p-4 bg-gray-50 rounded-lg">
        <select className="border p-3 rounded-lg md:w-1/3 bg-white" onChange={e => setSelectedCourse(e.target.value)} value={selectedCourse}>
          <option value="">-- Select Course --</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input 
          className="border p-3 rounded-lg md:w-1/3" 
          placeholder="Section Name (e.g. Section A)"
          value={newSection} onChange={e => setNewSection(e.target.value)}
        />
        <button onClick={handleAdd} className="bg-green-600 text-white px-6 py-3 rounded-lg md:w-1/3 font-bold hover:bg-green-700 shadow">Add Section</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-xs">
              <th className="p-3 rounded-tl-lg">Section Name</th>
              <th className="p-3">Assigned Course</th>
              <th className="p-3 rounded-tr-lg text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sections.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="p-3 font-semibold">{s.name}</td>
                <td className="p-3 text-gray-500">{s.courseName}</td>
                <td className="p-3 text-right">
                  <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sections.length === 0 && <p className="text-center p-4 text-gray-400">No sections found.</p>}
      </div>
    </div>
  );
};

// --- 4. GENERATOR ---
const Generator = ({ userData }) => {
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedSections, setSelectedSections] = useState([]); 
  const [allocations, setAllocations] = useState({}); 
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      // Load Courses
      const qC = query(collection(db, "courses"), where("institutionName", "==", userData.institutionName));
      const c = await getDocs(qC);
      setCourses(c.docs.map(d => ({...d.data(), id: d.id})));
      
      // Load Teachers
      const qT = query(collection(db, "teachers"), where("institutionName", "==", userData.institutionName));
      const t = await getDocs(qT);
      setTeachers(t.docs.map(d => ({...d.data(), id: d.id})));

      // Load Sections
      const qS = query(collection(db, "sections"), where("institutionName", "==", userData.institutionName));
      const s = await getDocs(qS);
      setSections(s.docs.map(d => ({...d.data(), id: d.id})));
    };
    loadData();
  }, [userData]);

  const handleCourseSelect = (cid) => {
    setSelectedCourseId(cid);
    setSelectedSections([]); 
    setAllocations({});
  };

  const toggleSection = (sid) => {
    if (selectedSections.includes(sid)) {
      setSelectedSections(selectedSections.filter(id => id !== sid));
    } else {
      setSelectedSections([...selectedSections, sid]);
    }
  };

  const generate = async () => {
    setStatus({ type: 'loading', text: 'Generating schedules for your institution...' });
    
    try {
      // 1. Get ALL existing schedules FOR THIS INSTITUTION ONLY
      // This prevents conflict checks against other schools
      const qSchedule = query(collection(db, "timetables"), where("institutionName", "==", userData.institutionName));
      const allSchedulesSnap = await getDocs(qSchedule);
      const globalSchedule = allSchedulesSnap.docs.map(d => d.data());

      const course = courses.find(c => c.id === selectedCourseId);
      const batch = writeBatch(db);
      let conflictCount = 0;

      // 4. ALGORITHM
      for (const sectionId of selectedSections) {
        
        // Delete existing timetable for this section (Safety Check: ensure it belongs to this inst)
        // Since sections are filtered by ID and ID is unique, we can just query by sectionId
        const oldQuery = query(collection(db, "timetables"), where("sectionId", "==", sectionId));
        const oldDocs = await getDocs(oldQuery);
        oldDocs.forEach(doc => batch.delete(doc.ref));

        let lecturePool = [];
        for(let i=0; i<SLOTS; i++) {
          const subject = course.subjects[i % course.subjects.length];
          const teacherId = allocations[subject];
          if(teacherId) lecturePool.push({ subject, teacherId });
        }
        
        lecturePool.sort(() => Math.random() - 0.5);

        for (let slot = 0; slot < SLOTS; slot++) {
          if(lecturePool.length === 0) break;

          let placed = false;
          
          for (let i = 0; i < lecturePool.length; i++) {
            const lec = lecturePool[i];

            // CONFLICT CHECK: Is this teacher busy in this slot (within this institution)?
            const isBusy = globalSchedule.some(s => s.slot === slot && s.teacherId === lec.teacherId);
            
            if (!isBusy) {
              const newDocRef = doc(collection(db, "timetables"));
              const newEntry = {
                sectionId,
                courseId: selectedCourseId,
                slot,
                teacherId: lec.teacherId,
                subject: lec.subject,
                institutionName: userData.institutionName // CRITICAL: Save tag
              };

              batch.set(newDocRef, newEntry);
              globalSchedule.push(newEntry);
              
              lecturePool.splice(i, 1);
              placed = true;
              break;
            }
          }
          if (!placed) conflictCount++;
        }
      }

      await batch.commit();
      setStatus({ 
        type: conflictCount > 0 ? 'warning' : 'success', 
        text: `Success! Generated. ${conflictCount} slots unassigned due to teacher unavailability.` 
      });
    } catch (e) {
      console.error(e);
      setStatus({ type: 'error', text: 'Error generating schedule. Check console.' });
    }
  };

  const currentCourse = courses.find(c => c.id === selectedCourseId);
  const relevantSections = sections.filter(s => s.courseId === selectedCourseId);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-8">
      <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800"><RefreshCw className="text-indigo-600"/> Scheduler Generator</h2>
      
      {/* Step 1 */}
      <div>
        <h3 className="font-bold text-gray-700 mb-2">1. Select Course to Schedule</h3>
        <select 
          className="border p-3 w-full rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" 
          onChange={(e) => handleCourseSelect(e.target.value)} 
          value={selectedCourseId}
        >
          <option value="">-- Select Course --</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {currentCourse && (
        <>
          {/* Step 2 */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h3 className="font-bold text-blue-900 mb-4">2. Map Subjects to Teachers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentCourse.subjects.map(sub => (
                <div key={sub} className="flex items-center gap-2 bg-white p-2 rounded shadow-sm">
                  <span className="w-1/3 text-sm font-bold text-gray-600 px-2">{sub}</span>
                  <select 
                    className="border p-2 rounded w-2/3 text-sm"
                    onChange={(e) => setAllocations({...allocations, [sub]: e.target.value})}
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3 */}
          <div>
            <h3 className="font-bold text-gray-700 mb-2">3. Select Sections (Batch)</h3>
            <div className="flex gap-3 flex-wrap">
              {relevantSections.length > 0 ? relevantSections.map(s => (
                <button 
                  key={s.id}
                  onClick={() => toggleSection(s.id)}
                  className={`px-4 py-2 rounded-full border transition ${
                    selectedSections.includes(s.id) 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow' 
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {s.name}
                </button>
              )) : <p className="text-red-500 italic">No sections found for this course.</p>}
            </div>
          </div>

          {/* Action */}
          <button 
            onClick={generate}
            disabled={selectedSections.length === 0 || status?.type === 'loading'}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg transition flex justify-center items-center gap-2"
          >
             {status?.type === 'loading' ? 'Processing...' : 'Generate Schedules'}
          </button>
          
          {status && (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${
              status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
              status.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
              status.type === 'loading' ? 'bg-blue-50 text-blue-800' :
              'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {status.type === 'success' ? <CheckCircle /> : status.type === 'loading' ? <RefreshCw className="animate-spin"/> : <AlertCircle />}
              {status.text}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// --- STUDENT PANEL ---
const StudentPanel = ({ userData }) => {
  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [timetable, setTimetable] = useState([]);
  const [teachers, setTeachers] = useState({}); 

  useEffect(() => {
    const init = async () => {
      // Filter sections by Institution
      const qS = query(collection(db, "sections"), where("institutionName", "==", userData.institutionName));
      const s = await getDocs(qS);
      setSections(s.docs.map(d => ({...d.data(), id: d.id})));
      
      // Filter teachers by Institution (to resolve names)
      const qT = query(collection(db, "teachers"), where("institutionName", "==", userData.institutionName));
      const t = await getDocs(qT);
      const tMap = {};
      t.docs.forEach(d => tMap[d.id] = d.data().name);
      setTeachers(tMap);
    };
    init();
  }, [userData]);

  useEffect(() => {
    if(!selectedSectionId) return;
    const loadTT = async () => {
      const q = query(collection(db, "timetables"), where("sectionId", "==", selectedSectionId));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => d.data());
      data.sort((a,b) => a.slot - b.slot);
      setTimetable(data);
    };
    loadTT();
  }, [selectedSectionId]);

  // Helper: Time Format
  const getTime = (slot) => {
    const startMin = (TIME_START * 60) + (slot * 40);
    const endMin = startMin + 40;
    const format = (m) => {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h > 12 ? h-12 : h;
      return `${h12}:${min.toString().padStart(2,'0')} ${ampm}`;
    };
    return `${format(startMin)} - ${format(endMin)}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-emerald-500">
        <label className="block font-bold mb-3 text-gray-700">Find Your Class Schedule</label>
        <select 
          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none"
          onChange={e => setSelectedSectionId(e.target.value)}
        >
          <option value="">-- Select Class & Section --</option>
          {sections.map(s => (
            <option key={s.id} value={s.id}>{s.courseName} - {s.name}</option>
          ))}
        </select>
      </div>

      {selectedSectionId && (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="bg-emerald-600 text-white p-4 flex justify-between items-center">
             <span className="font-bold text-lg"><Calendar className="inline mr-2"/> Daily Schedule</span>
             <span className="text-sm bg-emerald-700 px-2 py-1 rounded">
                {sections.find(s=>s.id === selectedSectionId)?.courseName}
             </span>
          </div>
          <div className="divide-y divide-gray-100">
            {Array.from({length: SLOTS}).map((_, index) => {
              const entry = timetable.find(t => t.slot === index);
              return (
                <div key={index} className="flex p-4 hover:bg-gray-50 transition-colors">
                  <div className="w-1/3 md:w-1/4 text-gray-500 text-sm font-mono flex items-center border-r border-gray-100 pr-4">
                    {getTime(index)}
                  </div>
                  <div className="w-2/3 md:w-3/4 pl-4">
                    {entry ? (
                      <div>
                        <div className="font-bold text-gray-800 text-lg">{entry.subject}</div>
                        <div className="text-sm text-emerald-600 font-semibold flex items-center gap-1">
                          <UserCircle size={14}/> {teachers[entry.teacherId] || 'Unknown Teacher'}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-300 italic flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-gray-300"></span> Free Period
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};




// import React, { useState, useEffect } from 'react';
// import { 
//   collection, addDoc, getDocs, deleteDoc, doc, getDoc, query, where, writeBatch 
// } from 'firebase/firestore'; 
// import { db, auth } from './firebase'; 
// import { onAuthStateChanged, signOut } from 'firebase/auth';
// import Auth from './Auth'; 
// // 1. Import Gemini SDK
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { 
//   LogOut, School, Users, BookOpen, Layout, RefreshCw, Trash2, Plus, 
//   Calendar, CheckCircle, AlertCircle, UserCircle, Sparkles 
// } from 'lucide-react';
// import "./App.css";

// // --- Constants ---
// const SLOTS = 8; 
// const TIME_START = 9; 

// // --- Initialize Gemini ---
// // Replace with your key or use process.env / import.meta.env
// const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "hdsj,vdmnnfnmnjgbk,mr/l";
// const genAI = new GoogleGenerativeAI(API_KEY);

// export default function App() {
//   const [user, setUser] = useState(null); 
//   const [userData, setUserData] = useState(null); 
//   const [loading, setLoading] = useState(true);
//   const [view, setView] = useState('home');

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
//       if (currentUser) {
//         setUser(currentUser);
//         const localUser = localStorage.getItem('user');
        
//         if (localUser) {
//           const parsed = JSON.parse(localUser);
//           setUserData(parsed);
//           setView(parsed.role === 'teacher' ? 'admin' : 'student');
//           setLoading(false);
//         } else {
//           try {
//             const docRef = doc(db, "users", currentUser.uid);
//             const docSnap = await getDoc(docRef);
//             if (docSnap.exists()) {
//               const data = docSnap.data();
//               setUserData(data);
//               localStorage.setItem('user', JSON.stringify(data)); 
//               setView(data.role === 'teacher' ? 'admin' : 'student');
//             }
//           } catch (e) {
//             console.error("Error fetching user data", e);
//           } finally {
//             setLoading(false);
//           }
//         }
//       } else {
//         setUser(null);
//         setUserData(null);
//         localStorage.removeItem('user');
//         setLoading(false);
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   const handleLogout = async () => {
//     await signOut(auth);
//     localStorage.removeItem('user');
//     setUserData(null);
//     setView('home');
//   };

//   if (loading) return (
//     <div className="h-screen flex items-center justify-center text-indigo-600 font-bold gap-2">
//       <RefreshCw className="animate-spin" /> Loading System...
//     </div>
//   );

//   if (!user) {
//     return <Auth />;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
//       <nav className="bg-indigo-800 text-white p-4 shadow-md sticky top-0 z-50">
//         <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
//           <div className="flex flex-col">
//             <h1 className="text-xl font-bold flex items-center gap-2">
//               <School className="w-6 h-6" /> Cloud Scheduler <span className="text-xs bg-indigo-600 px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles size={10}/> AI Powered</span>
//             </h1>
//             <span className="text-xs text-indigo-300 font-medium tracking-wider ml-8">
//               {userData?.displayInstitutionName || userData?.institutionName || "Academic Portal"}
//             </span>
//           </div>
          
//           <div className="flex items-center gap-6">
//             <div className="flex gap-4 text-sm font-semibold">
//               <button onClick={() => setView('home')} className={`hover:text-indigo-200 ${view === 'home' ? 'text-indigo-200 underline' : ''}`}>Home</button>
//               {userData?.role === 'teacher' && (
//                 <button onClick={() => setView('admin')} className={`hover:text-indigo-200 ${view === 'admin' ? 'text-indigo-200 underline' : ''}`}>Admin Panel</button>
//               )}
//               <button onClick={() => setView('student')} className={`hover:text-indigo-200 ${view === 'student' ? 'text-indigo-200 underline' : ''}`}>Timetables</button>
//             </div>

//             <div className="flex items-center gap-4 bg-indigo-900/50 px-4 py-1 rounded-full">
//               <div className="text-right hidden md:block">
//                 <div className="text-xs text-indigo-200 uppercase tracking-wider font-bold">{userData?.role}</div>
//                 <div className="text-sm font-bold">{userData?.name || user.email}</div>
//               </div>
//               <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 p-2 rounded-full transition shadow-lg" title="Logout">
//                 <LogOut size={16} />
//               </button>
//             </div>
//           </div>
//         </div>
//       </nav>
      
//       <main className="container mx-auto p-4 md:p-6">
//         {view === 'home' && <Home userData={userData} setView={setView} />}
//         {view === 'admin' && userData?.role === 'teacher' && <AdminPanel userData={userData} />}
//         {view === 'student' && <StudentPanel userData={userData} />}
        
//         {view === 'admin' && userData?.role !== 'teacher' && (
//           <div className="text-center p-10 bg-red-50 border border-red-200 rounded-lg text-red-600 font-bold">
//             Access Denied. Only authorized teachers can access the Admin Panel.
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

// // --- HOME COMPONENT ---
// const Home = ({ setView, userData }) => (
//   <div className="flex flex-col items-center justify-center h-[70vh] gap-6 text-center animate-fade-in">
//     <div className="bg-white p-8 rounded-full shadow-lg mb-4 relative">
//       <School className="w-20 h-20 text-indigo-600" />
//       <Sparkles className="absolute top-4 right-4 text-yellow-500 animate-pulse" />
//     </div>
//     <h2 className="text-4xl font-bold text-gray-800">Welcome, {userData?.name}</h2>
//     <h3 className="text-xl text-gray-600 font-medium">
//       {userData?.displayInstitutionName || userData?.institutionName}
//     </h3>
//     <p className="text-gray-500 max-w-md">
//       You are logged in as a <span className="font-bold text-indigo-600 uppercase">{userData?.role}</span>.
//       {userData?.role === 'teacher' 
//         ? ' Manage your institution\'s data and generate AI-optimized schedules.' 
//         : ' View your daily class schedules.'}
//     </p>
    
//     <div className="flex gap-4 mt-4">
//       {userData?.role === 'teacher' && (
//         <button onClick={() => setView('admin')} className="px-8 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 font-bold transition">
//           Admin Dashboard
//         </button>
//       )}
//       <button onClick={() => setView('student')} className="px-8 py-3 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 font-bold transition">
//         View Timetables
//       </button>
//     </div>
//   </div>
// );

// // --- ADMIN PANEL ---
// const AdminPanel = ({ userData }) => {
//   const [tab, setTab] = useState('teachers');

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
//       <div className="md:col-span-3 bg-white rounded-lg shadow p-4 h-fit sticky top-24">
//         <h3 className="font-bold text-gray-500 uppercase text-xs mb-3 tracking-wider">Management Console</h3>
//         <ul className="space-y-2">
//           {[
//             { id: 'teachers', label: 'Teachers', icon: <Users size={16}/> },
//             { id: 'courses', label: 'Courses', icon: <BookOpen size={16}/> },
//             { id: 'sections', label: 'Sections', icon: <Layout size={16}/> },
//             { id: 'generator', label: 'AI Generator', icon: <Sparkles size={16} className="text-indigo-500"/> }
//           ].map(t => (
//             <li key={t.id}>
//               <button 
//                 onClick={() => setTab(t.id)}
//                 className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
//                   tab === t.id 
//                     ? 'bg-indigo-100 text-indigo-700 font-bold shadow-sm' 
//                     : 'text-gray-600 hover:bg-gray-50'
//                 }`}
//               >
//                 {t.icon} {t.label}
//               </button>
//             </li>
//           ))}
//         </ul>
//       </div>

//       <div className="md:col-span-9 animate-in fade-in duration-300">
//         {tab === 'teachers' && <ManageTeachers userData={userData} />}
//         {tab === 'courses' && <ManageCourses userData={userData} />}
//         {tab === 'sections' && <ManageSections userData={userData} />}
//         {tab === 'generator' && <Generator userData={userData} />}
//       </div>
//     </div>
//   );
// };

// // --- MANAGE TEACHERS (Unchanged) ---
// const ManageTeachers = ({ userData }) => {
//   const [teachers, setTeachers] = useState([]);
//   const [newName, setNewName] = useState('');
//   useEffect(() => { fetchTeachers(); }, []);
//   const fetchTeachers = async () => {
//     const q = query(collection(db, "teachers"), where("institutionName", "==", userData.institutionName));
//     const querySnapshot = await getDocs(q);
//     setTeachers(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
//   };
//   const handleAdd = async () => {
//     if (!newName) return;
//     await addDoc(collection(db, "teachers"), { name: newName, institutionName: userData.institutionName });
//     setNewName(''); fetchTeachers();
//   };
//   const handleDelete = async (id) => {
//     if(!window.confirm("Delete this teacher?")) return;
//     await deleteDoc(doc(db, "teachers", id)); fetchTeachers();
//   };
//   return (
//     <div className="bg-white p-6 rounded-lg shadow-md">
//       <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800"><Users className="text-indigo-600"/> Manage Teachers</h2>
//       <div className="flex gap-2 mb-6">
//         <input className="border border-gray-300 p-3 rounded-lg w-full outline-none" placeholder="Teacher Name" value={newName} onChange={e => setNewName(e.target.value)}/>
//         <button onClick={handleAdd} className="bg-indigo-600 text-white px-6 rounded-lg hover:bg-indigo-700 font-bold"><Plus size={18}/></button>
//       </div>
//       <div className="bg-gray-50 rounded-lg border border-gray-200">
//         <ul className="divide-y divide-gray-200">
//           {teachers.map(t => (
//             <li key={t.id} className="p-4 flex justify-between items-center">
//               <span className="font-medium text-gray-700">{t.name}</span>
//               <button onClick={() => handleDelete(t.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// // --- MANAGE COURSES (Unchanged) ---
// const ManageCourses = ({ userData }) => {
//   const [courses, setCourses] = useState([]);
//   const [courseName, setCourseName] = useState('');
//   const [subjects, setSubjects] = useState(''); 
//   useEffect(() => { fetchCourses(); }, []);
//   const fetchCourses = async () => {
//     const q = query(collection(db, "courses"), where("institutionName", "==", userData.institutionName));
//     const s = await getDocs(q);
//     setCourses(s.docs.map(d => ({ ...d.data(), id: d.id })));
//   };
//   const handleAdd = async () => {
//     if (!courseName || !subjects) return;
//     const subjectList = subjects.split(',').map(s => s.trim()).filter(s => s);
//     await addDoc(collection(db, "courses"), { name: courseName, subjects: subjectList, institutionName: userData.institutionName });
//     setCourseName(''); setSubjects(''); fetchCourses();
//   };
//   const handleDelete = async (id) => {
//     if(!window.confirm("Delete?")) return;
//     await deleteDoc(doc(db, "courses", id)); fetchCourses();
//   };
//   return (
//     <div className="bg-white p-6 rounded-lg shadow-md">
//       <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800"><BookOpen className="text-indigo-600"/> Manage Courses</h2>
//       <div className="grid gap-4 mb-8 p-6 bg-indigo-50 rounded-xl border border-indigo-100">
//         <input className="border p-3 rounded-lg w-full" placeholder="Course Name" value={courseName} onChange={e => setCourseName(e.target.value)}/>
//         <input className="border p-3 rounded-lg w-full" placeholder="Subjects (comma separated)" value={subjects} onChange={e => setSubjects(e.target.value)}/>
//         <button onClick={handleAdd} className="bg-indigo-600 text-white py-3 rounded-lg font-bold">Save Course</button>
//       </div>
//       <div className="grid grid-cols-1 gap-4">
//         {courses.map(c => (
//           <div key={c.id} className="border border-gray-200 p-4 rounded-lg flex justify-between items-start bg-white">
//             <div>
//               <h3 className="font-bold text-lg text-gray-800">{c.name}</h3>
//               <div className="flex flex-wrap gap-2 mt-2">{c.subjects.map((s, idx) => <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded border">{s}</span>)}</div>
//             </div>
//             <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// // --- MANAGE SECTIONS (Unchanged) ---
// const ManageSections = ({ userData }) => {
//   const [courses, setCourses] = useState([]);
//   const [sections, setSections] = useState([]);
//   const [selectedCourse, setSelectedCourse] = useState('');
//   const [newSection, setNewSection] = useState('');
//   useEffect(() => {
//     const load = async () => {
//       const q = query(collection(db, "courses"), where("institutionName", "==", userData.institutionName));
//       const c = await getDocs(q);
//       setCourses(c.docs.map(d => ({...d.data(), id: d.id})));
//       fetchSections();
//     };
//     load();
//   }, []);
//   const fetchSections = async () => {
//     const q = query(collection(db, "sections"), where("institutionName", "==", userData.institutionName));
//     const s = await getDocs(q);
//     setSections(s.docs.map(d => ({...d.data(), id: d.id})));
//   };
//   const handleAdd = async () => {
//     if(!selectedCourse || !newSection) return;
//     const courseName = courses.find(c => c.id === selectedCourse)?.name;
//     await addDoc(collection(db, "sections"), { name: newSection, courseId: selectedCourse, courseName, institutionName: userData.institutionName });
//     setNewSection(''); fetchSections();
//   };
//   const handleDelete = async (id) => { await deleteDoc(doc(db, "sections", id)); fetchSections(); };
//   return (
//     <div className="bg-white p-6 rounded-lg shadow-md">
//       <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800"><Layout className="text-indigo-600"/> Manage Sections</h2>
//       <div className="flex gap-2 mb-6">
//         <select className="border p-3 rounded-lg w-1/3 bg-white" onChange={e => setSelectedCourse(e.target.value)} value={selectedCourse}>
//           <option value="">Course</option>
//           {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//         </select>
//         <input className="border p-3 rounded-lg w-1/3" placeholder="Section Name" value={newSection} onChange={e => setNewSection(e.target.value)}/>
//         <button onClick={handleAdd} className="bg-green-600 text-white px-6 rounded-lg w-1/3 font-bold">Add</button>
//       </div>
//       <table className="w-full text-left">
//         <tbody>{sections.map(s => <tr key={s.id} className="border-b"><td className="p-3">{s.name}</td><td className="p-3 text-gray-500">{s.courseName}</td><td className="p-3 text-right"><button onClick={() => handleDelete(s.id)} className="text-red-400"><Trash2 size={16}/></button></td></tr>)}</tbody>
//       </table>
//     </div>
//   );
// };

// // --- AI GENERATOR COMPONENT ---
// // --- AI GENERATOR COMPONENT ---
// const Generator = ({ userData }) => {
//   const [courses, setCourses] = useState([]);
//   const [sections, setSections] = useState([]);
//   const [teachers, setTeachers] = useState([]);
  
//   const [selectedCourseId, setSelectedCourseId] = useState('');
//   const [selectedSections, setSelectedSections] = useState([]); 
//   const [allocations, setAllocations] = useState({}); 
//   const [status, setStatus] = useState(null);

//   // Load Data on Mount
//   useEffect(() => {
//     const loadData = async () => {
//       // Fetch all data scoped to institution
//       const qC = query(collection(db, "courses"), where("institutionName", "==", userData.institutionName));
//       const c = await getDocs(qC);
//       setCourses(c.docs.map(d => ({...d.data(), id: d.id})));
      
//       const qT = query(collection(db, "teachers"), where("institutionName", "==", userData.institutionName));
//       const t = await getDocs(qT);
//       setTeachers(t.docs.map(d => ({...d.data(), id: d.id})));

//       const qS = query(collection(db, "sections"), where("institutionName", "==", userData.institutionName));
//       const s = await getDocs(qS);
//       setSections(s.docs.map(d => ({...d.data(), id: d.id})));
//     };
//     loadData();
//   }, [userData]);

//   const handleCourseSelect = (cid) => {
//     setSelectedCourseId(cid);
//     setSelectedSections([]); 
//     setAllocations({});
//   };

//   const toggleSection = (sid) => {
//     if (selectedSections.includes(sid)) {
//       setSelectedSections(selectedSections.filter(id => id !== sid));
//     } else {
//       setSelectedSections([...selectedSections, sid]);
//     }
//   };

//   // --- GEMINI AI GENERATION LOGIC ---
//   const generateWithAI = async () => {
//     if (!selectedCourseId || selectedSections.length === 0) return;
//     setStatus({ type: 'loading', text: 'Consulting AI for optimal schedule...' });

//     try {
//       // 1. Gather Context
//       const course = courses.find(c => c.id === selectedCourseId);
      
//       // Get Global Busy Slots (Teachers occupied in OTHER sections)
//       // Note: We get ALL timetables for this institution to ensure no double-booking across sections
//       const qSchedule = query(collection(db, "timetables"), where("institutionName", "==", userData.institutionName));
//       const allSchedulesSnap = await getDocs(qSchedule);
      
//       // Create a map of TeacherID -> [Slots occupied]
//       // IMPORTANT: Exclude the sections we are currently re-generating
//       const teacherBusyMap = {};
//       allSchedulesSnap.docs.forEach(doc => {
//         const data = doc.data();
//         // If this record belongs to a section NOT in our current selection, it's a constraint
//         if (!selectedSections.includes(data.sectionId)) {
//           if (!teacherBusyMap[data.teacherId]) teacherBusyMap[data.teacherId] = [];
//           teacherBusyMap[data.teacherId].push(data.slot);
//         }
//       });

//       // 2. Construct Prompt
//       const promptData = {
//         sections: selectedSections, // IDs only
//         slotsPerDay: SLOTS,
//         subjects: course.subjects,
//         allocations: allocations, // Subject -> TeacherID
//         teacherConstraints: teacherBusyMap // TeacherID -> [Busy Slots]
//       };

//       // --- PROMPT WITH NEW "ONE LECTURE PER TEACHER" RULE ---
//       const prompt = `
//         You are a University Timetable Scheduler. 
//         Generate a JSON schedule for the provided sections.
        
//         Strict Rules:
//         1. Output ONLY a valid JSON array of objects.
//         2. Format: [{"sectionId": "...", "slot": 0-7, "subject": "...", "teacherId": "..."}]
//         3. 'teacherConstraints' lists slots where a teacher is ALREADY busy. Do NOT assign them to these slots.
//         4. Do NOT assign the same teacher to multiple sections at the same slot.
//         5. Fill all slots (0 to ${SLOTS-1}) for every section.
//         6. **ONE LECTURE LIMIT:** In any single section, a specific 'teacherId' must NOT appear more than once. 
//            *Exception:* If the total number of slots (${SLOTS}) is greater than the number of unique teachers available for this course, you are allowed to repeat teachers just enough to fill the remaining slots, but try to space them out.
        
//         Input Data:
//         ${JSON.stringify(promptData)}
//       `;

//       // 3. Call Gemini API
//       // Using gemini-2.0-flash (or gemini-1.5-flash) with JSON response enforced
//       const model = genAI.getGenerativeModel({ 
//         model: "gemini-2.0-flash", // Use "gemini-1.5-flash" if 2.0 is not available in your region
//         generationConfig: { responseMimeType: "application/json" } 
//       });

//       const result = await model.generateContent(prompt);
//       const response = await result.response;
//       const text = response.text();
      
//       // Parse JSON directly
//       const generatedSchedule = JSON.parse(text);

//       // 4. Save to Firestore
//       const batch = writeBatch(db);

//       // First, delete OLD records for these sections
//       const oldQuery = query(collection(db, "timetables"), where("institutionName", "==", userData.institutionName));
//       const oldDocs = await getDocs(oldQuery);
      
//       oldDocs.forEach(doc => {
//         if (selectedSections.includes(doc.data().sectionId)) {
//           batch.delete(doc.ref);
//         }
//       });

//       // Add NEW records
//       let count = 0;
//       generatedSchedule.forEach(item => {
//         const newDocRef = doc(collection(db, "timetables"));
//         batch.set(newDocRef, {
//           sectionId: item.sectionId,
//           courseId: selectedCourseId,
//           slot: item.slot,
//           teacherId: item.teacherId,
//           subject: item.subject,
//           institutionName: userData.institutionName
//         });
//         count++;
//       });

//       await batch.commit();
//       setStatus({ type: 'success', text: `AI successfully generated ${count} lecture slots. (Rule enforced: 1 lecture per teacher/section)` });

//     } catch (e) {
//       console.error(e);
//       let errorMsg = 'AI Generation Failed.';
//       if (e.message.includes('404')) errorMsg = 'Model not found. Please check API Key or Model Name in code.';
//       setStatus({ type: 'error', text: errorMsg });
//     }
//   };

//   const currentCourse = courses.find(c => c.id === selectedCourseId);
//   const relevantSections = sections.filter(s => s.courseId === selectedCourseId);

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-md space-y-8">
//       <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
//         <Sparkles className="text-indigo-600"/> AI Scheduler Generator
//       </h2>
      
//       <div>
//         <h3 className="font-bold text-gray-700 mb-2">1. Select Course</h3>
//         <select 
//           className="border p-3 w-full rounded-lg bg-gray-50 outline-none" 
//           onChange={(e) => handleCourseSelect(e.target.value)} 
//           value={selectedCourseId}
//         >
//           <option value="">-- Select Course --</option>
//           {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//         </select>
//       </div>

//       {currentCourse && (
//         <>
//           <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
//             <h3 className="font-bold text-indigo-900 mb-4">2. Map Subjects to Teachers</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {currentCourse.subjects.map(sub => (
//                 <div key={sub} className="flex items-center gap-2 bg-white p-2 rounded shadow-sm">
//                   <span className="w-1/3 text-sm font-bold text-gray-600 px-2">{sub}</span>
//                   <select 
//                     className="border p-2 rounded w-2/3 text-sm"
//                     onChange={(e) => setAllocations({...allocations, [sub]: e.target.value})}
//                   >
//                     <option value="">Select Teacher</option>
//                     {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
//                   </select>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div>
//             <h3 className="font-bold text-gray-700 mb-2">3. Select Sections (Batch)</h3>
//             <div className="flex gap-3 flex-wrap">
//               {relevantSections.length > 0 ? relevantSections.map(s => (
//                 <button 
//                   key={s.id}
//                   onClick={() => toggleSection(s.id)}
//                   className={`px-4 py-2 rounded-full border transition ${
//                     selectedSections.includes(s.id) 
//                       ? 'bg-indigo-600 text-white border-indigo-600 shadow' 
//                       : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
//                   }`}
//                 >
//                   {s.name}
//                 </button>
//               )) : <p className="text-red-500 italic">No sections found.</p>}
//             </div>
//           </div>

//           <button 
//             onClick={generateWithAI}
//             disabled={selectedSections.length === 0 || status?.type === 'loading'}
//             className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition flex justify-center items-center gap-2"
//           >
//              {status?.type === 'loading' ? <><RefreshCw className="animate-spin"/> AI is thinking...</> : <><Sparkles size={20}/> Generate Optimized Schedule</>}
//           </button>
          
//           {status && (
//             <div className={`p-4 rounded-lg flex items-center gap-3 ${
//               status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
//               status.type === 'loading' ? 'bg-indigo-50 text-indigo-800' :
//               'bg-red-50 text-red-800 border border-red-200'
//             }`}>
//               {status.type === 'success' ? <CheckCircle /> : status.type === 'loading' ? <Sparkles className="animate-pulse"/> : <AlertCircle />}
//               {status.text}
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// // --- STUDENT PANEL (Unchanged) ---
// const StudentPanel = ({ userData }) => {
//   const [sections, setSections] = useState([]);
//   const [selectedSectionId, setSelectedSectionId] = useState('');
//   const [timetable, setTimetable] = useState([]);
//   const [teachers, setTeachers] = useState({}); 

//   useEffect(() => {
//     const init = async () => {
//       const qS = query(collection(db, "sections"), where("institutionName", "==", userData.institutionName));
//       const s = await getDocs(qS);
//       setSections(s.docs.map(d => ({...d.data(), id: d.id})));
//       const qT = query(collection(db, "teachers"), where("institutionName", "==", userData.institutionName));
//       const t = await getDocs(qT);
//       const tMap = {}; t.docs.forEach(d => tMap[d.id] = d.data().name);
//       setTeachers(tMap);
//     };
//     init();
//   }, [userData]);

//   useEffect(() => {
//     if(!selectedSectionId) return;
//     const loadTT = async () => {
//       const q = query(collection(db, "timetables"), where("sectionId", "==", selectedSectionId));
//       const snap = await getDocs(q);
//       const data = snap.docs.map(d => d.data());
//       data.sort((a,b) => a.slot - b.slot);
//       setTimetable(data);
//     };
//     loadTT();
//   }, [selectedSectionId]);

//   const getTime = (slot) => {
//     const startMin = (TIME_START * 60) + (slot * 40);
//     const endMin = startMin + 40;
//     const format = (m) => {
//       const h = Math.floor(m / 60); const min = m % 60; const ampm = h >= 12 ? 'PM' : 'AM';
//       const h12 = h > 12 ? h-12 : h; return `${h12}:${min.toString().padStart(2,'0')} ${ampm}`;
//     };
//     return `${format(startMin)} - ${format(endMin)}`;
//   };

//   return (
//     <div className="max-w-3xl mx-auto space-y-6">
//       <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-emerald-500">
//         <label className="block font-bold mb-3 text-gray-700">Find Your Class Schedule</label>
//         <select className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 outline-none" onChange={e => setSelectedSectionId(e.target.value)}>
//           <option value="">-- Select Class & Section --</option>
//           {sections.map(s => <option key={s.id} value={s.id}>{s.courseName} - {s.name}</option>)}
//         </select>
//       </div>
//       {selectedSectionId && (
//         <div className="bg-white shadow-lg rounded-xl overflow-hidden animate-in slide-in-from-bottom-5">
//           <div className="bg-emerald-600 text-white p-4 flex justify-between items-center">
//              <span className="font-bold text-lg"><Calendar className="inline mr-2"/> Daily Schedule</span>
//              <span className="text-sm bg-emerald-700 px-2 py-1 rounded">{sections.find(s=>s.id === selectedSectionId)?.courseName}</span>
//           </div>
//           <div className="divide-y divide-gray-100">
//             {Array.from({length: SLOTS}).map((_, index) => {
//               const entry = timetable.find(t => t.slot === index);
//               return (
//                 <div key={index} className="flex p-4 hover:bg-gray-50 transition-colors">
//                   <div className="w-1/3 md:w-1/4 text-gray-500 text-sm font-mono flex items-center border-r border-gray-100 pr-4">{getTime(index)}</div>
//                   <div className="w-2/3 md:w-3/4 pl-4">
//                     {entry ? (
//                       <div>
//                         <div className="font-bold text-gray-800 text-lg">{entry.subject}</div>
//                         <div className="text-sm text-emerald-600 font-semibold flex items-center gap-1"><UserCircle size={14}/> {teachers[entry.teacherId] || 'Unknown Teacher'}</div>
//                       </div>
//                     ) : <span className="text-gray-300 italic flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gray-300"></span> Free Period</span>}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };