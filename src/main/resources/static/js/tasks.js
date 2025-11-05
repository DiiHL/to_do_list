document.addEventListener("DOMContentLoaded", () => {
    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/index.html';
            return {};
        }
        return { 'Authorization': `Bearer ${token}` };
    };

    const initialToken = localStorage.getItem('token');
    if (!initialToken) {
        window.location.href = '/index.html';
        return;
    }

    const parseJwt = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            localStorage.removeItem('token');
            window.location.href = '/index.html';
            return null;
        }
    };

    let decodedToken = parseJwt(initialToken);
    if (!decodedToken) return;

    let currentUsername = decodedToken.sub;

    // --- DOM Elements ---
    const taskForm = document.getElementById('task-form');
    const taskNameInput = document.getElementById('task-name');
    const taskDescriptionInput = document.getElementById('task-description');
    const taskListDiv = document.getElementById('task-list');
    const logoutBtn = document.getElementById('logout-btn');
    const profileModal = document.getElementById('profileModal');
    const profileUsernameDisplay = document.getElementById('profile-username-display');
    const updateProfileBtn = document.getElementById('update-profile-btn');
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const newUsernameInput = document.getElementById('new-username');
    const newPasswordInput = document.getElementById('new-password');

    // --- Helper Functions ---
    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // --- API Call Functions ---
    const fetchTasks = async () => {
        try {
            const response = await fetch('/api/tasks', {
                headers: getAuthHeader()
            });
            if (response.status === 401) {
                logoutBtn.click();
                return;
            }
            if (!response.ok) throw new Error('Falha ao buscar tarefas');
            const tasks = await response.json();
            renderTasks(tasks);
        } catch (error) {
            console.error('Erro ao buscar tarefas:', error);
            taskListDiv.innerHTML = `<div class="alert alert-danger">Falha ao carregar as tarefas.</div>`;
        }
    };

    const toggleTaskCompletion = (id, isCompleted) => {
        fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({ completed: !isCompleted })
        }).then(fetchTasks);
    };

    const handleUpdate = (id, name, description, completed) => {
        fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({ name, description, completed })
        }).then(fetchTasks);
    };

    const deleteTask = (id) => {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            fetch(`/api/tasks/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            }).then(fetchTasks);
        }
    };
    
    // --- Profile Update and Deletion ---
    const handleProfileUpdate = async () => {
        const newUsername = newUsernameInput.value.trim();
        const newPassword = newPasswordInput.value.trim();

        if (!newUsername && !newPassword) {
            alert('Forneça um novo nome de usuário ou uma nova senha.');
            return;
        }

        const payload = {};
        if (newUsername) payload.username = newUsername;
        if (newPassword) payload.password = newPassword;

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Falha ao atualizar perfil.');
            }

            alert(result.message);

            // If username was changed, we need to re-authenticate to get a new token
            if (newUsername) {
                alert('Seu nome de usuário foi alterado. Por favor, faça login novamente.');
                logoutBtn.click();
            } else {
                // Close modal on successful password change
                 var modal = bootstrap.Modal.getInstance(profileModal);
                 modal.hide();
            }

        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    };

    const handleAccountDelete = async () => {
        if (!confirm('ATENÇÃO: Esta ação é irreversível e excluirá sua conta e todas as suas tarefas. Deseja continuar?')) {
            return;
        }

        try {
            const response = await fetch('/api/user/profile', {
                method: 'DELETE',
                headers: getAuthHeader()
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Falha ao excluir a conta.');
            }

            alert(result.message);
            logoutBtn.click();

        } catch (error) {
            alert(`Erro: ${error.message}`);
        }
    };


    // --- UI Rendering ---
    const renderTasks = (tasks) => {
        taskListDiv.innerHTML = '';
        if (tasks.length === 0) {
            taskListDiv.innerHTML = `<div class="text-center text-white-50"><p>Nenhuma tarefa ainda. Adicione uma acima!</p></div>`;
            return;
        }
        tasks.forEach(task => {
            const card = document.createElement('div');
            card.className = `card shadow-sm mb-3 ${task.completed ? 'task-completed' : ''}`;
            card.setAttribute('data-id', task.id);
            card.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title ${task.completed ? 'text-decoration-line-through' : ''}">${task.name}</h5>
                    <p class="card-text text-muted">${task.description || 'Sem descrição'}</p>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <div>
                             <span class="badge ${task.completed ? 'bg-success' : 'bg-warning'}">${task.completed ? 'Completa' : 'Em Andamento'}</span>
                             <small class="text-white-50 ms-2">Criado em: ${formatDateTime(task.createdAt)}</small>
                        </div>
                        <div class="btn-group">
                            <button class="btn btn-sm ${task.completed ? 'btn-secondary' : 'btn-success'} toggle-btn">${task.completed ? 'Refazer' : 'Completar'}</button>
                            <button class="btn btn-sm btn-primary update-btn">Atualizar</button>
                            <button class="btn btn-sm btn-danger delete-btn">Excluir</button>
                        </div>
                    </div>
                </div>
            `;
            taskListDiv.appendChild(card);
        });
    };

    // --- Event Listeners ---

    // Task actions
    taskListDiv.addEventListener('click', (event) => {
        const target = event.target;
        const card = target.closest('.card');
        if (!card) return;
        const taskId = card.dataset.id;
        if (target.matches('.toggle-btn')) {
            toggleTaskCompletion(taskId, card.classList.contains('task-completed'));
        }
        if (target.matches('.delete-btn')) {
            deleteTask(taskId);
        }
        if (target.matches('.update-btn')) {
            const currentName = card.querySelector('.card-title').innerText;
            const currentDesc = card.querySelector('.card-text').innerText;
            const isCompleted = card.classList.contains('task-completed');
            const newName = prompt('Atualize o nome da tarefa:', currentName);
            if (newName !== null) {
                const newDescription = prompt('Atualize a descrição da tarefa:', currentDesc === 'Sem descrição' ? '' : currentDesc);
                if (newDescription !== null) {
                    handleUpdate(taskId, newName, newDescription, isCompleted);
                }
            }
        }
    });

    // Add new task
    taskForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = taskNameInput.value.trim();
        const description = taskDescriptionInput.value.trim();
        if (!name) return alert('O nome da tarefa é obrigatório.');
        fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({ name, description })
        }).then(() => {
            taskForm.reset();
            fetchTasks();
        });
    });

    // Profile Modal
    profileModal.addEventListener('show.bs.modal', () => {
        if(profileUsernameDisplay) {
            profileUsernameDisplay.textContent = currentUsername;
        }
        // Clear form fields when modal is opened
        newUsernameInput.value = '';
        newPasswordInput.value = '';
    });

    if (updateProfileBtn) {
        updateProfileBtn.addEventListener('click', handleProfileUpdate);
    }

    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', handleAccountDelete);
    }

    // Logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/index.html';
    });

    // --- Initial Load ---
    fetchTasks();
});
