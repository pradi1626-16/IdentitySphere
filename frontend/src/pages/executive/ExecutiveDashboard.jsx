import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingDown, ShieldCheck, AlertTriangle, Activity, Bot, Users, Target, Shield, TrendingUp } from 'lucide-react';
import GlassCard from '../../components/shared/GlassCard';
import AnimatedCounter from '../../components/shared/AnimatedCounter';
import { TREND_DATA } from '../../data/mockData';
import { getIdentities, getRiskEvents, getIncidents } from '../../services/storageService';

const PIE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

const complianceTrend = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
  score: Math.min(100, 62 + i * 2 + Math.floor(Math.random() * 4)),
}));

export default function ExecutiveDashboard() {
  const identities = useMemo(() => getIdentities(), []);
  const risks = useMemo(() => getRiskEvents(), []);
  const incidents = useMemo(() => getIncidents(), []);

  const total = identities.length;
  const criticalRisks = risks.filter(r => r.severity === 'critical').length;
  const highRisks = risks.filter(r => r.severity === 'high').length;
  const adminUsers = identities.filter(i => i.is_admin);
  const crossPlatformAdmins = adminUsers.filter(i => (i.platforms?.length || 0) >= 2).length;
  const mfaGaps = identities.filter(i => !i.mfa_complete && i.status === 'Active').length;
  const orphaned = identities.filter(i => i.status === 'Orphaned').length;
  const dormant = identities.filter(i => i.status === 'Dormant' || (i.max_dormancy_days || 0) > 90).length;
  const activeIncidents = incidents.filter(i => i.status !== 'resolved').length;
  const platforms = new Set(identities.flatMap(i => i.platforms || [])).size;
  const avgScore = total > 0 ? Math.round(identities.reduce((a, i) => a + (i.risk_score || 0), 0) / total) : 0;
  const businessRisk = Math.min(100, Math.round(avgScore + criticalRisks * 3 + crossPlatformAdmins * 2));

  const sevDist = { critical: criticalRisks, high: highRisks, medium: risks.filter(r => r.severity === 'medium').length, low: risks.filter(r => r.severity === 'low').length };
  const pieData = Object.entries(sevDist).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));

  const EXEC_CARDS = [
    { label: 'Business Risk', value: businessRisk, color: 'text-red-400', icon: Target, trend: businessRisk >= 60 ? 'Elevated' : 'Normal' },
    { label: 'Critical Risks', value: criticalRisks, color: 'text-red-400', icon: AlertTriangle, trend: `${highRisks} high-severity` },
    { label: 'Compliance', value: 78, color: 'text-green-400', icon: ShieldCheck, suffix: '%', trend: 'Target: 85%' },
    { label: 'Active Incidents', value: activeIncidents, color: 'text-orange-400', icon: Activity, trend: `${incidents.length} total` },
    { label: 'Identities', value: total, color: 'text-blue-400', icon: Users, trend: `${adminUsers.length} admins` },
    { label: 'Platforms', value: platforms, color: 'text-amber-400', icon: Shield, trend: `${crossPlatformAdmins} cross-admins` },
  ];

  const EXPOSURES = [
    { label: 'Cross-Platform Admins', count: crossPlatformAdmins, severity: 'critical' },
    { label: 'Orphaned Accounts', count: orphaned, severity: 'critical' },
    { label: 'MFA Gaps', count: mfaGaps, severity: 'high' },
    { label: 'Dormant Accounts', count: dormant, severity: 'medium' },
  ].filter(e => e.count > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Executive Risk Posture</h1>
        <p className="text-sm text-slate-500 mt-1">Enterprise identity security — business risk, compliance, and critical exposures</p>
      </div>

      <GlassCard hover={false} glow="red" delay={0.02}>
        <div className="flex items-center gap-6">
          <div className="relative">
            <svg width="90" height="90" viewBox="0 0 90 90">
              <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
              <circle cx="45" cy="45" r="38" fill="none" stroke={businessRisk >= 60 ? '#ef4444' : businessRisk >= 40 ? '#f97316' : '#22c55e'} strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${(businessRisk / 100) * 238.8} 238.8`} transform="rotate(-90 45 45)"
                style={{ filter: `drop-shadow(0 0 8px ${businessRisk >= 60 ? 'rgba(239,68,68,0.5)' : 'rgba(249,115,22,0.5)'})` }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black" style={{ color: businessRisk >= 60 ? '#ef4444' : businessRisk >= 40 ? '#f97316' : '#22c55e' }}>{businessRisk}</span>
              <span className="text-[8px] text-slate-500 uppercase tracking-widest">RISK</span>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white mb-1">Business Risk Score: <span className={businessRisk >= 60 ? 'text-red-400' : 'text-orange-400'}>{businessRisk >= 60 ? 'ELEVATED' : 'MODERATE'}</span></h2>
            <p className="text-sm text-slate-400">{criticalRisks} critical findings across {platforms} platforms. {crossPlatformAdmins} cross-platform admin exposures.</p>
          </div>
        </div>
      </GlassCard>

      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3">
        {EXEC_CARDS.map((c, i) => (
          <GlassCard key={c.label} delay={i * 0.04}>
            <div className="flex items-start justify-between mb-2"><c.icon size={18} className={c.color + ' opacity-50'} /></div>
            <p className={`text-3xl font-black ${c.color}`}><AnimatedCounter value={c.value} suffix={c.suffix || ''} /></p>
            <p className="text-[10px] text-slate-500 uppercase mt-1">{c.label}</p>
            <p className="text-[9px] text-slate-600 mt-1.5">{c.trend}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard hover={false} delay={0.2} className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Identity Risk Trend (30 Days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={TREND_DATA}>
              <defs>
                <linearGradient id="execCrit" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="100%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                <linearGradient id="execRes" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity={0.2}/><stop offset="100%" stopColor="#22c55e" stopOpacity={0}/></linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0a0f1f', border: '1px solid rgba(227,25,55,0.3)', borderRadius: 12, fontSize: 12, color: '#f1f5f9' }} wrapperStyle={{ zIndex: 1000 }} />
              <Area type="monotone" dataKey="critical" stroke="#ef4444" fill="url(#execCrit)" strokeWidth={2} />
              <Area type="monotone" dataKey="resolved" stroke="#22c55e" fill="url(#execRes)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard hover={false} delay={0.25}>
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Severity Breakdown</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie></PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-2">{pieData.map((d, i) => (
                <span key={d.name} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />{d.name} ({d.value})
                </span>
              ))}</div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm">No risk data</div>
          )}
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {EXPOSURES.length > 0 && (
          <GlassCard hover={false} delay={0.3}>
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-400" /> Critical Exposure Summary
            </h3>
            <div className="space-y-3">
              {EXPOSURES.map((exp, i) => (
                <motion.div key={exp.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.05 }}
                  className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${exp.severity === 'critical' ? 'bg-red-400' : exp.severity === 'high' ? 'bg-orange-400' : 'bg-yellow-400'}`} />
                    <span className="text-sm text-white">{exp.label}</span>
                  </div>
                  <span className="text-sm font-bold text-white font-mono">{exp.count}</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        )}

        <GlassCard hover={false} delay={0.35}>
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-400" /> Compliance Trend (12 Months)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={complianceTrend}>
              <defs>
                <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity={0.3}/><stop offset="100%" stopColor="#22c55e" stopOpacity={0}/></linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0a0f1f', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, fontSize: 12, color: '#f1f5f9' }} wrapperStyle={{ zIndex: 1000 }} />
              <Area type="monotone" dataKey="score" stroke="#22c55e" fill="url(#compGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <GlassCard hover={false} delay={0.4}>
        <div className="flex items-center gap-2 mb-4">
          <Bot size={16} className="text-red-400" />
          <h3 className="text-sm font-semibold text-slate-300">Executive AI Summary</h3>
        </div>
        <div className="text-sm text-slate-400 leading-relaxed space-y-3">
          <p>Enterprise identity security posture shows <strong className="text-white">{criticalRisks} critical</strong> and <strong className="text-white">{highRisks} high-severity</strong> risks. Business Risk Score: <strong className={businessRisk >= 60 ? 'text-red-400' : 'text-orange-400'}>{businessRisk}/100</strong>.</p>
          <p>Monitoring <strong className="text-white">{total}</strong> identities across <strong className="text-white">{platforms}</strong> platforms. <strong className="text-red-400">{crossPlatformAdmins}</strong> cross-platform admins and <strong className="text-yellow-400">{mfaGaps}</strong> MFA gaps require attention.</p>
          <p><strong className="text-orange-400">Priority:</strong> Review {crossPlatformAdmins} cross-platform admins, enforce MFA on {mfaGaps} accounts{orphaned > 0 ? `, remediate ${orphaned} orphaned account(s)` : ''}{dormant > 0 ? `, investigate ${dormant} dormant account(s)` : ''}.</p>
        </div>
      </GlassCard>
    </div>
  );
}
