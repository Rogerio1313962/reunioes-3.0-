# Prévia 94 — Troca de slides sem mensagem intermediária

- Remove o texto "Preparando página..." do Telão Santuário durante a troca de slides de PDF.
- Mantém a imagem anterior até a próxima página estar disponível, sem tela preta ou texto de carregamento.
- Usa a miniatura já renderizada como prévia imediata, quando disponível, e substitui por uma renderização de melhor qualidade.
- Evita enviar uma página à apresentação antes de ela estar pronta.
- Ignora renderizações antigas quando o usuário troca de slide rapidamente ou encerra a apresentação.
- Mantém os demais recursos da Prévia 93.
- Os arquivos do usuário permanecem no armazenamento local do navegador; não limpar os dados do site.

PRÉVIA 92 — Player sobreposto ao Telão Santuário e controle de Imagem de Apoio compacto
- Media Player de música aparece por cima da área do telão (sobreposição), não como painel alto abaixo.
- Minimizar recolhe sem interromper a música; botão de reabrir permanece abaixo do telão.
- Controle da Imagem de Apoio mostra somente o texto fixo “Imagem de Apoio”, sem nome do arquivo; dentro da janela ainda é possível trocar/remover.
- Mantém arquivos e bases de dados existentes, sem reset.
- Não validado em Safari real neste ambiente.

PRÉVIA 78 — Miniaturas no cronograma e no seletor de mídias

- Vídeos: usa quadro real capturado do vídeo quando o Safari permite; mantém o quadro de vídeo com controle nativo como alternativa.
- Fotos: exibe a própria imagem.
- PDFs: exibe a primeira página pelo renderizador integrado ao navegador, quando suportado.
- Aplicado à galeria de escolha e aos cartões no cronograma.
- Não remove arquivos já salvos.

PRÉVIA 77 — Pastas modernas e upload simples

- Vídeos, Fotos e PDFs são categorias únicas; uploads novos guardados em Todos, sem seleção de dias.
- Upload com arquivo somente, nome automático, edição posterior pelo lápis.
- Pastas visuais claras com ícones e títulos em maiúsculas; removido destaque dourado.
- Pastas de Música também têm visual de pasta com ícone próprio.
- Os arquivos anteriores no IndexedDB não são apagados.

# REUNIÕES 3.0 — PRÉVIA 75

Atualização consolidada da Prévia 74.

**Novidade:** Cronograma > Adicionar > Vídeo/Foto/PDF/Música > Pasta abre galeria visual com três arquivos por linha e prévias dos arquivos guardados. Fotos mostram a imagem; vídeos mostram um quadro com ícone de Play; PDFs tentam mostrar a primeira página pelo visualizador PDF integrado ao navegador. No Safari, a miniatura do PDF depende do suporte nativo do iOS.

Demais recursos e limitações da Prévia 74 foram preservados. Os arquivos residem no armazenamento local deste navegador e não sincronizam automaticamente com o computador. A apresentação remota e compatibilidade real no Safari precisam de testes.

REUNIÕES 3.0 — PRÉVIA 57 RECONSTRUÍDA E CORRIGIDA (BASE 56)

Alterações somente de 56 para 57:
- Busca principal compacta com lupa e botão Adicionar música na mesma linha.
- Busca dentro da pasta acima dos botões Voltar e Adicionar música, menores e centralizados.
- Área compacta do Media Player à direita quando abre pasta, mantendo o original ao selecionar música.
- Correção da busca para ocultar as caixas de pastas durante resultados.

Limpeza segura:
- layout54.js e layout55.js não são carregados pelo index.html atual e foram excluídos desta distribuição.
- Os demais arquivos são mantidos, pois são carregados ou usados.

ATENÇÃO GITHUB: carregar este ZIP descompactado no repositório não apaga automaticamente arquivos anteriores. É necessário excluir layout54.js e layout55.js manualmente no GitHub, após validar esta versão.
Dados MP3 do IndexedDB não estão incluídos no ZIP.


PRÉVIA 58: (1) Oculta aviso de sincronização no cronograma; (2) botão amarelo fixo no canto inferior direito ao minimizar player do cronograma; (3) player integrado à pasta carrega a primeira música sem autoplay; (4) fundo branco quando pasta vazia e cantos mais suaves; (5) títulos longos deslizam automaticamente uma vez.


PRÉVIA 59: Responsividade para Safari no iPad. Ajuste de altura de página, espaços, cartões de pastas e rolagens internas do cronograma, Bíblia e biblioteca. Preserva o funcionamento da Prévia 58.

