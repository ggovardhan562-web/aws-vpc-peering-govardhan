export type ResourceStatus = 'Not started' | 'Creating' | 'Available' | 'Failed' | 'Deleted';

export type PeeringStatus = 'Not created' | 'Pending acceptance' | 'Active' | 'Failed';

export interface StudentProfile {
  studentName: string;
  batch: string;
  projectTitle: string;
  awsAccountAlias: string;
  awsRegion: string;
  startDate: string;
  completionDate: string;
  studentPublicIp: string;
}

export interface ResourceItem {
  id: string;
  name: string;
  type: 'VPC' | 'Subnet' | 'Internet Gateway' | 'Route Table' | 'Security Group' | 'EC2 Instance' | 'VPC Peering' | 'Key Pair';
  vpc: 'ewb-vpc-a' | 'ewb-vpc-b' | 'N/A';
  subnet?: string;
  cidrOrIp: string;
  expectedCidrOrIp: string;
  actualAwsId: string;
  status: ResourceStatus;
  notes: string;
}

export interface RouteEntry {
  id: string;
  destinationCidr: string;
  targetType: 'local' | 'igw' | 'pcx';
  targetValue: string;
  description: string;
  isCustom?: boolean;
}

export interface RouteTableConfig {
  id: string;
  name: string;
  vpc: 'ewb-vpc-a' | 'ewb-vpc-b';
  associatedSubnet: string;
  expectedAssociatedSubnet: string;
  routes: RouteEntry[];
  actualAwsId: string;
  isVerified: boolean;
}

export interface SecurityGroupRule {
  id: string;
  type: 'SSH' | 'ICMP Echo Request' | 'Custom';
  protocol: 'TCP' | 'ICMP' | 'All';
  portRange: string;
  icmpType?: number;
  icmpCode?: number;
  source: string;
  description: string;
}

export interface SecurityGroupConfig {
  id: string;
  name: string;
  vpc: 'ewb-vpc-a' | 'ewb-vpc-b';
  inboundRules: SecurityGroupRule[];
  outboundRules: string;
  actualAwsId: string;
  isVerified: boolean;
}

export interface EC2InstanceConfig {
  id: string;
  name: string;
  vpc: 'ewb-vpc-a' | 'ewb-vpc-b';
  subnet: string;
  expectedSubnet: string;
  privateIp: string;
  expectedPrivateIp: string;
  publicIpAllowed: boolean;
  actualPublicIp: string;
  actualInstanceId: string;
  instanceType: string;
  ami: string;
  keyPair: string;
  securityGroup: string;
  state: 'pending' | 'running' | 'stopped' | 'terminated';
  az: string;
}

export interface PeeringConnectionConfig {
  name: string;
  requesterVpc: string;
  accepterVpc: string;
  actualPcxId: string;
  status: PeeringStatus;
  requesterVpcId: string;
  accepterVpcId: string;
  account: string;
  region: string;
  isAccepted: boolean;
  notes: string;
}

export interface ConnectivityTestItem {
  id: string;
  testNumber: number;
  name: string;
  source: string;
  destination: string;
  command: string;
  expectedResult: string;
  actualResult: string;
  status: 'Not tested' | 'Passed' | 'Failed';
  packetLossPercent: number;
  testDate: string;
  screenshotId?: string;
  studentExplanation: string;
}

export interface ControlledFailureState {
  step1RemovedICMP: boolean;
  step2ObservedFailure: boolean;
  step3RestoredICMP: boolean;
  step4ObservedRecovery: boolean;
  baselinePingResult: string;
  failurePingResult: string;
  recoveryPingResult: string;
  studentObservations: string;
  failureEvidenceId?: string;
  recoveryEvidenceId?: string;
}

export type EvidenceCategory =
  | 'Architecture'
  | 'VPC'
  | 'Subnets'
  | 'Route tables'
  | 'Security groups'
  | 'EC2'
  | 'Peering'
  | 'Connectivity'
  | 'SSH'
  | 'Controlled failure'
  | 'Recovery'
  | 'Cleanup';

export interface EvidenceItem {
  id: string;
  title: string;
  description: string;
  stageId: string;
  category: EvidenceCategory;
  dataUrl: string;
  uploadedAt: string;
  fileName: string;
  fileSize: string;
}

export interface TroubleshootingCheckItem {
  id: string;
  title: string;
  problem: string;
  symptoms: string[];
  checklist: { id: string; label: string; checked: boolean }[];
  resolutionGuide: string;
  isResolved: boolean;
}

export interface CleanupStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  resourceTarget: string;
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
}

export interface VivaQuestion {
  id: string;
  question: string;
  answer: string;
  explanation: string;
  category: 'Networking' | 'Routing' | 'Security' | 'AWS Architecture';
  importance: 'High' | 'Critical' | 'Medium';
}

export interface EvaluationCategory {
  id: string;
  title: string;
  maxMarks: number;
  awardedMarks: number;
  autoCalculatedMarks: number;
  description: string;
  criteriaList: string[];
  instructorOverride?: boolean;
  feedback?: string;
}
