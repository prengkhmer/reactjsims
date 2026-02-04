// src/pages/users/UserForm.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  MapPin,
  Upload,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { AdminOnly, canCreateUser, canEditUser } from "../../utils/permissions";
import {
  createUser,
  updateUser,
  getUserById,
  getUserRoles,
} from "../../api/user.api";

const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  // const isEdit = Boolean(id);
  // const isView = window.location.pathname.includes('/users/') && !window.location.pathname.includes('/edit/');
  const isEdit = window.location.pathname.includes("/edit/");
  const isView = window.location.pathname.match(/^\/users\/\d+$/) !== null;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    address: "",
    role_id: "",
    password: "",
    confirmPassword: "",
    status: 1,
    photo: "",
  });

  // Permission checks
  const canCreate = canCreateUser(currentUser);
  const canEdit = canEditUser(currentUser);

  useEffect(() => {
    fetchRoles();
    if (isEdit || isView) {
      fetchUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Ensure user has proper permissions to access this form
  useEffect(() => {
    if (!isEdit && !isView && !canCreate) {
      setError("អ្នកមិនមានសិទ្ធិបង្កើតអ្នកប្រើប្រាស់ថ្មីទេ");
    }
    if (isEdit && !canEdit) {
      setError("អ្នកមិនមានសិទ្ធិកែប្រែអ្នកប្រើប្រាស់ទេ");
    }
  }, [canCreate, canEdit, isEdit, isView]);

  const fetchRoles = async () => {
    try {
      const response = await getUserRoles();
      // Handle different response formats
      if (
        response &&
        (response.roles || response.data || Array.isArray(response))
      ) {
        setRoles(response.roles || response.data || response || []);
      } else {
        setRoles([]);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      setError("មិនអាចទាញយកតួនាទីបានទេ");
    }
  };

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await getUserById(id);

      // Handle different response formats
      if (response && (response.user || response.data)) {
        const user = response.user || response.data;
        setFormData({
          name: user.name || "",
          username: user.username || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
          role_id: user.role_id || user.Role?.id || "",
          password: "",
          confirmPassword: "",
          status: user.status !== undefined ? user.status : 1,
          photo: user.photo || "",
        });
        if (user.photo) {
          setImagePreview(user.photo);
        }
      } else {
        setError("មិនអាចទាញយកទិន្នន័យអ្នកប្រើប្រាស់បានទេ");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setError("មិនអាចទាញយកទិន្នន័យអ្នកប្រើប្រាស់បានទេ");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("រូបភាពធំពេក។ សូមជ្រើសរើសរូបភាពតូចជាង 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({
          ...prev,
          photo: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("សូមបញ្ចូលឈ្មោះ");
      return false;
    }

    if (!formData.username.trim()) {
      setError("សូមបញ្ចូលឈ្មោះអ្នកប្រើប្រាស់");
      return false;
    }

    if (!formData.role_id) {
      setError("សូមជ្រើសរើសតួនាទី");
      return false;
    }

    // Validate that selected role exists in available roles
    const selectedRoleExists = roles.some(
      (role) => role.id == formData.role_id,
    );
    if (!selectedRoleExists && roles.length > 0) {
      setError("តួនាទីដែលជ្រើសរើសមិនត្រឹមត្រូវទេ");
      return false;
    }

    if (!isEdit) {
      if (!formData.password) {
        setError("សូមបញ្ចូលពាក្យសម្ងាត់");
        return false;
      }

      if (formData.password.length < 6) {
        setError("ពាក្យសម្ងាត់ត្រូវតែមានយ៉ាងហោចណាស់ 6 តួអក្សរ");
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("ពាក្យសម្ងាត់មិនត្រូវគ្នាទេ");
        return false;
      }
    } else if (formData.password) {
      if (formData.password.length < 6) {
        setError("ពាក្យសម្ងាត់ត្រូវតែមានយ៉ាងហោចណាស់ 6 តួអក្សរ");
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("ពាក្យសម្ងាត់មិនត្រូវគ្នាទេ");
        return false;
      }
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

      const userData = {
        name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        role_id: parseInt(formData.role_id),
        status: formData.status,
        photo: formData.photo || null,
      };

      // Only include password if it's provided
      if (formData.password) {
        userData.password = formData.password;
      }

      let response;
      if (isEdit) {
        response = await updateUser(id, userData);
      } else {
        response = await createUser(userData);
      }

      // Check response success in multiple ways
      if (
        response &&
        (response.success === true ||
          (response.user && !response.error) ||
          (response.message &&
            !response.message.toLowerCase().includes("error")))
      ) {
        navigate("/users");
      } else {
        setError(
          response?.message ||
            response?.error ||
            "មិនអាចរក្សាទុកអ្នកប្រើប្រាស់បានទេ",
        );
      }
    } catch (error) {
      console.error("Error saving user:", error);
      setError("មិនអាចរក្សាទុកបានទេ");
    } finally {
      setSaving(false);
    }
  };

  if (!canCreate && !isEdit && !isView) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            មិនមានសិទ្ធិចូលប្រើ
          </h3>
          <p className="text-gray-500">
            អ្នកមិនមានសិទ្ធិបង្កើតអ្នកប្រើប្រាស់ថ្មីទេ
          </p>
        </div>
      </div>
    );
  }

  if (!canEdit && isEdit) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            មិនមានសិទ្ធិចូលប្រើ
          </h3>
          <p className="text-gray-500">
            អ្នកមិនមានសិទ្ធិកែប្រែអ្នកប្រើប្រាស់ទេ
          </p>
        </div>
      </div>
    );
  }

  return (
    <AdminOnly
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              មិនមានសិទ្ធិចូលប្រើ
            </h3>
            <p className="text-gray-500">
              តែ Admin ប៉ុណ្ណោះដែលអាចគ្រប់គ្រងអ្នកប្រើប្រាស់បាន
            </p>
          </div>
        </div>
      }
    >
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/users")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              {isView
                ? "មើលអ្នកប្រើប្រាស់"
                : isEdit
                  ? "កែប្រែអ្នកប្រើប្រាស់"
                  : "បន្ថែមអ្នកប្រើប្រាស់ថ្មី"}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {isView
                ? "ព័ត៌មានលម្អិតអ្នកប្រើប្រាស់"
                : isEdit
                  ? "កែប្រែព័ត៌មានអ្នកប្រើប្រាស់"
                  : "បញ្ចូលព័ត៌មានអ្នកប្រើប្រាស់ថ្មី"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">កំពុងទាញយកទិន្នន័យ...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload */}
              {!isView && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    រូបភាព
                  </label>
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-200">
                          <User className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <label className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition-colors">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">ជ្រើសរើសរូបភាព</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500">
                      រូបភាពត្រូវតែតូចជាង 5MB
                    </p>
                  </div>
                </div>
              )}

              {/* View Mode Photo */}
              {isView && formData.photo && (
                <div className="mb-6 flex justify-center">
                  <img
                    src={
                      formData.photo.startsWith("data:")
                        ? formData.photo
                        : `data:image/jpeg;base64,${formData.photo}`
                    }
                    alt={formData.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ឈ្មោះ *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={isView}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      placeholder="បញ្ចូលឈ្មោះ"
                      required
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ឈ្មោះអ្នកប្រើប្រាស់ *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={isView}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    placeholder="បញ្ចូលឈ្មោះអ្នកប្រើប្រាស់"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    អ៊ីមែល
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isView}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      placeholder="បញ្ចូលអ៊ីមែល"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    លេខទូរស័ព្ទ
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={isView}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      placeholder="បញ្ចូលលេខទូរស័ព្ទ"
                    />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    តួនាទី *
                  </label>
                  <select
                    name="role_id"
                    value={formData.role_id}
                    onChange={handleInputChange}
                    disabled={isView}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-50"
                    required
                  >
                    <option value="">ជ្រើសរើសតួនាទី</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ស្ថានភាព
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={isView}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-50"
                  >
                    <option value="">Selected</option>
                    <option value="ACTIVE">សកម្ម</option>
                    <option value="INACTIVE">អសកម្ម</option>
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  អាសយដ្ឋាន
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={isView}
                    rows={3}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    placeholder="បញ្ចូលអាសយដ្ឋាន"
                  />
                </div>
              </div>

              {/* Password Fields */}
              {!isView && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ពាក្យសម្ងាត់ {!isEdit && "*"}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={
                          isEdit
                            ? "បញ្ចូលពាក្យសម្ងាត់ថ្មី (ទុកទទេប្រសិនបើមិនចង់ផ្លាស់ប្តូរ)"
                            : "បញ្ចូលពាក្យសម្ងាត់"
                        }
                        required={!isEdit}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      បញ្ជាក់ពាក្យសម្ងាត់ {!isEdit && "*"}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="បញ្ជាក់ពាក្យសម្ងាត់"
                        required={!isEdit && formData.password}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!isView && (
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate("/users")}
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
              )}
            </form>
          </div>
        )}
      </div>
    </AdminOnly>
  );
};

export default UserForm;