Prévia 60: cores navy/dourado da biblioteca e pastas; busca menor; cadastro de MP3 encaixado na coluna direita, mantendo formulário e seleção de arquivos originais.

PRÉVIA 61: alivia fundos e cartões da biblioteca e do cadastro de músicas; remove bordas claras excessivas. Bloqueia gesto de pinça/zoom no Safari do iPad para uso do aplicativo, mantendo rolagem de um dedo. Não modifica o Media Player do cronograma nem os dados locais.


Prévia 62: cores das caixas da biblioteca aplicadas ao app; frase Biblioteca de Áudio removida; letra do player da pasta rolável por toque.


## Prévia 63
- Ajuste de grade do Media Player nas pastas: área branca da letra ocupa o restante da altura do player; rolagem vertical com um dedo, sem deslocar controles.
- Botões de edição (lápis) e exclusão (lixeira) maiores e alinhados nas linhas de música.
- Sem alterações intencionais em funções de áudio, biblioteca, cronograma ou Bíblia.


## Prévia 64 — Biblioteca de Mídias
Aba Mídias com categorias Vídeos, Fotos e PDFs; pastas por dia; pesquisa, edição do nome, exclusão, prévia e cadastro em painel à direita. Arquivos guardados localmente em IndexedDB (`reunioes3-midias-v64`) e não sincronizados entre dispositivos. Ao usar no cronograma, esta prévia conserva a restrição de 2 MB por arquivo devido ao armazenamento existente no aplicativo. Não remover arquivos da versão anterior de maneira isolada sem revisar as referências.


## Prévia 65 — Correção da 64
Restaura o botão `libraryAdd` invisível de compatibilidade, que havia sido removido na 64 e causava interrupção do `app.js` (prejudicando Cronograma, Bíblia e Músicas). Biblioteca de Mídias com retorno explícito a Mídias, pesquisador compacto, pastas menores, e prévia sem cartão branco vazio até a escolha de um arquivo.


## Prévia 66
- Mídias: pastas com miniaturas em até quatro colunas, sem painel lateral e sem pesquisa interna.
- Botões Voltar à esquerda e Adicionar à direita, centralizados.
- Arquivos novos aparecem primeiro na pasta (data de cadastro).
- Vídeos reproduzidos no próprio cartão; imagens visíveis; PDFs com miniatura incorporada quando o Safari permitir e botão Abrir.
- Músicas agrupadas e avulsas em ordem alfabética na pasta.


Prévia 67: botão Voltar à esquerda de Adicionar nas categorias de Vídeos, Fotos e PDFs.


## Prévia 68 — correção do salvamento de Mídias
- Corrigida a função `validFile`, ausente na versão 67, que interrompia o salvamento antes da gravação.
- Validação de formatos para vídeo, foto e PDF; confirmação de gravação local após salvar; mensagem de erro explícita.
- Mantidos os layouts, as pastas e os demais recursos da 67.


## Prévia 69 — Abertura e cronograma
- Corrige a ação de abrir PDFs e fotos com links gerados previamente ao toque (compatibilidade Safari).
- Mantém prévias integradas nos cartões de Mídias.
- Cronograma oferece a seleção de vídeos, fotos e PDFs já armazenados na Biblioteca de Mídias.
- Itens do cronograma guardam referência ao IndexedDB, sem duplicar vídeos grandes no localStorage.
- Não apague os dados do site no Safari; arquivos armazenados são locais a esse navegador.


## Prévia 70
- Vídeos do cronograma agora abrem pausados no Media Player da direita, sem substituir cronograma nem enviar automaticamente ao telão.
- Media Player próprio para vídeo com progresso, play/pause, repetição e volume compacto.
- Seleção para adicionar mídia ao cronograma por pastas e arquivos, preservando seletor antigo internamente.
- PDFs abrem grade de três páginas por linha na área do cronograma, com exclusão temporária e restauração, seleção e navegação.
- Botões Apresentar/Encerrar e transições Fade/Merge/Wipe/Corte com duração padrão de 300 ms na engrenagem.
- Limitações: a contagem de páginas PDFs complexos pode variar no Safari; miniprêvias de PDF dependem do visualizador do navegador. O canal BroadcastChannel funciona apenas entre janelas do mesmo navegador/origem e não sincroniza iPad com PC.


