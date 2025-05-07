document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário
    const form = document.getElementById('dividaForm');
    const descricaoInput = document.getElementById('descricao');
    const valorInput = document.getElementById('valor');
    const dataInput = document.getElementById('data');
    const pagaInput = document.getElementById('paga');
    
    // Elementos da tabela e resumo
    const corpoTabela = document.getElementById('corpoTabela');
    const totalPendenteSpan = document.getElementById('totalPendente');
    const totalPagoSpan = document.getElementById('totalPago');
    
    // Elementos de filtro
    const filtroMesInput = document.getElementById('filtroMes');
    const btnLimparFiltro = document.getElementById('btnLimparFiltro');
    
    // Array para armazenar as dívidas
    let dividas = JSON.parse(localStorage.getItem('dividas')) || [];
    
    // Inicializa a aplicação
    atualizarTabela();
    atualizarResumo();
    
    // Evento de submit do formulário
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const novaDivida = {
            id: Date.now(), // Usa o timestamp como ID único
            descricao: descricaoInput.value,
            valor: parseFloat(valorInput.value),
            data: dataInput.value,
            paga: pagaInput.value === 'true'
        };
        
        dividas.push(novaDivida);
        salvarDividas();
        atualizarTabela();
        atualizarResumo();
        
        // Limpa o formulário
        form.reset();
    });
    
    // Evento de filtro por mês
    filtroMesInput.addEventListener('change', function() {
        atualizarTabela();
        atualizarResumo();
    });
    
    // Evento para limpar filtro
    btnLimparFiltro.addEventListener('click', function() {
        filtroMesInput.value = '';
        atualizarTabela();
        atualizarResumo();
    });
    
    // Função para atualizar a tabela com as dívidas
    function atualizarTabela() {
        corpoTabela.innerHTML = '';
        
        const mesFiltro = filtroMesInput.value;
        let dividasFiltradas = dividas;
        
        if (mesFiltro) {
            dividasFiltradas = dividas.filter(divida => {
                const dataDivida = new Date(divida.data);
                const anoMesDivida = `${dataDivida.getFullYear()}-${String(dataDivida.getMonth() + 1).padStart(2, '0')}`;
                return anoMesDivida === mesFiltro;
            });
        }
        
        if (dividasFiltradas.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="5" style="text-align: center;">Nenhuma dívida encontrada</td>`;
            corpoTabela.appendChild(tr);
            return;
        }
        
        dividasFiltradas.forEach(divida => {
            const tr = document.createElement('tr');
            
            const dataFormatada = formatarData(divida.data);
            const valorFormatado = divida.valor.toFixed(2).replace('.', ',');
            
            tr.innerHTML = `
                <td>${divida.descricao}</td>
                <td>R$ ${valorFormatado}</td>
                <td>${dataFormatada}</td>
                <td class="${divida.paga ? 'status-paga' : 'status-pendente'}">
                    ${divida.paga ? 'Paga' : 'Pendente'}
                </td>
                <td class="acoes">
                    <button class="pagar" data-id="${divida.id}">
                        ${divida.paga ? 'Desfazer' : 'Pagar'}
                    </button>
                    <button class="excluir" data-id="${divida.id}">Excluir</button>
                </td>
            `;
            
            corpoTabela.appendChild(tr);
        });
        
        // Adiciona eventos aos botões de ação
        document.querySelectorAll('.pagar').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                alternarStatusPagamento(id);
            });
        });
        
        document.querySelectorAll('.excluir').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                excluirDivida(id);
            });
        });
    }
    
    // Função para atualizar o resumo (totais)
    function atualizarResumo() {
        const mesFiltro = filtroMesInput.value;
        let dividasFiltradas = dividas;
        
        if (mesFiltro) {
            dividasFiltradas = dividas.filter(divida => {
                const dataDivida = new Date(divida.data);
                const anoMesDivida = `${dataDivida.getFullYear()}-${String(dataDivida.getMonth() + 1).padStart(2, '0')}`;
                return anoMesDivida === mesFiltro;
            });
        }
        
        const totalPendente = dividasFiltradas
            .filter(d => !d.paga)
            .reduce((total, d) => total + d.valor, 0);
        
        const totalPago = dividasFiltradas
            .filter(d => d.paga)
            .reduce((total, d) => total + d.valor, 0);
        
        totalPendenteSpan.textContent = totalPendente.toFixed(2).replace('.', ',');
        totalPagoSpan.textContent = totalPago.toFixed(2).replace('.', ',');
    }
    
    // Função para alternar o status de pagamento
    function alternarStatusPagamento(id) {
        dividas = dividas.map(divida => {
            if (divida.id === id) {
                return { ...divida, paga: !divida.paga };
            }
            return divida;
        });
        
        salvarDividas();
        atualizarTabela();
        atualizarResumo();
    }
    
    // Função para excluir uma dívida
    function excluirDivida(id) {
        if (confirm('Tem certeza que deseja excluir esta dívida?')) {
            dividas = dividas.filter(divida => divida.id !== id);
            salvarDividas();
            atualizarTabela();
            atualizarResumo();
        }
    }
    
    // Função para salvar as dívidas no localStorage
    function salvarDividas() {
        localStorage.setItem('dividas', JSON.stringify(dividas));
    }
    
    // Função auxiliar para formatar a data
    function formatarData(dataString) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dataString).toLocaleDateString('pt-BR', options);
    }
});