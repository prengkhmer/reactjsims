// src/api/user.api.js
import axios from "./axios";

// Get all users
export const getUsers = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.offset) queryParams.append("offset", params.offset);
    if (params.search) queryParams.append("search", params.search);
    if (params.role) queryParams.append("role", params.role);
    if (params.status !== undefined)
      queryParams.append("status", params.status);

    const response = await axios.get(`/api/user?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    // Return a structured error response
    if (error.response) {
      return {
        success: false,
        message:
          error.response.data?.message ||
          "មានបញ្ហាក្នុងការទាញយកទិន្នន័យអ្នកប្រើប្រាស់",
        error: error.response.data,
      };
    } else if (error.request) {
      return {
        success: false,
        message: "មិនអាចតភ្ជាប់ទៅប្រព័ន្ធ",
        error: "Network error",
      };
    } else {
      return {
        success: false,
        message: "មានបញ្ហាខាងក្នុង",
        error: error.message,
      };
    }
  }
};

// Get user by ID
export const getUserById = async (id) => {
  try {
    const response = await axios.get(`/api/user/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    // Return a structured error response
    if (error.response) {
      return {
        success: false,
        message:
          error.response.data?.message ||
          "មានបញ្ហាក្នុងការទាញយកទិន្នន័យអ្នកប្រើប្រាស់",
        error: error.response.data,
      };
    } else if (error.request) {
      return {
        success: false,
        message: "មិនអាចតភ្ជាប់ទៅប្រព័ន្ធ",
        error: "Network error",
      };
    } else {
      return {
        success: false,
        message: "មានបញ្ហាខាងក្នុង",
        error: error.message,
      };
    }
  }
};

// Create new user
export const createUser = async (userData) => {
  try {
    const response = await axios.post("/register", userData);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    // Return a structured error response
    if (error.response) {
      return {
        success: false,
        message:
          error.response.data?.message ||
          "មានបញ្ហាក្នុងការបង្កើតអ្នកប្រើប្រាស់ថ្មី",
        error: error.response.data,
      };
    } else if (error.request) {
      return {
        success: false,
        message: "មិនអាចតភ្ជាប់ទៅប្រព័ន្ធ",
        error: "Network error",
      };
    } else {
      return {
        success: false,
        message: "មានបញ្ហាខាងក្នុង",
        error: error.message,
      };
    }
  }
};

// Update user
export const updateUser = async (id, userData) => {
  try {
    const response = await axios.put(`/api/user/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    // Return a structured error response
    if (error.response) {
      return {
        success: false,
        message:
          error.response.data?.message ||
          "មានបញ្ហាក្នុងការកែប្រែអ្នកប្រើប្រាស់",
        error: error.response.data,
      };
    } else if (error.request) {
      return {
        success: false,
        message: "មិនអាចតភ្ជាប់ទៅប្រព័ន្ធ",
        error: "Network error",
      };
    } else {
      return {
        success: false,
        message: "មានបញ្ហាខាងក្នុង",
        error: error.message,
      };
    }
  }
};

// Delete user
export const deleteUser = async (id) => {
  try {
    const response = await axios.delete(`/api/user/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    // Return a structured error response
    if (error.response) {
      return {
        success: false,
        message:
          error.response.data?.message || "មានបញ្ហាក្នុងការលុបអ្នកប្រើប្រាស់",
        error: error.response.data,
      };
    } else if (error.request) {
      return {
        success: false,
        message: "មិនអាចតភ្ជាប់ទៅប្រព័ន្ធ",
        error: "Network error",
      };
    } else {
      return {
        success: false,
        message: "មានបញ្ហាខាងក្នុង",
        error: error.message,
      };
    }
  }
};

// Change user password
export const changeUserPassword = async (id, passwordData) => {
  try {
    const response = await axios.patch(
      `/api/user/${id}/password`,
      passwordData,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user roles
export const getUserRoles = async () => {
  try {
    const response = await axios.get("/api/roles");
    return response.data;
  } catch (error) {
    console.error("Error fetching user roles:", error);
    // Return a structured error response
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || "មានបញ្ហាក្នុងការទាញយកតួនាទី",
        error: error.response.data,
      };
    } else if (error.request) {
      return {
        success: false,
        message: "មិនអាចតភ្ជាប់ទៅប្រព័ន្ធ",
        error: "Network error",
      };
    } else {
      return {
        success: false,
        message: "មានបញ្ហាខាងក្នុង",
        error: error.message,
      };
    }
  }
};

// Update user status
export const updateUserStatus = async (id, status) => {
  try {
    const response = await axios.patch(`/api/user/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error;
  }
};
