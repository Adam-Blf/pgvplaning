'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { UserProfile } from '@/types/firestore';
import Cookies from 'js-cookie';

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    error: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!auth || !db) {
            setLoading(false);
            return;
        }

        const unsubscribeAuth = onAuthStateChanged(
            auth,
            async (firebaseUser) => {
                setUser(firebaseUser);

                if (firebaseUser) {
                    // Token for middleware
                    try {
                        const token = await firebaseUser.getIdToken();
                        Cookies.set('firebase-token', token, { expires: 7, secure: true, sameSite: 'strict' });
                    } catch (e) {
                        console.error("Error getting token:", e);
                    }

                    // Listen to profile (db! is safe because we checked above)
                    const profileRef = doc(db!, 'profiles', firebaseUser.uid);
                    const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
                        if (docSnap.exists()) {
                            setProfile({ id: docSnap.id, ...docSnap.data() } as UserProfile);
                        } else {
                            // Profile not yet created — the API /api/auth/register handles creation.
                            // onSnapshot will fire again once the profile is written.
                            setProfile(null);
                        }
                        setLoading(false);
                    }, (err) => {
                        console.error("Profile snapshot error:", err);
                        setError("Erreur lors de la récupération du profil");
                        setLoading(false);
                    });

                    return () => unsubscribeProfile();
                } else {
                    setProfile(null);
                    Cookies.remove('firebase-token');
                    setLoading(false);
                }
            },
            (err) => {
                console.error("Auth status change error:", err);
                setError("Erreur d'authentification");
                setLoading(false);
            }
        );

        return () => unsubscribeAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, profile, loading, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => useContext(AuthContext);
