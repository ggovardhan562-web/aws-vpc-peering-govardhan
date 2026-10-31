import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import {
  StudentProfile,
  ResourceItem,
  RouteTableConfig,
  RouteEntry,
  SecurityGroupConfig,
  SecurityGroupRule,
  EC2InstanceConfig,
  PeeringConnectionConfig,
  ConnectivityTestItem,
  ControlledFailureState,
  EvidenceItem,
  TroubleshootingCheckItem,
  CleanupStep,
  EvaluationCategory,
} from '../types/lab';
import {
  initialStudentProfile,
  defaultResources,
  defaultRouteTables,
  defaultSecurityGroups,
  defaultEC2Instances,
  defaultPeeringConnection,
  defaultConnectivityTests,
  defaultControlledFailure,
  defaultTroubleshootingItems,
  defaultCleanupSteps,
  defaultEvaluationRubric,
} from '../data/defaultData';
import {
  sampleStudentProfile,
  sampleResources,
  sampleRouteTables,
  sampleSecurityGroups,
  sampleEC2Instances,
  samplePeeringConnection,
  sampleConnectivityTests,
  sampleControlledFailure,
  sampleEvidence,
  sampleCleanupSteps,
} from '../data/sampleDemoData';

const STORAGE_KEY = 'ewb_aws_vpc_peering_lab_v1';

interface LabContextType {
  profile: StudentProfile;
  resources: ResourceItem[];
  routeTables: RouteTableConfig[];
  securityGroups: SecurityGroupConfig[];
  ec2Instances: EC2InstanceConfig[];
  peering: PeeringConnectionConfig;
  tests: ConnectivityTestItem[];
  controlledFailure: ControlledFailureState;
  evidence: EvidenceItem[];
  troubleshooting: TroubleshootingCheckItem[];
  cleanupSteps: CleanupStep[];
  evaluation: EvaluationCategory[];
  activePage: string;
  selectedResourceId: string | null;

  // Actions
  setActivePage: (page: string) => void;
  setSelectedResourceId: (id: string | null) => void;
  updateProfile: (profile: Partial<StudentProfile>) => void;
  updateResource: (id: string, updates: Partial<ResourceItem>) => void;
  updateRouteTable: (id: string, updates: Partial<RouteTableConfig>) => void;
  addRouteToTable: (tableId: string, route: RouteEntry) => void;
  removeRouteFromTable: (tableId: string, routeId: string) => void;
  updateSecurityGroup: (id: string, updates: Partial<SecurityGroupConfig>) => void;
  addSecurityGroupRule: (sgId: string, rule: SecurityGroupRule) => void;
  removeSecurityGroupRule: (sgId: string, ruleId: string) => void;
  updateEC2Instance: (id: string, updates: Partial<EC2InstanceConfig>) => void;
  updatePeering: (updates: Partial<PeeringConnectionConfig>) => void;
  updateTest: (id: string, updates: Partial<ConnectivityTestItem>) => void;
  updateControlledFailure: (updates: Partial<ControlledFailureState>) => void;
  addEvidence: (item: Omit<EvidenceItem, 'id' | 'uploadedAt'>) => void;
  deleteEvidence: (id: string) => void;
  toggleTroubleshootingCheck: (itemId: string, checkId: string) => void;
  toggleCleanupStep: (stepId: string) => void;
  updateEvaluationMarks: (categoryId: string, marks: number, override?: boolean, feedback?: string) => void;
  loadSampleData: () => void;
  resetToDefaults: () => void;
  exportBackupJson: () => string;
  importBackupJson: (jsonStr: string) => boolean;

  // Computed metrics
  progressPercentage: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  failedChecks: number;
  evidenceCount: number;
  totalScore: number;
  isReportReady: boolean;
}

const LabContext = createContext<LabContextType | undefined>(undefined);

