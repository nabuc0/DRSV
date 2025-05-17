const productTitleTemplates = [
    "Confira o novo ${productName}",
    "Olha só o ${productName} que chegou!",
    "Por que ${productName} está chamando tanta atenção",
    "${productName} chegou — dá uma olhada!",
    "Destaque da semana: ${productName}",
    "O que todo mundo está falando: ${productName}",
    "Apresentando: ${productName}",
    "Todo mundo falando do ${productName}",
    "${productName} acabou de chegar — veja agora",
    "O que está bombando: ${productName}",
    "O que está em alta: ${productName}",
    "Lançamento: ${productName}",
    "Você pode gostar de: ${productName}",
    "O que está fazendo sucesso: ${productName}",
    "Acabei de encontrar: ${productName}",
    "Um produto que você vai querer: ${productName}",
    "${productName} — Simples e incrível",
    "O que está na moda: ${productName}",
    "Escolha do dia: ${productName}",
    "Oferta do dia: ${productName}",
    "Dica do dia: ${productName}",
    "Olha só o que chegou: ${productName}",
    "Olha só o que eu encontrei: ${productName}",
    "Nem parece verdade: ${productName}",
    "O ${productName} que você estava esperando",
    "O ${productName} que faltava na sua vida",
    "Aquele ${productName} que você não sabia que precisava",
    "Só vendo para acreditar: ${productName}",
    "O ${productName} que vai fazer a diferença",
    "O ${productName} que vai mudar tudo",
    "Piscou e já era: ${productName}",
    "Vai deixar você de queixo caído: ${productName}",
    "Vai deixar passar? ${productName}",
    "Nem o mais exigente vai resistir: ${productName}",
];

const genericTitleTemplates = [
    "Não perca essa",
    "Destaque quente da semana",
    "Olha só o que chegou",
    "Novidade fresquinha chegou",
    "Olha só o que eu encontrei",
    "Vale a pena conferir",
    "Você não vai querer perder",
    "Produto em destaque hoje",
    "Achado fresquinho para você",
    "Mais uma oferta imperdível!",
    "O que está bombando hoje",
    "Olha só que legal",
    "O que está fazendo sucesso",
    "Destaque rápido de produto",
    "De volta com mais uma dica!",
    "Oferta do dia para você",
    "O que está em alta",
    "Novo produto no radar",
    "Corre para aproveitar",
    "Olha só o que eu encontrei",
    "Mais um achado incrível",
    "Produto que vale a pena",
    "Produto que chama atenção"
];

const introTemplates = [
    "Oi, pessoal! Olha só o que vale a pena conferir:",
    "Olha o que acabou de chegar — dá uma olhada:",
    "Oi, tudo bem? Olha só o que eu encontrei:",
    "Achei algo legal para você hoje:",
    "Dica rápida de hoje:",
    "Não passa essa oportunidade:",
    "Escolha do dia chegando:",
    "Hora de conhecer o produto do dia:",
    "Novidade fresquinha para você:",
    "Destaque rápido de um achado:",
    "Olha só o que eu encontrei:",
    "Um produto que você vai querer ver:",
    "Vamos direto ao achado de hoje:",
    "Olha só o que está bombando:",
    "Da pra acreditar que eu encontrei isso?",
    "Galera, vocês não vão acreditar no que eu achei:",
    "Gente, olha só o que eu encontrei:",
    "Oi pessoal, mais um dia e mais um achado:",
    "Oi, tudo bem? Olha só o que eu encontrei:",
    "Sextou em algum lugar do mundo e eu trouxe uma dica:",
    "Essa dica é para você que está sempre ligado:",
    "Não dá pra perder essa oportunidade:",
    "Quanto mais eu vejo, mais eu gosto:",
];

const outroTemplates = [
    "Espero que tenha gostado — até a próxima!",
    "Por hoje é isso, até o próximo post!",
    "Valeu por passar aqui!",
    "Vem mais coisa legal por aí — fica ligado!",
    "Curtiu o achado? Tem mais vindo!",
    "Espero que tenha gostado — até a próxima!",
    "Até a próxima!",
    "Obrigado por ler!",
    "Espero que tenha gostado!",
    "Espero que tenha curtido!",
    "Espero que tenha sido útil!",
    "Tomara que esse tenha chamado sua atenção!",
    "Salve nosso site para ver mais dicas todo dia!",
    "Espero que tenha gostado do achado!",
    "Por hoje é só!",
    "O que achou? Espero que tenha gostado!",
    "Obrigado por acompanhar!",
    "Obrigado pela confiança!",
    "Como sempre, espero que tenha gostado!",
    "Não esquece de voltar para mais dicas! Abraços!",
    "Como que eu consegui achar isso? Espero que tenha gostado!",
];

function generateTitle(productName = null) {
    const templates = productName ? productTitleTemplates : genericTitleTemplates;
    const template = templates[Math.floor(Math.random() * templates.length)];
    return productName ? template.replace(/\$\{productName\}/g, productName) : template;
}

function generateIntro() {
    return introTemplates[Math.floor(Math.random() * introTemplates.length)];
}

function generateOutro() {
    return outroTemplates[Math.floor(Math.random() * outroTemplates.length)];
}

module.exports = {
    generateTitle,
    generateIntro,
    generateOutro
};
