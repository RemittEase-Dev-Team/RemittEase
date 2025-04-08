import axios from 'axios';

interface YellowCardConfig {
  apiKey: string;
  baseUrl: string;
  sandbox?: boolean;
}

interface OffRampRequest {
  amount: number;
  currency: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  country: string;
}

interface OffRampResponse {
  success: boolean;
  data?: {
    transactionId: string;
    status: string;
    estimatedTime: string;
  };
  message?: string;
}

export class YellowCardService {
  private config: YellowCardConfig;

  constructor(config: YellowCardConfig) {
    this.config = config;
  }

  async initiateOffRamp(request: OffRampRequest): Promise<OffRampResponse> {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/api/v1/off-ramp`,
        {
          amount: request.amount,
          currency: request.currency,
          bank_details: {
            bank_code: request.bankCode,
            account_number: request.accountNumber,
            account_name: request.accountName,
            country: request.country,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Yellow Card off-ramp error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to initiate off-ramp',
      };
    }
  }

  async getTransactionStatus(transactionId: string): Promise<OffRampResponse> {
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/api/v1/transactions/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Yellow Card status check error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to check transaction status',
      };
    }
  }
}
