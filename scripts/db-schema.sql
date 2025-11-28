-- Enable UUID extension for robust IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Server table (Discord servers)
CREATE TABLE server (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discord_id VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Supply Set table (groups of supply sources)
CREATE TABLE supply_set (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id UUID NOT NULL REFERENCES server(id) ON DELETE CASCADE,
    channel_id VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    map_image_url TEXT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One set per channel
    UNIQUE(server_id, channel_id)
);

-- Supply source table (bases and tunnels)
CREATE TABLE supply_source (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    set_id UUID NOT NULL REFERENCES supply_set(id) ON DELETE CASCADE,
    number INTEGER NOT NULL,
    consumption_rate INTEGER NOT NULL CHECK (consumption_rate >= 1),
    stockpile_checkpoint INTEGER NOT NULL DEFAULT 0 CHECK (stockpile_checkpoint >= 0 AND stockpile_checkpoint <= 32000),
    checkpoint_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_manual_update TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX supply_source_unique_active_number
ON supply_source(set_id, number) WHERE NOT is_deleted;

-- Delivery table
CREATE TABLE delivery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supply_source_id UUID NOT NULL REFERENCES supply_source(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL CHECK (amount >= 0),
    delivered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivered_by_discord_id VARCHAR(20) NOT NULL,
    delivered_by_username VARCHAR(32) NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Operation log for audit trail
CREATE TABLE operation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    set_id UUID NOT NULL REFERENCES supply_set(id) ON DELETE CASCADE,
    operation_type VARCHAR(50) NOT NULL, -- 'CREATE_SET', 'UPDATE_SOURCE', 'DELIVERY', etc.
    performed_by_discord_id VARCHAR(20) NOT NULL,
    performed_by_username VARCHAR(32) NOT NULL,
    details JSONB NOT NULL,
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX supply_set_server_channel_idx ON supply_set(server_id, channel_id) WHERE NOT is_deleted;
CREATE INDEX supply_source_set_number_idx ON supply_source(set_id, number) WHERE NOT is_deleted;
CREATE INDEX supply_source_checkpoint_time_idx ON supply_source(checkpoint_timestamp) WHERE NOT is_deleted;
CREATE INDEX delivery_source_time_idx ON delivery(supply_source_id, delivered_at) WHERE NOT is_deleted;
CREATE INDEX operation_set_time_idx ON operation(set_id, performed_at);

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_supply_set_updated_at BEFORE UPDATE ON supply_set FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
