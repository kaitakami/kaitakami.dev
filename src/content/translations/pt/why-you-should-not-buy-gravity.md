---
title: "Por que você não deveria comprar o Gravity"
description: "O que deu errado com o boilerplate e o que teríamos feito de diferente."
---

## Introdução

Depois de meses trabalhando com o Gravity, quero contar por que a experiência foi tão frustrante para nós. Se você está pensando em usar esse boilerplate de SaaS, espero que a nossa história ajude você a tomar uma decisão mais bem informada.

## Principais problemas do Gravity

### 1. **Documentação incompleta e desorganizada**

A documentação do Gravity é praticamente inexistente. Não há orientações claras sobre input/output, e funcionalidades centrais ficam totalmente sem documentação. Essa falta de clareza torna o trabalho com ele muito difícil.

### 2. **Funcionalidades essenciais ausentes**

O Gravity diz ser um boilerplate de SaaS completo, mas falta muita coisa:
   - **Logging:** Não tem logging de verdade, só console logs espalhados pelo código.
   - **Suporte a TypeScript:** Não tem suporte a TypeScript, então tivemos que configurar por conta própria, o que trouxe uma complexidade desnecessária.
   - **Rate limits e configuração do Swagger:** Não há opções nativas para definir rate limits personalizados nem para configurar o Swagger para a documentação da API.
   - **Docker e linters:** Sem suporte a Docker e sem nenhum tipo de linting de código (ESLint ou Biome).
   - **Testes confiáveis:** Os testes que vêm com ele são insuficientes e quebram com qualquer implementação mais complexa.
   - **Serviços de IA e de e-mail:** Endpoints de IA desatualizados e um serviço de e-mail que não funciona direito só aumentam os problemas.
   - **Middleware:** Não há suporte a middleware, um recurso básico que se espera de qualquer aplicação moderna. Isso deixa o tratamento de requests e responses mais complicado do que deveria.

### 3. **Limitações do backend**

A estrutura do backend do Gravity parece organizada no começo, mas desmorona quando é preciso fazer alterações. Adicionar ou mudar alguma funcionalidade muitas vezes quebra o sistema, o que o torna inflexível e difícil de trabalhar.

### 4. **Desafios do frontend**

O frontend traz vários desafios:
   - **Tratamento dos dados do usuário:** Ele usa local storage para os dados do usuário, o que é ineficiente e não escala bem. Guardar tudo no contexto do usuário significa que, toda vez que alguém abre o site, todos os dados dessa pessoa são buscados, o que é desnecessário e caro. Uma abordagem melhor seria usar cookies ou guardar só o ID do usuário e buscar os dados adicionais conforme a necessidade.
   - **Auth context:** O auth context não retorna o ID do usuário por padrão, o que complica a identificação do usuário. Saber o ID do usuário é fundamental para muitas operações, mas essa informação básica não está facilmente disponível.
   - **Dificuldades de migração:** A mistura de TailwindCSS com SASS dificulta a migração para um único framework de estilização. E não é só uma questão de CSS: a implementação inteira torna a migração para outras soluções ou frameworks difícil e demorada.
   - **Wrappers em excesso:** O uso exagerado de componentes wrapper aumenta a complexidade e dificulta a migração. Componentes simples, como botões, têm wrappers demais que adicionam funcionalidades desnecessárias, o que transforma até pequenas mudanças em uma dor de cabeça.
   - **Hooks customizados:** Usar um hook customizado `useAPI` em vez de soluções padrão adiciona uma complexidade desnecessária. Esse hook usa Axios por baixo dos panos, mas isso não fica claro em lugar nenhum, o que gera confusão e métodos inconsistentes de comunicação com o backend.

### 5. **Problemas de performance e de atualização**

O Gravity não foi pensado para ter uma boa performance nem para ser fácil de atualizar:
   - **Server components:** Ele não está preparado para server components, o que torna as atualizações futuras complicadas. Por um preço de US$ 500 a US$ 3000, esperávamos suporte a recursos recentes como server components.
   - **Performance ruim:** A aplicação não prioriza performance, o que gera ineficiências.

### 6. **Produto sem reembolso**

O fato de o Gravity não oferecer reembolso diz muito sobre a confiança no produto. Talvez o autor não ache que o produto seja ruim, mas a nossa experiência foi tão negativa que acreditamos que essa política existe porque o produto tem falhas sérias.

### 7. **Difícil implementar novas funcionalidades**

Implementar novas funcionalidades no Gravity é uma luta. Por exemplo, adicionar os componentes do shadcn/ui levou meses para o autor, uma tarefa que deveria ter levado poucos dias. Essa dificuldade vem da arquitetura ruim tanto do frontend quanto do backend.

## Frustrações pessoais

1. **Alterações dolorosas:** Até mudanças simples muitas vezes exigiam horas de debugging e testes. Era desanimador gastar tanto tempo em tarefas que deveriam ser simples.

2. **Estrutura confusa:** A estrutura de arquivos confusa e a mistura de tecnologias davam a sensação de que estávamos o tempo todo reinventando a roda. Isso era especialmente frustrante na hora de implementar soluções que são padrão de mercado.

3. **Falta de clareza:** Com tantas funcionalidades sem documentação e processos pouco claros, ficávamos tentando adivinhar como as coisas deveriam funcionar. Esse chute levou a inúmeros erros e muito tempo perdido.

## Nossa recomendação

Com base na nossa experiência, não dá para recomendar o Gravity para ninguém. Existem muitas alternativas melhores, inclusive gratuitas, que são bem mais confiáveis e eficientes. O Gravity nos atrasou, causou inúmeras dores de cabeça e deixou o nosso código mais propenso a erros.

## O que teríamos feito de diferente

Se tivéssemos a chance, teríamos evitado o Gravity completamente. Construir a nossa própria solução ou usar outro boilerplate teria sido muito mais produtivo. Soluções como Supabase para auth ou NextAuth para Next.js teriam sido escolhas bem melhores.

## Daqui para frente

Decidimos deixar o Gravity para trás. Vamos manter os endpoints atuais do Gravity como legado e construir um novo backend para as próximas implementações. O frontend vai continuar no Gravity por enquanto, já que é mais fácil migrar depois.

## Nota final

No fim das contas, essa é a nossa opinião e não representa a verdade absoluta. Não achamos que o autor seja ruim de forma alguma; o Gravity poderia ter sido um boilerplate muito bom há 4 anos, mas não agora, em 2024.

A nossa experiência com o Gravity foi extremamente negativa. Recomendamos fortemente que você não use nem compre o Gravity. Existem opções muito melhores por aí que vão poupar seu tempo, seu dinheiro e sua paciência. Evite o Gravity a todo custo.
