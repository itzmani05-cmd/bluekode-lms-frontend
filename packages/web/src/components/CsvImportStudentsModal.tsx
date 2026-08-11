import React, { useState } from 'react';
import {
  X, Upload, FileText, AlertTriangle, CheckCircle2, Copy, CheckCheck, RefreshCw,
} from 'lucide-react';
import {
  bulkImportEnrollmentsApi,
  type BulkEnrollRow,
  type BulkEnrollRowResult,
  type BulkEnrollSummary,
} from '../lib/api/enrollments';

interface CsvImportStudentsModalProps {
  courseId: number;
  courseName: string;
  onClose: () => void;
}

const HEADER_ALIASES: Record<keyof BulkEnrollRow, string[]> = {
  email:         ['email'],
  fullName:      ['fullname', 'full_name', 'full name', 'name'],
  lastName:      ['lastname', 'last_name', 'last name'],
  institutionId: ['institutionid', 'institution_id', 'institution id', 'institution'],
  department:    ['department'],
  academicYear:  ['academicyear', 'academic_year', 'academic year', 'year'],
};

const parseCsvText = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      if (row.some((f) => f.trim() !== '')) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    if (row.some((f) => f.trim() !== '')) rows.push(row);
  }
  return rows;
};

interface ParsedRow extends BulkEnrollRow {
  rowNumber: number;
}

const parseRows = (text: string): { rows: ParsedRow[]; errors: string[] } => {
  const table = parseCsvText(text);
  const errors: string[] = [];
  if (table.length === 0) return { rows: [], errors: ['File is empty.'] };

  const header = table[0].map((h) => h.trim().toLowerCase());
  const columnIndex = (field: keyof BulkEnrollRow): number =>
    header.findIndex((h) => HEADER_ALIASES[field].includes(h));

  const idx = {
    email:         columnIndex('email'),
    fullName:      columnIndex('fullName'),
    lastName:      columnIndex('lastName'),
    institutionId: columnIndex('institutionId'),
    department:    columnIndex('department'),
    academicYear:  columnIndex('academicYear'),
  };

  if (idx.email === -1)         errors.push('Missing required "email" column.');
  if (idx.fullName === -1)      errors.push('Missing required "fullName" column.');
  if (idx.institutionId === -1) errors.push('Missing required "institutionId" column.');
  if (errors.length > 0) return { rows: [], errors };

  const rows: ParsedRow[] = [];
  for (let i = 1; i < table.length; i++) {
    const line = table[i];
    const email = (line[idx.email] ?? '').trim();
    const fullName = (line[idx.fullName] ?? '').trim();
    const institutionIdRaw = (line[idx.institutionId] ?? '').trim();
    const institutionId = Number(institutionIdRaw);

    if (!email || !fullName || !institutionIdRaw || Number.isNaN(institutionId)) {
      errors.push(`Row ${i + 1}: missing or invalid required field(s), skipped.`);
      continue;
    }

    const academicYearRaw = idx.academicYear >= 0 ? (line[idx.academicYear] ?? '').trim() : '';
    rows.push({
      rowNumber:     i + 1,
      email,
      fullName,
      lastName:      idx.lastName >= 0 ? (line[idx.lastName] ?? '').trim() || undefined : undefined,
      institutionId,
      department:    idx.department >= 0 ? (line[idx.department] ?? '').trim() || undefined : undefined,
      academicYear:  academicYearRaw ? Number(academicYearRaw) : undefined,
    });
  }

  return { rows, errors };
};

