import React from 'react'
import type { TriggerAction } from '../../types/blueprint'

interface TriggerActionsProps {
  actions: TriggerAction[]
}

export const TriggerActions: React.FC<TriggerActionsProps> = ({ actions }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">🚨</span>
        Emergency Action Plan
      </h2>
      <p className="text-gray-600 mb-6">
        Quick actions to take when you encounter triggers or urges
      </p>

      <div className="space-y-4">
        {actions.map((action, index) => (
          <div 
            key={index} 
            className="bg-red-50 border-2 border-red-300 rounded-lg p-5 hover:border-red-400 transition-colors"
          >
            {/* Situation/Trigger */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-2">
                ⚡ When This Happens:
              </h3>
              <p className="text-gray-900 font-medium text-lg">{action.situation}</p>
            </div>

            {/* Immediate Action */}
            <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
              <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-2">
                ✓ Do This Immediately:
              </h3>
              <p className="text-gray-800 font-medium">{action.immediate_action}</p>
            </div>

            {/* Timeframe Badge */}
            <div className="mt-3 flex items-center justify-end">
              <span className="text-xs font-medium text-red-600 bg-red-100 px-3 py-1 rounded-full">
                ⏰ {action.timeframe}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-300 rounded-lg p-4">
        <p className="text-sm text-yellow-900">
          <span className="font-semibold">⚠️ Important:</span> These are emergency responses. Practice them in low-stress situations so they become automatic when you need them most.
        </p>
      </div>
    </div>
  )
}
