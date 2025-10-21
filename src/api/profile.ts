import { User, UpdateUser } from "../types/dataService";

// Type definitions for profile API functions
interface ProfileResponse {
  success: boolean;
  data?: User;
  error?: string;
  message?: string;
}

export const getUserProfile = async (
  userId: string
): Promise<ProfileResponse> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "user-id": `${userId}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (
  userId: string,
  profileDetails: Partial<UpdateUser>
): Promise<ProfileResponse> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "user-id": `${userId}`,
      },
      body: JSON.stringify({
        profileDetails,
      }),
    });
    console.log(response);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};
