import React, { useState, useCallback } from 'react';
import Tesseract from 'tesseract.js';
import { Camera, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { OCRExtractedData } from '../../types';
import toast from 'react-hot-toast';

interface ReceiptScannerProps {
  onDataExtracted: (data: OCRExtractedData) => void;
  onError: (error: string) => void;
  className?: string;
}

export const ReceiptScanner: React.FC<ReceiptScannerProps> = ({
  onDataExtracted,
  onError,
  className = ''
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<OCRExtractedData | null>(null);
  const [progress, setProgress] = useState(0);

  const processReceipt = useCallback(async (file: File) => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setExtractedData(null);

    try {
      toast.loading('Processing receipt...', { id: 'ocr-processing' });

      const { data: { text, confidence } } = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });

      const extractedData = parseReceiptText(text, confidence);
      setExtractedData(extractedData);
      onDataExtracted(extractedData);
      
      toast.success('Receipt processed successfully!', { id: 'ocr-processing' });
    } catch (error) {
      console.error('OCR processing error:', error);
      const errorMessage = 'Failed to process receipt. Please enter details manually.';
      onError(errorMessage);
      toast.error(errorMessage, { id: 'ocr-processing' });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [onDataExtracted, onError]);

  const parseReceiptText = (text: string, confidence: number): OCRExtractedData => {
    console.log('OCR Text:', text);
    
    // Extract amount using various patterns
    const amountPatterns = [
      /\$(\d+\.?\d{0,2})/g,
      /(\d+\.\d{2})\s*\$?/g,
      /total[:\s]*\$?(\d+\.?\d{0,2})/gi,
      /amount[:\s]*\$?(\d+\.?\d{0,2})/gi
    ];
    
    let amount: number | undefined;
    for (const pattern of amountPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        const amounts = matches.map(match => parseFloat(match[1])).filter(a => a > 0);
        if (amounts.length > 0) {
          amount = Math.max(...amounts); // Take the largest amount (likely the total)
          break;
        }
      }
    }

    // Extract date patterns
    const datePatterns = [
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g,
      /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/g,
      /(\w{3}\s+\d{1,2},?\s+\d{4})/gi
    ];
    
    let date: string | undefined;
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          const parsedDate = new Date(match[0]);
          if (!isNaN(parsedDate.getTime())) {
            date = parsedDate.toISOString().split('T')[0];
            break;
          }
        } catch (e) {
          // Continue to next pattern
        }
      }
    }

    // Extract vendor name (usually first meaningful line)
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 2 && !/^\d+$/.test(line));
    
    let vendor: string | undefined;
    for (const line of lines.slice(0, 5)) { // Check first 5 lines
      if (line.length > 3 && line.length < 50 && !/\d{2}[\/\-]\d{2}/.test(line)) {
        vendor = line;
        break;
      }
    }

    // Categorize based on keywords
    const category = categorizeExpense(text.toLowerCase());

    return {
      amount,
      date,
      vendor,
      category,
      confidence: confidence / 100
    };
  };

  const categorizeExpense = (text: string): string => {
    const categories = {
      meals: ['restaurant', 'cafe', 'food', 'dining', 'lunch', 'dinner', 'breakfast', 'pizza', 'burger'],
      travel: ['gas', 'fuel', 'uber', 'taxi', 'hotel', 'airline', 'flight', 'parking', 'rental'],
      office: ['office', 'supplies', 'staples', 'depot', 'paper', 'pen', 'printer'],
      software: ['software', 'subscription', 'saas', 'license', 'app', 'service']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }
    
    return 'other';
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processReceipt(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processReceipt(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className="relative border-2 border-dashed border-purple-300 rounded-xl p-8 text-center bg-gradient-to-br from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 transition-all duration-300"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
        <div className="space-y-4">
          {isProcessing ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-purple-600 animate-spin mb-2" />
              <p className="text-purple-700 font-medium">Processing receipt...</p>
              <div className="w-full max-w-xs bg-purple-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-purple-600 text-sm mt-1">{progress}%</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center space-x-4">
                <Camera className="h-12 w-12 text-purple-500" />
                <Upload className="h-12 w-12 text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Upload Receipt for OCR Processing
                </p>
                <p className="text-gray-500">
                  Drag and drop an image or click to select
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Supports JPG, PNG, WebP up to 10MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Extraction Results */}
      {extractedData && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
            <h4 className="font-semibold text-green-800">Data Extracted Successfully</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {extractedData.amount && (
              <div className="bg-white/50 rounded-lg p-3">
                <span className="text-green-700 font-medium">Amount:</span>
                <span className="ml-2 font-bold">${extractedData.amount.toFixed(2)}</span>
              </div>
            )}
            
            {extractedData.date && (
              <div className="bg-white/50 rounded-lg p-3">
                <span className="text-green-700 font-medium">Date:</span>
                <span className="ml-2">{extractedData.date}</span>
              </div>
            )}
            
            {extractedData.vendor && (
              <div className="bg-white/50 rounded-lg p-3">
                <span className="text-green-700 font-medium">Vendor:</span>
                <span className="ml-2">{extractedData.vendor}</span>
              </div>
            )}
            
            {extractedData.category && (
              <div className="bg-white/50 rounded-lg p-3">
                <span className="text-green-700 font-medium">Category:</span>
                <span className="ml-2 capitalize">{extractedData.category}</span>
              </div>
            )}
          </div>
          
          {extractedData.confidence && (
            <div className="mt-4 flex items-center">
              <span className="text-green-700 text-sm">Confidence:</span>
              <div className="ml-2 flex-1 bg-green-200 rounded-full h-2 max-w-32">
                <div 
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${(extractedData.confidence * 100)}%` }}
                />
              </div>
              <span className="ml-2 text-green-700 text-sm font-medium">
                {Math.round((extractedData.confidence || 0) * 100)}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {!isProcessing && !extractedData && (
        <div className="text-center text-gray-500 text-sm">
          <AlertCircle className="h-5 w-5 mx-auto mb-1" />
          <p>Upload a receipt image to automatically extract expense data</p>
        </div>
      )}
    </div>
  );
};