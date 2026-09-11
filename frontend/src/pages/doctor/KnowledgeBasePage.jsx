import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axiosInstance from '../../api/axiosInstance'
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Filter, 
  Loader2 
} from 'lucide-react'

export const KnowledgeBasePage = () => {
  const { user } = useSelector((state) => state.auth)

  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [search, setSearch] = useState('')
  const [dangerLevel, setDangerLevel] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingRuleId, setEditingRuleId] = useState(null)
  const [saving, setSaving] = useState(false)

  const [formKeywords, setFormKeywords] = useState('')
  const [formDanger, setFormDanger] = useState('low')
  const [formGeneralTips, setFormGeneralTips] = useState('')
  const [formDietaryNotes, setFormDietaryNotes] = useState('')
  const [formSafeRemedies, setFormSafeRemedies] = useState('')
  const [formActive, setFormActive] = useState(true)

  const fetchRules = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (dangerLevel) params.append('dangerLevel', dangerLevel)
      if (page) params.append('page', String(page))
      params.append('limit', '10')

      const res = await axiosInstance.get(`/kb?${params.toString()}`)
      setRules(res.data?.rules || [])
      setPage(res.data?.page || 1)
      setTotalPages(res.data?.totalPages || 1)
      setTotal(res.data?.total || 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch knowledge base rules')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRules()
  }, [page, dangerLevel])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    fetchRules()
  }

  const handleOpenCreate = () => {
    setEditingRuleId(null)
    setFormKeywords('')
    setFormDanger('low')
    setFormGeneralTips('')
    setFormDietaryNotes('')
    setFormSafeRemedies('')
    setFormActive(true)
    setIsDrawerOpen(true)
  }

  const handleOpenEdit = (rule) => {
    setEditingRuleId(rule._id)
    setFormKeywords(rule.keywordTriggers?.join(', ') || '')
    setFormDanger(rule.dangerClassification || 'low')
    setFormGeneralTips(rule.verifiedAdvice?.generalTips?.join('\n') || '')
    setFormDietaryNotes(rule.verifiedAdvice?.ayurvedicDietaryNotes?.join('\n') || '')
    setFormSafeRemedies(rule.verifiedAdvice?.safeRemedies?.join('\n') || '')
    setFormActive(rule.active !== false)
    setIsDrawerOpen(true)
  }

  const handleSaveRule = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    const keywordsArray = formKeywords
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean)

    if (keywordsArray.length === 0) {
      setError('Please provide at least one keyword trigger.')
      setSaving(false)
      return
    }

    const payload = {
      keywordTriggers: keywordsArray,
      dangerClassification: formDanger,
      active: formActive,
      verifiedAdvice: {
        generalTips: formGeneralTips.split('\n').map((t) => t.trim()).filter(Boolean),
        ayurvedicDietaryNotes: formDietaryNotes.split('\n').map((n) => n.trim()).filter(Boolean),
        safeRemedies: formSafeRemedies.split('\n').map((r) => r.trim()).filter(Boolean)
      }
    }

    try {
      if (editingRuleId) {
        await axiosInstance.put(`/kb/${editingRuleId}`, payload)
        setSuccess('Knowledge base rule updated successfully!')
      } else {
        await axiosInstance.post('/kb', payload)
        setSuccess('New knowledge base rule created successfully!')
      }
      setIsDrawerOpen(false)
      fetchRules()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save rule')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRule = async (ruleId) => {
    if (!window.confirm('Are you sure you want to delete this triage rule?')) return
    try {
      await axiosInstance.delete(`/kb/${ruleId}`)
      setSuccess('Rule deleted successfully!')
      fetchRules()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete rule')
    }
  }

  const dangerBadges = {
    high: 'bg-rose-100 text-rose-800 border-rose-300',
    medium: 'bg-amber-100 text-amber-800 border-amber-300',
    low: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight flex items-center gap-2.5">
              <BookOpen className="w-7 h-7 text-emerald-600" />
              <span>Ayush Clinical Knowledge Base</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Deterministic clinical safety rules, keyword triggers, danger grading, and doctor-verified safe remedies.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Triage Rule</span>
          </button>
        </div>

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{success}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-80">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search symptom keywords..."
                className="w-full pl-10 pr-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={dangerLevel}
              onChange={(e) => {
                setDangerLevel(e.target.value)
                setPage(1)
              }}
              className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none"
            >
              <option value="">All Danger Levels</option>
              <option value="high">High (Red / Emergency)</option>
              <option value="medium">Medium (Amber / Doctor Queue)</option>
              <option value="low">Low (Green / Self-Care)</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Danger</th>
                  <th className="px-6 py-4">Keyword Triggers</th>
                  <th className="px-6 py-4">Safe Remedies</th>
                  <th className="px-6 py-4">Dietary Ahara</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                        <span>Loading clinical rules...</span>
                      </div>
                    </td>
                  </tr>
                ) : rules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      No knowledge base rules found.
                    </td>
                  </tr>
                ) : (
                  rules.map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          dangerBadges[r.dangerClassification] || 'bg-gray-100 text-gray-800'
                        }`}>
                          {r.dangerClassification}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {r.keywordTriggers?.map((k, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold"
                            >
                              {k}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-4 max-w-xs">
                        <p className="line-clamp-2 text-gray-700">
                          {r.verifiedAdvice?.safeRemedies?.join(', ') || '—'}
                        </p>
                      </td>

                      <td className="px-6 py-4 max-w-xs">
                        <p className="line-clamp-2 text-gray-600">
                          {r.verifiedAdvice?.ayurvedicDietaryNotes?.join(', ') || '—'}
                        </p>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          r.active !== false
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {r.active !== false ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(r)}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Edit Rule"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRule(r._id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Rule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
                Page {page} of {totalPages} ({total} rules)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 disabled:opacity-40 font-semibold"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 disabled:opacity-40 font-semibold"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <h2 className="font-bold text-base">
                  {editingRuleId ? 'Edit Clinical Triage Rule' : 'New Clinical Triage Rule'}
                </h2>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="flex-1 p-6 overflow-y-auto space-y-5 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Keyword Triggers * (Comma-separated)
                </label>
                <input
                  type="text"
                  required
                  value={formKeywords}
                  onChange={(e) => setFormKeywords(e.target.value)}
                  placeholder="e.g. chest pain, angina, sweating, shortness of breath"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-gray-900"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Triggers support bilingual Hindi/English negation detection automatically.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Danger Classification *
                  </label>
                  <select
                    value={formDanger}
                    onChange={(e) => setFormDanger(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none font-semibold text-gray-800"
                  >
                    <option value="low">Low (Green / Self-Care)</option>
                    <option value="medium">Medium (Amber / Doctor Review)</option>
                    <option value="high">High (Red / Emergency Alert)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Rule Status
                  </label>
                  <select
                    value={formActive ? 'true' : 'false'}
                    onChange={(e) => setFormActive(e.target.value === 'true')}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none font-semibold text-gray-800"
                  >
                    <option value="true">Active In Triage</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Doctor-Verified Safe Remedies (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formSafeRemedies}
                  onChange={(e) => setFormSafeRemedies(e.target.value)}
                  placeholder="e.g. Gentle steam inhalation with Ajwain&#10;Drink warm water with Tulsi leaves"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Ayurvedic Dietary Notes (Ahara, one per line)
                </label>
                <textarea
                  rows={3}
                  value={formDietaryNotes}
                  onChange={(e) => setFormDietaryNotes(e.target.value)}
                  placeholder="e.g. Avoid heavy dairy or cold curd at night&#10;Consume light Moong Dal soup"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                  General Tips &amp; Vihara (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formGeneralTips}
                  onChange={(e) => setFormGeneralTips(e.target.value)}
                  placeholder="e.g. Rest in well-ventilated room&#10;Avoid excessive physical exertion"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingRuleId ? 'Update Rule' : 'Create Rule'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default KnowledgeBasePage
