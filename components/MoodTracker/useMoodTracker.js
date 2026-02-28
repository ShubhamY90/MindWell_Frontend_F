import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db, auth } from "../../context/firebase/firebase";

const getDateStr = (date) => date.toLocaleDateString('en-CA'); // YYYY-MM-DD

export const useMoodTracker = () => {
    const [moodData, setMoodData] = useState([]);
    const [latestTest, setLatestTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [todayMoodLogged, setTodayMoodLogged] = useState(false);
    const [latestMood, setLatestMood] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchLatestMood = useCallback(async (user) => {
        try {
            const today = getDateStr(new Date());
            const todayDocRef = doc(db, "users", user.uid, "dailyMood", today);
            const todayDocSnap = await getDoc(todayDocRef);

            if (todayDocSnap.exists()) {
                const data = todayDocSnap.data();
                return {
                    date: today,
                    mood: data.latestMood || 'neutral'
                };
            }
            return null;
        } catch (error) {
            console.error("Error fetching latest mood:", error);
            return null;
        }
    }, []);

    const fetchDailyMoods = useCallback(async (user) => {
        try {
            const today = new Date();
            const dates = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                dates.push(getDateStr(date));
            }

            const dailyMoods = [];
            for (const dateStr of dates) {
                const docRef = doc(db, "users", user.uid, "dailyMood", dateStr);
                const docSnap = await getDoc(docRef);

                dailyMoods.push({
                    date: dateStr,
                    mood: docSnap.exists() ? (docSnap.data().latestMood || 'neutral') : 'neutral',
                    isToday: dateStr === getDateStr(today)
                });
            }
            return dailyMoods;
        } catch (error) {
            console.error("Error fetching daily moods:", error);
            return [];
        }
    }, []);

    const checkRecentAssessment = useCallback(async (user) => {
        try {
            const today = new Date();
            const dates = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                dates.push(getDateStr(date));
            }

            for (const dateStr of dates) {
                const assessmentCollectionRef = collection(db, "users", user.uid, "moodAssessment", dateStr, "assessments");
                const assessmentDocs = await getDocs(assessmentCollectionRef);
                if (!assessmentDocs.empty) return true;
            }
            return false;
        } catch (error) {
            console.error("Error checking recent assessment:", error);
            return false;
        }
    }, []);

    const fetchLatestTest = useCallback(async (user) => {
        try {
            console.log("🔍 Fetching latest test for user:", user.uid);
            const today = new Date();
            const dates = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                dates.push(getDateStr(date));
            }

            for (const dateStr of dates) {
                // Use segments consistently and ensure plural 'assessments'
                const assessmentCollectionRef = collection(db, "users", user.uid, "moodAssessment", dateStr, "assessments");
                const assessmentDocs = await getDocs(assessmentCollectionRef);

                if (!assessmentDocs.empty) {
                    const latestDoc = assessmentDocs.docs[0];
                    console.log("✅ Found recent assessment in plural collection:", latestDoc.id);
                    return {
                        id: latestDoc.id,
                        date: dateStr,
                        recent: true,
                        ...latestDoc.data()
                    };
                }
            }

            // Fallback: search across all assessments
            const assessmentRef = collection(db, "users", user.uid, "moodAssessment");
            const assessmentSnapshot = await getDocs(assessmentRef);

            if (!assessmentSnapshot.empty) {
                let latestAssessment = null;
                let latestDate = null;

                for (const dateDoc of assessmentSnapshot.docs) {
                    // Safety check: ensure dateDoc.id is a date and not 'assessment'
                    if (dateDoc.id === 'assessment') {
                        console.warn("⚠️ Found invalid 'assessment' document in moodAssessment collection level");
                        continue;
                    }

                    const assessmentCollectionRef = collection(db, "users", user.uid, "moodAssessment", dateDoc.id, "assessments");
                    const assessmentDocs = await getDocs(assessmentCollectionRef);

                    for (const assessmentDoc of assessmentDocs.docs) {
                        const assessmentDate = new Date(dateDoc.id);
                        if (!latestDate || assessmentDate > latestDate) {
                            latestDate = assessmentDate;
                            latestAssessment = { id: assessmentDoc.id, date: dateDoc.id, recent: false, ...assessmentDoc.data() };
                        }
                    }
                }
                return latestAssessment;
            }
            return null;
        } catch (error) {
            console.error("Error fetching latest test:", error);
            // If the error message mentions a singular path, log it specifically
            if (error.message && error.message.includes('assessment has 5')) {
                console.error("❌ Detected invalid singular assessment path. Ensure you are not calling doc() on a subcollection path.");
            }
            return null;
        }
    }, []);

    const loadData = useCallback(async () => {
        const user = auth.currentUser;
        if (!user) return;

        setLoading(true);
        try {
            const [dailyMoods, test, latestMoodData, hasRecentAssessment] = await Promise.all([
                fetchDailyMoods(user),
                fetchLatestTest(user),
                fetchLatestMood(user),
                checkRecentAssessment(user)
            ]);

            setMoodData(dailyMoods);
            setLatestMood(latestMoodData);

            const today = getDateStr(new Date());
            const todayDocRef = doc(db, "users", user.uid, "dailyMood", today);
            const todayDocSnap = await getDoc(todayDocRef);
            setTodayMoodLogged(todayDocSnap.exists() && todayDocSnap.data().latestMood);

            setLatestTest(hasRecentAssessment ? { recent: true } : test);
        } catch (error) {
            console.error("Error loading mood tracker data:", error);
        } finally {
            setLoading(false);
        }
    }, [fetchDailyMoods, fetchLatestTest, fetchLatestMood, checkRecentAssessment]);

    const logMood = async (selectedMood) => {
        if (!selectedMood) return;

        setSubmitting(true);
        try {
            const user = auth.currentUser;
            if (!user) return;

            const today = getDateStr(new Date());
            const moodDocRef = doc(db, "users", user.uid, "dailyMood", today);
            const docSnap = await getDoc(moodDocRef);

            if (docSnap.exists()) {
                await updateDoc(moodDocRef, {
                    latestMood: selectedMood,
                    timestamp: new Date(),
                    [selectedMood]: increment(1)
                });
            } else {
                const allMoods = ['happy', 'sad', 'stress', 'anxious', 'lowEnergy', 'neutral'];
                const newDocData = {
                    latestMood: selectedMood,
                    mostFrequent: selectedMood,
                    timestamp: new Date()
                };
                allMoods.forEach(mood => {
                    newDocData[mood] = mood === selectedMood ? 1 : 0;
                });
                await setDoc(moodDocRef, newDocData);
            }
            await loadData();
            return true;
        } catch (error) {
            console.error("Error logging mood:", error);
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) loadData();
        });
        return () => unsubscribe();
    }, [loadData]);

    return {
        moodData,
        latestTest,
        loading,
        todayMoodLogged,
        latestMood,
        logMood,
        submitting,
        refreshData: loadData
    };
};
