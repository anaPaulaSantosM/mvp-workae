document.getElementById('forgot-password-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = '';

    try {
        const response = await fetch('/api/users/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            messageDiv.textContent =
                'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.';
            messageDiv.style.color = 'green';
        } else {
            messageDiv.textContent = data.error || 'Erro ao enviar o e-mail.';
            messageDiv.style.color = 'red';
        }
    } catch (err) {
        console.error('ERRO REAL DO FORGOT PASSWORD');
        console.error(err);
        return res.status(500).json({
            error: 'Erro ao processar solicitação',
            details: err.message
        });
    }

});
