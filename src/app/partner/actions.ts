'use server';

export async function verifyPartnerPassword(password: string): Promise<{ success: boolean; data?: any; error?: string; status?: string }> {
    // This code runs only on the server
    try {
        const { initializeApp, getApps, App } = await import('firebase-admin/app');
        const { getFirestore } = await import('firebase-admin/firestore');
        const { credential } = await import('firebase-admin');

        // Ensure environment variable is loaded. In a real app, you might use a dotenv setup
        // or have this configured in your hosting environment.
        const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (!serviceAccountKey) {
            console.error('Firebase service account key is not configured on the server.');
            return { success: false, error: 'Configuration serveur manquante.' };
        }
        
        let adminApp: App;
        if (!getApps().length) {
            adminApp = initializeApp({
                credential: credential.cert(JSON.parse(serviceAccountKey)),
            });
        } else {
            adminApp = getApps()[0];
        }

        const db = getFirestore(adminApp);

        const partnersRef = db.collection('submissions');
        const snapshot = await partnersRef.where('password', '==', password).where('type', '==', 'Partenariat').limit(1).get();

        if (snapshot.empty) {
            return { success: false, error: 'Mot de passe invalide.' };
        }

        const partnerDoc = snapshot.docs[0];
        const partnerData = partnerDoc.data();

        if (partnerData.status !== 'confirmé') {
            return { success: false, error: 'Compte non actif.', status: 'en attente' };
        }
        
        // Return only the necessary data for the dashboard
        const dashboardData = {
            id: partnerDoc.id,
            fullName: partnerData.fullName,
            promoCode: partnerData.promoCode,
            promoCodeUses: partnerData.promoCodeUses || 0,
            promoCodeTotalUses: partnerData.promoCodeTotalUses || 0,
        };

        return { success: true, data: dashboardData };

    } catch (error) {
        console.error('Server Action Error in verifyPartnerPassword:', error);
        return { success: false, error: 'Erreur interne du serveur.' };
    }
}
