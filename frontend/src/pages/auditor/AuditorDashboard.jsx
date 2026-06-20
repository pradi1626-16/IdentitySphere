import { motion } from 'framer-motion';
import { FileText, Download, Eye, ShieldCheck } from 'lucide-react';
import GlassCard from '../../components/shared/GlassCard';
import AnimatedCounter from '../../components/shared/AnimatedCounter';
import { COMPLIANCE_MAP } from '../../data/mockData';
import { getIdentities, getRiskEvents } from '../../services/storageService';
import { Outlet, NavLink, useLocation } from 'react-router-dom';

function CompliancePage() {
  const risks = getRiskEvents();
  const identities = getIdentities();
  const complianceScore = 78;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <GlassCard delay={0.05}><p className="text-[11px] text-slate-500 uppercase">NIST 800-53 Controls</p><p className="text-3xl font-black text-cyan-400 mt-1"><AnimatedCounter value={5} /></p></GlassCard>
        <GlassCard delay={0.1}><p className="text-[11px] text-slate-500 uppercase">Risk Events</p><p className="text-3xl font-black text-red-400 mt-1"><AnimatedCounter value={risks.length} /></p></GlassCard>
        <GlassCard delay={0.15}><p className="text-[11px] text-slate-500 uppercase">Compliance Score</p><p className="text-3xl font-black text-green-400 mt-1"><AnimatedCounter value={complianceScore} suffix="%" /></p></GlassCard>
      </div>
      <GlassCard hover={false} delay={0.2}>
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Framework Alignment Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-[11px] text-slate-500 uppercase border-b border-white/5">
              <th className="text-left pb-3 font-medium">Capability</th><th className="text-left pb-3 font-medium">NIST 800-53</th>
              <th className="text-left pb-3 font-medium">MITRE ATT&CK</th><th className="text-left pb-3 font-medium">GDPR</th>
              <th className="text-left pb-3 font-medium">CIS</th><th className="text-right pb-3 font-medium">Findings</th>
            </tr></thead>
            <tbody>{COMPLIANCE_MAP.map((r, i) => (
              <motion.tr key={r.capability} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 + i * 0.04 }}
                className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td className="py-2.5 text-white font-medium">{r.capability}</td>
                <td className="py-2.5 text-cyan-400 font-mono text-xs">{r.nist}</td>
                <td className="py-2.5 text-red-400 font-mono text-xs">{r.mitre}</td>
                <td className="py-2.5 text-purple-400 text-xs">{r.gdpr}</td>
                <td className="py-2.5 text-amber-400 font-mono text-xs">{r.cis}</td>
                <td className="py-2.5 text-right font-mono font-bold text-white">{r.count}</td>
              </motion.tr>
            ))}</tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function EvidencePage() {
  const evidence = [
    { id: 'EV-001', finding: 'Orphaned accounts detected', source: 'DetectionEngine', controls: 'AC-2, T1078', count: 60 },
    { id: 'EV-002', finding: 'Cross-platform admin exposure', source: 'PrivilegeCalculator', controls: 'AC-6, T1098', count: 119 },
    { id: 'EV-003', finding: 'MFA gaps across platforms', source: 'DetectionEngine', controls: 'IA-4, T1078', count: 155 },
    { id: 'EV-004', finding: 'Privilege escalation events', source: 'DetectionEngine + AuditEvents', controls: 'AC-2, T1098', count: 107 },
    { id: 'EV-005', finding: 'Stale tokens > 180 days', source: 'TokenAbuseDetector', controls: 'IA-4, T1550', count: 12 },
    { id: 'EV-006', finding: 'Offboarding gaps', source: 'OffboardingGapDetector', controls: 'AC-2', count: 32 },
  ];
  return (
    <div className="space-y-4">{evidence.map((e, i) => (
      <motion.div key={e.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-semibold text-white">{e.finding}</p><p className="text-xs text-slate-500 mt-1">Source: {e.source} | Controls: {e.controls}</p></div>
            <span className="text-2xl font-black text-red-400">{e.count}</span>
          </div>
        </GlassCard>
      </motion.div>
    ))}</div>
  );
}

function ExportsPage() {
  const files = [
    { name: 'identities.csv', rows: 818, size: '169 KB' },
    { name: 'person_map.csv', rows: 818, size: '80 KB' },
    { name: 'groups.json', rows: 45, size: '64 KB' },
    { name: 'memberships.csv', rows: 2023, size: '197 KB' },
    { name: 'entitlements.csv', rows: 1582, size: '238 KB' },
    { name: 'audit_events.csv', rows: 800, size: '131 KB' },
    { name: 'offboarding.csv', rows: 183, size: '34 KB' },
    { name: 'ground_truth.csv', rows: 370, size: '15 KB' },
  ];
  return (
    <div className="grid md:grid-cols-2 gap-3">{files.map((f, i) => (
      <motion.div key={f.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
        <GlassCard>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download size={16} className="text-red-400" />
              <div><p className="text-sm font-medium text-white">{f.name}</p><p className="text-[10px] text-slate-500">{f.rows} rows | {f.size}</p></div>
            </div>
            <button className="px-3 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs border border-red-500/20 hover:bg-red-500/20 transition-all">Export</button>
          </div>
        </GlassCard>
      </motion.div>
    ))}</div>
  );
}

export default function AuditorDashboard() {
  const loc = useLocation();
  const isRoot = loc.pathname === '/auditor';
  const tabs = [
    { to: '/auditor', label: 'Compliance', icon: ShieldCheck },
    { to: '/auditor/evidence', label: 'Evidence', icon: Eye },
    { to: '/auditor/exports', label: 'Exports', icon: Download },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Governance & Compliance Center</h1>
        <p className="text-sm text-slate-500 mt-1">Read-only compliance view - NIST, GDPR, CIS Controls</p>
      </div>
      <div className="flex gap-2 border-b border-white/5 pb-3">
        {tabs.map(t => (
          <NavLink key={t.to} to={t.to} end className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${isActive ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-slate-400 hover:text-slate-300 hover:bg-white/5'}`
          }><t.icon size={14} />{t.label}</NavLink>
        ))}
      </div>
      {isRoot ? <CompliancePage /> : <Outlet />}
    </div>
  );
}

export { CompliancePage, EvidencePage, ExportsPage };
