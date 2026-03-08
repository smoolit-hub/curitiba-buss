// Registra o Service Worker para o app poder ser instalado
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log('Service Worker Registrado!'))
        .catch(err => console.log('Erro no Service Worker:', err));
}

const urls = {
    taruma: "https://www.urbs.curitiba.pr.gov.br/horario-de-onibus/373/1",
    alto: "https://www.urbs.curitiba.pr.gov.br/horario-de-onibus/373",
    santa: "https://www.urbs.curitiba.pr.gov.br/horario-de-onibus/307/1"
}

async function buscar(linha) {
    const resDiv = document.getElementById("resultado");
    resDiv.style.display = "block";
    resDiv.innerHTML = "Buscando horários...";

    let cache = localStorage.getItem(linha);
    let dataCache = localStorage.getItem(linha + "_data");
    let hoje = new Date().toDateString();

    if (cache && dataCache === hoje) {
        mostrarProximo(JSON.parse(cache));
        return;
    }

    let proxy = "https://api.allorigins.win/raw?url=";
    
    try {
        let html = await fetch(proxy + urls[linha]).then(r => r.text());
        let parser = new DOMParser();
        let doc = parser.parseFromString(html, "text/html");

        let diaSemana = new Date().getDay();
        let tabelaAlvo = doc;

        let containerDiaUteis = doc.querySelector('#diaUteis');
        let containerSabado = doc.querySelector('#sabado');
        let containerDomingo = doc.querySelector('#domingo');

        if (diaSemana === 0 && containerDomingo) tabelaAlvo = containerDomingo;
        else if (diaSemana === 6 && containerSabado) tabelaAlvo = containerSabado;
        else if (containerDiaUteis) tabelaAlvo = containerDiaUteis;

        let horarios = [];

        tabelaAlvo.querySelectorAll("td").forEach(td => {
            let t = td.innerText.trim();
            if (t.match(/^\d{2}:\d{2}$/)) {
                horarios.push(t);
            }
        });

        if (horarios.length > 0) {
            localStorage.setItem(linha, JSON.stringify(horarios));
            localStorage.setItem(linha + "_data", hoje);
        }

        mostrarProximo(horarios);

    } catch (error) {
        resDiv.innerHTML = "Erro ao buscar. Verifique a internet.";
    }
}

function mostrarProximo(horarios) {
    let agora = new Date();
    let minutosAgora = agora.getHours() * 60 + agora.getMinutes();

    let proximos = horarios.filter(h => {
        let [hora, min] = h.split(":");
        let total = Number(hora) * 60 + Number(min);
        return total >= minutosAgora;
    });

    const resDiv = document.getElementById("resultado");

    if (proximos.length === 0) {
        resDiv.innerHTML = "Sem ônibus restantes hoje.";
        return;
    }

    let proximo = proximos[0];
    let [horaProx, minProx] = proximo.split(":");
    let diff = (Number(horaProx) * 60 + Number(minProx)) - minutosAgora;

    let horaFormatada = agora.getHours().toString().padStart(2, '0');
    let minFormatado = agora.getMinutes().toString().padStart(2, '0');

    resDiv.innerHTML = `
        <div class="muted">Agora: ${horaFormatada}:${minFormatado}</div>
        <div style="margin-top: 15px;">Próximo ônibus</div>
        <div class="destaque">${proximo}</div>
        <div style="margin-bottom: 20px;">chega em <b>${diff} min</b></div>
        
        <div class="muted">
            Próximos:<br>
            ${proximos.slice(1, 4).join(" &bull; ")}
        </div>
    `;
}
