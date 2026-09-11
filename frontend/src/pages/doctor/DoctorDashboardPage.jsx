import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { 
  fetchDoctorQueue, 
  setQueueFilters, 
  setQueuePage, 
  caseNewReceived, 
  caseUpdatedReceived 
} from '../../store/doctorQueueSlice'
import { 
  fetchCaseById, 
  updateCasePrescription, 
  downloadCasePdf, 
  clearActiveCase 
} from '../../store/activeCaseSlice'
import { joinDoctorsRoom, joinCaseRoom, leaveCaseRoom, socket } from '../../api/socket'
import { 
  Stethoscope, 
  Filter, 
  AlertOctagon, 
  Clock, 
  User, 
  FileDown, 
  X, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  Loader2, 
  RefreshCw, 
  ExternalLink,
  ChevronRight
} from 'lucide-react'

export const DoctorDashboardPage = () => {
  const dispatch = useDispatch()
  const { cases, filters, page, totalPages, total, status } = useSelector((state) => state.doctorQueue)
  const { currentCase, status: caseStatus, updateStatus, pdfDownloading } = useSelector((state) => state.activeCase)

  const [selectedCaseId, setSelectedCaseId] = useState(null)
  const [newCaseNotification, setNewCaseNotification] = useState(null)

  const [prescriptionList, setPrescriptionList] = useState([
    { medicineName: '', dosage: '', timing: '', duration: '', instructions: '' }
  ])
  const [doctorNotes, setDoctorNotes] = useState('')
  const [caseActionStatus, setCaseActionStatus] = useState('in_consultation')

  useEffect(() => {
    dispatch(fetchDoctorQueue())
    joinDoctorsRoom()

    const handleNewCase = (data) => {
      dispatch(caseNewReceived(data))
      setNewCaseNotification(data)
      setTimeout(() => setNewCaseNotification(null), 8000)
    }

    const handleCaseUpdated = (data) => {
      dispatch(caseUpdatedReceived(data))
    }

    socket.on('case:new', handleNewCase)
    socket.on('case:updated', handleCaseUpdated)

    return () => {
      socket.off('case:new', handleNewCase)
      socket.off('case:updated', handleCaseUpdated)
    }
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchDoctorQueue())
  }, [filters, page, dispatch])

  const handleOpenCaseDrawer = (caseId) => {
    setSelectedCaseId(caseId)
    dispatch(fetchCaseById(caseId))
    joinCaseRoom(caseId)
  }

  const handleCloseCaseDrawer = () => {
    if (selectedCaseId) {
      leaveCaseRoom(selectedCaseId)
    }
    setSelectedCaseId(null)
    dispatch(clearActiveCase())
  }

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
      } else {
        setPrescriptionList([
          { medicineName: '', dosage: '', timing: '', duration: '', instructions: '' }
        ])
      }
    }
  }, [currentCase])

  const handleAddPrescriptionRow = () => {
    setPrescriptionList((prev) => [
      ...prev,
      { medicineName: '', dosage: '', timing: '', duration: '', instructions: '' }
    ])
  }

  const handleRemovePrescriptionRow = (index) => {
    setPrescriptionList((prev) => prev.filter((_, i) => i !== index))
  }

  const handlePrescriptionChange = (index, field, value) => {
    setPrescriptionList((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  const handleSavePrescription = async (e) => {
    e.preventDefault()
    if (!selectedCaseId) return

    const validPrescriptions = prescriptionList.filter((p) => p.medicineName.trim().length > 0)

    const payload = {
      status: caseActionStatus,
      doctorNotes,
      prescription: validPrescriptions
    }

    const result = await dispatch(updateCasePrescription({ caseId: selectedCaseId, payload }))
    if (!result.error) {
      dispatch(fetchDoctorQueue())
    }
  }

  const handleDownloadPdf = () => {
    if (selectedCaseId) {
      dispatch(downloadCasePdf(selectedCaseId))
    }
  }

  const dangerBadgeStyle = {
    high: 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse',
    medium: 'bg-amber-100 text-amber-800 border-amber-300',
    low: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {newCaseNotification && (
          <div className="p-4 rounded-2xl bg-rose-600 text-white shadow-lg flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3">
              <AlertOctagon className="w-6 h-6 animate-spin" style={{ animationDuration: '4s' }} />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block">Incoming Live Case Alert</span>
                <p className="text-sm font-semibold">
                  New Case #{newCaseNotification.caseId?.slice(-6)?.toUpperCase()} submitted with danger level: {newCaseNotification.dangerLevel?.toUpperCase()}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleOpenCaseDrawer(newCaseNotification.caseId)}
              className="px-4 py-1.5 rounded-xl bg-white text-rose-700 text-xs font-bold shadow-xs hover:bg-rose-50 transition-colors"
            >
              Examine Immediately
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight flex items-center gap-2.5">
              <Stethoscope className="w-7 h-7 text-emerald-600" />
              <span>Ayush Clinical OPD Queue</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Autonomous clinical triage prioritization. Sorted server-side by danger weight (High &gt; Medium &gt; Low) and oldest first.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch(fetchDoctorQueue())}
              className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-emerald-700 hover:border-emerald-300 shadow-xs transition-colors"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-4 h-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
            </button>
            <span className="text-xs font-bold bg-white px-3 py-2 rounded-xl border border-gray-200 text-gray-700 shadow-xs">
              {total} Total Cases
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Filters:</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-700">Danger:</label>
            <select
              value={filters.dangerLevel}
              onChange={(e) => dispatch(setQueueFilters({ dangerLevel: e.target.value }))}
              className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">All Danger Levels</option>
              <option value="high">High (SOS Emergency)</option>
              <option value="medium">Medium (Doctor Queue)</option>
              <option value="low">Low (Self-Care)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-700">Status:</label>
            <select
              value={filters.status}
              onChange={(e) => dispatch(setQueueFilters({ status: e.target.value }))}
              className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Active Queue Statuses</option>
              <option value="pending_doctor">Pending Doctor</option>
              <option value="in_consultation">In Consultation</option>
              <option value="emergency_alerted">Emergency Alerted</option>
              <option value="completed">Completed</option>
              <option value="resolved_selfcare">Resolved Self-Care</option>
            </select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <label className="text-xs font-semibold text-gray-700 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.mine}
                onChange={(e) => dispatch(setQueueFilters({ mine: e.target.checked }))}
                className="rounded-sm border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Assigned To Me Only</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Danger</th>
                  <th className="px-6 py-4">Patient Info</th>
                  <th className="px-6 py-4">Chief Complaint / Preview</th>
                  <th className="px-6 py-4">Extracted Symptoms</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      {status === 'loading' ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                          <span>Loading queue cases...</span>
                        </div>
                      ) : (
                        'No patients matching filter criteria in OPD queue.'
                      )}
                    </td>
                  </tr>
                ) : (
                  cases.map((c) => (
                    <tr
                      key={c._id}
                      onClick={() => handleOpenCaseDrawer(c._id)}
                      className="hover:bg-emerald-50/40 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          dangerBadgeStyle[c.dangerLevel] || 'bg-gray-100 text-gray-800'
                        }`}>
                          {c.dangerLevel}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-sm">{c.patient?.name || 'Patient'}</span>
                          <span className="text-gray-400 text-[11px] font-mono">
                            {c.patient?.phone || c.languageUsed?.toUpperCase() || 'Ayush Patient'}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 max-w-xs truncate">
                        <span className="text-gray-700 font-medium">
                          {c.firstMessage || 'Direct Clinical Intake'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {c.symptoms?.slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium text-[10px]"
                            >
                              {s.name || s}
                            </span>
                          ))}
                          {c.symptoms?.length > 3 && (
                            <span className="text-[10px] text-gray-400 font-semibold self-center">
                              +{c.symptoms.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200">
                          {c.status?.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-[11px]">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenCaseDrawer(c._id)
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
                        >
                          <span>Examine</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs">
              <span className="text-gray-500">
                Page {page} of {totalPages} ({total} cases)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => dispatch(setQueuePage(page - 1))}
                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 disabled:opacity-40 font-semibold"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => dispatch(setQueuePage(page + 1))}
                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 disabled:opacity-40 font-semibold"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedCaseId && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base">
                    Case #{selectedCaseId.slice(-6).toUpperCase()}
                  </h2>
                  <p className="text-xs text-slate-400">Clinical Consultation &amp; E-Prescription</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/doctor/cases/${selectedCaseId}`}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Open Dedicated Full Page View"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  onClick={handleCloseCaseDrawer}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {caseStatus === 'loading' ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                  <span className="text-xs text-gray-500 font-semibold">Loading case records...</span>
                </div>
              ) : currentCase ? (
                <>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-gray-400 block">Patient Name</span>
                      <span className="text-sm font-bold text-gray-900">{currentCase.patientId?.name || 'Patient'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-gray-400 block">ABHA ID</span>
                      <span className="text-xs font-mono font-semibold text-gray-700">
                        {currentCase.patientId?.abhaId || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-gray-400 block">Danger Level</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                        dangerBadgeStyle[currentCase.dangerLevel] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {currentCase.dangerLevel}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      disabled={pdfDownloading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>{pdfDownloading ? 'Generating...' : 'Download PDF'}</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Symptoms</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentCase.symptoms?.map((sym, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-800"
                        >
                          {sym.name} {sym.duration && <span className="text-gray-400">({sym.duration})</span>}
                          {sym.severity && <span className="text-emerald-700 font-bold ml-1">[{sym.severity}/10]</span>}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase font-bold block">Suspected Prakriti</span>
                      <span className="font-semibold capitalize text-gray-800">
                        {currentCase.ayurvedicMarkers?.suspectedPrakriti || 'Unknown'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase font-bold block">Agni Status</span>
                      <span className="font-semibold capitalize text-gray-800">
                        {currentCase.ayurvedicMarkers?.agniStatus || 'Unknown'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase font-bold block">Diet Habits</span>
                      <span className="font-semibold text-gray-800">
                        {currentCase.ayurvedicMarkers?.dietHabits || 'None noted'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase font-bold block">Sleep Pattern</span>
                      <span className="font-semibold text-gray-800">
                        {currentCase.ayurvedicMarkers?.sleepPattern || 'None noted'}
                      </span>
                    </div>
                  </div>

                  {currentCase.rawDialogue?.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Intake Dialogue</h3>
                      <div className="max-h-40 overflow-y-auto space-y-2 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                        {currentCase.rawDialogue.map((turn, i) => (
                          <div key={i}>
                            <span className="font-bold uppercase text-[10px] text-gray-500">{turn.sender}:</span>
                            <p className="text-gray-800 bg-white p-2 rounded-lg border border-gray-100">{turn.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSavePrescription} className="space-y-5 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                        Prescribe Ayurvedic Formulations
                      </h3>
                      <button
                        type="button"
                        onClick={handleAddPrescriptionRow}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Formulation</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {prescriptionList.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 relative group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase text-gray-400">Medicine #{idx + 1}</span>
                            {prescriptionList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemovePrescriptionRow(idx)}
                                className="text-gray-400 hover:text-rose-600 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <input
                              type="text"
                              required
                              value={item.medicineName}
                              onChange={(e) => handlePrescriptionChange(idx, 'medicineName', e.target.value)}
                              placeholder="Formulation Name (e.g. Ashwagandha Churna)"
                              className="p-2 bg-white border border-gray-200 rounded-lg sm:col-span-2"
                            />
                            <input
                              type="text"
                              value={item.dosage}
                              onChange={(e) => handlePrescriptionChange(idx, 'dosage', e.target.value)}
                              placeholder="Dosage (e.g. 500mg / 1 tsp)"
                              className="p-2 bg-white border border-gray-200 rounded-lg"
                            />
                            <input
                              type="text"
                              value={item.timing}
                              onChange={(e) => handlePrescriptionChange(idx, 'timing', e.target.value)}
                              placeholder="Timing (e.g. Twice daily after meals)"
                              className="p-2 bg-white border border-gray-200 rounded-lg"
                            />
                            <input
                              type="text"
                              value={item.duration}
                              onChange={(e) => handlePrescriptionChange(idx, 'duration', e.target.value)}
                              placeholder="Duration (e.g. 14 days)"
                              className="p-2 bg-white border border-gray-200 rounded-lg"
                            />
                            <input
                              type="text"
                              value={item.instructions}
                              onChange={(e) => handlePrescriptionChange(idx, 'instructions', e.target.value)}
                              placeholder="Anupana / Carrier (e.g. with warm milk)"
                              className="p-2 bg-white border border-gray-200 rounded-lg"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Clinical Doctor Notes &amp; Pathya (Dietary Advice)
                      </label>
                      <textarea
                        rows={4}
                        value={doctorNotes}
                        onChange={(e) => setDoctorNotes(e.target.value)}
                        placeholder="Clinical remarks, contraindications, diet restrictions, follow-up timeline..."
                        className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Case Disposition Status
                      </label>
                      <select
                        value={caseActionStatus}
                        onChange={(e) => setCaseActionStatus(e.target.value)}
                        className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="in_consultation">In Consultation</option>
                        <option value="resolved_selfcare">Resolved Self-Care</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleCloseCaseDrawer}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={updateStatus === 'loading'}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-2 disabled:opacity-50"
                      >
                        {updateStatus === 'loading' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        <span>Save &amp; Issue Prescription</span>
                      </button>
                    </div>
                  </form>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorDashboardPage
