import type { FC } from 'react';
import type { DashboardAccountCard, DashboardTab } from './dashboard.types';

interface AccountTabsProps {
  activeTab: DashboardTab;
  cards: DashboardAccountCard[];
  onTabChange: (tab: DashboardTab) => void;
}

const AccountTabs: FC<AccountTabsProps> = ({ activeTab, cards, onTabChange }) => {
  return (
    <section className="grid-5" style={{ gap: '20px' }}>
      {cards.map((card) => {
        const isActive = activeTab === card.tab;

        return (
          <button
            key={card.tab}
            type="button"
            onClick={() => onTabChange(card.tab)}
            aria-pressed={isActive}
            className="premium-card"
            style={{
              appearance: 'none',
              padding: '20px',
              background: '#ffffff',
              width: '100%',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '178px',
              border: isActive ? `1px solid ${card.accentColor}` : '1px solid var(--border-color)',
              boxShadow: isActive ? '0 14px 28px rgba(15,23,42,0.10)' : 'var(--card-shadow)',
              transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              outlineOffset: '2px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                background: card.accentColor,
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Tap to open
              </span>
              <div
                style={{
                  color: card.accentColor,
                  background: card.accentBg,
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {card.icon}
              </div>
            </div>
            <h2
              style={{
                fontSize: '1.05rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 1.15,
                marginBottom: '6px',
              }}
            >
              {card.title}
            </h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>{card.description}</p>
            {card.totalAmount ? (
              <span
                style={{
                  marginTop: 'auto',
                  paddingTop: '8px',
                  fontSize: '0.76rem',
                  color: card.accentColor,
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                Total: {card.totalAmount}
              </span>
            ) : null}
          </button>
        );
      })}
    </section>
  );
};

export default AccountTabs;
