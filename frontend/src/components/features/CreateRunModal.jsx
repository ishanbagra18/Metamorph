import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { migrationsApi } from '../../lib/api/migrations';
import { useToast } from '../../context/ToastContext';
import { Upload, GitBranch, FileCode, CheckCircle2, AlertCircle, Sparkles, FolderArchive } from 'lucide-react';

export function CreateRunModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'clone'
  const [file, setFile] = useState(null);
  const [gitUrl, setGitUrl] = useState('');
  const [branch, setBranch] = useState('');
  const [autoStart, setAutoStart] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);
  const toast = useToast();
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.zip')) {
        setFile(droppedFile);
      } else {
        toast.error('Only .zip files are supported.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let runId = null;

      if (activeTab === 'upload') {
        if (!file) {
          toast.error('Please select a Node.js repository .zip file.');
          setIsSubmitting(false);
          return;
        }
        const res = await migrationsApi.uploadZip(file);
        runId = res.run_id;
        toast.success(`Repository "${res.repo_name}" prepared.`);
      } else {
        if (!gitUrl.trim()) {
          toast.error('Please enter a valid Git repository URL.');
          setIsSubmitting(false);
          return;
        }
        const res = await migrationsApi.cloneRepo(gitUrl.trim(), branch.trim() || undefined);
        runId = res.run_id;
        toast.success(`Repository cloned: "${res.repo_name}".`);
      }

      if (autoStart && runId) {
        await migrationsApi.startRun(runId);
        toast.success('Autonomous migration pipeline started!');
      }

      // Reset and redirect
      setFile(null);
      setGitUrl('');
      setBranch('');
      onClose();
      navigate(`/migrations/${runId}`);
    } catch (err) {
      toast.error(err.message || 'Failed to initialize migration run.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New TypeScript Migration"
      description="Upload a Node.js Express JavaScript repository or clone from GitHub to initiate self-correcting AST migration."
      maxWidth="620px"
    >
      {/* Tab Switcher */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          padding: '4px',
          backgroundColor: 'var(--bg-surface-elevated)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          style={{
            padding: '10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: activeTab === 'upload' ? 'var(--bg-surface)' : 'transparent',
            color: activeTab === 'upload' ? 'var(--text-primary)' : 'var(--text-secondary)',
            boxShadow: activeTab === 'upload' ? 'var(--shadow-sm)' : 'none'
          }}
        >
          <FolderArchive size={16} />
          Upload ZIP Archive
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('clone')}
          style={{
            padding: '10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: activeTab === 'clone' ? 'var(--bg-surface)' : 'transparent',
            color: activeTab === 'clone' ? 'var(--text-primary)' : 'var(--text-secondary)',
            boxShadow: activeTab === 'clone' ? 'var(--shadow-sm)' : 'none'
          }}
        >
          <GitBranch size={16} />
          Clone Git Repository
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {activeTab === 'upload' ? (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragActive ? 'var(--accent-cyan)' : file ? 'var(--status-success)' : 'var(--border-default)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '36px 20px',
                textAlign: 'center',
                backgroundColor: dragActive ? 'rgba(6, 182, 212, 0.05)' : 'var(--bg-surface-elevated)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              {file ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--status-success-bg)',
                      color: 'var(--status-success)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CheckCircle2 size={24} />
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{file.name}</span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Click or drop another to replace
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(6, 182, 212, 0.12)',
                      color: 'var(--accent-cyan)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Upload size={24} />
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Click to upload</span> or drag and drop
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Node.js / Express repository ZIP (with package.json)
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input
              label="Git Repository URL"
              placeholder="https://github.com/expressjs/express.git"
              value={gitUrl}
              onChange={(e) => setGitUrl(e.target.value)}
              icon={GitBranch}
              required
              helperText="Public GitHub or GitLab repository containing JavaScript source files"
            />
            <Input
              label="Branch (Optional)"
              placeholder="main"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              helperText="Defaults to primary default branch if left blank"
            />
          </div>
        )}

        {/* Options */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Auto-Start Migration
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Immediately run AST analysis, topological planning, and migration loop
            </div>
          </div>
          <input
            type="checkbox"
            checked={autoStart}
            onChange={(e) => setAutoStart(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-cyan)' }}
          />
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
          <Button variant="secondary" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting} icon={Sparkles}>
            Initialize Migration
          </Button>
        </div>
      </form>
    </Modal>
  );
}
