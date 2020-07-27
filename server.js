const mysql = require("mysql");
const inquirer = require("inquirer");
const util = require('util');
// const { createConnection } = require("net");
// const { start } = require("repl");

const con = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "WallyWorld",
    database: "employee_DB"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + con.threadId + "\n");
    start();
});

con.queryPromise = util.promisify(con.query);

function start() {
    inquirer
        .prompt({
            name: "choices",
            type: "list",
            message: "What would you like to do?",
            choices: ["View All Employees", "View All Employees By Department", "View All Employees By Role", "Add Employee", "Add Department", "Add Role", "Update Employee Roles"]
        })
        .then(function(request) {
            if (request.choices === "View All Employess") {
                viewEmployees();
            } else if (request.choices === "View All Employees By Department") {
                viewEmployeesByDpmnt();
            } else if (request.choices === "View All Employees By Role") {
                viewEmployeesByRole();
            } else if (request.choices === "Add Employee") {
                addEmployee();
            } else if (request.choices === "Add Department") {
                addDpmnt();
            } else if (request.choices === "Add Role") {
                addRole();
            } else if (request.choices === "Update Employee") {
                updateEmployee();
            } else {
                con.end();
            }
        });
}

function addDpmnt() {
    inquirer
        .prompt({
            name: "addDpmnt",
            type: "input",
            message: "Please enter a department name:",
        })
        .then(function(answer) {
            con.queryPromise("INSERT INTO department (name) VALUES (\"" + answer.addDpmnt + "\");");
            start();
        })
}

function addRole() {


    // ask for the title, role, and department
    // list existing departments
    // as choices

    // pull from the departments first
    con.queryPromise('SELECT * FROM department')
        .then(function(departments) {
            departments = departments.map(function(department) {
                return {
                    name: department.name,
                    value: department.id,
                }
            });

            return inquirer
                .prompt([
                    {
                        name: "title",
                        type: "input",
                        message: "Please enter the title:",
                    },
                    {
                        name: "salary",
                        type: "input",
                        message: "Please enter a salary:",
                    },
                    {
                        name: 'dept_id',
                        type: 'list',
                        message: 'Select a department:',
                        choices: departments
                    }
                ])
        })
        .then(function(answers) {
            console.log(answers.dept_id);
            con.query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?);', [answers.title, answers.salary, answers.dept_id]);
            start();
        })  
}
    function addEmployee() {

        // pull the data from the roles table
        // pull the data from the employees table
        // push a None option to the employees array
        // inquirer.prompt
        // create employee 

    con.queryPromise('SELECT * FROM employee')
        .then(function(employees) {
            console.log(employees);
            con.queryPromise('SELECT * FROM role')
                .then(function(roles) {
                    employees = employees.map(function(employee) {
                        return {
                            value: employee.id,
                            name: employee.first_name + ' ' + employee.last_name,
                        }
                    });
        
                    employees.push({ value: 'none', name: 'None' })
        
                    roles = roles.map(function(role) {
                        return {
                            name: role.title,
                            value: role.id,
                        }
                    })
    
                    return inquirer.prompt([
                        {
                            name: 'first_name',
                            message: "What is the FIRST NAME of the Employee?",
                            type: 'input'
                        },
                        {
                            name: 'last_name',
                            message: "What is the LAST NAME of the Employee?",
                            type: 'input'
                        },
                        {
                            name: 'manager_id',
                            message: 'Who is the MANAGER of the Employee?: ',
                            type: 'list',
                            choices: employees
                        },
                        {
                            name: 'role_id',
                            message: 'What is the ROLE of the Employee?: ',
                            type: 'list',
                            choices: roles
                        }
                    ])
                })
                .then(function(answers) {
                    console.log(answers);
                    if (answers.manager_id === 'none') {
                        // insert employee without manager id
                        con.query('INSERT INTO employee (first_name, last_name, role_id) VALUES (?, ?, ?);', [answers.first_name, answers.last_name, answers.role_id], function(err, res) {
                            if (err) {
                                console.log(err);
                            }
                            
                        });

                    start();
                    } else {
                        // insert employee with manager_id
                        con.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?);', [answers.first_name, answers.last_name, answers.role_id, manager_id]);
                    start();
                    }
                    // save employee in the database
                    con.end();
                })
        })
    }

    function updateEmployee() {
        con.queryPromise('SELECT * FROM employee')
        .then(function(employees) {
            con.queryPromise('SELECT * FROM first_name' + ' ' + 'last_name')
                .then(function(update) {
                    employees = employees.map(function(employee) {
                        return {
                            value: employee.id,
                            name: employee.first_name + ' ' + employee.last_name,
                        }
                    });
        
                    employees.push({ value: 'none', name: 'None' })
        
                    update = update.map(function(role) {
                        return {
                            name: role.title,
                            value: role.id,
                        }
                    })
    
                    return inquirer.prompt([
                        {
                            name: 'update',
                            message: "Choose the Employee you want to UPDATE?",
                            type: 'list',
                            choices: employees
                        },
                        {
                            name: 'new_firstName',
                            message: 'New role: ',
                            type: 'list',
                            choices: employees.first_name
                        },
                        {
                            name: 'new_lastName',
                            message: 'New role: ',
                            type: 'list',
                            choices: employees.last_name
                        },
                        {
                            name: 'new_manager',
                            message: 'Manager: ',
                            type: 'list',
                            choices: employees
                        },
                        {
                            name: 'new_role',
                            message: 'Choose the NEW ROLE: ',
                            type: 'list',
                            choices: roles
                        }
                    ])
                })
                .then(function(answers) {
                    if (answers.manager_id === 'none') {
                        // insert employee without manager id
                        con.query('UPDATE movies SET movie = ? WHERE id = ?) VALUES (?, ?, ?);', [answers.first_name, answers.last_name, answers.role_id]);
                    start();
                    } else {
                        // insert employee with manager_id
                        con.query('UPDATE movies SET movie = ? WHERE id = ?) VALUES (?, ?, ?, ?);', [answers.first_name, answers.last_name, answers.role_id, manager_id]);
                    start();
                    }
                    // save employee in the database
                    con.end();
                });
        });
    }

function viewEmployees() {
    con.query('SELECT * FROM employee', function(err, rows, fields) {
        if (err) throw err;
        console.log(rows);

                employees = employees.map(function(employee) {
                    return {
                        value: employee.id,
                        name: employee.first_name + ' ' + employee.last_name,
                    }
                });
                start();
        });
        con.end();
    }
