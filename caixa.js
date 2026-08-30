const STORAGE_KEY = 'app-adega-pro';

const produtosPadrao = [
  { codigo: '001', nome: 'Cerveja', marca: 'Skol', preco: 8.5, estoque: 24, categoria: 'Bebidas' },
  { codigo: '002', nome: 'Vinho Tinto', marca: 'Casa Silva', preco: 24.9, estoque: 16, categoria: 'Vinhos' },
  { codigo: '003', nome: 'Espumante', marca: 'Brahma', preco: 29.9, estoque: 12, categoria: 'Vinhos' },
  { codigo: '004', nome: 'Água', marca: 'Crystal', preco: 5.0, estoque: 30, categoria: 'Bebidas' },
  { codigo: '005', nome: 'Refrigerante', marca: 'Coca-Cola', preco: 7.5, estoque: 20, categoria: 'Bebidas' },
  { codigo: '006', nome: 'Amendoim', marca: 'Mãe Terra', preco: 6.0, estoque: 18, categoria: 'Petiscos' },
  { codigo: '007', nome: 'Cachaça', marca: 'Ypióca', preco: 18.0, estoque: 10, categoria: 'Bebidas' },
  { codigo: '008', nome: 'Queijo', marca: 'Tradição', preco: 16.5, estoque: 9, categoria: 'Petiscos' }
];

const clientesPadrao = [
  { id: 1, nome: 'Cliente Final', telefone: '(00) 00000-0000', tipo: 'avulso' },
  { id: 2, nome: 'José da Silva', telefone: '(11) 98888-1234', tipo: 'frequente' },
  { id: 3, nome: 'Maria Souza', telefone: '(11) 97777-4321', tipo: 'frequente' }
];

const estadoInicial = {
  paginaAtual: 'vendas',
  filtroProdutos: '',
  produtos: produtosPadrao,
  clientes: clientesPadrao,
  carrinho: [],
  caixa: 0,
  vendas: [],
  ultimaMensagem: { tipo: '', texto: '' }
};

let estado = carregarEstado();

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(valor || 0));
}

function carregarEstado() {
  const base = JSON.parse(JSON.stringify(estadoInicial));
  if (typeof localStorage === 'undefined') return base;

  const salvo = localStorage.getItem(STORAGE_KEY);
  if (!salvo) return base;

  try {
    const dados = JSON.parse(salvo);
    return {
      ...base,
      ...dados,
      produtos: dados.produtos || base.produtos,
      clientes: dados.clientes || base.clientes,
      carrinho: dados.carrinho || [],
      caixa: Number(dados.caixa || 0),
      vendas: dados.vendas || [],
      ultimaMensagem: dados.ultimaMensagem || { tipo: '', texto: '' }
    };
  } catch (error) {
    return base;
  }
}

function salvarEstado() {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  }
}

function atualizarMensagem(tipo, texto) {
  estado.ultimaMensagem = { tipo, texto };
  salvarEstado();
}

function pegarProduto(codigo) {
  return estado.produtos.find((item) => item.codigo === codigo);
}

function pegarCliente(id) {
  const numeroId = Number(id);
  return estado.clientes.find((cliente) => cliente.id === numeroId);
}

function calcularTotalCarrinho() {
  return estado.carrinho.reduce((total, item) => total + item.preco * item.quantidade, 0);
}

function totalVendido() {
  return estado.vendas.reduce((total, venda) => total + Number(venda.total || 0), 0);
}

function itensVendidos() {
  return estado.vendas.reduce((total, venda) => total + venda.itens.reduce((sum, item) => sum + Number(item.quantidade || 0), 0), 0);
}

function produtosBaixos() {
  return estado.produtos.filter((produto) => produto.estoque <= 5).length;
}

function produtosFiltrados() {
  const filtro = (estado.filtroProdutos || '').trim().toLowerCase();
  if (!filtro) return estado.produtos;

  return estado.produtos.filter((produto) => {
    const texto = `${produto.codigo} ${produto.nome} ${produto.marca || ''} ${produto.categoria}`.toLowerCase();
    return texto.includes(filtro);
  });
}

