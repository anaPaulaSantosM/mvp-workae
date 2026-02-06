document.getElementById('editarPerfilForm').addEventListener('submit', async function (e) {
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
    // Corrigir múltiplos idiomas
    const idiomasSelect = document.getElementById('idiomas');
    if (idiomasSelect) {
        const idiomasSelecionados = Array.from(idiomasSelect.selectedOptions).map(opt => opt.value).join(',');
        formData.set('idiomas', idiomasSelecionados);
    }
    // Limpar campo de foto após envio
    const fotoInput = document.getElementById('foto');
    if (fotoInput) fotoInput.value = '';

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

// Preencher formulário com dados atuais do perfil
window.addEventListener('DOMContentLoaded', async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
        window.location.href = 'login.html';
        return;
    }
    try {
        const res = await fetch(`/api/users/perfil/${userId}`);
        if (res.ok) {
            const perfil = await res.json();
            document.getElementById('nome').value = perfil.nome || '';
            document.getElementById('idade').value = perfil.idade || '';
            document.getElementById('cidade').value = perfil.cidade || '';
            document.getElementById('estado').value = perfil.estado || '';
            document.getElementById('formacao').value = perfil.formacao || '';
            document.getElementById('idiomas').value = perfil.idiomas || '';
            document.getElementById('telefone').value = perfil.telefone || '';
            document.getElementById('cursos-extras').value = perfil['cursos_extras'] || '';
            document.getElementById('projetos').value = perfil.projetos || '';
            document.getElementById('hobbies').value = perfil.hobbies || '';
            document.getElementById('erro-aprendizado').value = perfil['erro_aprendizado'] || '';
            document.getElementById('nao-sabe').value = perfil['nao_sabe'] || '';
            document.getElementById('superacao').value = perfil.superacao || '';
            document.getElementById('inspiracao').value = perfil.inspiracao || '';
            document.getElementById('motivacao').value = perfil.motivacao || '';
            document.getElementById('musica').value = perfil.musica || '';
            document.getElementById('lugar').value = perfil.lugar_sonho || '';
            document.getElementById('porque-contratar').value = perfil.porque_contratar || '';
            document.getElementById('data-contratacao').value = perfil.data_contratacao || '';
        }
    } catch (err) {
        alert('Erro ao carregar dados do perfil.');
    }
});

function cancelarEdicao() {
    window.location.href = 'visualizar-perfil-candidato.html';
}
