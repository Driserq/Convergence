import React from 'react'
import type { AIBlueprint } from '../../types/blueprint'
import { BlueprintDisplay } from './display/BlueprintDisplay'

interface BlueprintDetailProps {
  blueprint: AIBlueprint
}

export const BlueprintDetail: React.FC<BlueprintDetailProps> = ({ blueprint }) => {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <BlueprintDisplay blueprint={blueprint} variant="detail" />
    </div>
  )
}
