import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs } from 'firebase/firestore';

/**
 * Route API pour l'abonnement iCal d'un utilisateur
 * URL: /api/ical/user/[token]
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;

    if (!token || !db) {
        return new NextResponse('Invalid token or database not initialized', { status: 400 });
    }

    try {
        // 1. Trouver l'utilisateur par son icalToken
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('icalToken', '==', token));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return new NextResponse('Token not found', { status: 404 });
        }

        const userData = querySnapshot.docs[0].data();
        const userId = querySnapshot.docs[0].id;
        const displayName = userData.displayName || 'Utilisateur';

        // 2. Récupérer son calendrier
        const calendarRef = collection(db, 'calendars');
        const calendarSnap = await getDocs(query(calendarRef, where('userId', '==', userId)));
        const calendarData = calendarSnap.empty ? {} : calendarSnap.docs[0].data().data || {};

        // 3. Générer le contenu ICS
        let icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Absencia//Calendar v12.0//FR',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            `X-WR-CALNAME:Absences - ${displayName}`,
            'X-WR-TIMEZONE:Europe/Paris',
        ].join('\r\n') + '\r\n';

        Object.entries(calendarData).forEach(([dateStr, status]: [string, any]) => {
            const date = dateStr.replace(/-/g, '');
            const summary = getStatusLabel(status);

            if (summary) {
                icsContent += [
                    'BEGIN:VEVENT',
                    `DTSTART;VALUE=DATE:${date}`,
                    `DTEND;VALUE=DATE:${getNextDay(dateStr)}`,
                    `SUMMARY:${summary}`,
                    'TRANSP:TRANSPARENT',
                    'END:VEVENT',
                ].join('\r\n') + '\r\n';
            }
        });

        icsContent += 'END:VCALENDAR';

        return new NextResponse(icsContent, {
            headers: {
                'Content-Type': 'text/calendar; charset=utf-8',
                'Content-Disposition': `attachment; filename="absences_${userId}.ics"`,
            },
        });
    } catch (error) {
        console.error('Error generating iCal:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

function getStatusLabel(status: any): string | null {
    if (typeof status === 'string') {
        switch (status) {
            case 'REMOTE': return '🏠 Télétravail';
            case 'LEAVE': return '🌴 Congés';
            case 'SCHOOL': return '📚 Formation';
            case 'TRAINER': return '👨‍🏫 Formateur';
            case 'MALADIE': return '🤒 Maladie';
            default: return null;
        }
    }
    // Gestion demi-journées
    if (status.am && status.pm) {
        if (status.am === status.pm) return getStatusLabel(status.am);
        return `${getStatusLabel(status.am)} (Matin) / ${getStatusLabel(status.pm)} (Après-midi)`;
    }
    if (status.am) return `${getStatusLabel(status.am)} (Matin)`;
    if (status.pm) return `${getStatusLabel(status.pm)} (Après-midi)`;
    return null;
}

function getNextDay(dateStr: string): string {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0].replace(/-/g, '');
}