function adicionarProdutoPorCodigo(codigo) {
  const codigoLimpo = String(codigo || '').trim();
  if (!codigoLimpo) {
    atualizarMensagem('erro', 'Digite ou escaneie um código de barras.');
    renderizarApp();
    return { ok: false };
  }

  const produto = estado.produtos.find((item) => item.codigo.toString().trim() === codigoLimpo);
  if (!produto) {
    atualizarMensagem('erro', `Produto com código ${codigoLimpo} não encontrado.`);
    renderizarApp();
    return { ok: false };
  }

  return adicionarProdutoCarrinho(produto.codigo, 1);
}

function adicionarProdutoCarrinho(codigo, quantidade = 1) {
  const produto = pegarProduto(codigo);
  if (!produto) {
    atualizarMensagem('erro', 'Produto não encontrado.');
    renderizarApp();
    return { ok: false };
  }

  const itemNoCarrinho = estado.carrinho.find((item) => item.codigo === codigo);
  const jaNoCarrinho = itemNoCarrinho ? itemNoCarrinho.quantidade : 0;

  if (produto.estoque - jaNoCarrinho < quantidade) {
    atualizarMensagem('erro', `Estoque insuficiente para ${produto.nome}.`);
    renderizarApp();
    return { ok: false };
  }

  if (itemNoCarrinho) {
    itemNoCarrinho.quantidade += quantidade;
  } else {
    estado.carrinho.push({ ...produto, quantidade });
  }

  atualizarMensagem('sucesso', `${produto.nome} adicionado ao carrinho.`);
  renderizarApp();
  return { ok: true };
}

function ajustarQuantidadeCarrinho(codigo, diferenca) {
  const item = estado.carrinho.find((produto) => produto.codigo === codigo);
  if (!item) return;

  const produtoOriginal = pegarProduto(codigo);
  const quantidadeNova = item.quantidade + diferenca;

  if (quantidadeNova <= 0) {
    removerProdutoCarrinho(codigo);
    return;
  }

  if (quantidadeNova > produtoOriginal.estoque) {
    atualizarMensagem('erro', `Não há estoque suficiente para ${produtoOriginal.nome}.`);
    renderizarApp();
    return;
  }

  item.quantidade = quantidadeNova;
  atualizarMensagem('sucesso', 'Quantidade atualizada.');
  renderizarApp();
}

function removerProdutoCarrinho(codigo) {
  estado.carrinho = estado.carrinho.filter((item) => item.codigo !== codigo);
  atualizarMensagem('sucesso', 'Produto removido do carrinho.');
  renderizarApp();
}

function limparCarrinho() {
  estado.carrinho = [];
  atualizarMensagem('sucesso', 'Carrinho limpo.');
  renderizarApp();
}

function finalizarCompra(valorRecebido, clienteId = 1, formaPagamento = 'dinheiro') {
  if (!estado.carrinho.length) {
    atualizarMensagem('erro', 'Adicione itens antes de finalizar a venda.');
    renderizarApp();
    return { ok: false };
  }

  const total = calcularTotalCarrinho();
  const tipoPagamento = formaPagamento || 'dinheiro';
  const valor = Number(valorRecebido || 0);

  if (tipoPagamento === 'dinheiro') {
    if (Number.isNaN(valor) || valor <= 0) {
      atualizarMensagem('erro', 'Informe um valor válido de pagamento em dinheiro.');
      renderizarApp();
      return { ok: false };
    }

    if (valor < total) {
      atualizarMensagem('erro', `Falta ${formatarMoeda(total - valor)} para concluir a venda.`);
      renderizarApp();
      return { ok: false };
    }
  } else {
    if (valor > 0 && valor < total) {
      atualizarMensagem('erro', `O valor informado está menor que o total da venda.`);
      renderizarApp();
      return { ok: false };
    }
  }

  const cliente = pegarCliente(clienteId) || pegarCliente(1);
  const troco = tipoPagamento === 'dinheiro' ? Math.max(0, valor - total) : 0;

  estado.produtos = estado.produtos.map((produto) => {
    const noCarrinho = estado.carrinho.find((item) => item.codigo === produto.codigo);
    if (!noCarrinho) return produto;
    return {
      ...produto,
      estoque: Math.max(0, produto.estoque - noCarrinho.quantidade)
    };
  });

  const pagamentoReal = tipoPagamento === 'dinheiro' ? valor : total;

  const venda = {
    id: Date.now(),
    data: new Date().toLocaleString('pt-BR'),
    total,
    pago: pagamentoReal,
    troco,
    formaPagamento: tipoPagamento,
    cliente: cliente ? cliente.nome : 'Cliente Final',
    itens: estado.carrinho.map((item) => ({
      codigo: item.codigo,
      nome: item.nome,
      quantidade: item.quantidade,
      preco: item.preco,
      total: item.preco * item.quantidade
    }))
  };

  estado.caixa += total;
  estado.vendas.unshift(venda);
  estado.carrinho = [];
  atualizarMensagem('sucesso', `Venda concluída. Troco: ${formatarMoeda(troco)}.`);
  salvarEstado();
  renderizarApp();
  return { ok: true, total, troco };
}

