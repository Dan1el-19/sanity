import '../app.css';
import React, { useState } from 'react';
import AuthGuard from '../components/AuthGuard';
import List from '../components/shedules/List';
import Editor from '../components/shedules/Editor';
import type { SchedulePreset } from '../lib/services/schedulesService';

type ViewMode = 'list' | 'create' | 'edit';

const SchedulesToolContent: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentPreset, setCurrentPreset] = useState<SchedulePreset | undefined>(undefined);

  const handleCreateNew = () => {
    setCurrentPreset(undefined);
    setViewMode('create');
  };

  const handleEdit = (preset: SchedulePreset) => {
    setCurrentPreset(preset);
    setViewMode('edit');
  };

  const handleBack = () => {
    setCurrentPreset(undefined);
    setViewMode('list');
  };

  const handleSave = () => {
    setCurrentPreset(undefined);
    setViewMode('list');
  };

  return (
    <div className="p-4 sm:p-6 bg-base-200 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {viewMode === 'list' && (
          <List onCreateNew={handleCreateNew} onEdit={handleEdit} />
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