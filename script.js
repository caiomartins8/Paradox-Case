// Função para mudar de página (Loading Bar)
function iniciarCarregamento() {
    const barra = document.querySelector(".loader-bar");
    if (barra) {
        console.log("Página de Carregamento detectada.");
        let largura = 0;
        const tempo = setInterval(frame, 30);

        function frame() {
            if (largura >= 100) {
                clearInterval(tempo);
                window.location.href = "pageInicial.html";
            } else {
                largura++;
                barra.style.width = largura + '%';
            }
        }
    }
}

// Funções do Modal (Abrir/Fechar genérico)
function abrirModal(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.classList.remove('hide');
    }
}

function fecharModal(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.classList.add('hide');
    }
}

// Função de Selecionar Herói (Salva e Redireciona)
function selecionarHeroi(nome, imagem) {
    localStorage.setItem("heroiSelecionado", nome);
    localStorage.setItem("heroiImagem", imagem);
    localStorage.setItem("exibirToast", "true"); // 👈 ESSENCIAL

    window.location.href = "pageInicial.html";
}

/* LÓGICA DO CARROSSEL DE HERÓIS */

let indiceAtual = 0;

function mudarHeroi(direcao) {
    const herois = document.querySelectorAll(".heroi-card");
    if (!herois.length) return;

    herois.forEach(h => h.style.display = "none");

    indiceAtual += direcao;

    if (indiceAtual >= herois.length) indiceAtual = 0;
    if (indiceAtual < 0) indiceAtual = herois.length - 1;

    herois[indiceAtual].style.display = "flex";
}


function verificarMissao(event) {
    event.preventDefault();

    const heroiSelecionado = localStorage.getItem('heroiSelecionado');
    const toastBox = document.getElementById('toast-box');
    const toastMsg = document.getElementById('toast-msg');

    if (!heroiSelecionado) {
        if (toastMsg) {
            toastMsg.innerText = "Nenhum herói selecionado!";
        }
        if (toastBox) {
            toastBox.classList.remove('hidden');
            toastBox.classList.add('show');
            setTimeout(() => {
                toastBox.classList.remove('show');
                toastBox.classList.add('hidden');
            }, 3000);
        }
        return;
    }
    window.location.href = "pageMissoes.html";
}

/* =========================================
   2. VARIÁVEIS GLOBAIS DO JOGO
   ========================================= */
console.log("JS CARREGADO");

let monstrosDerrotados = 0;
let listaMonstrosApi = []; // LISTA GLOBAL PARA A API