function registrarProduto(formData) {
  const codigo = (formData.get('codigo') || '').trim();
  const nome = (formData.get('nome') || '').trim();
  const marca = (formData.get('marca') || '').trim();
  const categoria = (formData.get('categoria') || '').trim();
  const preco = Number(formData.get('preco'));
  const estoque = Number(formData.get('estoque'));

  if (!codigo || !nome || !marca || !categoria || Number.isNaN(preco) || Number.isNaN(estoque)) {
    atualizarMensagem('erro', 'Preencha nome, marca, categoria, preço e estoque do produto.');
    renderizarApp();
    return { ok: false };
  }

  const jaExiste = estado.produtos.find((produto) => produto.codigo === codigo);
  if (jaExiste) {
    jaExiste.nome = nome;
    jaExiste.marca = marca;
    jaExiste.categoria = categoria;
    jaExiste.preco = preco;
    jaExiste.estoque = estoque;
    atualizarMensagem('sucesso', `Produto ${nome} atualizado.`);
  } else {
    estado.produtos.push({ codigo, nome, marca, categoria, preco, estoque });
    atualizarMensagem('sucesso', `Produto ${nome} cadastrado.`);
  }

  salvarEstado();
  renderizarApp();
  return { ok: true };
}

function removerProdutoEstoque(codigo) {
  const produto = pegarProduto(codigo);
  if (!produto) return;

  const confirma = window.confirm(`Deseja remover ${produto.nome} do estoque?`);
  if (!confirma) return;

  estado.produtos = estado.produtos.filter((item) => item.codigo !== codigo);
  atualizarMensagem('sucesso', `${produto.nome} removido do estoque.`);
  renderizarApp();
}

function adicionarCliente(nome, telefone, tipo = 'avulso') {
  const nomeLimpo = (nome || '').trim();
  const telefoneLimpo = (telefone || '').trim();

  if (!nomeLimpo || !telefoneLimpo) {
    atualizarMensagem('erro', 'Informe nome e telefone do cliente.');
    renderizarApp();
    return { ok: false };
  }

  const cliente = {
    id: Date.now(),
    nome: nomeLimpo,
    telefone: telefoneLimpo,
    tipo
  };

  estado.clientes.push(cliente);
  atualizarMensagem('sucesso', `${nomeLimpo} foi adicionado como cliente.`);
  salvarEstado();
  renderizarApp();
  return { ok: true };
}

function exportarRelatorio() {
  if (!estado.vendas.length) {
    atualizarMensagem('erro', 'Não há vendas para exportar.');
    renderizarApp();
    return;
  }

  const cabecalho = ['Data', 'Cliente', 'Total', 'Pago', 'Troco', 'Itens'];
  const linhas = estado.vendas.map((venda) => [
    venda.data,
    venda.cliente,
    venda.total.toFixed(2),
    venda.pago.toFixed(2),
    venda.troco.toFixed(2),
    venda.itens.map((item) => `${item.nome} (${item.quantidade})`).join(' | ')
  ]);

  const csv = [cabecalho, ...linhas]
    .map((linha) => linha.map((campo) => `"${String(campo).replace(/"/g, '""')}"`).join(';'))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'relatorio-adega.csv';
  link.click();
  URL.revokeObjectURL(link.href);

  atualizarMensagem('sucesso', 'Relatório exportado em CSV.');
  renderizarApp();
}

