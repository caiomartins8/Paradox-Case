//  01 - CARREGAR PÁGINA

function iniciarCarregamento() {
    const barra = document.querySelector(".loader-bar");
    if (barra) {
        let largura = 0;
        const tempo = setInterval(frame, 30);
        // o 30 representa que a funcao é executada a cada 30 milissegundos sendo assim cada vez a barra enche 1 ate ser preenchida 

        function frame() {
            if (largura >= 100) {
                clearInterval(tempo);
                window.location.href = "pageInicial.html";
                //quando a barra chega no 100 o clear para a contagem e direciona para a pagina inciial

            } else {

                // enquanto a largura for menor que 100%, o else aumenta o valor e atualiza a barra
                largura++;
                barra.style.width = largura + '%';
            }
        }
    }
}

iniciarCarregamento()





// 02 - ABRIR MODAL

function abrirModal(idModal) {
    const modal = document.getElementById(idModal);
    // o modal esta escondido , entao e verificado e se ele existe a classe hide e removida e ele aparece na tela

    if (modal) {
        modal.classList.remove('hide');
    }
}




// 03 - FECHAR MODAL

function fecharModal(idModal) {
    const modal = document.getElementById(idModal);
    // o modal esta escondido , entao e verificado e se ele existe a classe hide e removida e ele aparece na tela
    if (modal) modal.classList.add("hide");

    // quando fecha o modal da ressurreição
    if (idModal === "overlay-arakh-revive") {

        // volta música do boss
        const musicaBoss = document.getElementById("boss-music");
        if (musicaBoss) {
            musicaBoss.currentTime = 0;
            musicaBoss.play().catch(() => { });
            // da play na musica e o  .catch() evita erro caso o navegador bloqueie o audio
        }

        // Arakh ataca primeiro
        setTimeout(() => {
            turnoVilao();
        }, 800); //cria um atrasado de 0,8 sgeundos para o ataque do arakh
    }
}




// 04 - SELECIONAR HERÓI

function selecionarHeroi(nome, imagem) {
    localStorage.setItem("heroiSelecionado", nome);
    localStorage.setItem("heroiImagem", imagem);
    localStorage.setItem("exibirToast", "true");
    // salva os dados do heroi , imagem e salva para o toast de aviso de heroi escolhido e em seguida é redirecionado a tela inicial

    window.location.href = "pageInicial.html";
}




// 05 - MUDAR HERÓI DO CARROSEL


let indiceAtual = 0;

function mudarHeroi(direcao) {
    const herois = document.querySelectorAll(".heroi-card");
    if (!herois.length) return;

    herois.forEach(h => h.style.display = "none"); //esconde todos os herois

    indiceAtual += direcao; //soma e subtrai o indice (vai pra frente e para tras)

    if (indiceAtual >= herois.length) indiceAtual = 0; // se passar do ultimo volta para o primeiro
    if (indiceAtual < 0) indiceAtual = herois.length - 1; // se voltar do primeiro vai para o utlimo

    herois[indiceAtual].style.display = "flex";
}




// 06 - VERIFICA SE A PESSOA TEM UM HERÓI SELECIONADO ANTES DE ENTRAR EM MISSÕES 

function verificarMissao(event) {
    event.preventDefault(); // bloqueia a ação padrao e deixa que o javascript controle

    const heroiSelecionado = localStorage.getItem('heroiSelecionado');
    const toastBox = document.getElementById('toast-box');
    const toastMsg = document.getElementById('toast-msg');

    if (!heroiSelecionado) {
        if (toastMsg) {
            toastMsg.innerText = "Nenhum herói selecionado!"; //caso tente entrar sem ter um herói aparece um toast de aviso 
        }
        if (toastBox) {
            toastBox.classList.remove('hidden'); // remove a classe que esconde e adiciona a que mostra
            toastBox.classList.add('show');
            setTimeout(() => {
                toastBox.classList.remove('show'); // remove a classe que mostra e adiciona a que esconde
                toastBox.classList.add('hidden');
            }, 3000); // mostra por 3 segundos 
        }
        return;
    }
    window.location.href = "pageMissoes.html"; // permite entrar na pagina de missoes 
}




// 07 - VARIÁVEL GLOBAL 

let monstrosDerrotados = 0;
let listaMonstrosApi = []; // lista de monstros da API

