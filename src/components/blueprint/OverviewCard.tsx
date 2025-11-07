import React from 'react'
import type { OverviewSection } from '../../types/blueprint'

interface OverviewCardProps {
  overview: OverviewSection
}

export const OverviewCard: React.FC<OverviewCardProps> = ({ overview }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Overview</h2>
      
      {/* Summary Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Key Insights</h3>
        <p className="text-gray-700 leading-relaxed">{overview.summary}</p>
      </div>

      {/* Common Mistakes Section */}
      {overview.mistakes && overview.mistakes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center">
            <span className="mr-2">⚠️</span>
            Common Mistakes to Avoid
          </h3>
          <ul className="space-y-2">
            {overview.mistakes.map((mistake, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-500 mr-2 mt-1">•</span>
                <span className="text-gray-700">{mistake}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Strategic Guidance Section */}
      {overview.guidance && overview.guidance.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center">
            <span className="mr-2">💡</span>
            Strategic Guidance
          </h3>
          <ul className="space-y-2">
            {overview.guidance.map((tip, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">•</span>
                <span className="text-gray-700">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
