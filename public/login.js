// URL base do backend para Vercel (API serverless)
const API_URL = 'http://localhost:3334/api/users';

document.getElementById('loginForm').addEventListener('submit', async function (e) {
	e.preventDefault();
	const email = document.getElementById('username').value;
	const password = document.getElementById('password').value;
	try {
		const res = await fetch(`${API_URL}/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password })
		});
		const data = await res.json();
		if (res.ok) {
			localStorage.setItem('token', data.token);
			localStorage.setItem('user_id', data.user.id);
			// Verifica se o usuário já tem perfil cadastrado
			try {
				const perfilRes = await fetch(`${API_URL}/perfil/${data.user.id}`);
				if (perfilRes.ok) {
					window.location.href = './visualizar-perfil-candidato.html';
				} else {
					window.location.href = './cadastrar-perfil-candidato.html';
				}
			} catch (err) {
				window.location.href = './cadastrar-perfil-candidato.html';
			}
		} else {
			alert(data.error || 'Erro ao fazer login.');
		}
	} catch (err) {
		alert('Erro de conexão com o servidor.');
	}
});
