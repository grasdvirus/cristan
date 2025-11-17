'use server';

import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { credential } from 'firebase-admin';

// Configuration de Firebase Admin (à sécuriser via des variables d'environnement)
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

let adminApp: App;
if (!getApps().length) {
    if (!serviceAccount) {
        throw new Error('La variable d\'environnement FIREBASE_SERVICE_ACCOUNT_KEY est manquante.');
    }
    adminApp = initializeApp({
        credential: credential.cert(JSON.parse(serviceAccount)),
    });
} else {
    adminApp = getApps()[0];
}

const db = getFirestore(adminApp);

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ success: false, error: 'Mot de passe manquant.' }, { status: 400 });
    }

    const partnersRef = db.collection('submissions');
    const snapshot = await partnersRef.where('password', '==', password).where('type', '==', 'Partenariat').limit(1).get();

    if (snapshot.empty) {
      return NextResponse.json({ success: false, error: 'Mot de passe invalide.' }, { status: 404 });
    }

    const partnerDoc = snapshot.docs[0];
    const partnerData = partnerDoc.data();

     if (partnerData.status !== 'confirmé') {
        return NextResponse.json({ success: false, error: 'Compte non actif.', status: partnerData.status }, { status: 403 });
    }

    // Renvoyer uniquement les données nécessaires pour le tableau de bord
    const dashboardData = {
        id: partnerDoc.id,
        fullName: partnerData.fullName,
        promoCode: partnerData.promoCode,
        promoCodeUses: partnerData.promoCodeUses || 0,
        promoCodeTotalUses: partnerData.promoCodeTotalUses || 0,
    };

    return NextResponse.json({ success: true, data: dashboardData });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}
