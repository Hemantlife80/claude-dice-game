import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Volume2, VolumeX } from 'lucide-react';

const DiceGame: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const diceRef = useRef<THREE.Mesh | null>(null);
  
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'won'>('setup');
  const [numPlayers, setNumPlayers] = useState<number>(2);
  const [playerNames, setPlayerNames] = useState<string[]>(['Player 1', 'Player 2', 'Player 3', 'Player 4']);
  const [targetScore, setTargetScore] = useState<number>(50);
  const [currentPlayer, setCurrentPlayer] = useState<number>(0);
  const [scores, setScores] = useState<number[]>([0, 0, 0, 0]);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [rolling, setRolling] = useState<boolean>(false);
  const [rollHistory, setRollHistory] = useState<[string, number][]>([]);
  const [winner, setWinner] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [voiceMessage, setVoiceMessage] = useState<string>('');
  const [flowers, setFlowers] = useState<Array<{id: number; left: number; delay: number; duration: number}>>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Trigger win celebration
  useEffect(() => {
    if (gameState === 'won' && winner !== null) {
      playApplauseSound();
      createFlowers();
      const congratsMessage = `Congratulations ${playerNames[winner]}, you have won`;
      setVoiceMessage(congratsMessage);
      speakMessage(congratsMessage);
    }
  }, [gameState, winner]);

  // Initialize Three.js scene
  useEffect(() => {
    if (gameState !== 'playing' || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2a2a2a);
    
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 2.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const createDiceFace = (number: number): THREE.CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 128, 128);
      
      ctx.fillStyle = '#000000';
      const dotRadius = 7;
      
      const dotPositions: Record<number, [number, number][]> = {
        1: [[64, 64]],
        2: [[32, 32], [96, 96]],
        3: [[32, 32], [64, 64], [96, 96]],
        4: [[32, 32], [96, 32], [32, 96], [96, 96]],
        5: [[32, 32], [96, 32], [64, 64], [32, 96], [96, 96]],
        6: [[32, 32], [96, 32], [32, 64], [96, 64], [32, 96], [96, 96]]
      };
      
      (dotPositions[number] || []).forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      });
      
      return new THREE.CanvasTexture(canvas);
    };

    const materials = [
      new THREE.MeshStandardMaterial({ map: createDiceFace(1), roughness: 0.4 }),
      new THREE.MeshStandardMaterial({ map: createDiceFace(6), roughness: 0.4 }),
      new THREE.MeshStandardMaterial({ map: createDiceFace(2), roughness: 0.4 }),
      new THREE.MeshStandardMaterial({ map: createDiceFace(5), roughness: 0.4 }),
      new THREE.MeshStandardMaterial({ map: createDiceFace(3), roughness: 0.4 }),
      new THREE.MeshStandardMaterial({ map: createDiceFace(4), roughness: 0.4 })
    ];

    const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const dice = new THREE.Mesh(geometry, materials);
    dice.castShadow = true;
    dice.receiveShadow = true;
    scene.add(dice);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    diceRef.current = dice;

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [gameState]);

  const playSound = (frequency: number, duration: number) => {
    if (!soundEnabled) return;
    try {
      const audioContext = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
      console.log('Audio context not available');
    }
  };

  const speakMessage = (message: string) => {
    if (!soundEnabled) return;
    try {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.log('Speech synthesis not available');
    }
  };

  const playApplauseSound = () => {
    if (!soundEnabled) return;
    try {
      const audioContext = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const now = audioContext.currentTime;
      for (let i = 0; i < 12; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 150 + Math.random() * 400;
        oscillator.type = Math.random() > 0.5 ? 'sine' : 'triangle';
        
        gainNode.gain.setValueAtTime(0.3, now + i * 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.2);
        
        oscillator.start(now + i * 0.08);
        oscillator.stop(now + i * 0.08 + 0.2);
      }
    } catch (e) {
      console.log('Audio context not available');
    }
  };

  const createFlowers = () => {
    const newFlowers = [];
    for (let i = 0; i < 30; i++) {
      newFlowers.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 1
      });
    }
    setFlowers(newFlowers);
  };

  const rollDice = async () => {
    if (rolling || gameState !== 'playing') return;
    
    setRolling(true);
    playSound(800, 0.1);

    const duration = 0.8;
    const startTime = Date.now();
    const result = Math.floor(Math.random() * 6) + 1;
    
    const rotationMap: Record<number, {x: number; y: number; z: number}> = {
      1: { x: 0, y: -Math.PI / 2, z: 0 },
      2: { x: Math.PI / 2, y: 0, z: 0 },
      3: { x: 0, y: 0, z: 0 },
      4: { x: 0, y: Math.PI, z: 0 },
      5: { x: -Math.PI / 2, y: 0, z: 0 },
      6: { x: 0, y: Math.PI / 2, z: 0 }
    };
    
    const targetRotation = rotationMap[result];

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      if (diceRef.current) {
        diceRef.current.rotation.x = targetRotation.x * easeProgress + Math.sin(progress * Math.PI * 10) * (1 - progress) * 2;
        diceRef.current.rotation.y = targetRotation.y * easeProgress + Math.cos(progress * Math.PI * 10) * (1 - progress) * 2;
        diceRef.current.rotation.z = Math.random() * Math.PI * 2 * (1 - progress);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        if (diceRef.current) {
          diceRef.current.rotation.x = targetRotation.x;
          diceRef.current.rotation.y = targetRotation.y;
          diceRef.current.rotation.z = targetRotation.z;
        }
        
        setLastRoll(result);
        playSound(400, 0.2);
        setRolling(false);

        const newScores = [...scores];
        newScores[currentPlayer] += result;
        setScores(newScores);

        const newHistory: [string, number][] = [[`${playerNames[currentPlayer]}`, result], ...rollHistory].slice(0, 5);
        setRollHistory(newHistory);

        if (newScores[currentPlayer] >= targetScore) {
          setWinner(currentPlayer);
          setGameState('won');
        } else {
          const rollMessage = `${playerNames[currentPlayer]}, you have got ${result}`;
          setVoiceMessage(rollMessage);
          speakMessage(rollMessage);
          
          if (result === 6) {
            setTimeout(() => {
              const congratsMessage = `Congratulations, ${playerNames[currentPlayer]}, you have got a six number`;
              setVoiceMessage(congratsMessage);
              speakMessage(congratsMessage);
            }, 2000);
          }
          
          setCurrentPlayer((currentPlayer + 1) % numPlayers);
        }
      }
    };
    animate();
  };

  const startGame = () => {
    setScores(Array(numPlayers).fill(0));
    setCurrentPlayer(0);
    setRollHistory([]);
    setLastRoll(null);
    setWinner(null);
    setVoiceMessage('');
    setFlowers([]);
    setGameState('playing');
  };

  const resetGame = () => {
    setGameState('setup');
    setScores([0, 0, 0, 0]);
    setCurrentPlayer(0);
    setRollHistory([]);
    setLastRoll(null);
    setWinner(null);
    setVoiceMessage('');
    setFlowers([]);
  };

  // Setup Screen
  if (gameState === 'setup') {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-900 flex items-center justify-center p-6" 
           style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect fill=\'%23744210\' width=\'100\' height=\'100\'/%3E%3Cpath fill=\'%23654321\' d=\'M0 0h100v50H0z\'/%3E%3Cpath fill=\'%23845432\' d=\'M20 20h60v60H20z\'/%3E%3C/svg%3E")'}}>
        <div className="bg-white bg-opacity-95 rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-4xl font-bold text-center mb-2 text-amber-900">Dice Game</h1>
          <p className="text-center text-gray-600 mb-8">Roll to victory!</p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Number of Players</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(n => (
                  <button
                    key={n}
                    onClick={() => setNumPlayers(n)}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                      numPlayers === n
                        ? 'bg-amber-700 text-white shadow-lg scale-105'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Player Names</label>
              <div className="space-y-2">
                {Array(numPlayers).fill(0).map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`Player ${i + 1}`}
                    value={playerNames[i]}
                    onChange={(e) => {
                      const newNames = [...playerNames];
                      newNames[i] = e.target.value;
                      setPlayerNames(newNames);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Target Score</label>
              <div className="flex gap-2">
                {[30, 50, 75, 100].map(score => (
                  <button
                    key={score}
                    onClick={() => setTargetScore(score)}
                    className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${
                      targetScore === score
                        ? 'bg-amber-700 text-white shadow-lg scale-105'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-lg rounded-lg hover:from-amber-700 hover:to-amber-800 shadow-lg transform hover:scale-105 transition-all"
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Won Screen
  if (gameState === 'won') {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-900 flex items-center justify-center p-6 relative overflow-hidden" 
           style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect fill=\'%23744210\' width=\'100\' height=\'100\'/%3E%3Cpath fill=\'%23654321\' d=\'M0 0h100v50H0z\'/%3E%3Cpath fill=\'%23845432\' d=\'M20 20h60v60H20z\'/%3E%3C/svg%3E")'}}>
        
        {/* Falling Flowers */}
        {flowers.map(flower => (
          <div
            key={flower.id}
            className="absolute text-4xl"
            style={{
              left: `${flower.left}%`,
              top: '-50px',
              animation: `fall ${flower.duration}s linear ${flower.delay}s forwards`,
              opacity: 0.8
            }}
          >
            🌸
          </div>
        ))}

        <style>{`
          @keyframes fall {
            to {
              transform: translateY(100vh) rotate(360deg);
              opacity: 0;
            }
          }
        `}</style>

        <div className="text-center relative z-10">
          <div className="text-8xl mb-6 animate-bounce">🎉</div>
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            {playerNames[winner!]} Wins!
          </h1>
          <p className="text-2xl text-yellow-100 mb-4 bg-black bg-opacity-50 p-3 rounded-lg">
            {voiceMessage}
          </p>
          <p className="text-2xl text-yellow-100 mb-8">
            Final Score: {scores[winner!]} points
          </p>
          <button
            onClick={resetGame}
            className="px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-lg rounded-lg hover:from-amber-700 hover:to-amber-800 shadow-lg transform hover:scale-105 transition-all"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // Main Game Screen
  return (
    <div className="w-full h-screen bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-900 flex flex-col" 
         style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect fill=\'%23744210\' width=\'100\' height=\'100\'/%3E%3Cpath fill=\'%23654321\' d=\'M0 0h100v50H0z\'/%3E%3Cpath fill=\'%23845432\' d=\'M20 20h60v60H20z\'/%3E%3C/svg%3E")'}}>
      
      {/* Header */}
      <div className="bg-black bg-opacity-50 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dice Roller</h1>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
        >
          {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
      </div>

      <div className="flex-1 flex gap-6 p-6">
        {/* Left Sidebar - Scoreboard */}
        <div className="w-64 space-y-4">
          <div className="bg-white bg-opacity-95 rounded-xl shadow-lg p-4">
            <h2 className="font-bold text-lg text-amber-900 mb-4">Scoreboard</h2>
            <div className="space-y-2">
              {Array(numPlayers).fill(0).map((_, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg font-semibold transition-all ${
                    currentPlayer === i
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="text-sm opacity-75">{playerNames[i]}</div>
                  <div className="text-2xl">{scores[i]}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-300">
              <p className="text-sm text-gray-700">Target: <span className="font-bold">{targetScore}</span></p>
            </div>
          </div>

          {/* Roll History */}
          <div className="bg-white bg-opacity-95 rounded-xl shadow-lg p-4">
            <h3 className="font-bold text-amber-900 mb-3">Recent Rolls</h3>
            <div className="space-y-2">
              {rollHistory.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No rolls yet</p>
              ) : (
                rollHistory.map((roll, i) => (
                  <div key={i} className="flex justify-between items-center bg-gray-100 p-2 rounded-lg">
                    <span className="text-sm font-semibold text-gray-700">{roll[0]}</span>
                    <span className="bg-amber-600 text-white px-3 py-1 rounded-full font-bold text-sm">{roll[1]}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Center - Dice and Roll */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <div
            ref={containerRef}
            className="w-80 h-80 bg-gray-900 rounded-xl shadow-2xl"
          />
          
          <div className="text-center">
            <p className="text-white text-lg mb-4">Current Player: <span className="font-bold text-amber-300">{playerNames[currentPlayer]}</span></p>
            {voiceMessage && (
              <p className="text-yellow-200 text-sm mb-4 bg-black bg-opacity-50 p-2 rounded-lg">{voiceMessage}</p>
            )}
            {lastRoll && (
              <div className="text-7xl font-bold text-amber-300 drop-shadow-lg animate-bounce">
                {lastRoll}
              </div>
            )}
          </div>

          <button
            onClick={rollDice}
            disabled={rolling}
            className={`px-12 py-4 rounded-lg font-bold text-lg transition-all transform ${
              rolling
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:scale-110 shadow-lg active:scale-95'
            }`}
          >
            {rolling ? 'Rolling...' : 'Roll Dice'}
          </button>

          <button
            onClick={resetGame}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
          >
            End Game
          </button>
        </div>

        {/* Right Sidebar - Empty for balance */}
        <div className="w-64"></div>
      </div>
    </div>
  );
};

export default DiceGame;