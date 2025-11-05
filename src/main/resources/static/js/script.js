document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.accessToken) {
                    localStorage.setItem('token', data.accessToken);
                    window.location.href = '/tasks.html';
                } else {
                    alert(data.message || 'Falha no login!');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Erro durante o Login.');
            });
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const username = document.getElementById('register-username').value;
            const password = document.getElementById('register-password').value;

            fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message || 'Registrado com sucesso!');
                if (data.message === "Usuario registrado com sucesso!"){
                    const loginTab = new bootstrap.Tab(document.getElementById('login-tab'));
                    loginTab.show();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Erro durante o registro');
            });
        });
    }
});
