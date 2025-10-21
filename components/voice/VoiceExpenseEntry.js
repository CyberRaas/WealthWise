'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  const [audioQuality, setAudioQuality] = useState('good') // 'good', 'moderate', 'poor'
  const [transcriptAlternatives, setTranscriptAlternatives] = useState([])
  const [retryCount, setRetryCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const recognitionRef = useRef(null)
  const timeoutRef = useRef(null)

  // Entrance animation
  useEffect(() => {
    setIsMounted(true)
    setIsVisible(true)

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Initialize speech recognition with enhanced noise handling
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()

      // Enhanced configuration for better accuracy
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.maxAlternatives = 5 // Get multiple transcription alternatives
      recognitionRef.current.lang = 'hi-IN' // Hindi first, but handles English too

      // Event handlers
      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started')
        setIsListening(true)
        setError('')
        setAudioQuality('good') // Reset quality indicator
      }

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''
        const alternatives = []

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const transcriptPart = result[0].transcript

          // Collect alternatives for better accuracy
          for (let j = 0; j < Math.min(result.length, 3); j++) {
            alternatives.push({
              transcript: result[j].transcript,
              confidence: result[j].confidence
            })
          }

          if (result.isFinal) {
            finalTranscript += transcriptPart

            // Assess audio quality based on confidence
            const avgConfidence = alternatives.reduce((sum, alt) => sum + alt.confidence, 0) / alternatives.length
            if (avgConfidence < 0.5) {
              setAudioQuality('poor')
            } else if (avgConfidence < 0.7) {
              setAudioQuality('moderate')
            } else {
              setAudioQuality('good')
            }
          } else {
            interimTranscript += transcriptPart
          }
        }

        setTranscript(finalTranscript || interimTranscript)
        setTranscriptAlternatives(alternatives)

        // Process final transcript
        if (finalTranscript) {
          console.log('Final transcript:', finalTranscript)
          console.log('Alternatives:', alternatives)
          processVoiceInput(finalTranscript, alternatives)
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)

        // Provide specific error messages
        let errorMessage = 'Voice recognition error'
        if (event.error === 'no-speech') {
          errorMessage = 'No speech detected. Please speak clearly and try again.'
        } else if (event.error === 'audio-capture') {
          errorMessage = 'Microphone not accessible. Please check permissions.'
        } else if (event.error === 'network') {
          errorMessage = 'Network error. Please check your connection.'
        } else if (event.error === 'aborted') {
          errorMessage = 'Recording stopped unexpectedly. Please try again.'
        }

        setError(errorMessage)
        setIsListening(false)
        setIsProcessing(false)
      }

      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended')
        setIsListening(false)
      }
    } else {
      setError('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.')
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Start voice recognition with quality checks
  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('')
      setProcessedExpense(null)
      setError('')
      setShowConfirmation(false)
      setTranscriptAlternatives([])

      try {
        recognitionRef.current.start()

        // Auto stop after 15 seconds (increased for noisy environments)
        timeoutRef.current = setTimeout(() => {
          stopListening()
          if (!transcript) {
            setError('No speech detected. Please try again in a quieter environment.')
          }
        }, 15000)
      } catch (err) {
        console.error('Error starting recognition:', err)
        setError('Failed to start voice recognition. Please try again.')
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

  // Process voice input through our API with retry logic
  const processVoiceInput = async (voiceText, alternatives = []) => {
    setIsProcessing(true)

    try {
      const response = await fetch('/api/voice/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voiceText,
          alternatives: alternatives.map(alt => alt.transcript),
          audioQuality: audioQuality
        }),
      })

      const data = await response.json()

      if (data.success) {
        setProcessedExpense(data.expenseData)
        setConfidence(data.confidence)
        setShowConfirmation(true)
        setError('')
        setRetryCount(0) // Reset retry count on success
      } else {
        // Handle low confidence or processing failure
        if (data.confidence && data.confidence < 0.6 && retryCount < 2) {
          setRetryCount(retryCount + 1)
          setError(`Low confidence (${Math.round(data.confidence * 100)}%). Please speak more clearly. Retry ${retryCount + 1}/2`)

          // Auto-retry after 2 seconds
          setTimeout(() => {
            if (!isListening) {
              startListening()
            }
          }, 2000)
        } else {
          setError(data.error || 'Failed to process voice input. Please try manual entry.')
        }
      }
    } catch (err) {
      console.error('Error processing voice:', err)
      setError('Failed to process voice input. Please check your connection.')
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

  // Don't render on server side
  if (!isMounted) return null

  const modalContent = (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4 overflow-y-auto transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={(e) => {
        // Close modal when clicking backdrop
        if (e.target === e.currentTarget && !isListening && !isProcessing) {
          onClose?.()
        }
      }}
    >
      <div
        className={`bg-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl my-8 transition-all duration-300 ease-out ${isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
          }`}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="text-center border-b pb-4">

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
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
            <div className="flex justify-center py-4">
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
                className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${isListening
                  ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse shadow-red-300'
                  : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:scale-110 shadow-blue-300'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}`}
              >
                {isListening ? (
                  <MicOff className="w-10 h-10 text-white" />
                ) : (
                  <Mic className="w-10 h-10 text-white" />
                )}

                {/* Recording indicator rings */}
                {isListening && (
                  <>
                    <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-75"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-red-300 animate-pulse"></div>
                  </>
                )}
              </button>
            </div>

            {/* Status Text */}
            <div className="text-center">
              {isListening && (
                <div className="space-y-2">
                  <p className="text-red-500 font-medium">
                    🎤 Listening... Speak now
                  </p>

                  {/* Audio Quality Indicator */}
                  <div className="flex items-center justify-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${audioQuality === 'good' ? 'bg-green-500' :
                      audioQuality === 'moderate' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                    <span className={`text-xs ${audioQuality === 'good' ? 'text-green-600' :
                      audioQuality === 'moderate' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                      Audio: {audioQuality === 'good' ? 'Clear' : audioQuality === 'moderate' ? 'Moderate' : 'Noisy'}
                    </span>
                  </div>

                  {audioQuality === 'poor' && (
                    <p className="text-xs text-red-500">
                      ⚠️ Try moving to a quieter area
                    </p>
                  )}
                </div>
              )}
              {isProcessing && (
                <p className="text-blue-500 font-medium">
                  🤖 Processing your expense...
                </p>
              )}
              {!isListening && !isProcessing && (
                <div className="space-y-1">
                  <p className="text-gray-500">
                    Tap microphone to start
                  </p>
                  {retryCount > 0 && (
                    <p className="text-xs text-orange-500">
                      💡 Tip: Speak clearly and slowly
                    </p>
                  )}
                </div>
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
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-700 font-semibold mb-3 flex items-center">
                <span className="mr-2">💡</span>
                Pro Tips for Better Accuracy:
              </p>
              <div className="space-y-2 text-xs text-blue-600">
                <p className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Speak clearly in a quiet environment</span>
                </p>
                <p className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Keep phone/mic close (15-30 cm away)</span>
                </p>
                <p className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Use natural phrases like:</span>
                </p>
                <div className="pl-4 space-y-1 text-blue-700 font-mono text-xs">
                  <p>- &quot;200 ka dosa khaya&quot;</p>
                  <p>- &quot;Metro में 45 rupees&quot;</p>
                  <p>- &quot;Swiggy से 180 ka order&quot;</p>
                  <p>- &quot;50 rupees chai pi&quot;</p>
                </div>
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
                className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center text-white ${isSaving ? 'bg-green-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
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
        <div className="flex justify-center pt-2 border-t">
          <button
            onClick={onClose}
            disabled={isListening || isSaving}
            className={`text-gray-500 hover:text-gray-700 flex items-center py-2 px-4 rounded-lg transition-all hover:bg-gray-100 ${(isListening || isSaving) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            <X className="w-4 h-4 mr-1" />
            Close
          </button>
        </div>
      </div>
    </div>
  )

  // Use portal to render at document body level
  return createPortal(modalContent, document.body)
}
