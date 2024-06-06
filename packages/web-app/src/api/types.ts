// ORGANIZATION
import { type Project } from "@ironclad/rivet-core";

export interface Organization {
  org_id: string;
  org_name: string;
  description: string;
  time_zone: string | null;
  created_at: string;
  updated_at: string | null;
  created_by: string;
  deleted_by: string | null;
  archived_at: string | null;
  deleted_at: string | null;
  workspaces: Workspace[] | null;
  organization_memberships?: OrganizationMembership[] | null;
}

export interface OrganizationMembership {
  org_membership_id: string;
  created_at: string;
  updated_at: string | null;
  org_id: Organization;
  role_id: Role;
  role_type: 'org' | 'workspace';
}

export type CreateOrgMembershipType = {
  role_id: string;
  org_id: string;
  user_id: string;
};

// WORKSPACE
export interface Workspace {
  workspace_id: string;
  workspace_name: string;
  workspace_description: string | null;
  x_workspace_description: string | null;
  time_zone: string | null;
  created_by: string;
  deleted_by: string | null;
  created_at: string;
  updated_at: string | null;
  archived_at: string | null;
  deleted_at: string | null;
  membershipData?: WorkspaceMembership[];
}

export interface WorkspaceMembership {
  membership_id: string;
  created_at: string;
  updated_at: string | null;
  role_id: Role;
  workspace_id: Workspace;
  user_id: User;
}

// USER
export interface User {
  user_id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  created_at: string;
  updated_at: string | null;
  archived_at: string | null;
  deleted_at: string | null;
  created_by: string | null;
  deleted_by: string | null;
  is_deleted: boolean;
  is_archived: boolean;
  password_reset_required: boolean;
  workspace_memberships: WorkspaceMembership[] | null;
  org_memberships: OrganizationMembership[] | null;
}

export interface Role {
  role_id: string;
  role_name: string;
  role_permissions: any;
  created_at: string;
  updated_at: string | null;
  role_type: 'workspace' | 'org';
}

// CONVERSATIONS
export interface ConversationResponse {
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  conversations: Conversation[];
}

export interface Conversation {
  conversation_id: string;
  dp_conversation_id: string;
  interaction_segment: string | null;
  org_id: number;
  workspace: {
    workspace_id: string;
    description: string;
  };
  conversation_start_time: string;
  conversation_end_time: string | null;
  duration: string;
  agent: Agent;
  queue: Queue | null;
  campaign: string | null;
  routing_flow: RoutingFlow;
  transferred: boolean;
  answered: boolean;
  caller_info: CallerInfo;
  recording: {
    recording_id: string;
    location: string;
    transcript_url: string | null;
  };
  inQueueDuration: number | null;
  conversationTalkDuration: number;
  conversationWaitDuration: number | null;
  conversationHoldDuration: number | null;
  conversationACWDuration: number | null;
  disposition: string | null;
  updated_at: string | null;
  created_at: string;
  workspace_id: string;
  labels: { label_id: string }[] | [];
}

export interface Agent {
  agent_id: string;
  agent_username: string;
  first_name: string | null;
  last_name: string | null;
}

export interface Queue {
  queue_id: string;
  queue_name: string;
  queue_description: string;
}

interface RoutingFlow {
  flow_id: string;
  flow_name: string;
  flow_description: string | null;
}

interface CallerInfo {
  ANI: string;
  dialed_number: string | null;
  skill_session: string | null;
  call_direction: string;
}

export interface ConversationFilters {
  agents: AgentFilter[];
  dispositions: DispositionsFilter[];
  queues: QueueFilter[];
}

export interface AgentFilter {
  x_agent_id: string;
  dp_agent_id: string;
  dp_agent_first_name: string;
  dp_agent_last_name: string;
  dp_agent_email: string;
}

export interface DispositionsFilter {
  x_disposition_id: string;
  dp_disposition_id: string;
  disposition_name: string;
  disposition_description: string;
  global: boolean;
}

export interface QueueFilter {
  x_queue_id: string;
  dp_queue_id: string;
  dp_queue_name: string;
  dp_queue_description: string;
  created_at: string;
  updated_at: string | null;
}

// RECORDS
export interface RecordType {
  recording_id: string;
  dp_recording_id: string;
  recording_start_time: string;
  recording_url: string;
  recording_duration: number;
  file_name: string;
  file_size: number;
  file_format: string;
  scheduled_delete_date: string | null;
  created_at: string;
  updated_at: string | null;
  status: string | null;
}

// TRANSCRIPTS
export interface Transcript {
  transcript_id: string;
  transcript_privider_id: string | null;
  transcript_data: { transcript: TranscriptItem[] };
  transcript_url: string;
  transcript_datetime: string;
  created_at: string;
  updated_at: string | null;
  recording: RecordType;
}

interface TranscriptItem {
  identifier: string;
  start: number;
  end: number;
  text: string;
  styles: string;
  speaker?: string;
}

export type Prompt = {
  id: string;
  prompt_id: string;
  display_name: string;
  name: string;
  prompt_version_id: string;
  created_at: string;
  updated_at: string | null;
  content: string;
  description: string;
  url: string;
};

// DOCUMENTS
export interface DocumentI {
  workspace_id: string;
  doc_type_id: string;
  author_id: string;
  document_id: string;
  title: string;
  description: string | null;
  url: string | null;
  file_path: string;
  read_time: number | null;
  created_date: string;
  published_date: string | null;
  updated_date: string | null;
  document_status: string;
  generated: boolean;
  weaviate_id: string | null;
  content: string | null;
}