function renderDashboard() {
  const totalEmCaixa = estado.caixa;
  const totalVendas = totalVendido();
  const itensVendidosTotal = itensVendidos();
  const produtosCriticos = produtosBaixos();

  return `
    <div class="panel">
      <h2>Dashboard</h2>
      <div class="resumo">
        <div class="card">
          <div class="card-label">Caixa</div>
          <div class="card-valor">${formatarMoeda(totalEmCaixa)}</div>
        </div>
        <div class="card">
          <div class="card-label">Total vendido</div>
          <div class="card-valor">${formatarMoeda(totalVendas)}</div>
        </div>
        <div class="card">
          <div class="card-label">Produtos em baixa</div>
          <div class="card-valor">${produtosCriticos}</div>
        </div>
        <div class="card">
          <div class="card-label">Itens vendidos</div>
          <div class="card-valor">${itensVendidosTotal}</div>
        </div>
      </div>
    </div>

    <div class="panel">
      <h2>Resumo rápido</h2>
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Estoque</th>
              <th>Preço</th>
              <th>Categoria</th>
            </tr>
          </thead>
          <tbody>
            ${estado.produtos
              .slice(0, 6)
              .map((produto) => `
                <tr>
                  <td>${produto.nome}</td>
                  <td><span class="badge ${produto.estoque <= 5 ? 'low' : ''}">${produto.estoque}</span></td>
                  <td>${formatarMoeda(produto.preco)}</td>
                  <td>${produto.categoria}</td>
                </tr>
              `)
              .join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderVendas() {
  const totalCarrinho = calcularTotalCarrinho();
  const clientesOptions = estado.clientes
    .map((cliente) => `<option value="${cliente.id}">${cliente.nome}</option>`)
    .join('');

  const listaCarrinho = estado.carrinho.length
    ? estado.carrinho
        .map(
          (item) => `
            <li class="carrinho-item">
              <div>
                <strong>${item.nome}</strong>
                <div class="quantidade">${item.quantidade} x ${formatarMoeda(item.preco)}</div>
              </div>
              <div class="acoes-item">
                <button class="btn-small" data-acao="menos" data-codigo="${item.codigo}">-</button>
                <strong>${formatarMoeda(item.preco * item.quantidade)}</strong>
                <button class="btn-small" data-acao="mais" data-codigo="${item.codigo}">+</button>
                <button class="btn-danger" data-codigo="${item.codigo}" data-action="remover">Remover</button>
              </div>
            </li>
          `
        )
        .join('')
    : '<li class="carrinho-item"><span>Nenhum item adicionado.</span></li>';

  const produtos = produtosFiltrados()
    .map((produto) => {
      const baixo = produto.estoque <= 5 ? 'baixo' : '';
      return `
        <button class="produto" data-codigo="${produto.codigo}">
          <strong>${produto.nome}</strong>
          <small>${produto.marca || 'Marca não informada'} • ${produto.categoria}</small>
          <span class="preco">${formatarMoeda(produto.preco)}</span>
          <span class="estoque ${baixo}">Estoque: ${produto.estoque}</span>
        </button>
      `;
    })
    .join('');

  return `
    <div class="layout-2">
      <div class="panel">
        <h2>Vendas</h2>
        <input
          class="search"
          type="text"
          id="filtroProdutos"
          placeholder="Buscar produto por código, nome ou categoria"
          value="${estado.filtroProdutos}"
        />

        <div class="field">
          <label for="codigoBarraInput">Leitor de código de barras</label>
          <div class="inline-actions" style="display:flex; gap:8px; align-items:center;">
            <input
              id="codigoBarraInput"
              type="text"
              placeholder="Escaneie ou digite o código"
              autocomplete="off"
              style="flex:1; min-width:0;"
            />
            <button id="adicionarCodigoBarra" class="btn-success" type="button">Adicionar</button>
          </div>
        </div>

        <div class="lista-produtos">${produtos}</div>
      </div>

      <aside class="panel">
        <h2>Carrinho</h2>
        <ul class="carrinho-lista">${listaCarrinho}</ul>

        <div class="totais">
          <span>Subtotal</span>
          <strong>${formatarMoeda(totalCarrinho)}</strong>
        </div>

        <div class="total-principal">Total: ${formatarMoeda(totalCarrinho)}</div>

        <div class="field">
          <label for="clienteVenda">Cliente</label>
          <select id="clienteVenda">
            ${clientesOptions}
          </select>
        </div>

        <div class="field">
          <label for="formaPagamento">Forma de pagamento</label>
          <select id="formaPagamento">
            <option value="dinheiro">Dinheiro</option>
            <option value="debito">Débito</option>
            <option value="credito">Cartão de crédito</option>
            <option value="pix">Pix</option>
          </select>
        </div>

        <div class="field">
          <label for="valorPago">Valor recebido</label>
          <input id="valorPago" type="number" min="0" step="0.01" placeholder="Digite o valor" />
        </div>

        <div class="field">
          <button id="finalizarCompra" class="btn-success">Finalizar venda</button>
          <button id="limparCarrinho" class="btn-secondary">Limpar carrinho</button>
        </div>

        <div class="mensagem ${estado.ultimaMensagem.tipo}">${estado.ultimaMensagem.texto}</div>
      </aside>
    </div>
  `;
}

function renderEstoque() {
  const linhas = estado.produtos
    .map(
      (produto) => `
        <tr>
          <td>${produto.codigo}</td>
          <td>${produto.nome}</td>
          <td>${produto.marca || '—'}</td>
          <td>${produto.categoria}</td>
          <td>${formatarMoeda(produto.preco)}</td>
          <td><span class="badge ${produto.estoque <= 5 ? 'low' : ''}">${produto.estoque}</span></td>
          <td>
            <div class="inline-actions">
              <button class="btn-secondary" data-action="editar-produto" data-codigo="${produto.codigo}">Editar</button>
              <button class="btn-danger" data-action="remover-produto" data-codigo="${produto.codigo}">Excluir</button>
            </div>
          </td>
        </tr>
      `
    )
    .join('');

  return `
    <div class="panel">
      <h2>Estoque</h2>
      <div class="form-grid">
        <form id="formProduto">
          <div class="field">
            <label for="codigoProduto">Código</label>
            <input id="codigoProduto" name="codigo" type="text" placeholder="Ex: 009" required />
          </div>
          <div class="field">
            <label for="nomeProduto">Nome</label>
            <input id="nomeProduto" name="nome" type="text" placeholder="Ex: Vinho Branco" required />
          </div>
          <div class="field">
            <label for="marcaProduto">Marca</label>
            <input id="marcaProduto" name="marca" type="text" placeholder="Ex: Brahma, Souza Cruz, Nestlé" required />
          </div>
          <div class="field">
            <label for="categoriaProduto">Categoria</label>
            <input id="categoriaProduto" name="categoria" type="text" placeholder="Ex: Bebidas, Cigarros, Petiscos" required />
          </div>
          <div class="field">
            <label for="precoProduto">Preço</label>
            <input id="precoProduto" name="preco" type="number" min="0" step="0.01" required />
          </div>
          <div class="field">
            <label for="estoqueProduto">Estoque</label>
            <input id="estoqueProduto" name="estoque" type="number" min="0" step="1" required />
          </div>
          <div class="field">
            <button class="btn-success" type="submit">Salvar produto</button>
          </div>
        </form>

        <div>
          <h3>Produtos cadastrados</h3>
          <table class="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Marca</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>${linhas}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderClientes() {
  const linhas = estado.clientes
    .map(
      (cliente) => `
        <li class="cliente-item">
          <div>
            <strong>${cliente.nome}</strong>
            <div class="quantidade">${cliente.telefone} • ${cliente.tipo}</div>
          </div>
          <span class="badge">${cliente.tipo}</span>
        </li>
      `
    )
    .join('');

  return `
    <div class="panel">
      <h2>Clientes</h2>
      <div class="form-grid">
        <form id="formCliente">
          <div class="field">
            <label for="nomeCliente">Nome</label>
            <input id="nomeCliente" name="nome" type="text" placeholder="Nome do cliente" required />
          </div>
          <div class="field">
            <label for="telefoneCliente">Telefone</label>
            <input id="telefoneCliente" name="telefone" type="text" placeholder="(11) 99999-9999" required />
          </div>
          <div class="field">
            <label for="tipoCliente">Tipo</label>
            <select id="tipoCliente" name="tipo">
              <option value="avulso">Avulso</option>
              <option value="frequente">Frequente</option>
              <option value="fornecedor">Fornecedor</option>
            </select>
          </div>
          <div class="field">
            <button class="btn-success" type="submit">Adicionar cliente</button>
          </div>
        </form>

        <div>
          <h3>Lista de clientes</h3>
          <ul class="lista-clientes">${linhas}</ul>
        </div>
      </div>
    </div>
  `;
}

