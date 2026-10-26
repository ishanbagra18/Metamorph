/**
 * Migrations API Endpoints
 */
import { apiClient } from './client';

export const migrationsApi = {
  async listRuns() {
    return await apiClient('/runs', { method: 'GET' });
  },

  async getRun(runId) {
    return await apiClient(`/runs/${runId}`, { method: 'GET' });
  },

  async startRun(runId) {
    return await apiClient(`/runs/${runId}/start`, { method: 'POST' });
  },

  async cancelRun(runId) {
    return await apiClient(`/runs/${runId}/cancel`, { method: 'POST' });
  },

  async deleteRun(runId) {
    return await apiClient(`/runs/${runId}`, { method: 'DELETE' });
  },

  async uploadZip(file) {
    const formData = new FormData();
    formData.append('file', file);
    return await apiClient('/upload', {
      method: 'POST',
      body: formData,
      isFormData: true
    });
  },

  async cloneRepo(gitUrl, branch = null) {
    return await apiClient('/clone', {
      method: 'POST',
      body: { git_url: gitUrl, branch: branch || undefined }
    });
  },

  async getReport(runId) {
    return await apiClient(`/runs/${runId}/report`, { method: 'GET' });
  },

  getDownloadUrl(runId) {
    const base = import.meta.env.VITE_API_URL || '/api';
    return `${base}/runs/${runId}/download`;
  }
};
