import type { CompanyProfile, Project, WorkflowDocument } from '../types/erp';
import { createId } from './storage';

const PROJECTS_KEY = 'docuflow_projects_v1';
const WORKFLOW_DOCS_KEY = 'docuflow_workflow_docs_v1';
const PROFILE_KEY = 'docuflow_company_profile_v1';

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  companyName: '',
  ico: '',
  dic: '',
  address: '',
  accountNumber: '',
  bankCode: '0800',
  email: '',
  phone: '',
};

export function loadCompanyProfile(): CompanyProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return { ...DEFAULT_COMPANY_PROFILE };
    return { ...DEFAULT_COMPANY_PROFILE, ...(JSON.parse(raw) as CompanyProfile) };
  } catch {
    return { ...DEFAULT_COMPANY_PROFILE };
  }
}

export function saveCompanyProfile(profile: CompanyProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Project[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]): void {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function upsertProject(project: Project): Project[] {
  const all = loadProjects();
  const idx = all.findIndex((p) => p.id === project.id);
  if (idx >= 0) all[idx] = project;
  else all.unshift(project);
  saveProjects(all);
  return all;
}

export function deleteProject(id: string): Project[] {
  const all = loadProjects().filter((p) => p.id !== id);
  saveProjects(all);
  return all;
}

export function loadWorkflowDocs(): WorkflowDocument[] {
  try {
    const raw = localStorage.getItem(WORKFLOW_DOCS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WorkflowDocument[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveWorkflowDocs(docs: WorkflowDocument[]): void {
  localStorage.setItem(WORKFLOW_DOCS_KEY, JSON.stringify(docs));
}

export function upsertWorkflowDoc(doc: WorkflowDocument): WorkflowDocument[] {
  const all = loadWorkflowDocs();
  const idx = all.findIndex((d) => d.id === doc.id);
  if (idx >= 0) all[idx] = doc;
  else all.unshift(doc);
  saveWorkflowDocs(all);
  return all;
}

export function getWorkflowDoc(id: string): WorkflowDocument | undefined {
  return loadWorkflowDocs().find((d) => d.id === id);
}

export function newEmptyClient() {
  return { name: '', ico: '', dic: '', address: '', phone: '', email: '' };
}

export function newLineItem() {
  return {
    id: createId(),
    name: '',
    qty: 1,
    unitPrice: 0,
    vatRate: 21 as const,
  };
}
