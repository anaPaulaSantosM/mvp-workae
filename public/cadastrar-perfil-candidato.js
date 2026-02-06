const API_URL = '/api/users';

document.getElementById('cadastroForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const user_id = localStorage.getItem('user_id');
    if (!user_id) {
        alert('Usuário não autenticado. Faça login novamente.');
        window.location.href = '/frontend/login.html';
        return;
    }

    const form = e.target;
    const formData = new FormData(form);
    formData.append('user_id', user_id);

    // Corrigir idiomas para múltipla seleção
    const idiomasSelect = document.getElementById('idiomas');
    if (idiomasSelect) {
        const idiomasSelecionados = Array.from(idiomasSelect.selectedOptions).map(opt => opt.value).join(',');
        formData.set('idiomas', idiomasSelecionados);
    }

    try {
        const res = await fetch('/api/users/cadastrar-perfil-candidato', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (res.ok) {
            alert('Perfil salvo com sucesso!');
            window.location.href = 'visualizar-perfil-candidato.html';
        } else {
            alert(data.error || 'Erro ao salvar perfil.');
        }
    } catch (err) {
        alert('Erro de conexão com o servidor.');
    }
});
