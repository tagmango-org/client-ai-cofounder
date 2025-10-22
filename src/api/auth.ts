import { User } from "../types/dataService";

const TAGMANGO_API_BASE = import.meta.env.VITE_TAGMANGO_API_BASE;

class TagMangoAuth {
  private token: string | null;
  private user: User | null;

  constructor() {
    this.token = null;
    this.user = null;
  }

  async verifyToken(token: string): Promise<User> {
    try {
      const response = await fetch(
        `${TAGMANGO_API_BASE}/external/auth/verify-token?token=${encodeURIComponent(
          token
        )}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Authentication failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const user: User = {
        _id: data.result._id,
        userId: data.result._id || data.id || "",
        email: data.result.email || "",
        name: data.result.name || "",
        role: data.result.role || "user",
        profilePic: data.result.profilePic || data.result.profile_pic,
        created_date: data.result.createdAt || data.result.created_at,
        updated_date: data.result.updatedAt || data.result.updated_at,
        phone: String(data.result.phone) || "",
        profile: data.result.profile || {
          status: "not_started",
          currentPhaseIndex: 0,
          currentQuestionIndexInPhase: 0,
          answers: {},
        },
      };

      this.token = token;
      this.user = user;

      return user;
    } catch (error) {
      console.error("TagMango auth verification failed:", error);
      throw error;
    }
  }

  async authenticate(token: string): Promise<User> {
    if (!token) {
      throw new Error("Token is required");
    }

    return await this.verifyToken(token);
  }

  isAuthenticated(): boolean {
    return !!(this.token && this.user);
  }
}

const tagMangoAuth = new TagMangoAuth();

export default tagMangoAuth;