## Prévia 71 — Minimizar grade PDF
- Botão “− Minimizar” na janela da grade do PDF, que devolve o cronograma à esquerda sem fechar o PDF ou interromper a apresentação.
- Botão dourado fixo no canto inferior direito, no mesmo lugar do player de música minimizado, para reabrir a grade sem perder página escolhida nem exclusões temporárias.
- Mantidas as demais mudanças da Prévia 70.

PRÉVIA 73: botão de lápis em cada item do cronograma para alterar somente o título exibido, sem modificar o nome real do arquivo salvo na Biblioteca de Mídias; tocar na área do versículo bíblico envia imediatamente seu texto ao telão, mantendo os controles próprios de vídeo, foto e PDF.


## Prévia 74 — Consolidação
- Grade PDF: três miniaturas **retangulares 16:9** por linha; excluir/restaurar página sem modificar arquivo; minimizar/reabrir.
- Adicionar conteúdo: seis ícones de escolha; Bíblia abre sua aba, Música/Vídeo/Foto/PDF abrem pastas correspondentes, Lembrete formulário amarelo compacto. Edição avançada de itens antigos continua disponível.
- Miniaturas de mídias do IndexedDB no cronograma, sem duplicar o arquivo inteiro no localStorage.
- Visual geral mais claro (azul suave / branco), preservando os controles dourados dos players; removidos controles redundantes do painel Telão.
- Controle de volume incorporado ao player de vídeos e separado do painel antigo.
- Telão em outra aba da **mesma origem e mesmo navegador** procura arquivos pelo ID em IndexedDB, em vez de tentar acessar a URL blob de outra janela.
- Limitação importante: **iPad e computador distintos não compartilham IndexedDB nem BroadcastChannel**. Esta versão continua exigindo servidor/websocket para controle remoto verdadeiro; não prometa reprodução do vídeo do iPad no PC.
- Verificação com Safari real continua necessária, principalmente prévia de PDF e autoplay de vídeo.


Prévia 76: vídeos, fotos e PDFs em uma pasta por categoria, com arquivos antigos preservados independentemente do dia original; seleção direta pelo cronograma; player do telão mais compacto com botão único para apresentar/encerrar.


## Prévia 79
- Ícones vetoriais profissionais na seleção de seis tipos de conteúdo, com lembrente amarelo.
- Removida linha explicativa redundante da seleção de conteúdo.
- Reduzidos os contornos duplicados de foco ao tocar no iPad, mantendo indicador para teclado.
- Tocando no cabeçalho da etapa, expande/recolhe o cronograma, sem setinha.
- Preservados arquivos e funções anteriores.


PRÉVIA 80: Retirada a faixa azul-marinho do cabeçalho das etapas no cronograma. O nome INÍCIO é agora um cabeçalho claro e clicável, preservando abrir/fechar com toque, contador e botões de edição.


## Prévia 81
- Os lápis de renomeação desaparecem quando o cronograma está salvo.
- Em Editar cronograma, músicas permitem somente Renomear e Remover; não abrem mais a escolha de pasta/MP3 na edição.
- Vídeos, fotos, PDFs, lembretes e versículos mantêm Editar apenas dentro do modo de edição.


Prévia 82: a paleta agora muda visivelmente a cor de destaque e o fundo suave do cabeçalho da etapa, sem recriar a faixa azul-marinho; cores não alteram o cronograma inteiro.


## Prévia 83
Pastas da Biblioteca de Músicas convertidas para cartões compactos, ícones menores à esquerda, sem bordas grossas ou degradês; duas colunas no iPad, uma no celular; nomes em maiúsculas. Sem alteração dos arquivos musicais salvos.


## Prévia 84 — Modelo 1 e retorno à biblioteca inicial
- Pastas em blocos compactos para Músicas e Mídias, com aparência padronizada.
- Ao sair da aba Mídias e retornar, o aplicativo mostra novamente VÍDEOS, FOTOS e PDFs.
- Arquivos salvos continuam preservados no IndexedDB original.


## PRÉVIA 85 — PDF com renderização progressiva
- Remove os `iframe` repetidos do PDF (causavam travamento e não mostravam slides no iPad).
- Utiliza PDF.js 3.11.174 para renderizar páginas reais em canvas; miniaturas só são geradas quando entram na área visível, uma por vez, para reduzir memória.
- Página escolhida renderizada separadamente no Telão ao Vivo; mesma técnica na janela de apresentação.
- Grade de 3 miniaturas retangulares 16:9; minimizar, retirar/restaurar, anterior/próxima preservados.
- Dependência: PDF.js carregado do CDN da Cloudflare; a primeira abertura do PDF precisa de internet. Para uso totalmente offline, será necessário incluir os arquivos pdf.min.js e pdf.worker.min.js localmente.
- Não apaga nem migra os arquivos da Biblioteca de Mídias.