const HEROIS = {
    // os herois jogaveis são objetos que estão dentro do objeto HEROIS
    Eisen: { nome: "Eisen", hpMax: 1250, hp: 1250, atk: 250, crt: 450, cura: 150, def: 350 },
    Sindel: { nome: "Sindel", hpMax: 900, hp: 900, atk: 350, crt: 600, cura: 400, def: 200 },
    Venus: { nome: "Vênus", hpMax: 800, hp: 800, atk: 400, crt: 800, cura: 100, def: 150 }
};

let heroi = null;
let vilao = null;
let turno = "heroi";
let mult = 1;
let dadoRolado = false;
let rodadaHeroi = 0;
let criticoDisponivel = true;
let turnosHeroi = 0;          // conta turnos do herói
let criticoBloqueado = false;  // bloqueia crítico se usado
let goldGanho = 0;
let xpGanho = 0;
let monstrosParaVencer = 3; // padrão
let manaAtual = 0; // 0, 50 ou 100
let resultadoDado = null; // guarda o valor real do D20




//08 - DOM CONTENT LOADED

document.addEventListener("DOMContentLoaded", () => {

    if (document.body.classList.contains("page-loading")) { //espera o HTML carregar e roda o loading só na página certa
        iniciarCarregamento();
    }
});




//09 - DOM CONTENT LOADED

