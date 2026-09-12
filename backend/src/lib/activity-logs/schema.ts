export const ACTIVITY_LOG_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  kind VARCHAR(8) NOT NULL,
  request_id VARCHAR(64),
  duration_ms INTEGER,
  truncated BOOLEAN NOT NULL DEFAULT FALSE,
  method VARCHAR(10),
  path TEXT,
  status_code INTEGER,
  user_id VARCHAR(64),
  role VARCHAR(32),
  remote_addr VARCHAR(45),
  user_agent TEXT,
  request JSONB,
  response JSONB,
  queue VARCHAR(128),
  job_name VARCHAR(128),
  job_id VARCHAR(128),
  job_status VARCHAR(16),
  payload JSONB,
  error TEXT,
  PRIMARY KEY (id, timestamp)
);
`;

export const ACTIVITY_LOG_INDEX_SQL = [
  `CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp ON activity_log (timestamp DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_activity_log_kind_timestamp ON activity_log (kind, timestamp DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_activity_log_status_timestamp ON activity_log (status_code, timestamp DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_activity_log_user_timestamp ON activity_log (user_id, timestamp DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_activity_log_queue_timestamp ON activity_log (queue, timestamp DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_activity_log_job_name_timestamp ON activity_log (job_name, timestamp DESC)`,
] as const;
