// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // 1. Import hook for redirection
// import { auth, db } from './firebase';
// import { 
//   createUserWithEmailAndPassword, 
//   signInWithEmailAndPassword,
//   signOut // 2. Import signOut to force logout after signup
// } from 'firebase/auth';
// import { doc, setDoc } from 'firebase/firestore';
// import { 
//   Mail, Lock, User, Phone, Loader2, AlertCircle, 
//   School, GraduationCap, CheckCircle // Import Check icon
// } from 'lucide-react';

// export default function Auth() {
//   const navigate = useNavigate(); // Hook for navigation

//   const [isLogin, setIsLogin] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [successMsg, setSuccessMsg] = useState(''); // 3. State for success message

//   // Form States
//   const [role, setRole] = useState('student');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [name, setName] = useState('');
//   const [mobile, setMobile] = useState('');

//   const handleAuth = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     setSuccessMsg(''); // Clear previous success messages

//     try {
//       if (isLogin) {
//         // --- LOGIN LOGIC ---
//         await signInWithEmailAndPassword(auth, email, password);
        
//         // Redirect to /table after successful login
//         navigate('/table'); 
//       } else {
//         // --- SIGNUP LOGIC ---
//         // 1. Create User
//         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//         const user = userCredential.user;

//         // 2. Save Details to Firestore
//         await setDoc(doc(db, "users", user.uid), {
//           uid: user.uid,
//           name: name,
//           email: email,
//           mobile: mobile,
//           role: role,
//           createdAt: new Date()
//         });

//         // 3. Force Logout so they have to login manually
//         await signOut(auth);

//         // 4. Update UI
//         setSuccessMsg('Account created successfully! You can now login.');
//         setIsLogin(true); // Switch view to Login form
//         setPassword(''); // Clear password field for safety
//       }
//     } catch (err) {
//       console.error(err);
//       const msg = err.code.replace('auth/', '').replace(/-/g, ' ');
//       setError(msg.charAt(0).toUpperCase() + msg.slice(1));
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
//       <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        
//         {/* Header */}
//         <div className={`p-8 text-white text-center transition-colors ${role === 'teacher' ? 'bg-indigo-700' : 'bg-emerald-600'}`}>
//           <h2 className="text-3xl font-bold mb-2">
//             {isLogin ? 'Welcome Back' : 'Join Us'}
//           </h2>
//           <p className="opacity-90">
//             {isLogin ? 'Login to continue' : 'Create your account'}
//           </p>
//         </div>

//         {/* Role Selector */}
//         <div className="flex border-b">
//           <button 
//             type="button"
//             onClick={() => setRole('student')}
//             className={`flex-1 p-4 flex justify-center items-center gap-2 transition ${role === 'student' ? 'text-emerald-600 font-bold bg-emerald-50 border-b-2 border-emerald-600' : 'text-gray-400'}`}
//           >
//             <GraduationCap size={20} /> Student
//           </button>
//           <button 
//             type="button"
//             onClick={() => setRole('teacher')}
//             className={`flex-1 p-4 flex justify-center items-center gap-2 transition ${role === 'teacher' ? 'text-indigo-700 font-bold bg-indigo-50 border-b-2 border-indigo-700' : 'text-gray-400'}`}
//           >
//             <School size={20} /> Teacher
//           </button>
//         </div>

//         {/* Form */}
//         <div className="p-8">
//           <form onSubmit={handleAuth} className="space-y-5">
            
//             {/* ERROR ALERT */}
//             {error && (
//               <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
//                 <AlertCircle size={16} /> {error}
//               </div>
//             )}

//             {/* SUCCESS ALERT */}
//             {successMsg && (
//               <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm flex items-center gap-2 border border-green-200">
//                 <CheckCircle size={16} /> {successMsg}
//               </div>
//             )}

