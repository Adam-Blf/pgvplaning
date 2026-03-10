import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/server';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { uid, email, firstName, lastName, birthDate } = body;

        if (!uid || !email || !firstName || !lastName || !birthDate) {
            return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
        }

        const displayName = `${firstName} ${lastName}`.trim();

        // 1. Update User Profile Name in Firebase Auth (Server-side is faster)
        await adminAuth.updateUser(uid, {
            displayName: displayName
        });

        // 2. Create Firestore Profile (Server-side bypasses security rules overhead for admin)
        const profileData = {
            id: uid,
            email: email,
            displayName: displayName,
            first_name: firstName,
            last_name: lastName,
            birth_date: birthDate,
            role: 'member',
            employeeType: 'cdi',
            workTimeCategory: 'temps-plein',
            workTimePercentage: 100,
            sector: 'prive',
            leaveBalance: {
                total: 25,
                used: 0,
                remaining: 25,
            },
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        await adminDb.collection('profiles').doc(uid).set(profileData);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error in API /api/auth/register:', error);
        return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
    }
}
