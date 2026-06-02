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