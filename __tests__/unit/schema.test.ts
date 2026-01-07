import {
  frenchDateSchema,
  nameSchema,
  vacationPeriodSchema,
  generateIcsRequestSchema,
  parseFrenchDate,
  formatToFrenchDate,
} from '@/lib/schemas/planning';

describe('Schémas de validation Zod', () => {
  describe('frenchDateSchema', () => {
    it('devrait accepter une date valide au format DD/MM/YYYY', () => {
      expect(frenchDateSchema.safeParse('15/01/2026').success).toBe(true);
      expect(frenchDateSchema.safeParse('01/12/2025').success).toBe(true);
      expect(frenchDateSchema.safeParse('31/12/2026').success).toBe(true);
    });

    it('devrait rejeter les dates invalides', () => {
      expect(frenchDateSchema.safeParse('2026-01-15').success).toBe(false);
      expect(frenchDateSchema.safeParse('15-01-2026').success).toBe(false);
      expect(frenchDateSchema.safeParse('32/01/2026').success).toBe(false);
      expect(frenchDateSchema.safeParse('15/13/2026').success).toBe(false);
      expect(frenchDateSchema.safeParse('').success).toBe(false);
    });
  });

  describe('nameSchema', () => {
    it('devrait accepter des noms valides', () => {
      expect(nameSchema.safeParse('Jean').success).toBe(true);
      expect(nameSchema.safeParse('Jean-Pierre').success).toBe(true);
      expect(nameSchema.safeParse("O'Connor").success).toBe(true);
      expect(nameSchema.safeParse('François Müller').success).toBe(true);
    });

    it('devrait rejeter les noms invalides', () => {
      expect(nameSchema.safeParse('J').success).toBe(false); // Trop court
      expect(nameSchema.safeParse('').success).toBe(false);
      expect(nameSchema.safeParse('Jean123').success).toBe(false);
      expect(nameSchema.safeParse('A'.repeat(51)).success).toBe(false); // Trop long
    });
  });

  describe('vacationPeriodSchema', () => {
    it('devrait accepter une période valide', () => {
      const result = vacationPeriodSchema.safeParse({
        startDate: '01/01/2026',
        endDate: '15/01/2026',
        title: 'Vacances de Noël',
        description: 'Repos bien mérité',
      });
      expect(result.success).toBe(true);
    });

    it('devrait accepter une période sans description', () => {
      const result = vacationPeriodSchema.safeParse({
        startDate: '01/01/2026',
        endDate: '15/01/2026',
        title: 'Vacances',
      });
      expect(result.success).toBe(true);
    });

    it('devrait rejeter si la date de fin est avant la date de début', () => {
      const result = vacationPeriodSchema.safeParse({
        startDate: '15/01/2026',
        endDate: '01/01/2026',
        title: 'Vacances',
      });
      expect(result.success).toBe(false);
    });

    it('devrait rejeter si le titre est manquant', () => {
      const result = vacationPeriodSchema.safeParse({
        startDate: '01/01/2026',
        endDate: '15/01/2026',
        title: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('generateIcsRequestSchema', () => {
    it('devrait accepter une requête valide', () => {
      const result = generateIcsRequestSchema.safeParse({
        employeeName: 'Jean Dupont',
        periods: [
          {
            startDate: '01/01/2026',
            endDate: '15/01/2026',
            title: 'Vacances hiver',
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('devrait rejeter une requête sans périodes', () => {
      const result = generateIcsRequestSchema.safeParse({
        employeeName: 'Jean Dupont',
        periods: [],
      });
      expect(result.success).toBe(false);
    });

    it('devrait ajouter la timezone par défaut', () => {
      const result = generateIcsRequestSchema.safeParse({
        employeeName: 'Jean Dupont',
        periods: [
          {
            startDate: '01/01/2026',
            endDate: '15/01/2026',
            title: 'Vacances',
          },
        ],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.timezone).toBe('Europe/Paris');
      }
    });
  });

  describe('Fonctions utilitaires', () => {
    it('parseFrenchDate devrait convertir une date française en Date', () => {
      const date = parseFrenchDate('15/01/2026');
      expect(date.getDate()).toBe(15);
      expect(date.getMonth()).toBe(0); // Janvier = 0
      expect(date.getFullYear()).toBe(2026);
    });

    it('formatToFrenchDate devrait formater une Date en format français', () => {
      const date = new Date(2026, 0, 15); // 15 janvier 2026
      expect(formatToFrenchDate(date)).toBe('15/01/2026');
    });
  });
});
