import React, { useState } from "react";
import { AuditLog } from "../types";
import { Shield, Eye, Calendar, Search } from "lucide-react";

interface AuditTrailLogsViewProps {
  logs: AuditLog[];
  loading?: boolean;
}

export default function AuditTrailLogsView({ logs, loading = false }: AuditTrailLogsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = logs.filter(log => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return (
      log.user_name.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term) ||
      log.entity_type.toLowerCase().includes(term) ||
      log.metadata.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-zinc-800">Operational Log Trail</h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1">Real-time logging of authentication and CRUD events</p>
        </div>

        {/* Search filter for logs */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-zinc-50 border border-zinc-200 focus:border-zinc-900 rounded-xl focus:ring-1 focus:ring-zinc-900 focus:outline-none transition duration-150"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-zinc-50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-zinc-50 border border-dashed border-zinc-200 text-zinc-400 text-xs">
          No audit logs match criteria.
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[450px] overflow-y-auto pr-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                <th className="py-3 px-2">Timestamp</th>
                <th className="py-3 px-2">Initiator</th>
                <th className="py-3 px-2">Action Event</th>
                <th className="py-3 px-2">Target Entity</th>
                <th className="py-3 px-2">Details / Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 text-xs">
              {filteredLogs.map((log) => {
                // Color badges depending on action type
                let actionBadgeColor = "text-zinc-600 bg-zinc-50";
                if (log.action.includes("CREATE")) {
                  actionBadgeColor = "text-emerald-700 bg-emerald-50";
                } else if (log.action.includes("UPDATE")) {
                  actionBadgeColor = "text-amber-700 bg-amber-50";
                } else if (log.action.includes("DELETE")) {
                  actionBadgeColor = "text-rose-700 bg-rose-50";
                } else if (log.action.includes("LOGIN")) {
                  actionBadgeColor = "text-sky-700 bg-sky-50";
                }

                return (
                  <tr key={log.id} className="hover:bg-zinc-50/50 transition duration-100">
                    <td className="py-3.5 px-2 text-zinc-400 font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{" "}
                      {new Date(log.created_at).toLocaleDateString([], { month: '2-digit', day: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-2 font-semibold text-zinc-700">
                      {log.user_name}
                      <span className="block text-[10px] font-mono text-zinc-400 font-normal">{log.user_id}</span>
                    </td>
                    <td className="py-3.5 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono ${actionBadgeColor}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 font-medium text-zinc-600">
                      {log.entity_type}
                      <span className="block text-[9px] font-mono text-zinc-400">{log.entity_id}</span>
                    </td>
                    <td className="py-3.5 px-2 text-zinc-500 max-w-sm truncate" title={log.metadata}>
                      {log.metadata}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
