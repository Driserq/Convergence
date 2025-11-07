import React from 'react'
import type { SequentialStep } from '../../types/blueprint'

interface SequentialStepsProps {
  steps: SequentialStep[]
}

export const SequentialSteps: React.FC<SequentialStepsProps> = ({ steps }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">🎯</span>
        Step-by-Step Implementation
      </h2>
      <p className="text-gray-600 mb-6">
        Follow these sequential steps to implement the content effectively
      </p>

      <div className="space-y-6">
        {steps.map((step) => (
          <div 
            key={step.step_number} 
            className="relative pl-8 pb-6 border-l-4 border-blue-500 last:pb-0"
          >
            {/* Step Number Badge */}
            <div className="absolute -left-5 top-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
              {step.step_number}
            </div>

            {/* Step Content */}
            <div className="ml-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                {step.estimated_time && (
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    ⏱️ {step.estimated_time}
                  </span>
                )}
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-3">{step.description}</p>
              
              <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                <p className="text-sm font-medium text-green-800 mb-1">✅ Deliverable:</p>
                <p className="text-sm text-green-700">{step.deliverable}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
