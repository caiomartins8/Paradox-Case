window.onload = function () {
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
};



const modal = document.getElementById("modalBoasVindas");
    const btnConfirmar = document.getElementById("btnFechar");
    const inputNome = document.getElementById("inputPegarNome");
    
    const avisoNomeElemento = document.getElementById("aviso-nome");

    function atualizarTextoAviso(nomeDoHeroi) {
        if (avisoNomeElemento) {
            avisoNomeElemento.innerHTML = `Olá ${nomeDoHeroi} , antes de Entrar em uma <br> missão escolha seu herói !`;
        }
    }

    if (modal || avisoNomeElemento) {
        
        const nomeSalvo = localStorage.getItem("nomeDoJogador");

        if (nomeSalvo) {
            console.log("Jogador identificado: " + nomeSalvo);
                        atualizarTextoAviso(nomeSalvo);

            if (modal) modal.close(); 
            
        } else {
            if (modal) modal.showModal();
        }

        if (btnConfirmar) {
            btnConfirmar.onclick = function() {
                let nomeDigitado = inputNome.value;
                
                if (nomeDigitado.trim() === "") {
                    alert("Por favor, diga seu nome, Cavaleiro!");
                    return;
                }

                localStorage.setItem("nomeDoJogador", nomeDigitado);
                
                atualizarTextoAviso(nomeDigitado);
                
                modal.close(); 
            };
        }
    };


  let indiceAtual = 0;
const herois = document.querySelectorAll('#main-heroi article');

function mostrarHeroi(index) {
    herois.forEach(heroi => {
        heroi.style.display = 'none';
    });

    if (index >= herois.length) {
        indiceAtual = 0;
    } else if (index < 0) {
        indiceAtual = herois.length - 1;
    } else {
        indiceAtual = index;
    }

    herois[indiceAtual].style.display = 'flex';
}

function mudarHeroi(direcao) {
    mostrarHeroi(indiceAtual + direcao);
}

mostrarHeroi(0);