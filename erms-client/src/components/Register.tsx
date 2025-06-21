import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import type { RegisterData } from '../services/authService';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  role: 'engineer' | 'manager';
  skills: string[];
  seniority: 'junior' | 'mid' | 'senior';
  maxCapacity: number;
  department: string;
}

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'engineer',
    skills: [],
    seniority: 'junior',
    maxCapacity: 100,
    department: 'Engineering'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [skillInput, setSkillInput] = useState('');

  const availableSkills = [
    'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#',
    'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Scala', 'Docker', 'Kubernetes',
    'AWS', 'Azure', 'GCP', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'GraphQL',
    'REST API', 'Microservices', 'CI/CD', 'DevOps', 'Machine Learning', 'AI',
    'Data Science', 'Frontend', 'Backend', 'Full Stack', 'Mobile Development',
    'UI/UX Design', 'Product Management', 'Agile', 'Scrum'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillAdd = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const registerData: RegisterData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        skills: formData.skills,
        seniority: formData.seniority,
        maxCapacity: formData.maxCapacity,
        department: formData.department
      };

      const res = await authService.register(registerData);
      if (res.user.role === "manager") {
        navigate("/manager-dashboard");
      } else if (res.user.role === "engineer") {
        navigate("/engineer-dashboard");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-gray-600">
              Join the Engineering Resource Management System
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            {/* Role and Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="engineer">Engineer</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Engineering, Product, Design"
                />
              </div>
            </div>

            {/* Engineer-specific fields */}
            {formData.role === 'engineer' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="seniority" className="block text-sm font-medium text-gray-700 mb-2">
                      Seniority Level
                    </label>
                    <select
                      id="seniority"
                      name="seniority"
                      value={formData.seniority}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="junior">Junior</option>
                      <option value="mid">Mid-level</option>
                      <option value="senior">Senior</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="maxCapacity" className="block text-sm font-medium text-gray-700 mb-2">
                      Max Capacity (%)
                    </label>
                    <select
                      id="maxCapacity"
                      name="maxCapacity"
                      value={formData.maxCapacity}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value={100}>100% (Full-time)</option>
                      <option value={50}>50% (Part-time)</option>
                      <option value={75}>75%</option>
                      <option value={25}>25%</option>
                    </select>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSkillAdd())}
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
                  
                  {/* Selected Skills */}
                  {formData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleSkillRemove(skill)}
                            className="ml-2 text-indigo-600 hover:text-indigo-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Available Skills */}
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">Popular skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {availableSkills.slice(0, 10).map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => {
                            if (!formData.skills.includes(skill)) {
                              setFormData(prev => ({
                                ...prev,
                                skills: [...prev.skills, skill]
                              }));
                            }
                          }}
                          disabled={formData.skills.includes(skill)}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 