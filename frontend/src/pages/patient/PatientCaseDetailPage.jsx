import React, { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCaseById, downloadCasePdf, caseUpdatedLive } from '../../store/activeCaseSlice'
import { joinCaseRoom, leaveCaseRoom, socket } from '../../api/socket'
import { 
  ArrowLeft, 
  FileDown, 
  AlertCircle, 
  Clock, 
  User, 
  Stethoscope, 
  Pill, 
  MessageSquare, 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react'

export const PatientCaseDetailPage = () => {
  const { caseId } = useParams()
  const dispatch = useDispatch()
  const { currentCase, status, error, pdfDownloading } = useSelector((state) => state.activeCase)

  useEffect(() => {
    if (caseId) {
      dispatch(fetchCaseById(caseId))
      joinCaseRoom(caseId)

      const handleCaseUpdate = (payload) => {
        if (String(payload.caseId || payload._id) === String(caseId)) {
          dispatch(caseUpdatedLive(payload))
          dispatch(fetchCaseById(caseId))
        }
      }

      socket.on('case:updated', handleCaseUpdate)

      return () => {
        socket.off('case:updated', handleCaseUpdate)
        leaveCaseRoom(caseId)
      }
    }
  }, [caseId, dispatch])

  const handleDownload = () => {
    if (caseId) {
      dispatch(downloadCasePdf(caseId))
    }
  }

  const dangerBadge = {
    high: 'bg-rose-100 text-rose-800 border-rose-300',
    medium: 'bg-amber-100 text-amber-800 border-amber-300',
    low: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  }[currentCase?.dangerLevel] || 'bg-gray-100 text-gray-800 border-gray-200'

  if (status === 'loading') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-xs font-semibold text-gray-600">Retrieving case sheet details...</p>
        </div>
      </div>
    )
  }

  if (error || !currentCase) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-gray-200 text-center space-y-4 shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-gray-900">Case Not Found</h2>
          <p className="text-xs text-gray-600">{error || 'Unable to find or access this clinical case sheet.'}</p>
          <Link
            to="/patient/intake"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Start New Intake</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-emerald-50/40 via-white to-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/patient/intake"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-emerald-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Intake</span>
          </Link>

          <button
            onClick={handleDownload}
            disabled={pdfDownloading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
          >
            <FileDown className="w-4 h-4" />
            <span>{pdfDownloading ? 'Downloading PDF...' : 'Download Official PDF'}</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${dangerBadge}`}>
                  Danger: {currentCase.dangerLevel}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200">
                  Status: {currentCase.status?.replace('_', ' ')}
                </span>
              </div>
              <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                Case #{currentCase._id.slice(-6).toUpperCase()}
              </h1>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Submitted on {new Date(currentCase.createdAt).toLocaleString()}
              </p>
            </div>

            {currentCase.assignedDoctorId && (
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider block">Assigned Doctor</span>
                  <span className="text-xs font-bold text-gray-900">
                    {currentCase.assignedDoctorId.name || 'Ayush Medical Officer'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Extracted Symptoms</span>
              </h3>
              {currentCase.symptoms?.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {currentCase.symptoms.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-xs text-gray-800 font-medium"
                    >
                      {s.name} {s.duration && <span className="text-gray-400">({s.duration})</span>}
                      {s.severity && <span className="text-emerald-700 font-bold ml-1">[{s.severity}/10]</span>}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No structured symptoms isolated.</p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Ayurvedic Markers</span>
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 pt-1">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Prakriti</span>
                  <span className="font-semibold capitalize">{currentCase.ayurvedicMarkers?.suspectedPrakriti || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Agni (Digestion)</span>
                  <span className="font-semibold capitalize">{currentCase.ayurvedicMarkers?.agniStatus || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Diet</span>
                  <span className="font-semibold">{currentCase.ayurvedicMarkers?.dietHabits || 'Not noted'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Sleep</span>
                  <span className="font-semibold">{currentCase.ayurvedicMarkers?.sleepPattern || 'Not noted'}</span>
                </div>
              </div>
            </div>
          </div>

          {currentCase.rawDialogue?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Case Dialogue &amp; Intake Statement</span>
              </h3>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3 text-xs">
                {currentCase.rawDialogue.map((turn, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="font-bold text-gray-700 uppercase text-[10px]">
                      {turn.sender}:
                    </span>
                    <p className="text-gray-900 bg-white p-3 rounded-xl border border-gray-200 leading-relaxed">
                      {turn.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentCase.doctorNotes && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-indigo-700" />
                <span>Doctor Clinical Notes</span>
              </h3>
              <p className="text-xs text-indigo-950 whitespace-pre-wrap leading-relaxed">
                {currentCase.doctorNotes}
              </p>
            </div>
          )}

          {currentCase.prescription?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-600" />
                <span>Prescribed Ayurvedic Formulations</span>
              </h3>
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden">
                {currentCase.prescription.map((rx, idx) => (
                  <div key={idx} className="p-4 bg-white hover:bg-gray-50 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-sm">{rx.medicineName}</span>
                      {rx.duration && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                          {rx.duration}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-gray-600 text-xs pt-1">
                      {rx.dosage && <span><strong>Dosage:</strong> {rx.dosage}</span>}
                      {rx.timing && <span><strong>Timing:</strong> {rx.timing}</span>}
                    </div>
                    {rx.instructions && (
                      <p className="text-gray-500 text-[11px] pt-1">
                        <strong>Anupana / Notes:</strong> {rx.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PatientCaseDetailPage