## Prévia 86 — PDF direto pelo toque
- Ao abrir um PDF no cronograma, a primeira página é enviada ao Telão ao Vivo.
- Toque em uma miniatura para apresentar aquela página. A miniatura exibida fica verde.
- Tocar novamente na mesma página retira o PDF do telão e remove o verde.
- O botão Apresentar fica oculto apenas para PDFs.
- PDF continua com botão Minimizar e reabrir; ao abrir outras mídias, a grade e o player de PDF são fechados.
- Ao remover a página atualmente exibida, a apresentação é encerrada.


## Prévia 87 — PDF com rolagem própria e Imagem de Apoio
- Páginas do PDF em três colunas retangulares, com rolagem interna e altura limitada para manter visível a prévia à direita.
- Botão Imagem de Apoio na grade do PDF, com escolha de foto da biblioteca por dia da reunião; opção de limpar.
- Tocar no slide apresenta e marca verde; tocar novamente retira e exibe Imagem de Apoio, quando configurada.
- Recursos locais do mesmo navegador; apresentação em outro dispositivo depende de infraestrutura adicional.


## Prévia 88
- PDF abre somente a grade, sem apresentar página automaticamente. Toque em uma miniatura para apresentar e toque novamente para retirar e voltar ao apoio.
- Grade compacta: três miniaturas 16:9 por linha, sem X e sem espaçamento branco excessivo, rolagem interna.
- Imagem de Apoio acima do cronograma; transição em engrenagem acima do telão; sem controles extras ou nome do PDF abaixo do telão.
- Telão com moldura dourada discreta e conteúdo sem recorte.


## PRÉVIA 89 — IMAGEM DE APOIO DIRETO DA GALERIA
- Botão Imagem de Apoio acima do cronograma abre Galeria do aparelho, Fotos do aplicativo e Remover.
- Uma única imagem por dia: a foto escolhida da galeria é otimizada e salva em IndexedDB separado (reunioes3-apoio-v89), chave do dia, sem criar cópias na pasta FOTOS.
- Trocar substitui a imagem anterior; remover elimina a cópia local, sem alterar a galeria original.
- Fotos já salvas na biblioteca podem ser usadas como referência, sem duplicação.
- Telão em outra aba de mesma origem recupera Imagem de Apoio local da galeria. Sem sincronização entre aparelhos.
- No iPad horizontal, o painel do telão usa posição fixa na rolagem do cronograma (sticky).
- Não apague os dados do site nem mude a origem (domínio) para preservar a biblioteca atual.


## Prévia 90 — Telão Santuário
- Título TELÃO SANTUÁRIO acima, fora do cartão, com engrenagem de transição no mesmo cabeçalho.
- Removido botão Apresentar interno do Media Player; vídeo/foto entra automaticamente na apresentação ao ser selecionado, vídeo local permanece pausado aguardando Play. PDF continua a entrar somente com toque na página.
- Botão vermelho Encerrar separado, abaixo do Media Player, visível para fotos e vídeos.
- Prévia de vídeos/fotos/PDFs ajustada para preencher 100% a área 16:9, mesmo em conteúdos de proporções diferentes (pode deformar a imagem).
- Recursos anteriores preservados. Necessário testar no Safari/iPad.


## Prévia 91 — Imagem de Apoio e controles minimizados
- Imagem de Apoio configurada exclusivamente no Cronograma; a barra fica oculta enquanto a grade de PDF substitui a lista.
- A imagem de apoio é restaurada no próprio Telão Santuário ao encerrar vídeo/foto/PDF e permanece como fundo do telão durante a reprodução de músicas.
- O Media Player musical fica em um bloco próprio abaixo da prévia, sem ocultar o telão. Minimizar não interrompe o áudio.
- Os botões para reabrir PDF e música ficam reunidos abaixo do Telão Santuário, não flutuam mais no canto da tela.
- Cada dia continua com uma imagem de apoio própria; dados IndexedDB existentes são preservados.


## Prévia 93 — TELÃO SANTUÁRIO AO VIVO
- Título mais próximo da moldura e luz verde AO VIVO ao lado do título quando um conteúdo real estiver apresentado.
- Sem AO VIVO para Imagem de Apoio ou tela vazia.
- Pulsação sutil; respeita preferência de movimento reduzido.
- Minimizar a grade do PDF com ícone −, sem texto, com rótulo acessível.
