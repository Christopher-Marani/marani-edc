CREATE TABLE Forms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE FormFields (
    id SERIAL PRIMARY KEY,
    form_id INTEGER REFERENCES Forms(id) ON DELETE CASCADE,
    field_name VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    validation_rules JSONB,
    "order" INTEGER NOT NULL
);

CREATE TABLE FormSubmissions (
    id SERIAL PRIMARY KEY,
    form_id INTEGER REFERENCES Forms(id) ON DELETE CASCADE,
    submitted_by VARCHAR(255) NOT NULL,
    submitted_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50) NOT NULL,
    data JSONB NOT NULL
);