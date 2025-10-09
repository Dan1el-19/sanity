import '../app.css';
import React, { useState } from 'react';
import AuthGuard from '../components/AuthGuard';
import List from '../components/blockedSlots/List';
import Editor from '../components/blockedSlots/Editor';
import type { BlockedSlot } from '../lib/services/blockedSlotsService';

// UI view modes for the blocked slots tool.
// 'list'   - show the main list of blocked slots
// 'create' - show the editor to create a new slot
// 'edit'   - show the editor to edit an existing slot
type ViewMode = 'list' | 'create' | 'edit';

/**
 * Blocked Slots tool content.
 * Responsible for switching between list and editor views and holding
 * the currently editing slot in local state.
 */
const BlockedSlotsToolContent: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentSlot, setCurrentSlot] = useState<BlockedSlot | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  // Open editor in "create" mode for a new blocked slot.
  const handleCreateNew = () => {
    setCurrentSlot(undefined);
    setViewMode('create');
  };

  // Open editor in "edit" mode for an existing blocked slot.
  const handleEdit = (slot: BlockedSlot) => {
    setCurrentSlot(slot);
    setViewMode('edit');
  };

  // Navigate back to the list view and clear editing state.
  const handleBack = () => {
    setCurrentSlot(undefined);
    setViewMode('list');
  };

  // After saving, return to the list view and clear editing state.
  // Force list refresh by incrementing refreshKey.
  const handleSave = () => {
    setCurrentSlot(undefined);
    setViewMode('list');
    setRefreshKey(prev => prev + 1); // Force list to reload without cache
  };

  // Render either the list or the editor depending on the view mode.
  return (
    <div className="p-4 sm:p-6 bg-base-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {viewMode === 'list' && (
          <List key={refreshKey} onCreateNew={handleCreateNew} onEdit={handleEdit} />
        )}
        {(viewMode === 'create' || viewMode === 'edit') && (
          <Editor slot={currentSlot} onBack={handleBack} onSave={handleSave} />
        )}
      </div>
    </div>
  );
};

const BlockedSlotsTool: React.FC = () => {
  return (
    <AuthGuard toolName="Blocked Slots" requireAuth={true} showAuthStatus={false}>
      <BlockedSlotsToolContent />
    </AuthGuard>
  );
};

export default BlockedSlotsTool;
