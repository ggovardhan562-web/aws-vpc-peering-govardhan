import React, { useState } from 'react';
import { LabProvider, useLab } from './context/LabContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

// Pages
import { DashboardPage } from './components/pages/DashboardPage';
import { OverviewPage } from './components/pages/OverviewPage';
import { ArchitecturePage } from './components/pages/ArchitecturePage';
import { ResourceInventoryPage } from './components/pages/ResourceInventoryPage';
import { NetworkSetupPage } from './components/pages/NetworkSetupPage';
import { SecurityGroupsPage } from './components/pages/SecurityGroupsPage';
import { EC2InstancesPage } from './components/pages/EC2InstancesPage';
import { SSHConfigPage } from './components/pages/SSHConfigPage';
import { VpcPeeringPage } from './components/pages/VpcPeeringPage';
import { RouteTablesPage } from './components/pages/RouteTablesPage';
import { ConnectivityTestsPage } from './components/pages/ConnectivityTestsPage';
import { ControlledFailurePage } from './components/pages/ControlledFailurePage';
import { TroubleshootingPage } from './components/pages/TroubleshootingPage';
import { EvidencePage } from './components/pages/EvidencePage';
import { EvaluationPage } from './components/pages/EvaluationPage';
import { FinalReportPage } from './components/pages/FinalReportPage';
import { CleanupPage } from './components/pages/CleanupPage';
import { SettingsPage } from './components/pages/SettingsPage';

const AppContent: React.FC = () => {
  const { activePage } = useLab();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'overview':
        return <OverviewPage />;
      case 'architecture':
        return <ArchitecturePage />;
      case 'inventory':
        return <ResourceInventoryPage />;
      case 'network':
        return <NetworkSetupPage />;
      case 'security':
        return <SecurityGroupsPage />;
      case 'ec2':
        return <EC2InstancesPage />;
      case 'ssh':
        return <SSHConfigPage />;
      case 'peering':
        return <VpcPeeringPage />;
      case 'routes':
        return <RouteTablesPage />;
      case 'testing':
        return <ConnectivityTestsPage />;
      case 'failure-recovery':
        return <ControlledFailurePage />;
      case 'troubleshooting':
        return <TroubleshootingPage />;
      case 'evidence':
        return <EvidencePage />;
      case 'evaluation':
        return <EvaluationPage />;
      case 'report':
        return <FinalReportPage />;
      case 'cleanup':
        return <CleanupPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Sidebar (responsive with mobile drawer) */}
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto lg:pl-72 p-4 sm:p-6 lg:p-8 transition-all">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <LabProvider>
      <AppContent />
    </LabProvider>
  );
}

export default App;
