
import { api } from "../shared/axios"
import type { AccountResponse, CreditUnionResponse, GuaranteedLoanResponse, LoanAccount, LoanStatus, Transaction } from "../types/credit-union.type"

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function fetchUsersCreditUnions(userId: string): Promise<CreditUnionResponse[]> {
    const response = await api.get(`${BASE_URL}/institute/findUserAllConnectedInstitute`, {
        params: {
            user_code: userId
        }
    })
    return response.data
}

export async function fetchSavingsAccounts(ciCustomerId: number, instituteId: number): Promise<AccountResponse[]> {
    const response = await api.get(`${BASE_URL}/institute/getSavingsAccounts`, {
        params: {
            user_code: ciCustomerId,
            bankID: instituteId
        }
    })
    return response.data
}

export async function fetchSharesAccounts(ciCustomerId: number, instituteId: number): Promise<AccountResponse[]> {
    const response = await api.get(`${BASE_URL}/institute/sharesAccounts`, {
        params: {
            user_code: ciCustomerId,
            bankID: instituteId
        }
    })
    return response.data
}

export async function fetchFdAccounts(ciCustomerId: number, instituteId: number): Promise<AccountResponse[]> {
    const response = await api.get(`${BASE_URL}/institute/findUserAllFixedDeposit`, {
        params: {
            user_code: ciCustomerId,
            bankID: instituteId
        }
    })
    return response.data
}

export async function fetchLoanAccounts(ciCustomerId: number, instituteId: number, status?: LoanStatus[] ): Promise<LoanAccount[]> {
    const response = await api.get(`${BASE_URL}/client/${ciCustomerId}/loans`, {
        params: {
            bankCode: instituteId,
            statuses: status && status.length > 0 ? status.join(',') : ""
        }
    })
    return response.data
}

export async function fetchGuaranteedLoanAccounts(ciCustomerId: number, instituteId: number, customerNo: string ): Promise<GuaranteedLoanResponse[]> {
    const response = await api.get(`${BASE_URL}/guarantor/guaranty_all_loan_detail`, {
        params: {
            user_code: ciCustomerId,
            bank_id: instituteId,
            customer_no:customerNo
        }
    })
    return response.data
}

export async function fetchAccountTransactions(refNumber: string, instituteId: number, offset: number, limit: number): Promise<Transaction[]> {
    const response = await api.get(`${BASE_URL}/institute/findUserSavingsTransactionDetails`, {
        params: {
            bankID: instituteId,
            code: refNumber,
            offset: offset,
            limit: limit
        }
    })
    return response.data
}