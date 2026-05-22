// =======================
// SUPABASE
// =======================

const supabaseUrl =
    "https://vhyefsqjfbtlqzjhbxpd.supabase.co";

const supabaseKey =
    "sb_publishable_m2pwUonw9TMBAvaxUg13Ow_BDLRK-Gm";

const supabaseClient =
    window.supabase.createClient(
        supabaseUrl,
        supabaseKey
    );


// =======================
// VARIÁVEIS
// =======================

let logsOriginais = [];

let paginaAtual = 1;

const logsPorPagina = 12;


// =======================
// LOGIN
// =======================

const usuario =
    JSON.parse(
        localStorage.getItem(
            "usuario"
        )
    );

if (!usuario) {

    window.location.href =
        "login.html";
}


// SOMENTE PAULO

if (

    usuario.email !==
    "paulo.vitor@carvalhocargo.com.br"

) {

    window.location.href =
        "index.html";
}


// =======================
// INICIAR
// =======================

window.onload = async () => {

    carregarLogs();
};


// =======================
// CARREGAR LOGS
// =======================

async function carregarLogs() {

    const { data, error } =
        await supabaseClient
            .from("logs")
            .select("*")
            .order(
                "data",
                {
                    ascending: false
                }
            );

    if (error) {

        console.error(error);

        return;
    }

    logsOriginais = data;

    // CARDS TOPO

    document.getElementById(
        "totalLogs"
    ).innerText =
        data.length;

    if (data.length > 0) {

        document.getElementById(
            "ultimaAtualizacao"
        ).innerText =

            formatarDataHora(
                data[0].data
            );
    }

    renderizarLogs();
}


// =======================
// RENDERIZAR LOGS
// =======================

function renderizarLogs() {

    const tabela =
        document.getElementById(
            "logsLista"
        );

    tabela.innerHTML = "";

    const pesquisa =
        document
            .getElementById(
                "filtroPesquisa"
            )
            .value
            .toLowerCase();

    const acao =
        document
            .getElementById(
                "filtroAcao"
            )
            .value;

    // =======================
    // FILTRAR
    // =======================

    let filtrados =
        logsOriginais.filter((log) => {

            const texto = `

                ${log.usuario}

                ${log.acao}

                ${log.detalhes}

            `.toLowerCase();

            const matchPesquisa =
                texto.includes(
                    pesquisa
                );

            const matchAcao =

                !acao ||

                log.acao.includes(
                    acao
                );

            return (
                matchPesquisa &&
                matchAcao
            );
        });

    // =======================
    // PAGINAÇÃO
    // =======================

    const inicio =
        (paginaAtual - 1)
        * logsPorPagina;

    const fim =
        inicio + logsPorPagina;

    const pagina =
        filtrados.slice(
            inicio,
            fim
        );

    // =======================
    // RENDER CARDS
    // =======================

    pagina.forEach((log) => {

        let badge =
            "badge-status";

        if (
            log.acao.includes(
                "ADICIONOU"
            )
        ) {

            badge =
                "badge-add";
        }

        if (
            log.acao.includes(
                "EDITOU"
            )
        ) {

            badge =
                "badge-edit";
        }

        if (
            log.acao.includes(
                "EXCLUIU"
            )
        ) {

            badge =
                "badge-delete";
        }

        if (
            log.acao.includes(
                "STATUS"
            )
        ) {

            badge =
                "badge-status";
        }

        tabela.innerHTML += `

            <div class="
    log-item
    ${badge}
">

    <div class="log-top">

        <div class="log-user">

            ${log.usuario}

        </div>

        <div class="log-date">

            ${formatarDataHora(
                log.data
            )}

        </div>

    </div>

    <div class="
        log-content
    ">

        <div class="
            log-badge-area
        ">

            <span class="
                log-badge
                ${badge}
            ">

                ${log.acao}

            </span>

        </div>

        <div class="
            log-details
        ">

            ${(log.detalhes || "-")
                .replaceAll(
                    "\n",
                    "<br>"
                )}

        </div>

    </div>

</div>
        `;
    });

    renderizarPaginacao(
        filtrados.length
    );
}


// =======================
// PAGINAÇÃO
// =======================

function renderizarPaginacao(total) {

    const paginacao =
        document.getElementById(
            "paginacaoLogs"
        );

    paginacao.innerHTML = "";

    const totalPaginas =
        Math.ceil(
            total / logsPorPagina
        );

    for (
        let i = 1;
        i <= totalPaginas;
        i++
    ) {

        paginacao.innerHTML += `

            <button

                class="
                    page-btn
                    ${i === paginaAtual
                ? "active"
                : ""
            }
                "

                onclick="
                    mudarPagina(${i})
                "

            >

                ${i}

            </button>
        `;
    }
}


// =======================
// MUDAR PÁGINA
// =======================

function mudarPagina(pagina) {

    paginaAtual = pagina;

    renderizarLogs();
}


// =======================
// EVENTOS FILTRO
// =======================

document
    .getElementById(
        "filtroPesquisa"
    )
    .addEventListener(
        "input",
        () => {

            paginaAtual = 1;

            renderizarLogs();
        }
    );

document
    .getElementById(
        "filtroAcao"
    )
    .addEventListener(
        "change",
        () => {

            paginaAtual = 1;

            renderizarLogs();
        }
    );


// =======================
// DATA/HORA
// =======================

function formatarDataHora(data) {

    if (!data) return "";

    const d =
        new Date(data);

    return d.toLocaleString(
        "pt-BR",
        {

            day: "2-digit",

            month: "2-digit",

            year: "numeric",

            hour: "2-digit",

            minute: "2-digit",

            second: "2-digit"
        }
    );
}