import React from 'react'
import type { DecisionQuestion } from '../../types/blueprint'

interface DecisionChecklistProps {
  questions: DecisionQuestion[]
}

export const DecisionChecklist: React.FC<DecisionChecklistProps> = ({ questions }) => {
  const getWeightColor = (weight?: string) => {
    switch (weight?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-300'
      case 'important':
        return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'consider':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getWeightEmoji = (weight?: string) => {
    switch (weight?.toLowerCase()) {
      case 'critical':
        return '🔴'
      case 'important':
        return '🟠'
      case 'consider':
        return '🔵'
      default:
        return '⚪'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">🤔</span>
        Decision Checklist
      </h2>
      <p className="text-gray-600 mb-6">
        Reflect on these questions before making your decision
      </p>

      <div className="space-y-4">
        {questions.map((item, index) => (
          <div 
            key={index} 
            className="bg-gray-50 border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start gap-4">
              {/* Question Number */}
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>

              {/* Question Content */}
              <div className="flex-1">
                <p className="text-gray-900 font-medium text-lg mb-2">{item.question}</p>
                
                {/* Weight Badge */}
                {item.weight && (
                  <span className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full border ${getWeightColor(item.weight)}`}>
                    <span className="mr-1">{getWeightEmoji(item.weight)}</span>
                    {item.weight}
                  </span>
                )}
              </div>

              {/* Checkbox Placeholder */}
              <div className="flex-shrink-0">
                <div className="w-6 h-6 border-2 border-gray-300 rounded hover:border-indigo-500 transition-colors cursor-pointer"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <p className="text-sm text-indigo-800">
          <span className="font-semibold">📝 Tip:</span> Take time to honestly answer each question. Write down your responses to clarify your thinking and identify potential blind spots.
        </p>
      </div>
    </div>
  )
}
