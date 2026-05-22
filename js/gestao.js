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
// INICIAR
// =======================
window.onload = async () => {

    carregarResponsaveis();

    carregarBancos();

    carregarResumo();
};

// =======================
// LOGIN LOCAL
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

// BLOQUEIA VIEWER
if (
    usuario.role ===
    "viewer"
) {

    window.location.href =
        "index.html";
}
// =======================
// NORMALIZAR
// =======================

function normalizarNome(nome) {

    return nome
        .trim()
        .toUpperCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        );
}


// =======================
// CADASTRAR
// =======================

async function cadastrarResponsavel() {

    const nome =
        normalizarNome(
            document.getElementById(
                "novoResponsavel"
            ).value
        );

    if (!nome) {

        alert(
            "Digite um nome."
        );

        return;
    }

    const { error } =
        await supabaseClient
            .from("responsaveis")
            .insert([
                { nome }
            ]);

    if (error) {

        alert(
            "Responsável já existe."
        );

        return;
    }

    document.getElementById(
        "novoResponsavel"
    ).value = "";

    carregarResponsaveis();

    carregarResumo();
}


// =======================
// CARREGAR RESPONSÁVEIS
// =======================

async function carregarResponsaveis() {

    const tabela =
        document.getElementById(
            "tabelaResponsaveis"
        );

    const { data, error } =
        await supabaseClient
            .from("responsaveis")
            .select("*")
            .order("nome");

    if (error) {

        console.error(error);

        return;
    }

    tabela.innerHTML = "";

    data.forEach((r) => {

        tabela.innerHTML += `

            <tr>

                <td>
                    ${r.nome}
                </td>

                <td>
                    <button
                        class="status-btn"
                        onclick="abrirUnificacao('${r.nome}')"
                    >
                        Unificar
                    </button>
                    <button
                        class="delete-btn"
                        onclick="removerResponsavel(${r.id})"
                    >
                        Remover
                    </button>

                </td>

            </tr>
        `;
    });
}


// =======================
// REMOVER
// =======================

async function removerResponsavel(id) {

    const confirmar =
        confirm(
            "Deseja remover?"
        );

    if (!confirmar) return;

    await supabaseClient
        .from("responsaveis")
        .delete()
        .eq("id", id);

    carregarResponsaveis();

    carregarResumo();
}
// =======================
// UNIFICAR RESPONSÁVEL
// =======================

async function abrirUnificacao(origem) {

    const destino =
        prompt(

            `Unificar:

${origem}

PARA QUAL RESPONSÁVEL?`

        );

    if (!destino) return;

    const nomeDestino =
        normalizarNome(destino);

    // UPDATE PENDÊNCIAS
    const { error } =
        await supabaseClient
            .from("pendencias")
            .update({
                dono: nomeDestino
            })
            .eq(
                "dono",
                origem
            );

    if (error) {

        console.error(error);

        alert(
            "Erro ao unificar."
        );

        return;
    }

    // REMOVE RESPONSÁVEL ANTIGO
    await supabaseClient
        .from("responsaveis")
        .delete()
        .eq(
            "nome",
            origem
        );

    alert(
        "Responsável unificado!"
    );

    carregarResponsaveis();

    carregarResumo();
}

// =======================
// RESUMO GERENCIAL
// =======================

async function carregarResumo() {

    const tabela =
        document.getElementById(
            "tabelaResumo"
        );

    const { data, error } =
        await supabaseClient
            .from("pendencias")
            .select("*")
            .eq("status", "PENDENTE");

    if (error) {

        console.error(error);

        return;
    }

    const totalGeral =
        data.reduce(
            (acc, p) =>
                acc + Number(p.valor),
            0
        );

    const agrupado = {};

    data.forEach((p) => {

        if (!agrupado[p.dono]) {

            agrupado[p.dono] = {

                quantidade: 0,

                valor: 0
            };
        }

        agrupado[p.dono]
            .quantidade++;

        agrupado[p.dono]
            .valor += Number(
                p.valor
            );
    });

    tabela.innerHTML = "";

    Object.entries(
        agrupado
    )

        .sort((a, b) => {

            return b[1].valor - a[1].valor;

        })

        .forEach(([nome, info]) => {

            const percentual =
                (
                    info.valor /
                    totalGeral
                ) * 100;

            tabela.innerHTML += `

            <tr>

                <td>
                    ${nome}
                </td>

                <td>
                    ${info.quantidade}
                </td>

                <td>

                    ${info.valor
                    .toLocaleString(
                        "pt-BR",
                        {
                            style: "currency",
                            currency: "BRL"
                        }
                    )}

                </td>

                <td>

                    ${percentual.toFixed(2)}%

                </td>

            </tr>
        `;
        });
}
// =======================
// CADASTRAR BANCO
// =======================

async function cadastrarBanco() {

    const nome =
        normalizarNome(
            document.getElementById(
                "novoBanco"
            ).value
        );

    if (!nome) {

        alert(
            "Digite um banco."
        );

        return;
    }

    const { error } =
        await supabaseClient
            .from("bancos")
            .insert([
                { nome }
            ]);

    if (error) {

        alert(
            "Banco já existe."
        );

        return;
    }

    document.getElementById(
        "novoBanco"
    ).value = "";

    carregarBancos();
}


// =======================
// CARREGAR BANCOS
// =======================

async function carregarBancos() {

    const tabela =
        document.getElementById(
            "tabelaBancos"
        );

    const { data, error } =
        await supabaseClient
            .from("bancos")
            .select("*")
            .order("nome");

    if (error) {

        console.error(error);

        return;
    }

    tabela.innerHTML = "";

    data.forEach((b) => {

        tabela.innerHTML += `

            <tr>

                <td>
                    ${b.nome}
                </td>

                <td>

                    <button
                        class="delete-btn"
                        onclick="removerBanco(${b.id})"
                    >
                        Remover
                    </button>

                </td>

            </tr>
        `;
    });
}


// =======================
// REMOVER BANCO
// =======================

async function removerBanco(id) {

    const confirmar =
        confirm(
            "Deseja remover?"
        );

    if (!confirmar) return;

    await supabaseClient
        .from("bancos")
        .delete()
        .eq("id", id);

    carregarBancos();
}