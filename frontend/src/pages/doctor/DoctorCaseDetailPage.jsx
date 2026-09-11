import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
  fetchCaseById, 
  updateCasePrescription, 
  downloadCasePdf, 
  caseUpdatedLive 
} from '../../store/activeCaseSlice'
import { joinCaseRoom, leaveCaseRoom, socket } from '../../api/socket'
import { 
  ArrowLeft, 
  Stethoscope, 
  FileDown, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2 
} from 'lucide-react'

export const DoctorCaseDetailPage = () => {
  const { caseId } = useParams()
  const dispatch = useDispatch()
  const { currentCase, status, updateStatus, pdfDownloading } = useSelector((state) => state.activeCase)

  const [prescriptionList, setPrescriptionList] = useState([
    { medicineName: '', dosage: '', timing: '', duration: '', instructions: '' }
  ])
  const [doctorNotes, setDoctorNotes] = useState('')
  const [caseActionStatus, setCaseActionStatus] = useState('in_consultation')
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (caseId) {
      dispatch(fetchCaseById(caseId))
      joinCaseRoom(caseId)

      const handleCaseUpdate = (payload) => {
        if (String(payload.caseId || payload._id) === String(caseId)) {
          dispatch(caseUpdatedLive(payload))
        }
      }

      socket.on('case:updated', handleCaseUpdate)

      return () => {
        socket.off('case:updated', handleCaseUpdate)
        leaveCaseRoom(caseId)
      }
    }
  }, [caseId, dispatch])

  useEffect(() => {
    if (currentCase) {
      setDoctorNotes(currentCase.doctorNotes || '')
      setCaseActionStatus(
        ['in_consultation', 'resolved_selfcare', 'completed'].includes(currentCase.status)
          ? currentCase.status
          : 'in_consultation'
      )
      if (currentCase.prescription?.length > 0) {
        setPrescriptionList(currentCase.prescription)
      }
    }
  }, [currentCase])

  const handleAddRow = () => {
    setPrescriptionList((prev) => [
      ...prev,
      { medicineName: '', dosage: '', timing: '', duration: '', instructions: '' }
    ])
  }

  const handleRemoveRow = (index) => {
    setPrescriptionList((prev) => prev.filter((_, i) => i !== index))
  }

  const handleChangeRow = (index, field, value) => {
    setPrescriptionList((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!caseId) return
    const validPrescriptions = prescriptionList.filter((p) => p.medicineName.trim().length > 0)
    const payload = {
      status: caseActionStatus,
      doctorNotes,
      prescription: validPrescriptions
    }

    const result = await dispatch(updateCasePrescription({ caseId, payload }))
    if (!result.error) {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 4000)
    }
  }

  const handleDownload = () => {
    if (caseId) {
      dispatch(downloadCasePdf(caseId))
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-xs font-semibold text-gray-600">Loading case file...</p>
        </div>
      </div>
    )
  }

  if (!currentCase) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-gray-200 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-gray-900">Case Record Not Accessible</h2>
          <Link
            to="/doctor/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to OPD Queue</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/doctor/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-emerald-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Doctor Dashboard</span>
          </Link>

          <button
            onClick={handleDownload}
            disabled={pdfDownloading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs disabled:opacity-50"
          >
            <FileDown className="w-4 h-4" />
            <span>{pdfDownloading ? 'Generating PDF...' : 'Download Official PDF'}</span>
          </button>
        </div>

        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold">Prescription and clinical case update committed successfully!</span>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200">
                  Danger: {currentCase.dangerLevel}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200">
                  Status: {currentCase.status?.replace('_', ' ')}
                </span>
              </div>
              <h1 className="text-2xl font-black text-gray-900">
                Case Examination #{currentCase._id.slice(-6).toUpperCase()}
              </h1>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Logged: {new Date(currentCase.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-1">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Patient</span>
              <p className="font-bold text-gray-900">{currentCase.patientId?.name || 'Registered Patient'}</p>
              <p className="text-gray-500 font-mono">{currentCase.patientId?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Reported Symptoms</h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {currentCase.symptoms?.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-xs text-gray-800 font-medium"
                  >
                    {s.name} {s.duration && <span className="text-gray-400">({s.duration})</span>}
                    {s.severity && <span className="text-emerald-700 font-bold ml-1">[{s.severity}/10]</span>}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Suspected Prakriti</span>
                <span className="font-semibold capitalize text-gray-800">{currentCase.ayurvedicMarkers?.suspectedPrakriti || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Agni Status</span>
                <span className="font-semibold capitalize text-gray-800">{currentCase.ayurvedicMarkers?.agniStatus || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Diet Habits</span>
                <span className="font-semibold text-gray-800">{currentCase.ayurvedicMarkers?.dietHabits || 'None'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Sleep Quality</span>
                <span className="font-semibold text-gray-800">{currentCase.ayurvedicMarkers?.sleepPattern || 'None'}</span>
              </div>
            </div>
          </div>

          {currentCase.rawDialogue?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Patient Speech Transcript</h3>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs max-h-48 overflow-y-auto">
                {currentCase.rawDialogue.map((turn, i) => (
                  <div key={i} className="bg-white p-3 rounded-xl border border-gray-100">
                    <span className="font-bold uppercase text-[10px] text-gray-400 block mb-1">{turn.sender}</span>
                    <p className="text-gray-800 leading-relaxed">{turn.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-emerald-600" />
                <span>Ayurvedic E-Prescription Form</span>
              </h2>
              <button
                type="button"
                onClick={handleAddRow}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Formulation</span>
              </button>
            </div>

            <div className="space-y-3">
              {prescriptionList.map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-gray-400">Medicine #{idx + 1}</span>
                    {prescriptionList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        className="text-gray-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                    <input
                      type="text"
                      required
                      value={item.medicineName}
                      onChange={(e) => handleChangeRow(idx, 'medicineName', e.target.value)}
                      placeholder="Medicine Name (e.g. Mahasudarshan Vati)"
                      className="p-2.5 bg-white border border-gray-200 rounded-xl sm:col-span-2 font-medium"
                    />
                    <input
                      type="text"
                      value={item.dosage}
                      onChange={(e) => handleChangeRow(idx, 'dosage', e.target.value)}
                      placeholder="Dosage (e.g. 2 tablets)"
                      className="p-2.5 bg-white border border-gray-200 rounded-xl"
                    />
                    <input
                      type="text"
                      value={item.timing}
                      onChange={(e) => handleChangeRow(idx, 'timing', e.target.value)}
                      placeholder="Timing (e.g. After breakfast and dinner)"
                      className="p-2.5 bg-white border border-gray-200 rounded-xl"
                    />
                    <input
                      type="text"
                      value={item.duration}
                      onChange={(e) => handleChangeRow(idx, 'duration', e.target.value)}
                      placeholder="Duration (e.g. 7 days)"
                      className="p-2.5 bg-white border border-gray-200 rounded-xl sm:col-span-2"
                    />
                    <input
                      type="text"
                      value={item.instructions}
                      onChange={(e) => handleChangeRow(idx, 'instructions', e.target.value)}
                      placeholder="Instructions / Anupana (e.g. with lukewarm water)"
                      className="p-2.5 bg-white border border-gray-200 rounded-xl sm:col-span-2"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Doctor Remarks &amp; Clinical Notes
              </label>
              <textarea
                rows={4}
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="Diagnostic observations, dietary restrictions (pathya/apathya), follow-up consultation date..."
                className="w-full p-3.5 text-xs bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Update Case Status
                </label>
                <select
                  value={caseActionStatus}
                  onChange={(e) => setCaseActionStatus(e.target.value)}
                  className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold text-gray-800"
                >
                  <option value="in_consultation">In Consultation</option>
                  <option value="resolved_selfcare">Resolved Self-Care</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex items-end justify-end">
                <button
                  type="submit"
                  disabled={updateStatus === 'loading'}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {updateStatus === 'loading' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Save Clinical Assessment</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DoctorCaseDetailPage
