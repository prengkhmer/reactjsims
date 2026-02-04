/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/users/UserList.jsx
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Users,
  Shield,
  Calendar,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Mail,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  AdminOnly,
  canViewUser,
  canCreateUser,
  canEditUser,
  canDeleteUser,
  SuperAdminOnly,
} from "../../utils/permissions";
import { getUsers, deleteUser, updateUser } from "../../api/user.api";

const ITEMS_PER_PAGE = 10;

const UserList = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Permission checks
  const canView = canViewUser(currentUser);
  const canCreate = canCreateUser(currentUser);
  const canEdit = canEditUser(currentUser);
  const canDelete = canDeleteUser(currentUser);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        ...(searchTerm && { search: searchTerm }),
      };

      const response = await getUsers(params);

      // Check if response has users data in different formats
      if (response && (response.users || response.data)) {
        const usersData = response.users || response.data || [];
        setUsers(Array.isArray(usersData) ? usersData : []);
        // Calculate total items
        const count = response.count || response.total || usersData.length || 0;
        setTotalItems(count);
      } else {
        setError("មិនអាចទាញយកទិន្នន័យអ្នកប្រើប្រាស់បានទេ");
        setUsers([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("មិនអាចទាញយកទិន្នន័យអ្នកប្រើប្រាស់បានទេ");
      setUsers([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`តើអ្នកពិតជាចង់លុបអ្នកប្រើប្រាស់ "${name}" មែនទេ?`)) {
      try {
        setDeleting(id);
        await deleteUser(id);
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        setError("មិនអាចលុបអ្នកប្រើប្រាស់បានទេ");
      } finally {
        setDeleting(null);
      }
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      await updateUser(id, {
        status: currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      });
      fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
      setError("មិនអាចកែប្រែស្ថានភាពអ្នកប្រើប្រាស់បានទេ");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleReset = () => {
    setSearchTerm("");
    setCurrentPage(1);
    setTimeout(() => {
      fetchUsers();
    }, 100);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === "ACTIVE").length;
    const inactiveUsers = users.filter((u) => u.status === "INACTIVE").length;
    const adminUsers = users.filter((u) => u.Role?.name === "Admin").length;

    return {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      admins: adminUsers,
    };
  }, [users]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPageButtons = () => {
    const pages = [];
    const maxButtons = 7;

    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    const left = Math.max(1, currentPage - 1);
    const right = Math.min(totalPages, currentPage + 1);

    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) {
      if (i !== 1 && i !== totalPages) pages.push(i);
    }
    if (right < totalPages - 1) pages.push("...");
    pages.push(totalPages);

    return pages;
  };

  if (!canView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl shadow-md p-12">
          <UserX className="h-20 w-20 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            មិនមានសិទ្ធិចូលប្រើ
          </h3>
          <p className="text-gray-600">
            អ្នកមិនមានសិទ្ធិមើលបញ្ជីអ្នកប្រើប្រាស់ទេ
          </p>
        </div>
      </div>
    );
  }

  return (
    <AdminOnly
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <div className="text-center bg-white rounded-xl shadow-md p-12">
            <UserX className="h-20 w-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              មិនមានសិទ្ធិចូលប្រើ
            </h3>
            <p className="text-gray-600">
              តែ Admin ប៉ុណ្ណោះដែលអាចមើលឃើញអ្នកប្រើប្រាស់បាន
            </p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  អ្នកប្រើប្រាស់
                </h1>
                <p className="text-gray-600 text-sm">
                  គ្រប់គ្រងអ្នកប្រើប្រាស់ទាំងអស់
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    អ្នកប្រើប្រាស់សរុប
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">ក្នុងប្រព័ន្ធ</p>
                </div>
                <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">សកម្ម</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.active}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {((stats.active / stats.total) * 100 || 0).toFixed(1)}%
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">អសកម្ម</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.inactive}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {((stats.inactive / stats.total) * 100 || 0).toFixed(1)}%
                  </p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Admin</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.admins}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">អ្នកគ្រប់គ្រង</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search & Actions */}
          <div className="bg-white rounded-xl shadow-md p-5 mb-6">
            <form
              onSubmit={handleSearch}
              className="flex flex-col lg:flex-row gap-3"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ស្វែងរកអ្នកប្រើប្រាស់..."
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
              >
                <Search className="h-5 w-5" />
                ស្វែងរក
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  fetchUsers();
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw className="h-5 w-5" />
                ផ្ទុកឡើងវិញ
              </button>

              {canCreate && (
                <Link
                  to="/users/new"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Plus className="h-5 w-5" />
                  បន្ថែមអ្នកប្រើប្រាស់
                </Link>
              )}
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 flex items-center gap-3">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 font-medium">
                កំពុងទាញយកទិន្នន័យ...
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                គ្មានអ្នកប្រើប្រាស់ទេ
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? "គ្មានលទ្ធផលស្វែងរក"
                  : "ចាប់ផ្តើមដោយបន្ថែមអ្នកប្រើប្រាស់ថ្មី"}
              </p>
              {canCreate && !searchTerm && (
                <Link
                  to="/users/new"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg transition-all"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  បន្ថែមអ្នកប្រើប្រាស់ដំបូង
                </Link>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        អ្នកប្រើប្រាស់
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        តួនាទី
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        ស្ថានភាព
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        ថ្ងៃបង្កើត
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        សកម្មភាព
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {users.map((user, index) => (
                      <tr
                        key={user.id}
                        className={`hover:bg-indigo-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {user.photo && user.photo.trim() !== "" ? (
                              <img
                                src={
                                  user.photo.startsWith("data:")
                                    ? user.photo
                                    : `data:image/jpeg;base64,${user.photo}`
                                }
                                alt={user.name}
                                className="h-10 w-10 rounded-full object-cover border-2 border-indigo-200 shadow-sm"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-sm"
                              style={{
                                display:
                                  user.photo && user.photo.trim() !== ""
                                    ? "none"
                                    : "flex",
                              }}
                            >
                              <span className="text-white font-bold text-sm">
                                {user.name?.charAt(0)?.toUpperCase() || "U"}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                            <Shield className="h-3 w-3 mr-1" />
                            {user.Role?.name || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() =>
                              handleStatusToggle(user.id, user.status)
                            }
                            disabled={!canEdit}
                            className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              user.status === "ACTIVE"
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            } ${
                              canEdit
                                ? "cursor-pointer"
                                : "cursor-not-allowed opacity-60"
                            }`}
                          >
                            {user.status === "ACTIVE" ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                សកម្ម
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                អសកម្ម
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {new Date(user.createdAt).toLocaleDateString(
                              "km-KH",
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            {canView && (
                              <Link
                                to={`/users/${user.id}`}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all transform hover:scale-110"
                                title="មើល"
                              >
                                <Eye className="h-5 w-5" />
                              </Link>
                            )}
                            {canEdit && (
                              <SuperAdminOnly>
                                <Link
                                  to={`/users/edit/${user.id}`}
                                  className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all transform hover:scale-110"
                                  title="កែប្រែ"
                                >
                                  <Edit className="h-5 w-5" />
                                </Link>
                              </SuperAdminOnly>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(user.id, user.name)}
                                disabled={deleting === user.id}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all transform hover:scale-110 disabled:opacity-50"
                                title="លុប"
                              >
                                {deleting === user.id ? (
                                  <div className="h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <Trash2 className="h-5 w-5" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t bg-gradient-to-r from-gray-50 to-gray-100 gap-3">
                  <div className="text-sm text-gray-700 font-medium">
                    បង្ហាញ{" "}
                    <span className="font-bold text-indigo-600">
                      {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                      {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
                    </span>{" "}
                    នៃ{" "}
                    <span className="font-bold text-indigo-600">
                      {totalItems}
                    </span>{" "}
                    អ្នកប្រើប្រាស់
                  </div>

                  <nav className="flex items-center gap-1 flex-wrap justify-center">
                    <button
                      onClick={() => goToPage(1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      « ដើម
                    </button>

                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      មុន
                    </button>

                    {renderPageButtons().map((p, idx) =>
                      p === "..." ? (
                        <span
                          key={`dots-${idx}`}
                          className="px-2 text-gray-500 font-bold"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => goToPage(p)}
                          className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
                            currentPage === p
                              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-600 shadow-lg"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600"
                          }`}
                        >
                          {p}
                        </button>
                      ),
                    )}

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      បន្ទាប់
                    </button>

                    <button
                      onClick={() => goToPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      ចុង »
                    </button>
                  </nav>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminOnly>
  );
};

export default UserList;
