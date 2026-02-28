import { useState, useEffect, useCallback } from "react";
import { shuffle } from "lodash";
import getQuestionsByMood from "../questions";
import { getAuth } from "firebase/auth";
import { collection, doc, setDoc, updateDoc, Timestamp, getDoc, increment } from "firebase/firestore";
import { db } from "../../context/firebase/firebase";

const answerOptions = {
    anxiety: [
        { label: "Not at all", value: 0, emoji: "😌" },
        { label: "Several days", value: 1, emoji: "🤔" },
        { label: "More than half the days", value: 2, emoji: "😟" },
        { label: "Nearly every day", value: 3, emoji: "😰" }
    ],
    stress: [
        { label: "Never", value: 0, emoji: "😌" },
        { label: "Almost never", value: 1, emoji: "🤔" },
        { label: "Sometimes", value: 2, emoji: "😟" },
        { label: "Fairly often", value: 3, emoji: "😰" },
        { label: "Very often", value: 4, emoji: "😨" }
    ],
    anger: [
        { label: "Rarely", value: 0, emoji: "😌" },
        { label: "Sometimes", value: 1, emoji: "🤔" },
        { label: "Occasionally", value: 2, emoji: "😠" },
        { label: "Most of the time", value: 3, emoji: "😡" }
    ],
    low: [
        { label: "A little", value: 1, emoji: "😌" },
        { label: "Some", value: 2, emoji: "😕" },
        { label: "Good part", value: 3, emoji: "😞" },
        { label: "Most part", value: 4, emoji: "😩" }
    ],
    sad: [
        { label: "Not at all", value: 0, emoji: "😌" },
        { label: "Several days", value: 1, emoji: "😕" },
        { label: "Half the days", value: 2, emoji: "😞" },
        { label: "Every day", value: 3, emoji: "😢" }
    ]
};

export const useAssessment = () => {
    const [selectedMood, setSelectedMood] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [stage, setStage] = useState(0); // 0: Intro, 1: Mood Pulse, 2: Questions, 3: Results

    const auth = getAuth();

    // Load persistence
    useEffect(() => {
        const saved = localStorage.getItem('mindWellAssessment');
        if (saved) {
            const state = JSON.parse(saved);
            setSelectedMood(state.selectedMood);
            setQuestions(state.questions || []);
            setCurrentQuestionIndex(state.currentQuestionIndex || 0);
            setAnswers(state.answers || []);
            setResult(state.result);
            setStage(state.stage || 0);
        }
    }, [setSelectedMood, setQuestions, setCurrentQuestionIndex, setAnswers, setResult, setStage]);

    // Handle logout-driven reset
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (!user) {
                // Clear state if logged out
                reset();
            }
        });
        return () => unsubscribe();
    }, [auth]);

    // Save persistence
    useEffect(() => {
        const state = { selectedMood, questions, currentQuestionIndex, answers, result, stage };
        localStorage.setItem('mindWellAssessment', JSON.stringify(state));
    }, [selectedMood, questions, currentQuestionIndex, answers, result, stage]);

    const startAssessment = (mood) => {
        setLoading(true);
        setTimeout(() => {
            setSelectedMood(mood);
            const moodQuestions = mood === 'happy' ? getQuestionsByMood('sad') : shuffle(getQuestionsByMood(mood));
            setQuestions(moodQuestions);
            setAnswers([]);
            setCurrentQuestionIndex(0);
            setStage(2);
            setLoading(false);
        }, 800);
    };

    const saveResults = async (assessmentResult, analysis = null) => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const dateStr = new Date().toISOString().split("T")[0];
            const timestamp = Timestamp.fromDate(new Date());

            const assessmentData = {
                date: timestamp,
                moodType: selectedMood,
                score: assessmentResult?.score || 0,
                level: assessmentResult?.level || "Happy",
                analysis,
                answers: answers.map((value, index) => ({
                    question: questions[index]?.text || "",
                    value
                })),
                timestamp: new Date()
            };

            const userDocRef = doc(db, "users", user.uid);
            // Explicitly ensure 'assessments' subcollection name is plural
            const assessmentsCollectionRef = collection(userDocRef, `moodAssessment/${dateStr}/assessments`);
            await setDoc(doc(assessmentsCollectionRef), assessmentData);

            // Update daily dashboard stats
            const dailyMoodRef = doc(db, "users", user.uid, "dailyMood", dateStr);
            await setDoc(dailyMoodRef, {
                latestMood: selectedMood,
                timestamp: new Date()
            }, { merge: true });

            console.log("✅ Results synced to cloud in plural collection");
        } catch (error) {
            console.error("❌ Sync error:", error);
        }
    };

    const reset = () => {
        localStorage.removeItem('mindWellAssessment');
        setSelectedMood(null);
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setResult(null);
        setStage(0);
    };

    return {
        selectedMood,
        setSelectedMood,
        questions,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        answers,
        setAnswers,
        result,
        setResult,
        stage,
        setStage,
        loading,
        startAssessment,
        saveResults,
        reset,
        answerOptions
    };
};