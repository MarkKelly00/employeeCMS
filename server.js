const mysql = require("mysql");
const inquirer = require("inquirer");
const util = require("util");
// const { createConnection } = require("net");
// const { start } = require("repl");

const con = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "WallyWorld",
    database: "employee_DB",
});

con.connect(function (err) {
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
        choices: [
            "View All Employees",
            "View Departments",
            "View Roles",
            "Add Employee",
            "Add Department",
            "Add Role",
            "Update Employee Roles",
            "Remove Employee",
            "Remove Department",
            "Remove Role"
        ],
    })
    .then(function (request) {
        if (request.choices === "View All Employees") {
            viewEmployees();
        } else if (request.choices === "View Departments") {
            viewDpmnt();
        } else if (request.choices === "View Roles") {
            viewRoles();
        } else if (request.choices === "Add Employee") {
            addEmployee();
        } else if (request.choices === "Add Department") {
            addDpmnt();
        } else if (request.choices === "Add Role") {
            addRole();
        } else if (request.choices === "Update Employee Roles") {
            updateEmployee();
        } else if (request.choices === "Remove Employee") {
            removeEmployee();
        } else if (request.choices === "Remove Department") {
            removeDepartment();
        } else if (request.choices === "Remove Role") {
            removeRole();
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
    .then(function (answer) {
        con.queryPromise(
        'INSERT INTO department (name) VALUES ("' + answer.addDpmnt + '");'
    );
    start();
    });
}

function addRole() {
  // ask for the title, role, and department
  // list existing departments
  // as choices

  // pull from the departments first
  con.queryPromise("SELECT * FROM department")
    .then(function (departments) {
        departments = departments.map(function (department) {
        return {
            name: department.name,
            value: department.id,
        };
    });

    return inquirer.prompt([
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
            name: "dept_id",
            type: "list",
            message: "Select a department:",
            choices: departments,
        },
    ]);
    })
    .then(function (answers) {
        console.log(answers.dept_id);
        con.query(
        "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?);",
        [answers.title, answers.salary, answers.dept_id]
        );
        start();
    });
}
function addEmployee() {
  con.queryPromise("SELECT * FROM employee").then(function (employees) {
    console.log(employees);
    con.queryPromise("SELECT * FROM role")
        .then(function (roles) {
        employees = employees.map(function (employee) {
            return {
            value: employee.id,
            name: employee.first_name + " " + employee.last_name,
            };
        });

        employees.push({ value: "none", name: "None" });

        roles = roles.map(function (role) {
            return {
            name: role.title,
            value: role.id,
            };
        });

        return inquirer.prompt([
        {
            name: "first_name",
            message: "What is the FIRST NAME of the Employee?",
            type: "input",
        },
        {
            name: "last_name",
            message: "What is the LAST NAME of the Employee?",
            type: "input",
        },
        {
            name: "manager_id",
            message: "Who is the MANAGER of the Employee?: ",
            type: "list",
            choices: employees,
        },
        {
            name: "role_id",
            message: "What is the ROLE of the Employee?: ",
            type: "list",
            choices: roles,
        },
        ]);
    })
        .then(function (answers) {
        console.log(answers);
        if (answers.manager_id === "none") {
          // insert employee without manager id
            con.query(
            "INSERT INTO employee (first_name, last_name, role_id) VALUES (?, ?, ?);",
            [answers.first_name, answers.last_name, answers.role_id],
            function (err, res) {
                if (err) {
                console.log(err);
            }
            }
        );
        start();
        } else {
          // insert employee with manager_id
        con.query(
            "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?);",
            [answers.first_name, answers.last_name, answers.role_id, manager_id]
        );
        start();
        }
    });
});
}

function updateEmployee() {
  con.queryPromise("SELECT * FROM employee").then(function (employees) {
    con.queryPromise("SELECT * FROM role")
      .then(function (roles) {
        employees = employees.map(function (employee) {
            return {
            value: employee.id,
            name: employee.first_name + " " + employee.last_name,
            };
        });

        roles = roles.map(function (role) {
            return {
            name: role.title,
            value: role.id,
            };
        });

        return inquirer.prompt([
        {
            name: "employee",
            message: "Choose the Employee you want to UPDATE?",
            type: "list",
            choices: employees,
        },
        {
            name: "new_role",
            message: "Choose the NEW ROLE: ",
            type: "list",
            choices: roles,
        },
        ]);
        })
        .then(function (answers) {
        con.query("UPDATE employee SET role_id = ? WHERE id = ?", [
            answers.new_role,
            answers.employee,
        ]);
        start();
    });
});
}

function viewEmployees() {
  con.queryPromise("SELECT * FROM employee_db.employee")
    .then(function (employees) {
      con.queryPromise("SELECT * FROM role").then(function (roles) {
        employees = employees.map(function (employee) {
        let role = roles.find(function (role) {
            if (role.id === employee.role_id) {
            return true;
            }
        return false;
        });
        return {
            id: employee.id,
            first_name: employee.first_name,
            last_name: employee.last_name,
            title: role.title,
            manager: employee.manager_id,
        };
        });
        console.table(employees);
        start();
        // go through all of the employees (map)
        // in the map function, check if the role id is in the roles array
        // return the title and the rest of the employee info
        // display the employees on the screen
    });
    });
}

function viewDpmnt() {
  con.queryPromise("SELECT * FROM department").then(function (department) {
    console.table(department);
    start();
});
}

function viewRoles() {
  con.queryPromise("SELECT * FROM role").then(function (roles) {
    con.queryPromise("SELECT * FROM department").then(function (departments) {
        roles = roles.map(function (role) {
        let department = departments.find(function (department) {
            if (department.id === role.department_id) {
            return true;
        }
        return false;
        });
        return {
            id: role.id,
            title: role.title,
            department: department.name,
            salary: role.salary,
        };
    });
        console.table(roles);
        start();
    });
});
}

function removeEmployee() {
    con.queryPromise("SELECT * FROM employee").then(function (employees) {
        con.queryPromise("SELECT * FROM role")
        .then(function (employee) {
            employee = employees.map(function (employee) {
            return {
                value: employee.id,
                name: employee.first_name + " " + employee.last_name,
            };
        });
    inquirer
    .prompt({
        name: "remove",
        type: "list",
        message: "Which Employee would you like to REMOVE:",
        choices: employee
    })
    .then(function (answer) {
        con.queryPromise('DELETE FROM employee WHERE id = ?', [answer.remove]);
        start();
    });
})
    });
}

function removeDepartment() {
    con.queryPromise("SELECT * FROM department").then(function (departments) {
        con.queryPromise("SELECT * FROM employee")
        .then(function(department) {
            department = departments.map(function (department) {
            return {
                id: department.id,
                name: department.name,
            };
        });
    inquirer
    .prompt({
        name: "remove",
        type: "list",
        message: "Which Department would you like to REMOVE:",
        choices: department
    })
    .then(function (answer) {
        con.queryPromise('DELETE FROM department WHERE name = ?', [answer.remove]);
        start();
    });
    })
});
}

function removeRole() {
        con.queryPromise("SELECT * FROM role")
        .then(function(role) {
            console.table(role);
            role = roles.map(function (role) {
            return {
                id: role.id,
                title: role.title,
                salary: role.salary,
                department: role.department_id
            };
        });
    inquirer
    .prompt({
        name: "remove",
        type: "list",
        message: "Which ROLE would you like to REMOVE:",
        choices: role
    })
    .then(function (answer) {
        con.queryPromise('DELETE FROM role WHERE title = ?', [answer.remove]);
        start();
    });
    });
};

