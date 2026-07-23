import axios from "axios";
import { fetchAccountTransactions, fetchFdAccounts, fetchGuaranteedLoanAccounts, fetchLoanAccounts, fetchSavingsAccounts, fetchSharesAccounts, fetchUsersCreditUnions } from "../apis/credit-union.api";
import { useAuthStore } from "../stores/auth.store";
import { useDashboardStore } from "../stores/dashboard.store";
import { useRef, useState, type UIEvent } from "react";
import type { Account, AccountBase, CreditUnion, GuaranteedLoan } from "../types/credit-union.type";
import { useNavigate } from "react-router-dom";


const TRANSACTION_BATCH_SIZE = 10;
export function useDashboard() { 
  const user = useAuthStore((state) => state.user);
  const {
    creditUnions,
    selectedCreditUnion,
    setSelectedCreditUnion,
    setCreditUnions,
    setSavingsAccounts,
    setSharesAccounts,
    setFixedDepositAccounts,
    setLoanAccounts,
    setGuaranteedLoans,
    clearState,
  } = useDashboardStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [accountsError, setAccountsError] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<AccountBase | undefined>(undefined);
  const transactionScrollRef = useRef<HTMLDivElement | null>(null);
  const [hasTransactions, setHasTransactions] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [loadingMoreTransactions, setLoadingMoreTransactions] = useState(false);
  const navigate = useNavigate();
  

  async function getCreditUnions(): Promise<CreditUnion[]> {
    setLoading(true);
    setError("");
    try {
      if (!user) return [];
      const res = await fetchUsersCreditUnions(user.id);
      const unions = res.map((cu) => {
        return {
          id: cu.id,
          userMasterId: cu.user_master_id,
          activeStatus: cu.activeStatus,
          instituteId: cu.institute_id,
          nameLn1: cu.name_ln1,
          logo: cu.logo,
          image: cu.image,
          phone: cu.phone,
          hotline: cu.hot_line,
          email: cu.email,
          ciCustomerId: cu.institute_user_id,
          customerCode: cu.customer_number,
          accountCount: cu.accountCount,
          address: cu.address,
          swiftCode: cu.swiftCode,
          eligibleCriteria: cu.eligibleCriteria,
          clientServer: cu.clientServer,
          aibApiVersion: cu.aibApiVersion,
          socialMediaLinks: cu.socialMediaLinks,
          accountTypeCount: cu.accountTypeCount,
        };
      });
      setCreditUnions(unions);
      return unions;
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.log(e.response?.data.message);
        setError(e.response?.data.message);
      }
      console.error(e);
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function getSavingsAccounts(ciCustomerId?: number, instituteId?: number) {
    try {
      setLoadingAccounts(true)
      setAccountsError("");
      if(!ciCustomerId || !instituteId) return;

      const res = await fetchSavingsAccounts(ciCustomerId, instituteId);
      
      const accounts: Account[] = res.map((account) => {
        return {
          nameLn1: account.name_ln1,
          refAccountNumber: account.ref_account_number,
          plAccountId: account.plAccountId,
          totalBalance: account.total_balance,
          intrestRate: account.interestRate,
          openDate: account.openDate,
          renewDate: account.renewDate
        }
      });
      setSavingsAccounts(accounts);
    }catch(e) {
      if (axios.isAxiosError(e)) {
        console.log(e.response?.data.message);
        setAccountsError(e.response?.data.message);
      }
      else{
        setAccountsError("Failed to load accounts. Please try again.");
      }
    }
    finally{
      setLoadingAccounts(false);
    }
  }

  async function getSharesAccounts() {
    try {
      setLoadingAccounts(true)
      setAccountsError("");
      if(!selectedCreditUnion || !selectedCreditUnion.ciCustomerId || !selectedCreditUnion.instituteId) return;

      const res = await fetchSharesAccounts(selectedCreditUnion.ciCustomerId, selectedCreditUnion.instituteId);
      
      const accounts: Account[] = res.map((account) => {
        return {
          nameLn1: account.name_ln1,
          refAccountNumber: account.ref_account_number,
          plAccountId: account.plAccountId,
          totalBalance: account.total_balance,
          intrestRate: account.interestRate,
          openDate: account.openDate,
          renewDate: account.renewDate
        }
      });
      setSharesAccounts(accounts);
    }catch(e) {
      if (axios.isAxiosError(e)) {
        console.log(e.response?.data.message);
        setAccountsError(e.response?.data.message);
      }
      else{
        setAccountsError("Failed to load accounts. Please try again.");
      }
    }
    finally{
      setLoadingAccounts(false);
    }
  }

  async function getFixedDepositAccounts() {
    try {
      setLoadingAccounts(true)
      setAccountsError("");
      if(!selectedCreditUnion || !selectedCreditUnion.ciCustomerId || !selectedCreditUnion.instituteId) return;

      const res = await fetchFdAccounts(selectedCreditUnion.ciCustomerId, selectedCreditUnion.instituteId);
      
      const accounts: Account[] = res.map((account) => {
        return {
          nameLn1: account.name_ln1,
          refAccountNumber: account.ref_account_number,
          plAccountId: account.plAccountId,
          totalBalance: account.total_balance,
          intrestRate: account.interestRate,
          openDate: account.openDate,
          renewDate: account.renewDate
        }
      });
      setFixedDepositAccounts(accounts);
    }catch(e) {
      if (axios.isAxiosError(e)) {
        console.log(e.response?.data.message);
        setAccountsError(e.response?.data.message);
      }
      else{
        setAccountsError("Failed to load accounts. Please try again.");
      }
    }
    finally{
      setLoadingAccounts(false);
    }
  }

  async function getLoanAccounts() {
    try {
      setLoadingAccounts(true)
      setAccountsError("");
      if(!selectedCreditUnion || !selectedCreditUnion.ciCustomerId || !selectedCreditUnion.instituteId) return;
      const res = await fetchLoanAccounts(selectedCreditUnion.ciCustomerId, selectedCreditUnion.instituteId);
      setLoanAccounts(res);
    }catch(e) {
      if (axios.isAxiosError(e)) {
        console.log(e.response?.data.message);
        setAccountsError(e.response?.data.message);
      }
      else{
        setAccountsError("Failed to load accounts. Please try again.");
      }
    }
    finally{
      setLoadingAccounts(false);
    }
  }

  async function getGuaranteedLoanAccounts() {
    try {
      setLoadingAccounts(true)
      setAccountsError("");
      if(!selectedCreditUnion || !selectedCreditUnion.ciCustomerId || !selectedCreditUnion.instituteId) return;
      const res = await fetchGuaranteedLoanAccounts (selectedCreditUnion.ciCustomerId, selectedCreditUnion.instituteId, selectedCreditUnion.customerCode || "");
      const accounts: GuaranteedLoan[] = res.map((account) => ({
        nameLn1: account.nameLn1,
        customerName: account.customerName,
        refAccountNumber: account.ref_account_number,
        balance: account.balance,
        dueInterest: account.due_interest,
        penalty: account.penalty,
        sumBalance: account.sum_balance,
        capital: account.capital,
        pastDueAmount: account.pastDueAmount,
        pastDueDays: account.pastDueDays

      }))
      setGuaranteedLoans(accounts);
    }catch(e) {
      if (axios.isAxiosError(e)) {
        console.log(e.response?.data.message);
        setAccountsError(e.response?.data.message);
      }
      else{
        setAccountsError("Failed to load accounts. Please try again.");
      }
    }
    finally{
      setLoadingAccounts(false);
    }
  }

  async function handleAccountSelect(account: AccountBase | undefined) {
    setSelectedAccount(account);
    setHasTransactions(true);
  }

  async function getTransactions(offset: number = 0, limit: number = TRANSACTION_BATCH_SIZE) {
    try {
      setLoadingTransactions(true)
      if(!selectedAccount || !hasTransactions){
        return;
      }

      const res = await fetchAccountTransactions(selectedAccount.refAccountNumber, selectedCreditUnion?.instituteId || 0, offset, limit);
      
      console.log(res);

      setSelectedAccount({
        ...selectedAccount,
        transactions: [...(selectedAccount.transactions || []), ...res]
      })
      
      if (res.length < limit) {
        setHasTransactions(false);
      }
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.log(e.response?.data.message);
      }
    } finally {
      setLoadingTransactions(false);
    }
  }

  const handleScroll = async (event: UIEvent<HTMLDivElement>) => {
      if (!selectedAccount  || !hasTransactions || loadingTransactions) {
        return;
      }
      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
  
      if (distanceFromBottom > 140) {
        return;
      }  
      setLoadingMoreTransactions(true);      
      await getTransactions(selectedAccount.transactions?.length || 0, TRANSACTION_BATCH_SIZE);
      setLoadingMoreTransactions(false);    
    };


  async function initialize(creditUnionId: string) {
          const banks = await getCreditUnions();
          const selected = banks?.find(
              b => Number(b.id) === Number(creditUnionId)
          );
          if (!selected) {
              navigate("/banks");
              return;
          }
          setSelectedCreditUnion(selected);
          await getSavingsAccounts(selected.ciCustomerId || 0, selected.instituteId || 0);
      }

  return {
    creditUnions,
    selectedCreditUnion,
    loading,
    error,
    loadingAccounts,
    accountsError,
    loadingTransactions,
    loadingMoreTransactions,
    hasTransactions,
    selectedAccount,
    transactionScrollRef,
    initialize,
    handleScroll,
    handleAccountSelect,
    getTransactions,
    setSelectedCreditUnion,
    getCreditUnions,
    getSavingsAccounts,
    getSharesAccounts,
    getFixedDepositAccounts,
    getLoanAccounts,
    getGuaranteedLoanAccounts,
    clearState,
  };
}
