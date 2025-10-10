import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { ThemeProvider } from "../components/ThemeProvider";
import { useUserStore, useCurrentUser, useAppUserLoading } from "../stores/userStore";
import { getAuthToken, logTokenInfo } from "../utils/tokenUtil";
import { API_BASE_URL } from "@/api/openai";
import { User as UserType } from "@/types/dataService";
import tagMangoAuth from "../api/auth";

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
    data?: {
      userId: string;
      name: string;
      email: string;
      phone: string;
      profilePic: string;
      token?: string;
    };
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
    setToken,
    initializeAuth 
  } = useUserStore();

  useEffect(() => {
    let externalAuthReceived: boolean = false;
    let anonymousModeTimer: NodeJS.Timeout | undefined;

    // Initialize auth from persisted state
    initializeAuth();

    const handleMessage = async (event: MessageEvent): Promise<void> => {
      console.log('📨 Received message from parent:', event.data, 'Origin:', event.origin);
      
      const isAuthMessage =
        event.data &&
        (event.data.type === "AUTHENTICATE_USER" ||
          event.data.type === "AI_ASSISTANT_AUTHENTICATE_USER" ||
          event.data.type === "AI_ASSISTANT_ACTION.AUTHENTICATE_USER" ||
          event.data.type === "PARENT_AUTH_DATA");

      // Security: Uncomment and modify this line to restrict origins in production
      // if (!['http://localhost:3001', 'https://your-production-domain.com'].includes(event.origin)) {
      //   console.log('Message from unauthorized origin:', event.origin);
      //   return;
      // }

      // Fix: Check for the correct message type that parent is sending
      if (isAuthMessage) {
        console.log('✅ Authentication message received! Type:', event.data.type);
        externalAuthReceived = true;

        // Clear the anonymous mode timer
        if (anonymousModeTimer) {
          clearTimeout(anonymousModeTimer);
          console.log('⏰ Cleared anonymous mode timer - authentication received');
        }

        const {
          userId,
          token: parentToken,
        } = event.data.data!;

        // Get the appropriate token based on environment and availability
        const token = getAuthToken(parentToken);
        const user = await tagMangoAuth.verifyToken(parentToken as string);
        logTokenInfo(token);
console.log("user. ", user)
        try {
          let finalUserId = userId;
          let finalName = user.name;
          let finalEmail = user.email;
          let finalPhone = user.phone;
          let finalProfilePic = user.profilePic;

          // Use TagMango user ID from token for profile operations
          const tagMangoUserId = getTagMangoUserIdFromToken(token);
          const profileUserId = tagMangoUserId || finalUserId; // Fallback to finalUserId if token parsing fails

          console.log("👤 Using user ID for profile:", {
            tagMangoUserId,
            finalUserId,
            usingUserId: profileUserId,
          });

          // Use custom backend for user management instead of Base44
          const response = await fetch(`${API_BASE_URL}/profile`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "user-id": profileUserId, // Keep header for consistency
            },
            body: JSON.stringify({
              userId: profileUserId, // Add userId to request body (required for POST)
              role: "user",
              email: finalEmail,
              name: finalName,
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
            // Map the profile data to the expected app user format
            // Use TagMango user ID as the primary identifier
            const appUser = {
              name: finalName,
              email: finalEmail,
              phone: finalPhone,
              profilePic: finalProfilePic,
              role: profileData.data.role,
              profile: profileData.data.profile,
              _id: profileUserId,
              userId: profileUserId,
              disabled: false,
              is_verified: false,
              _app_role: profileData.data._app_role || "user",
            };
            setCurrentAppUser(appUser);
            console.log(
              "✅ App user set successfully with TagMango user ID:",
              appUser
            );
            
            // Send confirmation back to parent
            if (window.parent) {
              try {
                window.parent.postMessage(
                  {
                    type: "AUTHENTICATION_SUCCESS",
                    data: {
                      userId: appUser.userId,
                      name: appUser.name,
                      authenticated: true
                    }
                  },
                  "*"
                );
                console.log("📤 Sent authentication success confirmation to parent");
              } catch (error) {
                console.error("Failed to send confirmation to parent:", error);
              }
            }
          }
        } catch (error: any) {
          console.error("❌ Error handling external authentication:", error);
          // Fallback to anonymous mode on error
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
      }
    };

    const determineUserMode = async (): Promise<void> => {
      setAppUserLoading(true);

      const isEmbedded: boolean = window.self !== window.top;

      // Priority 1: Preview/Dev Mode (if token available AND not embedded)
      if (!isEmbedded) {
        const standaloneToken = getAuthToken();

        if (standaloneToken) {
          try {
            console.log(
              "Mode Determined: Preview/Dev (Token available, not embedded)"
            );
            logTokenInfo(standaloneToken);

            // Authenticate with TagMango using the token
            const authUser = await tagMangoAuth.authenticate(standaloneToken);

            if (authUser) {
              const tagMangoUserId =
                getTagMangoUserIdFromToken(standaloneToken);
              const fallbackUserId = authUser._id || "dev-user";
              const profileUserId = tagMangoUserId || fallbackUserId;

              const userName = authUser.name || "Development User";
              const userEmail = authUser.email || "dev@example.com";
              const userPhone = authUser.phone || "";
              const userProfilePic = authUser.profilePic || "";

              const newProfile = {
                userId: tagMangoUserId,
                email: userEmail,
                name: userName,
                phone: userPhone || "",
                profilePic: userProfilePic || "",
                is_verified: false,
                _app_role: "user",
                role: "user",
                profile: {
                  status: "not_started",
                  currentPhaseIndex: 0,
                  currentQuestionIndexInPhase: 0,
                  answers: {},
                },
              };
              // Use custom backend for user management instead of Base44
              const response = await fetch(`${API_BASE_URL}/profile`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "user-id": profileUserId,
                },
                body: JSON.stringify(newProfile),
              });

              const profileData = await response.json();
              console.log(profileData);

              if (profileData.success && profileData.data) {
                const appUser = {
                  _id: profileUserId,
                  userId: profileUserId,
                  name: userName,
                  email: userEmail,
                  phone: userPhone,
                  profilePic: userProfilePic,
                  role: profileData.data.role || "user",
                  profile: profileData.data.profile,
                  disabled: false,
                  is_verified: false,
                  _app_role: profileData.data._app_role || "user",
                };
                setCurrentAppUser(appUser);
              }
              setAppUserLoading(false);
              return; // Mode determined, stop here.
            }
          } catch (error: any) {
            console.log(
              "TagMango authentication failed in standalone mode:",
              error
            );
            // Continue to embedded checks
          }
        } else {
          console.log("No token available for standalone mode");
        }
      } else {
        console.log("App is embedded, skipping Preview/Dev mode check.");
      }

      // Priority 2: Authenticated User Mode (via parent app)
      console.log("Priority 2: Waiting for authentication from parent app");

      // Signal to parent that iframe is ready to receive messages
      if (isEmbedded && window.parent) {
        try {
          window.parent.postMessage(
            {
              type: "IFRAME_READY",
              data: { ready: true },
            },
            "*"
          ); // Use specific origin in production
          console.log("📤 Sent IFRAME_READY signal to parent");
        } catch (error: any) {
          console.error("Failed to send ready signal to parent:", error);
        }
      }

      // Priority 3: Anonymous Mode (fallback with timeout)
      anonymousModeTimer = setTimeout((): void => {
        if (!externalAuthReceived) {
          console.log(
            "⏰ Timeout reached - Mode Determined: Anonymous (fallback)"
          );
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
        }
      }, 10000); // Increased timeout to 10 seconds
    };

    // Add message listener at useEffect level
    window.addEventListener("message", handleMessage);

    // Start the determination process
    determineUserMode();

    // Cleanup function
    return (): void => {
      window.removeEventListener("message", handleMessage);
      if (anonymousModeTimer) {
        clearTimeout(anonymousModeTimer);
      }
    };
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
