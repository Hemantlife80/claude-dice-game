import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';

// --- Adsterra Ad Components (Reusable and Stable) ---

const HeaderAdSpace: React.FC = () => {
  const adLoaded = useRef(false);

  useEffect(() => {
    // This effect runs only once when the component mounts
    if (adLoaded.current) {
      return; // If ad is already loaded, do nothing
    }

    const containerId = 'adsterra-banner-header';
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
      // Clear any previous content just in case
      container.innerHTML = '';

      // Set atOptions on the window object
      (window as any).atOptions = {
        'key': '6fad9591d92e09530553ac6bf74d9820',
        'format': 'iframe',
        'height': 90,
        'width': 728,
        'params': {}
      };

      // Create and append the invoke script
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = '//www.highperformanceformat.com/6fad9591d92e09530553ac6bf74d9820/invoke.js';
      script.async = true;
      container.appendChild(script);

      adLoaded.current = true; // Mark the ad as loaded
    } catch (e) {
      console.error('Banner ad error:', e);
    }
  }, []); // Empty dependency array ensures this runs only once

  return (
    <div className="w-full flex justify-center items-center bg-amber-900" style={{ height: '90px', overflow: 'hidden' }}>
      <div id="adsterra-banner-header" className="flex justify-center items-center"></div>
    </div>
  );
};

const FooterAdSpace: React.FC = () => {
  const adLoaded = useRef(false);

  useEffect(() => {
    // This effect runs only once when the component mounts
    if (adLoaded.current) {
      return; // If ad is already loaded, do nothing
    }

    const containerId = 'container-5b5e30a41ac609068bc85f8481dde86b';
    const scriptSrc = '//pl27998959.effectivegatecpm.com/5b5e30a41ac609068bc85f8481dde86b/invoke.js';

    try {
      const adContainer = document.getElementById('footer-ad-wrapper');
      if (!adContainer) return;

      // Clear any previous content
      adContainer.innerHTML = '';

      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = scriptSrc;

      const adDiv = document.createElement('div');
      adDiv.id = containerId;

      adContainer.appendChild(script);
      adContainer.appendChild(adDiv);

      adLoaded.current = true; // Mark the ad as loaded
    } catch (e) {
      console.error('Native ad error:', e);
    }
  }, []); // Empty dependency array ensures this runs only once

  return (
    <div id="footer-ad-wrapper" className="w-full flex justify-center items-center bg-amber-900" style={{ height: 'auto', minHeight: '60px', overflow: 'hidden' }}>
      {/* The ad script will populate this div */}
    </div>
  );
};