document.addEventListener("DOMContentLoaded", () => {

    // define número de monstros para vencer conforme a missao
    const paginaAtual = window.location.pathname;

    if (paginaAtual.includes("pageCombate1")) {
        monstrosParaVencer = 3; // Pântano
    }

    else if (paginaAtual.includes("pageCombate2")) {
        monstrosParaVencer = 5; // Masmorra
    }

    else if (paginaAtual.includes("pageCombate3")) {
        monstrosParaVencer = 7; // Castelo 
    }
    carregarListaDeMonstros();




    // exibe o primeiro herói do carrossel ao carregar a página
    const heroisCarrossel = document.querySelectorAll(".heroi-card");
    if (heroisCarrossel.length > 0) {
        heroisCarrossel[0].style.display = "flex";
    }




    // modal dom 
    const modalBoasVindas = document.getElementById("modalBoasVindas");
    const btnConfirmar = document.getElementById("btnFechar");
    const inputNome = document.getElementById("inputPegarNome");
    const avisoNomeElemento = document.getElementById("aviso-nome");




    // atualizar texto de inicio com nome 
    function atualizarTextoAviso(nome) {
        if (avisoNomeElemento) {
            avisoNomeElemento.innerHTML = `Olá ${nome}, antes de Entrar em uma <br> missão escolha seu herói!`;
        }
    }




    // modal nome jogador
    if (modalBoasVindas || avisoNomeElemento) {
        const nomeSalvo = localStorage.getItem("nomeDoJogador");//salva o nome

        if (nomeSalvo) {
            atualizarTextoAviso(nomeSalvo); //atualizado texto com nome
            if (modalBoasVindas) modalBoasVindas.close(); //fecha
        } else {
            if (modalBoasVindas) modalBoasVindas.showModal(); //caso nao tenha nome ele continua aberto
        }

        // confirmar nome jogador
        if (btnConfirmar) {
            btnConfirmar.onclick = function () {
                let nomeDigitado = inputNome.value;
                if (nomeDigitado.trim() === "") {
                    alert("Por favor, diga seu nome, Cavaleiro!");
                    return;
                }
                localStorage.setItem("nomeDoJogador", nomeDigitado);
                atualizarTextoAviso(nomeDigitado);
                modalBoasVindas.close();
            };
        }
    }




    // toast de heroi escolhido 
    const toastBox = document.getElementById('toast-box');

    if (toastBox && localStorage.getItem('exibirToast') === 'true') {
        let heroiNome = localStorage.getItem('heroiSelecionado');
        let msg = document.getElementById('toast-msg');
        if (msg) msg.innerText = `Herói ${heroiNome} escolhido com sucesso!`; // pega o nome do heroi apos ser escolhido e joga no toast de aviso 

        toastBox.classList.remove('hidden'); // remove a classe hidden e adiciona a show
        toastBox.classList.add('show');
        setTimeout(() => {
            toastBox.classList.remove('show');// remove a classe show e adiciona a hidden
            toastBox.classList.add('hidden');
        }, 3000); // 3 segundos 
        localStorage.removeItem('exibirToast');
    }

    // lógica de combate
    const nomeHeroi = localStorage.getItem("heroiSelecionado");
    if (HEROIS[nomeHeroi]) { // so roda se tiver herói válido (página de missão)
        heroi = structuredClone(HEROIS[nomeHeroi]);// cria uma cópia do herói para uso na batalha pois os dados alterados na batalha alterariam o objeto original

        manaAtual = 0;
        atualizarMana();


        // verifica se os elementos de combate existem antes de atualizar
        if (document.querySelector(".bar-fill")) {
            atualizarHeroi();
        }

        const atkBtn = document.querySelector(".btn-atack");
        const crtBtn = document.querySelector(".btn-critico");
        const curaBtn = document.querySelector(".btn-cura");
        const dadoBtns = document.querySelectorAll(".btn-dado");

        if (atkBtn && crtBtn && curaBtn && dadoBtns.length) {
            atkBtn.onclick = atacar;
            crtBtn.onclick = critico;
            curaBtn.onclick = curar;
            dadoBtns.forEach(b => b.addEventListener("click", rolarDado)); // adiciona evento de clique em todos os botões de dado

        }

        const vilaoBtn = document.querySelector("#dp-vilao button");

        if (vilaoBtn) {
            vilaoBtn.onclick = gerarVilao;
        }

        // gera vilão na página de combate

        if (window.location.pathname.includes("pageCombate1") ||
            window.location.pathname.includes("pageCombate2")) {
            gerarVilao(); // gera o vilão apenas nas páginas de combate

        }
        if (window.location.pathname.includes("pageCombate3")) {
            // === BOSS FINAL ===
            vilao = structuredClone(ARAKH);

            const nomeVilaoEl = document.querySelector(".char-name-vilao");
            const imgVilaoEl = document.querySelector("#dp-vilao img");

            if (nomeVilaoEl) nomeVilaoEl.innerText = vilao.nome;
            if (imgVilaoEl) imgVilaoEl.src = "images/vilao-teste/Arakh.png";

            atualizarVilao();

            // === MÚSICA DO BOSS ===
            const musicaBoss = document.getElementById("boss-music");

            if (musicaBoss) {
                musicaBoss.volume = 0.6;

                // toca após primeira interação (evita bloqueio do navegador)
                document.addEventListener("click", () => {
                    if (musicaBoss.paused) {
                        musicaBoss.play().catch(() => { });
                    }
                }, { once: true });
            }
        }

    }




    const nomeHeroiUI = document.getElementById("nome-heroi");
    const imgHeroiUI = document.getElementById("img-heroi");

    // atualiza UI do herói selecionado
    if (nomeHeroiUI && imgHeroiUI) {
        const nome = localStorage.getItem("heroiSelecionado");
        const img = localStorage.getItem("heroiImagem");

        if (!nome || !img) {
            alert("Nenhum herói selecionado!");
            window.location.href = "pageHerois.html";
            return;
        }

        nomeHeroiUI.innerText = nome;
        imgHeroiUI.src = img;
    }

});




//FETCH
// 10 - BUSCAR VILOES DA API

async function carregarListaDeMonstros() {
    try {
        const resposta = await fetch("https://www.dnd5eapi.co/api/monsters"); //busca viloes da api

        const dados = await resposta.json(); // trasnforma a resposta da api em json

        listaMonstrosApi = dados.results; // salva o monstro em uma variavel

        console.log("Lista de monstros carregada via API!", listaMonstrosApi.length, "encontrados."); //confirmação de sucesso e quantos monstros vieram
    } catch (erro) {
        //caso de erro ao buscar da api imprime um montro generico como tratamento de erro 
        console.error("Erro ao buscar lista de monstros:", erro);
        listaMonstrosApi = [{ name: "Monstro Genérico", url: null }];
    }
}




// 11- GERAR VILÃO 

