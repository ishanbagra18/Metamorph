/**
 * Core Metamorph Type Definitions (JSDoc format for flexible runtime & tooling)
 */

/**
 * @typedef {'user' | 'admin'} UserRole
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {UserRole} role
 * @property {string} [company]
 * @property {string} [avatar]
 * @property {string} created_at
 */

/**
 * @typedef {'created' | 'ready' | 'initializing' | 'running' | 'completed' | 'failed' | 'cancelled'} MigrationStatus
 */

/**
 * @typedef {Object} FileTask
 * @property {string} path
 * @property {string} new_path
 * @property {'pending' | 'in_progress' | 'done' | 'failed'} status
 * @property {number} attempts
 * @property {string|null} [last_error]
 * @property {string} original_code
 * @property {string|null} [migrated_code]
 * @property {string|null} [diff]
 * @property {string|null} [notes]
 */

/**
 * @typedef {Object} MigrationRunSummary
 * @property {string} run_id
 * @property {string} repo_name
 * @property {MigrationStatus} status
 * @property {string} created_at
 * @property {string} updated_at
 * @property {Object} summary
 * @property {number} [summary.total_files]
 * @property {number} [summary.done_files]
 * @property {number} [summary.failed_files]
 * @property {Object} [summary.report]
 */

/**
 * @typedef {Object} MigrationRunDetail
 * @property {string} run_id
 * @property {string} repo_name
 * @property {MigrationStatus} status
 * @property {string} created_at
 * @property {string} updated_at
 * @property {Object} summary
 * @property {Object} state
 * @property {Record<string, string[]>} [state.dep_graph]
 * @property {string[][]} [state.cycles]
 * @property {string[]} [state.plan]
 * @property {Record<string, FileTask>} [state.tasks]
 * @property {string|null} [state.current_file]
 * @property {string[]} [state.logs]
 * @property {string[]} [state.tsc_errors]
 * @property {Object} [state.report]
 */

/**
 * @typedef {Object} AdminStats
 * @property {number} total_users
 * @property {number} total_runs
 * @property {number} completed_runs
 * @property {number} failed_runs
 * @property {number} active_runs
 * @property {number} total_files_migrated
 * @property {number} total_files_failed
 * @property {number} avg_quality_score
 * @property {string} llm_provider
 * @property {string} sandbox_mode
 * @property {string} environment
 */
