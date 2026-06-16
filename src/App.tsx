// App.tsx
import { useState, useMemo } from 'react';
import { initialTeams } from './data/teams';
import type { Team, Grade } from './types';
import './App.css'; // Assumindo CSS básico ou Tailwind configurado

const formatTime = (totalHundredths: number): string => {
  const totalSeconds = Math.floor(totalHundredths / 100);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hundredths = totalHundredths % 100;
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
};

const calculateTotalTime = (team: Team): number => {
  const raceTimeHundredths =
    (team.round1TimeSeconds * 100) +
    team.round1TimeHundredths +
    (team.round2TimeSeconds * 100) +
    team.round2TimeHundredths;

  if (raceTimeHundredths === 0) return 0; // Ignora times que ainda não correram

  const penaltyTime = team.penalties * 500;
  let gradeTime = 0;
  
  if (team.arrivalGrade === 'B') gradeTime = 500;
  else if (team.arrivalGrade === 'C') gradeTime = 1500;

  return raceTimeHundredths + penaltyTime + gradeTime;
};

const createTimeUpdater = (
  updateTeam: (id: string, field: keyof Team, value: any) => void,
  teamId: string,
  field: 'round1TimeSeconds' | 'round1TimeHundredths' | 'round2TimeSeconds' | 'round2TimeHundredths',
  minutes: number,
  secondsOrHundredths: number
) => {
  const safeMinutes = Number.isFinite(minutes) ? Math.max(0, minutes) : 0;
  const safeUnit = Number.isFinite(secondsOrHundredths) ? Math.max(0, secondsOrHundredths) : 0;

  if (field === 'round1TimeHundredths' || field === 'round2TimeHundredths') {
    updateTeam(teamId, field, safeUnit);
    return;
  }

  updateTeam(teamId, field, safeMinutes * 60 + safeUnit);
};

