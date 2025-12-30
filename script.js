

async function buscarViloes() {
    try {
        const resposta = await fetch("https://www.dnd5eapi.co/api/monsters");
        const dados = await resposta.json();

        return dados.results; // lista de vilões
    } catch (erro) {
        console.error("Erro ao buscar vilões:", erro);
    }
}


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
function selecionarHeroi(nomeHeroi) {
    localStorage.setItem('heroiSelecionado', nomeHeroi);
    localStorage.setItem('exibirToast', 'true');
    window.location.href = "pageInicial.html";
}


/*LÓGICA DO CARROSSEL DE HERÓIS*/
let indiceAtual = 0;

function mudarHeroi(direcao) {
    const herois = document.querySelectorAll('#main-heroi article');
    if (herois.length === 0) return; // Se não tiver heróis na tela, não faz nada

    // Esconde todos
    herois.forEach(heroi => {
        heroi.style.display = 'none';
    });

    // Calcula novo índice
    let novoIndice = indiceAtual + direcao;

    if (novoIndice >= herois.length) {
        novoIndice = 0;
    } else if (novoIndice < 0) {
        novoIndice = herois.length - 1;
    }

    indiceAtual = novoIndice;
    herois[indiceAtual].style.display = 'flex';
}


window.addEventListener('DOMContentLoaded', function () {

    iniciarCarregamento();

    const herois = document.querySelectorAll('#main-heroi article');
    if (herois.length > 0) {
        // Mostra o primeiro herói ao carregar a página
        mudarHeroi(0);
    }


    // Lógica do Modal de Nome
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

    //  Lógica do Toast 
    const toastBox = document.getElementById('toast-box');

    // Só roda se o elemento do toast existir na página
    if (toastBox && localStorage.getItem('exibirToast') === 'true') {

        let heroi = localStorage.getItem('heroiSelecionado');
        let msg = document.getElementById('toast-msg');

        if (msg) msg.innerText = `Herói ${heroi} escolhido com sucesso!`;

        toastBox.classList.remove('hidden'); // Garante que a classe hidden saia
        toastBox.classList.add('show');      // Adiciona a classe que mostra

        setTimeout(() => {
            toastBox.classList.remove('show');
            toastBox.classList.add('hidden');
        }, 3000);

        localStorage.removeItem('exibirToast');
    }
});

function verificarMissao(event) {
    event.preventDefault(); // impede o link de navegar

    const heroiSelecionado = localStorage.getItem('heroiSelecionado');
    const toastBox = document.getElementById('toast-box');
    const toastMsg = document.getElementById('toast-msg');

    // se NÃO tiver herói escolhido
    if (!heroiSelecionado) {
        if (toastMsg) {
            toastMsg.innerText = "Nenhum herói selecionado!";
        }

        toastBox.classList.remove('hidden');
        toastBox.classList.add('show');

        setTimeout(() => {
            toastBox.classList.remove('show');
            toastBox.classList.add('hidden');
        }, 3000);

        return; // para aqui
    }

    // se tiver herói, segue para a página de missões
    window.location.href = "pageMissoes.html";
}
console.log("JS CARREGADO");
let monstrosDerrotados = 0;

const HEROIS = {
    Eisen: { nome: "Eisen", hpMax: 1250, hp: 1250, atk: 250, crt: 450, cura: 150, def: 350 },
    Sindel: { nome: "Sindel", hpMax: 900, hp: 900, atk: 300, crt: 600, cura: 400, def: 200 },
    Venus: { nome: "Vênus", hpMax: 800, hp: 800, atk: 400, crt: 800, cura: 100, def: 150 }
};

const monstros = [
    {
        nome: "Orc Guerreiro",
        hpMax: 800,
        atk: 200,
        img: "images/vilao-teste/orc.png"
    },
    {
        nome: "Goblin Assassino",
        hpMax: 600,
        atk: 150,
        img: "images/vilao-teste/goblin.png"
    },
    {
        nome: "Esqueleto Sombrio",
        hpMax: 700,
        atk: 170,
        img: "images/vilao-teste/esqueleto.png"
    },
    {
        nome: "Demônio do Pântano",
        hpMax: 900,
        atk: 210,
        img: "images/vilao-teste/demonio.png"
    }
];