//             {/* Extra Fields for Signup */}
//             {!isLogin && (
//               <>
//                 <div>
//                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
//                   <div className="relative">
//                     <User className="absolute left-3 top-3 text-gray-400" size={18} />
//                     <input 
//                       type="text" required
//                       className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                       placeholder="John Doe"
//                       value={name} onChange={e => setName(e.target.value)}
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile Number</label>
//                   <div className="relative">
//                     <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
//                     <input 
//                       type="tel" required
//                       className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                       placeholder="9876543210"
//                       value={mobile} onChange={e => setMobile(e.target.value)}
//                     />
//                   </div>
//                 </div>
//               </>
//             )}

//             {/* Common Fields */}
//             <div>
//               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
//                 <input 
//                   type="email" required
//                   className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                   placeholder="user@college.edu"
//                   value={email} onChange={e => setEmail(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
//                 <input 
//                   type="password" required
//                   className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                   placeholder="••••••••"
//                   value={password} onChange={e => setPassword(e.target.value)}
//                 />
//               </div>
//             </div>

//             <button 
//               type="submit" 
//               disabled={loading}
//               className={`w-full text-white font-bold py-3 rounded-lg transition flex justify-center items-center gap-2 ${role === 'teacher' ? 'bg-indigo-700 hover:bg-indigo-800' : 'bg-emerald-600 hover:bg-emerald-700'}`}
//             >
//               {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Login' : 'Create Account')}
//             </button>
//           </form>