// --- Main DiceGame Component ---
const DiceGame: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const diceRef = useRef<THREE.Mesh | null>(null);
  const animationIdRef = useRef<number | null>(null);
  
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
  const [soundEnabled] = useState<boolean>(true);
  const [voiceMessage, setVoiceMessage] = useState<string>('');
  const [flowers, setFlowers] = useState<Array<{id: number; left: number; delay: number; duration: number}>>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  const speakMessage = useCallback((message: string) => {
    if (!soundEnabled) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      window.speechSynthesis.speak(utterance);
    } catch (e) { 
      console.error('Speech error:', e); 
    }
  }, [soundEnabled]);

  const playSound = useCallback((frequency: number, duration: number) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const audioContext = audioContextRef.current || new AudioCtx();
      audioContextRef.current = audioContext;
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = frequency;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (e) { 
      console.error('Sound error:', e); 
    }
  }, [soundEnabled]);

  const playApplauseSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const audioContext = audioContextRef.current || new AudioCtx();
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
      console.error('Applause error:', e); 
    }
  }, [soundEnabled]);

  const createFlowers = useCallback(() => {
    const newFlowers = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 1
    }));
    setFlowers(newFlowers);
  }, []);

  useEffect(() => {
    if (gameState === 'won' && winner !== null) {
      try {
        playApplauseSound();
        createFlowers();
        const congratsMessage = `Congratulations ${playerNames[winner]}, you won!`;
        setVoiceMessage(congratsMessage);
        speakMessage(congratsMessage);
      } catch (e) {
        console.error('Win state error:', e);
      }
    }
  }, [gameState, winner, playerNames, speakMessage, playApplauseSound, createFlowers]);

  // Three.js setup
  useEffect(() => {
    if (gameState !== 'playing') {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      return;
    }

    const container = containerRef.current;
    if (!container) {
      console.error('Container not found');
      return;
    }

    let renderer: THREE.WebGLRenderer | null = null;
    let camera: THREE.PerspectiveCamera | null = null;

    try {
      if (container.querySelector('canvas')) return; // Already initialized

      const width = container.clientWidth;
      const height = container.clientHeight;

      if (width === 0 || height === 0) return;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x2a2a2a);

      camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 2.5;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      container.appendChild(renderer.domElement);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      const createDiceFace = (number: number): THREE.CanvasTexture => {
        const canvas = document.createElement('canvas');
        canvas.width = 128; canvas.height = 128;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context');
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 128, 128);
        ctx.fillStyle = '#000000';
        const dotPositions: Record<number, [number, number][]> = {
          1: [[64, 64]], 2: [[32, 32], [96, 96]], 3: [[32, 32], [64, 64], [96, 96]],
          4: [[32, 32], [96, 32], [32, 96], [96, 96]], 5: [[32, 32], [96, 32], [64, 64], [32, 96], [96, 96]],
          6: [[32, 32], [96, 32], [32, 64], [96, 64], [32, 96], [96, 96]]
        };
        (dotPositions[number] || []).forEach(([x, y]) => {
          ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
        });
        return new THREE.CanvasTexture(canvas);
      };

      const materials = [
        new THREE.MeshStandardMaterial({ map: createDiceFace(1) }), new THREE.MeshStandardMaterial({ map: createDiceFace(6) }),
        new THREE.MeshStandardMaterial({ map: createDiceFace(2) }), new THREE.MeshStandardMaterial({ map: createDiceFace(5) }),
        new THREE.MeshStandardMaterial({ map: createDiceFace(3) }), new THREE.MeshStandardMaterial({ map: createDiceFace(4) })
      ];

      const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
      const dice = new THREE.Mesh(geometry, materials);
      dice.castShadow = true; dice.receiveShadow = true;
      scene.add(dice);
      diceRef.current = dice;

      const animate = () => {
        animationIdRef.current = requestAnimationFrame(animate);
        if(renderer && camera) renderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        const newWidth = container?.clientWidth || 0;
        const newHeight = container?.clientHeight || 0;
        if (newWidth > 0 && newHeight > 0 && renderer && camera) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      };
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
        if (container && renderer) {
           if (container.contains(renderer.domElement)) {
               container.removeChild(renderer.domElement);
           }
        }
        renderer?.dispose();
      };
    } catch (error) {
      console.error('Three.js error:', error);
    }
  }, [gameState]);

  const rollDice = () => {
    if (rolling || gameState !== 'playing' || !diceRef.current) return;
    try {
      setRolling(true);
      playSound(800, 0.1);
      const startTime = Date.now();
      const result = Math.floor(Math.random() * 6) + 1;
      const rotationMap: Record<number, {x: number; y: number; z: number}> = {
        1: { x: 0, y: -Math.PI / 2, z: 0 }, 2: { x: Math.PI / 2, y: 0, z: 0 }, 3: { x: 0, y: 0, z: 0 },
        4: { x: 0, y: Math.PI, z: 0 }, 5: { x: -Math.PI / 2, y: 0, z: 0 }, 6: { x: 0, y: Math.PI / 2, z: 0 }
      };
      const targetRotation = rotationMap[result];
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / 800, 1);
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
          const newRoll: [string, number] = [playerNames[currentPlayer], result];
          setRollHistory([newRoll, ...rollHistory].slice(0, 5));
          if (newScores[currentPlayer] >= targetScore) {
            setWinner(currentPlayer);
            setGameState('won');
          } else {
            const msg = `${playerNames[currentPlayer]}, you rolled ${result}`;
            setVoiceMessage(msg);
            speakMessage(msg);
            if (result === 6) {
              setTimeout(() => {
                speakMessage(`Congratulations ${playerNames[currentPlayer]} you got a six!`);
              }, 2000);
            }
            setCurrentPlayer((prev) => (prev + 1) % numPlayers);
          }
        }
      };
      animate();
    } catch (error) {
      console.error('Roll error:', error);
      setRolling(false);
    }
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

  // Render functions
  const renderScreen = () => {
    if (gameState === 'setup') {
      return (
        <div className="flex-1 flex items-center justify-center p-2">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h1 className="text-3xl font-bold text-center mb-1 text-amber-900">Dice Game</h1>
            <p className="text-center text-gray-600 mb-6 text-sm">Roll to victory!</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Players</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(n => (<button key={n} onClick={() => setNumPlayers(n)} className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${numPlayers === n ? 'bg-amber-700 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>{n}</button>))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Names</label>
                {Array.from({ length: numPlayers }).map((_, i) => (<input key={i} type="text" placeholder={`Player ${i + 1}`} value={playerNames[i]} onChange={(e) => { const newNames = [...playerNames]; newNames[i] = e.target.value || `Player ${i + 1}`; setPlayerNames(newNames); }} className="w-full px-2 py-1 border border-gray-300 rounded-lg mb-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700" />))}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Target</label>
                <div className="flex gap-1">
                  {[30, 50, 75, 100].map(score => (<button key={score} onClick={() => setTargetScore(score)} className={`flex-1 py-1 rounded-lg font-semibold text-xs transition-all ${targetScore === score ? 'bg-amber-700 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>{score}</button>))}
                </div>
              </div>
              <button onClick={startGame} className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-sm rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all">Start Game</button>
            </div>
          </div>
        </div>
      );
    }

    if (gameState === 'won' && winner !== null) {
      return (
        <div className="flex-1 flex items-center justify-center p-2 relative overflow-hidden">
          {flowers.map(flower => (<div key={flower.id} className="absolute text-3xl" style={{left: `${flower.left}%`, top: '-30px', animation: `fall ${flower.duration}s linear ${flower.delay}s forwards`}}>🌸</div>))}
          <style>{`@keyframes fall { to { transform: translateY(100vh) rotate(360deg); opacity: 0; } }`}</style>
          <div className="text-center">
            <div className="text-6xl mb-3 animate-bounce">🎉</div>
            <h1 className="text-4xl font-bold text-white mb-2">{playerNames[winner]} Wins!</h1>
            <p className="text-lg text-yellow-100 mb-4">Final Score: {scores[winner]}</p>
            <button onClick={resetGame} className="px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-sm rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all">Play Again</button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="w-full h-full flex gap-2 p-2 overflow-hidden">
        <div className="w-48 space-y-2 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-lg p-2">
            <h2 className="font-bold text-sm text-amber-900 mb-2">Scores</h2>
            {Array.from({ length: numPlayers }).map((_, i) => (<div key={i} className={`p-1 rounded-lg font-semibold text-xs mb-1 transition-all ${currentPlayer === i ? 'bg-amber-600 text-white' : 'bg-gray-100'}`}>
              <div className="opacity-75">{playerNames[i]}</div>
              <div className="text-lg">{scores[i]}</div>
            </div>))}
            <div className="mt-1 pt-1 border-t text-xs text-gray-700">Target: {targetScore}</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-2">
            <h3 className="font-bold text-amber-900 mb-1 text-xs">Recent</h3>
            {rollHistory.length === 0 ? (<p className="text-gray-500 text-xs text-center py-1">No rolls</p>) : (
              rollHistory.map((roll, i) => (<div key={i} className="flex justify-between items-center bg-gray-100 p-0.5 rounded-lg mb-0.5 text-xs">
                <span className="truncate">{roll[0]}</span>
                <span className="bg-amber-600 text-white px-1 py-0 rounded font-bold text-xs">{roll[1]}</span>
              </div>))
            )}
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-1">
          <div ref={containerRef} className="w-48 h-48 bg-gray-900 rounded-lg shadow-xl" />
          <p className="text-white text-xs"><span className="font-bold text-amber-300">{playerNames[currentPlayer]}</span>'s Turn</p>
          {voiceMessage && <p className="text-yellow-200 text-xs text-center bg-black bg-opacity-50 p-1 rounded max-w-xs">{voiceMessage}</p>}
          {lastRoll && <div className="text-3xl font-bold text-amber-300 animate-bounce">{lastRoll}</div>}
          <button onClick={rollDice} disabled={rolling} className={`px-4 py-1 rounded-lg font-bold text-xs transition-all ${rolling ? 'bg-gray-500 cursor-not-allowed text-gray-300' : 'bg-green-600 hover:bg-green-700 text-white'}`}>{rolling ? 'Rolling...' : 'Roll Dice'}</button>
          <button onClick={resetGame} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-xs">End Game</button>
        </div>
        <div className="w-48 flex-shrink-0" />
      </div>
    );
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-900 flex flex-col">
      <HeaderAdSpace />
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderScreen()}
      </div>
      <FooterAdSpace />
    </div>
  );
};

export default DiceGame;