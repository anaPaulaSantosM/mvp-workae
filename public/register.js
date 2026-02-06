const API_URL = 'http://localhost:3334/api/users';

document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');

    try {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            messageDiv.textContent = 'Conta criada com sucesso! Você será redirecionado para o login.';
            messageDiv.style.color = 'green';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            messageDiv.textContent = data.error || 'Erro ao criar conta.';
            messageDiv.style.color = 'red';
        }
    } catch (err) {
        messageDiv.textContent = 'Erro de conexão com o servidor.';
        messageDiv.style.color = 'red';
    }
});
