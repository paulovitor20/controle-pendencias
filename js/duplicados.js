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

const usuariosPermitidos = [

    "railane.brito@carvalhocargo.com.br",

    "mikaele.guimaraes@carvalhocargo.com.br",

    "aline.silva@carvalhocargo.com.br",

    "paulo.vitor@carvalhocargo.com.br"

];
// =======================
// VALIDA ACESSO
// =======================

const usuario =
    JSON.parse(
        localStorage.getItem(
            "usuario"
        )
    );

if (!usuario) {

    alert(
        "Faça login."
    );

    window.location.href =
        "/login";

    throw new Error(
        "Usuário não logado"
    );
}

if (
    !usuariosPermitidos.includes(
        usuario.email
            .toLowerCase()
    )
) {

    alert(
        "Você não possui acesso à área de Duplicados."
    );

    window.location.href =
        "/";

    throw new Error(
        "Sem permissão"
    );
}
// =======================
// CARREGAR DUPLICADOS
// =======================

async function carregarDuplicados() {

    const {
        data,
        error
    } = await supabaseClient
        .from("duplicados")
        .select("*")
        .order(
            "data",
            {
                ascending: false
            }
        );

    if (error) {

        console.error(
            error
        );

        return;
    }

    renderDuplicados(
        data
    );
}

function renderDuplicados(lista) {

    const tabela =
        document.getElementById(
            "tabelaDuplicados"
        );

    tabela.innerHTML = "";

    lista.forEach(item => {

        tabela.innerHTML += `

        <tr>

            <td>${item.banco}</td>

            <td>${item.data}</td>

            <td>${item.cliente}</td>

            <td>
                R$ ${Number(
                    item.valor
                ).toLocaleString(
                    "pt-BR"
                )}
            </td>

            <td>${item.transacao}</td>

            <td>${item.dono}</td>

            <td>${item.observacao || ""}</td>

            <td>${item.status}</td>

            <td>

                <button
                    class="btn-primary"
                    onclick="
                    retornarParaPendencias(
                    ${item.id}
                    )
                    ">

                    Retornar

                </button>

            </td>

        </tr>

        `;
    });
}
async function retornarParaPendencias(id) {

    const confirmar =
        confirm(
            "Retornar para Pendências?"
        );

    if (!confirmar) return;

    const {
        data: registro,
        error: erroBusca
    } = await supabaseClient
        .from("duplicados")
        .select("*")
        .eq("id", id)
        .single();

    if (erroBusca) {

        console.error(
            erroBusca
        );

        return;
    }

    const {
        error: erroInsert
    } = await supabaseClient
        .from("pendencias")
        .insert([{

            banco:
                registro.banco,

            data:
                registro.data,

            cliente:
                registro.cliente,

            valor:
                registro.valor,

            transacao:
                registro.transacao,

            dono:
                registro.dono,

            observacao:
                registro.observacao,

            status:
                registro.status

        }]);

    if (erroInsert) {

        console.error(
            erroInsert
        );

        return;
    }

    await supabaseClient
        .from("duplicados")
        .delete()
        .eq("id", id);

    carregarDuplicados();
}
carregarDuplicados();