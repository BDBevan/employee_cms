const inquirer = require('inquirer');
const db = require('./db'); // This will be your database utility file
const consoleTable = require('console.table');

async function main() {
    const { action } = await inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update an employee role'
        ]
    });

    switch (action) {
        case 'View all departments':
            await viewDepartments();
            break;
        case 'View all roles':
            await viewRoles();
            break;
        case 'View all employees':
            await viewEmployees();
            break;
        case 'Add a department':
            await addDepartment();
            break;
        case 'Add a role':
            await addRole();
            break;
        case 'Add an employee':
            await addEmployee();
            break;
        case 'Update an employee role':
            await updateEmployeeRole();
            break;
    }
}

async function viewDepartments() {
    const result = await db.query('SELECT * FROM departments');
    console.table(result.rows);
    main();
}

async function viewRoles() {
    const result = await db.query(`
        SELECT roles.id, title, salary, departments.name AS department
        FROM roles
        JOIN departments ON roles.department_id = departments.id
    `);
    console.table(result.rows);
    main();
}

async function viewEmployees() {
    const result = await db.query(`
        SELECT employees.id, first_name, last_name, roles.title AS role,
               departments.name AS department, roles.salary, 
               CONCAT(m.first_name, ' ', m.last_name) AS manager
        FROM employees
        LEFT JOIN roles ON employees.role_id = roles.id
        LEFT JOIN departments ON roles.department_id = departments.id
        LEFT JOIN employees m ON employees.manager_id = m.id
    `);
    console.table(result.rows);
    main();
}

async function addDepartment() {
    const { name } = await inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'Enter the name of the department:'
    });

    await db.query('INSERT INTO departments (name) VALUES ($1)', [name]);
    console.log(`Department ${name} added.`);
    main();
}

async function addRole() {
    const departments = await db.query('SELECT * FROM departments');
    const departmentChoices = departments.rows.map(dept => ({
        name: dept.name,
        value: dept.id
    }));

    const { title, salary, departmentId } = await inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'Enter the title of the role:'
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Enter the salary for the role:',
            validate: value => !isNaN(value) || 'Please enter a valid number.'
        },
        {
            type: 'list',
            name: 'departmentId',
            message: 'Select the department for this role:',
            choices: departmentChoices
        }
    ]);

    await db.query('INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, departmentId]);
    console.log(`Role ${title} added.`);
    main();
}

async function addEmployee() {
    const roles = await db.query('SELECT * FROM roles');
    const roleChoices = roles.rows.map(role => ({
        name: role.title,
        value: role.id
    }));

    const employees = await db.query('SELECT * FROM employees');
    const managerChoices = employees.rows.map(emp => ({
        name: `${emp.first_name} ${emp.last_name}`,
        value: emp.id
    }));
    managerChoices.unshift({ name: 'None', value: null });

    const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: 'Enter the employee’s first name:'
        },
        {
            type: 'input',
            name: 'lastName',
            message: 'Enter the employee’s last name:'
        },
        {
            type: 'list',
            name: 'roleId',
            message: 'Select the role for the employee:',
            choices: roleChoices
        },
        {
            type: 'list',
            name: 'managerId',
            message: 'Select the manager for the employee:',
            choices: managerChoices
        }
    ]);

    await db.query('INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [firstName, lastName, roleId, managerId]);
    console.log(`Employee ${firstName} ${lastName} added.`);
    main();
}

async function updateEmployeeRole() {
    const employees = await db.query('SELECT * FROM employees');
    const employeeChoices = employees.rows.map(emp => ({
        name: `${emp.first_name} ${emp.last_name}`,
        value: emp.id
    }));

    const roles = await db.query('SELECT * FROM roles');
    const roleChoices = roles.rows.map(role => ({
        name: role.title,
        value: role.id
    }));

    const { employeeId, roleId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'employeeId',
            message: 'Select an employee to update:',
            choices: employeeChoices
        },
        {
            type: 'list',
            name: 'roleId',
            message: 'Select the new role for the employee:',
            choices: roleChoices
        }
    ]);

    await db.query('UPDATE employees SET role_id = $1 WHERE id = $2', [roleId, employeeId]);
    console.log('Employee role updated.');
    main();
}

main();