function renderRelatorios() {
  const vendas = estado.vendas
    .map(
      (venda) => `
        <li class="venda-item">
          <div>
            <strong>${venda.cliente}</strong>
            <div class="quantidade">${venda.data}</div>
          </div>
          <div>
            <strong>${formatarMoeda(venda.total)}</strong>
            <div class="quantidade">${venda.itens.length} itens</div>
          </div>
        </li>
      `
    )
    .join('');

  const totalGeral = totalVendido();
  const mediaVenda = estado.vendas.length ? totalGeral / estado.vendas.length : 0;

  return `
    <div class="panel">
      <h2>Relatórios</h2>
      <div class="resumo">
        <div class="card">
          <div class="card-label">Total geral</div>
          <div class="card-valor">${formatarMoeda(totalGeral)}</div>
        </div>
        <div class="card">
          <div class="card-label">Média por venda</div>
          <div class="card-valor">${formatarMoeda(mediaVenda)}</div>
        </div>
        <div class="card">
          <div class="card-label">Vendas</div>
          <div class="card-valor">${estado.vendas.length}</div>
        </div>
        <div class="card">
          <div class="card-label">Exportar</div>
          <div class="card-valor"><button class="btn-secondary" id="exportarRelatorio">CSV</button></div>
        </div>
      </div>
    </div>

    <div class="panel">
      <h2>Histórico de vendas</h2>
      <ul class="vendas-lista">${vendas || '<li class="venda-item"><span>Nenhuma venda registrada.</span></li>'}</ul>
    </div>
  `;
}

