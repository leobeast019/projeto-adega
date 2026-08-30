# Adega Medieval Pro

<p align="center">
  <img src="assets/adega-medieval-pro-cover.svg" alt="Adega Medieval Pro Cover" width="1000" />
</p>

Aplicativo de caixa e gestão para adega, com interface moderna, sistema de vendas, controle de estoque e funcionalidade de instalação desktop via Electron.

## ✅ Sobre o projeto

Este projeto foi pensado para auxiliar a operação de uma adega com:

- controle de caixa
- registro de vendas
- acompanhamento de estoque
- uso em desktop com instalação local
- suporte a versão PWA para navegador
- funcionamento offline

## 🚀 Instalar no Windows

1. Copie o arquivo `dist/Adega Medieval Pro Setup 1.0.0.exe` para o computador da adega.
2. Clique duas vezes no instalador.
3. Siga as etapas da instalação e escolha se deseja criar um atalho.
4. Abra o aplicativo pelo menu Iniciar ou pelo atalho da área de trabalho.

O instalador inclui o Electron e todos os arquivos necessários. Não é preciso instalar
Python, Node.js ou navegador para usar o aplicativo.

## 🧩 Versão portátil

Se nao quiser instalar, copie a pasta `dist/win-unpacked` inteira e execute
`Adega Medieval Pro.exe` dentro dela. A pasta inteira deve permanecer junta.

## 🌐 Versão PWA no navegador

Os arquivos `index.html`, `manifest.webmanifest` e `service-worker.js` continuam
disponiveis para uso como PWA em um servidor local ou hospedagem web.

## ⚠️ Se o instalador for bloqueado pelo Windows

- Clique em `Mais informações` e depois em `Executar assim mesmo`, caso o Windows
	exiba o aviso de aplicativo desconhecido.
- Em computadores corporativos, peça ao administrador para autorizar o instalador.

## 🔒 Importante

- Os dados ficam salvos localmente no computador em uso.
- Para levar os dados para outra máquina, use a função de exportação disponível no app.

## 📁 Estrutura

- `index.html` — interface principal
- `caixa.js` — lógica da adega
- `manifest.webmanifest` — configuração PWA
- `service-worker.js` — cache e funcionamento offline
- `icons/` — ícones do app
- `assets/` — arte visual do projeto e capa do repositório

## 📝 Observação

Este app salva os dados localmente no navegador do computador em uso. Para uma gestão em rede ou em vários pontos, a próxima etapa é integrar banco de dados e sincronização.