async function gerarVilao() {

    // pega monstro aleátorio da lista 
    const indiceSorteado = Math.floor(Math.random() * listaMonstrosApi.length);
    const monstroBasico = listaMonstrosApi[indiceSorteado];// ajusta o numero de monstros da lista para a quantidade a ser sorteada e pega um aleatoriamente  

    const nomeVilaoEl = document.querySelector(".char-name-vilao");
    if (nomeVilaoEl) nomeVilaoEl.innerText = "Invocando " + monstroBasico.name + "..."; //carregamneto 

    try {
        let statsVilao = {};

        if (monstroBasico.url) {
            // busca detalhes (HP, Stats)
            const respostaDetalhes = await fetch("https://www.dnd5eapi.co" + monstroBasico.url);
            const detalhes = await respostaDetalhes.json();

            // ajuste de baleancemaneto para o jogo
            const multiplicadorVida = 15;
            const nivel = detalhes.challenge_rating || 1;

            // define os status do vilão

            //vilao mais forte conforme o jogo avança, mas nunca desbalanceado
            statsVilao = {
                nome: detalhes.name,
                hpMax: (detalhes.hit_points || 50) * multiplicadorVida,
                atk: Math.floor((nivel * 10) + 50) + (Math.random() * 100)
            };

        } else {
            // caso de erro e nao puxe detalhes
            statsVilao = { nome: "Monstro Desconhecido", hpMax: 800, atk: 200 };
        }

        // define o objeto vilão 
        vilao = {
            nome: statsVilao.nome,
            hp: statsVilao.hpMax,
            hpMax: statsVilao.hpMax,
            atk: statsVilao.atk
        };

        // imagem local para o vilão
        const imagensLocais = [
            "images/vilao-teste/orc.png",
            "images/vilao-teste/goblin.png",
            "images/vilao-teste/esqueleto.png",
            "images/vilao-teste/demonio.png",
            "images/vilao-teste/bruxa-vila.png",
            "images/vilao-teste/galand.png",
            "images/vilao-teste/hidra.png"
        ];

        //gera uma das imagens aleatorias 
        const imgSorteada = imagensLocais[Math.floor(Math.random() * imagensLocais.length)];

        const imgEl = document.querySelector("#dp-vilao img");
        if (imgEl) imgEl.src = imgSorteada;

        // atualiza UI
        if (nomeVilaoEl) nomeVilaoEl.innerText = vilao.nome;
        atualizarVilao();

        turno = "heroi";

    } catch (erro) {
        console.error("Erro ao gerar vilão detalhado:", erro);
        alert("Erro ao invocar monstro. Tente novamente.");
    }
}





// 12 - CÁLCULO DE DANO
function calcularDano(base) {
    const variacao = Math.random() * 0.4 + 0.8; // 80% a 120%
    return Math.floor(base * variacao);
}



//GAMEPLAY E COMBATE

// 13 - ATUALIZAR HEROI

function atualizarHeroi() {
    if (!heroi) return;

    heroi.hp = Math.floor(heroi.hp); // garante hp em numero inteiro

    const porcentagem = (heroi.hp / heroi.hpMax) * 100;
    const barra = document.querySelector(".bar-fill");
    const hpDisplay = document.getElementById("hp-heroi");

    if (barra) barra.style.width = porcentagem + "%";
    if (hpDisplay) hpDisplay.innerText = `${heroi.hp}/${heroi.hpMax}`; //imprime a vida atual e a vida maxima na barra de vida
}



// 14 - ATUALIZAR VILAO

