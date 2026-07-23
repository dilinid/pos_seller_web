import { Loader2 } from 'lucide-react';
import Navbar from '../../components/Navbar';

const DashboardLoadingState = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <Navbar />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '40px 24px',
        }}
      >
        <Loader2
          size={44}
          className="animate-spin"
          color="var(--primary)"
          style={{ animation: 'spin 1s linear infinite' }}
        />
        <h4
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--text-secondary)',
            fontWeight: 600,
          }}
        >
          Synchronizing secure cooperative bank ledger...
        </h4>
      </div>
    </div>
  );
};

export default DashboardLoadingState;
