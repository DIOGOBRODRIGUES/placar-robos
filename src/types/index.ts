export type Grade = 'A' | 'B' | 'C' | null;

export interface Team {
  id: string;
  name: string;
  carName: string;
  logo: string;
  baseTimeSeconds: number;
  penalties: number;
  parkingGrade: Grade;
}