const buscarCidade = document.querySelector("#cidade");
const btnPesquisar = document.querySelector("#pesquisar")
const resultado = document.querySelector("#resultado")

btnPesquisar.addEventListener("click", pesquisarCidade)

async function pesquisarCidade() {
    const nomeCidade = buscarCidade.value

    if(nomeCidade === "") {
        alert("Digite uma cidade!")
        return
    }

    resultado.innerHTML = "<p>Pesquisando...</p>"

    try {
        const urlCidade =
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=br&q=${encodeURIComponent(nomeCidade)}`

        const respostaCidade = await fetch(urlCidade)

         if (!respostaCidade.ok) {
            throw new Error(
                `Erro HTTP: ${respostaCidade.status}`
            );
        }

        const dadosCidade = await respostaCidade.json()

        if(dadosCidade.length === 0) {
            resultado.innerHTML = "<p>Cidade não encontrada</p>"
            return
        }
        const latitude = dadosCidade[0].lat

        const longitude = dadosCidade[0].lon

        const query = 
        `
        [out:json];
        
            (
                node["tourism"="attraction"]
                (around:3000,${latitude},${longitude});

                node["tourism"="museum"]
                (around:3000,${latitude},${longitude});

                node["historic"]
                (around:3000,${latitude},${longitude});
            );
            
            out;
        `

            const respostaPontos = await fetch(
                 "https://overpass.kumi.systems/api/interpreter",
                {
                    method: "POST",
                    body: query
                }
            )
        
            if (!respostaPontos.ok) {
    throw new Error(
        `Erro na API: ${respostaPontos.status}`
    );
}
            const dadosPontos = await respostaPontos.json()
        
            mostrarPontos(dadosPontos.elements)
    } catch (erro) {
        console.error(erro)

        resultado.innerHTML = "<p>Ocorreu um erro na pesquisa.</p>"
    }
    
}

function mostrarPontos(pontos) {
    resultado.innerHTML = ""

    if (pontos.length === 0) {
        resultado.innerHTML = 
        "<p>Nenhum ponto turístico encontrado.</p>"

        return
    }

    pontos.forEach((ponto) => {
        const nome = 
        ponto.tags?.name || "Ponto turístico sem nome"

        let tipo = 
        ponto.tags?.tourism ||
        ponto.tags?.historic ||
        "Não informado"

        const card = document.createElement("div")

        card.classList.add("card");

        card.innerHTML = 
        `
        <h2>${nome}</h2>
        `

        resultado.appendChild(card)
    })
}
