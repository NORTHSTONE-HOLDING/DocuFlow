import { useCallback, useEffect, useState } from 'react';
import type { CompanyProfile, Project, WorkflowDocument } from '../types/erp';
import {
  DEFAULT_COMPANY_PROFILE,
  deleteProject,
  getWorkflowDoc,
  loadCompanyProfile,
  loadProjects,
  loadWorkflowDocs,
  saveCompanyProfile,
  upsertProject,
  upsertWorkflowDoc,
} from '../utils/erpStorage';

export function useCompanyProfile() {
  const [profile, setProfile] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);

  useEffect(() => {
    setProfile(loadCompanyProfile());
  }, []);

  const update = useCallback((partial: Partial<CompanyProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...partial };
      saveCompanyProfile(next);
      return next;
    });
  }, []);

  const save = useCallback((next: CompanyProfile) => {
    saveCompanyProfile(next);
    setProfile(next);
  }, []);

  return { profile, update, save };
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [docs, setDocs] = useState<WorkflowDocument[]>([]);

  const refresh = useCallback(() => {
    setProjects(loadProjects());
    setDocs(loadWorkflowDocs());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveProject = useCallback((project: Project) => {
    setProjects(upsertProject(project));
  }, []);

  const saveDoc = useCallback((doc: WorkflowDocument) => {
    setDocs(upsertWorkflowDoc(doc));
  }, []);

  const removeProject = useCallback((id: string) => {
    setProjects(deleteProject(id));
  }, []);

  const getDoc = useCallback((id?: string) => (id ? getWorkflowDoc(id) : undefined), []);

  return { projects, docs, refresh, saveProject, saveDoc, removeProject, getDoc };
}
