import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs } from 'firebase/firestore';

/**
 * Route API pour l'abonnement iCal de l'équipe
 * URL: /api/ical/team/[token]
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
        // 1. Trouver l'équipe par son teamIcalToken
        const teamsRef = collection(db, 'teams');
        const qTeam = query(teamsRef, where('teamIcalToken', '==', token));
        const teamSnapshot = await getDocs(qTeam);

        if (teamSnapshot.empty) {
            return new NextResponse('Team token not found', { status: 404 });
        }

        const teamData = teamSnapshot.docs[0].data();
        const teamId = teamSnapshot.docs[0].id;
        const teamName = teamData.name || 'Équipe';

        // 2. Trouver tous les membres de cette équipe
        const usersRef = collection(db, 'users');
        const qMembers = query(usersRef, where('teamId', '==', teamId));
        const membersSnapshot = await getDocs(qMembers);
        const members = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 3. Récupérer les calendriers pour tous les membres
        const calendarDataMap: Record<string, any> = {};
        for (const member of members) {
            const calendarRef = collection(db, 'calendars');
            const calendarSnap = await getDocs(query(calendarRef, where('userId', '==', member.id)));
            if (!calendarSnap.empty) {
                calendarDataMap[member.id] = calendarSnap.docs[0].data().data || {};
            }
        }

        // 4. Générer le contenu ICS
        let icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Absencia//Team Calendar v12.0//FR',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            `X-WR-CALNAME:Équipe - ${teamName}`,
            'X-WR-TIMEZONE:Europe/Paris',
        ].join('\r\n') + '\r\n';

        for (const member of members as any[]) {
            const calendarData = calendarDataMap[member.id] || {};
            const memberName = member.displayName || 'Membre';

            Object.entries(calendarData).forEach(([dateStr, status]: [string, any]) => {
                const date = dateStr.replace(/-/g, '');
                const summary = getStatusLabel(status, memberName);

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
        }

        icsContent += 'END:VCALENDAR';

        return new NextResponse(icsContent, {
            headers: {
                'Content-Type': 'text/calendar; charset=utf-8',
                'Content-Disposition': `attachment; filename="team_absences_${teamId}.ics"`,
            },
        });
    } catch (error) {
        console.error('Error generating Team iCal:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

function getStatusLabel(status: any, memberName: string): string | null {
    const label = (s: string) => {
        switch (s) {
            case 'REMOTE': return '🏠 TT';
            case 'LEAVE': return '🌴 Congés';
            case 'SCHOOL': return '📚 Formation';
            case 'TRAINER': return '👨‍🏫 Formateur';
            case 'MALADIE': return '🤒 Maladie';
            default: return null;
        }
    };

    if (typeof status === 'string') {
        const l = label(status);
        return l ? `${memberName} : ${l}` : null;
    }

    // Gestion demi-journées
    if (status.am && status.pm) {
        if (status.am === status.pm) return getStatusLabel(status.am, memberName);
        const lAm = label(status.am);
        const lPm = label(status.pm);
        if (!lAm && !lPm) return null;
        return `${memberName} : ${lAm || 'Pres.'} (AM) / ${lPm || 'Pres.'} (PM)`;
    }
    if (status.am) {
        const l = label(status.am);
        return l ? `${memberName} : ${l} (Matin)` : null;
    }
    if (status.pm) {
        const l = label(status.pm);
        return l ? `${memberName} : ${l} (Après-midi)` : null;
    }
    return null;
}

function getNextDay(dateStr: string): string {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0].replace(/-/g, '');
}
