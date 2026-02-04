// src/pages/roles/RoleForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { AdminOnly } from "../../utils/permissions";
import axios from "../../api/axios";

const RoleForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [permissions, setPermissions] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    selectedPermissions: []
  });

  useEffect(() => {
    fetchPermissions();
    if (isEdit) {
      fetchRole();
    }
  }, [id]);

  const fetchPermissions = async () => {
    try {
      const response = await axios.get("/api/user/permissions");
      if (response.data) {
        setPermissions(response.data.permissions || response.data || []);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  const fetchRole = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/roles/${id}`);
      
      if (response.data) {
        const roleData = response.data.role || response.data;
        setFormData({
          name: roleData.name || "",
          description: roleData.description || "",
          selectedPermissions: roleData.Permissions?.map(p => p.id) || []
        });
      } else {
        setError("មិនអាចទាញយកទិន្នន័យតួនាទីបានទេ");
      }
    } catch (error) {
      console.error("Error fetching role:", error);
      setError("មិនអាចទាញយកទិន្នន័យតួនាទីបានទេ");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionChange = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      selectedPermissions: prev.selectedPermissions.includes(permissionId)
        ? prev.selectedPermissions.filter(id => id !== permissionId)
        : [...prev.selectedPermissions, permissionId]
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("សូមបញ្ចូលឈ្មោះតួនាទី");
      return false;
    }

    if (!formData.description.trim()) {
      setError("សូមបញ្ចូលការពិពណ៌នា");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        permissions: formData.selectedPermissions
      };

      let response;
      if (isEdit) {
        response = await axios.put(`/api/roles/${id}`, submitData);
      } else {
        response = await axios.post("/api/roles", submitData);
      }

      if (response.data) {
        navigate("/roles");
      } else {
        setError("មិនអាចរក្សាទុកបានទេ");
      }
    } catch (error) {
      console.error("Error saving role:", error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("មិនអាចរក្សាទុកបានទេ");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-2 text-gray-600">កំពុងទាញយកទិន្នន័យ...</p>
      </div>
    );
  }

  return (
    <AdminOnly fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            មិនមានសិទ្ធិចូលប្រើ
          </h3>
          <p className="text-gray-500">
            តែ Admin ប៉ុណ្ណោះដែលអាចគ្រប់គ្រងតួនាទីបាន
          </p>
        </div>
      </div>
    }>
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/roles")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              {isEdit ? "កែប្រែតួនាទី" : "បន្ថែមតួនាទី"}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {isEdit ? "កែប្រែព័ត៌មានតួនាទី" : "បង្កើតតួនាទីថ្មី"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ឈ្មោះតួនាទី <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="បញ្ចូលឈ្មោះតួនាទី"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ការពិពណ៌នា <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="បញ្ចូលការពិពណ៌នាតួនាទី"
                  required
                />
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  សិទ្ធិ
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`permission-${permission.id}`}
                        checked={formData.selectedPermissions.includes(permission.id)}
                        onChange={() => handlePermissionChange(permission.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label 
                        htmlFor={`permission-${permission.id}`} 
                        className="ml-2 block text-sm text-gray-900"
                      >
                        {permission.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/roles")}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    កំពុងរក្សាទុក...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    រក្សាទុក
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminOnly>
  );
};

export default RoleForm;