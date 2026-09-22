'use client'

import { useState, useEffect, useRef } from 'react'

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        setIsSupported(false)
        return
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (event: any) => {
        let currentText = ''
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript
        }
        setTranscript(currentText)
      }

      recognition.onerror = (err: any) => {
        console.error('[SpeechRecognition Error]:', err)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        setTranscript('')
        recognitionRef.current.start()
        setIsListening(true)
      } catch (err) {
        console.error('Error starting speech recognition:', err)
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop()
        setIsListening(false)
      } catch (err) {
        console.error('Error stopping speech recognition:', err)
      }
    }
  }

  const resetTranscript = () => {
    setTranscript('')
  }

  return {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  }
}
