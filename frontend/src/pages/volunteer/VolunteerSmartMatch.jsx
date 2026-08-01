import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, SlidersHorizontal, Languages, Brain, Music, Heart, Search, X, Star, CheckCircle, ChevronDown } from 'lucide-react'

/* ── Static data representing elderly looking for volunteer help ── */
const ELDERLY_POOL = [
  {
    id: 1, name: 'Patient One', age: 75, city: 'Chennai',
    languages: ['Tamil', 'English'],
    needs: ['Dementia Care', 'Medical Transport'],
    hobbies: ['Reading', 'Chess'],
    matchScore: 0,
    avatar: '👴', living_type: 'Home',
  },
  {
    id: 2, name: 'Patient Two', age: 80, city: 'Bangalore',
    languages: ['Kannada', 'English'],
    needs: ['Diabetes Management', 'Grocery Delivery'],
    hobbies: ['Music', 'Gardening'],
    matchScore: 0,
    avatar: '👵', living_type: 'Care Home',
  },
  {
    id: 3, name: 'Patient Three', age: 71, city: 'Mumbai',
    languages: ['Hindi', 'Marathi'],
    needs: ['Companionship', 'Home Maintenance'],
    hobbies: ['Cricket', 'Cooking'],
    matchScore: 0,
    avatar: '👴', living_type: 'Home',
  },
  {
    id: 4, name: 'Patient Four', age: 78, city: 'New Delhi',
    languages: ['Hindi', 'Punjabi'],
    needs: ['Dementia Care', 'Tech Support'],
    hobbies: ['Reading', 'Music'],
    matchScore: 0,
    avatar: '👵', living_type: 'Care Home',
  },
  {
    id: 5, name: 'Patient Five', age: 73, city: 'Hyderabad',
    languages: ['Telugu', 'English'],
    needs: ['Arthritis Support', 'Grocery Delivery'],
    hobbies: ['Yoga', 'Cooking'],
    matchScore: 0,
    avatar: '👴', living_type: 'Home',
  },
]

const ALL_LANGUAGES = ['Tamil', 'English', 'Kannada', 'Hindi', 'Telugu', 'Marathi', 'Punjabi']
const ALL_SKILLS    = ['Dementia Care', 'Diabetes Management', 'Arthritis Support', 'Tech Support', 'Medical Transport', 'Companionship']
const ALL_HOBBIES   = ['Reading', 'Chess', 'Music', 'Gardening', 'Cricket', 'Cooking', 'Yoga']

