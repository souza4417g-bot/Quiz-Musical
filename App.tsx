
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  GameScreen, 
  Player, 
  Genre, 
  Song, 
  HistoryRecord,
  Difficulty,
  User,
  Theme
} from './types';
import { ARTIST_DB, AUDIO_LIMIT_SECONDS, THEMES } from './constants';
import { searchSongsByArtist } from './services/deezerService';
import { userService } from './services/userService';
import { googleSheetsService } from './services/googleSheetsService';

// Components
import { VolumeControl } from './components/VolumeControl';
import { FeedbackOverlays } from './components/FeedbackOverlays';
import { AuthScreen } from './components/AuthScreen';
import { ThemesScreen } from './components/ThemesScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { CategoryScreen } from './components/CategoryScreen';
import { DifficultyScreen } from './components/DifficultyScreen';
import { ConfigScreen } from './components/ConfigScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { GameScreen as GameScreenComponent } from './components/GameScreen';
import { EndScreen } from './components/EndScreen';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { ShopScreen } from './components/ShopScreen';
import { BadgesScreen } from './components/BadgesScreen';

// Configuração dos limites de Poderes
const MAX_SKIPS = 1; // Base per match, plus inventory
const MAX_HINTS = 1; // Base per match, plus inventory
const MAX_PASSES = 1;
const TIME_LIMIT_SECONDS = 15;
const STARTING_LIVES = 3;

// Frases do Bot
const BOT_PHRASES = {
  correct: ["Sabia!", "Fácil demais.", "Sou uma máquina!", "Bip Bop Acerto.", "Calculado.", "Sou invencível!"],
  wrong: ["Foi lag...", "Música ruim.", "Quem ouve isso?", "Bug no sistema.", "Recalculando...", "Essa não valeu."],
  taunt: ["Sua vez, humano.", "Vai errar...", "Quero ver agora.", "Tic tac...", "Não me decepcione."]
};

