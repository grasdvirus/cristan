
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, IdTokenResult } from 'firebase/auth';
import { 
    auth, 
    googleProvider, 
    signInWithPopup, 
    firebaseSignOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from '@/lib/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signUp: (email:string, password:string) => Promise<any>;
    signIn: (email:string, password:string) => Promise<any>;
    signOutUser: () => Promise<void>;
    getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// No need for session cookies on the client side with Firebase Auth's persistence
// The logic for server-side rendering with auth can be more complex, but for
// client-side logic, onAuthStateChanged is sufficient.

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);
    
    const signInWithGoogle = async () => {
        await signInWithPopup(auth, googleProvider);
    };
    
    const signUp = async (email:string, password:string) => {
        return createUserWithEmailAndPassword(auth, email, password);
    }
    
    const signIn = async (email:string, password:string) => {
        return signInWithEmailAndPassword(auth, email, password);
    }
    
    const signOutUser = async () => {
        await firebaseSignOut(auth);
    };

    const getIdToken = async (): Promise<string | null> => {
        if (!user) return null;
        return await user.getIdToken(true);
    };

    const value = { user, loading, signInWithGoogle, signOutUser, signUp, signIn, getIdToken };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
