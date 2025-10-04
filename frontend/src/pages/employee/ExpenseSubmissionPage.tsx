import React, { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  Camera, 
  FileText, 
  DollarSign,
  Calendar,
  Tag,
  Receipt,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react'
import { expensesAPI, authAPI } from '../../lib/api'
import { PremiumButton } from '../../components/ui/PremiumButton'
import { FloatingLabelInput } from '../../components/ui/FloatingLabelInput'
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton'
import { ReceiptScanner } from '../../components/ocr/ReceiptScanner'
import { CurrencyConverter, CurrencySelector } from '../../components/currency/CurrencyConverter'
import { OCRExtractedData, CurrencyConversion } from '../../types'
import toast from 'react-hot-toast'

interface ExpenseFormData {
  amount: number
  currency: string
  convertedAmount?: number
  baseCurrency?: string
  exchangeRate?: number
  category: string
  description: string
  vendor?: string
  expenseDate: string
  ocrExtracted: boolean
  ocrConfidence?: number
}

export const ExpenseSubmissionPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [ocrData, setOcrData] = useState<OCRExtractedData | null>(null)
  const [currencyConversion, setCurrencyConversion] = useState<CurrencyConversion | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm<ExpenseFormData>({
    defaultValues: {
      expenseDate: new Date().toISOString().split('T')[0],
      currency: 'USD',
      ocrExtracted: false
    }
  })

  const watchedValues = watch()

  // Fetch expense categories
  const { data: categories, isLoading: categoriesLoading } = useQuery(
    'expense-categories',
    expensesAPI.getCategories
  )

  // Fetch currencies
  const { data: countries } = useQuery(
    'countries-all',
    () => authAPI.getCountries(true),
    {
      staleTime: 60 * 60 * 1000 // 1 hour
    }
  )

  // Submit expense mutation
  const submitExpenseMutation = useMutation(expensesAPI.createExpense, {
    onSuccess: () => {
      queryClient.invalidateQueries('expenses')
      navigate('/expenses', { 
        state: { message: 'Expense submitted successfully!' }
      })
    }
  })

  const steps = [
    { number: 1, title: 'Expense Details', icon: FileText },
    { number: 2, title: 'Receipt Upload', icon: Receipt },
    { number: 3, title: 'Review & Submit', icon: CheckCircle }
  ]

  const handleOCRData = (extractedData: OCRExtractedData) => {
    setOcrData(extractedData)
    
    // Auto-fill form with extracted data
    if (extractedData.amount) setValue('amount', extractedData.amount)
    if (extractedData.date) setValue('expenseDate', extractedData.date)
    if (extractedData.category) setValue('category', extractedData.category)
    if (extractedData.vendor) {
      setValue('vendor', extractedData.vendor)
      setValue('description', `Purchase from ${extractedData.vendor}`)
    }
    
    // Mark as OCR extracted
    setValue('ocrExtracted', true)
    setValue('ocrConfidence', extractedData.confidence)
    
    toast.success('Receipt data extracted and form updated!')
  }

  const handleOCRError = (error: string) => {
    toast.error(error)
  }

  const handleCurrencyConversion = (conversion: CurrencyConversion | null) => {
    setCurrencyConversion(conversion)
    if (conversion) {
      setValue('convertedAmount', conversion.convertedAmount)
      setValue('baseCurrency', conversion.toCurrency)
      setValue('exchangeRate', conversion.rate)
    }
  }



  const onSubmit = (data: ExpenseFormData) => {
    const formData = new FormData()
    
    formData.append('amount', data.amount.toString())
    formData.append('currency', data.currency)
    formData.append('category', data.category)
    formData.append('description', data.description)
    formData.append('expenseDate', data.expenseDate)
    formData.append('ocrExtracted', data.ocrExtracted.toString())
    
    if (data.vendor) {
      formData.append('vendor', data.vendor)
    }
    
    if (data.ocrConfidence) {
      formData.append('ocrConfidence', data.ocrConfidence.toString())
    }
    
    if (data.convertedAmount && data.baseCurrency && data.exchangeRate) {
      formData.append('convertedAmount', data.convertedAmount.toString())
      formData.append('baseCurrency', data.baseCurrency)
      formData.append('exchangeRate', data.exchangeRate.toString())
    }
    
    if (receiptFile) {
      formData.append('receipt', receiptFile)
    }
    
    submitExpenseMutation.mutate(formData)
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FloatingLabelInput
                {...register('amount', {
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Amount must be positive' }
                })}
                label="Amount"
                type="number"
                step="0.01"
                error={errors.amount?.message}
                icon={<DollarSign className="w-5 h-5" />}
              />

              <CurrencySelector
                value={watchedValues.currency || 'USD'}
                onChange={(currency) => setValue('currency', currency)}
                label="Currency"
              />
            </div>

            {/* Currency Conversion Display */}
            <CurrencyConverter
              amount={parseFloat(watchedValues.amount?.toString() || '0')}
              fromCurrency={watchedValues.currency || 'USD'}
              toCurrency="USD"
              onConversionUpdate={handleCurrencyConversion}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="label">Category</label>
                <div className="relative">
                  {categoriesLoading ? (
                    <LoadingSkeleton height={48} />
                  ) : (
                    <select
                      {...register('category', { required: 'Category is required' })}
                      className="input pl-12"
                    >
                      <option value="">Select category</option>
                      {categories?.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  )}
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Tag className="w-5 h-5" />
                  </div>
                </div>
                {errors.category && (
                  <p className="text-sm text-danger-600">{errors.category.message}</p>
                )}
              </div>

              <FloatingLabelInput
                {...register('expenseDate', {
                  required: 'Expense date is required',
                  validate: (value) => {
                    const selectedDate = new Date(value)
                    const today = new Date()
                    today.setHours(23, 59, 59, 999)
                    return selectedDate <= today || 'Expense date cannot be in the future'
                  }
                })}
                label="Expense Date"
                type="date"
                error={errors.expenseDate?.message}
                icon={<Calendar className="w-5 h-5" />}
              />
            </div>

            <div className="space-y-2">
              <label className="label">Description</label>
              <textarea
                {...register('description', {
                  required: 'Description is required',
                  minLength: { value: 10, message: 'Description must be at least 10 characters' }
                })}
                className="input min-h-[100px] resize-none"
                placeholder="Describe the business purpose of this expense..."
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-danger-600">{errors.description.message}</p>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <ReceiptScanner
              onDataExtracted={handleOCRData}
              onError={handleOCRError}
            />
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            {/* OCR Extraction Summary */}
            {ocrData && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                  <h4 className="font-semibold text-green-800">OCR Data Extracted</h4>
                  <span className="ml-auto text-green-700 text-sm">
                    Confidence: {Math.round((ocrData.confidence || 0) * 100)}%
                  </span>
                </div>
                <p className="text-green-700 text-sm">
                  Receipt data was automatically extracted and populated in the form.
                </p>
              </div>
            )}

            {/* Currency Conversion Summary */}
            {currencyConversion && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <DollarSign className="h-6 w-6 text-blue-600 mr-2" />
                  <h4 className="font-semibold text-blue-800">Currency Conversion Applied</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Original:</span>
                    <p className="font-medium text-lg">
                      {watchedValues.amount} {currencyConversion.fromCurrency}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700">Rate:</span>
                    <p className="font-medium">
                      1 {currencyConversion.fromCurrency} = {currencyConversion.rate.toFixed(4)} {currencyConversion.toCurrency}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700">Converted:</span>
                    <p className="font-medium text-lg text-blue-900">
                      {currencyConversion.convertedAmount.toFixed(2)} {currencyConversion.toCurrency}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Expense Summary */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Amount</label>
                    <p className="text-2xl font-bold text-gray-900">
                      {watchedValues.amount} {watchedValues.currency}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Category</label>
                    <p className="text-gray-900">{watchedValues.category}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date</label>
                    <p className="text-gray-900">
                      {watchedValues.expenseDate ? new Date(watchedValues.expenseDate).toLocaleDateString() : ''}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-900">{watchedValues.description}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Receipt</label>
                    <p className="text-gray-900">
                      {receiptFile ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {receiptFile.name}
                        </span>
                      ) : (
                        <span className="flex items-center text-gray-500">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          No receipt uploaded
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <PremiumButton
                onClick={handleSubmit(onSubmit)}
                loading={submitExpenseMutation.isLoading}
                size="lg"
                className="px-12"
                icon={<CheckCircle className="w-5 h-5" />}
              >
                {submitExpenseMutation.isLoading ? 'Submitting...' : 'Submit Expense'}
              </PremiumButton>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Submit Expense</h1>
          <p className="text-gray-600 mt-2">Create a new expense report with receipt</p>
        </div>
        
        <button
          onClick={() => navigate('/expenses')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Expenses
        </button>
      </div>

      {/* Progress Steps */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.number
            const isCompleted = currentStep > step.number
            
            return (
              <div key={step.number} className="flex items-center">
                <div className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${isActive ? 'bg-purple-600 text-white shadow-lg' : 
                      isCompleted ? 'bg-green-500 text-white' : 
                      'bg-gray-200 text-gray-600'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                      Step {step.number}
                    </p>
                    <p className={`text-sm ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`
                    w-16 h-1 mx-4 transition-all duration-300
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="card p-8">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <PremiumButton
          variant="secondary"
          onClick={prevStep}
          disabled={currentStep === 1}
          icon={<ArrowLeft className="w-5 h-5" />}
        >
          Previous
        </PremiumButton>
        
        {currentStep < 3 && (
          <PremiumButton
            onClick={nextStep}
            icon={<ArrowRight className="w-5 h-5" />}
          >
            Next
          </PremiumButton>
        )}
      </div>
    </div>
  )
}