export default function RobotRaceScoreboard() {
  const [teams, setTeams] = useState<Team[]>(initialTeams);

  // Ordena as equipes pelo tempo total (excluindo os que têm tempo 0)
  const rankedTeams = useMemo(() => {
    return [...teams].sort((a, b) => {
      const timeA = calculateTotalTime(a);
      const timeB = calculateTotalTime(b);
      if (timeA === 0) return 1;
      if (timeB === 0) return -1;
      return timeA - timeB;
    });
  }, [teams]);

  const completedTeams = useMemo(
    () => rankedTeams.filter(team => calculateTotalTime(team) > 0),
    [rankedTeams]
  );

  const fastestTeam = completedTeams[0] ?? null;

  const updateTeam = (id: string, field: keyof Team, value: any) => {
    setTeams(prevTeams => 
      prevTeams.map(team => 
        team.id === id ? { ...team, [field]: value } : team
      )
    );
  };

  return (
    <div className="scoreboard-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="hero-card">
        <div className="hero-brand">
          <img src="/logos/UNINASSAU.png" alt="Logo UNINASSAU" className="hero-logo" />
          <div>
            <span className="eyebrow">UNINASSAU apresenta</span>
            <h1>VELOZES E CIRCUITOSOS</h1>
            <p>Corrida em duas rodadas, com ranking final pela soma dos tempos e das penalidades.</p>
          </div>
        </div>

        <div className="hero-stats">
          <article className="stat-card">
            <span className="stat-label">Equipes</span>
            <strong>{teams.length}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">Concluídas</span>
            <strong>{completedTeams.length}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">Líder</span>
            <strong>{fastestTeam ? fastestTeam.name : 'Aguardando'}</strong>
          </article>
        </div>
      </header>

      <main className="table-shell">
        <div className="table-shell-header">
          <div>
            <span className="section-label">Painel de corrida</span>
            <h2>Ranking em tempo real</h2>
          </div>
          <div className="live-pill">Ao vivo</div>
        </div>

        <div className="table-wrapper">
          <table className="score-table">
            <thead>
              <tr>
                <th>Posição</th>
                <th>Equipe / Carrinho</th>
                <th>Rodada 1</th>
                <th>Rodada 2</th>
                <th>Penalidades (+5s)</th>
                <th>Nota de Chegada</th>
                <th>Tempo Total</th>
              </tr>
            </thead>
            <tbody>
              {rankedTeams.map((team, index) => {
                const totalTime = calculateTotalTime(team);
                const isFinished = totalTime > 0;
                return (
                  <tr key={team.id} className={`team-row ${isFinished ? 'team-row-finished' : ''}`}>
                    <td className="rank">#{isFinished ? index + 1 : '-'}</td>
                    
                    <td className="team-info">
                      <img src={team.logo} alt={`Logo ${team.name}`} className="team-logo" />
                      <div>
                        <strong>{team.name}</strong>
                        <span className="car-name">{team.carName}</span>
                      </div>
                    </td>

                    <td>
                      <div className="time-group">
                        <input
                          type="number"
                          min="0"
                          className="input-field input-field-minutes"
                          placeholder="Min"
                          value={team.round1TimeSeconds > 0 ? Math.floor(team.round1TimeSeconds / 60) : ''}
                          onChange={(e) => {
                            const minutes = Number(e.target.value);
                            const seconds = team.round1TimeSeconds % 60;
                            createTimeUpdater(updateTeam, team.id, 'round1TimeSeconds', minutes, seconds);
                          }}
                        />
                        <span className="time-separator">:</span>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          className="input-field input-field-seconds"
                          placeholder="Seg"
                          value={team.round1TimeSeconds > 0 ? team.round1TimeSeconds % 60 : ''}
                          onChange={(e) => {
                            const minutes = Math.floor(team.round1TimeSeconds / 60);
                            const seconds = Number(e.target.value);
                            createTimeUpdater(updateTeam, team.id, 'round1TimeSeconds', minutes, seconds);
                          }}
                        />
                        <input
                          type="number"
                          min="0"
                          max="99"
                          className="input-field input-field-hundredths"
                          placeholder="Cs"
                          value={team.round1TimeHundredths > 0 ? team.round1TimeHundredths : ''}
                          onChange={(e) => {
                            const hundredths = Number(e.target.value);
                            createTimeUpdater(updateTeam, team.id, 'round1TimeHundredths', 0, hundredths);
                          }}
                        />
                      </div>
                    </td>

                    <td>
                      <div className="time-group">
                        <input
                          type="number"
                          min="0"
                          className="input-field input-field-minutes"
                          placeholder="Min"
                          value={team.round2TimeSeconds > 0 ? Math.floor(team.round2TimeSeconds / 60) : ''}
                          onChange={(e) => {
                            const minutes = Number(e.target.value);
                            const seconds = team.round2TimeSeconds % 60;
                            createTimeUpdater(updateTeam, team.id, 'round2TimeSeconds', minutes, seconds);
                          }}
                        />
                        <span className="time-separator">:</span>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          className="input-field input-field-seconds"
                          placeholder="Seg"
                          value={team.round2TimeSeconds > 0 ? team.round2TimeSeconds % 60 : ''}
                          onChange={(e) => {
                            const minutes = Math.floor(team.round2TimeSeconds / 60);
                            const seconds = Number(e.target.value);
                            createTimeUpdater(updateTeam, team.id, 'round2TimeSeconds', minutes, seconds);
                          }}
                        />
                        <input
                          type="number"
                          min="0"
                          max="99"
                          className="input-field input-field-hundredths"
                          placeholder="Cs"
                          value={team.round2TimeHundredths > 0 ? team.round2TimeHundredths : ''}
                          onChange={(e) => {
                            const hundredths = Number(e.target.value);
                            createTimeUpdater(updateTeam, team.id, 'round2TimeHundredths', 0, hundredths);
                          }}
                        />
                      </div>
                    </td>

                    <td>
                      <input 
                        type="number" 
                        min="0"
                        className="input-field"
                        value={team.penalties}
                        onChange={(e) => updateTeam(team.id, 'penalties', Number(e.target.value))}
                      />
                    </td>

                    <td>
                      <select 
                        className="select-field"
                        value={team.arrivalGrade || ''}
                        onChange={(e) => updateTeam(team.id, 'arrivalGrade', e.target.value as Grade)}
                      >
                        <option value="">-</option>
                        <option value="A">A (+0s)</option>
                        <option value="B">B (+5s)</option>
                        <option value="C">C (+15s)</option>
                      </select>
                    </td>

                    <td className="total-time">
                      {totalTime > 0 ? formatTime(totalTime) : 'Pendente'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}