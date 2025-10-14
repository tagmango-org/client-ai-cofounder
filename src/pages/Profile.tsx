import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useCurrentUser, useAppUserLoading, useUserStore } from "../stores/userStore";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Lightbulb,
  Target,
  Sparkles,
  BrainCircuit,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GenerateProfileSynthesis } from "@/api/openai";
import { DISCOVERY_PHASES } from "@/data/chat";
import { getUserProfile, updateUserProfile } from "@/api/profile";

interface ProfileSynthesis {
  niche_clarity: string;
  personality_type: string;
  core_motivation: string;
  primary_strength: string;
  growth_edge: string;
  business_stage: string;
}

interface DiscoveryAnswers {
  [key: string]: string | string[];
}

interface ProfileDiscoveryState {
  status: "not_started" | "in_progress" | "completed";
  answers: DiscoveryAnswers;
  currentPhaseIndex?: number;
  currentQuestionIndexInPhase?: number;
}

type SynthesisIconKey = keyof ProfileSynthesis;

const synthesisIcons: Record<SynthesisIconKey, React.ReactNode> = {
  niche_clarity: <Target className="w-6 h-6 text-[var(--text-primary)]" />,
  personality_type: <Sparkles className="w-6 h-6 text-[var(--text-primary)]" />,
  core_motivation: <ShieldCheck className="w-6 h-6 text-[var(--text-primary)]" />,
  primary_strength: <TrendingUp className="w-6 h-6 text-[var(--text-primary)]" />,
  growth_edge: <BrainCircuit className="w-6 h-6 text-[var(--text-primary)]" />,
  business_stage: <Lightbulb className="w-6 h-6 text-[var(--text-primary)]" />,
};

interface SynthesisCardProps {
  icon: React.ReactNode;
  title: string;
  text: string;
  delay: number;
}

const SynthesisCard = ({ icon, title, text, delay }: SynthesisCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1, duration: 0.5 }}
    className="bg-[var(--bg-secondary)]/50 rounded-xl p-6 flex gap-6 items-start"
  >
    <div className="bg-[var(--bg-tertiary)]/50 p-3 rounded-full">{icon}</div>
    <div>
      <h4 className="font-bold text-lg text-[var(--text-primary)] mb-2">{title}</h4>
      <p className="text-[var(--text-secondary)] leading-relaxed">{text}</p>
    </div>
  </motion.div>
);

