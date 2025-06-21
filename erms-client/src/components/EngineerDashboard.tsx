import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import SkillTags from "./SkillTags";
import AssignmentTimeline from "./AssignmentTimeline";
import api from "../config/api";
import { useAuth } from "../contexts/AuthContext";

const EngineerDashboard = () => {
  const navigate = useNavigate();
  const { user, setUser, loading: profileLoading, fetchProfile } = useAuth();
  const [tab, setTab] = useState("assignments");
  const [skillInput, setSkillInput] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [editSeniority, setEditSeniority] = useState<string>("");
  const [editMaxCapacity, setEditMaxCapacity] = useState<number>(100);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  useEffect(() => {
    if (user) {
      setEditSkills(user.skills || []);
      setEditSeniority(user.seniority || "");
      setEditMaxCapacity(user.maxCapacity || 100);
    }
  }, [user]);

  const handleSkillAdd = () => {
    if (skillInput.trim() && !editSkills.includes(skillInput.trim())) {
      setEditSkills([...editSkills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleSkillRemove = (skill: string) => {
    setEditSkills(editSkills.filter((s) => s !== skill));
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaveError("");
    try {
      const res = await api.put(`/engineers/${user.id}`, {
        skills: editSkills,
        seniority: editSeniority,
        maxCapacity: editMaxCapacity,
      });
      setUser(res.data);
      sessionStorage.setItem("user", JSON.stringify(res.data));
    } catch (err: any) {
      setSaveError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (tab === "assignments") {
      setLoading(true);
      setError("");
      api.get("/projects")
        .then((res) => {
          setAssignments(res.data);
        })
        .catch((err) => {
          setError("Failed to load assignments.");
        })
        .finally(() => setLoading(false));
    }
  }, [tab]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Engineer Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome, engineer! Here you can view your assignments and update
                your profile.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex gap-4">
          <button
            className={`px-4 py-2 rounded-md font-medium ${tab === "assignments" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setTab("assignments")}
          >
            My Assignments
          </button>
          <button
            className={`px-4 py-2 rounded-md font-medium ${tab === "profile" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setTab("profile")}
          >
            Profile
          </button>
        </div>
        {/* My Assignments */}
        {tab === "assignments" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">My Assignments</h2>
            {loading ? (
              <div className="text-gray-500 text-sm">Loading...</div>
            ) : error ? (
              <div className="text-red-500 text-sm">{error}</div>
            ) : assignments.length === 0 ? (
              <div className="text-gray-500 text-sm">No assignments found.</div>
            ) : (
              <div className="space-y-6">
                {assignments.map((a: any) => (
                  <div key={a.id} className="border rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-bold text-lg text-gray-900">{a.name}</div>
                      <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">{a.status}</span>
                    </div>
                    <div className="text-gray-700 mb-2">{a.description}</div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                      <div><span className="font-medium">Start:</span> {new Date(a.startDate).toLocaleDateString()}</div>
                      <div><span className="font-medium">End:</span> {new Date(a.endDate).toLocaleDateString()}</div>
                      <div><span className="font-medium">Team Size:</span> {a.teamSize}</div>
                    </div>
                    <div className="mb-2">
                      <span className="font-medium text-sm">Required Skills:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {a.requiredSkills.map((skill: string, idx: number) => (
                          <span key={idx} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">{skill}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Manager:</span> {a.Manager?.name} ({a.Manager?.email})
                    </div>
                    <div className="text-xs text-gray-400">Created: {new Date(a.createdAt).toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Updated: {new Date(a.updatedAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Profile */}
        {tab === "profile" && (
          <div className="bg-white rounded-lg shadow p-6 max-w-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile</h2>
            {profileLoading ? (
              <div className="text-gray-500 text-sm">Loading profile...</div>
            ) : user ? (
              <form className="space-y-4" onSubmit={handleProfileSave}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={user.name}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={user.email}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={user.department || ""}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleSkillAdd())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Add a skill"
                    />
                    <button
                      type="button"
                      onClick={handleSkillAdd}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Add
                    </button>
                  </div>
                  <SkillTags skills={editSkills} />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editSkills.map((skill, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSkillRemove(skill)}
                        className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full hover:bg-red-200"
                      >
                        Remove {skill}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seniority</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={editSeniority}
                    onChange={e => setEditSeniority(e.target.value)}
                    required
                  >
                    <option value="">Select...</option>
                    <option value="junior">Junior</option>
                    <option value="mid">Mid</option>
                    <option value="senior">Senior</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Capacity</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={editMaxCapacity}
                    onChange={e => setEditMaxCapacity(Number(e.target.value))}
                    required
                  >
                    <option value={50}>50% (Part-time)</option>
                    <option value={100}>100% (Full-time)</option>
                  </select>
                </div>
                {saveError && <div className="text-red-500 text-sm">{saveError}</div>}
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded font-medium mt-2"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Update Profile"}
                </button>
              </form>
            ) : (
              <div className="text-red-500 text-sm">No profile found.</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default EngineerDashboard;
