import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { CurrencyConversion } from '../../types';
import toast from 'react-hot-toast';

interface CurrencyConverterProps {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  onConversionUpdate: (conversion: CurrencyConversion | null) => void;
  className?: string;
}

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({
  amount,
  fromCurrency,
  toCurrency,
  onConversionUpdate,
  className = ''
}) => {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (fromCurrency !== toCurrency && amount > 0) {
      fetchExchangeRate();
    } else {
      // Same currency, no conversion needed
      setExchangeRate(1);
      setConvertedAmount(amount);
      setError(null);
      onConversionUpdate(null);
    }
  }, [fromCurrency, toCurrency, amount]);

  const fetchExchangeRate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.rates && data.rates[toCurrency]) {
        const rate = data.rates[toCurrency];
        const converted = parseFloat((amount * rate).toFixed(2));

        setExchangeRate(rate);
        setConvertedAmount(converted);
        setLastUpdated(new Date());

        const conversionData: CurrencyConversion = {
          rate,
          convertedAmount: converted,
          fromCurrency,
          toCurrency
        };

        onConversionUpdate(conversionData);
      } else {
        throw new Error(`Currency ${toCurrency} not supported`);
      }
    } catch (err) {
      const errorMessage = 'Unable to fetch exchange rate. Please verify manually.';
      setError(errorMessage);
      console.error('Exchange rate fetch error:', err);
      
      // Show toast notification for error
      toast.error('Currency conversion failed. Please check manually.', {
        duration: 4000,
        icon: '💱'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    fetchExchangeRate();
  };

  // Don't render if same currency
  if (fromCurrency === toCurrency) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 backdrop-blur-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-blue-800 flex items-center">
          <ArrowRightLeft className="h-5 w-5 mr-2" />
          Currency Conversion
        </h4>
        
        {lastUpdated && (
          <span className="text-xs text-blue-600">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 text-blue-600 animate-spin mr-2" />
          <span className="text-blue-700 text-sm">Fetching exchange rate...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800 font-medium">Conversion Error</span>
          </div>
          <p className="text-red-700 text-sm mb-3">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {convertedAmount && exchangeRate && !error && (
        <div className="space-y-4">
          <div className="bg-white/60 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-blue-700 font-medium">Original Amount:</span>
              <span className="font-bold text-lg">
                {amount.toFixed(2)} {fromCurrency}
              </span>
            </div>
            
            <div className="flex justify-center">
              <ArrowRightLeft className="h-4 w-4 text-blue-500" />
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-blue-700 font-medium">Converted Amount:</span>
              <span className="font-bold text-lg text-blue-900">
                {convertedAmount.toFixed(2)} {toCurrency}
              </span>
            </div>
          </div>

          <div className="bg-white/40 rounded-lg p-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-600">Exchange Rate:</span>
              <span className="font-medium">
                1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
              </span>
            </div>
          </div>

          <div className="flex items-center text-xs text-blue-600">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span>Conversion applied automatically</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Currency selector component
interface CurrencySelectorProps {
  value: string;
  onChange: (currency: string) => void;
  label: string;
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  value,
  onChange,
  label,
  className = ''
}) => {
  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  ];

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm"
      >
        {currencies.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code} ({currency.symbol}) - {currency.name}
          </option>
        ))}
      </select>
    </div>
  );
};