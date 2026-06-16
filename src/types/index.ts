export type Grade = 'A' | 'B' | 'C' | null;

export interface Team {
  id: string;
  name: string;
  carName: string;
  logo: string;
  round1TimeSeconds: number;
  round1TimeHundredths: number;
  round2TimeSeconds: number;
  round2TimeHundredths: number;
  penalties: number;
  arrivalGrade: Grade;
}