SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'n8n_db_user', :'n8n_db_password')
WHERE NOT EXISTS (
  SELECT 1 FROM pg_roles WHERE rolname = :'n8n_db_user'
)
\gexec

SELECT format('ALTER ROLE %I WITH LOGIN PASSWORD %L', :'n8n_db_user', :'n8n_db_password')
\gexec

SELECT format('CREATE DATABASE %I OWNER %I', :'n8n_db_name', :'n8n_db_user')
WHERE NOT EXISTS (
  SELECT 1 FROM pg_database WHERE datname = :'n8n_db_name'
)
\gexec

SELECT format('ALTER DATABASE %I OWNER TO %I', :'n8n_db_name', :'n8n_db_user')
\gexec
