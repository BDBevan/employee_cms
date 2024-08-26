

-- This is inserting mock departments
INSERT INTO departments (name) VALUES
('Human Resources'),
('Engineering');

-- This is Inserting mock roles
INSERT INTO roles (title, salary, department_id) VALUES
('HR Manager', 75000, (SELECT id FROM departments WHERE name = 'Human Resources')),
('Software Engineer', 90000, (SELECT id FROM departments WHERE name = 'Engineering'));

-- This is Inserting mock employees
INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES
('Alice', 'Smith', (SELECT id FROM roles WHERE title = 'HR Manager'), NULL),
('Bob', 'Johnson', (SELECT id FROM roles WHERE title = 'Software Engineer'), (SELECT id FROM employees WHERE first_name = 'Alice' AND last_name = 'Smith'));
