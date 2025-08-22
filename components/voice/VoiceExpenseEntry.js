'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Volume2, Check, X, Edit3 } from 'lucide-react'

export default function VoiceExpenseEntry({ onExpenseAdded, onClose }) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [processedExpense, setProcessedExpense] = useState(null)
  const [error, setError] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const recognitionRef = useRef(null)
  const timeoutRef = useRef(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      // Configure recognition
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'hi-IN' // Hindi first, but handles English too
      
      // Event handlers
      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started')
        setIsListening(true)
        setError('')
      }
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart
          } else {
            interimTranscript += transcriptPart
          }
        }
        
        setTranscript(finalTranscript || interimTranscript)
        
        // Process final transcript
        if (finalTranscript) {
          console.log('Final transcript:', finalTranscript)
          processVoiceInput(finalTranscript)
        }
      }
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setError(`Voice recognition error: ${event.error}`)
        setIsListening(false)
        setIsProcessing(false)
      }
      
      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended')
        setIsListening(false)
      }
    } else {
      setError('Speech recognition not supported in this browser')
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Start voice recognition
  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('')
      setProcessedExpense(null)
      setError('')
      setShowConfirmation(false)
      
      try {
        recognitionRef.current.start()
        
        // Auto stop after 10 seconds
        timeoutRef.current = setTimeout(() => {
          stopListening()
        }, 10000)
      } catch (err) {
        console.error('Error starting recognition:', err)
        setError('Failed to start voice recognition')
      }
    }
  }

  // Stop voice recognition
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  // Process voice input through our API
  const processVoiceInput = async (voiceText) => {
    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/voice/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voiceText }),
      })

      const data = await response.json()

      if (data.success) {
        setProcessedExpense(data.expenseData)
        setConfidence(data.confidence)
        setShowConfirmation(true)
        setError('')
      } else {
        setError(data.error || 'Failed to process voice input')
      }
    } catch (err) {
      console.error('Error processing voice:', err)
      setError('Failed to process voice input')
    } finally {
      setIsProcessing(false)
    }
  }

  // Confirm and persist expense to backend
  const confirmExpense = async () => {
    if (!processedExpense || isSaving) return
    setIsSaving(true)
    setError('')
    try {
      const payload = {
        amount: Number(processedExpense.amount),
        // Use raw category id (e.g., 'food'). API will normalize.
        category: processedExpense.category || processedExpense.categoryInfo?.englishName || 'other',
        description: processedExpense.description || '',
        merchant: processedExpense.merchant || null,
        date: processedExpense.date || new Date().toISOString().split('T')[0],
        entryMethod: 'voice',
        originalText: processedExpense.originalText || transcript || null,
        confidence: processedExpense.confidence ?? confidence ?? null
      }

      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save expense')
      }

      // Notify parent with saved expense (canonical category, id, timestamp from server)
      if (onExpenseAdded) onExpenseAdded(data.expense)

      // Reset state
      setShowConfirmation(false)
      setTranscript('')
      setProcessedExpense(null)
    } catch (e) {
      console.error('Voice expense save error:', e)
      setError(e.message || 'Failed to save expense')
    } finally {
      setIsSaving(false)
    }
  }

  // Edit expense (convert to manual entry)
  const editExpense = () => {
    // This would open manual entry with pre-filled data
    if (onClose) onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Voice Expense Entry
          </h2>
          <p className="text-sm text-gray-600">
            Speak in Hindi, English, or Hinglish
          </p>
        </div>

        {/* Voice Input Section */}
        {!showConfirmation && (
          <div className="space-y-4">
            
            {/* Microphone Button */}
            <div className="flex justify-center">
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-blue-500 hover:bg-blue-600'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isListening ? (
                  <MicOff className="w-8 h-8 text-white" />
                ) : (
                  <Mic className="w-8 h-8 text-white" />
                )}
                
                {/* Recording indicator */}
                {isListening && (
                  <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
                )}
              </button>
            </div>

            {/* Status Text */}
            <div className="text-center">
              {isListening && (
                <p className="text-red-500 font-medium">
                  🎤 Listening... Speak now
                </p>
              )}
              {isProcessing && (
                <p className="text-blue-500 font-medium">
                  🤖 Processing your expense...
                </p>
              )}
              {!isListening && !isProcessing && (
                <p className="text-gray-500">
                  Tap microphone to start
                </p>
              )}
            </div>

            {/* Transcript Display */}
            {transcript && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600 mb-1">You said:</p>
                <p className="text-gray-900 font-medium">&quot;{transcript}&quot;</p>
              </div>
            )}

            {/* Example Commands */}
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-600 font-medium mb-2">Examples:</p>
              <div className="space-y-1 text-xs text-blue-700">
                <p>• &quot;आज पचास रुपए चाय पी&quot;</p>
                <p>• &quot;Metro में ₹45 spend kiya&quot;</p>
                <p>• &quot;Swiggy से ₹180 का order&quot;</p>
                <p>• &quot;Bought lunch for 200 rupees&quot;</p>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Section */}
        {showConfirmation && processedExpense && (
          <div className="space-y-4">
            
            {/* Expense Card */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-green-900">Expense Detected</h3>
                <div className="flex items-center text-xs text-green-600">
                  <span className="mr-1">Confidence:</span>
                  <span className="font-medium">{Math.round(confidence * 100)}%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold text-green-700">₹{processedExpense.amount}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <div className="flex items-center">
                    <span className="mr-1">{processedExpense.categoryInfo?.emoji}</span>
                    <span className="font-medium">{processedExpense.categoryInfo?.englishName}</span>
                  </div>
                </div>
                
                {processedExpense.merchant && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Merchant:</span>
                    <span className="font-medium">{processedExpense.merchant}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span className="font-medium">{processedExpense.description}</span>
                </div>
              </div>
            </div>

            {/* Original Voice Text */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Original voice input:</p>
              <p className="text-sm text-gray-700">&quot;{processedExpense.originalText}&quot;</p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={confirmExpense}
                disabled={isSaving}
                className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center text-white ${
                  isSaving ? 'bg-green-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isSaving ? (
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                {isSaving ? 'Saving...' : 'Confirm & Add'}
              </button>
              
              <button
                onClick={editExpense}
                className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 flex items-center"
          >
            <X className="w-4 h-4 mr-1" />
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