function MultiSelect({ label, options, selected, onChange, color }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <label className="label">{label}</label>
      <button type="button"
        onClick={() => setOpen(v => !v)}
        className={`input flex items-center justify-between text-left cursor-pointer ${selected.length > 0 ? 'border-opacity-60' : ''}`}
        style={selected.length > 0 ? { borderColor: color } : {}}
      >
        <span className={selected.length === 0 ? 'text-slate-500' : 'text-white'}>
          {selected.length === 0 ? `Select ${label.toLowerCase()}…` : selected.join(', ')}
        </span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="absolute z-30 mt-1 w-full rounded-xl border border-white/10 shadow-2xl overflow-hidden"
            style={{ background: '#111827' }}
          >
            {options.map(opt => {
              const picked = selected.includes(opt)
              return (
                <button key={opt} type="button"
                  onClick={() => {
                    onChange(picked ? selected.filter(s => s !== opt) : [...selected, opt])
                  }}
                  className="flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors text-left"
                  style={{
                    background: picked ? 'rgba(96,137,255,0.15)' : 'transparent',
                  }}
                  onMouseEnter={e => { if (!picked) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                  onMouseLeave={e => { if (!picked) e.currentTarget.style.background = 'transparent' }}
                >
                  <span className={picked ? 'text-white font-semibold' : 'text-slate-300'}>{opt}</span>
                  {picked && <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color }} />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

function ScoreBadge({ score }) {
  if (score === 0) return <span className="badge badge-gray">No match</span>
  if (score >= 80) return <span className="badge badge-green">⭐ Perfect match</span>
  if (score >= 50) return <span className="badge badge-blue">Good match</span>
  return <span className="badge badge-yellow">Partial match</span>
}

function MatchBar({ score }) {
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#6089ff' : '#f97316'
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-400">Match Score</span>
        <span style={{ color }} className="font-bold">{score}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${score}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  )
}

function computeScore(elderly, langs, skills, hobbies) {
  if (!langs.length && !skills.length && !hobbies.length) return 0
  let score = 0, total = 0
  if (langs.length) {
    total += 40
    const hits = langs.filter(l => elderly.languages.includes(l)).length
    score += (hits / langs.length) * 40
  }
  if (skills.length) {
    total += 40
    const hits = skills.filter(s => elderly.needs.includes(s)).length
    score += (hits / skills.length) * 40
  }
  if (hobbies.length) {
    total += 20
    const hits = hobbies.filter(h => elderly.hobbies.includes(h)).length
    score += (hits / hobbies.length) * 20
  }
  const base = total > 0 ? (score / total) * 100 : 0
  return Math.round(base)
}

export default function VolunteerSmartMatch() {
  const [langs, setLangs]   = useState([])
  const [skills, setSkills] = useState([])
  const [hobbies, setHobbies] = useState([])
  const [searched, setSearched] = useState(false)
  const [results, setResults] = useState([])

  const handleSearch = () => {
    const scored = ELDERLY_POOL.map(e => ({
      ...e, matchScore: computeScore(e, langs, skills, hobbies)
    })).sort((a, b) => b.matchScore - a.matchScore)
    setResults(scored)
    setSearched(true)
  }

  const handleClear = () => { setLangs([]); setSkills([]); setHobbies([]); setSearched(false); setResults([]) }

  const hasFilters = langs.length > 0 || skills.length > 0 || hobbies.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-400" />Smart Match
        </h3>
        <p className="text-slate-400 text-sm mt-1">
          Use filters to find elderly patients who best match your skills and preferences.
        </p>
      </div>

      {/* Filter card */}
      <motion.div className="card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-5">
          <SlidersHorizontal className="w-4 h-4 text-primary-400" />
          <span className="font-bold text-white text-sm">Your Profile Filters</span>
          {hasFilters && (
            <button onClick={handleClear} className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 transition-colors">
              <X className="w-3.5 h-3.5" /> Clear all
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <MultiSelect
            label="Languages I Speak"
            options={ALL_LANGUAGES}
            selected={langs}
            onChange={setLangs}
            color="#6089ff"
          />
          <MultiSelect
            label="Medical Skills"
            options={ALL_SKILLS}
            selected={skills}
            onChange={setSkills}
            color="#10b981"
          />
          <MultiSelect
            label="Shared Hobbies"
            options={ALL_HOBBIES}
            selected={hobbies}
            onChange={setHobbies}
            color="#f97316"
          />
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 mt-4">
            {[...langs.map(l => ({ label: l, color: '#6089ff', icon: Languages })),
              ...skills.map(s => ({ label: s, color: '#10b981', icon: Brain })),
              ...hobbies.map(h => ({ label: h, color: '#f97316', icon: Music }))
            ].map(chip => (
              <motion.span key={chip.label}
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: `${chip.color}22`, color: chip.color, border: `1px solid ${chip.color}40` }}
              >
                <chip.icon className="w-3 h-3" />
                {chip.label}
              </motion.span>
            ))}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={handleSearch}
          disabled={!hasFilters}
          className="btn-primary mt-5 disabled:opacity-40"
        >
          <Search className="w-4 h-4" />
          Find My Matches
        </motion.button>
      </motion.div>

      {/* How it works */}
      {!searched && (
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Languages, color: '#6089ff', title: 'Language Matching', desc: 'Patients are matched by shared languages to ensure comfortable communication.' },
            { icon: Brain,     color: '#10b981', title: 'Medical Skills',   desc: 'Your specialized knowledge (dementia care, diabetes, etc.) is matched to patient needs.' },
            { icon: Music,     color: '#f97316', title: 'Shared Hobbies',   desc: 'Common interests foster genuine connections beyond caregiving.' },
          ].map((item, i) => (
            <motion.div key={item.title}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="card"
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: `${item.color}22` }}>
                <item.icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
              <h5 className="font-bold text-white text-sm mb-1">{item.title}</h5>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {searched && (
          <motion.div key="results"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white">
                Matched Patients
                <span className="ml-2 text-primary-400">({results.filter(r => r.matchScore > 0).length} matches)</span>
              </h4>
              <span className="text-xs text-slate-400">Sorted by compatibility</span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((e, i) => (
                <motion.div key={e.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`card transition-all ${e.matchScore >= 80 ? 'ring-1 ring-emerald-500/40' : e.matchScore >= 50 ? 'ring-1 ring-primary-500/30' : ''}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{e.avatar}</div>
                      <div>
                        <div className="font-bold text-white text-sm">{e.name}</div>
                        <div className="text-xs text-slate-400">Age {e.age} · {e.city}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{e.living_type}</div>
                      </div>
                    </div>
                    <ScoreBadge score={e.matchScore} />
                  </div>

                  {/* Language chips */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {e.languages.map(l => (
                        <span key={l} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            background: langs.includes(l) ? '#6089ff33' : 'rgba(255,255,255,0.06)',
                            color: langs.includes(l) ? '#93c5fd' : '#64748b',
                            border: langs.includes(l) ? '1px solid #6089ff40' : '1px solid transparent',
                          }}>
                          {l}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {e.needs.map(n => (
                        <span key={n} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            background: skills.includes(n) ? '#10b98133' : 'rgba(255,255,255,0.06)',
                            color: skills.includes(n) ? '#6ee7b7' : '#64748b',
                            border: skills.includes(n) ? '1px solid #10b98140' : '1px solid transparent',
                          }}>
                          {n}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {e.hobbies.map(h => (
                        <span key={h} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            background: hobbies.includes(h) ? '#f9731633' : 'rgba(255,255,255,0.06)',
                            color: hobbies.includes(h) ? '#fdba74' : '#64748b',
                            border: hobbies.includes(h) ? '1px solid #f9731640' : '1px solid transparent',
                          }}>
                          🎯 {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  <MatchBar score={e.matchScore} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
