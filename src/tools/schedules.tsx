import '../app.css';
import React, { useState } from 'react';
import AuthGuard from '../components/AuthGuard';
import List from '../components/shedules/List';
import Editor from '../components/shedules/Editor';
import type { SchedulePreset } from '../lib/services/schedulesService';

// UI view modes for the schedules tool.
// 'list'   - show saved schedule presets
// 'create' - show editor to create a new preset
// 'edit'   - show editor to edit an existing preset
type ViewMode = 'list' | 'create' | 'edit';

/**
 * Schedules tool content.
 * Manages view switching between list and editor and keeps track of the
 * currently selected schedule preset.
 */
const SchedulesToolContent: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentPreset, setCurrentPreset] = useState<SchedulePreset | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  // Open editor in create mode for a new preset.
  const handleCreateNew = () => {
    setCurrentPreset(undefined);
    setViewMode('create');
  };

  // Open editor to edit an existing preset.
  const handleEdit = (preset: SchedulePreset) => {
    setCurrentPreset(preset);
    setViewMode('edit');
  };

  // Return to the list and clear the selected preset.
  const handleBack = () => {
    setCurrentPreset(undefined);
    setViewMode('list');
  };

  // After saving, go back to list and clear editing state.
  // Force list refresh by incrementing refreshKey.
  const handleSave = () => {
    setCurrentPreset(undefined);
    setViewMode('list');
    setRefreshKey(prev => prev + 1); // Force list to reload without cache
  };

  return (
    <div className="p-4 sm:p-6 bg-base-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {viewMode === 'list' && (
          <List key={refreshKey} onCreateNew={handleCreateNew} onEdit={handleEdit} />
        )}
        {(viewMode === 'create' || viewMode === 'edit') && (
          <Editor preset={currentPreset} onBack={handleBack} onSave={handleSave} />
        )}
      </div>
    </div>
  );
};

const SchedulesTool: React.FC = () => {
  return (
    <AuthGuard toolName="Schedules" requireAuth={true} showAuthStatus={false}>
      <SchedulesToolContent />
    </AuthGuard>
  );
};

export default SchedulesTool;