export default function ProfilePage() {
  const currentAppUser = useCurrentUser();
  const appUserLoading = useAppUserLoading();
  const { setCurrentAppUser } = useUserStore();
  const user = currentAppUser;
  const [discoveryState, setDiscoveryState] =
    useState<ProfileDiscoveryState | null>(null);
  const [synthesis, setSynthesis] = useState<ProfileSynthesis | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedName, setEditedName] = useState<string>("");

  const hasAnswers = useMemo(() => {
    return (
      discoveryState?.answers && Object.keys(discoveryState.answers).length > 0
    );
  }, [discoveryState]);

  useEffect(() => {
    if (currentAppUser) {
      const profile = currentAppUser.profile;
      setDiscoveryState({
        status: profile?.status || "not_started",
        answers: profile?.answers || {},
        currentPhaseIndex: profile?.currentPhaseIndex,
        currentQuestionIndexInPhase: profile?.currentQuestionIndexInPhase,
      });
      setEditedName(currentAppUser.name || "");
    }
  }, [currentAppUser, user]);

  useEffect(() => {
    const generateProfileSynthesis = async (answers: DiscoveryAnswers) => {
      setIsGenerating(true);
      const answeredQuestions = Object.entries(answers || {})
        .map(
          ([key, value]: [string, string | string[]]) =>
            `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
        )
        .join("\n");

      const synthesisPrompt = `Based on the comprehensive discovery answers below, create a strategic coaching profile synthesis in the exact JSON format specified:

${answeredQuestions}

Respond with ONLY a JSON object in this exact format:
{
    "niche_clarity": "Their unique positioning (1-2 sentences)",
    "personality_type": "Their coaching style and approach (1-2 sentences)",
    "core_motivation": "What drives them (1-2 sentences)",
    "primary_strength": "Their superpower (1-2 sentences)",
    "growth_edge": "Main area for development (1-2 sentences)",
    "business_stage": "Current phase and next evolution (1-2 sentences)"
}`;

      try {
        const response = await GenerateProfileSynthesis({
          answers: answers,
        });
        setSynthesis(response as ProfileSynthesis);
      } catch (error) {
        console.error("Error generating profile synthesis:", error);
        setSynthesis(null);
      } finally {
        setIsGenerating(false);
      }
    };

    if (hasAnswers && !synthesis && discoveryState) {
      generateProfileSynthesis(discoveryState.answers);
    }
  }, [hasAnswers, discoveryState, synthesis]);
  console.log(currentAppUser);

  const handleSaveEdit = async () => {
    if (!currentAppUser || editedName.trim() === currentAppUser.name) {
      setIsEditing(false);
      return;
    }

    const data = await getUserProfile(currentAppUser.userId);

    console.log(data);
    try {
      const userData = {
        userId: currentAppUser.userId || "",
        email: currentAppUser.email || "",
        name: editedName.trim(),
        phone: currentAppUser.phone?.toString() || "",
        profilePic: currentAppUser.profilePic || "",
      };

      const res = await updateUserProfile(
        currentAppUser.userId,
        userData
      );
      console.log(res, "updated");
      const appUser = {
        id: res.data?.id || res.data?._id || res.data?.userId || "",
        email: res.data?.email || "",
        _id: res.data?._id || res.data?.userId || "",
        name: res.data?.name || "",
        phone: res.data?.phone || "",
        profile: res.data.profile,
        profilePic: res.data?.profilePic || "",
        role: res.data?.role || "user",
        userId: res.data?.userId || "",
        disabled: res.data?.disabled ?? false,
        is_verified: res.data?.is_verified ?? false,
        _app_role: res.data?._app_role ?? "",
      };
      setCurrentAppUser(appUser || null);
    } catch (error) {
      console.error("Failed to update user name:", error);
      setEditedName(currentAppUser.name || "");
    } finally {
      setIsEditing(false);
    }
  };

  if (appUserLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 order-[var(--accent-orange-border)]"></div>
      </div>
    );
  }

  if (!currentAppUser) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center text-[var(--text-primary)]">
        Could not load user profile. Please try again later.
      </div>
    );
  }

  const userInitial = currentAppUser?.name
    ? currentAppUser.name.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans">
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        {/* --- Header --- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10"
        >
          <div className="flex items-center gap-4">
            {currentAppUser?.profilePic ? (
              <img
                src={currentAppUser.profilePic}
                alt={currentAppUser?.name || "User"}
                className="w-16 h-16 rounded-full object-cover border-2 border-[var(--border-subtle)]"
              />
            ) : (
              <div className="w-16 h-16 bg-[var(--accent-orange)] rounded-full flex items-center justify-center text-[var(--text-primary)] text-3xl font-bold">
                {userInitial}
              </div>
            )}
            <div>
              {isEditing ? (
                <input
                  value={editedName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditedName(e.target.value)
                  }
                  className="text-2xl font-bold bg-[var(--bg-secondary)] border-[var(--border-subtle)] focus:order-[var(--accent-orange-border)] ring-offset-gray-900 rounded-md px-3 py-2 text-[var(--text-primary)]"
                />
              ) : (
                <h1 className="text-2xl md:text-3xl font-bold">
                  {currentAppUser?.name || "User"}
                </h1>
              )}
              <p className="text-[var(--text-secondary)]">{currentAppUser?.email || ""}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <Link to={createPageUrl("Chat")}>
              <Button className="bg-transparent text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] rounded-md px-4 py-2 flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Chat
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* --- Coaching Synthesis Section --- */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Your Coaching Synthesis</h2>
          <AnimatePresence>
            {hasAnswers ? (
              synthesis ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SynthesisCard
                    icon={synthesisIcons.niche_clarity}
                    title="Niche Clarity"
                    text={synthesis.niche_clarity}
                    delay={0}
                  />
                  <SynthesisCard
                    icon={synthesisIcons.personality_type}
                    title="Personality Type"
                    text={synthesis.personality_type}
                    delay={1}
                  />
                  <SynthesisCard
                    icon={synthesisIcons.core_motivation}
                    title="Core Motivation"
                    text={synthesis.core_motivation}
                    delay={2}
                  />
                  <SynthesisCard
                    icon={synthesisIcons.primary_strength}
                    title="Primary Strength"
                    text={synthesis.primary_strength}
                    delay={3}
                  />
                  <SynthesisCard
                    icon={synthesisIcons.growth_edge}
                    title="Growth Edge"
                    text={synthesis.growth_edge}
                    delay={4}
                  />
                  <SynthesisCard
                    icon={synthesisIcons.business_stage}
                    title="Business Stage"
                    text={synthesis.business_stage}
                    delay={5}
                  />
                </div>
              ) : (
                <div className="bg-[var(--bg-secondary)]/50 border border-[var(--border-subtle)] rounded-lg text-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 order-[var(--accent-orange-border)] mx-auto mb-4"></div>
                  <p className="text-[var(--text-secondary)]">
                    Generating your personalized synthesis...
                  </p>
                </div>
              )
            ) : (
              <div className="bg-[var(--bg-secondary)]/50 border border-[var(--border-subtle)] rounded-lg text-center p-8">
                <p className="text-[var(--text-secondary)]">
                  No synthesis available. Complete the discovery process to see
                  your personalized profile.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* --- Discovery Answers Section --- */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Your Discovery Answers</h2>
          <AnimatePresence>
            {hasAnswers ? (
              <div className="space-y-8">
                {DISCOVERY_PHASES.map((phase, phaseIndex: number) => {
                  const hasPhaseAnswers = phase.questions.some(
                    (q) => discoveryState?.answers[q.key] !== undefined
                  );
                  if (!hasPhaseAnswers) return null;

                  return (
                    <motion.div
                      key={phase.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: phaseIndex * 0.1 }}
                    >
                      <h3 className="text-xl font-semibold text-[var(--accent-orange)] border-b-2 border-[var(--border-subtle)] pb-2 mb-6">
                        {phase.title}
                      </h3>
                      <div className="space-y-6">
                        {phase.questions.map((question) => {
                          const answer = discoveryState?.answers[question.key];
                          if (answer === undefined) return null;

                          return (
                            <div
                              key={question.key}
                              className="bg-[var(--bg-secondary)]/50 p-5 rounded-lg"
                            >
                              <p className="font-semibold text-[var(--text-secondary)] mb-3">
                                {question.question}
                              </p>
                              {Array.isArray(answer) ? (
                                <div className="flex flex-wrap gap-2">
                                  {answer.map((item: string) => (
                                    <span
                                      key={item}
                                      className="bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] border order-[var(--accent-orange-border)]/20 rounded-md px-2 py-1 text-sm"
                                    >
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[var(--text-primary)] bg-[var(--bg-tertiary)]/60 px-4 py-2 rounded-md">
                                  {answer as string}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-[var(--bg-secondary)]/50 border border-[var(--border-subtle)] rounded-lg text-center p-12">
                <p className="text-[var(--text-secondary)] mb-6">
                  You haven't answered any discovery questions yet.
                </p>
                <Link to={createPageUrl("Chat")}>
                  <Button className="bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] rounded-md px-6 py-3 text-lg">
                    Start Discovery
                  </Button>
                </Link>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
