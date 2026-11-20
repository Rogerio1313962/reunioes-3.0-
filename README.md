REUNIÕES 3.0 — PRÉVIA 134

Nesta atualização:
- Ao adicionar música pelo Cronograma, a biblioteca apresenta cada música agrupada (em vez dos arquivos P/T/R/F/PB/TB/RB separados).
- Ao tocar em música já adicionada no Cronograma, aparece uma janela com as sete versões disponíveis para escolher; selecionar/abrir a música não inicia o áudio automaticamente.
- Versículos antigos salvos no Cronograma são exibidos em intervalos compactos quando consecutivos: Gênesis 1:1-4, não 1:1, 2, 3, 4. Seleções não consecutivas mantêm grupos separados.
- Trocar ACF/ARA na aba Bíblia atualiza imediatamente o versículo que estiver no telão, desde que exista na base local.
- Ajustada a escala da fonte da Bíblia no telão e nas prévias para refletir o tamanho configurado.
- Preservados os demais recursos da Prévia 133, incluindo o fechamento das configurações ao salvar.

Para instalar no GitHub Pages, extraia o ZIP e envie o conteúdo à raiz do repositório, não o ZIP. Atualize o Safari após publicar.
Teste de sintaxe dos scripts efetuado. Funcionamento visual no Safari/iPad e em projeção física ainda não validado.

PRÉVIA 135: indicador AO VIVO da Bíblia e Cronograma em amarelo pulsante somente quando há apresentação, sem piscar na imagem de apoio. A engrenagem do Telão Santuário configura efeito e duração de transições de mídia, não a aparência da Bíblia.

Prévia 136: No Cronograma, Adicionar conteúdo > Música abre a mesma Biblioteca de Músicas, mas oculta o botão + Adicionar música. Ao escolher uma música, ela é adicionada à etapa sem tocar. Fora desse modo, a Biblioteca funciona normalmente.

Prévia 137: Media player do cronograma centralizado e aproximado; player da aba FUNDOS alinhado ao mesmo padrão visual.

Prévia 138: correção real da engrenagem do telão com janela modal própria; os efeitos e a duração são salvos e o diálogo fecha automaticamente. Preserva os dois media players da 137.

Prévia 140: Botão de edição da referência bíblica substituído por lápis compacto e alinhado. Ao remover etapa do Cronograma, todos os itens daquela etapa também são excluídos mediante confirmação; bibliotecas de arquivos intactas.

Prévia 141: ajuste responsivo de fonte do versículo no telão físico e na prévia, preservando referência separada. Controlador exibe textos completos de anterior/atual/próximo; em trechos excepcionais, a página pode precisar rolar para acomodar todo o texto legível.

Prévia 142: abrir aba Bíblia começa pelos livros. Editar um versículo do Cronograma usa seleção na Bíblia e substitui o item existente, sem abrir formulário antigo.


Prévia 143: controlador da Bíblia ajustado nos dois contextos (Cronograma e Bíblia), botão “Destacar trecho” no cabeçalho, botão X em vermelho, texto auxiliar removido e engrenagem da tradução simplificada.

Prévia 144: Versículos de 1 a 3 linhas passam a ficar visualmente mais centralizados na região escura acima da ilustração da Bíblia, mantendo fonte adaptativa, distância da referência e atuação também no telão externo.


Prévia 145: Sombra sutil adicionada à engrenagem da Bíblia e às engrenagens de configuração do telão, preservando o estilo atual de cada botão.


Prévia 146: removida a faixa azul-clara do cabeçalho da Bíblia, ampliada a engrenagem de configuração e centralizada imediatamente à direita da seleção ACF/ARA, preservando a sombra do ícone.


Prévia 147: Na aba FUNDOS mostra a imagem de apoio do dia quando não há vídeo; remove os botões Apresentar/Encerrar, acrescenta X para fechar vídeo e restaurar apoio. Play inicia projeção e reprodução; Media Player com layout e controles padronizados com o Cronograma.


Prévia 148: destaque de trecho bíblico agora aparece e funciona somente para versículos usados pelo Cronograma. Versículos apresentados diretamente pela aba Bíblia não exibem o botão de destaque nem aplicam destaques salvos.


Prévia 149: destaque disponível tanto na Bíblia livre (temporário, sem persistência) quanto nos versículos do Cronograma (salvo exclusivamente no item e na referência específicos). Fechar apresentação ou sair da Bíblia limpa os destaques temporários. Versículos projetados diretamente nunca recebem destaques agendados.


Prévia 150: aba Fundos com miniaturas reais extraídas dos vídeos, mantendo proporção original com barras laterais quando necessário; X no canto direito do player; volume com ícone vetorial e alternância mudo; barras de progresso ajustadas para 0–100% na aba Fundos e no Cronograma.

Prévia 151: tenta diversos quadros do arquivo MOV/MP4 antes de usar a miniatura; rejeita captura preta. Miniatura é processada após o card ser adicionado à página e fallback explícito é exibido quando o Safari não decodifica.


