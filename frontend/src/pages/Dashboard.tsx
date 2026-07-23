import { useEffect, useState } from "react";
import { Wallet, Landmark, BadgePercent, Shield } from "lucide-react";
import Navbar from "../components/Navbar";
import SidebarMenu from "../components/SidebarMenu";
import { useAuth } from "../hooks/useAuth";
import { useDashboard } from "../hooks/useDashboard";
import DashboardLoadingState from "./dashboard/DashboardLoadingState";
import DashboardHeader from "./dashboard/DashboardHeader";
import DashboardActions from "./dashboard/DashboardActions";
import AccountTabs from "./dashboard/AccountTabs";
import CommunicationsCenterModal from "./dashboard/CommunicationsCenterModal";
import TransactionHistoryModal from "./dashboard/TransactionHistoryModal";
import { dashboardAlerts, dashboardMessages } from "./dashboard/dashboard.data";
import type {
  DashboardAccountCard,
  DashboardCommCenterView,
  DashboardTab,
} from "./dashboard/dashboard.types";
import {
  getCreditScore,
  getCreditScoreBand,
  formatCurrency,
} from "./dashboard/dashboard.utils";
import {
  FixedDepositsView,
  GuaranteedLoansView,
  LoansView,
  SavingsAccountsView,
  SharesView,
} from "./dashboard/AccountViews";
import { useNavigate, useParams } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const {
    loading,
    loadingAccounts,
    selectedCreditUnion,
    selectedAccount,
    loadingTransactions,
    hasTransactions,
    transactionScrollRef,
    initialize,
    setSelectedCreditUnion,
    getTransactions,
    handleScroll,
    handleAccountSelect,
    getSavingsAccounts,
    getSharesAccounts,
    getFixedDepositAccounts,
    getLoanAccounts,
    getGuaranteedLoanAccounts,
  } = useDashboard();
  const navigate = useNavigate();

  const selectedCreditUnionLogoUrl =
    selectedCreditUnion?.logo?.trim() ||
    selectedCreditUnion?.image?.trim() ||
    "";
  const [activeTab, setActiveTab] = useState<DashboardTab>("savings");
  const [failedLogoUrl, setFailedLogoUrl] = useState("");
  const [commCenterOpen, setCommCenterOpen] = useState(false);
  const [commCenterView, setCommCenterView] =
    useState<DashboardCommCenterView>("messages");
  const creditScore = getCreditScore(user?.membershipType);
  const creditScoreBand = getCreditScoreBand(creditScore);
  const { bankId } = useParams();

  useEffect(() => {
    return () => {
      setSelectedCreditUnion(null);
    };
  }, []);

  useEffect(() => {
    if (selectedCreditUnion) return;
    initialize(bankId || "");
  }, [user, bankId]);

  useEffect(() => {
    const loadAccounts = async () => {
      if (!selectedCreditUnion) return;

      if (activeTab === "savings") {
        getSavingsAccounts(
          selectedCreditUnion.ciCustomerId,
          selectedCreditUnion.instituteId,
        );
      } else if (activeTab === "shares") {
        getSharesAccounts();
      } else if (activeTab === "fds") {
        getFixedDepositAccounts();
      } else if (activeTab === "loans") {
        getLoanAccounts();
      } else if (activeTab === "guaranteed") {
        getGuaranteedLoanAccounts();
      }
    };
    loadAccounts();
  }, [activeTab]);

  useEffect(() => {
    if (!selectedAccount) return;
    if ((selectedAccount.transactions?.length || 0) > 0) return;
    getTransactions();
  }, [selectedAccount?.refAccountNumber]);

  const showCreditUnionLogo =
    Boolean(selectedCreditUnionLogoUrl) &&
    failedLogoUrl !== selectedCreditUnionLogoUrl;

  const accountCards: DashboardAccountCard[] = [
    {
      tab: "savings",
      title: "Savings Accounts",
      description: "View balances and recent activity.",
      icon: <Wallet size={16} />,
      accentColor: "var(--primary)",
      accentBg: "rgba(0,96,229,0.10)",
      totalAmount: formatCurrency(
        selectedCreditUnion?.accountTypeCount.find(
          (a) => a.accountType === "Savings",
        )?.totalBalance || 0,
      ),
    },
    {
      tab: "fds",
      title: "Fixed Deposits",
      description: "Review term deposits and maturity dates.",
      icon: <Landmark size={16} />,
      accentColor: "var(--secondary)",
      accentBg: "rgba(16,185,129,0.10)",
      totalAmount: formatCurrency(
        selectedCreditUnion?.accountTypeCount.find(
          (a) => a.accountType === "Fixed Deposits",
        )?.totalBalance || 0,
      ),
    },
    {
      tab: "shares",
      title: "Share Capital",
      description: "Review your share holdings and performance.",
      icon: <BadgePercent size={16} />,
      accentColor: "var(--warning)",
      accentBg: "rgba(245,158,11,0.12)",
      totalAmount: formatCurrency(
        selectedCreditUnion?.accountTypeCount.find(
          (a) => a.accountType === "Shares",
        )?.totalBalance || 0,
      ),
    },
    {
      tab: "loans",
      title: "Loan Accounts",
      description: "Review repayments and due dates.",
      icon: <Landmark size={16} />,
      accentColor: "var(--danger)",
      accentBg: "rgba(239,68,68,0.10)",
      totalAmount: formatCurrency(
        selectedCreditUnion?.accountTypeCount.find(
          (a) => a.accountType === "Loans",
        )?.totalBalance || 0,
      ),
    },
    {
      tab: "guaranteed",
      title: "Guaranteed Loans",
      description: "Review loans you have guaranteed.",
      icon: <Shield size={16} />,
      accentColor: "var(--text-primary)",
      accentBg: "rgba(15,23,42,0.08)",
    },
  ];

  console.log(selectedCreditUnion);
  console.log(loading);

  if (!selectedCreditUnion || loading) {
    return <DashboardLoadingState />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-secondary)",
        color: "var(--text-primary)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <Navbar />

      <div
        style={{
          display: "flex",
          flex: 1,
          width: "100%",
          maxWidth: "1440px",
          margin: "0 auto",
          position: "relative",
        }}
      >
        <SidebarMenu />

        <main
          style={{
            flex: 1,
            padding: "40px 24px 32px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "28px",
            overflowX: "hidden",
          }}
        >
          <DashboardHeader
            bankName={selectedCreditUnion?.nameLn1 || "Bank"}
            bankAddress={selectedCreditUnion?.address || "Address"}
            bankHotline={selectedCreditUnion?.hotline || ""}
            logoUrl={selectedCreditUnionLogoUrl}
            showLogo={showCreditUnionLogo}
            onLogoError={() => setFailedLogoUrl(selectedCreditUnionLogoUrl)}
            userName={user?.name}
            profilePicture={user?.profilePicture}
            memberCode={selectedCreditUnion?.customerCode}
            creditScore={creditScore}
            creditScoreBand={creditScoreBand}
            socialMediaLinks={selectedCreditUnion?.socialMediaLinks}
          />

          <DashboardActions
            onChangeBank={() => navigate("/banks")}
            onOpenNotifications={() => {
              setCommCenterView("messages");
              setCommCenterOpen(true);
            }}
          />

          <AccountTabs
            activeTab={activeTab}
            cards={accountCards}
            onTabChange={setActiveTab}
          />

          <section className="dashboard-grid">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                gridColumn: "1 / -1",
              }}
            >
              {activeTab === "savings" ? (
                <SavingsAccountsView
                  savings={
                    selectedCreditUnion?.savingsAccounts?.map((account) => {
                      return {
                        accNo: account.refAccountNumber,
                        balance: account.totalBalance,
                        interestRate: account.intrestRate,
                        type: account.nameLn1,
                        currency: "LKR",
                      };
                    }) || []
                  }
                  loading={loadingAccounts}
                  totalSavings={
                    selectedCreditUnion?.accountTypeCount.find(
                      (a) => a.accountType === "Savings",
                    )?.totalBalance || 0
                  }
                  onSelectAccount={(accNo) =>
                    handleAccountSelect(
                      selectedCreditUnion?.savingsAccounts?.find(
                        (a) => a.refAccountNumber === accNo,
                      ),
                    )
                  }
                />
              ) : null}

              {activeTab === "loans" ? (
                <LoansView
                  loans={
                    selectedCreditUnion?.loanAccounts?.map((account) => ({
                      name: account.nameLn1,
                      loanNo: account.refAccountNumber,
                      balance: account.totalBalance,
                      capital: account.capital,
                      fee: account.fee,
                      installment: account.capitalInstallment,
                      interest: account.interest,
                      pastDue: account.pastDue,
                      status: account.loanStatus,
                      totalArrears: account.penalty,
                      pastDueDays: account.pastDueDays,
                    })) || []
                  }
                  loading={loadingAccounts}
                  onSelectAccount={(accNo) =>
                    handleAccountSelect(
                      selectedCreditUnion?.loanAccounts?.find(
                        (a) => a.refAccountNumber === accNo,
                      ),
                    )
                  }
                />
              ) : null}

              {activeTab === "fds" ? (
                <FixedDepositsView
                  fixedDeposits={
                    selectedCreditUnion?.fixedDepositAccounts?.map(
                      (account) => ({
                        fdNo: account.refAccountNumber,
                        name: account.nameLn1,
                        balance: account.totalBalance,
                        interestRate: account.intrestRate,
                        openDate: account.openDate,
                        renewDate: account.renewDate,
                      }),
                    ) || []
                  }
                  loading={loadingAccounts}
                  onSelectAccount={(accNo) =>
                    handleAccountSelect(
                      selectedCreditUnion?.fixedDepositAccounts?.find(
                        (a) => a.refAccountNumber === accNo,
                      ),
                    )
                  }
                />
              ) : null}

              {activeTab === "shares" ? (
                <SharesView
                  shares={
                    selectedCreditUnion?.sharesAccounts?.map((account) => ({
                      name: account.nameLn1,
                      shareNo: account.refAccountNumber,
                      balance: account.totalBalance,
                    })) || []
                  }
                  loading={loadingAccounts}
                  onSelectAccount={(accNo) =>
                    handleAccountSelect(
                      selectedCreditUnion?.sharesAccounts?.find(
                        (a) => a.refAccountNumber === accNo,
                      ),
                    )
                  }
                />
              ) : null}

              {activeTab === "guaranteed" ? (
                <GuaranteedLoansView
                  loading={loadingAccounts}
                  loans={
                    selectedCreditUnion?.guaranteedLoans?.map((loan) => ({
                      name: loan.nameLn1,
                      loanNo: loan.refAccountNumber,
                      balance: loan.balance,
                      borrower: loan.customerName,
                      pastDue: loan.pastDueAmount,
                      pastDueDays: loan.pastDueDays,
                    })) || []
                  }
                />
              ) : null}
            </div>
          </section>
        </main>
      </div>

      <CommunicationsCenterModal
        open={commCenterOpen}
        view={commCenterView}
        messages={dashboardMessages}
        alerts={dashboardAlerts}
        onClose={() => setCommCenterOpen(false)}
        onViewChange={setCommCenterView}
      />

      <TransactionHistoryModal
        account={
          selectedAccount
            ? {
                accNo: selectedAccount.refAccountNumber,
                type: selectedAccount.type || "Saving Account",
                balanceText: formatCurrency(selectedAccount.totalBalance),
                typeCategory: "fds",
              }
            : null
        }
        transactionFeed={
          selectedAccount?.transactions?.map((t) => ({
            id: t.id,
            amount: t.total || 0,
            date: t.date || "",
            desc: t.description || "--",
            type: t.type,
            balance: t.balance,
            intrest: t.interest || 0,
            otherCharges: (t.insurence || 0) + (t.fee || 0) + (t.penalty || 0),
          })) || []
        }
        hasMoreTransactions={hasTransactions}
        loadingMoreTransactions={loadingTransactions}
        onClose={() => handleAccountSelect(undefined)}
        onScroll={handleScroll}
        transactionScrollRef={transactionScrollRef}
      />
    </div>
  );
};

export default Dashboard;
