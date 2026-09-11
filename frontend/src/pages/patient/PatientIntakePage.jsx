import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '../../api/axiosInstance'
import { downloadCasePdf } from '../../store/activeCaseSlice'
import EmergencySosModal from '../../components/EmergencySosModal'
import { 
  Mic, 
  MicOff, 
  Keyboard, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileDown, 
  ArrowRight, 
  Globe, 
  Loader2, 
  Stethoscope, 
  Leaf, 
  Apple, 
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  MapPin
} from 'lucide-react'

export const PatientIntakePage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { pdfDownloading } = useSelector((state) => state.activeCase)

  const [isListening, setIsListening] = useState(false)
  const [patientText, setPatientText] = useState('')
  const [interimText, setInterimText] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('auto')
  const [mode, setMode] = useState('voice')
  const [speechSupported, setSpeechSupported] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [intakeResult, setIntakeResult] = useState(null)
  const [intakeError, setIntakeError] = useState('')
  const [showSosModal, setShowSosModal] = useState(false)
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false)
  const [coords, setCoords] = useState(null)

  const [prakriti, setPrakriti] = useState('unknown')
  const [agni, setAgni] = useState('unknown')
  const [diet, setDiet] = useState('')
  const [sleep, setSleep] = useState('')

  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSpeechSupported(false)
      setMode('text')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = selectedLanguage === 'en' ? 'en-IN' : 'hi-IN'

    recognition.onresult = (event) => {
      let currentInterim = ''
      let finalBatch = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalBatch += transcript + ' '
        } else {
          currentInterim += transcript
        }
      }

      if (finalBatch) {
        setPatientText((prev) => (prev ? `${prev.trim()} ${finalBatch.trim()}` : finalBatch.trim()))
      }
      setInterimText(currentInterim)
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [selectedLanguage])

  const toggleListening = () => {
    if (!speechSupported) return

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      setIntakeError('')
      try {
        recognitionRef.current?.start()
        setIsListening(true)
      } catch {
        setIsListening(false)
      }
    }
  }

  const handleCaptureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        },
        () => {}
      )
    }
  }

  const detectLanguageHeuristic = (text) => {
    if (selectedLanguage !== 'auto') return selectedLanguage
    const devanagariRegex = /[\u0900-\u097F]/
    return devanagariRegex.test(text) ? 'hi' : 'en'
  }

  const handleSubmitIntake = async (e) => {
    e?.preventDefault()
    const fullText = (patientText + ' ' + interimText).trim()
    if (!fullText) {
      setIntakeError('Please speak or type your symptoms before submitting.')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    }

    setSubmitting(true)
    setIntakeError('')

    try {
      const payload = {
        patientText: fullText,
        languageUsed: detectLanguageHeuristic(fullText),
        ...(coords ? { location: coords } : {}),
        ayurvedicMarkers: {
          suspectedPrakriti: prakriti,
          agniStatus: agni,
          ...(diet ? { dietHabits: diet } : {}),
          ...(sleep ? { sleepPattern: sleep } : {})
        }
      }

      const response = await axiosInstance.post('/cases/intake', payload)
      const data = response.data
      setIntakeResult(data)

      if (data.dangerLevel === 'high') {
        setShowSosModal(true)
      }
    } catch (err) {
      setIntakeError(err.response?.data?.message || 'Intake submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResetIntake = () => {
    setIntakeResult(null)
    setPatientText('')
    setInterimText('')
    setShowSosModal(false)
  }

  const handleDownloadPdf = (caseId) => {
    if (!caseId) return
    dispatch(downloadCasePdf(caseId))
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-emerald-50/40 via-white to-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {!intakeResult && (
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ayush Multilingual Pre-Consultation</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
              Describe Your Health Symptoms
            </h1>
            <p className="text-sm text-gray-600 max-w-lg mx-auto">
              Speak naturally in Hindi, English, or mixed tongue. Our Ayurvedic clinical engine will analyze your condition, detect vital indicators, and guide your care.
            </p>
          </div>
        )}

        {intakeError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <p className="font-semibold">{intakeError}</p>
          </div>
        )}

        {submitting && (
          <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-6 shadow-lg">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-black text-gray-950 tracking-tight">
              Analyzing Clinical Symptoms...
            </h2>
            <p className="text-sm text-gray-600 max-w-md mt-2 leading-relaxed">
              Evaluating Ayurvedic Prakriti markers, matching verified Ayush knowledge base rules, and calculating danger classification.
            </p>
          </div>
        )}

        {!intakeResult && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-100 shadow-xl shadow-emerald-950/5 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Spoken Language:</span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-800"
                >
                  <option value="auto">Auto-Detect (Hindi / English)</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="en">English (Indian)</option>
                </select>
              </div>

              {speechSupported && (
                <button
                  type="button"
                  onClick={() => setMode(mode === 'voice' ? 'text' : 'voice')}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 hover:underline"
                >
                  {mode === 'voice' ? (
                    <>
                      <Keyboard className="w-4 h-4" />
                      <span>Switch to typing</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>Switch to voice capture</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {mode === 'voice' && speechSupported ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-6">
                <div className="relative flex items-center justify-center">
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`w-28 h-28 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-all duration-300 ${
                      isListening
                        ? 'bg-rose-600 hover:bg-rose-700 animate-pulse-ring'
                        : 'bg-emerald-600 hover:bg-emerald-700 hover:scale-105 shadow-emerald-600/30'
                    }`}
                  >
                    {isListening ? (
                      <MicOff className="w-10 h-10" />
                    ) : (
                      <Mic className="w-10 h-10" />
                    )}
                    <span className="text-[11px] font-bold mt-1 tracking-wider uppercase">
                      {isListening ? 'Stop' : 'Speak'}
                    </span>
                  </button>
                </div>

                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold text-gray-800">
                    {isListening ? 'Listening to your symptoms...' : 'Tap the microphone and start speaking'}
                  </p>
                  <p className="text-xs text-gray-400">
                    E.g. &ldquo;3 din se tez bukhar hai, sharir me dard aur thand lag rahi hai...&rdquo;
                  </p>
                </div>

                <div className="w-full bg-gray-50 rounded-2xl p-4 border border-gray-200 min-h-[120px] max-h-[220px] overflow-y-auto">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Live Spoken Transcript
                  </span>
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {patientText}
                    {interimText && <span className="text-emerald-600 italic"> {interimText}</span>}
                    {!patientText && !interimText && (
                      <span className="text-gray-400 italic">Transcript will appear here as you speak...</span>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Describe Your Symptoms In Detail
                </label>
                <textarea
                  rows={6}
                  maxLength={5000}
                  value={patientText}
                  onChange={(e) => setPatientText(e.target.value)}
                  placeholder="Explain what symptoms you feel, their duration, any aggravating factors, appetite changes, or pain severity..."
                  className="w-full p-4 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 leading-relaxed"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Up to 5000 characters</span>
                  <span>{patientText.length} / 5000</span>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowAdvancedDetails(!showAdvancedDetails)}
                className="w-full flex items-center justify-between text-xs font-bold text-gray-600 hover:text-emerald-700 py-1"
              >
                <span className="uppercase tracking-wider">
                  Optional Clinical Context (Prakriti, Digestion, Habits)
                </span>
                {showAdvancedDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAdvancedDetails && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Suspected Prakriti</label>
                    <select
                      value={prakriti}
                      onChange={(e) => setPrakriti(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                    >
                      <option value="unknown">Unknown / Not Assessed</option>
                      <option value="vata">Vata (Air/Ether)</option>
                      <option value="pitta">Pitta (Fire/Water)</option>
                      <option value="kapha">Kapha (Water/Earth)</option>
                      <option value="vata-pitta">Vata-Pitta</option>
                      <option value="pitta-kapha">Pitta-Kapha</option>
                      <option value="vata-kapha">Vata-Kapha</option>
                      <option value="tridosha">Tridosha Balanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Agni (Digestive Fire)</label>
                    <select
                      value={agni}
                      onChange={(e) => setAgni(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                    >
                      <option value="unknown">Unknown</option>
                      <option value="sama">Sama (Balanced digestion)</option>
                      <option value="vishama">Vishama (Irregular / gas)</option>
                      <option value="tikshna">Tikshna (Intense / acidity)</option>
                      <option value="manda">Manda (Sluggish / heaviness)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Diet Habits</label>
                    <input
                      type="text"
                      value={diet}
                      onChange={(e) => setDiet(e.target.value)}
                      placeholder="e.g. Vegetarian, irregular meal timings"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Sleep Quality</label>
                    <input
                      type="text"
                      value={sleep}
                      onChange={(e) => setSleep(e.target.value)}
                      placeholder="e.g. Disturbed, 5-6 hours/night"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={handleCaptureLocation}
                      className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold hover:underline"
                    >
                      <MapPin className="w-4 h-4" />
                      {coords ? `Location Attached (${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)})` : 'Attach Current Location'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmitIntake}
              disabled={submitting || (!patientText && !interimText)}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg hover:shadow-emerald-200/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>Submit for Clinical Triage</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {intakeResult && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {intakeResult.dangerLevel === 'low' && intakeResult.verifiedAdvice && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
                        Low Danger • Self-Care Resolved
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                        Ayurvedic Home Care Advisory
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">Confidence:</span>
                    <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-800 rounded-lg">
                      {Math.round((intakeResult.confidenceScore || 0) * 100)}%
                    </span>
                  </div>
                </div>

                {intakeResult.verifiedAdvice.safeRemedies?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-emerald-600" />
                      <span>Verified Safe Remedies</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {intakeResult.verifiedAdvice.safeRemedies.map((remedy, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-950 flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{remedy}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {intakeResult.verifiedAdvice.ayurvedicDietaryNotes?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                      <Apple className="w-4 h-4 text-emerald-600" />
                      <span>Ayurvedic Ahara (Dietary Notes)</span>
                    </h3>
                    <ul className="space-y-2 text-xs text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-200">
                      {intakeResult.verifiedAdvice.ayurvedicDietaryNotes.map((note, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {intakeResult.verifiedAdvice.generalTips?.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                      General Lifestyle &amp; Rest Tips
                    </h3>
                    <ul className="space-y-1.5 text-xs text-gray-600 list-disc pl-5">
                      {intakeResult.verifiedAdvice.generalTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    onClick={() => handleDownloadPdf(intakeResult.caseId)}
                    disabled={pdfDownloading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>{pdfDownloading ? 'Generating PDF...' : 'Download Case Sheet (PDF)'}</span>
                  </button>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => navigate(`/patient/cases/${intakeResult.caseId}`)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition-colors"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>Consult Doctor Anyway</span>
                    </button>
                    <button
                      onClick={handleResetIntake}
                      className="text-xs font-semibold text-gray-500 hover:text-gray-800"
                    >
                      New Intake
                    </button>
                  </div>
                </div>
              </div>
            )}

            {((intakeResult.dangerLevel === 'medium') || (intakeResult.dangerLevel === 'low' && !intakeResult.verifiedAdvice)) && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-400 shadow-xl space-y-6">
                <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-1">
                      Medium Priority • Queued For Doctor
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                      OPD Tele-Queue Slot Assigned
                    </h2>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                  <p className="text-sm text-amber-950 font-medium leading-relaxed">
                    Your symptoms have been logged and placed into the priority Ayurvedic OPD physician queue. A verified medical practitioner will review your case sheet and issue formal clinical advice or e-prescription.
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs pt-2">
                    <span className="font-semibold text-gray-700">Case ID: <code className="bg-white px-2 py-0.5 rounded-sm border border-amber-200 font-mono text-amber-900">{intakeResult.caseId}</code></span>
                    <span className="font-semibold text-gray-700">Status: <span className="capitalize text-amber-800 font-bold">{intakeResult.status.replace('_', ' ')}</span></span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    onClick={() => navigate(`/patient/cases/${intakeResult.caseId}`)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-colors"
                  >
                    <span>Track OPD Case Status</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleResetIntake}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-800"
                  >
                    Start Another Intake
                  </button>
                </div>
              </div>
            )}

            {intakeResult.dangerLevel === 'high' && (
              <div className="bg-rose-50 rounded-3xl p-6 sm:p-8 border-2 border-rose-500 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white mx-auto flex items-center justify-center">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black text-rose-950">High Emergency Level Detected</h2>
                <p className="text-sm text-rose-900 max-w-md mx-auto">
                  Emergency protocols are active for Case <code className="font-mono bg-white px-2 py-0.5 rounded-sm">{intakeResult.caseId}</code>.
                </p>
                <button
                  onClick={() => setShowSosModal(true)}
                  className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider shadow-lg"
                >
                  View Emergency Response Hub
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <EmergencySosModal
        isOpen={showSosModal}
        onClose={() => setShowSosModal(false)}
        initialLocation={coords}
      />
    </div>
  )
}

export default PatientIntakePage