let heroi = null;
let vilao = null;
let turno = "heroi";
let mult = 1;

document.addEventListener("DOMContentLoaded", () => {

    const nomeHeroi = localStorage.getItem("heroiSelecionado");
    if (!nomeHeroi || !HEROIS[nomeHeroi]) {
        console.error("Herói não encontrado");
        return;
    }

    heroi = structuredClone(HEROIS[nomeHeroi]);
    atualizarHeroi();

    const atkBtn = document.querySelector(".btn-atack");
    const crtBtn = document.querySelector(".btn-critico");
    const curaBtn = document.querySelector(".btn-cura");
    const dadoBtn = document.querySelector("#btn-dado");
    const vilaoBtn = document.querySelector("#dp-vilao button");

    if (!atkBtn || !crtBtn || !curaBtn || !dadoBtn || !vilaoBtn) {
        console.error("Algum botão não foi encontrado");
        return;
    }

    atkBtn.onclick = atacar;
    crtBtn.onclick = critico;
    curaBtn.onclick = curar;
    dadoBtn.onclick = rolarDado;
    vilaoBtn.onclick = gerarVilao;
});

/* HUD */
function atualizarHeroi() {
    const porcentagem = (heroi.hp / heroi.hpMax) * 100;
    document.querySelector(".bar-fill").style.width = porcentagem + "%";
}


function atualizarVilao() {
    const porcentagem = (vilao.hp / vilao.hpMax) * 100;
    document.querySelector(".bar-fill-vilao").style.width = porcentagem + "%";
    document.querySelector(".char-name-vilao").innerText = vilao.nome;

    // ☠️ MORTE DO VILÃO
    if (vilao.hp <= 0) {
        monstrosDerrotados++;
        console.log("Monstros derrotados:", monstrosDerrotados);

        setTimeout(() => {
            gerarVilao();
        }, 1000);
    }
}



/* DADO */
function rolarDado() {
    const n = Math.floor(Math.random() * 20) + 1;

    if (n <= 7) mult = 1.1;
    else if (n <= 17) mult = 1.15;
    else mult = 1.35;

    document.querySelector(".sec-dado p:last-of-type").innerText =
        `O número sorteado foi : ${n}`;
}

function gerarVilao() {
    const escolhido = monstros[Math.floor(Math.random() * monstros.length)];

    vilao = {
        nome: escolhido.nome,
        hp: escolhido.hpMax,
        hpMax: escolhido.hpMax,
        atk: escolhido.atk
    };

    document.querySelector("#dp-vilao img").src = escolhido.img;
    document.querySelector(".char-name-vilao").innerText = vilao.nome;

    atualizarVilao();
    turno = "heroi";

    if (vilao.hp <= 0) {
        monstrosDerrotados++;
        console.log("Monstros derrotados:", monstrosDerrotados);

        setTimeout(() => {
            gerarVilao();
        }, 1000);
    }

}



/* AÇÕES */
function atacar() {
    if (!vilao) {
        alert("Gere um inimigo primeiro!");
        return;
    }
    if (turno !== "heroi") return;

    const dano = Math.floor(heroi.atk * mult);
    vilao.hp -= dano;
    if (vilao.hp < 0) vilao.hp = 0;

    console.log("Dano causado:", dano);
    atualizarVilao();
    turnoVilao();
}


function critico() {
    if (!vilao) {
        alert("Gere um inimigo primeiro!");
        return;
    }
    if (turno !== "heroi") return;

    const dano = Math.floor(heroi.crt * mult);
    vilao.hp -= dano;
    if (vilao.hp < 0) vilao.hp = 0;

    console.log("Crítico:", dano);
    atualizarVilao();
    turnoVilao();
}

function curar() {
    if (turno !== "heroi") return;

    const cura = Math.floor(heroi.cura * mult);
    heroi.hp += cura;
    if (heroi.hp > heroi.hpMax) heroi.hp = heroi.hpMax;

    console.log("Cura:", cura);
    atualizarHeroi();
    turnoVilao();
}


/* TURNO DO VILÃO */
function turnoVilao() {
    turno = "vilao";

    setTimeout(() => {
        heroi.hp -= Math.max(50, vilao.atk - heroi.def * 0.3);
        atualizarHeroi();
        turno = "heroi";
        mult = 1;
    }, 1200);
}

