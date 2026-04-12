import { useState, useEffect, useRef } from 'react';
import {
  BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate,
} from 'react-router-dom';
import {
  Briefcase, LogOut, Settings, PlusCircle, Search, CheckCircle,
  TrendingUp, MapPin, DollarSign, Clock, ExternalLink, Zap, Globe,
  Loader2, Sparkles, Lightbulb, Upload, Star, BarChart2, FileText,
  Award, Target, AlertCircle, ChevronRight, X, Brain, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType, Job, Skill, Application } from './types';

// ── Resume Upload + AI Skill Extraction ──────────────────────────────────────

const ResumeUploadCard = ({ token, onSkillsExtracted }: { token: string, onSkillsExtracted: (skills: any[], name: string) => void }) => {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const res = await fetch('/api/resume/extract', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    }
    setUploading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 border border-indigo-100">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-indigo-600" />
        <h3 className="text-sm font-bold text-indigo-900">AI Resume Skill Extractor</h3>
        <span className="px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-black rounded-full uppercase tracking-wider">New</span>
      </div>

      {!result ? (
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleUpload(f); }}
          className="border-2 border-dashed border-indigo-200 rounded-2xl p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-white/50 transition-all group"
        >
          <input ref={fileRef} type="file" accept=".pdf,.txt" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-sm text-indigo-600 font-medium">Gemini is reading your resume...</p>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-indigo-300 mx-auto mb-2 group-hover:text-indigo-500 transition-colors" />
              <p className="text-sm font-bold text-indigo-700">Drop your resume here</p>
              <p className="text-xs text-indigo-400 mt-1">PDF or TXT • Max 10MB</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {result.name && (
            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-indigo-100">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-sm font-bold text-gray-900">{result.name}</span>
            </div>
          )}
          {result.summary && (
            <p className="text-xs text-gray-600 italic px-1">{result.summary}</p>
          )}
          <div>
            <p className="text-xs font-bold text-indigo-700 mb-2">Extracted Skills ({result.extractedSkills?.length || 0})</p>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
              {result.extractedSkills?.map((s: string, i: number) => (
                <span key={i} className="px-2 py-1 bg-white text-indigo-700 text-[11px] font-bold rounded-lg border border-indigo-100">{s}</span>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onSkillsExtracted(result.matchedSkills, result.name)}
              className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all"
            >
              Auto-fill Profile →
            </button>
            <button onClick={() => setResult(null)} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </motion.div>
  );
};

// ── AI Resume Score ───────────────────────────────────────────────────────────

const ResumeScoreCard = ({ token }: { token: string }) => {
  const [uploading, setUploading] = useState(false);
  const [score, setScore] = useState<any>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const res = await fetch('/api/resume/score', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setScore(data);
    } catch (err: any) {
      setError(err.message);
    }
    setUploading(false);
  };

  const scoreColor = (s: number) => s >= 75 ? 'text-emerald-600' : s >= 50 ? 'text-amber-600' : 'text-red-500';
  const scoreRingColor = (s: number) => s >= 75 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';
  const circumference = 2 * Math.PI * 40;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-amber-500" />
        <h3 className="text-sm font-bold text-gray-900">AI Resume Score</h3>
        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black rounded-full uppercase tracking-wider">Gemini</span>
      </div>

      {!score ? (
        <div>
          <input ref={fileRef} type="file" accept=".pdf,.txt" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-amber-200 rounded-2xl hover:border-amber-400 hover:bg-amber-50 transition-all disabled:opacity-60"
          >
            {uploading ? <Loader2 className="w-5 h-5 text-amber-500 animate-spin" /> : <Upload className="w-5 h-5 text-amber-400" />}
            <span className="text-sm font-bold text-amber-700">{uploading ? 'Scoring your resume...' : 'Upload Resume to Score'}</span>
          </button>
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Score Ring */}
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                <circle cx="50" cy="50" r="40" fill="none"
                  stroke={scoreRingColor(score.score)}
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (score.score / 100) * circumference}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-black ${scoreColor(score.score)}`}>{score.score}</span>
                <span className="text-[9px] text-gray-400 font-bold">/ 100</span>
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              {Object.entries(score.breakdown || {}).map(([key, val]: any) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 w-20 capitalize">{key}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${(val / 25) * 100}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-600 w-8 text-right">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths */}
          {score.strengths?.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1.5">✓ Strengths</p>
              <ul className="space-y-1">
                {score.strengths.map((s: string, i: number) => (
                  <li key={i} className="text-[11px] text-gray-700 flex items-start gap-1.5">
                    <span className="text-emerald-500 mt-0.5">•</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {score.improvements?.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1.5">↑ Improve</p>
              <ul className="space-y-1">
                {score.improvements.map((s: string, i: number) => (
                  <li key={i} className="text-[11px] text-gray-700 flex items-start gap-1.5">
                    <span className="text-amber-500 mt-0.5">•</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={() => setScore(null)} className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">
            Score another resume →
          </button>
        </div>
      )}
    </motion.div>
  );
};

// ── Dashboard Analytics ───────────────────────────────────────────────────────

const AnalyticsPanel = ({ token }: { token: string }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setAnalytics(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 flex items-center gap-3">
      <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
      <span className="text-sm text-gray-500">Loading analytics...</span>
    </div>
  );

  if (!analytics) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <BarChart2 className="w-5 h-5 text-indigo-600" />
        <h3 className="text-sm font-bold text-gray-900">Your Analytics</h3>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: 'Applications', value: analytics.applicationsCount, icon: <Briefcase className="w-4 h-4" />, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Avg Match Rate', value: `${analytics.avgMatchRate}%`, icon: <Target className="w-4 h-4" />, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Skills Added', value: analytics.totalSkills, icon: <Brain className="w-4 h-4" />, color: 'bg-purple-50 text-purple-600' },
          { label: 'Profile', value: `${analytics.profileCompleteness}%`, icon: <Users className="w-4 h-4" />, color: 'bg-amber-50 text-amber-600' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-gray-50 rounded-2xl p-3">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${color} mb-2`}>{icon}</div>
            <p className="text-lg font-black text-gray-900">{value}</p>
            <p className="text-[10px] text-gray-500 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Profile Completeness Bar */}
      <div className="mb-5">
        <div className="flex justify-between mb-1.5">
          <span className="text-xs font-bold text-gray-700">Profile Completeness</span>
          <span className="text-xs font-black text-indigo-600">{analytics.profileCompleteness}%</span>
        </div>
        <div className="bg-gray-100 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${analytics.profileCompleteness}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
          />
        </div>
      </div>

      {/* Skill Demand */}
      {analytics.skillDemand?.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-700 mb-3">Skill Demand in Portal</p>
          <div className="space-y-2">
            {analytics.skillDemand.map(({ skill, demand }: any) => (
              <div key={skill} className="flex items-center gap-2">
                <span className="text-[11px] text-gray-600 w-24 truncate">{skill}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                  <div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: `${Math.min(100, demand * 33)}%` }} />
                </div>
                <span className="text-[10px] text-gray-400 w-8 text-right">{demand} job{demand !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ── Job Description Summary Widget ───────────────────────────────────────────

const JobDescriptionSummary = ({ token }: { token: string }) => {
  const [description, setDescription] = useState('');
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/jobs/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSummary(data);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="text-sm font-bold text-gray-900">AI Job Description Summarizer</h3>
      </div>

      {!summary ? (
        <>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Paste a long job description here and Gemini will extract the key info..."
            className="w-full h-32 p-3 text-sm border border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-purple-400 outline-none text-gray-700 placeholder-gray-400"
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          <button
            onClick={handleSummarize}
            disabled={loading || !description.trim()}
            className="mt-3 w-full flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-2xl font-bold text-sm hover:bg-purple-700 transition-all disabled:opacity-50"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Summarizing...</> : <><Sparkles className="w-4 h-4" /> Summarize with Gemini</>}
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-700 leading-relaxed">{summary.summary}</p>

          {/* Quick tags */}
          <div className="flex flex-wrap gap-2">
            {summary.remote && (
              <span className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100">
                <Globe className="w-3 h-3" /> Remote
              </span>
            )}
            {summary.experience && summary.experience !== 'Not specified' && (
              <span className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-100">
                <Clock className="w-3 h-3" /> {summary.experience}
              </span>
            )}
          </div>

          {/* Key skills */}
          {summary.keySkills?.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Required Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {summary.keySkills.map((s: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg border border-purple-100">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Bullets */}
          {summary.bullets?.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Key Points</p>
              <ul className="space-y-1.5">
                {summary.bullets.map((b: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                    <ChevronRight className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={() => { setSummary(null); setDescription(''); }}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            ← Summarize another
          </button>
        </div>
      )}
    </motion.div>
  );
};

// ── Source badge ──────────────────────────────────────────────────────────────

const SourceBadge = ({ source }: { source?: string }) => {
  if (!source || source === 'local') return null;
  const isIndeed = source === 'indeed';
  const isAI = source === 'ai';
  if (isAI) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-purple-50 text-purple-600 border-purple-100">
      <Sparkles className="w-2.5 h-2.5" /> AI
    </span>
  );
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
      isIndeed ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'
    }`}>
      <Globe className="w-2.5 h-2.5" />
      {isIndeed ? 'Indeed' : 'Dice'}
    </span>
  );
};

// ── JobCard ───────────────────────────────────────────────────────────────────

const JobCard = ({
  job, onApply, applied, token
}: {
  job: Job & { source?: string; url?: string; description?: string },
  onApply?: (id: number) => void,
  applied?: boolean,
  token?: string
}) => {
  const isHighMatch = (job.matchScore || 0) >= 80;
  const isExternal = job.source && job.source !== 'local';
  const [insight, setInsight] = useState('');

  useEffect(() => {
    if (!token || !job.description || !isExternal) return;
    // Lazily fetch Gemini insight for external jobs
    fetch('/api/jobs/insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ jobTitle: job.title, jobDescription: job.description })
    }).then(r => r.json()).then(d => { if (d.insight) setInsight(d.insight); }).catch(() => {});
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group flex flex-col"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">
              {job.title}
            </h3>
            <SourceBadge source={job.source} />
          </div>
          <p className="text-gray-600 font-medium text-sm">{job.company}</p>
        </div>
        {job.matchScore !== undefined && (
          <div className="flex flex-col items-end shrink-0">
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${
              isHighMatch ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
            }`}>
              {job.matchScore}%
            </div>
            {isHighMatch && <span className="text-[10px] font-bold text-emerald-600 mt-0.5">Top Match</span>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500"><MapPin className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{job.location}</span></div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500"><DollarSign className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{job.salary_range}</span></div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500"><Clock className="w-3.5 h-3.5 shrink-0" />{job.job_type}</div>
      </div>

      {job.skills && job.skills.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1.5">
            {job.skills.map(s => (
              <span key={s.skill_id} className="px-2 py-1 bg-gray-50 text-gray-600 text-[11px] font-medium rounded-md border border-gray-100">{s.skill_name}</span>
            ))}
          </div>
        </div>
      )}

      {insight && (
        <div className="mb-3 px-3 py-2 bg-purple-50 rounded-xl border border-purple-100 flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-500 mt-0.5 shrink-0" />
          <p className="text-xs text-purple-700 leading-relaxed">{insight}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
        <span className="text-[11px] text-gray-400">{new Date(job.created_at).toLocaleDateString()}</span>
        {isExternal ? (
          <a href={(job as any).url || '#'} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all">
            Apply <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : onApply && (
          <button disabled={applied} onClick={() => onApply(job.job_id as number)}
            className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${
              applied ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
            }`}>
            {applied ? 'Applied ✓' : 'Apply Now'}
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ── Navbar ────────────────────────────────────────────────────────────────────

const Navbar = ({ user, onLogout }: { user: UserType | null, onLogout: () => void }) => (
  <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg"><Briefcase className="text-white w-5 h-5" /></div>
            <span className="text-xl font-bold text-gray-900">JobMatch AI</span>
          </Link>
          {user?.role === 'candidate' && (
            <div className="hidden md:flex items-center gap-5">
              <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium text-sm">Dashboard</Link>
              <Link to="/jobs" className="text-gray-600 hover:text-indigo-600 font-medium text-sm">Find Jobs</Link>
            </div>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-gray-600 hover:text-indigo-600 font-medium text-sm">Admin Panel</Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
              <button onClick={onLogout} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"><LogOut className="w-5 h-5" /></button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium px-4 py-2 text-sm">Login</Link>
              <Link to="/register" className="bg-indigo-600 text-white px-5 py-2 rounded-full font-medium hover:bg-indigo-700 transition-all shadow-sm text-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </div>
  </nav>
);

// ── Login ─────────────────────────────────────────────────────────────────────

const LoginPage = ({ onLogin }: { onLogin: (data: any) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      onLogin(data);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) { setError(err.message); }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-gray-50">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="bg-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200"><Briefcase className="text-white w-6 h-6" /></div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-500 mt-1 text-sm">Sign in to your account</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium mb-5">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" required />
          </div>
          <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Sign In</button>
        </form>
        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-500 text-sm">No account? <Link to="/register" className="text-indigo-600 font-bold hover:underline">Create one</Link></p>
        </div>
      </motion.div>
    </div>
  );
};

// ── Register ──────────────────────────────────────────────────────────────────

const RegisterPage = () => {
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) { setError(err.message); }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-gray-50">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-500 mt-1 text-sm">Join our AI-powered job network</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-5">{error}</div>}
        {success && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-sm mb-5">Account created! Redirecting...</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {[{ key: 'name', label: 'Full Name', type: 'text' }, { key: 'email', label: 'Email', type: 'email' }, { key: 'password', label: 'Password', type: 'password' }].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-bold text-gray-700 mb-1">{f.label}</label>
              <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" required />
            </div>
          ))}
          <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all mt-2">Register</button>
        </form>
      </motion.div>
    </div>
  );
};

// ── Candidate Dashboard ───────────────────────────────────────────────────────

const CandidateDashboard = ({ token }: { token: string }) => {
  const [profile, setProfile] = useState<UserType | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [resumeTips, setResumeTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [recsLoading, setRecsLoading] = useState(true);
  const [tipsLoading, setTipsLoading] = useState(true);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch('/api/profile', { headers }).then(r => r.json()),
      fetch('/api/applications', { headers }).then(r => r.json()),
    ]).then(([p, a]) => { setProfile(p); setApplications(a); setLoading(false); });

    fetch('/api/recommendations', { headers }).then(r => r.json())
      .then(d => { setRecommendations(d); setRecsLoading(false); }).catch(() => setRecsLoading(false));

    fetch('/api/resume-tips', { headers }).then(r => r.json())
      .then(d => { setResumeTips(d.tips || []); setTipsLoading(false); }).catch(() => setTipsLoading(false));
  }, [token]);

  if (loading) return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" /></div>;

  const localCount = recommendations.filter(j => j.source === 'local').length;
  const indeedCount = recommendations.filter(j => j.source === 'indeed').length;
  const diceCount = recommendations.filter(j => j.source === 'dice').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left sidebar */}
        <div className="lg:col-span-1 space-y-5">
          {/* Profile card */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-xl">
                {profile?.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">{profile?.name}</h2>
                <p className="text-gray-500 text-xs">{profile?.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {profile?.skills?.length === 0 && <p className="text-sm text-gray-400 italic">No skills added yet.</p>}
              {profile?.skills?.map(s => (
                <span key={s.skill_id} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                  {s.skill_name}
                </span>
              ))}
            </div>
            <Link to="/profile" className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors">
              <Settings className="w-4 h-4" /> Edit Profile
            </Link>
          </motion.div>

          {/* Source stats */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}
            className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Match Sources</h3>
            <div className="space-y-2.5">
              {[
                { label: 'JobMatch Portal', count: localCount, cls: 'bg-indigo-100 text-indigo-700' },
                { label: 'Indeed', count: indeedCount, cls: 'bg-blue-100 text-blue-700' },
                { label: 'Dice', count: diceCount, cls: 'bg-orange-100 text-orange-700' },
              ].map(({ label, count, cls }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${cls}`}>{count} jobs</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Dashboard Analytics */}
          <AnalyticsPanel token={token} />

          {/* AI Resume Score */}
          <ResumeScoreCard token={token} />

          {/* AI Resume Tips */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-5 border border-purple-100">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-purple-900">AI Resume Tips</h3>
            </div>
            {tipsLoading ? (
              <div className="flex items-center gap-2 text-sm text-purple-600">
                <Loader2 className="w-4 h-4 animate-spin" /> Generating tips...
              </div>
            ) : resumeTips.length > 0 ? (
              <ul className="space-y-3">
                {resumeTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold text-xs mt-0.5">{i + 1}.</span>
                    <p className="text-xs text-purple-800 leading-relaxed">{tip}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-purple-600 italic">Add skills to get personalized tips.</p>
            )}
          </motion.div>

          {/* Applications */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Applications</h3>
            <div className="space-y-3">
              {applications.map(app => (
                <div key={app.application_id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{app.title}</p>
                    <p className="text-xs text-gray-500">{app.company}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${app.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{app.status}</span>
                </div>
              ))}
              {applications.length === 0 && <p className="text-sm text-gray-400 text-center py-2">No applications yet.</p>}
            </div>
          </motion.div>
        </div>

        {/* Right: Recommendations */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="text-indigo-600 w-5 h-5" /> AI Recommendations
              {recsLoading && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
            </h2>
            <Link to="/jobs" className="text-indigo-600 font-bold text-sm hover:underline">View All →</Link>
          </div>

          {recsLoading && recommendations.length === 0 && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-indigo-500 animate-spin shrink-0" />
              <div>
                <p className="text-sm font-bold text-indigo-700">Searching Indeed, Dice & generating AI matches...</p>
                <p className="text-xs text-indigo-500 mt-0.5">This may take a few seconds</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AnimatePresence>
              {recommendations.map(job => (
                <JobCard key={job.job_id} job={job} token={token}
                  applied={job.source === 'local' && applications.some(a => a.job_id === job.job_id)}
                  onApply={job.source === 'local' ? async (id) => {
                    await fetch('/api/applications', {
                      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ jobId: id })
                    });
                    setApplications(prev => [...prev, { job_id: id } as any]);
                  } : undefined}
                />
              ))}
            </AnimatePresence>
            {!recsLoading && recommendations.length === 0 && (
              <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
                <Sparkles className="text-gray-300 w-10 h-10 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900">No matches yet</h3>
                <p className="text-gray-500 mt-2 text-sm">Add skills to get AI-powered recommendations from our portal, Indeed, and Dice.</p>
                <Link to="/profile" className="inline-block mt-5 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all text-sm">Update Skills</Link>
              </div>
            )}
          </div>

          {/* Job Description Summarizer */}
          <JobDescriptionSummary token={token} />
        </div>
      </div>
    </div>
  );
};

// ── Job Listings ──────────────────────────────────────────────────────────────

const JobListings = ({ token }: { token: string }) => {
  const [localJobs, setLocalJobs] = useState<any[]>([]);
  const [externalJobs, setExternalJobs] = useState<{ indeed: any[], dice: any[] }>({ indeed: [], dice: [] });
  const [loading, setLoading] = useState(true);
  const [externalLoading, setExternalLoading] = useState(false);
  const [filter, setFilter] = useState({ location: '', type: '' });
  const [tab, setTab] = useState<'local' | 'indeed' | 'dice'>('local');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetch('/api/jobs').then(r => r.json()).then(d => { setLocalJobs(d); setLoading(false); });
  }, []);

  const searchExternal = async () => {
    setExternalLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams({ q: searchQuery || 'software developer' });
      if (filter.location) params.set('location', filter.location);
      const data = await fetch(`/api/jobs/external?${params}`).then(r => r.json());
      setExternalJobs({ indeed: data.indeed || [], dice: data.dice || [] });
    } catch { /* ignore */ }
    setExternalLoading(false);
  };

  const filteredLocal = localJobs.filter(j =>
    (!filter.location || j.location.toLowerCase().includes(filter.location.toLowerCase())) &&
    (!filter.type || j.job_type === filter.type)
  );

  const activeJobs = tab === 'local' ? filteredLocal : (tab === 'indeed' ? externalJobs.indeed : externalJobs.dice);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore Opportunities</h2>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-2xl w-fit mb-6">
        {[
          { key: 'local', label: 'Portal', count: filteredLocal.length },
          { key: 'indeed', label: 'Indeed', count: externalJobs.indeed.length },
          { key: 'dice', label: 'Dice', count: externalJobs.dice.length },
        ].map(({ key, label, count }) => (
          <button key={key} onClick={() => setTab(key as any)}
            className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${tab === key ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
            {count > 0 && <span className="ml-1.5 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black">{count}</span>}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        {tab !== 'local' && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Job title or skill..."
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-52"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchExternal()} />
          </div>
        )}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Location..."
            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-40"
            value={filter.location} onChange={e => setFilter({ ...filter, location: e.target.value })} />
        </div>
        {tab === 'local' && (
          <select className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            value={filter.type} onChange={e => setFilter({ ...filter, type: e.target.value })}>
            <option value="">All Types</option>
            <option>Full-time</option><option>Remote</option><option>Contract</option>
          </select>
        )}
        {tab !== 'local' && (
          <button onClick={searchExternal} disabled={externalLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-60">
            {externalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {externalLoading ? 'Searching...' : 'Search'}
          </button>
        )}
      </div>

      {/* Results */}
      {(loading && tab === 'local') || externalLoading ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-gray-500 text-sm">{tab !== 'local' ? 'Fetching live jobs...' : 'Loading...'}</p>
        </div>
      ) : tab !== 'local' && !hasSearched ? (
        <div className="text-center py-20">
          <Globe className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Search {tab === 'indeed' ? 'Indeed' : 'Dice'} Jobs</h3>
          <p className="text-gray-500 text-sm mb-6">Enter a job title and click Search to find live listings.</p>
          <button onClick={searchExternal} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 text-sm">Search Now</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeJobs.map(job => <JobCard key={job.job_id} job={job} />)}
          {activeJobs.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400 text-sm">No results found. Try a different search.</div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Admin Dashboard ───────────────────────────────────────────────────────────

const AdminDashboard = ({ token }: { token: string }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', company: '', location: '', salary_range: '', job_type: 'Full-time', description: '', skills: [] as number[] });

  useEffect(() => {
    fetch('/api/jobs').then(r => r.json()).then(setJobs);
    fetch('/api/skills').then(r => r.json()).then(setSkills);
  }, []);

  const handleCreate = async (e: any) => {
    e.preventDefault();
    const res = await fetch('/api/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(newJob) });
    if (res.ok) {
      setJobs(await fetch('/api/jobs').then(r => r.json()));
      setShowModal(false);
      setNewJob({ title: '', company: '', location: '', salary_range: '', job_type: 'Full-time', description: '', skills: [] });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this job?')) return;
    await fetch(`/api/jobs/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setJobs(jobs.filter(j => j.job_id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-gray-500 text-sm mt-1">Manage job listings</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all text-sm">
          <PlusCircle className="w-4 h-4" /> Post New Job
        </button>
      </div>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['Job Title', 'Company', 'Type', 'Skills', 'Actions'].map(h => <th key={h} className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {jobs.map(job => (
              <tr key={job.job_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-bold text-gray-900 text-sm">{job.title}</td>
                <td className="px-6 py-4 text-gray-600 text-sm">{job.company}</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase">{job.job_type}</span></td>
                <td className="px-6 py-4"><div className="flex flex-wrap gap-1">{job.skills.map(s => <span key={s.skill_id} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded">{s.skill_name}</span>)}</div></td>
                <td className="px-6 py-4 text-right"><button onClick={() => handleDelete(job.job_id as number)} className="text-red-500 hover:text-red-700 font-bold text-sm">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6">Create New Job</h3>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Job Title</label>
                <input required type="text" className="w-full p-3 rounded-xl border border-gray-200 text-sm" value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} />
              </div>
              {[['company', 'Company'], ['location', 'Location'], ['salary_range', 'Salary Range']].map(([k, l]) => (
                <div key={k}>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{l}</label>
                  <input required type="text" className="w-full p-3 rounded-xl border border-gray-200 text-sm" value={(newJob as any)[k]} onChange={e => setNewJob({ ...newJob, [k]: e.target.value })} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                <select className="w-full p-3 rounded-xl border border-gray-200 text-sm" value={newJob.job_type} onChange={e => setNewJob({ ...newJob, job_type: e.target.value })}>
                  <option>Full-time</option><option>Remote</option><option>Contract</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Required Skills</label>
                <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-xl max-h-28 overflow-y-auto">
                  {skills.map(s => (
                    <label key={s.skill_id} className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg cursor-pointer hover:bg-indigo-50">
                      <input type="checkbox" checked={newJob.skills.includes(s.skill_id)}
                        onChange={e => setNewJob({ ...newJob, skills: e.target.checked ? [...newJob.skills, s.skill_id] : newJob.skills.filter(id => id !== s.skill_id) })} />
                      <span className="text-sm">{s.skill_name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="col-span-2 flex gap-3 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm">Create Job</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// ── Profile Page ──────────────────────────────────────────────────────────────

const ProfilePage = ({ token }: { token: string }) => {
  const [profile, setProfile] = useState<UserType | null>(null);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/skills').then(r => r.json())
    ]).then(([p, s]) => { setProfile(p); setAllSkills(s); setLoading(false); });
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/profile', {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: profile?.name, phone: profile?.phone, skills: profile?.skills?.map(s => ({ skill_id: s.skill_id, proficiency_level: s.proficiency_level })) })
    });
    navigate('/dashboard');
  };

  const handleSkillsExtracted = (matchedSkills: any[], extractedName: string) => {
    setShowResumeUpload(false);
    // Add all matched skills as Intermediate if not already present
    const currentSkillIds = new Set(profile?.skills?.map(s => s.skill_id) || []);
    const newSkills = matchedSkills.filter(s => !currentSkillIds.has(s.skill_id))
      .map(s => ({ ...s, proficiency_level: 'Intermediate' as const }));
    setProfile(prev => prev ? {
      ...prev,
      name: extractedName || prev.name,
      skills: [...(prev.skills || []), ...newSkills],
    } : prev);
    // Refresh allSkills to include newly added ones
    fetch('/api/skills').then(r => r.json()).then(setAllSkills);
  };

  if (loading) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
          <button
            onClick={() => setShowResumeUpload(!showResumeUpload)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors"
          >
            <Upload className="w-4 h-4" />
            {showResumeUpload ? 'Hide Resume Upload' : 'Upload Resume'}
          </button>
        </div>

        <AnimatePresence>
          {showResumeUpload && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <ResumeUploadCard token={token} onSkillsExtracted={handleSkillsExtracted} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
            <input type="text" className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              value={profile?.name} onChange={e => setProfile({ ...profile!, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-4">Skills & Proficiency</label>
            <div className="grid grid-cols-1 gap-3">
              {allSkills.map(skill => {
                const us = profile?.skills?.find(s => s.skill_id === skill.skill_id);
                return (
                  <div key={skill.skill_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="font-bold text-gray-700 text-sm">{skill.skill_name}</span>
                    <div className="flex gap-2">
                      {['Beginner', 'Intermediate', 'Expert'].map(level => (
                        <button key={level} onClick={() => {
                          const newSkills = [...(profile?.skills || [])];
                          const idx = newSkills.findIndex(s => s.skill_id === skill.skill_id);
                          if (idx > -1) newSkills[idx] = { ...newSkills[idx], proficiency_level: level as any };
                          else newSkills.push({ ...skill, proficiency_level: level as any });
                          setProfile({ ...profile!, skills: newSkills });
                        }} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${us?.proficiency_level === level ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>
                          {level}
                        </button>
                      ))}
                      {us && <button onClick={() => setProfile({ ...profile!, skills: profile?.skills?.filter(s => s.skill_id !== skill.skill_id) })} className="p-1.5 text-red-400 hover:text-red-600 text-xs">✕</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="pt-4 flex gap-4">
            <button onClick={() => navigate('/dashboard')} className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold text-sm">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 text-sm disabled:opacity-70">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [auth, setAuth] = useState<{ token: string, user: UserType } | null>(() => {
    try { return JSON.parse(localStorage.getItem('jobmatch_auth') || 'null'); } catch { return null; }
  });

  const handleLogin = (data: any) => { setAuth(data); localStorage.setItem('jobmatch_auth', JSON.stringify(data)); };
  const handleLogout = () => { setAuth(null); localStorage.removeItem('jobmatch_auth'); };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <Navbar user={auth?.user || null} onLogout={handleLogout} />
        <main>
          <Routes>
            <Route path="/" element={
              <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
                  <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold mb-6 inline-block">Powered by Gemini AI · Indeed · Dice</span>
                  <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-tight mb-8">
                    Find your <span className="text-indigo-600">perfect</span> career match.
                  </h1>
                  <p className="text-xl text-gray-500 mb-12 leading-relaxed">
                    Gemini AI analyzes your skills and surfaces the best jobs from our portal, Indeed, and Dice — all in one dashboard.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">Get Started Free</Link>
                    <Link to="/jobs" className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all">Browse Jobs</Link>
                  </div>
                </motion.div>
                <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { icon: <Sparkles />, title: "Gemini AI", desc: "Smart skill matching and personalized resume tips powered by Gemini." },
                    { icon: <Globe />, title: "Indeed Jobs", desc: "Live job listings fetched directly from Indeed's database." },
                    { icon: <Zap />, title: "Dice Tech Jobs", desc: "Specialized tech roles from Dice's professional network." },
                    { icon: <CheckCircle />, title: "One Dashboard", desc: "All sources unified with match scores in one place." },
                  ].map((f, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                      className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                      <div className="bg-indigo-50 w-10 h-10 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">{f.icon}</div>
                      <h3 className="text-base font-bold mb-2">{f.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            } />
            <Route path="/login" element={!auth ? <LoginPage onLogin={handleLogin} /> : <Navigate to={auth.user.role === 'admin' ? '/admin' : '/dashboard'} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={auth?.user.role === 'candidate' ? <CandidateDashboard token={auth.token} /> : <Navigate to="/login" />} />
            <Route path="/jobs" element={<JobListings token={auth?.token || ''} />} />
            <Route path="/profile" element={auth?.user.role === 'candidate' ? <ProfilePage token={auth.token} /> : <Navigate to="/login" />} />
            <Route path="/admin" element={auth?.user.role === 'admin' ? <AdminDashboard token={auth.token} /> : <Navigate to="/login" />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-gray-100 py-10 mt-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Briefcase className="text-indigo-600 w-5 h-5" />
              <span className="text-lg font-bold text-gray-900">JobMatch AI</span>
            </div>
            <p className="text-gray-400 text-xs">© 2026 JobMatch AI · Powered by Gemini AI, Indeed & Dice</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
