/**
 * useSpeech — Reusable voice narration hook for games
 * PS Requirement: "rely more on voice and visuals than text"
 * 
 * Features:
 * - Toggle voice on/off per game session
 * - Indian English voice preference + Hindi voice support
 * - Auto-cancels when narration changes
 * - Remembers preference in localStorage
 * - speakBilingual: speaks English then Hindi sequentially
 */

'use client'

import { useState, useCallback, useEffect } from 'react'

export function useSpeech() {
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Load preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wealthwise_voice_enabled')
      if (saved === 'true') setVoiceEnabled(true)
    }
  }, [])

  // Save preference
  const toggleVoice = useCallback(() => {
    setVoiceEnabled(prev => {
      const next = !prev
      if (typeof window !== 'undefined') {
        localStorage.setItem('wealthwise_voice_enabled', String(next))
        if (!next) window.speechSynthesis?.cancel()
      }
      return next
    })
  }, [])

  const speak = useCallback((text) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return
    
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-IN'
    utterance.rate = 0.9
    utterance.pitch = 1.0

    // Prefer Indian English voices
    const voices = window.speechSynthesis.getVoices()
    const indianVoice = voices.find(v => v.lang === 'en-IN') ||
                        voices.find(v => v.lang === 'hi-IN') ||
                        voices.find(v => v.lang.startsWith('en'))
    if (indianVoice) utterance.voice = indianVoice

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [voiceEnabled])

  // Speak Hindi text using hi-IN voice
  const speakHindi = useCallback((text) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis || !text) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'hi-IN'
    utterance.rate = 0.85
    utterance.pitch = 1.0

    const voices = window.speechSynthesis.getVoices()
    const hindiVoice = voices.find(v => v.lang === 'hi-IN') ||
                       voices.find(v => v.lang.startsWith('hi'))
    if (hindiVoice) utterance.voice = hindiVoice

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [voiceEnabled])

  // Speak English first, then Hindi (bilingual narration for rural users)
  const speakBilingual = useCallback((englishText, hindiText) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return

    window.speechSynthesis.cancel()
    const voices = window.speechSynthesis.getVoices()

    // English utterance
    const enUtterance = new SpeechSynthesisUtterance(englishText)
    enUtterance.lang = 'en-IN'
    enUtterance.rate = 0.9
    const enVoice = voices.find(v => v.lang === 'en-IN') || voices.find(v => v.lang.startsWith('en'))
    if (enVoice) enUtterance.voice = enVoice
    enUtterance.onstart = () => setIsSpeaking(true)

    if (hindiText) {
      // Hindi utterance follows English
      const hiUtterance = new SpeechSynthesisUtterance(hindiText)
      hiUtterance.lang = 'hi-IN'
      hiUtterance.rate = 0.85
      const hiVoice = voices.find(v => v.lang === 'hi-IN') || voices.find(v => v.lang.startsWith('hi'))
      if (hiVoice) hiUtterance.voice = hiVoice
      hiUtterance.onend = () => setIsSpeaking(false)
      hiUtterance.onerror = () => setIsSpeaking(false)

      enUtterance.onend = () => {
        window.speechSynthesis.speak(hiUtterance)
      }
    } else {
      enUtterance.onend = () => setIsSpeaking(false)
    }
    enUtterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(enUtterance)
  }, [voiceEnabled])

  const stop = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis?.cancel()
      setIsSpeaking(false)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        window.speechSynthesis?.cancel()
      }
    }
  }, [])

  return { voiceEnabled, isSpeaking, toggleVoice, speak, speakHindi, speakBilingual, stop }
}
