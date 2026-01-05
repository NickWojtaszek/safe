import React, { useMemo, useRef } from 'react';
import { CollectionRecord, FieldDefinition } from '../types';
import { DATA_SCHEMA } from '../constants';
import { CheckSquare, Square, Filter, Download, Upload, FileJson, FileSpreadsheet, Trash2 } from 'lucide-react';

interface DataDisplayProps {
  records: CollectionRecord[];
  selectedParameters: string[];
  onToggleParameter: (paramId: string) => void;
  onImport: (records: CollectionRecord[]) => void;
  onSelectRecord?: (record: CollectionRecord) => void;
  onDeleteRecord?: (recordId: string) => void;
}

const DataDisplay: React.FC<DataDisplayProps> = ({
  records,
  selectedParameters,
  onToggleParameter,
  onImport,
  onSelectRecord,
  onDeleteRecord
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Flatten all fields from all segments for the table columns
  const allFields = useMemo(() => {
    return DATA_SCHEMA.flatMap(segment => segment.fields);
  }, []);

  const handleRowClick = (record: CollectionRecord) => {
    const patientName = `${record.data.patient_first_name || 'Nieznany'} ${record.data.patient_last_name || ''}`.trim();
    const confirmed = window.confirm(
      `Czy chcesz edytować rekord pacjenta: ${patientName}?\n\nData utworzenia: ${new Date(record.timestamp).toLocaleString('pl-PL')}`
    );

    if (confirmed && onSelectRecord) {
      onSelectRecord(record);
    }
  };

  const handleDeleteRecord = (e: React.MouseEvent, record: CollectionRecord) => {
    e.stopPropagation();  // Prevent row click

    const patientName = `${record.data.patient_first_name || 'Nieznany'} ${record.data.patient_last_name || ''}`.trim();
    const confirmed = window.confirm(
      `⚠️ UWAGA: Ta operacja jest nieodwracalna!\n\nCzy na pewno chcesz usunąć rekord pacjenta:\n${patientName}\n\nData utworzenia: ${new Date(record.timestamp).toLocaleString('pl-PL')}`
    );

    if (confirmed) {
      const doubleConfirm = window.confirm(
        `Proszę potwierdzić ponownie usunięcie rekordu pacjenta: ${patientName}`
      );

      if (doubleConfirm && onDeleteRecord) {
        onDeleteRecord(record.id);
      }
    }
  };

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleExportJSON = () => {
    const jsonContent = JSON.stringify(records, null, 2);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(jsonContent, `safe-arch-export-${dateStr}.json`, 'application/json');
  };

  const handleExportCSV = () => {
    // 1. Headers: ID, Timestamp, followed by all field IDs
    const headers = ['Record_ID', 'Timestamp', ...allFields.map(f => f.id)];
    
    // 2. Rows
    const csvRows = records.map(record => {
      const row = [
        record.id,
        record.timestamp,
        ...allFields.map(field => {
          // Handle values that might contain commas or quotes
          const val = record.data[field.id];
          // Handle arrays (from checkbox fields) by joining with semicolon
          const stringVal = val === undefined || val === null
            ? ''
            : Array.isArray(val)
              ? val.join('; ')
              : String(val);
          // Escape double quotes and wrap in quotes
          return `"${stringVal.replace(/"/g, '""')}"`;
        })
      ];
      return row.join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(csvContent, `safe-arch-export-${dateStr}.csv`, 'text/csv');
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            onImport(parsed as CollectionRecord[]);
          } else {
            alert("Invalid JSON format. Expected an array of records.");
          }
        } else if (file.name.endsWith('.csv')) {
          const rows = content.split('\n').map(r => r.trim()).filter(r => r);
          if (rows.length < 2) return; // Need header + 1 row

          // Parse Headers
          const headers = rows[0].split(',').map(h => h.trim());
          
          const newRecords: CollectionRecord[] = [];

          // Parse Rows (Basic CSV parsing, might not handle newlines inside quotes perfectly without a lib)
          for (let i = 1; i < rows.length; i++) {
            // Split by comma, but respect quotes. 
            // Regex explanation: Match quoted string OR non-comma sequence
            const regex = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
            // Simple split for MVP - assuming standard export format without crazy characters
            // For robustness in production, use a library like PapaParse. 
            // Here we use a slightly smarter split or just standard split for speed if data is simple.
            
            // Fallback to simple split for simplicity in this artifact, but handle the quotes removal
            // Ideally, we'd use a regex match loop here.
            
            // Let's do a naive split and simple cleanup for this demo scope
            const rawCells = rows[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || rows[i].split(','); 
            
            // If the row doesn't match column count roughly, skip or handle error
            // Note: This naive parser is fragile with complex text fields containing commas.
            // We rely on the Export CSV structure we created.
            
            // Clean quotes
            const cells = rawCells.map(c => c.replace(/^"|"$/g, '').replace(/""/g, '"'));

            if (cells.length < 2) continue;

            const id = cells[0];
            const timestamp = cells[1];
            const data: Record<string, any> = {};

            // Map remaining cells to fields
            // headers[0] is Record_ID, headers[1] is Timestamp
            for (let j = 2; j < headers.length; j++) {
              const fieldId = headers[j];
              if (fieldId && j < cells.length) {
                // Try to restore numbers if possible
                const val = cells[j];
                const numVal = Number(val);
                // Heuristic: convert to number if it looks like one and isn't a date string or text ID
                if (!isNaN(numVal) && val.trim() !== '' && !val.includes('-') && !val.startsWith('0')) {
                    data[fieldId] = numVal;
                } else {
                    data[fieldId] = val;
                }
              }
            }

            newRecords.push({ id, timestamp, data });
          }
          onImport(newRecords);
        } else {
          alert("Unsupported file type. Please upload .json or .csv");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to parse file. Please check the format.");
      }
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="bg-slate-900 rounded-t-lg border border-slate-800 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center">
            <span className="w-2 h-6 bg-cyan-500 mr-3 rounded-sm"></span>
            Registry Database
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-wide">Select columns for analysis or manage data.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
           <input 
             type="file" 
             ref={fileInputRef} 
             onChange={handleFileChange} 
             accept=".json,.csv" 
             className="hidden" 
           />
           
           <button 
             onClick={handleImportClick}
             className="flex items-center px-3 py-2 text-xs font-bold text-slate-300 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 hover:text-white transition-colors"
           >
             <Upload className="w-3 h-3 mr-2 text-amber-500" /> Import
           </button>

           <div className="h-6 w-px bg-slate-700 mx-1 hidden md:block"></div>

           <button 
             onClick={handleExportJSON}
             disabled={records.length === 0}
             className="flex items-center px-3 py-2 text-xs font-bold text-slate-300 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <FileJson className="w-3 h-3 mr-2 text-cyan-500" /> Export JSON
           </button>

           <button 
             onClick={handleExportCSV}
             disabled={records.length === 0}
             className="flex items-center px-3 py-2 text-xs font-bold text-slate-300 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <FileSpreadsheet className="w-3 h-3 mr-2 text-green-500" /> Export CSV
           </button>

           <div className="bg-slate-950 px-3 py-2 rounded border border-slate-800 text-xs font-mono text-cyan-500 min-w-[100px] text-center ml-2">
             {records.length} RECORDS
           </div>
        </div>
      </div>
      
      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 bg-slate-900 rounded-b-lg border border-t-0 border-slate-800 border-dashed">
          <div className="p-4 bg-slate-800 rounded-full mb-4">
            <Filter className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-slate-400 text-lg font-light">No records found in registry.</p>
          <p className="text-slate-600 text-sm mt-2 font-mono">Initialize collection in the Wizard tab or Import Data.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden rounded-b-lg border border-slate-800 bg-slate-900 shadow-xl">
          <div className="overflow-auto h-full custom-scrollbar">
            <table className="min-w-full divide-y divide-slate-800 text-left">
              <thead className="bg-slate-950 sticky top-0 z-10 shadow-md">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest w-16 bg-slate-950 border-b border-slate-800">
                    #
                  </th>
                  {allFields.map(field => {
                    const isSelected = selectedParameters.includes(field.id);
                    return (
                      <th
                        key={field.id}
                        className={`px-6 py-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap border-b border-slate-800 transition-colors cursor-pointer group hover:bg-slate-900 ${
                          isSelected ? 'text-cyan-400 bg-slate-900/50' : 'text-slate-500'
                        }`}
                        onClick={() => onToggleParameter(field.id)}
                      >
                        <div className="flex items-center space-x-3">
                           <div className={`transition-colors ${isSelected ? 'text-cyan-500' : 'text-slate-700 group-hover:text-slate-500'}`}>
                             {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                           </div>
                           <span>{field.label}</span>
                        </div>
                      </th>
                    );
                  })}
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest w-24 bg-slate-950 border-b border-slate-800">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 bg-slate-900">
                {records.map((record, idx) => (
                  <tr
                    key={record.id}
                    onClick={() => handleRowClick(record)}
                    className="hover:bg-cyan-900/20 transition-colors group cursor-pointer"
                  >
                     <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-600 group-hover:text-cyan-500/50">
                        {idx + 1}
                     </td>
                    {allFields.map(field => {
                      const value = record.data[field.id];
                      const isSelected = selectedParameters.includes(field.id);
                      return (
                        <td
                          key={field.id}
                          className={`px-6 py-4 whitespace-nowrap text-sm font-mono border-l border-slate-800/50 ${
                            isSelected ? 'text-cyan-100 bg-cyan-900/5' : 'text-slate-400'
                          }`}
                        >
                          {value !== undefined && value !== '' ? String(value) : <span className="text-slate-700">--</span>}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 whitespace-nowrap border-l border-slate-800/50">
                      <button
                        onClick={(e) => handleDeleteRecord(e, record)}
                        className="text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-900/20 transition-colors"
                        title="Usuń rekord"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataDisplay;