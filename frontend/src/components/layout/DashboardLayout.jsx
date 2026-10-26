import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardTopbar } from './DashboardTopbar';
import { CreateRunModal } from '../features/CreateRunModal';

export function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNewRunModalOpen, setIsNewRunModalOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <DashboardSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onOpenNewRun={() => setIsNewRunModalOpen(true)}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        <DashboardTopbar
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
          onOpenNewRun={() => setIsNewRunModalOpen(true)}
        />

        <main style={{ flex: 1, padding: '28px 24px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          <Outlet context={{ openNewRunModal: () => setIsNewRunModalOpen(true) }} />
        </main>
      </div>

      {/* Global New Run Modal */}
      <CreateRunModal
        isOpen={isNewRunModalOpen}
        onClose={() => setIsNewRunModalOpen(false)}
      />
    </div>
  );
}
