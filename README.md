# Adega Medieval Pro

<p align="center">
  <img src="assets/adega-medieval-pro-cover.svg" alt="Adega Medieval Pro" width="1000" />
</p>

<p align="center">
  <a href="https://github.com/leobeast019/projeto-adega">
    <img src="https://img.shields.io/badge/GitHub-Repo-181717?logo=github&logoColor=white" alt="GitHub Repository" />
  </a>
  <img src="https://img.shields.io/badge/Status-Ativo-success" alt="Status" />
  <img src="https://img.shields.io/badge/Plataforma-Windows%20%7C%20PWA-0078D6" alt="Platform" />
  <img src="https://img.shields.io/badge/Stack-HTML%20%7C%20JS%20%7C%20Electron-FFB000" alt="Stack" />
</p>

Sistema de caixa e gestão para adega, com foco em operação local, controle de vendas e acompanhamento de estoque em ambiente desktop e web.

## Sobre o projeto

Este projeto foi desenvolvido para facilitar a gestão de uma adega com:

- controle de caixa e fechamento do dia
- cadastro e acompanhamento de vendas
- gestão de estoque e produtos
- uso em desktop com instalação local
- suporte a versão PWA para navegador
- funcionamento offline

## Funcionalidades

- Painel de operação rápida
- Registro de vendas
- Controle de itens e estoque
- Interface moderna, enxuta e funcional
- Instalação no Windows via Electron
- Compatibilidade com uso em navegador

## Stack utilizada

- HTML5
- CSS3
- JavaScript
- Electron
- PWA
- Arquivos estáticos para execução local

## Instalação

### Windows

1. Baixe o instalador gerado em `dist`.
2. Execute o arquivo `.exe`.
3. Siga as instruções da instalação.
4. Abra o programa pelo menu Iniciar ou pelo atalho criado.

> O instalador já inclui os arquivos essenciais para execução local, sem necessidade de instalar Python ou navegador.

### Versão portátil

1. Copie a pasta `dist/win-unpacked` inteira.
2. Execute `Adega Medieval Pro.exe` dentro dela.
3. Mantenha a pasta completa no mesmo local para evitar falhas de execução.

### PWA no navegador

Os arquivos `index.html`, `manifest.webmanifest` e `service-worker.js` podem ser usados em um servidor local ou remoto para acesso via navegador.

## Estrutura do projeto

- `index.html` — interface principal
- `caixa.js` — lógica do sistema
- `main.js` — inicialização do Electron
- `manifest.webmanifest` — configuração do PWA
- `service-worker.js` — cache offline
- `icons/` — ícones do app
- `assets/` — materiais visuais e capa do repositório

## Importante

- Os dados ficam salvos localmente no computador em uso.
- Para transferir os dados para outra máquina, utilize a função de exportação disponível no sistema.
- Para gestão em múltiplos pontos ou rede, a próxima etapa é integrar banco de dados e sincronização.

## Observação

Este projeto foi pensado como uma solução prática para operação local de adega, com foco em performance, simplicidade e uso imediato no dia a dia do negócio.
