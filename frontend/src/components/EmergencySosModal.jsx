import React, { useState, useEffect } from 'react'
import { 
  AlertOctagon, 
  PhoneCall, 
  MapPin, 
  Truck, 
  Clock, 
  ShieldAlert, 
  ExternalLink, 
  CheckCircle2, 
  X,
  Navigation
} from 'lucide-react'

export const EmergencySosModal = ({ isOpen, onClose, initialLocation }) => {
  const [dispatchStep, setDispatchStep] = useState(0)
  const [etaMinutes, setEtaMinutes] = useState(8)
  const [showConfirmClose, setShowConfirmClose] = useState(false)
  const [userCoords, setUserCoords] = useState(initialLocation || null)
  const [gettingLocation, setGettingLocation] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setDispatchStep(0)
      setShowConfirmClose(false)
      return
    }

    const timer1 = setTimeout(() => setDispatchStep(1), 2500)
    const timer2 = setTimeout(() => setDispatchStep(2), 5500)
    const interval = setInterval(() => {
      setEtaMinutes((prev) => (prev > 2 ? prev - 1 : prev))
    }, 60000)

    if (!userCoords && navigator.geolocation) {
      setGettingLocation(true)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          setGettingLocation(false)
        },
        () => {
          setGettingLocation(false)
        },
        { timeout: 8000 }
      )
    }

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearInterval(interval)
    }
  }, [isOpen, initialLocation])

  if (!isOpen) return null

  const googleMapsSearchUrl = userCoords?.lat && userCoords?.lng
    ? `https://www.google.com/maps/search/emergency+hospitals/@${userCoords.lat},${userCoords.lng},14z`
    : 'https://www.google.com/maps/search/emergency+hospitals+near+me'

  const mockNearbyHospitals = [
    {
      name: 'District Government General & Trauma Hospital',
      distance: '2.3 km',
      address: 'Civil Lines Road, Central Sector',
      phone: '011-23344556',
      ayushWing: true
    },
    {
      name: 'All India Institute of Ayurveda & Emergency Care',
      distance: '3.8 km',
      address: 'Sector 4, Ayush Marg',
      phone: '011-29988776',
      ayushWing: true
    },
    {
      name: 'City Apex Multi-Specialty & ICU Trauma Centre',
      distance: '4.5 km',
      address: 'Ring Road Crossing, Near Metro Pillar 142',
      phone: '108',
      ayushWing: false
    }
  ]

  const handleCloseAttempt = () => {
    setShowConfirmClose(true)
  }

  const handleFinalConfirmClose = () => {
    setShowConfirmClose(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border-4 border-rose-600 overflow-hidden">
        <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-800 text-white p-6 sm:p-8 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center shrink-0 animate-pulse">
                <AlertOctagon className="w-10 h-10 text-white" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/25 text-rose-100 text-xs font-bold uppercase tracking-widest mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
                  Clinical Emergency Triggered • High Danger
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  IMMEDIATE MEDICAL ATTENTION REQUIRED
                </h2>
                <p className="text-rose-100 text-sm mt-1 max-w-xl">
                  Intake indicators reveal high clinical danger. Please do not wait. Use direct emergency lines or proceed to nearest trauma care.
                </p>
              </div>
            </div>

            <button
              onClick={handleCloseAttempt}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors self-end sm:self-center"
              title="Close Emergency Modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="tel:108"
              className="group flex flex-col items-center justify-center p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 hover:border-rose-500 hover:bg-rose-100 transition-all text-center shadow-sm hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <PhoneCall className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Ambulance (Toll Free)</span>
              <span className="text-3xl font-black text-rose-950">108</span>
              <span className="text-xs text-rose-700 mt-1">Direct Emergency Dispatch</span>
            </a>

            <a
              href="tel:112"
              className="group flex flex-col items-center justify-center p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 hover:border-amber-500 hover:bg-amber-100 transition-all text-center shadow-sm hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-full bg-amber-600 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">National Helpline</span>
              <span className="text-3xl font-black text-amber-950">112</span>
              <span className="text-xs text-amber-700 mt-1">All-in-One Emergency Services</span>
            </a>

            <a
              href="tel:102"
              className="group flex flex-col items-center justify-center p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 hover:border-emerald-500 hover:bg-emerald-100 transition-all text-center shadow-sm hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Govt Health Transport</span>
              <span className="text-3xl font-black text-emerald-950">102</span>
              <span className="text-xs text-emerald-700 mt-1">Maternity & Critical Transfer</span>
            </a>
          </div>

          <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Emergency Response Simulation</h3>
                  <p className="text-xs text-gray-500">Automated ambulance dispatch alert for critical triage</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                <Clock className="w-3.5 h-3.5" />
                Est. Arrival: {etaMinutes} Mins
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-sm text-gray-800 font-medium">
                  Priority clinical intake telemetry transmitted to emergency response network.
                </span>
              </div>
              <div className="flex items-center gap-3">
                {dispatchStep >= 1 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-rose-400 border-t-transparent animate-spin shrink-0" />
                )}
                <span className="text-sm text-gray-800 font-medium">
                  {dispatchStep >= 1
                    ? 'Unit Assigned: BLS Ambulance DL-01-AY-108 (Station Sector 4)'
                    : 'Locating closest available emergency response vehicle...'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {dispatchStep >= 2 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
                )}
                <span className="text-sm text-gray-800 font-medium">
                  {dispatchStep >= 2
                    ? 'Driver alerted. First responders preparing route with siren priority.'
                    : 'Awaiting route dispatch confirmation...'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-gray-900 text-base">Nearest Trauma & Ayush Emergency Facilities</h3>
              </div>
              <a
                href={googleMapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline"
              >
                <Navigation className="w-3.5 h-3.5" />
                Open Live Map
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {mockNearbyHospitals.map((hosp, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-gray-200 bg-white hover:border-emerald-300 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-sm font-bold text-gray-900 line-clamp-2">{hosp.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-mono shrink-0">
                        {hosp.distance}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{hosp.address}</p>
                    {hosp.ayushWing && (
                      <span className="inline-block text-xs px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                        Ayush Emergency Ward
                      </span>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <a
                      href={`tel:${hosp.phone}`}
                      className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      {hosp.phone}
                    </a>
                    <a
                      href={`https://www.google.com/maps/search/${encodeURIComponent(hosp.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      Directions
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">
              Critical First-Aid Instructions While Help Arrives:
            </h4>
            <ul className="text-xs text-amber-900/90 space-y-1.5 list-disc pl-4">
              <li>Keep patient resting calmly in a semi-reclined or comfortable seated position.</li>
              <li>Loosen any tight clothing around collar, chest, or waist to ease respiration.</li>
              <li>Do NOT administer oral food, water, or unprescribed home herbs during acute distress.</li>
              <li>If the patient exhibits fainting or chest tightness, maintain continuous ventilation and airway openness.</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500 text-center sm:text-left">
            Sudha Setu Triage Engine SIH26047 • Autonomous Emergency Protocol
          </p>
          <button
            onClick={handleCloseAttempt}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-sm font-semibold transition-colors"
          >
            Acknowledge & Dismiss Emergency Notice
          </button>
        </div>
      </div>

      {showConfirmClose && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertOctagon className="w-8 h-8" />
              <h3 className="text-lg font-bold text-gray-900">Dismiss Emergency Alert?</h3>
            </div>
            <p className="text-sm text-gray-600">
              This case has been categorized as a high medical emergency. Confirming dismissal means you have contacted emergency personnel or reached a care center.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmClose(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
              >
                Keep Open
              </button>
              <button
                onClick={handleFinalConfirmClose}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                I Understand, Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmergencySosModal
