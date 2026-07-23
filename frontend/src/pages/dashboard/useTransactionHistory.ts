import { useEffect, useMemo, useRef, useState } from 'react';
import { getMockTransactions, TRANSACTION_BATCH_SIZE } from './dashboard.utils';
import type { DashboardSelectedAccount } from './dashboard.types';
import type { UIEvent } from 'react';

export function useTransactionHistory(selectedAccount: DashboardSelectedAccount | null) {
  const [visibleCount, setVisibleCount] = useState(TRANSACTION_BATCH_SIZE);
  const [loadingMoreTransactions, setLoadingMoreTransactions] = useState(false);
  const transactionScrollRef = useRef<HTMLDivElement | null>(null);
  const loadingTimerRef = useRef<number | null>(null);

  const accountNo = selectedAccount?.accNo ?? '';
  const accountCategory = selectedAccount?.typeCategory ?? null;

  const transactionFeed = useMemo(
    () => (accountNo && accountCategory ? getMockTransactions(accountNo, accountCategory) : []),
    [accountNo, accountCategory]
  );

  const visibleTransactions = useMemo(
    () => transactionFeed.slice(0, visibleCount),
    [transactionFeed, visibleCount]
  );

  const hasMoreTransactions = visibleCount < transactionFeed.length;

  const resetHistory = () => {
    if (loadingTimerRef.current) {
      window.clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }

    setVisibleCount(TRANSACTION_BATCH_SIZE);
    setLoadingMoreTransactions(false);
  };

  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        window.clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!accountNo || !accountCategory || !hasMoreTransactions || loadingMoreTransactions) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom > 140) {
      return;
    }

    setLoadingMoreTransactions(true);

    loadingTimerRef.current = window.setTimeout(() => {
      setVisibleCount((current) =>
        Math.min(current + TRANSACTION_BATCH_SIZE, transactionFeed.length)
      );
      setLoadingMoreTransactions(false);
      loadingTimerRef.current = null;
    }, 260);
  };

  return {
    transactionFeed,
    visibleTransactions,
    hasMoreTransactions,
    loadingMoreTransactions,
    transactionScrollRef,
    handleScroll,
    resetHistory,
  };
}
