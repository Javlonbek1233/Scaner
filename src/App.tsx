import React, { useState, useEffect } from 'react';
import { auth, db, signIn, logOut, serverTimestamp } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, orderBy, limit, onSnapshot, addDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, Droplets, Moon, Brain, User as UserIcon, 
  LogOut, Star, Zap, Bell, CheckCircle2, Waves, 
  Plus, ChevronRight 
} from 'lucide-react';
import { GlassPanel } from './components/GlassPanel';
import { HealthScore } from './components/HealthScore';
import { ActivityChart } from './components/ActivityChart';
import { ChatBot } from './components/ChatBot';
import { UserProfile, HealthLog, Habit } from './lib/utils';
import { getHealthInsights } from './lib/gemini';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<{ summary: string; tips: string[] } | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Fetch/Create profile
        const userDoc = await getDoc(doc(db, 'users', u.uid));
        if (!userDoc.exists()) {
          const newProfile: UserProfile = {
            uid: u.uid,
            displayName: u.displayName || 'Neural-User',
            email: u.email || '',
            avatarUrl: u.photoURL || '',
            dailyWaterGoal: 2500,
            dailySleepGoal: 8,
            createdAt: serverTimestamp()
          };
          await setDoc(doc(db, 'users', u.uid), newProfile);
          setProfile(newProfile);
        } else {
          setProfile(userDoc.data() as UserProfile);
        }

        // Listen to logs
        const logsQuery = query(
          collection(db, `users/${u.uid}/logs`),
          orderBy('timestamp', 'desc'),
          limit(30)
        );
        onSnapshot(logsQuery, (snapshot) => {
          setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HealthLog)));
        });

        // Listen to habits
        const habitsQuery = query(collection(db, `users/${u.uid}/habits`));
        onSnapshot(habitsQuery, (snapshot) => {
          setHabits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit)));
        });
      } else {
        setProfile(null);
        setLogs([]);
        setHabits([]);
        setInsights(null);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (profile && logs.length > 0 && !insights) {
      getHealthInsights(profile, logs).then(setInsights);
    }
  }, [profile, logs]);

  const addLog = async (type: "sleep" | "water" | "activity" | "mood", value: number, unit: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, `users/${user.uid}/logs`), {
        userId: user.uid,
        type,
        value,
        unit,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.error(e);
    }
  };

  const toggleHabit = async (habitId: string, completed: boolean) => {
    if (!user) return;
    try {
      // Simple toggle
      // In production, you'd calculate streak here
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-cyan-400 font-mono tracking-widest text-2xl"
        >
          NEURO-CORE INITIALIZING...
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassPanel className="max-w-md w-full text-center py-12 px-8 border-cyan-500/30">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8"
          >
            <div className="w-20 h-20 bg-cyan-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-cyan-400/30 shadow-[0_0_20px_rgba(0,242,255,0.2)]">
              <Activity className="text-cyan-400 w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">NeuroScan <span className="text-cyan-400">AI</span></h1>
            <p className="text-cyan-200/60 text-sm">Biological optimization via neural analysis.</p>
          </motion.div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={signIn}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3"
          >
            <Zap size={20} fill="currentColor" />
            INITIALIZE NEURO-LINK
          </motion.button>
          
          <p className="mt-6 text-[10px] uppercase tracking-[3px] text-cyan-500/40">Secure Auth Protocol: v4.2.0</p>
        </GlassPanel>
      </div>
    );
  }

  const chartData = logs
    .filter(l => l.type === 'activity')
    .slice(0, 10)
    .reverse()
    .map(l => ({ 
      date: new Date(l.timestamp?.toDate ? l.timestamp.toDate() : Date.now()).toLocaleDateString('en-US', { weekday: 'short' }), 
      value: l.value 
    }));

  return (
    <div className="min-h-screen p-6 flex flex-col gap-6 overflow-hidden max-w-[1400px] mx-auto">
      {/* Navbar */}
      <header className="flex justify-between items-center h-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)]">
            <Activity className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase">NeuroScan <span className="text-cyan-400">AI</span></h1>
        </div>
        
        <nav className="flex items-center gap-6">
          <div className="hidden md:flex gap-4">
            <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Dashboard</span>
            <span className="text-xs font-semibold tracking-widest text-slate-500 uppercase">Analytics</span>
            <span className="text-xs font-semibold tracking-widest text-slate-500 uppercase">Genomics</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-800 mx-2 hidden md:block"></div>
          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-700/50 px-3 py-1.5 rounded-full">
            <div className="w-6 h-6 rounded-full bg-cyan-900 flex items-center justify-center">
              <span className="text-[10px] font-bold text-cyan-400">{profile?.displayName?.slice(0, 2).toUpperCase()}</span>
            </div>
            <span className="text-sm font-medium text-slate-200">{profile?.displayName}</span>
            <button onClick={logOut} className="text-slate-500 hover:text-white transition-colors ml-2">
              <LogOut size={14} />
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 grid-rows-6 gap-4 min-h-[85vh]">
        {/* Daily Health Score (Large Left) */}
        <div className="md:col-span-4 md:row-span-4">
          <GlassPanel className="h-full flex flex-col items-center justify-center relative overflow-hidden" title="Vitality Score">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_70%)] pointer-events-none"></div>
            <div className="relative flex flex-col items-center w-full">
              <HealthScore score={84} />
              <p className="mt-8 text-center text-sm text-slate-400 px-4">
                Your neural recovery is <span className="text-cyan-300">14% higher</span> than your 7-day average. Optimal focus window achieved.
              </p>
              <div className="mt-8 w-full space-y-3">
                <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-800/20 border border-slate-700/30">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Hydration</span>
                  <span className="text-sm font-mono text-cyan-400">Stable</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-800/20 border border-slate-700/30">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Metabolism</span>
                  <span className="text-sm font-mono text-purple-400">Peak</span>
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Neural Activity Chart (Top Center) */}
        <div className="md:col-span-5 md:row-span-3">
          <GlassPanel title="Biometric Activity" icon={<Activity size={16} />} className="h-full">
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs text-slate-500">Real-time biometric flow</p>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                  <span className="text-[10px] uppercase font-bold tracking-tighter text-cyan-400">Live Sync</span>
                </div>
              </div>
              <ActivityChart data={chartData.length > 0 ? chartData : [
                { date: 'M', value: 45 }, { date: 'T', value: 52 }, { date: 'W', value: 38 },
                { date: 'T', value: 61 }, { date: 'F', value: 42 }, { date: 'S', value: 59 }, { date: 'S', value: 71 }
              ]} />
            </div>
          </GlassPanel>
        </div>

        {/* Mood Index (Top Right) */}
        <div className="md:col-span-3 md:row-span-2">
          <GlassPanel title="Mood Calibration" className="h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl shadow-lg drop-shadow-md">😌</div>
              <div>
                <div className="text-xl font-bold text-white">Elevated Calm</div>
                <div className="text-xs text-emerald-400">+12% Serotonin</div>
              </div>
            </div>
            <div className="mt-auto">
              <div className="flex justify-between text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                <span>Phase: Delta</span>
                <span>88% Efficiency</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 w-3/4"></div>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Smart Protocols (Middle Right) */}
        <div className="md:col-span-3 md:row-span-2">
          <GlassPanel title="Smart Protocols" className="h-full">
            <div className="space-y-3">
              {['Hydration window active', 'Neural detox in 15m'].map((msg, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-2xl border border-slate-700/50 group hover:border-cyan-500/30 transition-colors">
                  <div className={cn("w-2 h-2 rounded-full", i === 0 ? "bg-cyan-400" : "bg-amber-400")}></div>
                  <span className="text-xs text-slate-300">{msg}</span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* AI Insight (Bottom Left) */}
        <div className="md:col-span-4 md:row-span-2">
          <GlassPanel className="h-full flex flex-col justify-between bg-slate-900/60" title="Proactive Insight">
            <div className="flex items-start gap-4">
              <div className="text-2xl">⚡</div>
              <p className="text-sm text-slate-300 leading-relaxed italic">
                {insights?.summary || "Analyzing current trend patterns. High performance window anticipated."}
              </p>
            </div>
            <button className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
              Initialize Detailed Analysis
            </button>
          </GlassPanel>
        </div>

        {/* Water Flow (Bottom Center-Left) */}
        <div className="md:col-span-2 md:row-span-3">
          <GlassPanel title="H2O FLOW" className="h-full flex flex-col items-center justify-between text-center overflow-hidden">
            <div className="relative w-12 h-32 bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 mt-2">
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: "70%" }}
                className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
              ></motion.div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold font-mono">2.1</span>
              <span className="text-[10px] text-slate-500 ml-1">/ 3.0L</span>
            </div>
            <button 
              onClick={() => addLog('water', 250, 'ml')}
              className="mt-4 w-full p-2 bg-cyan-500/10 rounded-xl hover:bg-cyan-500/20 transition-colors"
            >
              <Plus size={16} className="mx-auto text-cyan-400" />
            </button>
          </GlassPanel>
        </div>

        {/* Sleep Cycle (Bottom Center-Right) */}
        <div className="md:col-span-3 md:row-span-3">
          <GlassPanel title="Sleep Recovery" icon={<Moon size={16} />} className="h-full">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-end mb-6">
                <span className="text-4xl font-light text-white font-mono tracking-tighter">7h 24m</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-bold">Optimal</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-3 mb-6">
                <div className="bg-indigo-400 rounded-full"></div>
                <div className="bg-indigo-600 rounded-full"></div>
                <div className="bg-indigo-800 rounded-full"></div>
                <div className="bg-slate-700 rounded-full"></div>
              </div>
              <div className="space-y-3 mt-auto">
                <p className="text-[11px] text-slate-500 italic leading-snug">
                  REM duration was 20% higher than your baseline history. Biological recovery successful.
                </p>
                <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                  <span>DEEP: 1h 40m</span>
                  <span>REM: 2h 05m</span>
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* AI Chat Widget (Bottom Right) */}
        <div className="md:col-span-3 md:row-span-2">
          <GlassPanel className="h-full bg-gradient-to-br from-cyan-600/10 to-blue-600/10 border-cyan-500/20" title="Neural-Link">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-400/20">
                <Bot className="w-4 h-4 text-cyan-300" />
              </div>
              <span className="text-xs font-bold text-white">NeuroAI System</span>
            </div>
            <div className="bg-black/20 p-4 rounded-2xl text-[11px] text-slate-300 border border-white/5 leading-relaxed">
              "Your biometric flow indicates optimal focus. Maintain neural hydration for another 45 minutes."
            </div>
          </GlassPanel>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="h-6 flex justify-between items-center text-[10px] font-mono text-slate-600 px-2">
        <div className="flex gap-4">
          <span>LINKED DEVICE: NEURO-CHRONOS</span>
          <span>SIGNAL: STRONG</span>
          <span>LATENCY: 12ms</span>
        </div>
        <div className="flex gap-4">
          <span>SYNC: {new Date().toLocaleTimeString()} UTC</span>
          <span className="text-cyan-900 uppercase">v4.2.0-stabilized</span>
        </div>
      </footer>

      <ChatBot />
    </div>
  );
}