export const LabProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation state
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);

  // Lab Data states initialized from LocalStorage or Defaults
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_profile`);
      return saved ? JSON.parse(saved) : initialStudentProfile;
    } catch {
      return initialStudentProfile;
    }
  });

  const [resources, setResources] = useState<ResourceItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_resources`);
      return saved ? JSON.parse(saved) : defaultResources;
    } catch {
      return defaultResources;
    }
  });

  const [routeTables, setRouteTables] = useState<RouteTableConfig[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_routetables`);
      return saved ? JSON.parse(saved) : defaultRouteTables;
    } catch {
      return defaultRouteTables;
    }
  });

  const [securityGroups, setSecurityGroups] = useState<SecurityGroupConfig[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_securitygroups`);
      return saved ? JSON.parse(saved) : defaultSecurityGroups;
    } catch {
      return defaultSecurityGroups;
    }
  });

  const [ec2Instances, setEC2Instances] = useState<EC2InstanceConfig[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_ec2instances`);
      return saved ? JSON.parse(saved) : defaultEC2Instances;
    } catch {
      return defaultEC2Instances;
    }
  });

  const [peering, setPeering] = useState<PeeringConnectionConfig>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_peering`);
      return saved ? JSON.parse(saved) : defaultPeeringConnection;
    } catch {
      return defaultPeeringConnection;
    }
  });

  const [tests, setTests] = useState<ConnectivityTestItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_tests`);
      return saved ? JSON.parse(saved) : defaultConnectivityTests;
    } catch {
      return defaultConnectivityTests;
    }
  });

  const [controlledFailure, setControlledFailure] = useState<ControlledFailureState>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_controlledfailure`);
      return saved ? JSON.parse(saved) : defaultControlledFailure;
    } catch {
      return defaultControlledFailure;
    }
  });

  const [evidence, setEvidence] = useState<EvidenceItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_evidence`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [troubleshooting, setTroubleshooting] = useState<TroubleshootingCheckItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_troubleshooting`);
      return saved ? JSON.parse(saved) : defaultTroubleshootingItems;
    } catch {
      return defaultTroubleshootingItems;
    }
  });

  const [cleanupSteps, setCleanupSteps] = useState<CleanupStep[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_cleanup`);
      return saved ? JSON.parse(saved) : defaultCleanupSteps;
    } catch {
      return defaultCleanupSteps;
    }
  });

  const [evaluation, setEvaluation] = useState<EvaluationCategory[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_evaluation`);
      return saved ? JSON.parse(saved) : defaultEvaluationRubric;
    } catch {
      return defaultEvaluationRubric;
    }
  });

  // LocalStorage synchronizers
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_profile`, JSON.stringify(profile));
    } catch (e) {
      console.warn('Storage quota error', e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_resources`, JSON.stringify(resources));
    } catch (e) {
      console.warn('Storage quota error', e);
    }
  }, [resources]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_routetables`, JSON.stringify(routeTables));
    } catch (e) {
      console.warn('Storage quota error', e);
    }
  }, [routeTables]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_securitygroups`, JSON.stringify(securityGroups));
    } catch (e) {
      console.warn('Storage quota error', e);
    }
  }, [securityGroups]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_ec2instances`, JSON.stringify(ec2Instances));
    } catch (e) {
      console.warn('Storage quota error', e);
    }
  }, [ec2Instances]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_peering`, JSON.stringify(peering));
    } catch (e) {
      console.warn('Storage quota error', e);
    }
  }, [peering]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_tests`, JSON.stringify(tests));
    } catch (e) {
      console.warn('Storage quota error', e);
    }
  }, [tests]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_controlledfailure`, JSON.stringify(controlledFailure));
    } catch (e) {
      console.warn('Storage quota error', e);
    }
  }, [controlledFailure]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_evidence`, JSON.stringify(evidence));
    } catch (e) {
      console.warn('Storage quota error', e);
    }
  }, [evidence]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_troubleshooting`, JSON.stringify(troubleshooting));
    } catch (e) {
      console.warn('Storage quota error', e);
    }
  }, [troubleshooting]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_cleanup`, JSON.stringify(cleanupSteps));
    } catch (e) {
      console.warn('Storage quota error', e);
    }
  }, [cleanupSteps]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_evaluation`, JSON.stringify(evaluation));
    } catch (e) {
      console.warn('Storage quota error', e);
    }
  }, [evaluation]);

  // Action methods
  const updateProfile = (updates: Partial<StudentProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const updateResource = (id: string, updates: Partial<ResourceItem>) => {
    setResources((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const updateRouteTable = (id: string, updates: Partial<RouteTableConfig>) => {
    setRouteTables((prev) => prev.map((rt) => (rt.id === id ? { ...rt, ...updates } : rt)));
  };

  const addRouteToTable = (tableId: string, route: RouteEntry) => {
    setRouteTables((prev) =>
      prev.map((rt) => (rt.id === tableId ? { ...rt, routes: [...rt.routes, route] } : rt))
    );
  };

  const removeRouteFromTable = (tableId: string, routeId: string) => {
    setRouteTables((prev) =>
      prev.map((rt) =>
        rt.id === tableId ? { ...rt, routes: rt.routes.filter((r) => r.id !== routeId) } : rt
      )
    );
  };

  const updateSecurityGroup = (id: string, updates: Partial<SecurityGroupConfig>) => {
    setSecurityGroups((prev) => prev.map((sg) => (sg.id === id ? { ...sg, ...updates } : sg)));
  };

  const addSecurityGroupRule = (sgId: string, rule: SecurityGroupRule) => {
    setSecurityGroups((prev) =>
      prev.map((sg) =>
        sg.id === sgId ? { ...sg, inboundRules: [...sg.inboundRules, rule] } : sg
      )
    );
  };

  const removeSecurityGroupRule = (sgId: string, ruleId: string) => {
    setSecurityGroups((prev) =>
      prev.map((sg) =>
        sg.id === sgId ? { ...sg, inboundRules: sg.inboundRules.filter((r) => r.id !== ruleId) } : sg
      )
    );
  };

  const updateEC2Instance = (id: string, updates: Partial<EC2InstanceConfig>) => {
    setEC2Instances((prev) => prev.map((inst) => (inst.id === id ? { ...inst, ...updates } : inst)));
  };

  const updatePeering = (updates: Partial<PeeringConnectionConfig>) => {
    setPeering((prev) => ({ ...prev, ...updates }));
  };

  const updateTest = (id: string, updates: Partial<ConnectivityTestItem>) => {
    setTests((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const updateControlledFailure = (updates: Partial<ControlledFailureState>) => {
    setControlledFailure((prev) => ({ ...prev, ...updates }));
  };

  const addEvidence = (item: Omit<EvidenceItem, 'id' | 'uploadedAt'>) => {
    const newEvidence: EvidenceItem = {
      ...item,
      id: `ev-${Date.now()}`,
      uploadedAt: new Date().toLocaleString(),
    };
    setEvidence((prev) => [newEvidence, ...prev]);
  };

  const deleteEvidence = (id: string) => {
    setEvidence((prev) => prev.filter((e) => e.id !== id));
  };

  const toggleTroubleshootingCheck = (itemId: string, checkId: string) => {
    setTroubleshooting((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const updatedList = item.checklist.map((c) =>
          c.id === checkId ? { ...c, checked: !c.checked } : c
        );
        const allChecked = updatedList.every((c) => c.checked);
        return { ...item, checklist: updatedList, isResolved: allChecked };
      })
    );
  };

  const toggleCleanupStep = (stepId: string) => {
    setCleanupSteps((prev) =>
      prev.map((s) => {
        if (s.id !== stepId) return s;
        const nextState = !s.isCompleted;
        return {
          ...s,
          isCompleted: nextState,
          completedAt: nextState ? new Date().toLocaleTimeString() : undefined,
        };
      })
    );
  };

  const updateEvaluationMarks = (
    categoryId: string,
    marks: number,
    override = false,
    feedback?: string
  ) => {
    setEvaluation((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              awardedMarks: Math.min(cat.maxMarks, Math.max(0, marks)),
              instructorOverride: override,
              feedback: feedback !== undefined ? feedback : cat.feedback,
            }
          : cat
      )
    );
  };

  const loadSampleData = () => {
    setProfile(sampleStudentProfile);
    setResources(sampleResources);
    setRouteTables(sampleRouteTables);
    setSecurityGroups(sampleSecurityGroups);
    setEC2Instances(sampleEC2Instances);
    setPeering(samplePeeringConnection);
    setTests(sampleConnectivityTests);
    setControlledFailure(sampleControlledFailure);
    setEvidence(sampleEvidence);
    setCleanupSteps(sampleCleanupSteps);
    // Mark all troubleshooting checklist as checked for demo
    setTroubleshooting(
      defaultTroubleshootingItems.map((item) => ({
        ...item,
        checklist: item.checklist.map((c) => ({ ...c, checked: true })),
        isResolved: true,
      }))
    );
  };

  const resetToDefaults = () => {
    setProfile(initialStudentProfile);
    setResources(defaultResources);
    setRouteTables(defaultRouteTables);
    setSecurityGroups(defaultSecurityGroups);
    setEC2Instances(defaultEC2Instances);
    setPeering(defaultPeeringConnection);
    setTests(defaultConnectivityTests);
    setControlledFailure(defaultControlledFailure);
    setEvidence([]);
    setTroubleshooting(defaultTroubleshootingItems);
    setCleanupSteps(defaultCleanupSteps);
    setEvaluation(defaultEvaluationRubric);
    localStorage.clear();
  };

  const exportBackupJson = () => {
    const backup = {
      profile,
      resources,
      routeTables,
      securityGroups,
      ec2Instances,
      peering,
      tests,
      controlledFailure,
      evidence,
      troubleshooting,
      cleanupSteps,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(backup, null, 2);
  };

  const importBackupJson = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.profile) setProfile(data.profile);
      if (data.resources) setResources(data.resources);
      if (data.routeTables) setRouteTables(data.routeTables);
      if (data.securityGroups) setSecurityGroups(data.securityGroups);
      if (data.ec2Instances) setEC2Instances(data.ec2Instances);
      if (data.peering) setPeering(data.peering);
      if (data.tests) setTests(data.tests);
      if (data.controlledFailure) setControlledFailure(data.controlledFailure);
      if (data.evidence) setEvidence(data.evidence);
      if (data.cleanupSteps) setCleanupSteps(data.cleanupSteps);
      if (data.troubleshooting) setTroubleshooting(data.troubleshooting);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  // Dynamic progress & validation calculations
  const { progressPercentage, totalTasks, completedTasks, pendingTasks, failedChecks, totalScore } =
    useMemo(() => {
      // 1. Profile Task (1 task)
      const profileDone = Boolean(profile.studentName && profile.studentName.trim().length > 1);

      // 2. Resource IDs Recorded (17 resources)
      const resourcesWithIds = resources.filter((r) => r.actualAwsId && r.actualAwsId.trim().length > 0).length;

      // 3. Route Tables Validated (3 tables)
      const tablesVerified = routeTables.filter((rt) => {
        const hasPeeringRoute = rt.routes.some((r) => r.targetType === 'pcx');
        return hasPeeringRoute || rt.isVerified;
      }).length;

      // 4. Security Groups configured (3 SGs)
      const sgsVerified = securityGroups.filter((sg) => {
        const hasValidRules = sg.inboundRules.length > 0;
        return hasValidRules || sg.isVerified;
      }).length;

      // 5. EC2 Instances configured with running or available state (3 instances)
      const ec2Done = ec2Instances.filter(
        (i) => i.actualInstanceId && i.actualInstanceId.trim().length > 0
      ).length;

      // 6. Peering Active (1 task)
      const peeringActive = peering.status === 'Active' && peering.actualPcxId.length > 0 ? 1 : 0;

      // 7. Connectivity Tests executed and passed (5 tests)
      const testsPassed = tests.filter((t) => t.status === 'Passed').length;
      const testsFailed = tests.filter((t) => t.status === 'Failed').length;

      // 8. Controlled Failure experiment completed (4 steps)
      const cfSteps = [
        controlledFailure.step1RemovedICMP,
        controlledFailure.step2ObservedFailure,
        controlledFailure.step3RestoredICMP,
        controlledFailure.step4ObservedRecovery,
      ].filter(Boolean).length;

      // 9. Evidence uploaded (min 5 key screenshots)
      const evidenceScore = Math.min(evidence.length, 5);

      // 10. Cleanup completed (13 steps)
      const cleanupDone = cleanupSteps.filter((s) => s.isCompleted).length;

      // Total count breakdown:
      // Profile (1) + Resources (17) + RouteTables (3) + SGs (3) + EC2 (3) + Peering (1) + Tests (5) + CF (4) + Evidence (5) + Cleanup (13) = 55 tasks
      const allTasksTotal = 1 + 17 + 3 + 3 + 3 + 1 + 5 + 4 + 5 + 13;
      const allTasksCompleted =
        (profileDone ? 1 : 0) +
        resourcesWithIds +
        tablesVerified +
        sgsVerified +
        ec2Done +
        peeringActive +
        testsPassed +
        cfSteps +
        evidenceScore +
        cleanupDone;

      const progress = Math.min(100, Math.round((allTasksCompleted / allTasksTotal) * 100));

      // Calculate Marks dynamically (100 total):
      // Cat 1 (15 marks): Architecture & Inventory (Profile 2m, Resources with IDs 13m)
      const cat1Auto = Math.min(15, Math.round((resourcesWithIds / 17) * 13 + (profileDone ? 2 : 0)));

      // Cat 2 (20 marks): Subnets, IGW, Route Associations
      const cat2Auto = Math.min(
        20,
        Math.round(
          (routeTables.some((rt) => rt.id === 'rt-a-public' && rt.routes.some((r) => r.targetType === 'igw')) ? 8 : 0) +
            (routeTables.some((rt) => rt.id === 'rt-a-private') ? 6 : 0) +
            (routeTables.some((rt) => rt.id === 'rt-b-private') ? 6 : 0)
        )
      );

      // Cat 3 (20 marks): Peering & Routes
      const cat3Auto = Math.min(
        20,
        (peeringActive ? 6 : 0) +
          (routeTables.some((rt) => rt.id === 'rt-a-private' && rt.routes.some((r) => r.targetType === 'pcx')) ? 7 : 0) +
          (routeTables.some((rt) => rt.id === 'rt-b-private' && rt.routes.some((r) => r.targetType === 'pcx')) ? 7 : 0)
      );

      // Cat 4 (20 marks): Security Rules & Private SSH
      const bastionSgValid = securityGroups.some(
        (sg) => sg.id === 'sg-bastion' && sg.inboundRules.some((r) => r.portRange === '22' && !r.source.includes('0.0.0.0/0'))
      );
      const appSgValid = securityGroups.some((sg) => sg.id === 'sg-app-a') && securityGroups.some((sg) => sg.id === 'sg-app-b');
      const noPublicApps = !ec2Instances.some((i) => (i.id === 'ec2-app-a' || i.id === 'ec2-app-b') && i.actualPublicIp && i.actualPublicIp !== 'None (Disabled)' && i.actualPublicIp !== '');
      const sshTestPassed = tests.some((t) => t.id === 'test-4-ssh' && t.status === 'Passed');

      const cat4Auto = Math.min(
        20,
        (bastionSgValid ? 5 : 0) + (appSgValid ? 5 : 0) + (noPublicApps ? 5 : 0) + (sshTestPassed ? 5 : 0)
      );

      // Cat 5 (15 marks): Positive & Negative Testing
      const baselinePassed = tests.some((t) => t.id === 'test-1-baseline' && t.status === 'Passed');
      const pingPassed = tests.some((t) => t.id === 'test-2-forward' && t.status === 'Passed') && tests.some((t) => t.id === 'test-3-reverse' && t.status === 'Passed');
      const cfPassed = controlledFailure.step4ObservedRecovery;

      const cat5Auto = Math.min(
        15,
        (baselinePassed ? 3 : 0) + (pingPassed ? 5 : 0) + (cfPassed ? 7 : 0)
      );

      // Cat 6 (10 marks): Report, Viva & Cleanup
      const cleanupAll = cleanupDone >= 12;
      const evidenceAdequate = evidence.length >= 3;
      const cat6Auto = Math.min(10, (cleanupAll ? 4 : Math.round((cleanupDone / 13) * 4)) + (evidenceAdequate ? 3 : 0) + (profileDone ? 3 : 0));

      // Calculate total evaluation score based on auto marks or instructor overrides
      const calculatedTotal = evaluation.reduce((acc, cat) => {
        if (cat.instructorOverride) {
          return acc + cat.awardedMarks;
        }
        if (cat.id === 'eval-cat-1') return acc + cat1Auto;
        if (cat.id === 'eval-cat-2') return acc + cat2Auto;
        if (cat.id === 'eval-cat-3') return acc + cat3Auto;
        if (cat.id === 'eval-cat-4') return acc + cat4Auto;
        if (cat.id === 'eval-cat-5') return acc + cat5Auto;
        if (cat.id === 'eval-cat-6') return acc + cat6Auto;
        return acc + cat.awardedMarks;
      }, 0);

      return {
        progressPercentage: progress,
        totalTasks: allTasksTotal,
        completedTasks: allTasksCompleted,
        pendingTasks: allTasksTotal - allTasksCompleted,
        failedChecks: testsFailed,
        totalScore: Math.min(100, calculatedTotal),
      };
    }, [
      profile,
      resources,
      routeTables,
      securityGroups,
      ec2Instances,
      peering,
      tests,
      controlledFailure,
      evidence,
      cleanupSteps,
      evaluation,
    ]);

  const evidenceCount = evidence.length;
  const isReportReady = progressPercentage >= 40 && Boolean(profile.studentName);

  return (
    <LabContext.Provider
      value={{
        profile,
        resources,
        routeTables,
        securityGroups,
        ec2Instances,
        peering,
        tests,
        controlledFailure,
        evidence,
        troubleshooting,
        cleanupSteps,
        evaluation,
        activePage,
        selectedResourceId,
        setActivePage,
        setSelectedResourceId,
        updateProfile,
        updateResource,
        updateRouteTable,
        addRouteToTable,
        removeRouteFromTable,
        updateSecurityGroup,
        addSecurityGroupRule,
        removeSecurityGroupRule,
        updateEC2Instance,
        updatePeering,
        updateTest,
        updateControlledFailure,
        addEvidence,
        deleteEvidence,
        toggleTroubleshootingCheck,
        toggleCleanupStep,
        updateEvaluationMarks,
        loadSampleData,
        resetToDefaults,
        exportBackupJson,
        importBackupJson,
        progressPercentage,
        totalTasks,
        completedTasks,
        pendingTasks,
        failedChecks,
        evidenceCount,
        totalScore,
        isReportReady,
      }}
    >
      {children}
    </LabContext.Provider>
  );
};

export const useLab = () => {
  const context = useContext(LabContext);
  if (!context) {
    throw new Error('useLab must be used within a LabProvider');
  }
  return context;
};
