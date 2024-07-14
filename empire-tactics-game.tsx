import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Users, Expand, Sword, RotateCw } from 'lucide-react';

const GRID_SIZE = 5;
const INITIAL_GOLD = 100;
const INITIAL_ARMY = 10;
const RECRUIT_COST = 10;
const EXPAND_COST = 50;
const EXPAND_ARMY_COST = 5;

const Empire = () => {
  const [grid, setGrid] = useState(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null)));
  const [playerGold, setPlayerGold] = useState(INITIAL_GOLD);
  const [playerArmy, setPlayerArmy] = useState(INITIAL_ARMY);
  const [aiGold, setAiGold] = useState(INITIAL_GOLD);
  const [aiArmy, setAiArmy] = useState(INITIAL_ARMY);
  const [turn, setTurn] = useState('player');
  const [message, setMessage] = useState('Welcome to Empire Tactics!');
  const [selectedAction, setSelectedAction] = useState(null);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (turn === 'ai') {
      setTimeout(aiTurn, 1000);
    }
  }, [turn]);

  const initializeGame = () => {
    const newGrid = [...grid];
    newGrid[0][0] = 'player';
    newGrid[GRID_SIZE - 1][GRID_SIZE - 1] = 'ai';
    setGrid(newGrid);
  };

  const recruit = () => {
    if (playerGold >= RECRUIT_COST) {
      setPlayerGold(playerGold - RECRUIT_COST);
      setPlayerArmy(playerArmy + 1);
      setMessage('Recruited 1 army unit.');
    } else {
      setMessage('Not enough gold to recruit.');
    }
  };

  const expand = (row, col) => {
    if (playerGold >= EXPAND_COST && playerArmy >= EXPAND_ARMY_COST) {
      const newGrid = [...grid];
      newGrid[row][col] = 'player';
      setGrid(newGrid);
      setPlayerGold(playerGold - EXPAND_COST);
      setPlayerArmy(playerArmy - EXPAND_ARMY_COST);
      setMessage('Expanded to a new territory.');
    } else {
      setMessage('Not enough resources to expand.');
    }
  };

  const battle = (row, col) => {
    if (playerArmy > 0) {
      const attackStrength = Math.random();
      const defenseStrength = Math.random();
      if (attackStrength > defenseStrength) {
        const newGrid = [...grid];
        newGrid[row][col] = 'player';
        setGrid(newGrid);
        setPlayerArmy(playerArmy - 1);
        setAiArmy(aiArmy - 1);
        setMessage('Battle won! Captured enemy territory.');
      } else {
        setPlayerArmy(playerArmy - 1);
        setMessage('Battle lost. Lost 1 army unit.');
      }
    } else {
      setMessage('No army units available for battle.');
    }
  };

  const endTurn = () => {
    const playerTerritories = grid.flat().filter(cell => cell === 'player').length;
    setPlayerGold(playerGold + playerTerritories * 10);
    setTurn('ai');
    setMessage("AI's turn.");
  };

  const aiTurn = () => {
    let action = Math.random();
    if (action < 0.4 && aiGold >= RECRUIT_COST) {
      setAiGold(aiGold - RECRUIT_COST);
      setAiArmy(aiArmy + 1);
      setMessage('AI recruited 1 army unit.');
    } else if (action < 0.7 && aiGold >= EXPAND_COST && aiArmy >= EXPAND_ARMY_COST) {
      const emptyCells = grid.flatMap((row, i) => 
        row.map((cell, j) => cell === null ? [i, j] : null).filter(Boolean)
      );
      if (emptyCells.length > 0) {
        const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const newGrid = [...grid];
        newGrid[row][col] = 'ai';
        setGrid(newGrid);
        setAiGold(aiGold - EXPAND_COST);
        setAiArmy(aiArmy - EXPAND_ARMY_COST);
        setMessage('AI expanded to a new territory.');
      }
    } else if (aiArmy > 0) {
      const playerCells = grid.flatMap((row, i) => 
        row.map((cell, j) => cell === 'player' ? [i, j] : null).filter(Boolean)
      );
      if (playerCells.length > 0) {
        const [row, col] = playerCells[Math.floor(Math.random() * playerCells.length)];
        const attackStrength = Math.random();
        const defenseStrength = Math.random();
        if (attackStrength > defenseStrength) {
          const newGrid = [...grid];
          newGrid[row][col] = 'ai';
          setGrid(newGrid);
          setAiArmy(aiArmy - 1);
          setPlayerArmy(playerArmy - 1);
          setMessage('AI won a battle and captured your territory!');
        } else {
          setAiArmy(aiArmy - 1);
          setMessage('AI lost a battle.');
        }
      }
    }
    const aiTerritories = grid.flat().filter(cell => cell === 'ai').length;
    setAiGold(aiGold + aiTerritories * 10);
    setTurn('player');
    checkWinCondition();
  };

  const checkWinCondition = () => {
    const playerTerritories = grid.flat().filter(cell => cell === 'player').length;
    const aiTerritories = grid.flat().filter(cell => cell === 'ai').length;
    if (playerTerritories === GRID_SIZE * GRID_SIZE) {
      setMessage('Congratulations! You have conquered the entire empire!');
      setTurn('game over');
      return true;
    } else if (aiTerritories === GRID_SIZE * GRID_SIZE) {
      setMessage('Game Over. The AI has conquered the entire empire.');
      setTurn('game over');
      return true;
    }
    return false;
  };

  const renderGrid = () => {
    return grid.map((row, i) => (
      <div key={i} className="flex">
        {row.map((cell, j) => (
          <div
            key={j}
            className={`w-12 h-12 border border-gray-300 flex items-center justify-center cursor-pointer ${
              cell === 'player' ? 'bg-blue-500' : cell === 'ai' ? 'bg-red-500' : 'bg-gray-100'
            }`}
            onClick={() => handleCellClick(i, j)}
          >
            {cell && <div className="w-4 h-4 rounded-full bg-white" />}
          </div>
        ))}
      </div>
    ));
  };

  const handleCellClick = (row, col) => {
    if (turn !== 'player') return;
    
    const cell = grid[row][col];
    if (selectedAction === 'expand' && cell === null) {
      if (isAdjacentToPlayer(row, col)) {
        expand(row, col);
      } else {
        setMessage('You can only expand to adjacent territories.');
      }
    } else if (selectedAction === 'battle' && cell === 'ai') {
      if (isAdjacentToPlayer(row, col)) {
        battle(row, col);
      } else {
        setMessage('You can only battle adjacent enemy territories.');
      }
    }
    
    setSelectedAction(null);
    checkWinCondition();
  };

  const isAdjacentToPlayer = (row, col) => {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    return directions.some(([dx, dy]) => {
      const newRow = row + dx;
      const newCol = col + dy;
      return newRow >= 0 && newRow < GRID_SIZE && newCol >= 0 && newCol < GRID_SIZE && grid[newRow][newCol] === 'player';
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Empire Tactics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <div>
            <p className="font-bold">Player</p>
            <p>Gold: {playerGold}</p>
            <p>Army: {playerArmy}</p>
          </div>
          <div className="text-right">
            <p className="font-bold">AI</p>
            <p>Gold: {aiGold}</p>
            <p>Army: {aiArmy}</p>
          </div>
        </div>
        <div className="mb-4">{renderGrid()}</div>
        <div className="flex justify-between mb-4">
          <Button onClick={recruit} disabled={turn !== 'player'}>
            <Users className="mr-2 h-4 w-4" /> Recruit (10 Gold)
          </Button>
          <Button onClick={() => setSelectedAction('expand')} disabled={turn !== 'player'}>
            <Expand className="mr-2 h-4 w-4" /> Expand (50 Gold, 5 Army)
          </Button>
          <Button onClick={() => setSelectedAction('battle')} disabled={turn !== 'player'}>
            <Sword className="mr-2 h-4 w-4" /> Battle
          </Button>
          <Button onClick={endTurn} disabled={turn !== 'player'}>
            <RotateCw className="mr-2 h-4 w-4" /> End Turn
          </Button>
        </div>
        <div className="text-center text-sm">
          <AlertCircle className="inline-block mr-2 h-4 w-4" />
          {message}
        </div>
      </CardContent>
    </Card>
  );
};

export default Empire;