//           <div className="mt-6 text-center text-sm text-gray-600">
//             <button 
//               onClick={() => { 
//                 setIsLogin(!isLogin); 
//                 setError(''); 
//                 setSuccessMsg(''); // Clear success msg when switching tabs
//               }}
//               className="text-blue-600 font-bold hover:underline"
//             >
//               {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { 
  doc, setDoc, getDoc, collection, query, where, getDocs 
} from 'firebase/firestore';
import { 
  Mail, Lock, User, Phone, Loader2, AlertCircle, 
  School, GraduationCap, CheckCircle, Building, BookOpen 
} from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form States
  const [role, setRole] = useState('student');
  const [instType, setInstType] = useState('college'); // New: 'school' or 'college'
  const [instName, setInstName] = useState(''); // New: Name of institution
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');

  // 1. Check LocalStorage on Mount (Persistent Login)
  useEffect(() => {
    const checkUser = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        // Optional: You can verify validity here, but for now we trust local storage for speed
        navigate('/table');
      }
    };
    checkUser();
  }, [navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    // Normalize institution name for consistent searching
    const normalizedInstName = instName.trim().toLowerCase();

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch user details from Firestore to get Role and Institution info
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          
          // Save to LocalStorage
          localStorage.setItem('user', JSON.stringify(userData));
          
          navigate('/table');
        } else {
          setError("User data not found in database.");
        }

      } else {
        // --- SIGNUP LOGIC ---

        // 2. RESTRICTION: Check if a Teacher already exists for this Institution
        if (role === 'teacher') {
          const q = query(
            collection(db, "users"), 
            where("institutionName", "==", normalizedInstName),
            where("role", "==", "teacher")
          );
          
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            throw new Error(`A teacher is already registered for "${instName}". Only one teacher allowed per institution.`);
          }
        }

        // 3. Create User in Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userData = {
          uid: user.uid,
          name: name,
          email: email,
          mobile: mobile,
          role: role,
          institutionType: instType, // 'school' or 'college'
          institutionName: normalizedInstName, // Saved in lowercase for easier matching
          displayInstitutionName: instName, // Saved as typed for display
          createdAt: new Date()
        };

        // 4. Save Details to Firestore
        await setDoc(doc(db, "users", user.uid), userData);

        // 5. Force Logout (User must login to verify local storage flow)
        await signOut(auth);

        setSuccessMsg('Account created successfully! Please Login.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      console.error(err);
      let msg = err.message;
      if (err.code) {
        msg = err.code.replace('auth/', '').replace(/-/g, ' ');
      }
      // Clean up custom error message if it was thrown manually
      if (msg.includes("Firebase:")) msg = msg.replace("Firebase: ", "");
      setError(msg.charAt(0).toUpperCase() + msg.slice(1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className={`p-6 text-white text-center transition-colors ${role === 'teacher' ? 'bg-indigo-700' : 'bg-emerald-600'}`}>
          <h2 className="text-3xl font-bold mb-1">
            {isLogin ? 'Welcome Back' : 'Join Us'}
          </h2>
          <p className="opacity-90 text-sm">
            {isLogin ? 'Login to access your dashboard' : 'Create your academic account'}
          </p>
        </div>

        {/* Role Selector */}
        <div className="flex border-b">
          <button 
            type="button"
            onClick={() => setRole('student')}
            className={`flex-1 p-3 flex justify-center items-center gap-2 transition ${role === 'student' ? 'text-emerald-600 font-bold bg-emerald-50 border-b-2 border-emerald-600' : 'text-gray-400'}`}
          >
            <GraduationCap size={18} /> Student
          </button>
          <button 
            type="button"
            onClick={() => setRole('teacher')}
            className={`flex-1 p-3 flex justify-center items-center gap-2 transition ${role === 'teacher' ? 'text-indigo-700 font-bold bg-indigo-50 border-b-2 border-indigo-700' : 'text-gray-400'}`}
          >
            <School size={18} /> Teacher
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleAuth} className="space-y-4">
            
            {/* ERROR ALERT */}
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" /> 
                <span>{error}</span>
              </div>
            )}

            {/* SUCCESS ALERT */}
            {successMsg && (
              <div className="bg-green-50 text-green-700 p-3 rounded-lg text-xs flex items-center gap-2 border border-green-200">
                <CheckCircle size={16} /> {successMsg}
              </div>
            )}

            {/* --- INSTITUTION DETAILS (Needed for both Sign Up & Login context usually, but typically only Signup inputs these details. 
                For Login, we just need email/pass. However, if you want to restrict login by school name manually, you can add it. 
                Standard practice: Input only on Signup, auto-detect on Login via DB) --- */}
            
            {!isLogin && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                <p className="text-xs font-bold text-gray-500 uppercase">Institution Details</p>
                
                {/* Institution Type Selector */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setInstType('school')}
                    className={`flex-1 py-1 px-2 rounded text-sm border ${instType === 'school' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'border-transparent text-gray-500'}`}
                  >
                    School
                  </button>
                  <button
                    type="button"
                    onClick={() => setInstType('college')}
                    className={`flex-1 py-1 px-2 rounded text-sm border ${instType === 'college' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'border-transparent text-gray-500'}`}
                  >
                    College
                  </button>
                </div>

                {/* Institution Name Input */}
                <div className="relative">
                  {instType === 'school' ? (
                    <BookOpen className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  ) : (
                    <Building className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  )}
                  <input 
                    type="text" required
                    className="w-full pl-9 p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder={instType === 'school' ? "School Name (e.g. DPS Delhi)" : "College Name (e.g. IIT Bombay)"}
                    value={instName} onChange={e => setInstName(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* --- PERSONAL DETAILS (Signup Only) --- */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                  <input 
                    type="text" required
                    className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Full Name"
                    value={name} onChange={e => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile</label>
                  <input 
                    type="tel" required
                    className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Mobile"
                    value={mobile} onChange={e => setMobile(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* --- CREDENTIALS (Login & Signup) --- */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                  type="email" required
                  className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="user@example.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                  type="password" required
                  className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full text-white font-bold py-3 rounded-lg transition flex justify-center items-center gap-2 ${role === 'teacher' ? 'bg-indigo-700 hover:bg-indigo-800' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Login' : 'Create Account')}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            <button 
              onClick={() => { 
                setIsLogin(!isLogin); 
                setError(''); 
                setSuccessMsg('');
              }}
              className="text-blue-600 font-bold hover:underline"
            >
              {isLogin ? 'Register New Account' : 'Back to Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}