export interface Label {
  label_id: string;
  name: string;
  color: string;
  workspace_id: string;
  created_at: Date;
  updated_at: Date;
  isAttached: boolean;
}

export interface LabelGroup {
  group_id: string;
  name: string;
  color: string;
  workspace_id: string;
  created_at: Date;
  updated_at: Date;
  isAttached: string;
}

export interface GroupWithLabels extends LabelGroup {
  labels: Label[];
}

// ASSISTANTS
export interface AssistantProvider {
  assistant_provider_id: string;
  provider_name: string;
  api_key: string;
  api_url: string;
  additional_config: { [key: string]: any }[] | null;
}

export interface Assistant {
  x_assistant_id: string;
  additional_config: string;
  openai_assistant_id: string;
  created_at: string;
  is_enabled: boolean;
  name: string;
  description: string;
  model: string;
  instructions: string;
  tools: { type: string }[] | string;
  file_ids: string[] | [];
  metadata: any;
  documents: AssistantDocument[];
}

export interface AssistantDocument {
  assistant_document_id: string;
  bytes: number;
  filename: string;
  id: string;
  object: string;
  purpose: string;
  x_assistant_id: Assistant;
  x_document_id: DocumentI;
  provider_document_id: string;
  status: string;
  status_details: string;
  last_synced: Date;
}

export interface Message {
  message_id: string;
  thread: Thread;
  annotations: MessageAnnotation[];
  sender_id: string;
  content: string;
  openAI_assistant_message_id: string;
  message_type: string;
  created_at: Date;
  updated_at: Date;
}

export interface MessageAnnotation {
  annotation_id: string;
  message: Message;
  type: string;
  details: any;
}

export interface Thread {
  provider_assistant_thread_id: string;
  thread_id: string;
  workspace: Workspace;
  assistant: Assistant;
  user: User;
  status: string;
  openAI_assistant_thread_id: string;
  created_at: Date;
  updated_at: Date;
  messages: Message[];
  conversationHistory: Message[];
}

export interface DataProvider {
  data_provider_id: string;
  data_provider_name: string;
  data_provider_description: string;
  data_provider_type: string[] | null;
}

export interface DataProviderInstance {
  dp_instance_id: string;
  dp_instance_name: string;
  data_provider_id: string;
  org_id: string;
  workspace_id: string;
  dp_auth_token: string;
  token_expiration: string;
  dp_access_credentials: {
    account_id: string;
    client_id: string;
    client_secret: string;
  };
}

export enum ReportBuildStatus {
  NotBuilt = 'NotBuilt',
  Queued = 'Queued',
  Building = 'Building',
  Built = 'Built',
  Error = 'Error',
}

export interface Report {
  id: string;
  name: string;
  description: string;
  content?: string;
  url?: string;
  is_enabled: boolean;
  build_started_at?: Date;
  last_build_at?: Date;
  build_cron?: string;
  build_error?: string;
  build_status?: ReportBuildStatus;
  build_duration: number | null;
  is_built: boolean;
  created_by: string; // username
  created_at: Date;
  updated_at: Date;
}

export interface FindReportCriteria {
  name?: string;
  description?: string;
  is_enabled?: boolean;
  build_status?: ReportBuildStatus
  order_by?: 'name' | 'description' | 'is_enabled' | 'build_status' | 'created_at' | 'updated_at' | 'created_by';
  created_by?: string;
  order?: 'ASC' | 'DESC'
  page?: number;
  page_size?: number;
}

export enum StandardReportScope {
  organization = 'organization',
  workspace = 'workspace'
}

export interface StandardReport {
  id: string;
  name: string;
  description: string;
  content: string;
  scope: StandardReportScope;
  is_enabled: boolean;
  last_build_at?: Date;
  default_cron?: string;
  build_error?: string;
  created_by: string; // username
  created_at: Date;
  updated_at: Date;
}

export enum WorkflowSortFields {
  name = 'name',
  status = 'status',
  createdBy = 'created_by',
  createdAt = 'created_at'
}

export interface FindWorkflowsDto {
  workspace_id: string;
  name?: string;
  status?: WorkflowStatus;
  description?: string;
  created_by?: string;
  page?: number;
  page_size?: number;
  order_by?: 'name' | 'status' | 'created_by' | 'created_at';
  order?: 'ASC' | 'DESC' | 'asc' | 'desc';
}

export interface PagingMetadata {
  page: number | undefined;
  page_size: number;
  total_pages: number;
  total_count: number;
}

export interface PagedReportResponse<T> extends PagingMetadata {
  reports: T[];
}

export enum WorkflowStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface Workflow {
    id: string;
    name: string;
    description: string;
    project: Project;
    status: WorkflowStatus;
    workspace_id: string;
    created_by: string;
    created_at: Date;
    updated_at: Date;
}

export type WorkflowCreateDto = {
  name: string;
  description: string;
  project: Project;
  workspace_id: string;
  status?: WorkflowStatus;
}

export type UpdateWorkflowDto = {
  name?: string;
  description?: string;
  project?: Project;
  status?: WorkflowStatus;
}

export type WorkflowsFilter = {
  workspace_id: string;
  name?: string;
  status?: WorkflowStatus;
  description?: string;
  created_by?: string;
  page?: number;
  page_size?: number;
  order_by?: WorkflowSortFields;
  order?: 'ASC' | 'DESC' | 'asc' | 'desc';
}

export interface PagedWorkflowResponse extends PagingMetadata {
  flows: Workflow[];
}
