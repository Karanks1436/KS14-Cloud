import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Users,
  GraduationCap,
  School,
  Trash2,
  PauseCircle,
  ShieldAlert,
  CheckCircle,
} from "lucide-react";

export default function Admin() {
  const navigate = useNavigate();
  const [roleFilter, setRoleFilter] = useState("student");
  const [users, setUsers] = useState([]);

  /* 🔄 Fetch Users by Role */
  useEffect(() => {
    const q = query(
      collection(db, "users"),
      where("role", "==", roleFilter)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(list);
    });

    return () => unsub();
  }, [roleFilter]);

  /* 🔐 Logout */
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  /* 🛠️ Update Status */
  const updateStatus = async (uid, status) => {
    await updateDoc(doc(db, "users", uid), { status });
  };

  /* ❌ Delete User */
  const deleteUser = async (uid) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    await deleteDoc(doc(db, "users", uid));
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* 🧭 NAVBAR */}
      <nav className="bg-black text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold flex gap-2 items-center">
          <ShieldAlert /> Admin Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-lg"
        >
          <LogOut size={18} /> Logout
        </button>
      </nav>

      {/* 🔘 FILTER TABS */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => setRoleFilter("student")}
          className={`px-6 py-2 rounded-lg flex gap-2 items-center ${
            roleFilter === "student"
              ? "bg-emerald-600 text-white"
              : "bg-white border"
          }`}
        >
          <GraduationCap /> Students
        </button>

        <button
          onClick={() => setRoleFilter("teacher")}
          className={`px-6 py-2 rounded-lg flex gap-2 items-center ${
            roleFilter === "teacher"
              ? "bg-indigo-600 text-white"
              : "bg-white border"
          }`}
        >
          <School /> Teachers
        </button>
      </div>

      {/* 📋 USER LIST */}
      <div className="max-w-6xl mx-auto mt-8 p-4 grid md:grid-cols-2 gap-4">
        {users.length === 0 && (
          <p className="text-center col-span-2 text-gray-500">
            No users found
          </p>
        )}

        {users.map((u) => (
          <div
            key={u.uid}
            className="bg-white rounded-xl shadow p-5 flex flex-col gap-3"
          >
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold text-lg">{u.name}</h3>
                <p className="text-sm text-gray-500">{u.email}</p>
                <p className="text-sm text-gray-500">{u.mobile}</p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  u.status === "active"
                    ? "bg-green-100 text-green-700"
                    : u.status === "paused"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {u.status || "active"}
              </span>
            </div>

            {/* ⚙️ ACTIONS */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => updateStatus(u.uid, "active")}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg flex justify-center gap-2"
              >
                <CheckCircle size={16} /> Activate
              </button>

              <button
                onClick={() => updateStatus(u.uid, "paused")}
                className="flex-1 bg-yellow-500 text-white py-2 rounded-lg flex justify-center gap-2"
              >
                <PauseCircle size={16} /> Pause
              </button>

              <button
                onClick={() => updateStatus(u.uid, "blocked")}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg flex justify-center gap-2"
              >
                <ShieldAlert size={16} /> Block
              </button>

              <button
                onClick={() => deleteUser(u.uid)}
                className="bg-gray-800 text-white px-3 rounded-lg"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
