import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../../components/shared/GlassCard';
import SeverityBadge from '../../components/shared/SeverityBadge';
import PlatformIcon from '../../components/shared/PlatformIcon';
import { getRiskEvents } from '../../services/storageService';
import { useScenario } from '../../context/ScenarioContext';

export default function Risks() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const { scenarios } = useScenario();

  const storedRisks = getRiskEvents();
  const allRisks = [
    ...scenarios.filter(s => s.status !== 'resolved').map(s => ({
      id: s.id, identity: s.identity, identityId: s.id, department: s.department,
      type: s.type, severity: s.severity, score: s.score, platforms: s.platforms,
      title: s.title, factors: {}, isSimulated: true,
    })),
    ...storedRisks,
  ];

  const filtered = filter === 'all' ? allRisks : allRisks.filter(r => r.severity === filter);
  const FILTERS = ['all', 'critical', 'high', 'medium', 'low'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Threat Detection Center</h1>
          <p className="text-sm text-slate-500 mt-1">{allRisks.length} findings across 8 risk types</p>
        </div>
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-slate-400 hover:text-slate-300 hover:bg-white/5'}`}
            >{f === 'all' ? `All (${allRisks.length})` : `${f} (${allRisks.filter(r => r.severity === f).length})`}</button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <div className="space-y-3">
          {filtered.map((r, i) => (
            <motion.div key={r.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.03 }}>
              <GlassCard className={`cursor-pointer ${r.isSimulated ? 'border-purple-500/30 bg-purple-500/[0.03]' : ''}`}
                onClick={() => r.identityId && navigate(`/admin/identities/${r.identityId}`)}>
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black ${r.severity === 'critical' ? 'bg-red-500/15 text-red-400' : r.severity === 'high' ? 'bg-orange-500/15 text-orange-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                      {r.score.toFixed(0)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white">{r.identity}</span>
                      <SeverityBadge severity={r.severity} pulse />
                      {r.isSimulated && <span className="text-[9px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-bold">SIMULATED</span>}
                    </div>
                    <p className="text-sm text-slate-400 mb-2">{r.title}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span>{r.department}</span>
                      <span className="text-white/10">|</span>
                      <span>{r.type.replace(/_/g, ' ')}</span>
                      <span className="text-white/10">|</span>
                      <div className="flex gap-1">{r.platforms.map(p => <PlatformIcon key={p} platform={p} />)}</div>
                    </div>
                  </div>
                  {r.factors && Object.keys(r.factors).length > 0 && (
                    <div className="hidden xl:block text-[10px] text-slate-500 space-y-0.5">
                      {Object.entries(r.factors).slice(0, 3).map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4"><span>{k.replace(/_/g, ' ')}</span><span className="font-mono text-slate-400">{v.toFixed(1)}</span></div>
                      ))}
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
