
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAppUser } from '../components/AppUserContext';
import { DISCOVERY_PHASES } from './Chat';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Save, X, Lightbulb, Target, Sparkles, BrainCircuit, TrendingUp, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { InvokeLLM } from '@/api/integrations';
import * as dataService from '@/components/services/dataService';

const synthèseIcons = {
    niche_clarity: <Target className="w-6 h-6 text-white" />,
    personality_type: <Sparkles className="w-6 h-6 text-white" />,
    core_motivation: <ShieldCheck className="w-6 h-6 text-white" />,
    primary_strength: <TrendingUp className="w-6 h-6 text-white" />,
    growth_edge: <BrainCircuit className="w-6 h-6 text-white" />,
    business_stage: <Lightbulb className="w-6 h-6 text-white" />,
};

const SynthesisCard = ({ icon, title, text, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay * 0.1, duration: 0.5 }}
        className="bg-gray-800/50 rounded-xl p-6 flex gap-6 items-start"
    >
        <div className="bg-gray-700/50 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <h4 className="font-bold text-lg text-white mb-2">{title}</h4>
            <p className="text-gray-300 leading-relaxed">{text}</p>
        </div>
    </motion.div>
);

export default function ProfilePage() {
    const { currentAppUser, setCurrentAppUser, appUserLoading } = useAppUser();
    const [discoveryState, setDiscoveryState] = useState(null);
    const [synthesis, setSynthesis] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState('');

    const hasAnswers = useMemo(() => {
        return discoveryState?.answers && Object.keys(discoveryState.answers).length > 0;
    }, [discoveryState]);

    useEffect(() => {
        if (currentAppUser) {
            setDiscoveryState(currentAppUser.profile || { status: 'not_started', answers: {} });
            setEditedName(currentAppUser.name || '');
        }
    }, [currentAppUser]);

    useEffect(() => {
        const generateProfileSynthesis = async (answers) => {
            setIsGenerating(true);
            const answeredQuestions = Object.entries(answers || {})
                .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                .join('\n');

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
                const response = await InvokeLLM({
                    prompt: synthesisPrompt,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            niche_clarity: { type: "string" },
                            personality_type: { type: "string" },
                            core_motivation: { type: "string" },
                            primary_strength: { type: "string" },
                            growth_edge: { type: "string" },
                            business_stage: { type: "string" }
                        },
                        required: ["niche_clarity", "personality_type", "core_motivation", "primary_strength", "growth_edge", "business_stage"]
                    }
                });
                setSynthesis(response);
            } catch (error) {
                console.error("Error generating profile synthesis:", error);
                setSynthesis(null);
            } finally {
                setIsGenerating(false);
            }
        };

        if (hasAnswers && !synthesis) {
            generateProfileSynthesis(discoveryState.answers);
        }
    }, [hasAnswers, discoveryState, synthesis]);
    
    const handleSaveEdit = async () => {
        if (!currentAppUser || editedName.trim() === currentAppUser.name) {
            setIsEditing(false);
            return;
        }

        try {
            await dataService.getOrCreateAppUser({
                userId: currentAppUser.userId,
                name: editedName.trim(),
                email: currentAppUser.email,
                phone: currentAppUser.phone,
                profilePic: currentAppUser.profilePic
            });
            setCurrentAppUser(prev => ({...prev, name: editedName.trim()}));
        } catch (error) {
            console.error("Failed to update user name:", error);
            // Optionally revert name or show an error toast
            setEditedName(currentAppUser.name);
        } finally {
            setIsEditing(false);
        }
    };

    if (appUserLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!currentAppUser) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
                Could not load user profile. Please try again later.
            </div>
        );
    }
    
    const userInitial = currentAppUser.name ? currentAppUser.name.charAt(0).toUpperCase() : 'U';
    
    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            <div className="max-w-4xl mx-auto p-6 md:p-8">

                {/* --- Header --- */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10"
                >
                    <div className="flex items-center gap-4">
                         {currentAppUser.profilePic ? (
                            <img src={currentAppUser.profilePic} alt={currentAppUser.name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-700" />
                        ) : (
                            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                {userInitial}
                            </div>
                        )}
                        <div>
                            {isEditing ? (
                                <Input 
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    className="text-2xl font-bold bg-gray-800 border-gray-700 focus:border-orange-500 ring-offset-gray-900"
                                />
                            ) : (
                                <h1 className="text-2xl md:text-3xl font-bold">{currentAppUser.name}</h1>
                            )}
                            <p className="text-gray-400">{currentAppUser.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 mt-4 md:mt-0">
                        <Link to={createPageUrl('Chat')}>
                            <Button variant="outline" className="bg-transparent border-gray-700 hover:bg-gray-800 hover:text-white">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Chat
                            </Button>
                        </Link>
                        {isEditing ? (
                            <>
                                <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}><X className="w-5 h-5"/></Button>
                                <Button onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700"><Save className="w-4 h-4 mr-2" />Save</Button>
                            </>
                        ) : (
                            <Button onClick={() => setIsEditing(true)} className="bg-orange-500 hover:bg-orange-600">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Button>
                        )}
                    </div>
                </motion.div>

                {/* --- Coaching Synthesis Section --- */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">Your Coaching Synthesis</h2>
                    <AnimatePresence>
                        {hasAnswers ? (
                            synthesis ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SynthesisCard icon={synthèseIcons.niche_clarity} title="Niche Clarity" text={synthesis.niche_clarity} delay={0} />
                                    <SynthesisCard icon={synthèseIcons.personality_type} title="Personality Type" text={synthesis.personality_type} delay={1} />
                                    <SynthesisCard icon={synthèseIcons.core_motivation} title="Core Motivation" text={synthesis.core_motivation} delay={2} />
                                    <SynthesisCard icon={synthèseIcons.primary_strength} title="Primary Strength" text={synthesis.primary_strength} delay={3} />
                                    <SynthesisCard icon={synthèseIcons.growth_edge} title="Growth Edge" text={synthesis.growth_edge} delay={4} />
                                    <SynthesisCard icon={synthèseIcons.business_stage} title="Business Stage" text={synthesis.business_stage} delay={5} />
                                </div>
                            ) : (
                                <Card className="bg-gray-800/50 border-gray-700 text-center p-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                                    <p className="text-gray-400">Generating your personalized synthesis...</p>
                                </Card>
                            )
                        ) : (
                            <Card className="bg-gray-800/50 border-gray-700 text-center p-8">
                                <p className="text-gray-400">No synthesis available. Complete the discovery process to see your personalized profile.</p>
                            </Card>
                        )}
                    </AnimatePresence>
                </div>
                
                {/* --- Discovery Answers Section --- */}
                <div>
                    <h2 className="text-2xl font-bold mb-6">Your Discovery Answers</h2>
                     <AnimatePresence>
                        {hasAnswers ? (
                            <div className="space-y-8">
                                {DISCOVERY_PHASES.map((phase, phaseIndex) => {
                                    const hasPhaseAnswers = phase.questions.some(q => discoveryState.answers[q.key] !== undefined);
                                    if (!hasPhaseAnswers) return null;

                                    return (
                                    <motion.div 
                                        key={phase.key}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: phaseIndex * 0.1 }}
                                    >
                                        <h3 className="text-xl font-semibold text-orange-400 border-b-2 border-gray-700 pb-2 mb-6">{phase.title}</h3>
                                        <div className="space-y-6">
                                            {phase.questions.map((question) => {
                                                const answer = discoveryState.answers[question.key];
                                                if (answer === undefined) return null;

                                                return (
                                                    <div key={question.key} className="bg-gray-800/50 p-5 rounded-lg">
                                                        <p className="font-semibold text-gray-300 mb-3">{question.question}</p>
                                                        {Array.isArray(answer) ? (
                                                            <div className="flex flex-wrap gap-2">
                                                                {answer.map(item => <Badge key={item} variant="secondary" className="bg-orange-500/10 text-orange-300 border border-orange-500/20">{item}</Badge>)}
                                                            </div>
                                                        ) : (
                                                            <p className="text-white bg-gray-700/60 px-4 py-2 rounded-md">{answer}</p>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </motion.div>
                                )})}
                            </div>
                        ) : (
                            <Card className="bg-gray-800/50 border-gray-700 text-center p-12">
                                <p className="text-gray-400 mb-6">You haven't answered any discovery questions yet.</p>
                                <Link to={createPageUrl('Chat')}>
                                    <Button size="lg" className="bg-orange-500 hover:bg-orange-600">Start Discovery</Button>
                                </Link>
                            </Card>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