Prévia 153: tela FUNDOS ANTES DA REUNIÃO sem título TELÃO SANTUÁRIO; vídeo selecionado aparece no iPad antes de tocar Play, usando miniatura de um quadro como poster; o indicador AO VIVO aparece com bolinha piscando apenas após transmitir; proteção contra zoom por toque duplo em todas as páginas.


Prévia 154: remoção da janela modal de versões ao tocar numa música do Cronograma; abertura direta do player em Piano completo, barra de reprodução com trilha única e repetir amarelo quando ativado.


Prévia 155: otimização da atualização do Safari. ACF/ARA só são baixadas e gravadas no IndexedDB quando não estão em cache; restauração deixa primeira renderização da página ocorrer. Biblioteca e miniaturas dos vídeos de Fundos só carregam quando a aba é aberta; miniaturas são processadas em fila, reduzindo travamento e consumo de memória na inicialização. Dados existentes preservados.


Prévia 156: inclusão de lembretes no Cronograma com um único campo de texto, sem exigir Nome. Os lembretes existentes são preservados.


Prévia 157: padronização premium amarela, com relevo e sombra, nos botões de adicionar conteúdo, etapa, música, vídeo e lembrete.

Prévia 158: removida a frase 'Recado · não vai ao telão' dos lembretes no cronograma e ampliado o texto do lembrete para melhor visibilidade.


Prévia 159: arquivos JavaScript consolidados em reunioes-app.js e reunioes-telao.js. Toda a aplicação mantém a ordem de execução de cada módulo; mantém dois arquivos de dados bíblicos separados. Aba Mídias carrega miniaturas sob demanda, não carrega todos os vídeos simultaneamente, libera referências ao sair. Grade Vídeos possui rolagem interna independente com título e botões fixos. Alterações apenas no pacote do aplicativo, preservando dados gravados no IndexedDB/localStorage existentes. Testar no iPad antes de usar em reunião.


Prévia 160: correção na pasta Mídias/Vídeos para manter nomes e botões sempre visíveis, inclusive quando os vídeos .mov demoram a carregar ou não geram miniatura. Previsões carregadas conforme a rolagem; nenhum arquivo armazenado no IndexedDB é modificado por esta atualização.

Prévia 161: identidade azul-marinho e dourado fosco. Atalho/ícone PWA via logo.png e Apple touch icon. Splash Screen desenhada no primeiro HTML antes de qualquer tela do app, com o próprio R e anel no ângulo original; efeito de movimento leve, play e progresso; o app só fica visível após inicialização ou limite de segurança de 6,5 s. Sem vídeo pesado; todos os dados locais preservados. A imagem inicial nativa do iOS, mostrada antes da execução do site, é controlada pelo iOS, e reabrir um PWA já ativo pode restaurar a sessão sem nova navegação.


Prévia 162: cartões de PDF com proporções uniformes, miniatura PDF.js sem iframe; fotos sem abrir aba; vídeo com reprodução no próprio cartão do iPad.


Prévia 163: identidade no menu, animação de abertura com fundo azul-marinho, anel dourado no plano inclinado e gesto de Play. O Cronograma inicia música retirando versículo e vídeo (inclusive pausado) da apresentação e restaurando a Imagem de Apoio do dia, se existente. Seleção do vídeo exibe prévia no iPad, sem transmissão até tocar Play/Apresentar. Repetição de vídeo tem botão ⟲ com estado amarelo; a opção segue no arquivo enviado ao telão. Mantida a galeria padronizada da Prévia 162. Os arquivos e dados do navegador permanecem inalterados.

Prévia 164: abertura redesenhada com anel DOURADO EXTRAÍDO do logo oficial (não bolinha separada); gira em perspectiva em torno do R ao longo do eixo inclinado, Play dourado é acionado e termina no logo oficial sem alteração de cor. Fundo azul-marinho na inicialização e ocultação da interface até a saída da abertura. Continua 10 arquivos; os três componentes PNG são embutidos no index.html para não criar novas pastas nem dependências.


## Prévia 165 — Logo e abertura suavizados
- Abertura: somente a imagem oficial do R ampliando lentamente (zoom de 94% a 104,5%), com sombra discreta no fundo azul-marinho.
- Sem rotação do anel, sem bolinha e sem animação isolada do Play.
- Marca no menu lateral ajustada para exibir o R inteiro, sem recorte.
- Mantidos os 10 arquivos e os recursos da Prévia 164.


## Prévia 166 — Acabamento do logo
- Retirados os halos esbranquiçados do recorte do R e do anel, preservando desenho e cores originais.
- Fundo azul-marinho e zoom suave mantidos; sombra levemente ajustada para contraste.
- Ícone interno sem bordas brancas, sem alterar os controles do aplicativo.
- Mantida a estrutura original de 10 arquivos.


Prévia 167: música iniciada pelo Cronograma substitui qualquer versículo ou vídeo (inclusive pausado) pela imagem de apoio do dia; controle Repetir vídeo substituído pelo ícone de duas setas e estado amarelo quando ativado. A estrutura continua com 10 arquivos.
