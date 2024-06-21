// User class
class User {
    constructor(name, email) {
        this.name = name;
        this.email = email;
    }
}

// UI class: Handle UI tasks
class UI {
    static displayUsers() {
        const users = Store.getUsers();

        users.forEach(user => UI.addUserToList(user));
    }

    static addUserToList(user) {
        const userList = document.getElementById('user-list');

        const userCard = document.createElement('div');
        userCard.classList.add('user-card');
        userCard.innerHTML = `
            <h3>${user.name}</h3>
            <p><strong>Email:</strong> ${user.email}</p>
            <div class="btn-group">
                <button class="btn btn-primary edit">Edit</button>
                <button class="btn btn-danger delete">Delete</button>
            </div>
        `;
        userList.appendChild(userCard);
    }

    static clearFields() {
        document.getElementById('name-input').value = '';
        document.getElementById('email-input').value = '';
    }

    static showAlert(message, className) {
        const div = document.createElement('div');
        div.className = `alert alert-${className}`;
        div.appendChild(document.createTextNode(message));
        const container = document.querySelector('.container');
        const form = document.querySelector('#user-form');
        container.insertBefore(div, form);

        // Remove alert after 3 seconds
        setTimeout(() => document.querySelector('.alert').remove(), 3000);
    }

    static deleteUser(element) {
        if (element.classList.contains('delete')) {
            element.parentElement.parentElement.remove();
            UI.showAlert('User deleted', 'success');
        }
    }

    static fillForm(element) {
        if (element.classList.contains('edit')) {
            const card = element.parentElement.parentElement;
            const name = card.querySelector('h3').textContent;
            const email = card.querySelector('p').textContent.replace('Email: ', '');

            document.getElementById('name-input').value = name;
            document.getElementById('email-input').value = email;

            // Disable add user button during edit
            document.getElementById('add-user-btn').disabled = true;

            // Show update button
            const submitBtn = document.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Update User';
            submitBtn.id = 'update-user-btn';
        }
    }

    static updateUser(user, newName, newEmail) {
        const users = Store.getUsers();
        users.forEach((u, index) => {
            if (u.email === user.email) {
                users[index].name = newName;
                users[index].email = newEmail;
            }
        });
        localStorage.setItem('users', JSON.stringify(users));

        // Clear fields
        UI.clearFields();

        // Reload UI
        UI.clearUserList();
        UI.displayUsers();

        // Show success message
        UI.showAlert('User updated', 'info');

        // Reset form and buttons
        const submitBtn = document.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Add User';
        submitBtn.id = 'add-user-btn';
        document.getElementById('add-user-btn').disabled = false;
    }

    static clearUserList() {
        const userList = document.getElementById('user-list');
        userList.innerHTML = '';
    }
}

// Store class: Handle storage tasks (localStorage)
class Store {
    static getUsers() {
        let users;
        if (localStorage.getItem('users') === null) {
            users = [];
        } else {
            users = JSON.parse(localStorage.getItem('users'));
        }

        return users;
    }

    static addUser(user) {
        const users = Store.getUsers();
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
    }

    static removeUser(email) {
        const users = Store.getUsers();
        users.forEach((user, index) => {
            if (user.email === email) {
                users.splice(index, 1);
            }
        });
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Event: Display users
document.addEventListener('DOMContentLoaded', UI.displayUsers);

// Event: Add a user
document.getElementById('user-form').addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form values
    const name = document.getElementById('name-input').value;
    const email = document.getElementById('email-input').value;

    // Validate
    if (name === '' || email === '') {
        UI.showAlert('Please fill in all fields', 'danger');
    } else {
        // Check if adding or updating
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn.id === 'add-user-btn') {
            // Instantiate user
            const user = new User(name, email);

            // Add user to UI
            UI.addUserToList(user);

            // Add user to localStorage
            Store.addUser(user);

            // Show success message
            UI.showAlert('User added', 'success');
        } else if (submitBtn.id === 'update-user-btn') {
            const originalEmail = document.getElementById('email-input').dataset.originalEmail;
            const userToUpdate = Store.getUsers().find(user => user.email === originalEmail);
            const newName = document.getElementById('name-input').value;
            const newEmail = document.getElementById('email-input').value;

            UI.updateUser(userToUpdate, newName, newEmail);
        }

        // Clear fields
        UI.clearFields();
    }
});

// Event: Remove a user
document.getElementById('user-list').addEventListener('click', (e) => {
    UI.deleteUser(e.target);

    // Remove user from localStorage
    if (e.target.classList.contains('delete')) {
        const email = e.target.parentElement.previousElementSibling.textContent.replace('Email: ', '');
        Store.removeUser(email);
    }

    // Fill form for editing
    if (e.target.classList.contains('edit')) {
        UI.fillForm(e.target);
    }
});

// Event: Cancel edit
document.getElementById('user-form').addEventListener('click', (e) => {
    if (e.target.id === 'add-user-btn') {
        // Reset form and buttons
        const submitBtn = document.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Add User';
        submitBtn.id = 'add-user-btn';
        document.getElementById('add-user-btn').disabled = false;
        UI.clearFields();
    }
});