const HEROIS = {
    Eisen: { nome: "Eisen", hpMax: 1250, hp: 1250, atk: 250, crt: 450, cura: 150, def: 350 },
    Sindel: { nome: "Sindel", hpMax: 900, hp: 900, atk: 300, crt: 600, cura: 400, def: 200 },
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

document.addEventListener("DOMContentLoaded", () => {
    if (document.body.classList.contains("page-loading")) {
        iniciarCarregamento();
    }
});

/* =========================================
   3. INICIALIZAÇÃO (DOM LOADED)
   ========================================= */
document.addEventListener("DOMContentLoaded", () => {

    // --- CARREGAR API ASSIM QUE A PÁGINA ABRE ---
    carregarListaDeMonstros();
    // --------------------------------------------

    // Carrossel
    const heroisCarrossel = document.querySelectorAll(".heroi-card");
    if (heroisCarrossel.length > 0) {
        heroisCarrossel[0].style.display = "flex";
    }


    // Modal de Boas Vindas
    const modalBoasVindas = document.getElementById("modalBoasVindas");
    const btnConfirmar = document.getElementById("btnFechar");
    const inputNome = document.getElementById("inputPegarNome");
    const avisoNomeElemento = document.getElementById("aviso-nome");

    function atualizarTextoAviso(nome) {
        if (avisoNomeElemento) {
            avisoNomeElemento.innerHTML = `Olá ${nome}, antes de Entrar em uma <br> missão escolha seu herói!`;
        }
    }

    if (modalBoasVindas || avisoNomeElemento) {
        const nomeSalvo = localStorage.getItem("nomeDoJogador");
        if (nomeSalvo) {
            atualizarTextoAviso(nomeSalvo);
            if (modalBoasVindas) modalBoasVindas.close();
        } else {
            if (modalBoasVindas) modalBoasVindas.showModal();
        }

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

    // Toast Inicial
    const toastBox = document.getElementById('toast-box');
    if (toastBox && localStorage.getItem('exibirToast') === 'true') {
        let heroiNome = localStorage.getItem('heroiSelecionado');
        let msg = document.getElementById('toast-msg');
        if (msg) msg.innerText = `Herói ${heroiNome} escolhido com sucesso!`;

        toastBox.classList.remove('hidden');
        toastBox.classList.add('show');
        setTimeout(() => {
            toastBox.classList.remove('show');
            toastBox.classList.add('hidden');
        }, 3000);
        localStorage.removeItem('exibirToast');
    }

    // Setup do Combate (Se estiver na página de combate)
    const nomeHeroi = localStorage.getItem("heroiSelecionado");
    if (HEROIS[nomeHeroi]) { // Só roda se tiver herói válido (página de missão)
        heroi = structuredClone(HEROIS[nomeHeroi]);

        // Verifica se os elementos de combate existem antes de atualizar
        if (document.querySelector(".bar-fill")) {
            atualizarHeroi();
        }

        const atkBtn = document.querySelector(".btn-atack");
        const crtBtn = document.querySelector(".btn-critico");
        const curaBtn = document.querySelector(".btn-cura");
        const dadoBtn = document.querySelector("#btn-dado");
        const vilaoBtn = document.querySelector("#dp-vilao button");

        if (atkBtn && crtBtn && curaBtn && dadoBtn && vilaoBtn) {
            atkBtn.onclick = atacar;
            crtBtn.onclick = critico;
            curaBtn.onclick = curar;
            dadoBtn.onclick = rolarDado;
            vilaoBtn.onclick = gerarVilao;
        }
    }

    const nomeHeroiUI = document.getElementById("nome-heroi");
const imgHeroiUI = document.getElementById("img-heroi");

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

/* =========================================
   4. LÓGICA DA API (FETCH)
   ========================================= */

// Função para buscar a lista de todos os monstros
async function carregarListaDeMonstros() {
    try {
        const resposta = await fetch("https://www.dnd5eapi.co/api/monsters");
        const dados = await resposta.json();
        listaMonstrosApi = dados.results;
        console.log("Lista de monstros carregada via API!", listaMonstrosApi.length, "encontrados.");
    } catch (erro) {
        console.error("Erro ao buscar lista de monstros:", erro);
        // Fallback simples
        listaMonstrosApi = [{ name: "Monstro Genérico", url: null }];
    }
}

// Função Principal de Gerar Vilão
async function gerarVilao() {
    // 1. Verifica se a lista existe
    if (listaMonstrosApi.length === 0) {
        console.log("Aguardando API ou lista vazia...");
        alert("Aguarde, carregando monstros da API...");
        // Tenta carregar novamente
        carregarListaDeMonstros();
        return;
    }

    // 2. Sorteia um monstro da lista
    const indiceSorteado = Math.floor(Math.random() * listaMonstrosApi.length);
    const monstroBasico = listaMonstrosApi[indiceSorteado];

    // Feedback visual
    const nomeVilaoEl = document.querySelector(".char-name-vilao");
    if (nomeVilaoEl) nomeVilaoEl.innerText = "Invocando " + monstroBasico.name + "...";

    try {
        let statsVilao = {};

        if (monstroBasico.url) {
            // 3. Busca detalhes (HP, Stats)
            const respostaDetalhes = await fetch("https://www.dnd5eapi.co" + monstroBasico.url);
            const detalhes = await respostaDetalhes.json();

            // Ajuste de Balanceamento para o seu jogo
            const multiplicadorVida = 15;
            const nivel = detalhes.challenge_rating || 1;

            statsVilao = {
                nome: detalhes.name,
                hpMax: (detalhes.hit_points || 50) * multiplicadorVida,
                atk: Math.floor((nivel * 10) + 50) + (Math.random() * 100)
            };

        } else {
            // Fallback se não tiver URL
            statsVilao = { nome: "Monstro Desconhecido", hpMax: 800, atk: 200 };
        }

        // 4. Define o objeto Vilão Global
        vilao = {
            nome: statsVilao.nome,
            hp: statsVilao.hpMax,
            hpMax: statsVilao.hpMax,
            atk: statsVilao.atk
        };

        // 5. Imagem (Aleatória Local, pois API não tem)
        const imagensLocais = [
            "images/vilao-teste/orc.png",
            "images/vilao-teste/goblin.png",
            "images/vilao-teste/esqueleto.png",
            "images/vilao-teste/demonio.png"
        ];
        const imgSorteada = imagensLocais[Math.floor(Math.random() * imagensLocais.length)];

        const imgEl = document.querySelector("#dp-vilao img");
        if (imgEl) imgEl.src = imgSorteada;

        // Atualiza UI
        if (nomeVilaoEl) nomeVilaoEl.innerText = vilao.nome;
        atualizarVilao();

        turno = "heroi"; // Passa a vez

    } catch (erro) {
        console.error("Erro ao gerar vilão detalhado:", erro);
        alert("Erro ao invocar monstro. Tente novamente.");
    }
}

/* =========================================
   5. GAMEPLAY E COMBATE
   ========================================= */

function atualizarHeroi() {
    if (!heroi) return;
    const porcentagem = (heroi.hp / heroi.hpMax) * 100;
    const barra = document.querySelector(".bar-fill");
    if (barra) barra.style.width = porcentagem + "%";
}

function atualizarVilao() {
    if (!vilao) return;
    const porcentagem = (vilao.hp / vilao.hpMax) * 100;
    const barra = document.querySelector(".bar-fill-vilao");
    const nomeEl = document.querySelector(".char-name-vilao");

    if (barra) barra.style.width = porcentagem + "%";
    if (nomeEl) nomeEl.innerText = vilao.nome;

    // ☠️ MORTE DO VILÃO
    if (vilao.hp <= 0) {
        monstrosDerrotados++;

        // 💰 recompensas por monstro
        goldGanho += 50;
        xpGanho += 60;

        console.log(`Monstros derrotados: ${monstrosDerrotados}`);
        console.log(`Gold: ${goldGanho} | XP: ${xpGanho}`);

        if (monstrosDerrotados >= 3) {
            mostrarVitoria();
            return;
        }

        setTimeout(() => {
            gerarVilao();
        }, 1500);
    }


}

function rolarDado() {
    if (turno !== "heroi") return;

    if (dadoRolado) {
        alert("Você já rolou o dado neste turno!");
        return;
    }

    const n = Math.floor(Math.random() * 20) + 1;

    if (n <= 7) mult = 1.1;
    else if (n <= 17) mult = 1.15;
    else mult = 1.35;

    dadoRolado = true; // 🔒 trava o dado

    const textoDado = document.querySelector(".sec-dado p:last-of-type");
    if (textoDado) textoDado.innerText = `O número sorteado foi : ${n}`;
}


function atacar() {
    if (!podeAgir()) return;

    const dano = Math.floor(heroi.atk * mult);
    vilao.hp -= dano;
    if (vilao.hp < 0) vilao.hp = 0;

    atualizarVilao();
    fimTurnoHeroi();
}



function critico() {
    if (!podeAgir()) return;

    if (criticoBloqueado) {
        alert("Ataque crítico só pode ser usado a cada 2 turnos!");
        return;
    }

    const dano = Math.floor(heroi.crt * mult);
    vilao.hp -= dano;
    if (vilao.hp < 0) vilao.hp = 0;

    criticoBloqueado = true; // 🔒 trava o crítico

    atualizarVilao();
    fimTurnoHeroi();
}



function curar() {
    if (!podeAgir()) return;

    const cura = Math.floor(heroi.cura * mult);
    heroi.hp += cura;
    if (heroi.hp > heroi.hpMax) heroi.hp = heroi.hpMax;

    atualizarHeroi();
    fimTurnoHeroi();
}



function turnoVilao() {
    turno = "vilao";

    setTimeout(() => {
        if (vilao && vilao.hp > 0) {
            heroi.hp -= Math.max(50, vilao.atk - heroi.def * 0.3);
            if (heroi.hp < 0) heroi.hp = 0;

            atualizarHeroi();

            if (heroi.hp <= 0) {
                abrirModal("overlay-derrota");
                return;
            }
        }

        turno = "heroi";
    }, 1200);
}


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


function fimTurnoHeroi() {
    dadoRolado = false; // 🔓 libera o dado pro próximo turno
    mult = 1;

    turnosHeroi++;

    // 🔓 libera o crítico a cada 2 turnos do herói
    if (turnosHeroi % 2 === 0) {
        criticoBloqueado = false;
    }

    turnoVilao();
}


function mostrarVitoria() {
    // Recupera dados salvos ou cria do zero
    let goldTotal = parseInt(localStorage.getItem("gold")) || 0;
    let xpTotal = parseInt(localStorage.getItem("xp")) || 0;
    let nivel = parseInt(localStorage.getItem("nivel")) || 1;

    goldTotal += goldGanho;
    xpTotal += xpGanho;

    // 🆙 cálculo de nível (100 XP = 1 nível)
    while (xpTotal >= 100) {
        xpTotal -= 100;
        nivel++;
    }

    // Salva tudo
    localStorage.setItem("gold", goldTotal);
    localStorage.setItem("xp", xpTotal);
    localStorage.setItem("nivel", nivel);

    // Atualiza modal
    document.querySelector("#overlay-vitoria p").innerText =
        `Monstros derrotados: ${monstrosDerrotados}`;

    const recompensa = document.querySelector("#recompensa-modal");
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

    abrirModal("overlay-vitoria");
}

function irParaInicio() {
    window.location.href = "pageInicial.html";
}

const gold = parseInt(localStorage.getItem("gold")) || 0;
const nivel = parseInt(localStorage.getItem("nivel")) || 0;

const recompensas = document.querySelectorAll("#recompensas-header p");

if (recompensas.length >= 2) {
    recompensas[0].innerText = gold;
    recompensas[1].innerText = `Nível ${nivel}`;
}
