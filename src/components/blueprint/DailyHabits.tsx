import React from 'react'
import type { DailyHabit } from '../../types/blueprint'

interface DailyHabitsProps {
  habits: DailyHabit[]
}

export const DailyHabits: React.FC<DailyHabitsProps> = ({ habits }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">🔄</span>
        Daily Habits to Build
      </h2>
      <p className="text-gray-600 mb-6">
        Recurring actions to practice consistently over time
      </p>

      <div className="grid gap-4">
        {habits.map((habit) => (
          <div 
            key={habit.id} 
            className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex-1">{habit.title}</h3>
              <span className="ml-4 text-sm font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full whitespace-nowrap">
                📅 {habit.timeframe}
              </span>
            </div>
            
            <p className="text-gray-700 leading-relaxed">{habit.description}</p>
            
            {/* Progress Indicator Placeholder */}
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                <div className="bg-purple-500 h-2 rounded-full w-0"></div>
              </div>
              <span className="text-xs">Track progress</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">💪 Pro Tip:</span> Start with one habit at a time and build consistency before adding more. Track your daily progress to stay motivated.
        </p>
      </div>
    </div>
  )
}
