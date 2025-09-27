import React from 'react';
import { CheckCircle2, CircleDashed, Loader, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface Phase {
  key: string;
  title: string;
  questions: Array<{
    key: string;
    question: string;
    options: string[];
    multiSelect: boolean;
  }>;
}

interface DiscoveryProgressTrackerProps {
  phases: Phase[];
  answers: { [key: string]: string | string[] };
  currentPhaseIndex: number;
}

const DiscoveryProgressTracker = ({ phases, answers, currentPhaseIndex }: DiscoveryProgressTrackerProps) => {
  // Memoize expensive calculations for phase statuses
  const phaseStatuses = React.useMemo(() => {
    return phases.map((phase: Phase, phaseIndex: number) => {
      const phaseQuestionKeys = phase.questions.map((q: any) => q.key);
      const answeredKeysInPhase = phaseQuestionKeys.filter((key: string) => answers[key] !== undefined);

      if (answeredKeysInPhase.length === phaseQuestionKeys.length) {
        return { 
          status: 'completed', 
          icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
          progress: 100
        };
      }
      if (phaseIndex === currentPhaseIndex) {
        const progressPercent = phaseQuestionKeys.length > 0 
          ? Math.round((answeredKeysInPhase.length / phaseQuestionKeys.length) * 100) 
          : 100;
        return { 
          status: 'in_progress', 
          icon: <Loader className="w-4 h-4 text-[var(--accent-orange)] animate-spin" />,
          progress: progressPercent
        };
      }
      return { 
        status: 'not_started', 
        icon: <CircleDashed className="w-4 h-4 text-[var(--text-muted)]" />,
        progress: 0
      };
    });
  }, [phases, answers, currentPhaseIndex]);

  // Memoize overall progress calculation
  const overallProgress = React.useMemo(() => {
    const totalQuestions = phases.reduce((acc: number, phase: Phase) => acc + phase.questions.length, 0);
    const answeredQuestions = Object.keys(answers).length;
    return totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
  }, [phases, answers]);

  const totalQuestionsDisplay = phases.reduce((acc: number, phase: Phase) => acc + phase.questions.length, 0);
  const answeredQuestionsDisplay = Object.keys(answers).length;

  return (
    <div className="bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-[var(--accent-orange)]" />
        <h4 className="font-semibold text-[var(--text-primary)]">Discovery Journey</h4>
      </div>
      
      <div className="space-y-3 mb-5">
        {phases.map((phase: Phase, index: number) => {
          const { status, icon, progress } = phaseStatuses[index];
          const isCompleted = status === 'completed';
          const isInProgress = status === 'in_progress';
          
          return (
            <motion.div 
              key={phase.key} 
              className="flex items-center text-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <span className="mr-3">{icon}</span>
              <div className="flex-1">
                <span className={`block font-medium ${
                  isCompleted ? 'text-green-500' : ''
                }${isInProgress ? 'text-[var(--accent-orange)]' : ''}${
                  !isCompleted && !isInProgress ? 'text-[var(--text-muted)]' : ''
                }`}>
                  {phase.title}
                </span>
                {isInProgress && progress > 0 && (
                  <div className="w-full bg-[var(--bg-hover)] rounded-full h-1.5 mt-1">
                    <motion.div 
                      className="bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-orange-hover)] h-1.5 rounded-full" 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Overall Progress Circle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                fill="none"
                stroke="var(--border-secondary)"
                strokeWidth="2"
              />
              <motion.path
                d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                fill="none"
                stroke="var(--accent-orange)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${overallProgress}, 100`}
                initial={{ strokeDasharray: "0, 100" }}
                animate={{ strokeDasharray: `${overallProgress}, 100` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-[var(--text-primary)]">{overallProgress}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Overall Progress</p>
            <p className="text-xs text-[var(--text-secondary)]">{answeredQuestionsDisplay} of {totalQuestionsDisplay} questions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DiscoveryProgressTracker);