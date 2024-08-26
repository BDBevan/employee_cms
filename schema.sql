-- schema.sql
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    salary DECIMAL NOT NULL,
    department_id INTEGER REFERENCES departments(id)
);

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    manager_id INTEGER REFERENCES employees(id)
);
