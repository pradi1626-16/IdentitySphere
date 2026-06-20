import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', hover = true, glow, delay = 0, onClick, style }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { scale: 1.01, y: -2 } : {}}
      onClick={onClick}
      className={`rounded-2xl p-6 transition-all duration-300 ${hover ? 'cursor-pointer' : ''} ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(227, 25, 55, 0.18)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        ...(glow === 'red' ? {
          boxShadow: '0 0 20px rgba(227, 25, 55, 0.15), 0 0 40px rgba(227, 25, 55, 0.05)',
        } : {}),
        ...style,
        '--hover-border': 'rgba(227, 25, 55, 0.35)',
        '--hover-bg': 'rgba(255, 255, 255, 0.08)',
      }}
      onMouseEnter={hover ? (e) => {
        e.currentTarget.style.borderColor = 'rgba(227, 25, 55, 0.35)';
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
        if (glow === 'red') {
          e.currentTarget.style.boxShadow = '0 0 30px rgba(227, 25, 55, 0.25), 0 0 60px rgba(227, 25, 55, 0.1)';
        }
      } : undefined}
      onMouseLeave={hover ? (e) => {
        e.currentTarget.style.borderColor = 'rgba(227, 25, 55, 0.18)';
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
        if (glow === 'red') {
          e.currentTarget.style.boxShadow = '0 0 20px rgba(227, 25, 55, 0.15), 0 0 40px rgba(227, 25, 55, 0.05)';
        }
      } : undefined}
    >
      {children}
    </motion.div>
  );
}
