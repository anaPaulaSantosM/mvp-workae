document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('resetPasswordForm');
    const messageDiv = document.getElementById('resetMessage');

    // Pega o token da URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            messageDiv.textContent = 'As senhas não coincidem.';
            messageDiv.style.color = 'red';
            return;
        }

        try {
            const response = await fetch('/api/users/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, newPassword }),
            });
            const data = await response.json();
            if (response.ok) {
                messageDiv.textContent = 'Senha redefinida com sucesso!';
                messageDiv.style.color = 'green';
                form.reset();
            } else {
                messageDiv.textContent = data.message || 'Erro ao redefinir senha.';
                messageDiv.style.color = 'red';
            }
        } catch (error) {
            messageDiv.textContent = 'Erro ao conectar ao servidor.';
            messageDiv.style.color = 'red';
        }
    });
});
