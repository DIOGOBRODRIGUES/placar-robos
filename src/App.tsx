// App.tsx
import { useState, useMemo } from 'react';
import { initialTeams } from './data/teams';
import type { Team, Grade } from './types';
import './App.css'; // Assumindo CSS básico ou Tailwind configurado

const calculateTotalTime = (team: Team): number => {
  if (team.baseTimeSeconds === 0) return 0; // Ignora times que ainda não correram

  const penaltyTime = team.penalties * 5;
  let gradeTime = 0;
  
  if (team.parkingGrade === 'B') gradeTime = 5;
  else if (team.parkingGrade === 'C') gradeTime = 10;

  return team.baseTimeSeconds + penaltyTime + gradeTime;
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

  const updateTeam = (id: string, field: keyof Team, value: any) => {
    setTeams(prevTeams => 
      prevTeams.map(team => 
        team.id === id ? { ...team, [field]: value } : team
      )
    );
  };

  return (
    <div className="scoreboard-container">
      <header className="header">
        <h1>Placar - Corrida de Carrinhos (RACE)</h1>
      </header>

      <div className="table-wrapper">
        <table className="score-table">
          <thead>
            <tr>
              <th>Posição</th>
              <th>Equipe / Carrinho</th>
              <th>Tempo Trajeto (s)</th>
              <th>Penalidades (+5s)</th>
              <th>Estacionamento (E)</th>
              <th>Tempo Total</th>
            </tr>
          </thead>
          <tbody>
            {rankedTeams.map((team, index) => {
              const totalTime = calculateTotalTime(team);
              return (
                <tr key={team.id} className="team-row">
                  <td className="rank">#{totalTime > 0 ? index + 1 : '-'}</td>
                  
                  <td className="team-info">
                    <img src={team.logo} alt={`Logo ${team.name}`} className="team-logo" />
                    <div>
                      <strong>{team.name}</strong>
                      <span className="car-name">{team.carName}</span>
                    </div>
                  </td>

                  <td>
                    <input 
                      type="number" 
                      min="0"
                      className="input-field"
                      placeholder="Segundos"
                      value={team.baseTimeSeconds || ''}
                      onChange={(e) => updateTeam(team.id, 'baseTimeSeconds', Number(e.target.value))}
                    />
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
                      value={team.parkingGrade || ''}
                      onChange={(e) => updateTeam(team.id, 'parkingGrade', e.target.value as Grade)}
                    >
                      <option value="">-</option>
                      <option value="A">A (+0s)</option>
                      <option value="B">B (+5s)</option>
                      <option value="C">C (+10s)</option>
                    </select>
                  </td>

                  <td className="total-time">
                    {totalTime > 0 ? `${totalTime}s` : 'Pendente'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}