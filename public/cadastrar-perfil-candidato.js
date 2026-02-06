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

// Preencher estados ao carregar a página
document.addEventListener('DOMContentLoaded', async function () {
    const estadoSelect = document.getElementById('estado');
    const cidadeSelect = document.getElementById('cidade');
    if (!estadoSelect || !cidadeSelect) return;

    // Buscar estados do IBGE
    try {
        const res = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
        const estados = await res.json();
        // Ordenar por nome
        estados.sort((a, b) => a.nome.localeCompare(b.nome));
        estados.forEach(estado => {
            const option = document.createElement('option');
            option.value = estado.sigla;
            option.textContent = estado.nome;
            estadoSelect.appendChild(option);
        });
    } catch (err) {
        console.error('Erro ao carregar estados do IBGE', err);
    }

    // Ao selecionar estado, buscar cidades
    estadoSelect.addEventListener('change', async function () {
        const sigla = estadoSelect.value;
        cidadeSelect.innerHTML = '<option value="">Carregando cidades...</option>';
        if (!sigla) {
            cidadeSelect.innerHTML = '<option value="">Selecione o estado primeiro</option>';
            return;
        }
        try {
            const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${sigla}/municipios`);
            const cidades = await res.json();
            cidadeSelect.innerHTML = '<option value="">Selecione a cidade</option>';
            cidades.forEach(cidade => {
                const option = document.createElement('option');
                option.value = cidade.nome;
                option.textContent = cidade.nome;
                cidadeSelect.appendChild(option);
            });
        } catch (err) {
            cidadeSelect.innerHTML = '<option value="">Erro ao carregar cidades</option>';
        }
    });
});
