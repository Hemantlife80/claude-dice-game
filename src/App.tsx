import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { Volume2, VolumeX } from 'lucide-react';

// --- Adsterra Ad Components (Final, Robust Version) ---

// Component for the 728x90 Banner Ad
const Banner728x90Ad: React.FC<{ adKey: string }> = React.memo(({ adKey }) => {
  useEffect(() => {
    const adContainer = document.getElementById(`ad-container-banner-${adKey}`);
    if (adContainer && adContainer.children.length === 0) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = `
        atOptions = {
          'key' : 'fdc37f8272fccef0821d6e27c13e1e96',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
        document.write('<scr' + 'ipt type="text/javascript" src="//www.highperformanceformat.com/fdc37f8272fccef0821d6e27c13e1e96/invoke.js"></scr' + 'ipt>');
      `;
      adContainer.appendChild(script);
    }
  }, [adKey]);

  return <div id={`ad-container-banner-${adKey}`} className="flex justify-center items-center w-[728px] h-[90px]"></div>;
});

// Component for the Native Banner Ad
const NativeBannerAd: React.FC<{ adKey: string }> = React.memo(({ adKey }) => {
  useEffect(() => {
    const containerId = `container-native-${adKey}`;
    const adContainer = document.getElementById(containerId);

    if (adContainer && adContainer.children.length === 0) {
        const script = document.createElement('script');
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        script.src = '//pl27986393.effectivegatecpm.com/15a1a2f7e865b1d8473f6b64872de991/invoke.js';
        
        const adDiv = document.createElement('div');
        adDiv.id = 'container-15a1a2f7e865b1d8473f6b64872de991'; // Adsterra requires this exact ID
        
        adContainer.appendChild(script);
        adContainer.appendChild(adDiv);
    }
  }, [adKey]);

  return <div id={containerId} className="flex justify-center items-center"></div>;
});


// --- Ad Space Styling Wrappers (Final Version) ---
// Ad Box is removed. Ads will now blend with the background.
const HeaderAdSpace: React.FC<{ adKey: string }> = ({ adKey }) => (
  <div className="flex justify-center items-center w-full py-2 z-20">
    <Banner728x90Ad adKey={`header-${adKey}`} />
  </div>
);

const FooterAdSpace: React.FC<{ adKey: string }> = ({ adKey }) => (
  <div className="flex justify-center items-center w-full py-2 z-20">
    <NativeBannerAd adKey={`footer-${adKey}`} />
  </div>
);


// --- Your Main DiceGame Component (Final Version) ---

