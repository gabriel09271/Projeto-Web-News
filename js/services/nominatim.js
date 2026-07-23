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
                (around:2000,${latitude},${longitude});

                node["tourism"="museum"]
                (around:2000,${latitude},${longitude});
            );
            
            out 10;
        `

            const respostaPontos = await fetch(
                 "https://overpass-api.de/api/interpreter",
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

async function mostrarPontos(pontos) {
    resultado.innerHTML = ""

    if (pontos.length === 0) {
        resultado.innerHTML = 
        "<p>Nenhum ponto turístico encontrado.</p>"

        return
    }

    for(const ponto of pontos) {
        
        const nome = 
        ponto.tags?.name || "Ponto turístico sem nome"
        
        const imagem = await buscarImagem(nome)

        if(!imagem) {
            continue
        }

        const img = new Image()

        img.src = imagem
        img.alt = nome
        
        img.onload = function () {
            const card = document.createElement("div")

            card.classList.add("card")

            card.innerHTML =
            `
            <h2>${nome}</h2>
            `
            card.appendChild(img)
    
        resultado.appendChild(card)
    }

    img.oneerror = function () {
        console.log(`Imagem não carregou: ${nome}`)
        }
    }
}


async function buscarImagem(nomePonto) {
    const url = `https://commons.wikimedia.org/w/api.php
        ?action=query
        &generator=search
        &gsrsearch=${encodeURIComponent(nomePonto)}
        &gsrnamespace=6
        &gsrlimit=1
        &prop=imageinfo
        &iiprop=url
        &format=json
        &origin=*`
        .replace(/\s+/g, "");

        const resposta = await fetch(url)

        const dados = await resposta.json()

        const paginas = dados.query?.pages;

        if(!paginas) {
            return null
        }

        const pagina = Object.values(paginas)[0]

        return pagina.imageinfo?.[0]?.url || null
    }