const resultCfg: Record<BulkEnrollRowResult['status'], { label: string; cls: string }> = {
  created_and_enrolled: { label: 'Account created & enrolled', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  enrolled:              { label: 'Enrolled',                  cls: 'bg-blue-50 text-blue-700 border-blue-100'         },
  already_enrolled:      { label: 'Already enrolled',          cls: 'bg-slate-100 text-slate-500 border-slate-200'    },
  error:                 { label: 'Error',                     cls: 'bg-red-50 text-red-600 border-red-100'          },
};

const CsvImportStudentsModal: React.FC<CsvImportStudentsModalProps> = ({ courseId, courseName, onClose }) => {
  const [fileName, setFileName]     = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importing, setImporting]   = useState(false);
  const [results, setResults]       = useState<BulkEnrollRowResult[] | null>(null);
  const [summary, setSummary]       = useState<BulkEnrollSummary | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copied, setCopied]         = useState(false);

  const handleFile = (file: File) => {
    setFileName(file.name);
    setResults(null);
    setSummary(null);
    setSubmitError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const { rows, errors } = parseRows(String(reader.result ?? ''));
      setParsedRows(rows);
      setParseErrors(errors);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (parsedRows.length === 0 || importing) return;
    setImporting(true);
    setSubmitError(null);
    try {
      const res = await bulkImportEnrollmentsApi(
        courseId,
        parsedRows.map(({ rowNumber: _rowNumber, ...row }) => row),
      );
      setResults(res.data);
      setSummary(res.summary);
    } catch {
      setSubmitError('Import failed. Please check the file and try again.');
    } finally {
      setImporting(false);
    }
  };

  const credentialsText = (results ?? [])
    .filter((r) => r.generatedPassword)
    .map((r) => `${r.email}: ${r.generatedPassword}`)
    .join('\n');

  const handleCopyCredentials = () => {
    if (!credentialsText) return;
    navigator.clipboard.writeText(credentialsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="font-extrabold text-[#001D6E] text-base">Import Students (CSV)</h2>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Bulk-enroll students into "{courseName}".</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {!results && (
            <>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-700 font-semibold leading-relaxed">
                CSV columns: <span className="font-mono">email, fullName, lastName, institutionId, department, academicYear</span>
                . Only <span className="font-bold">email</span>, <span className="font-bold">fullName</span> and{' '}
                <span className="font-bold">institutionId</span> are required. If the email matches an existing account,
                that student is enrolled directly; otherwise a new student account is created and enrolled.
              </div>

              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-2xl py-8 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors">
                <Upload className="h-6 w-6 text-slate-400" />
                <span className="text-xs font-bold text-slate-600">{fileName ?? 'Click to choose a CSV file'}</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
              </label>

              {parseErrors.length > 0 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    {parseErrors.map((e) => <p key={e} className="font-semibold">{e}</p>)}
                  </div>
                </div>
              )}

              {submitError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p className="font-semibold">{submitError}</p>
                </div>
              )}

              {parsedRows.length > 0 && (
                <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                    <p className="text-xs font-bold text-slate-700">{parsedRows.length} row{parsedRows.length !== 1 ? 's' : ''} ready to import</p>
                  </div>
                  <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
                    {parsedRows.slice(0, 50).map((r) => (
                      <div key={r.rowNumber} className="px-4 py-2 flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{r.fullName}</p>
                          <p className="text-[10px] text-slate-400 font-semibold truncate">{r.email}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold shrink-0">Inst. #{r.institutionId}</span>
                      </div>
                    ))}
                    {parsedRows.length > 50 && (
                      <p className="px-4 py-2 text-[10px] text-slate-400 font-semibold">+ {parsedRows.length - 50} more row(s) not shown</p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {results && summary && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                  <p className="text-lg font-extrabold text-emerald-700">{summary.createdAccounts}</p>
                  <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">New accounts</p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
                  <p className="text-lg font-extrabold text-blue-700">{summary.enrolled}</p>
                  <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Enrolled</p>
                </div>
                <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-center">
                  <p className="text-lg font-extrabold text-slate-600">{summary.alreadyEnrolled}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Already in</p>
                </div>
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-center">
                  <p className="text-lg font-extrabold text-red-600">{summary.errors}</p>
                  <p className="text-[9px] font-bold text-red-500 uppercase tracking-wider">Errors</p>
                </div>
              </div>

              {credentialsText && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-[11px] font-bold text-amber-800">
                      New accounts were created with generated passwords — copy and share these securely.
                    </p>
                    <button
                      onClick={handleCopyCredentials}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border shrink-0 flex items-center gap-1 transition-colors ${
                        copied ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      {copied ? <><CheckCheck className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy All</>}
                    </button>
                  </div>
                  <pre className="text-[10px] font-mono text-amber-900 whitespace-pre-wrap break-all max-h-32 overflow-y-auto">{credentialsText}</pre>
                </div>
              )}

              <div className="border border-slate-200/80 rounded-xl divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {results.map((r) => {
                  const cfg = resultCfg[r.status];
                  return (
                    <div key={r.email} className="px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{r.email}</p>
                        {r.message && <p className="text-[10px] text-red-500 font-semibold truncate">{r.message}</p>}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border shrink-0 ${cfg.cls}`}>{cfg.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 p-6 border-t border-slate-100 shrink-0">
          {!results ? (
            <>
              <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={parsedRows.length === 0 || importing}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-1.5"
              >
                {importing ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Importing...</> : <><CheckCircle2 className="h-3.5 w-3.5" /> Import {parsedRows.length || ''} Row{parsedRows.length !== 1 ? 's' : ''}</>}
              </button>
            </>
          ) : (
            <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CsvImportStudentsModal;
