import { generateIcsContent, generateFileName } from '@/lib/services/ics-generator';
import { GenerateIcsRequest } from '@/lib/schemas/planning';

describe('Service ICS Generator', () => {
  describe('generateFileName', () => {
    it('devrait générer un nom de fichier valide', () => {
      const fileName = generateFileName('Jean Dupont');
      expect(fileName).toMatch(/^vacances-jean-dupont-\d{4}-\d{2}-\d{2}\.ics$/);
    });

    it('devrait nettoyer les caractères spéciaux', () => {
      const fileName = generateFileName('Jean-Pierre  O\'Connor');
      expect(fileName).not.toContain(' ');
      expect(fileName).not.toContain('\'');
      expect(fileName).toMatch(/\.ics$/);
    });

    it('devrait gérer les noms avec accents', () => {
      const fileName = generateFileName('François Müller');
      expect(fileName).toMatch(/\.ics$/);
    });
  });

  describe('generateIcsContent', () => {
    const validRequest: GenerateIcsRequest = {
      employeeName: 'Jean Dupont',
      periods: [
        {
          startDate: '01/01/2026',
          endDate: '15/01/2026',
          title: 'Vacances hiver',
          description: 'Repos hivernal',
        },
      ],
      timezone: 'Europe/Paris',
    };

    it('devrait générer un contenu ICS valide', async () => {
      const content = await generateIcsContent(validRequest);

      // Vérifier que le contenu commence par le header ICS
      expect(content).toContain('BEGIN:VCALENDAR');
      expect(content).toContain('END:VCALENDAR');

      // Vérifier la présence d'un événement
      expect(content).toContain('BEGIN:VEVENT');
      expect(content).toContain('END:VEVENT');

      // Vérifier le titre
      expect(content).toContain('Vacances hiver - Jean Dupont');
    });

    it('devrait générer plusieurs événements pour plusieurs périodes', async () => {
      const multiPeriodRequest: GenerateIcsRequest = {
        employeeName: 'Marie Martin',
        periods: [
          {
            startDate: '01/01/2026',
            endDate: '07/01/2026',
            title: 'Nouvel An',
          },
          {
            startDate: '15/07/2026',
            endDate: '31/07/2026',
            title: 'Été',
          },
        ],
        timezone: 'Europe/Paris',
      };

      const content = await generateIcsContent(multiPeriodRequest);

      // Compter le nombre d'événements
      const eventCount = (content.match(/BEGIN:VEVENT/g) || []).length;
      expect(eventCount).toBe(2);
    });

    it('devrait inclure le statut CONFIRMED', async () => {
      const content = await generateIcsContent(validRequest);
      expect(content).toContain('STATUS:CONFIRMED');
    });

    it('devrait inclure la catégorie Vacances', async () => {
      const content = await generateIcsContent(validRequest);
      expect(content).toContain('CATEGORIES:Vacances');
    });

    it('devrait rejeter les dates invalides', async () => {
      const invalidRequest: GenerateIcsRequest = {
        employeeName: 'Test',
        periods: [
          {
            startDate: 'invalid',
            endDate: '15/01/2026',
            title: 'Test',
          },
        ],
        timezone: 'Europe/Paris',
      };

      await expect(generateIcsContent(invalidRequest)).rejects.toThrow();
    });
  });
});
