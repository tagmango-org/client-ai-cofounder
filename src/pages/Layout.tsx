
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { ThemeProvider } from '../components/ThemeProvider';
import { appUserManager } from '@/api/functions';
import { AppUserContext } from '../components/AppUserContext';

// Type definitions for Layout components
interface PlatformUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface AppUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  profilePic?: string;
  role?: string;
  profile?: {
    status: string;
    answers: Record<string, any>;
  };
}

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
    };
  };
}

function LayoutContent({ children, currentPageName }: LayoutContentProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkUser = async (): Promise<void> => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        console.log('User not authenticated');
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border border-[var(--border-subtle)] border-t-[var(--accent-orange)]"></div>
      </div>
    );
  }

  // For KnowledgeBase page, show admin layout only for admins
  if (currentPageName === 'KnowledgeBase' && user && user.role === 'admin') {
    const AdminLayout = React.lazy(() => import('../components/AdminLayout'));
    return (
      <React.Suspense fallback={
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border border-[var(--border-subtle)] border-t-[var(--accent-orange)]"></div>
        </div>
      }>
        <AdminLayout>{children}</AdminLayout>
      </React.Suspense>
    );
  }

  // For Profile page, show admin layout for admins, regular layout for users
  if (currentPageName === 'Profile') {
    if (user && user.role === 'admin') {
      const AdminLayout = React.lazy(() => import('../components/AdminLayout'));
      return (
        <React.Suspense fallback={
          <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border border-[var(--border-subtle)] border-t-[var(--accent-orange)]"></div>
          </div>
        }>
          <AdminLayout>{children}</AdminLayout>
        </React.Suspense>
      );
    }
    return <div className="min-h-screen bg-[var(--bg-primary)]">{children}</div>;
  }

  // For all other pages (especially Chat), show the page directly
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {children}
    </div>
  );
}

export default function Layout({ children, currentPageName }: LayoutProps) {
  const [currentAppUser, setCurrentAppUser] = useState<AppUser | null>(null);
  const [appUserLoading, setAppUserLoading] = useState<boolean>(true);

  useEffect(() => {
    let externalAuthReceived: boolean = false;
    let anonymousModeTimer: NodeJS.Timeout | undefined;

    const handleMessage = async (event: MessageEvent): Promise<void> => {
      console.log('Received message:', {
        origin: event.origin,
        type: event.data?.type,
        data: event.data
      });

      // Security: Uncomment and modify this line to restrict origins in production
      // if (!['http://localhost:3001', 'https://your-production-domain.com'].includes(event.origin)) {
      //   console.log('Message from unauthorized origin:', event.origin);
      //   return;
      // }

      // Fix: Check for the correct message type that parent is sending
      if (event.data && (
        event.data.type === 'AUTHENTICATE_USER' ||
        event.data.type === 'AI_ASSISTANT_AUTHENTICATE_USER' ||
        // Add your actual constant value here
        event.data.type === 'AI_ASSISTANT_ACTION.AUTHENTICATE_USER'
      )) {

        console.log('✅ Authentication message received from parent:', event.data.data);
        externalAuthReceived = true;

        // Clear the anonymous mode timer
        if (anonymousModeTimer) {
          clearTimeout(anonymousModeTimer);
        }

        console.log("Mode Determined: Authenticated User (from parent app)");

        const { userId, name, email, phone, profilePic } = event.data.data!;

        try {
          const response = await appUserManager({
            action: 'getOrCreateAppUser',
            userId,
            name,
            email,
            phone,
            profilePic
          });

          if (response.data && response.data.appUser) {
            setCurrentAppUser(response.data.appUser);
            console.log('✅ App user set successfully:', response.data.appUser);
          }
        } catch (error: any) {
          console.error('❌ Error handling external authentication:', error);
          // Fallback to anonymous mode on error
          setCurrentAppUser({
            id: 'anonymous',
            name: 'Anonymous User',
            profile: { status: 'not_started', answers: {} }
          });
        } finally {
          setAppUserLoading(false);
        }
      }
    };

    const determineUserMode = async (): Promise<void> => {
      setAppUserLoading(true);

      const isEmbedded: boolean = window.self !== window.top;

      // Priority 1: Preview/Dev Mode (if logged into Base44 AND not embedded)
      if (!isEmbedded) {
        try {
          const platformUser = await User.me();
          if (platformUser) {
            console.log("Mode Determined: Preview/Dev (Base44 user detected, not embedded)");
            const response = await appUserManager({
              action: 'getOrCreateAppUser',
              userId: platformUser.id,
              name: platformUser.full_name,
              email: platformUser.email,
              role: platformUser.role,
              phone: '',
              profilePic: ''
            });
            if (response.data && response.data.appUser) {
              setCurrentAppUser(response.data.appUser);
            }
            setAppUserLoading(false);
            return; // Mode determined, stop here.
          }
        } catch (error: any) {
          // This is expected if not logged into Base44. Proceed to next checks.
          console.log("Not logged into Base44, proceeding to embedded checks");
        }
      } else {
        console.log("App is embedded, skipping Preview/Dev mode check.");
      }

      // Priority 2: Authenticated User Mode (via parent app)
      console.log("Priority 2: Waiting for authentication from parent app");

      // Signal to parent that iframe is ready to receive messages
      if (isEmbedded && window.parent) {
        try {
          window.parent.postMessage({
            type: 'IFRAME_READY',
            data: { ready: true }
          }, '*'); // Use specific origin in production
          console.log('📤 Sent IFRAME_READY signal to parent');
        } catch (error: any) {
          console.error('Failed to send ready signal to parent:', error);
        }
      }

      // Priority 3: Anonymous Mode (fallback with timeout)
      anonymousModeTimer = setTimeout((): void => {
        if (!externalAuthReceived) {
          console.log("⏰ Timeout reached - Mode Determined: Anonymous (fallback)");
          setCurrentAppUser({
            id: 'anonymous',
            name: 'Anonymous User',
            profile: { status: 'not_started', answers: {} }
          });
          setAppUserLoading(false);
        }
      }, 10000); // Increased timeout to 10 seconds
    };

    // Add message listener at useEffect level
    window.addEventListener('message', handleMessage);

    // Start the determination process
    determineUserMode();

    // Cleanup function
    return (): void => {
      window.removeEventListener('message', handleMessage);
      if (anonymousModeTimer) {
        clearTimeout(anonymousModeTimer);
      }
    };
  }, []); // Empty dependency array to run only once

  return (
    <AppUserContext.Provider value={{ 
      currentAppUser: currentAppUser as any, 
      setCurrentAppUser: setCurrentAppUser as any, 
      appUserLoading 
    }}>
      <ThemeProvider>
        <div className="min-h-screen transition-colors duration-300">
          <LayoutContent children={children} currentPageName={currentPageName} />
        </div>
      </ThemeProvider>
    </AppUserContext.Provider>
  );
}