let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;

  const installButton = document.getElementById('installApp');
  if (installButton) {
    installButton.hidden = false;
  }
});

window.addEventListener('appinstalled', () => {
  const installButton = document.getElementById('installApp');
  if (installButton) {
    installButton.hidden = true;
  }
  deferredPrompt = null;
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch((error) => {
      console.warn('Service worker não registrado:', error);
    });
  });
}

function renderizarApp() {
  const app = document.getElementById('app');
  if (!app) return;

  const conteudo = {
    dashboard: renderDashboard(),
    vendas: renderVendas(),
    estoque: renderEstoque(),
    clientes: renderClientes(),
    relatorios: renderRelatorios()
  }[estado.paginaAtual] || renderVendas();

  app.innerHTML = `
    <div class="app">
      <header class="topbar">
        <div class="titulo-wrap">
          <h1>App Adega Pro</h1>
          <p>Gestão completa de vendas, estoque e clientes</p>
        </div>

        <nav class="nav">
          <button class="nav-btn ${estado.paginaAtual === 'dashboard' ? 'active' : ''}" data-page="dashboard">Dashboard</button>
          <button class="nav-btn ${estado.paginaAtual === 'vendas' ? 'active' : ''}" data-page="vendas">Vendas</button>
          <button class="nav-btn ${estado.paginaAtual === 'estoque' ? 'active' : ''}" data-page="estoque">Estoque</button>
          <button class="nav-btn ${estado.paginaAtual === 'clientes' ? 'active' : ''}" data-page="clientes">Clientes</button>
          <button class="nav-btn ${estado.paginaAtual === 'relatorios' ? 'active' : ''}" data-page="relatorios">Relatórios</button>
          <button class="nav-btn" id="installApp" hidden>Instalar app</button>
        </nav>
      </header>

      <div class="content">
        ${conteudo}
      </div>
    </div>
  `;

  document.querySelectorAll('.nav-btn[data-page]').forEach((botao) => {
    botao.addEventListener('click', () => {
      estado.paginaAtual = botao.dataset.page;
      salvarEstado();
      renderizarApp();
    });
  });

  const installButton = document.getElementById('installApp');
  if (installButton) {
    installButton.hidden = !deferredPrompt;
    installButton.addEventListener('click', async () => {
      if (!deferredPrompt) {
        atualizarMensagem('erro', 'O app já está instalado ou o navegador não oferece instalação.');
        renderizarApp();
        return;
      }

      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        atualizarMensagem('sucesso', 'Instalação iniciada com sucesso.');
      } else {
        atualizarMensagem('erro', 'Instalação cancelada pelo usuário.');
      }

      deferredPrompt = null;
      installButton.hidden = true;
      renderizarApp();
    });
  }

  if (estado.paginaAtual === 'vendas') {
    const inputFiltro = document.getElementById('filtroProdutos');
    if (inputFiltro) {
      inputFiltro.addEventListener('input', (event) => {
        estado.filtroProdutos = event.target.value;
        salvarEstado();
        renderizarApp();
      });
    }

    const codigoBarraInput = document.getElementById('codigoBarraInput');
    const botaoAdicionarCodigo = document.getElementById('adicionarCodigoBarra');

    if (codigoBarraInput) {
      codigoBarraInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          const codigo = codigoBarraInput.value;
          const resultado = adicionarProdutoPorCodigo(codigo);
          if (resultado.ok) {
            codigoBarraInput.value = '';
          }
        }
      });
    }

    if (botaoAdicionarCodigo) {
      botaoAdicionarCodigo.addEventListener('click', () => {
        const codigo = codigoBarraInput ? codigoBarraInput.value : '';
        const resultado = adicionarProdutoPorCodigo(codigo);
        if (resultado.ok && codigoBarraInput) {
          codigoBarraInput.value = '';
        }
      });
    }

    document.querySelectorAll('.produto').forEach((botao) => {
      botao.addEventListener('click', () => {
        adicionarProdutoCarrinho(botao.dataset.codigo);
      });
    });

    document.querySelectorAll('[data-action="remover"]').forEach((botao) => {
      botao.addEventListener('click', () => removerProdutoCarrinho(botao.dataset.codigo));
    });

    document.querySelectorAll('[data-acao]').forEach((botao) => {
      const acao = botao.dataset.acao;
      if (acao === 'mais' || acao === 'menos') {
        botao.addEventListener('click', () => {
          ajustarQuantidadeCarrinho(botao.dataset.codigo, acao === 'mais' ? 1 : -1);
        });
      }
    });

    const botaoFinalizar = document.getElementById('finalizarCompra');
    if (botaoFinalizar) {
      botaoFinalizar.addEventListener('click', () => {
        const valorPago = document.getElementById('valorPago').value;
        const clienteSelecionado = document.getElementById('clienteVenda').value;
        const formaPagamento = document.getElementById('formaPagamento').value;
        finalizarCompra(valorPago, clienteSelecionado, formaPagamento);
      });
    }

    const botaoLimpar = document.getElementById('limparCarrinho');
    if (botaoLimpar) {
      botaoLimpar.addEventListener('click', limparCarrinho);
    }
  }

  if (estado.paginaAtual === 'estoque') {
    const formProduto = document.getElementById('formProduto');
    if (formProduto) {
      formProduto.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(formProduto);
        registrarProduto(formData);
      });
    }

    document.querySelectorAll('[data-action="remover-produto"]').forEach((botao) => {
      botao.addEventListener('click', () => removerProdutoEstoque(botao.dataset.codigo));
    });

    document.querySelectorAll('[data-action="editar-produto"]').forEach((botao) => {
      botao.addEventListener('click', () => {
        const produto = pegarProduto(botao.dataset.codigo);
        if (!produto) return;

        document.getElementById('codigoProduto').value = produto.codigo;
        document.getElementById('nomeProduto').value = produto.nome;
        document.getElementById('marcaProduto').value = produto.marca || '';
        document.getElementById('categoriaProduto').value = produto.categoria;
        document.getElementById('precoProduto').value = produto.preco;
        document.getElementById('estoqueProduto').value = produto.estoque;
      });
    });
  }

  if (estado.paginaAtual === 'clientes') {
    const formCliente = document.getElementById('formCliente');
    if (formCliente) {
      formCliente.addEventListener('submit', (event) => {
        event.preventDefault();
        const nome = document.getElementById('nomeCliente').value;
        const telefone = document.getElementById('telefoneCliente').value;
        const tipo = document.getElementById('tipoCliente').value;
        adicionarCliente(nome, telefone, tipo);
        formCliente.reset();
      });
    }
  }

  if (estado.paginaAtual === 'relatorios') {
    const btnExportar = document.getElementById('exportarRelatorio');
    if (btnExportar) {
      btnExportar.addEventListener('click', exportarRelatorio);
    }
  }

  salvarEstado();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderizarApp);
  } else {
    renderizarApp();
  }
}

if (typeof module !== 'undefined') {
  module.exports = {
    produtosPadrao,
    clientesPadrao,
    estado,
    adicionarProdutoCarrinho,
    ajustarQuantidadeCarrinho,
    removerProdutoCarrinho,
    limparCarrinho,
    finalizarCompra,
    registrarProduto,
    adicionarCliente,
    adicionarProdutoPorCodigo,
    exportarRelatorio,
    formatarMoeda,
    getEstado: () => estado
  };
}