function atualizarVilao() {
    if (!vilao) return;

    const porcentagem = (vilao.hp / vilao.hpMax) * 100;
    const barra = document.querySelector(".bar-fill-vilao");
    const nomeEl = document.querySelector(".char-name-vilao");
    const hpDisplay = document.getElementById("hp-vilao");

    if (barra) barra.style.width = porcentagem + "%";
    if (nomeEl) nomeEl.innerText = vilao.nome;
    if (hpDisplay) hpDisplay.innerText = `${vilao.hp}/${vilao.hpMax}`;

    //  AURA DO VAZIO (ARAKH) 
    if (
        vilao.nome.includes("Arakh") &&
        !vilao.auraVazioAtiva &&
        vilao.hp > 0 &&
        vilao.hp <= vilao.hpMax * 0.5
    ) {
        vilao.auraVazioAtiva = true;
        abrirModal("overlay-arakh");
    }

    // verifica se e o arakh e se chegou a segunda fase da batalha
    // quando a vida cai 50% a aura do vazio ativa 
    // e exibe um modal visual para marcar a mudança de fase do boss.


    //  MORTE DO VILÃO 
    if (vilao.hp > 0) return;

    //  BOSS FINAL: ARAKH 
    if (vilao.nome.includes("Arakh")) {

        //  MORTE DEFINITIVA (segunda morte)
        if (vilao.morteFalsa) {

            // RECOMPENSA DO BOSS
            const recompensaBossGold = 1000;
            const recompensaBossXp = 500;

            // atualiza acumuladores (modal)
            goldGanho += recompensaBossGold;
            xpGanho += recompensaBossXp;

            // atualiza total (storage)
            let goldTotal = parseInt(localStorage.getItem("gold")) || 0;
            goldTotal += recompensaBossGold;
            localStorage.setItem("gold", goldTotal);

            mostrarVitoria();
            return;
        }



        //  MORTE FALSA (primeira morte)
        vilao.morteFalsa = true;

        // pausa música do boss
        const musicaBoss = document.getElementById("boss-music");
        if (musicaBoss) musicaBoss.pause();

        setTimeout(() => {
            // revive com 20% da vida
            vilao.hp = Math.floor(vilao.hpMax * 0.2);
            atualizarVilao();

            abrirModal("overlay-arakh-revive");

            const voz = document.getElementById("arakh-voz");
            if (voz) {  // reproduz a voz do boss Arakh garantindo que o áudio comece do início e evitando erros caso o áudio não exista.

                voz.currentTime = 0;
                voz.volume = 1;
                voz.play().catch(() => { });
            }

        }, 1000);//espera um segundo 

        return;
    }

    // MONSTROS COMUNS
    monstrosDerrotados++;
    goldGanho += 50;
    xpGanho += 60;

    if (monstrosDerrotados >= monstrosParaVencer) {
        mostrarVitoria();
        return;
    }

    setTimeout(() => {
        gerarVilao();
    }, 1500);
}




// 15 - ROLAR DADO
function rolarDado() {
    if (turno !== "heroi") return;

    if (dadoRolado) {
        alert("Você já rolou o dado neste turno!");
        return;
    }

    const textoDesktop = document.getElementById("resultado-dado-desktop");
    const textoMobile = document.getElementById("resultado-dado-mobile");

    // roletas visuais
    const roletaDesktop = document.getElementById("roleta-desktop");
    const roletaMobile = document.getElementById("roleta-mobile");

    let contador = 0;

    // animação da roleta
    const animacao = setInterval(() => {
        const numeroFake = Math.floor(Math.random() * 20) + 1;

        if (roletaDesktop) roletaDesktop.textContent = numeroFake;
        if (roletaMobile) roletaMobile.textContent = numeroFake;

        contador++;
    }, 80);

    // para a animação e define o número real
    setTimeout(() => {
        clearInterval(animacao);

        const n = Math.floor(Math.random() * 20) + 1;

        resultadoDado = n;   // valor real do D20
        dadoRolado = true;

        if (roletaDesktop) roletaDesktop.textContent = n;
        if (roletaMobile) roletaMobile.textContent = n;

        if (textoDesktop) {
            textoDesktop.innerText = `O número sorteado foi :`;
        }

        if (textoMobile) {
            textoMobile.innerText = `O número sorteado foi : `;
        }

    }, 1200);
}




// 16 - BOTÃO DE ATAQUE 

if (!podeAgir()) return;

// ERRO
if (resultadoDado <= 5) {
    alert("❌ Você errou o ataque!");
    fimTurnoHeroi();
    return;
}

let dano;

//  CRÍTICO NATURAL
if (resultadoDado === 20) {
    dano = calcularDano(heroi.atk) * 2;
    alert("☠️ CRÍTICO NATURAL!");
}
//  ACERTO FORTE
else if (resultadoDado >= 15) {
    dano = calcularDano(heroi.atk) * 1.4;
}
//  ACERTO NORMAL
else {
    dano = calcularDano(heroi.atk);
}

vilao.hp -= Math.floor(dano);
if (vilao.hp < 0) vilao.hp = 0;

manaAtual += 50;
if (manaAtual > 100) manaAtual = 100;
atualizarMana();

atualizarVilao();
fimTurnoHeroi();