const DiceGame: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
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

  // All utility functions (speakMessage, playSound, etc.) remain the same...
  const speakMessage = useCallback((message: string) => {
    if (!soundEnabled || typeof window.speechSynthesis === 'undefined') return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterterance(message);
      window.speechSynthesis.speak(utterance);
    } catch (e) { console.log('Speech synthesis not available', e); }
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
    } catch (e) { console.log('Audio context not available', e); }
  }, [soundEnabled]);

  const playApplauseSound = useCallback(() => {
    // ... function content ...
  }, [soundEnabled]);

  const createFlowers = useCallback(() => {
    // ... function content ...
  }, []);

  useEffect(() => {
    if (gameState === 'won' && winner !== null) {
      // ... function content ...
    }
  }, [gameState, winner, playerNames, speakMessage, playApplauseSound, createFlowers]);


  useEffect(() => {
    if (gameState !== 'playing' || !containerRef.current) return;
    // ... (Three.js setup code remains unchanged) ...
  }, [gameState]);
  
  const rollDice = async () => {
    // ... (rollDice logic remains unchanged) ...
  };

  const startGame = () => {
    // ... (startGame logic remains unchanged) ...
  };

  const resetGame = () => {
    // ... (resetGame logic remains unchanged) ...
  };

  const renderContent = () => {
    if (gameState === 'setup') {
      return (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white bg-opacity-95 rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h1 className="text-4xl font-bold text-center mb-2 text-amber-900">Dice Game</h1>
            <p className="text-center text-gray-600 mb-8">Roll to victory!</p>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Number of Players</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(n => (<button key={n} onClick={() => setNumPlayers(n)} className={`flex-1 py-3 rounded-lg font-semibold transition-all ${numPlayers === n ? 'bg-amber-700 text-white shadow-lg scale-105' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{n}</button>))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Player Names</label>
                <div className="space-y-2">
                  {Array.from({length: numPlayers}).map((_, i) => (<input key={i} type="text" placeholder={`Player ${i + 1}`} value={playerNames[i]} onChange={(e) => { const newNames = [...playerNames]; newNames[i] = e.target.value || `Player ${i+1}`; setPlayerNames(newNames); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700" />))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Target Score</label>
                <div className="flex gap-2">
                  {[30, 50, 75, 100].map(score => (<button key={score} onClick={() => setTargetScore(score)} className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${targetScore === score ? 'bg-amber-700 text-white shadow-lg scale-105' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{score}</button>))}
                </div>
              </div>
              <button onClick={startGame} className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-lg rounded-lg hover:from-amber-700 hover:to-amber-800 shadow-lg transform hover:scale-105 transition-all">Start Game</button>
            </div>
          </div>
        </div>
      );
    }

    if (gameState === 'won' && winner !== null) {
      return (
        <div className="flex-1 flex items-center justify-center p-6 relative">
          {flowers.map(flower => (<div key={flower.id} className="absolute text-4xl" style={{left: `${flower.left}%`, top: '-50px', animation: `fall ${flower.duration}s linear ${flower.delay}s forwards`, opacity: 0.8}}>🌸</div>))}
          <style>{`@keyframes fall { to { transform: translateY(100vh) rotate(360deg); opacity: 0; } }`}</style>
          <div className="text-center relative z-10">
            <div className="text-8xl mb-6 animate-bounce">🎉</div>
            <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">{playerNames[winner]} Wins!</h1>
            <p className="text-2xl text-yellow-100 mb-4 bg-black bg-opacity-50 p-3 rounded-lg">{voiceMessage}</p>
            <p className="text-2xl text-yellow-100 mb-8">Final Score: {scores[winner]} points</p>
            <button onClick={resetGame} className="px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-lg rounded-lg hover:from-amber-700 hover:to-amber-800 shadow-lg transform hover:scale-105 transition-all">Play Again</button>
          </div>
        </div>
      );
    }

    // Main Game Screen Content
    return (
      <div className="w-full flex-1 flex flex-col overflow-hidden">
        {/* The black bar is removed from here */}
        <div className="flex-1 flex gap-6 p-6 overflow-hidden">
          <div className="w-64 space-y-4">
            <div className="bg-white bg-opacity-95 rounded-xl shadow-lg p-4">
              <h2 className="font-bold text-lg text-amber-900 mb-4">Scoreboard</h2>
              <div className="space-y-2">
                {Array.from({length: numPlayers}).map((_, i) => (<div key={i} className={`p-3 rounded-lg font-semibold transition-all ${currentPlayer === i ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-800'}`}>
                  <div className="text-sm opacity-75">{playerNames[i]}</div>
                  <div className="text-2xl">{scores[i]}</div>
                </div>))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="text-sm text-gray-700">Target: <span className="font-bold">{targetScore}</span></p>
              </div>
            </div>
            <div className="bg-white bg-opacity-95 rounded-xl shadow-lg p-4">
              <h3 className="font-bold text-amber-900 mb-3">Recent Rolls</h3>
              <div className="space-y-2">
                {rollHistory.length === 0 ? (<p className="text-gray-500 text-sm text-center py-4">No rolls yet</p>) : (rollHistory.map((roll, i) => (<div key={i} className="flex justify-between items-center bg-gray-100 p-2 rounded-lg">
                  <span className="text-sm font-semibold text-gray-700">{roll[0]}</span>
                  <span className="bg-amber-600 text-white px-3 py-1 rounded-full font-bold text-sm">{roll[1]}</span>
                </div>)))}
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div ref={containerRef} className="w-80 h-80 bg-gray-900 rounded-xl shadow-2xl" />
            <div className="text-center">
              <p className="text-white text-lg mb-2">Current Player: <span className="font-bold text-amber-300">{playerNames[currentPlayer]}</span></p>
              {voiceMessage && (<p className="text-yellow-200 text-sm mb-2 bg-black bg-opacity-50 p-2 rounded-lg">{voiceMessage}</p>)}
              {lastRoll && (<div className="text-6xl font-bold text-amber-300 drop-shadow-lg animate-bounce">{lastRoll}</div>)}
            </div>
            <button onClick={rollDice} disabled={rolling} className={`px-12 py-4 rounded-lg font-bold text-lg transition-all transform ${rolling ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:scale-110 shadow-lg active:scale-95'}`}>
              {rolling ? 'Rolling...' : 'Roll Dice'}
            </button>
            <button onClick={resetGame} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all">
              End Game
            </button>
          </div>
          <div className="w-64"></div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="w-full h-screen bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-900 flex flex-col overflow-hidden" 
      style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect fill=\'%23744210\' width=\'100\' height=\'100\'/%3E%3Cpath fill=\'%23654321\' d=\'M0 0h100v50H0z\'/%3E%3Cpath fill=\'%23845432\' d=\'M20 20h60v60H20z\'/%3E%3C/svg%3E")'}}
    >
      <HeaderAdSpace adKey={gameState} />
      {renderContent()}
      <FooterAdSpace adKey={gameState} />
    </div>
  );
};

export default DiceGame;