# REUNIÕES 3.0 — MVP 1 (prévia local)

Primeira implementação independente, não usa o código antigo.

## Incluído
- Painel responsivo para PC, celular e iPad (navegador)
- Cronograma separado por sete dias; criar, editar, apagar e reorganizar itens
- Versículos digitados com referência e tradução identificada
- Adicionar imagens, vídeos e PDFs do dispositivo (armazenamento local sujeito a limites do navegador)
- Janela de telão e envio local pelo BroadcastChannel (mesmo navegador/origem)
- Prévia, limpar telão e configuração simples de aparência

## Ainda NÃO incluído
- Servidor na nuvem, contas e autenticação
- Sincronização entre dispositivos e controle pela internet
- Aplicativo Android APK / instalador Windows
- Base de dados bíblica e direitos de traduções
- Modo offline robusto para vídeos grandes
- Reprodutor PDF com controle de páginas e controle avançado de vídeo

## Executar
Em computador com Python 3: abra um terminal nesta pasta e execute `python -m http.server 8080`. Acesse `http://localhost:8080`. Clique em **Abrir telão** e mova a janela para a segunda tela. A janela de telão precisa estar na mesma origem e navegador do painel.

Não use esta prévia em reunião real sem testar. Não contém sincronização na nuvem.