// 17 - BOTÃO DE CRÍTICO

function critico() {
    if (!podeAgir()) return;

    if (vilao?.auraVazioAtiva) {
        alert("A Aura do Vazio bloqueia ataques críticos!");
        return;
    }

    if (manaAtual < 100) {
        alert("Mana insuficiente!");
        return;
    }

    // chance de falhar
    if (resultadoDado <= 8) {
        alert("❌ O ataque crítico falhou!");
        manaAtual = 0;
        atualizarMana();
        fimTurnoHeroi();
        return;
    }

    // dano crítico do herói aplicando um multiplicado e reduz a vida do vilão com o valor final do ataque
    const dano = calcularDano(heroi.crt) * 1.8;
    vilao.hp -= Math.floor(dano);

    manaAtual = 0;
    atualizarMana();

    atualizarVilao();
    fimTurnoHeroi();
}




// 18 - BOTÃO DE CURA 

function curar() {

    // Verifica se o herói pode agir neste turno; se não puder, a função é encerrada
    if (!podeAgir()) return;

    // Calcula o valor da cura com base no atributo de cura do herói e aplica o multiplicador atual
    const cura = Math.floor(heroi.cura * mult);

    // adiciona a cura a vida atual do herói
    heroi.hp += cura;

    // Garante que a vida do herói não ultrapasse o valor máximo permitido
    if (heroi.hp > heroi.hpMax) heroi.hp = heroi.hpMax;

    manaAtual += 50;
    if (manaAtual > 100) manaAtual = 100;

    atualizarMana();
    atualizarHeroi();
    fimTurnoHeroi();
}




// 19 - TURNO DO VILÃO

function turnoVilao() {
    turno = "vilao";

    setTimeout(() => {
        const dadoVilao = Math.floor(Math.random() * 20) + 1;

        let danoVilao = calcularDano(vilao.atk);

        //  crítico do vilão
        if (dadoVilao >= 18) {
            danoVilao *= 1.5;
        }

        // aplica defesa do herói
        heroi.hp -= Math.max(30, danoVilao - heroi.def * 0.2);

        //  garante que HP não fique negativo
        if (heroi.hp < 0) heroi.hp = 0;

        //  atualiza a interface
        atualizarHeroi();

        //  verifica se o herói morreu
        if (heroi.hp <= 0) {
            mostrarDerrota(); // derrota do player
            return;
        }

        // volta o turno
        turno = "heroi";
        dadoRolado = false;
        resultadoDado = null;

    }, 1200);
}





// 20 - PODE AGIR 

function podeAgir() {
    if (!vilao) {
        alert("Gere um inimigo primeiro!");
        return false;
    }

    if (turno !== "heroi") return false;

    if (!dadoRolado) {
        alert("Você precisa rolar o dado antes de agir!");
        return false;
    }

    return true;
}





//21 - FIM DO TURNO HEROI

function fimTurnoHeroi() {
    dadoRolado = false; //  libera o dado pro próximo turno
    mult = 1;

    turnosHeroi++;

    //  libera o crítico a cada 2 turnos do herói
    if (turnosHeroi % 2 === 0) {
        criticoBloqueado = false;
    }

    turnoVilao();
}





// 22 - MODAL DE DERROTA
function mostrarDerrota() {
    const overlay = document.getElementById("overlay-derrota");
    if (overlay) {
        overlay.classList.remove("hide");
    }
}




// 22 - MODAL DE DERROTA , RECOMPENSAS E DESBLOQUEIO DE FASE

