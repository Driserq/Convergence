import React from 'react'
import type { Resource } from '../../types/blueprint'

interface ResourceListProps {
  resources: Resource[]
}

export const ResourceList: React.FC<ResourceListProps> = ({ resources }) => {
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'tool':
        return '🛠️'
      case 'book':
        return '📚'
      case 'article':
        return '📄'
      case 'course':
        return '🎓'
      default:
        return '📌'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'tool':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'book':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'article':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'course':
        return 'bg-purple-100 text-purple-700 border-purple-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">📦</span>
        Recommended Resources
      </h2>
      <p className="text-gray-600 mb-6">
        Tools, books, and materials mentioned in the content
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {resources.map((resource, index) => (
          <div 
            key={index} 
            className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            {/* Resource Header */}
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span>{getTypeIcon(resource.type)}</span>
                {resource.name}
              </h3>
            </div>

            {/* Resource Description */}
            <p className="text-gray-700 text-sm leading-relaxed mb-3">{resource.description}</p>

            {/* Resource Type Badge */}
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getTypeColor(resource.type)}`}>
                {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-teal-50 border border-teal-200 rounded-lg p-4">
        <p className="text-sm text-teal-800">
          <span className="font-semibold">💡 Note:</span> These resources were mentioned in the content. Research them further to determine if they fit your specific needs and goals.
        </p>
      </div>
    </div>
  )
}