const App: React.FC = () => {
  // Game State
  const [screen, setScreen] = useState<GameScreen>('welcome');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTheme, setActiveTheme] = useState<Theme>(THEMES[0]);
  
  // Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authAvatar, setAuthAvatar] = useState('🦊');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const [gameMode, setGameMode] = useState<'1p' | '2p'>('2p');
  const [gameStyle, setGameStyle] = useState<'rounds' | 'survival'>('rounds');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.NORMAL);
  const [players, setPlayers] = useState<Player[]>([
    { name: '', avatar: '🦊', score: 0, skips: 0, hints: 0, passes: 0, streak: 0, isBot: false, lives: 3, isGuest: true },
    { name: '', avatar: '🦄', score: 0, skips: 0, hints: 0, passes: 0, streak: 0, isBot: false, lives: 3, isGuest: true }
  ]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [selectedGenre, setSelectedGenre] = useState<Genre>(Genre.ALL);
  const [totalRounds, setTotalRounds] = useState(10);
  const [currentRound, setCurrentRound] = useState(0);
  const [songsPool, setSongsPool] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Iniciando...");
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'passed' | 'timeout' | null>(null);
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  
  // XP Gain State for End Screen
  const [xpGained, setXpGained] = useState(0);
  const [leveledUp, setLeveledUp] = useState(false);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SECONDS);
  
  // Score Animation State
  const [scoreAnimation, setScoreAnimation] = useState<{ index: number, type: 'increase' | 'decrease' | 'reward' } | null>(null);
  const [rewardMessage, setRewardMessage] = useState<string | null>(null);

  // Bot Personality State
  const [botMessage, setBotMessage] = useState<string | null>(null);

  // Volume State
  const [volume, setVolume] = useState(0.5);

  // Hard Mode specific
  const [listensUsed, setListensUsed] = useState(0);
  
  // UI State for Avatar Selection
  const [selectingAvatarFor, setSelectingAvatarFor] = useState<number | null>(null);
  
  // Feedback visual actions
  const [actionFeedback, setActionFeedback] = useState<'skip' | 'hint' | 'pass' | null>(null);

  // Audio refs & State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  // Computed: Is Double Points Round? (Last 2 rounds)
  const isDoublePoints = totalRounds > 0 && currentRound >= totalRounds - 2 && gameStyle === 'rounds';

  // Initialize audio and history
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = "auto";
    audioRef.current.volume = volume;

    const savedHistory = localStorage.getItem('quiz_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    // Check for logged in user
    const user = userService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      updatePlayer1WithUser(user);
      
      // Load user theme
      if (user.currentThemeId) {
        const foundTheme = THEMES.find(t => t.id === user.currentThemeId);
        if (foundTheme) setActiveTheme(foundTheme);
      }
    }

    return () => {
      if (audioTimerRef.current) clearTimeout(audioTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      audioRef.current?.pause();
    };
  }, []);

  const updatePlayer1WithUser = (user: User) => {
    setPlayers(prev => {
      const newP = [...prev];
      newP[0] = { 
        ...newP[0], 
        name: user.username, 
        avatar: user.avatar,
        isGuest: false 
      };
      return newP;
    });
  };

  const handleLogout = () => {
    userService.logout();
    setCurrentUser(null);
    setActiveTheme(THEMES[0]); // Reset to default theme
    setPlayers(prev => {
      const newP = [...prev];
      newP[0] = { ...newP[0], name: '', avatar: '🦊', isGuest: true };
      return newP;
    });
  };

  const handleAuthSubmit = async () => {
    setAuthError(null);
    if (!authUsername || !authPassword) {
      setAuthError("Preencha todos os campos.");
      return;
    }

    setIsAuthLoading(true);

    try {
      if (authMode === 'login') {
        const result = await userService.login(authUsername, authPassword);
        if (result.success && result.user) {
          setCurrentUser(result.user);
          updatePlayer1WithUser(result.user);
          if (result.user.currentThemeId) {
            const foundTheme = THEMES.find(t => t.id === result.user.currentThemeId);
            if (foundTheme) setActiveTheme(foundTheme);
          }
          setScreen('welcome');
        } else {
          setAuthError(result.message || "Erro no login");
        }
      } else {
        const result = await userService.register(authUsername, authPassword, authAvatar);
        if (result.success && result.user) {
          setCurrentUser(result.user);
          updatePlayer1WithUser(result.user);
          // New users get default theme, no need to change state from initial
          setScreen('welcome');
        } else {
          setAuthError(result.message || "Erro no registro");
        }
      }
    } catch (e) {
      setAuthError("Erro de conexão. Tente novamente.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleThemeSelect = (theme: Theme) => {
    if (!currentUser) return;
    if (currentUser.level < theme.minLevel) {
      alert(`Você precisa atingir o nível ${theme.minLevel} para desbloquear este tema!`);
      return;
    }
    
    const updatedUser = userService.updateTheme(currentUser.id, theme.id);
    if (updatedUser) {
      setCurrentUser(updatedUser);
      setActiveTheme(theme);
    }
  };

  // Update volume when state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const saveToHistory = (winner: Player | 'draw', p1: Player, p2: Player) => {
    const newRecord: HistoryRecord = {
      winnerName: winner === 'draw' ? 'Empate' : winner.name,
      winnerAvatar: winner === 'draw' ? '🤝' : winner.avatar,
      score1: p1.score,
      score2: p2.score,
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    };

    const updatedHistory = [newRecord, ...history].slice(0, 5);
    setHistory(updatedHistory);
    localStorage.setItem('quiz_history', JSON.stringify(updatedHistory));
    
    // Save to Google Sheets
    googleSheetsService.logMatch(newRecord, p1.name, p2.name);
  };

  useEffect(() => {
    if (currentSong && audioRef.current) {
      setIsPlaying(false);
      setIsAudioLoading(false);
      setAudioProgress(0);
      setListensUsed(0);
      if (audioTimerRef.current) clearTimeout(audioTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      
      audioRef.current.src = currentSong.preview;
      audioRef.current.load();
    }
  }, [currentSong]);

  // TIMER LOGIC
  useEffect(() => {
    if (screen === 'game' && !isLocked && !isAudioLoading && currentSong && !players[turnIndex].isBot) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [screen, isLocked, isAudioLoading, currentSong, turnIndex, players]);

  // BOT AI LOGIC
  useEffect(() => {
    const currentPlayer = players[turnIndex];
    if (screen === 'game' && currentPlayer.isBot && !isLocked && !isAudioLoading && currentSong) {
      // Bot "thinks"
      const thinkTime = 2500 + Math.random() * 2000; // 2.5s to 4.5s
      
      const botTimer = setTimeout(() => {
        // Bot Accuracy Logic
        const accuracyThreshold = difficulty === Difficulty.HARD ? 0.8 : 0.6;
        const isCorrect = Math.random() < accuracyThreshold;
        
        if (isCorrect) {
          handleAnswer(correctAnswer);
        } else {
          const wrongOptions = options.filter(o => o !== correctAnswer);
          const randomWrong = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
          handleAnswer(randomWrong || correctAnswer);
        }
      }, thinkTime);

      return () => clearTimeout(botTimer);
    } else if (screen === 'game' && !currentPlayer.isBot && !isLocked) {
      // If it's human turn, Bot might taunt
      const botIndex = players.findIndex(p => p.isBot);
      if (botIndex !== -1 && Math.random() < 0.2) { // 20% chance to taunt
         triggerBotMessage('taunt');
      }
    }
  }, [screen, turnIndex, isLocked, isAudioLoading, currentSong, players, difficulty, correctAnswer, options]);

  const triggerBotMessage = (type: 'correct' | 'wrong' | 'taunt') => {
    const phrases = BOT_PHRASES[type];
    const msg = phrases[Math.floor(Math.random() * phrases.length)];
    setBotMessage(msg);
    setTimeout(() => setBotMessage(null), 3500);
  };

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setAudioProgress(0);
      if (audioTimerRef.current) clearTimeout(audioTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }
  }, []);

  const startProgressTracking = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    const durationMs = AUDIO_LIMIT_SECONDS * 1000;
    const startTimestamp = Date.now();
    
    progressIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTimestamp;
      const prog = Math.min(100, (elapsed / durationMs) * 100);
      setAudioProgress(prog);
      if (prog >= 100) {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      }
    }, 50);
  };

  const playPreview = useCallback(async () => {
    if (!currentSong || !audioRef.current) return;
    if (isPlaying) {
      stopAudio();
      return;
    }
    if (isAudioLoading) return;
    
    if (difficulty === Difficulty.HARD && listensUsed >= 3) return;

    try {
      setIsAudioLoading(true);
      if (audioRef.current.src !== currentSong.preview) {
        audioRef.current.src = currentSong.preview;
      }
      
      let seekTime = 0;

      if (difficulty === Difficulty.HARD) {
        if (listensUsed === 0) seekTime = 0;
        else if (listensUsed === 1) seekTime = 10;
        else seekTime = 20;
      } else {
        const randomStart = 5 + Math.random() * 10;
        if (Number.isFinite(audioRef.current.duration)) {
          seekTime = Math.min(randomStart, audioRef.current.duration - 5);
        } else {
          seekTime = randomStart;
        }
      }

      audioRef.current.currentTime = seekTime;
      await audioRef.current.play();
      
      setIsPlaying(true);
      setIsAudioLoading(false);
      setListensUsed(prev => prev + 1);
      startProgressTracking();

      audioTimerRef.current = setTimeout(() => {
        stopAudio();
      }, AUDIO_LIMIT_SECONDS * 1000);

    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Audio playback failed", error);
      }
      setIsPlaying(false);
      setIsAudioLoading(false);
    }
  }, [currentSong, isPlaying, isAudioLoading, stopAudio, difficulty, listensUsed]);

  const playSoundEffect = (type: 'correct' | 'wrong' | 'click' | 'hint' | 'skip' | 'pass') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      
      if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
        gain.gain.setValueAtTime(0.2 * volume, now); // Scale by volume
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else {
        // ... (other sounds scaled by volume)
        const vol = 0.2 * volume;
        gain.gain.setValueAtTime(vol, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.type = type === 'wrong' ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(type === 'wrong' ? 150 : 440, now);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {}
  };

  const startLoading = async (genre: Genre, rounds: number) => {
    setScreen('loading');
    setLoadingProgress(0);
    setLoadingText("Preparando palco...");
    
    // INITIAL CONFIG WITH INVENTORY
    // Free base limits + Inventory
    const userInventory = currentUser ? currentUser.inventory : { hints: 0, skips: 0, lives: 0 };
    
    // NOTE: In this simplified model, we simply ADD inventory to the match total.
    // In a more complex model, we would deduct inventory only when used.
    // For simplicity and user gratification, we add them to the pool for this match.
    // BUT we don't want to consume them if not used? 
    // Complexity Decision: We will only track 'skips' and 'hints' as numbers in the match.
    // Real deduction should happen on use. 
    // To enable this, we give the player MAX_SKIPS (1) + Inventory.
    
    const initialSkips = MAX_SKIPS + (userInventory.skips || 0);
    const initialHints = MAX_HINTS + (userInventory.hints || 0);
    const initialPasses = MAX_PASSES; 
    const initialLives = STARTING_LIVES + (userInventory.lives || 0);

    const p1 = { ...players[0], skips: initialSkips, hints: initialHints, passes: initialPasses, score: 0, streak: 0, lives: initialLives };
    
    // Bot gets base
    const p2 = { ...players[1], skips: 1, hints: 0, passes: 1, score: 0, streak: 0, lives: STARTING_LIVES };
    
    setPlayers([p1, p2]);

    let pool = ARTIST_DB;
    if (genre !== Genre.ALL) {
      pool = ARTIST_DB.filter(a => a.cat === genre);
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    // Fetch MORE artists to ensure we have enough valid songs with previews
    const artistLimit = Math.min(pool.length, 30);
    const selectedArtists = shuffled.slice(0, artistLimit);

    const allFetchedSongs: Song[] = [];
    const seenTitles = new Set<string>();

    for (let i = 0; i < selectedArtists.length; i++) {
      setLoadingText(`Buscando: ${selectedArtists[i].name}...`);
      try {
        const results = await searchSongsByArtist(selectedArtists[i]);
        results.forEach(s => {
          const cleanTitle = s.title.toLowerCase();
          if (!seenTitles.has(cleanTitle)) {
            seenTitles.add(cleanTitle);
            allFetchedSongs.push(s);
          }
        });
      } catch (e) {
        // Ignore error and continue
      }
      setLoadingProgress(Math.floor(((i + 1) / selectedArtists.length) * 100));
    }
    
    // RETRY LOGIC: If we don't have enough songs, try the rest of the pool
    if (allFetchedSongs.length < 10 && pool.length > artistLimit) {
        setLoadingText("Buscando mais músicas...");
        const remainingArtists = shuffled.slice(artistLimit, artistLimit + 15);
        for (let i = 0; i < remainingArtists.length; i++) {
             const results = await searchSongsByArtist(remainingArtists[i]);
             results.forEach(s => {
                const cleanTitle = s.title.toLowerCase();
                if (!seenTitles.has(cleanTitle)) {
                  seenTitles.add(cleanTitle);
                  allFetchedSongs.push(s);
                }
             });
        }
    }

    if (allFetchedSongs.length < 5) {
      alert("Poucas músicas encontradas. Tente outra categoria ou verifique sua conexão.");
      setScreen('welcome');
      return;
    }

    setSongsPool(allFetchedSongs.sort(() => Math.random() - 0.5));
    // If survival, rounds can be infinite, but we set a high number
    setTotalRounds(gameStyle === 'survival' ? 999 : rounds);
    setCurrentRound(0);
    setTurnIndex(Math.random() > 0.5 ? 0 : 1);
    
    prepareRound(allFetchedSongs, 0);
  };

  const prepareRound = (pool: Song[], index: number) => {
    if (pool.length === 0) return;

    const song = pool[index % pool.length];
    setCurrentSong(song);
    setDisabledOptions([]);
    setAudioProgress(0);
    setListensUsed(0);
    setRewardMessage(null);
    setTimeLeft(TIME_LIMIT_SECONDS);
    setBotMessage(null);
    
    const isArtistQuestion = Math.random() > 0.5;
    const correctVal = isArtistQuestion ? song.artist : song.title;
    setCorrectAnswer(correctVal);

    let wrongOptions: string[] = [];
    if (isArtistQuestion) {
      let peers = ARTIST_DB.filter(a => a.cat === song.category && a.gender === song.gender && a.name.toLowerCase() !== song.artist.toLowerCase());
      if (peers.length < 3) peers = ARTIST_DB.filter(a => a.cat === song.category && a.name.toLowerCase() !== song.artist.toLowerCase());
      const isIntl = song.category === Genre.POP_INTL;
      if (peers.length < 3) peers = ARTIST_DB.filter(a => (a.cat === Genre.POP_INTL) === isIntl && a.name.toLowerCase() !== song.artist.toLowerCase());
      const shuffledPeers = [...peers].sort(() => Math.random() - 0.5);
      wrongOptions = shuffledPeers.slice(0, 3).map(p => p.name);
    } else {
      let sameContextSongs = pool.filter(s => s.category === song.category && s.title.toLowerCase() !== song.title.toLowerCase());
      const uniqueContextTitles = Array.from(new Set(sameContextSongs.map(s => s.title)));
      wrongOptions = uniqueContextTitles.sort(() => Math.random() - 0.5).slice(0, 3);
    }

    const finalOptions = [correctVal, ...wrongOptions].sort(() => Math.random() - 0.5);
    setOptions(finalOptions);
    setIsLocked(false);
    setSelectedOption(null);
    setScreen('game');
  };

  // Helper to determine winner based on Game Mode
  const getWinner = useCallback((currentPlayers: Player[]) => {
    if (gameStyle === 'survival') {
      if (currentPlayers[0].lives > 0 && currentPlayers[1].lives <= 0) return currentPlayers[0];
      if (currentPlayers[1].lives > 0 && currentPlayers[0].lives <= 0) return currentPlayers[1];
      // Tie breakers for survival
      if (currentPlayers[0].score > currentPlayers[1].score) return currentPlayers[0];
      if (currentPlayers[1].score > currentPlayers[0].score) return currentPlayers[1];
      return 'draw';
    } else {
      if (currentPlayers[0].score > currentPlayers[1].score) return currentPlayers[0];
      if (currentPlayers[1].score > currentPlayers[0].score) return currentPlayers[1];
      return 'draw';
    }
  }, [gameStyle]);

  // Accepts optional players param to avoid stale closures in timeouts
  const nextTurn = (updatedPlayers?: Player[]) => {
    stopAudio();
    setFeedback(null);
    setScoreAnimation(null);
    const nextRound = currentRound + 1;
    
    // Use the most up-to-date players state
    const currentPlayers = updatedPlayers || players;
    
    // End Condition check
    const isSurvivalEnd = gameStyle === 'survival' && currentPlayers.some(p => p.lives <= 0);
    const isRoundEnd = gameStyle === 'rounds' && nextRound >= totalRounds;

    if (isRoundEnd || isSurvivalEnd) {
      finishGame(currentPlayers);
    } else {
      setCurrentRound(nextRound);
      setTurnIndex(prev => (prev === 0 ? 1 : 0));
      prepareRound(songsPool, nextRound);
    }
  };

  const finishGame = (finalPlayers: Player[]) => {
      const winner = getWinner(finalPlayers);
      saveToHistory(winner, finalPlayers[0], finalPlayers[1]);
      
      // Update XP if Logged In
      if (currentUser && !finalPlayers[0].isGuest) {
        const isWin = winner !== 'draw' && winner.name === finalPlayers[0].name;
        
        // Update Inventory Consumption
        // Logic: Calculate how many items were used beyond free limit
        // Free: 1. Used: (Initial - Remaining). 
        // Consumed = Max(0, (Used - Free))
        // This is complex to calculate reverse. 
        // SIMPLIFIED: We already deducted from user inventory in handleHint/Skip? No, we didn't.
        // We just gave them a big pool. We need to sync the remaining inventory back to user?
        // Actually, let's just assume for this version that inventory items are "loaded" into the match
        // and consumed. If not used, they are lost? NO, that's bad UX.
        // CORRECT LOGIC: We should have deducted inventory in handleHint/Skip.
        // Let's implement that in handleHint/Skip below.
        
        const result = userService.updateAfterMatch(
           currentUser.id, 
           isWin, 
           finalPlayers[0].score, 
           selectedGenre, 
           currentRound,
           gameStyle
        );
        
        // Refresh Current User state
        if (result) {
            const updatedUser = userService.getCurrentUser();
            if (updatedUser) setCurrentUser(updatedUser);
            setXpGained(result.xpGained);
            setLeveledUp(result.leveledUp);
        }
      } else {
        setXpGained(0);
        setLeveledUp(false);
      }

      setScreen('end');
  };

  const handleTimeOut = () => {
    if (isLocked) return;
    setIsLocked(true);
    stopAudio();
    
    setFeedback('wrong'); 
    playSoundEffect('wrong');
    setRewardMessage("TEMPO ESGOTADO! ⏱️");
    
    if (players[turnIndex].isBot) triggerBotMessage('wrong');

    const pointsMultiplier = isDoublePoints ? 2 : 1;
    
    let updatedPlayers: Player[] = [];
    setPlayers(prev => {
      const newPlayers = [...prev];
      if (gameStyle === 'survival') {
          newPlayers[turnIndex].lives -= 1;
      } else if (difficulty === Difficulty.HARD) {
         newPlayers[turnIndex].score -= pointsMultiplier;
      }
      newPlayers[turnIndex].streak = 0; 
      updatedPlayers = newPlayers;
      return newPlayers;
    });

    if (difficulty === Difficulty.HARD || gameStyle === 'survival') {
        setScoreAnimation({ index: turnIndex, type: 'decrease' });
    }

    // Pass updated players to nextTurn to avoid stale closure
    setTimeout(() => nextTurn(updatedPlayers), 3000);
  };

  const handlePass = () => {
    if (isLocked) return;
    const player = players[turnIndex];
    if (player.passes <= 0) return;

    setIsLocked(true);
    stopAudio();
    setFeedback('passed');
    playSoundEffect('pass');
    setActionFeedback('pass');
    
    const newPlayers = [...players];
    newPlayers[turnIndex].passes -= 1;
    setPlayers(newPlayers);

    setTimeout(() => {
      setActionFeedback(null);
      setFeedback(null);
      const newPool = [...songsPool];
      if (newPool.length > 1) {
        newPool.splice(currentRound % newPool.length, 1);
      }
      setSongsPool(newPool);
      setTurnIndex(prev => (prev === 0 ? 1 : 0));
      prepareRound(newPool, currentRound);
    }, 2000);
  };

  const handleChangeSong = () => {
    if (isLocked) return;
    const player = players[turnIndex];
    if (player.skips <= 0) return;

    // INVENTORY LOGIC: If player is human (index 0) and is using more than free limit
    if (turnIndex === 0 && currentUser && player.skips > MAX_SKIPS) {
        // Means we are dipping into inventory
        // Deduct from real user inventory
        if (currentUser.inventory.skips > 0) {
           currentUser.inventory.skips -= 1;
           userService.saveUsers(userService.getUsers().map(u => u.id === currentUser.id ? currentUser : u));
           // Sync not critical here, done at end
        }
    }

    playSoundEffect('skip');
    setActionFeedback('skip');
    setTimeout(() => setActionFeedback(null), 1500);
    stopAudio();
    const newPlayers = [...players];
    newPlayers[turnIndex].skips -= 1;
    setPlayers(newPlayers);
    const newPool = [...songsPool];
    if (newPool.length > 1) {
      const [removed] = newPool.splice(currentRound % newPool.length, 1);
      newPool.push(removed);
    }
    setSongsPool(newPool);
    prepareRound(newPool, currentRound);
  };

  const handleHint = () => {
    if (isLocked || disabledOptions.length > 0) return;
    const player = players[turnIndex];
    if (player.hints <= 0) return;

    // INVENTORY LOGIC
    if (turnIndex === 0 && currentUser && player.hints > MAX_HINTS) {
        if (currentUser.inventory.hints > 0) {
           currentUser.inventory.hints -= 1;
           userService.saveUsers(userService.getUsers().map(u => u.id === currentUser.id ? currentUser : u));
        }
    }

    playSoundEffect('click');
    setActionFeedback('hint');
    setTimeout(() => setActionFeedback(null), 1500);
    const newPlayers = [...players];
    newPlayers[turnIndex].hints -= 1;
    setPlayers(newPlayers);
    const wrongOptions = options.filter(o => o !== correctAnswer);
    const toRemove = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 2);
    setDisabledOptions(toRemove);
  };

  const handleAnswer = (option: string) => {
    if (isLocked) return;
    setIsLocked(true);
    setSelectedOption(option);
    
    if (audioTimerRef.current) clearTimeout(audioTimerRef.current);

    const isCorrect = option === correctAnswer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    playSoundEffect(isCorrect ? 'correct' : 'wrong');

    const newPlayers = [...players];
    const pointsMultiplier = isDoublePoints ? 2 : 1;
    let msg: string | null = null;
    
    // Bot Reaction
    if (newPlayers[turnIndex].isBot) {
        triggerBotMessage(isCorrect ? 'correct' : 'wrong');
    }

    if (isCorrect) {
      if (gameStyle !== 'survival') {
         newPlayers[turnIndex].score += pointsMultiplier;
      }
      newPlayers[turnIndex].streak += 1;
      
      const currentStreak = newPlayers[turnIndex].streak;
      const p = newPlayers[turnIndex];

      // STREAK LOGIC
      if (currentStreak === 3) {
        const isBonusScore = Math.random() > 0.5;
        // In survival, we rarely give points/lives, we prefer powerups
        if (isBonusScore && gameStyle !== 'survival') {
             p.score += 1;
             msg = "🔥 STREAK: +1 PONTO!";
        } else {
             // For simplicity in this inventory version, streak gives temporary match powerups, not permanent inventory
             p.skips += 1; // Just add to local match state
             msg = "🔥 STREAK: +1 TROCA!";
        }
      } else {
        // Regular progression
        if (isDoublePoints) {
            msg = "2x PONTOS!";
        }
      }

      setScoreAnimation({ index: turnIndex, type: 'increase' });
      setRewardMessage(msg);
    } else {
      // Wrong Answer Logic
      if (gameStyle === 'survival') {
          newPlayers[turnIndex].lives -= 1;
          msg = "PERDEU 1 VIDA!";
      } else if (difficulty === Difficulty.HARD) {
        newPlayers[turnIndex].score -= pointsMultiplier;
      }
      
      setScoreAnimation({ index: turnIndex, type: 'decrease' });
      newPlayers[turnIndex].streak = 0; 
      if (isDoublePoints && gameStyle === 'rounds') setRewardMessage("2x PERDA!");
      if (msg) setRewardMessage(msg);
    }
    
    setPlayers(newPlayers);

    // Pass newPlayers to nextTurn to ensure it sees the updated state (no stale closure)
    setTimeout(() => nextTurn(newPlayers), 4000);
  };

  const resetGame = () => {
    stopAudio();
    setPlayers(prev => prev.map(p => ({ ...p, score: 0, skips: 0, hints: 0, passes: 0, streak: 0, lives: 3 })));
    setSongsPool([]);
    setCurrentSong(null);
    setScreen('welcome');
  };

  const handleModeSelection = (mode: '1p' | '2p') => {
    setGameMode(mode);
    const newPlayers = [...players];
    if (mode === '1p') {
      newPlayers[1] = { ...newPlayers[1], name: 'Robô Musical', avatar: '🤖', isBot: true };
    } else {
      newPlayers[1] = { ...newPlayers[1], name: '', avatar: '🦄', isBot: false };
    }
    setPlayers(newPlayers);
  };

  const handleAvatarSelect = (playerIndex: number, avatar: string) => {
    const newPlayers = [...players];
    newPlayers[playerIndex].avatar = avatar;
    setPlayers(newPlayers);
    setSelectingAvatarFor(null);
    playSoundEffect('click');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-all duration-1000 ${activeTheme.background} relative overflow-hidden`}>
      
      {/* GLOBAL VOLUME CONTROL */}
      <VolumeControl volume={volume} setVolume={setVolume} activeTheme={activeTheme} />

      {/* Visual Overlays */}
      <FeedbackOverlays feedback={feedback} rewardMessage={rewardMessage} />

      <div className={`w-full max-w-md bg-white/90 backdrop-blur-xl shadow-2xl rounded-[2.5rem] p-6 md:p-10 text-center transition-all border border-white/60 ${feedback === 'wrong' ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        
        {/* === TELA DE AUTH (LOGIN/REGISTRO) === */}
        {screen === 'auth' && (
          <AuthScreen 
            authMode={authMode} setAuthMode={setAuthMode}
            activeTheme={activeTheme}
            authUsername={authUsername} setAuthUsername={setAuthUsername}
            authPassword={authPassword} setAuthPassword={setAuthPassword}
            authAvatar={authAvatar} setAuthAvatar={setAuthAvatar}
            selectingAvatarFor={selectingAvatarFor} setSelectingAvatarFor={setSelectingAvatarFor}
            authError={authError} isAuthLoading={isAuthLoading}
            handleAuthSubmit={handleAuthSubmit} setScreen={setScreen}
          />
        )}

        {/* === TELA DE TEMAS === */}
        {screen === 'themes' && (
          <ThemesScreen 
            currentUser={currentUser}
            activeTheme={activeTheme}
            handleThemeSelect={handleThemeSelect}
            setScreen={setScreen}
          />
        )}

        {/* === TELA DE LOJA === */}
        {screen === 'shop' && (
          <ShopScreen 
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            setScreen={setScreen}
            activeTheme={activeTheme}
          />
        )}

        {/* === TELA DE BADGES === */}
        {screen === 'badges' && (
          <BadgesScreen 
            currentUser={currentUser}
            setScreen={setScreen}
            activeTheme={activeTheme}
          />
        )}

        {screen === 'welcome' && (
          <WelcomeScreen 
            activeTheme={activeTheme}
            currentUser={currentUser}
            setScreen={setScreen}
            handleLogout={handleLogout}
            gameMode={gameMode}
            handleModeSelection={handleModeSelection}
            players={players}
            setPlayers={setPlayers}
            selectingAvatarFor={selectingAvatarFor}
            setSelectingAvatarFor={setSelectingAvatarFor}
            handleAvatarSelect={handleAvatarSelect}
            history={history}
          />
        )}

        {screen === 'category' && (
          <CategoryScreen 
            setSelectedGenre={setSelectedGenre}
            setScreen={setScreen}
          />
        )}

        {screen === 'difficulty' && (
          <DifficultyScreen 
            setDifficulty={setDifficulty}
            setScreen={setScreen}
          />
        )}

        {screen === 'config' && (
          <ConfigScreen 
            gameStyle={gameStyle}
            setGameStyle={setGameStyle}
            startLoading={startLoading}
            setScreen={setScreen}
            selectedGenre={selectedGenre}
          />
        )}

        {screen === 'loading' && (
          <LoadingScreen 
            loadingProgress={loadingProgress}
            loadingText={loadingText}
            activeTheme={activeTheme}
          />
        )}

        {screen === 'game' && currentSong && (
          <GameScreenComponent 
            currentSong={currentSong}
            timeLeft={timeLeft}
            TIME_LIMIT_SECONDS={TIME_LIMIT_SECONDS}
            scoreAnimation={scoreAnimation}
            turnIndex={turnIndex}
            players={players}
            botMessage={botMessage}
            gameStyle={gameStyle}
            currentRound={currentRound}
            totalRounds={totalRounds}
            isDoublePoints={isDoublePoints}
            isPlaying={isPlaying}
            isLocked={isLocked}
            activeTheme={activeTheme}
            audioProgress={audioProgress}
            playPreview={playPreview}
            isAudioLoading={isAudioLoading}
            difficulty={difficulty}
            listensUsed={listensUsed}
            handleChangeSong={handleChangeSong}
            MAX_SKIPS={MAX_SKIPS}
            handleHint={handleHint}
            MAX_HINTS={MAX_HINTS}
            disabledOptions={disabledOptions}
            handlePass={handlePass}
            MAX_PASSES={MAX_PASSES}
            options={options}
            correctAnswer={correctAnswer}
            selectedOption={selectedOption}
            handleAnswer={handleAnswer}
            resetGame={resetGame}
          />
        )}

        {screen === 'end' && (
          <EndScreen 
            players={players}
            getWinner={getWinner}
            activeTheme={activeTheme}
            currentUser={currentUser}
            xpGained={xpGained}
            leveledUp={leveledUp}
            gameStyle={gameStyle}
            resetGame={resetGame}
          />
        )}

        {screen === 'leaderboard' && (
          <LeaderboardScreen 
            setScreen={setScreen}
            activeTheme={activeTheme}
          />
        )}
      </div>
    </div>
  );
};

export default App;
