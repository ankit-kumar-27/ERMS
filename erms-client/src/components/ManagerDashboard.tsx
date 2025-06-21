import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import CapacityBar from "./CapacityBar";
import SkillTags from "./SkillTags";
import { useAuth } from "../contexts/AuthContext";
import projectService from "../services/projectService";
import { useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getAllEngineers, getEngineerCapacity } from "../services/authService";
import { createAssignment, fetchAssignments } from "../services/projectService";

// Define Project type for API response
interface Project {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  requiredSkills: string[];
  teamSize: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  managerId: number;
  Manager?: {
    name: string;
    email: string;
  };
}

// Define type for project creation form
interface ProjectCreate {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  requiredSkills: string;
  teamSize: number | string;
  status: string;
}

const mockProjects = [
  {
    id: 1,
    name: "Project Alpha",
    requiredSkills: ["React", "Node.js"],
  },
  {
    id: 2,
    name: "Project Beta",
    requiredSkills: ["Python", "AWS"],
  },
];

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("team");
  const [assignment, setAssignment] = useState({
    engineerId: mockProjects[0].id,
    projectId: mockProjects[0].id,
    percent: 50,
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState("");
  const [newProject, setNewProject] = useState({
    name: "",
    requiredSkills: "",
  });
  const { user, loading: profileLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProjectCreate>();
  const [engineers, setEngineers] = useState<any[]>([]);
  const [engineersLoading, setEngineersLoading] = useState(false);
  const [engineersError, setEngineersError] = useState("");
  const [engineerCapacities, setEngineerCapacities] = useState<Record<number, { totalAllocated: number; availableCapacity: number; maxCapacity: number; }> >({});
  const [engineerSearch, setEngineerSearch] = useState("");
  const { register: registerAssign, handleSubmit: handleSubmitAssign, reset: resetAssign, formState: { errors: errorsAssign, isSubmitting: isSubmittingAssign } } = useForm();
  const [assignStartDate, setAssignStartDate] = useState<Date | null>(null);
  const [assignEndDate, setAssignEndDate] = useState<Date | null>(null);
  const [assignSuccess, setAssignSuccess] = useState("");
  const [assignError, setAssignError] = useState("");
  const [assignments, setAssignments] = useState<any[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignmentsError, setAssignmentsError] = useState("");
  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [assignmentStatusFilter, setAssignmentStatusFilter] = useState("All");
  const [showAddAssignmentDialog, setShowAddAssignmentDialog] = useState(false);

  // useEffect(() => {
  //   fetchProfile();
  //   // eslint-disable-next-line
  // }, []);
  console.log("user", user);
  console.log("profileLoading", profileLoading);

  useEffect(() => {
    if (tab === "projects" || tab === "assign") {
      setProjectsLoading(true);
      setProjectsError("");
      projectService
        .fetchProjects()
        .then((data) => setProjects(data))
        .catch((err) => setProjectsError("Failed to load projects."))
        .finally(() => setProjectsLoading(false));
    }
    if (tab === "team") {
      setEngineersLoading(true);
      setEngineersError("");
      getAllEngineers()
        .then(async (data) => {
          setEngineers(data);
          // Fetch capacity for each engineer
          const capacities: Record<number, { totalAllocated: number; availableCapacity: number; maxCapacity: number; }> = {};
          await Promise.all(
            data.map(async (eng: any) => {
              try {
                const cap = await getEngineerCapacity(eng.id);
                capacities[eng.id] = {
                  totalAllocated: cap.totalAllocated,
                  availableCapacity: cap.availableCapacity,
                  maxCapacity: cap.engineer.maxCapacity,
                };
              } catch {
                capacities[eng.id] = { totalAllocated: 0, availableCapacity: eng.maxCapacity, maxCapacity: eng.maxCapacity };
              }
            })
          );
          setEngineerCapacities(capacities);
        })
        .catch(() => setEngineersError("Failed to load engineers."))
        .finally(() => setEngineersLoading(false));
    }
    if (tab === "assign") {
      setAssignmentsLoading(true);
      setAssignmentsError("");
      fetchAssignments()
        .then((data) => setAssignments(data))
        .catch(() => setAssignmentsError("Failed to load assignments."))
        .finally(() => setAssignmentsLoading(false));
    }
    // eslint-disable-next-line
  }, [tab]);

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  // Filtered projects for display
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered engineers for display
  const filteredEngineers = engineers.filter((eng) => {
    const nameMatch = eng.name.toLowerCase().includes(engineerSearch.toLowerCase());
    const skillsMatch = Array.isArray(eng.skills) && eng.skills.some((skill: string) => skill.toLowerCase().includes(engineerSearch.toLowerCase()));
    return nameMatch || skillsMatch;
  });

  // Filtered assignments for display
  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.Engineer?.name.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
      a.Project?.name.toLowerCase().includes(assignmentSearch.toLowerCase());
    const matchesStatus = assignmentStatusFilter === "All" || a.Project?.status === assignmentStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddProject = async (data: ProjectCreate) => {
    try {
      const payload = {
        ...data,
        startDate: startDate ? startDate.toISOString().split('T')[0] : '',
        endDate: endDate ? endDate.toISOString().split('T')[0] : '',
        requiredSkills: data.requiredSkills.split(',').map((s: string) => s.trim()).filter(Boolean),
        teamSize: Number(data.teamSize),
      };
      await projectService.createProject(payload);
      setShowAddDialog(false);
      reset();
      setStartDate(null);
      setEndDate(null);
      // Refresh project list
      setProjectsLoading(true);
      setProjectsError("");
      projectService.fetchProjects()
        .then((data) => setProjects(data))
        .catch((err) => setProjectsError("Failed to load projects."))
        .finally(() => setProjectsLoading(false));
    } catch (err) {
      alert("Failed to add project.");
    }
  };

  const handleCreateAssignment = async (data: any) => {
    setAssignSuccess("");
    setAssignError("");
    try {
      if (!assignStartDate || !assignEndDate) {
        setAssignError("Start and end date are required.");
        return;
      }
      const payload = {
        engineerId: data.engineerId,
        projectId: data.projectId,
        allocationPercentage: Number(data.percent),
        startDate: assignStartDate.toISOString().split('T')[0],
        endDate: assignEndDate.toISOString().split('T')[0],
        role: data.role || "Developer",
      };
      await createAssignment(payload);
      setAssignSuccess("Assignment created successfully!");
      resetAssign();
      setAssignStartDate(null);
      setAssignEndDate(null);
    } catch (err: any) {
      setAssignError(err?.response?.data?.message || "Failed to create assignment.");
    }
  };

  // Before Team Overview return block
  if (tab === "team") {
    console.log("engineers", engineers);
    console.log("engineersLoading", engineersLoading);
    console.log("engineersError", engineersError);
    console.log("engineerCapacities", engineerCapacities);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Manager Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome, manager! Here you can manage engineers, projects, and
                resources.
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
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex gap-4">
          <button
            className={`px-4 py-2 rounded-md font-medium ${
              tab === "team"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setTab("team")}
          >
            Team Overview
          </button>
          <button
            className={`px-4 py-2 rounded-md font-medium ${
              tab === "assign"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setTab("assign")}
          >
            Create Assignment
          </button>
          <button
            className={`px-4 py-2 rounded-md font-medium ${
              tab === "projects"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setTab("projects")}
          >
            Project Management
          </button>
          <button
            className={`px-4 py-2 rounded-md font-medium ${
              tab === "profile"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setTab("profile")}
          >
            My Profile
          </button>
        </div>
        {/* Team Overview */}
        {tab === "team" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Team Overview
            </h2>
            {/* Engineer Search Field */}
            <div className="mb-4">
              <input
                type="text"
                className="border rounded px-3 py-2 w-full md:w-1/2"
                placeholder="Search engineers by name or skill..."
                value={engineerSearch}
                onChange={e => setEngineerSearch(e.target.value)}
              />
            </div>
            {engineersLoading ? (
              <div>Loading engineers...</div>
            ) : engineersError ? (
              <div className="text-red-500">{engineersError}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEngineers.map((eng) => (
                  <div
                    key={eng.id}
                    className="bg-white rounded-lg shadow p-4 flex flex-col gap-2"
                  >
                    <div className="font-bold text-gray-900">{eng.name}</div>
                    <div className="text-sm text-gray-600 mb-1">
                      Department: {eng.department}
                    </div>
                    <SkillTags skills={eng.skills} />
                    <div className="mt-2">
                      <CapacityBar
                        value={
                          engineerCapacities[eng.id]?.maxCapacity
                            ? Math.round((engineerCapacities[eng.id].totalAllocated / engineerCapacities[eng.id].maxCapacity) * 100)
                            : 0
                        }
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Allocated: {engineerCapacities[eng.id]?.totalAllocated || 0}% / Max: {engineerCapacities[eng.id]?.maxCapacity || eng.maxCapacity}%
                      </div>
                      <div className="text-xs text-gray-500">
                        Available: {engineerCapacities[eng.id]?.availableCapacity ?? eng.maxCapacity}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Create Assignment */}
        {tab === "assign" && (
          <div className="space-y-8">
            {/* Assignments List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                All Assignments
              </h2>
              {/* Add Assignment Button */}
              <div className="flex justify-end mb-4">
                <button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-medium"
                  onClick={() => setShowAddAssignmentDialog(true)}
                >
                  + Add Assignment
                </button>
              </div>
              {/* Search and Filter Controls */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <input
                  type="text"
                  className="border rounded px-3 py-2 w-full md:w-1/2"
                  placeholder="Search by engineer or project name..."
                  value={assignmentSearch}
                  onChange={e => setAssignmentSearch(e.target.value)}
                />
                <select
                  className="border rounded px-3 py-2 w-full md:w-48"
                  value={assignmentStatusFilter}
                  onChange={e => setAssignmentStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              {assignmentsLoading ? (
                <div>Loading assignments...</div>
              ) : assignmentsError ? (
                <div className="text-red-500">{assignmentsError}</div>
              ) : filteredAssignments.length === 0 ? (
                <div>No assignments found.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredAssignments.map((a) => (
                    <div
                      key={a.id}
                      className="bg-gray-50 rounded-xl shadow p-5 flex flex-col gap-2 border border-gray-100"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-lg text-indigo-700">
                          {a.Engineer?.name ?? "Unknown Engineer"}
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            a.Project?.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : a.Project?.status === "active"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {a.Project?.status ?? "Unknown"}
                        </span>
                      </div>
                      <div className="text-gray-600 text-sm mb-1">
                        Project: {a.Project?.name ?? "Unknown Project"}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-1">
                        <span className="text-xs text-gray-500">
                          Allocation: {a.allocationPercentage}%
                        </span>
                        <span className="text-xs text-gray-500">
                          Start: {a.startDate ? new Date(a.startDate).toLocaleDateString() : "-"}
                        </span>
                        <span className="text-xs text-gray-500">
                          End: {a.endDate ? new Date(a.endDate).toLocaleDateString() : "-"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center text-xs text-gray-500 mt-2">
                        <span>Engineer: {a.Engineer?.name ?? "-"}</span>
                        <span>({a.Engineer?.email ?? "-"})</span>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center text-xs text-gray-400 mt-1">
                        <span>Role: {a.role ?? "Developer"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Add Assignment Dialog */}
            {showAddAssignmentDialog && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
                    onClick={() => setShowAddAssignmentDialog(false)}
                    disabled={isSubmittingAssign}
                  >
                    &times;
                  </button>
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Create Assignment</h3>
                  <form className="space-y-4" onSubmit={handleSubmitAssign(handleCreateAssignment)}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Engineer
                      </label>
                      <select
                        className="w-full border rounded px-3 py-2"
                        {...registerAssign("engineerId", { required: true })}
                      >
                        <option value="">Select engineer</option>
                        {engineers.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.name}
                          </option>
                        ))}
                      </select>
                      {errorsAssign.engineerId && <span className="text-red-500 text-xs">Engineer is required</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project
                      </label>
                      <select
                        className="w-full border rounded px-3 py-2"
                        {...registerAssign("projectId", { required: true })}
                      >
                        <option value="">Select project</option>
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      {errorsAssign.projectId && <span className="text-red-500 text-xs">Project is required</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Allocation (%)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        className="w-full border rounded px-3 py-2"
                        {...registerAssign("percent", { required: true, min: 1, max: 100 })}
                      />
                      {errorsAssign.percent && <span className="text-red-500 text-xs">Allocation must be 1-100%</span>}
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-1 text-gray-700">Start Date</label>
                        <DatePicker
                          selected={assignStartDate}
                          onChange={date => setAssignStartDate(date)}
                          className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                          dateFormat="yyyy-MM-dd"
                          placeholderText="Select start date"
                          wrapperClassName="w-full"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-1 text-gray-700">End Date</label>
                        <DatePicker
                          selected={assignEndDate}
                          onChange={date => setAssignEndDate(date)}
                          className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                          dateFormat="yyyy-MM-dd"
                          placeholderText="Select end date"
                          wrapperClassName="w-full"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role (optional)
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2"
                        placeholder="Developer"
                        {...registerAssign("role")}
                      />
                    </div>
                    {assignError && <div className="text-red-500 text-sm">{assignError}</div>}
                    {assignSuccess && <div className="text-green-600 text-sm">{assignSuccess}</div>}
                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded font-medium mt-2 disabled:opacity-60"
                      disabled={isSubmittingAssign}
                    >
                      {isSubmittingAssign ? "Assigning..." : "Assign Engineer"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Project Management */}
        {tab === "projects" && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Projects
              </h2>
              {/* Add Project Button */}
              <div className="flex justify-end mb-4">
                <button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-medium"
                  onClick={() => setShowAddDialog(true)}
                >
                  + Add Project
                </button>
              </div>
              {/* Search and Filter Controls */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <input
                  type="text"
                  className="border rounded px-3 py-2 w-full md:w-1/2"
                  placeholder="Search by project name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="border rounded px-3 py-2 w-full md:w-48"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              {projectsLoading ? (
                <div>Loading projects...</div>
              ) : projectsError ? (
                <div className="text-red-500">{projectsError}</div>
              ) : filteredProjects.length === 0 ? (
                <div>No projects found.</div>
              ) : (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredProjects.map((p) => (
                    <li
                      key={p.id}
                      className="bg-gray-50 rounded-xl shadow p-5 flex flex-col gap-2 border border-gray-100"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-lg text-indigo-700">
                          {p.name}
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            p.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : p.status === "active"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                      <div className="text-gray-600 text-sm mb-1">
                        {p.description}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-1">
                        <span className="text-xs text-gray-500">
                          Start:{" "}
                          {p.startDate
                            ? new Date(p.startDate).toLocaleDateString()
                            : "-"}
                        </span>
                        <span className="text-xs text-gray-500">
                          End:{" "}
                          {p.endDate
                            ? new Date(p.endDate).toLocaleDateString()
                            : "-"}
                        </span>
                        <span className="text-xs text-gray-500">
                          Team Size: {p.teamSize}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="font-medium text-xs text-gray-700">
                          Skills:
                        </span>
                        {Array.isArray(p.requiredSkills) &&
                        p.requiredSkills.length > 0 ? (
                          p.requiredSkills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 items-center text-xs text-gray-500 mt-2">
                        <span>Manager: {p.Manager?.name ?? "-"}</span>
                        <span>({p.Manager?.email ?? "-"})</span>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center text-xs text-gray-400 mt-1">
                        <span>
                          Created:{" "}
                          {p.createdAt
                            ? new Date(p.createdAt).toLocaleString()
                            : "-"}
                        </span>
                        <span>
                          Updated:{" "}
                          {p.updatedAt
                            ? new Date(p.updatedAt).toLocaleString()
                            : "-"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Add Project Dialog */}
            {showAddDialog && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
                    onClick={() => setShowAddDialog(false)}
                    disabled={isSubmitting}
                  >
                    &times;
                  </button>
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Add Project</h3>
                  <form onSubmit={handleSubmit(handleAddProject)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-800">Project Name</label>
                      <input className="w-full border rounded px-3 py-2 text-gray-900 bg-white" {...register("name", { required: true })} />
                      {errors.name && <span className="text-red-500 text-xs">Name is required</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-800">Description</label>
                      <textarea className="w-full border rounded px-3 py-2 text-gray-900 bg-white" {...register("description", { required: true })} />
                      {errors.description && <span className="text-red-500 text-xs">Description is required</span>}
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-1 text-gray-800">Start Date</label>
                        <DatePicker
                          selected={startDate}
                          onChange={date => setStartDate(date)}
                          className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                          dateFormat="yyyy-MM-dd"
                          placeholderText="Select start date"
                          wrapperClassName="w-full"
                        />
                        {errors.startDate && <span className="text-red-500 text-xs">Start date is required</span>}
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-1 text-gray-800">End Date</label>
                        <DatePicker
                          selected={endDate}
                          onChange={date => setEndDate(date)}
                          className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                          dateFormat="yyyy-MM-dd"
                          placeholderText="Select end date"
                          wrapperClassName="w-full"
                        />
                        {errors.endDate && <span className="text-red-500 text-xs">End date is required</span>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-800">Required Skills (comma separated)</label>
                      <input className="w-full border rounded px-3 py-2 text-gray-900 bg-white" {...register("requiredSkills")} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-800">Team Size</label>
                      <input type="number" min={1} className="w-full border rounded px-3 py-2 text-gray-900 bg-white" {...register("teamSize", { required: true, min: 1 })} />
                      {errors.teamSize && <span className="text-red-500 text-xs">Team size is required and must be at least 1</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-800">Status</label>
                      <select className="w-full border rounded px-3 py-2 text-gray-900 bg-white" {...register("status")}> 
                        <option value="planning">Planning</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded font-medium mt-2 disabled:opacity-60"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Adding..." : "Add Project"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
        {tab === "profile" && (
          <div className="flex justify-center items-start min-h-[60vh]">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100">
              <div className="flex flex-col items-center mb-6">
                {/* Avatar with initials */}
                <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-600 mb-3 shadow">
                  {user?.name
                    ? user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "M"}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {user?.name ?? "-"}
                </div>
                <div className="text-indigo-600 font-medium capitalize mt-1 flex items-center gap-1">
                  <svg
                    className="w-5 h-5 text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  {user?.role ?? "-"}
                </div>
              </div>
              <div className="space-y-4 text-gray-700">
                {/* <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  <span className="font-medium">ID:</span> {user?.id ?? "-"}
                </div> */}
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 12h2a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2h2"
                    />
                  </svg>
                  <span className="font-medium">Email:</span>{" "}
                  {user?.email ?? "-"}
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.75 17L9 21m5.25-4l.75 4M4 4v16c0 1.1.9 2 2 2h12a2 2 0 002-2V4"
                    />
                  </svg>
                  <span className="font-medium">Department:</span>{" "}
                  {user?.department ?? "-"}
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8c-1.657 0-3 1.343-3 3v1a3 3 0 006 0v-1c0-1.657-1.343-3-3-3z"
                    />
                  </svg>
                  <span className="font-medium">Seniority:</span>{" "}
                  {user?.seniority ?? "-"}
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3"
                    />
                  </svg>
                  <span className="font-medium">Max Capacity:</span>{" "}
                  {user?.maxCapacity ? `${user.maxCapacity}%` : "-"}
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span className="font-medium">Skills:</span>{" "}
                  {Array.isArray(user?.skills) && user.skills.length > 0
                    ? user.skills.join(", ")
                    : "-"}
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="font-medium">Created At:</span>{" "}
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleString()
                    : "-"}
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="font-medium">Updated At:</span>{" "}
                  {user?.updatedAt
                    ? new Date(user.updatedAt).toLocaleString()
                    : "-"}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManagerDashboard;
