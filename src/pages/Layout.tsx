import React, { useEffect } from "react";
import { ThemeProvider } from "../components/ThemeProvider";
import { useUserStore, useCurrentUser, useAppUserLoading } from "../stores/userStore";
import tagMangoAuth from "../api/auth";


const getRefreshTokenFromURL = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const refreshToken = urlParams.get('refreshToken') || urlParams.get('accessToken');
    console.log('🔑 Extracted token from URL:', refreshToken ? 'Token found' : 'No token found');
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

      const accessToken =  getRefreshTokenFromURL()
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
          role: "user",
          phone: "",
        });
        setAppUserLoading(false);
        return;
      }

      try {
        const user = await tagMangoAuth.verifyToken(accessToken);
        const profileUserId = user.userId || user._id;


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
            phone: user.phone,
            created_by: profileUserId,
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
            created_date: profileData.data.created_date,
            updated_date: profileData.data.updated_date,

          };
          setCurrentAppUser(appUser);
        }
      } catch (error: any) {
        console.error("❌ Token verification failed:", error);
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
          role: "user",
          phone: "",
        });
      } finally {
        setAppUserLoading(false);
      }
    };

    authenticateUser();
  }, []);

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
