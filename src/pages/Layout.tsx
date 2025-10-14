import React, { useEffect } from "react";
import { ThemeProvider } from "../components/ThemeProvider";
import { useUserStore, useCurrentUser, useAppUserLoading } from "../stores/userStore";
import { getAuthToken } from "../utils/tokenUtil";
import tagMangoAuth from "../api/auth";
import { isTesting } from "@/utils/helper";

const getTagMangoUserIdFromToken = (token: string | null): string | null => {
  if (!token) return null;

  try {
    const tokenParts = token.split(".");
    if (tokenParts.length === 3) {
      const payload = JSON.parse(atob(tokenParts[1]));
      return payload.userid || payload.userId || payload.id || null;
    }
  } catch (error) {
    console.error("Error parsing TagMango token:", error);
  }

  return null;
};

const getRefreshTokenFromURL = (): string | null => {
  // Check if we're on the client side
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const urlParams = new URLSearchParams(window.location.search);
    // Check for both 'refreshToken' and 'accessToken' parameters
    const refreshToken = urlParams.get('refreshToken') || urlParams.get('accessToken');
    console.log('🔑 Extracted token from URL:', refreshToken ? 'Token found' : 'No token found');
    console.log('🔍 URL parameters:', Object.fromEntries(urlParams.entries()));
    return refreshToken;
  } catch (error) {
    console.error("Error extracting token from URL:", error);
    return null;
  }
};


interface LayoutContentProps {
  children: React.ReactNode;
  currentPageName: string;
}

interface LayoutProps {
  children: React.ReactNode;
  currentPageName: string;
}

interface MessageEvent {
  origin: string;
  data: {
    type: string;
    // Note: We now extract userId and refreshToken from URL parameters instead of event data
  };
}

function LayoutContent({ children, currentPageName }: LayoutContentProps) {
  const currentAppUser = useCurrentUser();
  const appUserLoading = useAppUserLoading();

  if (appUserLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border border-[var(--border-subtle)] border-t-[var(--accent-orange)]"></div>
      </div>
    );
  }

  // For KnowledgeBase page, show admin layout only for admins
  if (currentPageName === "KnowledgeBase" && currentAppUser && currentAppUser.role === "admin") {
    const AdminLayout = React.lazy(() => import("../components/AdminLayout"));
    return (
      <React.Suspense
        fallback={
          <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border border-[var(--border-subtle)] border-t-[var(--accent-orange)]"></div>
          </div>
        }
      >
        <AdminLayout>{children}</AdminLayout>
      </React.Suspense>
    );
  }

  if (currentPageName === "Profile") {
    if (currentAppUser && currentAppUser.role === "admin") {
      const AdminLayout = React.lazy(() => import("../components/AdminLayout"));
      return (
        <React.Suspense
          fallback={
            <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border border-[var(--border-subtle)] border-t-[var(--accent-orange)]"></div>
            </div>
          }
        >
          <AdminLayout>{children}</AdminLayout>
        </React.Suspense>
      );
    }
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">{children}</div>
    );
  }

  return <div className="min-h-screen bg-[var(--bg-primary)]">{children}</div>;
}

export default function Layout({ children, currentPageName }: LayoutProps) {
  const { 
    setCurrentAppUser, 
    setAppUserLoading, 
    setToken  } = useUserStore();


  useEffect(() => {
    const authenticateUser = async (): Promise<void> => {
      setAppUserLoading(true);

      // Extract accessToken from URL parameters
      const accessToken = (!isTesting ? getRefreshTokenFromURL() : import.meta.env.VITE_TOKEN_TEST)
      console.log('🔑 Extracted accessToken:', accessToken ? `${accessToken.substring(0, 20)}...` : 'No token found');

      if (!accessToken) {
        console.log('❌ No accessToken found - setting anonymous user');
        setCurrentAppUser({
          _id: "anonymous",
          name: "Anonymous User",
          profile: {
            status: "not_started",
            answers: {},
            currentPhaseIndex: 0,
            currentQuestionIndexInPhase: 0,
          },
          userId: "",
          email: "",
          disabled: null,
          is_verified: false,
          _app_role: "",
          role: "",
          phone: "",
        });
        setAppUserLoading(false);
        return;
      }

      try {
        // Verify token with TagMango
        const user = await tagMangoAuth.verifyToken(accessToken);
        console.log('✅ Token verified successfully:', user);

        // Get the appropriate token based on environment and availability
        const token = getAuthToken(accessToken);
        const tagMangoUserId = getTagMangoUserIdFromToken(token);
        const profileUserId = user.userId || user._id;

        console.log("👤 Using user ID for profile:", {
          tagMangoUserId,
          finalUserId: user._id,
          usingUserId: profileUserId,
        });

        // Create/update user profile in backend
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "user-id": profileUserId,
          },
          body: JSON.stringify({
            userId: profileUserId,
            role: "user",
            email: user.email,
            name: user.name,
            is_verified: false,
            _app_role: "user",
            profile: {
              status: "not_started",
              currentPhaseIndex: 0,
              currentQuestionIndexInPhase: 0,
              answers: {},
            },
          }),
        });

        const profileData = await response.json();

        if (profileData.success && profileData.data) {
          const appUser = {
            name: user.name,
            email: user.email,
            phone: user.phone,
            profilePic: user.profilePic,
            role: profileData.data.role,
            profile: profileData.data.profile,
            _id: profileUserId,
            userId: profileUserId,
            disabled: false,
            is_verified: false,
            _app_role: profileData.data._app_role || "user",
          };
          setCurrentAppUser(appUser);
          console.log("✅ Authenticated user set successfully:", appUser);
        }
      } catch (error: any) {
        console.error("❌ Token verification failed:", error);
        // Set anonymous user on token verification failure
        setCurrentAppUser({
          _id: "anonymous",
          name: "Anonymous User",
          profile: {
            status: "not_started",
            answers: {},
            currentPhaseIndex: 0,
            currentQuestionIndexInPhase: 0,
          },
          userId: "",
          email: "",
          disabled: null,
          is_verified: false,
          _app_role: "",
          role: "",
          phone: "",
        });
      } finally {
        setAppUserLoading(false);
      }
    };

    // Start authentication
    authenticateUser();
  }, []); // Empty dependency array to run only once

  return (
    <ThemeProvider>
      <div className="min-h-screen transition-colors duration-300">
        <LayoutContent
          children={children}
          currentPageName={currentPageName}
        />
      </div>
    </ThemeProvider>
  );
}