function mostrarVitoria() {

    // recompensas
    let goldTotal = parseInt(localStorage.getItem("gold")) || 0;
    let xpTotal = parseInt(localStorage.getItem("xp")) || 0;
    let nivel = parseInt(localStorage.getItem("nivel")) || 1;

    goldTotal += goldGanho;
    xpTotal += xpGanho;

    while (xpTotal >= 100) { // a cada 100 de xp sobe um nivel 
        xpTotal -= 100;
        nivel++;
    }

    localStorage.setItem("gold", goldTotal);
    localStorage.setItem("xp", xpTotal);
    localStorage.setItem("nivel", nivel);

    // desbloqueio de fase
    const faseAtual = window.location.pathname;
    let faseLiberada = parseInt(localStorage.getItem("faseLiberada")) || 1;

    if (faseAtual.includes("pageCombate1") && faseLiberada < 2) {
        localStorage.setItem("faseLiberada", 2);
    }

    if (faseAtual.includes("pageCombate2") && faseLiberada < 3) {
        localStorage.setItem("faseLiberada", 3);
    }
    // controla o progresso do jogador salvando no localStorage qual fase já foi liberada, permitindo o desbloqueio gradual conforme o jogador avança pelas páginas de combate

    // modal de vitória
    const texto = document.querySelector("#overlay-vitoria p");
    if (texto) {
        texto.innerText = `Monstros derrotados: ${monstrosDerrotados}`;
    }

    const recompensa = document.querySelector("#recompensa-modal");
    if (recompensa) {
        recompensa.innerHTML = `
            <div class="dp">
                <img src="images/elementos/coin.png">
                <p>+ ${goldGanho}</p>
            </div>
            <div class="dp">
                <img src="images/elementos/xp.png">
                <p>+ ${xpGanho} XP</p>
            </div>
        `;
    } // atualiza o gold e xp do elemento html do modal pelos dados certos 

    abrirModal("overlay-vitoria");
}





// 23 - IR PARA PÁGINA DE INICIO

function irParaInicio() {
    window.location.href = "pageInicial.html";
}





// 24 - DOM CONTENT LOADED 

document.addEventListener("DOMContentLoaded", () => {
    const faseLiberada = parseInt(localStorage.getItem("faseLiberada")) || 1; //fase que comeca

    for (let i = 1; i <= faseLiberada; i++) { // apos concluir a primeir e somado mais um e a segunda e desbloqueada trocando a class paea trocar a estilização da missao na tela 
        const fase = document.getElementById(`fase-${i}`);
        if (fase) {
            fase.classList.remove("a-transparente");
            fase.style.pointerEvents = "auto";
        }
    }

    // bloqueia fases ainda não liberadas
    for (let i = faseLiberada + 1; i <= 3; i++) {
        const fase = document.getElementById(`fase-${i}`);
        if (fase) {
            fase.style.pointerEvents = "none"; // bloqueia eventos 
        }
    }

    const headerRecompensas = document.getElementById("recompensas-header");

    if (headerRecompensas) {
        const gold = parseInt(localStorage.getItem("gold")) || 0;
        const nivel = parseInt(localStorage.getItem("nivel")) || 1;

        const valores = headerRecompensas.querySelectorAll("p");

        if (valores.length >= 2) {
            valores[0].innerText = gold;
            valores[1].innerText = `Nível ${nivel}`;
        }
    }
});



//BOSS FINAL 

const ARAKH = {
    nome: "Arakh, Asceta do Vazio",
    hpMax: 1700,
    hp: 1700,
    atk: 280,
    def: 250,
    auraVazioAtiva: false,
    morteFalsa: false
};



const imgArakh = document.getElementById("img-arakh");

if (imgArakh) { // ao clicar na imagem de arakh e possivel ver o modal da aura do vazio 
    imgArakh.addEventListener("click", () => {
        abrirModal("overlay-arakh");
    });
}


//  LIBERA ÁUDIOS APÓS PRIMEIRA INTERAÇÃO 
document.addEventListener("click", () => {
    const musicaBoss = document.getElementById("boss-music");
    const vozArakh = document.getElementById("arakh-voz");

    if (musicaBoss && musicaBoss.paused) {
        musicaBoss.volume = 1;
        musicaBoss.play().catch(() => { });
    }

    if (vozArakh) {
        vozArakh.load(); // prepara o áudio
    }
}, { once: true });

// libera os áudios do jogo após a primeira interação do usuário,
// evitando bloqueio automático de áudio pelos navegadores


// 25 ATUALIZAR MANA 
function atualizarMana() {
    const manaBar = document.getElementById("mana-fill");
    const btnCritico = document.querySelector(".btn-critico");

    if (manaBar) {
        manaBar.style.width = manaAtual + "%";
    }

    if (manaAtual >= 100) {
        btnCritico.classList.remove("bloqueado");
        btnCritico.classList.add("pronto");
        criticoBloqueado = false;
    } else {
        btnCritico.classList.add("bloqueado");
        btnCritico.classList.remove("pronto");
        criticoBloqueado = true;
    }
}
