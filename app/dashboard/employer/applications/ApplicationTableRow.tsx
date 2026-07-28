'use client'

import { useState } from 'react'
import { Mail, Calendar, FileText, Eye } from 'lucide-react'
import { format } from 'date-fns'
import ReviewApplicationModal from './ReviewApplicationModal'

export default function ApplicationTableRow({ app }: { app: any }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <tr className="hover:bg-slate-50/80 transition-colors">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-secondary-100 text-secondary-700 flex items-center justify-center font-black text-sm shrink-0 border border-secondary-200">
              {app.seeker.name.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-slate-900 text-base">{app.seeker.name}</div>
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                <Mail className="h-3 w-3" /> {app.seeker.email}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="font-bold text-secondary-600">{app.job.title}</div>
          <div className="text-xs text-slate-400 mt-1">{app.job.type}</div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Calendar className="h-4 w-4" />
            {format(new Date(app.createdAt), 'MMM d, yyyy')}
          </div>
        </td>
        <td className="px-6 py-4">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
            app.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
            app.status === 'REVIEWING' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
            app.status === 'ACCEPTED' || app.status === 'HIRED' || app.status === 'SHORTLISTED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {app.status}
          </span>
        </td>
        <td className="px-6 py-4 text-right">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary-50 text-secondary-700 hover:bg-secondary-100 hover:text-secondary-800 rounded-lg text-xs font-bold border border-secondary-200 transition-colors"
          >
            <Eye className="h-3.5 w-3.5" /> Review
          </button>
        </td>
      </tr>

      {showModal && (
        <ReviewApplicationModal application={app} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}
