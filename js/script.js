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
// LOG SISTEMA
// =======================

async function registrarLog(
    acao,
    detalhes = ""
) {

    try {

        const usuario =
            JSON.parse(
                localStorage.getItem(
                    "usuario"
                )
            );

        const { error } =
            await supabaseClient
                .from("logs")
                .insert([{

                    usuario:
                        usuario?.email || "desconhecido",

                    acao,

                    detalhes
                }]);

        if (error) {

            console.error(
                "Erro salvar log:",
                error
            );
        }

    } catch (err) {

        console.error(
            "Erro log:",
            err
        );
    }
}
// =======================
// LOGIN LOCAL
// =======================

const usuario =
    JSON.parse(
        localStorage.getItem(
            "usuario",
            "role"
        )
    );

if (!usuario) {

    window.location.href =
        "login.html";
}

window.userRole =
    usuario.role;
// =======================
// EDIÇÃO
// =======================

let editandoId = null;
let pendenciaObsAtual = null;
// =======================
// ELEMENTOS
// =======================

const tabela =
    document.getElementById(
        "tabelaPendencias"
    );


// =======================
// INICIAR
// =======================

window.onload = async () => {

    await preencherFiltroDono();

    await preencherSelectDono();

    await preencherSelectBanco();

    carregarPendencias();

    // VIEWER
    if (
        window.userRole ===
        "viewer"
    ) {

        document
            .querySelectorAll(

                ".delete-btn, .edit-btn, .btn-import"

            )
            .forEach((el) => {

                el.style.display =
                    "none";
            });
    }
    if (
        window.userRole ===
        "viewer"
    ) {

        // ESCONDE FORMULÁRIO
        document
            .querySelector(
                ".form-section"
            )
            .style.display =
            "none";
    }
    if (
        window.userRole ===
        "viewer"
    ) {

        const btnGestao =
            document.getElementById(
                "btnGestao"
            );

        if (btnGestao) {

            btnGestao.style.display =
                "none";
        }
    }
};
// =======================
// CARREGAR
// =======================
async function carregarPendencias() {

    const filtroStatus =
        document.getElementById(
            "filtroStatus"
        )?.value || "PENDENTE";

    const filtroDono =
        document.getElementById(
            "filtroDono"
        )?.value || "TODOS";

    const filtroTransacao =
        document.getElementById(
            "filtroTransacao"
        )?.value || "TODOS";

    const dataInicial =
        document.getElementById(
            "dataInicial"
        )?.value;

    const dataFinal =
        document.getElementById(
            "dataFinal"
        )?.value;

    let query =
        supabaseClient
            .from("pendencias")
            .select("*")
            .order("data", {
                ascending: true
            });

    // STATUS
    if (filtroStatus !== "TODOS") {

        query =
            query.eq(
                "status",
                filtroStatus
            );
    }

    // DONO
    if (filtroDono !== "TODOS") {

        query =
            query.eq(
                "dono",
                filtroDono
            );
    }

    // TRANSAÇÃO
    if (filtroTransacao !== "TODOS") {

        query =
            query.eq(
                "transacao",
                filtroTransacao
            );
    }

    // DATA INICIAL
    if (dataInicial) {

        query =
            query.gte(
                "data",
                dataInicial
            );
    }

    // DATA FINAL
    if (dataFinal) {

        query =
            query.lte(
                "data",
                dataFinal
            );
    }

    const { data, error } =
        await query;

    if (error) {

        console.error(error);

        return;
    }

    await preencherFiltroDono();

    renderTabela(data);
}
// =======================
// ADICIONAR
// =======================

async function adicionarPendencia() {

    const pendencia = {

        banco:
            document.getElementById("banco").value,

        data:
            document.getElementById("data").value,

        cliente:
            document.getElementById("cliente").value,

        valor:
            Number(
                document.getElementById("valor").value
            ),

        transacao:
            document.getElementById("transacao").value,

        dono:
            document.getElementById("dono").value,

        observacao:
            document.getElementById("observacao").value,

        status:
            document.getElementById("status").value
    };

    const { error } =
        await supabaseClient
            .from("pendencias")
            .insert([pendencia]);

    if (error) {

        console.error(error);

        alert(
            "Erro ao salvar."
        );

        return;
    }

    limparFormulario();
    await registrarLog(

        "ADICIONOU PENDÊNCIA",

        `
    Cliente: ${pendencia.cliente}

    Banco: ${pendencia.banco}

    Valor: R$ ${pendencia.valor}

    Responsável: ${pendencia.dono}
    `
    );
    carregarPendencias();
}
// =======================
// RENDER TABELA
// =======================

function renderTabela(lista) {

    let html = "";
    lista.forEach((p) => {

        let classeStatus =
            p.status === "PENDENTE"
                ? "pendente"
                : "resolvido";

        html += `

      <tr id="linha-${p.id}">

        <td>${p.banco}</td>

        <td>
          ${formatarDataBR(p.data)}
        </td>

        <td>${p.cliente}</td>

        <td>
          ${Number(p.valor).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        )}
        </td>

        <td class="${p.transacao === "CRÉDITO"
                ? "credito"
                : "debito"
            }">
            ${p.transacao}
        </td>
        <td>
            ${p.dono}
        </td>

        <td title="${p.observacao || ""}">
            ${p.observacao || "-"}
        </td>

        <td>
          <span class="status ${classeStatus}">
            ${p.status}
          </span>
        </td>

        <td>
          ${calcularDias(p.data)}
        </td>

        <td class="acoes">

    ${window.userRole === "admin" ? `

        <button
            class="edit-btn"
            onclick="editarLinha(${p.id})"
        >
            Editar
        </button>

        <button
            class="status-btn"
            onclick="alterarStatus(${p.id}, '${p.status}')"
        >
            Status
        </button>

        <button
            class="delete-btn"
            onclick="deletarPendencia(${p.id})"
        >
            Excluir
        </button>
        <button
            onclick="moverParaDuplicados(${p.id})"
            class="status-btn">
            Duplicados
        </button>
        <button
            class="btn-observacao"
            onclick="abrirObservacaoInterna(${p.id})"
        >
            Obs. Interna
        </button>

    ` : `

        <span
          style="
            color:#666;
            font-size:12px;
          "
        >
          Somente Visualização
        </span>

    `}

    </td>

      </tr>

    `;
    });
    tabela.innerHTML = html;
    atualizarDashboard(lista);
    ativarResizeColunas();

}
// =======================
// NORMALIZAR DONO
// =======================

function normalizarDono(nome) {

    if (!nome) return "";

    return nome
        .trim()
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

// =======================
// ALTERAR STATUS
// =======================

async function alterarStatus(id, statusAtual) {

    try {

        // BUSCA PENDÊNCIA
        const { data: pendencia, error: erroBusca } =
            await supabaseClient
                .from("pendencias")
                .select("*")
                .eq("id", id)
                .single();

        if (erroBusca) {

            console.error(
                erroBusca
            );

            return;
        }

        // NOVO STATUS
        const novoStatus =
            statusAtual === "PENDENTE"
                ? "RESOLVIDO"
                : "PENDENTE";

        // UPDATE
        const { error } =
            await supabaseClient
                .from("pendencias")
                .update({

                    status:
                        novoStatus

                })
                .eq("id", id);

        if (error) {

            console.error(error);

            return;
        }

        // LOG
        await registrarLog(

            "ALTEROU STATUS",

            `
Cliente:
${pendencia.cliente}

Banco:
${pendencia.banco}

Valor:
R$ ${pendencia.valor}

Responsável:
${pendencia.dono}

Status:
${statusAtual}
→
${novoStatus}
            `
        );

        // RECARREGA
        carregarPendencias();

    } catch (err) {

        console.error(
            "Erro alterar status:",
            err
        );
    }
}

// =======================
// EXCLUIR
// =======================

async function deletarPendencia(id) {

    confirm(
        "Deseja excluir esta pendência?"
    );

    if (!confirmar) return;
    // BUSCA DADOS
    const { data: pendencia } =
        await supabaseClient
            .from("pendencias")
            .select("*")
            .eq("id", id)
            .single();
    const { error } =
        await supabaseClient
            .from("pendencias")
            .delete()
            .eq("id", id);
    await registrarLog(

        "EXCLUIU PENDÊNCIA",

        `
    Cliente: ${pendencia.cliente}

    Banco: ${pendencia.banco}

    Valor: R$ ${pendencia.valor}

    Responsável: ${pendencia.dono}
    `
    );
    if (error) {
        console.error(error);
        return;
    }

    carregarPendencias();
}


// =======================
// DASHBOARD
// =======================

function atualizarDashboard(lista) {

    document.getElementById(
        "totalPendencias"
    ).innerText = lista.length;

    const valorTotal = lista.reduce(
        (acc, p) => acc + Number(p.valor),
        0
    );

    document.getElementById(
        "valorTotal"
    ).innerText =
        valorTotal.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    document.getElementById(
        "totalPendente"
    ).innerText =
        lista.filter(
            p => p.status === "PENDENTE"
        ).length;

    document.getElementById(
        "totalResolvido"
    ).innerText =
        lista.filter(
            p => p.status === "RESOLVIDO"
        ).length;
}


// =======================
// LIMPAR FORM
// =======================

function limparFormulario() {

    document.getElementById("banco").value = "";

    document.getElementById("data").value = "";

    document.getElementById("cliente").value = "";

    document.getElementById("valor").value = "";

    normalizarDono(
        document.getElementById("dono").value
    )
    document.getElementById("transacao").value =
        "CRÉDITO";
    document.getElementById("observacao").value = "";
}

// =======================
// FORMATAR DATA
// =======================

function formatarDataBR(data) {

    if (!data) return "";

    const partes =
        data.split("-");

    if (partes.length !== 3) {

        return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// =======================
// CALCULAR DIAS
// =======================

function calcularDias(data) {

    if (!data) return 0;

    const hoje = new Date();

    const dataPendencia =
        new Date(data);

    const diff =
        hoje.getTime() -
        dataPendencia.getTime();

    return Math.floor(
        diff / (1000 * 60 * 60 * 24)
    );
}// =======================
// IMPORTAR EXCEL
// =======================

document
    .getElementById("excelFile")
    .addEventListener("change", async (e) => {

        const file = e.target.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = async function (evt) {

            const data =
                new Uint8Array(evt.target.result);

            const workbook =
                XLSX.read(data, {
                    type: "array"
                });

            const sheetName =
                workbook.SheetNames[0];

            const sheet =
                workbook.Sheets[sheetName];

            // TODAS AS LINHAS
            const rows =
                XLSX.utils.sheet_to_json(sheet, {
                    header: 1,
                    raw: true
                });

            // COMEÇA DA LINHA 6
            const dados =
                rows.slice(5);

            // ARRAY GERAL
            const pendenciasImportadas = [];

            // LOOP
            for (const row of dados) {

                // IGNORA LINHAS VAZIAS
                if (
                    !row ||
                    row.length === 0 ||
                    !row[0]
                ) {
                    continue;
                }

                const pendencia = {

                    banco:
                        String(row[0] || "").trim(),

                    data:
                        converterData(row[1]),

                    cliente:
                        String(row[2] || "").trim(),

                    valor:
                        converterValor(row[3]),

                    transacao:
                        String(
                            row[4] || "CRÉDITO"
                        )
                            .trim()
                            .toUpperCase(),

                    dono:
                        normalizarDono(
                            String(row[5] || "")
                        ),
                    observacao:
                        String(row[6] || "").trim(),

                    status:
                        normalizarStatus(row[7])
                };

                pendenciasImportadas.push(
                    pendencia
                );
            }


            // INSERT EM LOTES
            const tamanhoLote = 200;

            for (
                let i = 0;
                i < pendenciasImportadas.length;
                i += tamanhoLote
            ) {

                const lote =
                    pendenciasImportadas.slice(
                        i,
                        i + tamanhoLote
                    );

                const { error } =
                    await supabaseClient
                        .from("pendencias")
                        .insert(lote);

                if (error) {

                    console.error(error);

                    alert(
                        "Erro ao importar:\n" +
                        error.message
                    );

                    return;
                }
            }

            carregarPendencias();

            alert(
                "Planilha importada com sucesso!"
            );
        };

        reader.readAsArrayBuffer(file);
    });


// =======================
// NORMALIZAR STATUS
// =======================

function normalizarStatus(status) {

    if (!status) {
        return "PENDENTE";
    }

    status =
        String(status)
            .trim()
            .toUpperCase();

    if (
        status.includes("RESOL")
    ) {
        return "RESOLVIDO";
    }

    return "PENDENTE";
}

// =======================
// CONVERTER DATA EXCEL
// =======================

function converterData(valor) {

    // DATA NUMERICA EXCEL
    if (typeof valor === "number") {

        const data =
            XLSX.SSF.parse_date_code(valor);

        const ano =
            data.y;

        const mes =
            String(data.m).padStart(2, "0");

        const dia =
            String(data.d).padStart(2, "0");

        return `${ano}-${mes}-${dia}`;
    }

    // STRING
    if (typeof valor === "string") {

        valor = valor.trim();

        // DD/MM/YYYY
        if (valor.includes("/")) {

            const partes =
                valor.split("/");

            if (partes.length === 3) {

                const dia =
                    partes[0].padStart(2, "0");

                const mes =
                    partes[1].padStart(2, "0");

                let ano =
                    partes[2];

                if (ano.length === 2) {
                    ano = "20" + ano;
                }

                return `${ano}-${mes}-${dia}`;
            }
        }

        // YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
            return valor;
        }
    }

    return null;
}
// =======================
// CONVERTER VALOR
// =======================

function converterValor(valor) {

    // VALOR NUMÉRICO EXCEL
    if (typeof valor === "number") {

        return Number(valor);
    }

    // STRING
    if (typeof valor === "string") {

        valor = valor.trim();

        // REMOVE R$
        valor =
            valor.replace("R$", "");

        // FORMATO BR
        if (
            valor.includes(",")
        ) {

            valor =
                valor
                    .replace(/\./g, "")
                    .replace(",", ".");
        }

        return Number(valor) || 0;
    }

    return 0;
}
// =======================
// FILTROS
// =======================

document
    .getElementById(
        "filtroStatus"
    )
    .addEventListener(
        "change",
        preencherFiltroDono
    );

// =======================
// PESQUISA
// =======================

document
    .getElementById("search")
    .addEventListener("input", async (e) => {

        const termo =
            e.target.value.toLowerCase();

        const filtro =
            document.getElementById(
                "filtroStatus"
            ).value;

        let query =
            supabaseClient
                .from("pendencias")
                .select("*")
                .order("id", {
                    ascending: false
                });

        // FILTRO STATUS
        if (filtro !== "TODOS") {

            query =
                query.eq("status", filtro);
        }

        const { data, error } =
            await query;

        if (error) {
            console.error(error);
            return;
        }

        // FILTRO PESQUISA
        const filtrados =
            data.filter((p) => {

                // VALOR FORMATADO BR
                const valorFormatado =
                    Number(
                        p.valor || 0
                    ).toLocaleString(
                        "pt-BR",
                        {
                            minimumFractionDigits: 2
                        }
                    );

                // TEXTO GERAL
                const textoBusca = `

            ${p.banco || ""}

            ${p.cliente || ""}

            ${p.dono || ""}

            ${p.observacao || ""}

            ${p.valor || ""}

            ${valorFormatado}

        `.toLowerCase();

                return textoBusca.includes(
                    termo
                );
            });

        renderTabela(filtrados);
    });
// =======================
// PREENCHER FILTRO DONO
// =======================

async function preencherFiltroDono() {

    const select =
        document.getElementById(
            "filtroDono"
        );

    const filtroStatus =
        document.getElementById(
            "filtroStatus"
        )?.value || "PENDENTE";

    if (!select) return;

    // SALVA SELEÇÃO ATUAL
    const valorAtual =
        select.value || "TODOS";

    let query =
        supabaseClient
            .from("pendencias")
            .select("dono,status");

    // STATUS
    if (
        filtroStatus !==
        "TODOS"
    ) {

        query =
            query.eq(
                "status",
                filtroStatus
            );
    }

    const { data, error } =
        await query;

    if (error) {

        console.error(error);

        return;
    }

    // PEGA DONOS
    const donos =
        data
            .filter((p) => p.dono)
            .map((p) =>

                normalizarNome(
                    p.dono
                )
            );

    // REMOVE DUPLICADOS
    const donosUnicos =
        [...new Set(donos)]
            .sort();

    // HTML
    select.innerHTML =
        `
        <option value="TODOS">
            Todos
        </option>
        `;

    donosUnicos.forEach((nome) => {

        select.innerHTML += `

            <option value="${nome}">
                ${nome}
            </option>

        `;
    });

    // RESTAURA VALOR
    if (

        [...select.options]
            .some(
                (o) =>
                    o.value ===
                    valorAtual
            )

    ) {

        select.value =
            valorAtual;
    }
}
// =======================
// GERAR IMAGEM GERAL
// =======================

async function gerarImagemRelatorio() {

    const { data, error } =
        await supabaseClient
            .from("pendencias")
            .select("*")
            .eq("status", "PENDENTE")
            .order("id", {
                ascending: false
            });

    if (error) {

        console.error(error);

        return;
    }

    gerarImagem(data, "geral");
}


// =======================
// GERAR IMAGEM RESPONSAVEL
// =======================

async function gerarImagemResponsavel() {

    const responsavel =
        document.getElementById(
            "filtroDono"
        )?.value;

    if (
        responsavel === "TODOS"
    ) {

        alert(
            "Selecione um responsável no filtro."
        );

        return;
    }

    const { data, error } =
        await supabaseClient
            .from("pendencias")
            .select("*")
            .eq("status", "PENDENTE")
            .eq("dono", responsavel)
            .order("id", {
                ascending: false
            });

    if (error) {

        console.error(error);

        return;
    }

    gerarImagem(data, responsavel);
}
// =======================
// EXPORTAR FILTROS
// =======================

async function gerarImagemFiltros() {

    const filtroStatus =
        document.getElementById(
            "filtroStatus"
        )?.value || "PENDENTE";

    const filtroDono =
        document.getElementById(
            "filtroDono"
        )?.value || "TODOS";

    const dataInicial =
        document.getElementById(
            "dataInicial"
        )?.value;

    const dataFinal =
        document.getElementById(
            "dataFinal"
        )?.value;

    const termo =
        document.getElementById(
            "search"
        )?.value
            .toLowerCase();

    let query =
        supabaseClient
            .from("pendencias")
            .select("*")
            .order("data", {
                ascending: true
            });

    // STATUS
    if (
        filtroStatus !==
        "TODOS"
    ) {

        query =
            query.eq(
                "status",
                filtroStatus
            );
    }

    // DONO
    if (
        filtroDono !==
        "TODOS"
    ) {

        query =
            query.eq(
                "dono",
                filtroDono
            );
    }

    // DATA INICIAL
    if (dataInicial) {

        query =
            query.gte(
                "data",
                dataInicial
            );
    }

    // DATA FINAL
    if (dataFinal) {

        query =
            query.lte(
                "data",
                dataFinal
            );
    }

    const { data, error } =
        await query;

    if (error) {

        console.error(error);

        return;
    }

    // PESQUISA
    const filtrados =
        data.filter((p) => {

            if (!termo) {

                return true;
            }

            return (

                p.banco
                    ?.toLowerCase()
                    .includes(termo)

                ||

                p.cliente
                    ?.toLowerCase()
                    .includes(termo)

                ||

                p.dono
                    ?.toLowerCase()
                    .includes(termo)

                ||

                p.observacao
                    ?.toLowerCase()
                    .includes(termo)
            );
        });

    gerarImagem(
        filtrados,
        "filtros"
    );
}

// =======================
// GERAR IMAGEM
// =======================

async function gerarImagem(lista, nome) {

    const div =
        document.createElement("div");

    div.className =
        "relatorio-exportacao";

    const dataAtual =
        new Date()
            .toLocaleString("pt-BR");

    const valorTotal =
        lista.reduce(
            (acc, p) =>
                acc + Number(p.valor),
            0
        );

    div.innerHTML = `

    <h1>
      CONTROLE DE PENDÊNCIAS
    </h1>

    <div class="relatorio-info">

      Atualizado em:
      ${dataAtual}

      <br><br>

      Total Pendências:
      ${lista.length}

      <br>

      Valor Total:
      ${valorTotal.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    )}

    </div>

    <table>

      <thead>

        <tr>

          <th>Banco</th>

          <th>Data</th>

          <th>Cliente</th>

          <th>Valor</th>

          <th>Transação</th>

          <th>Dono</th>

          <th>Observação</th>

          <th>Dias</th>

        </tr>

      </thead>

      <tbody>

        ${lista.map((p) => `

          <tr>

            <td>${p.banco}</td>

            <td>
              ${formatarDataBR(p.data)}
            </td>

            <td>${p.cliente}</td>

            <td>
              ${Number(p.valor)
            .toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            )}
            </td>

            <td>${p.transacao}</td>

            <td>${p.dono}</td>

            <td>${p.observacao}</td>

            <td>
              ${calcularDias(p.data)}
            </td>

          </tr>

        `).join("")}

      </tbody>

    </table>
  `;

    document.body.appendChild(div);

    const canvas =
        await html2canvas(div, {

            scale: 2,

            useCORS: true
        });

    const link =
        document.createElement("a");

    link.download =
        `pendencias-${nome}.png`;

    link.href =
        canvas.toDataURL("image/png");

    link.click();

    document.body.removeChild(div);
}
// =======================
// FILTROS DATA
// =======================

document
    .getElementById("filtroDono")
    .addEventListener("change", () => {

        carregarPendencias();
    });

document
    .getElementById("filtroTransacao")
    .addEventListener("change", () => {

        carregarPendencias();
    });

document
    .getElementById("dataInicial")
    .addEventListener("change", () => {

        carregarPendencias();
    });

// =======================
// EDITAR PENDENCIA
// =======================

async function editarPendencia(id) {

    const { data, error } =
        await supabaseClient
            .from("pendencias")
            .select("*")
            .eq("id", id)
            .single();

    if (error) {

        console.error(error);

        return;
    }

    // DEFINE ID EDIÇÃO
    editandoId = id;

    // PREENCHE CAMPOS
    document.getElementById(
        "banco"
    ).value = data.banco || "";

    document.getElementById(
        "data"
    ).value = data.data || "";

    document.getElementById(
        "cliente"
    ).value = data.cliente || "";

    document.getElementById(
        "valor"
    ).value = data.valor || "";

    document.getElementById(
        "transacao"
    ).value = data.transacao || "";

    document.getElementById(
        "dono"
    ).value = data.dono || "";

    document.getElementById(
        "observacao"
    ).value = data.observacao || "";

    document.getElementById(
        "status"
    ).value = data.status || "";

    // ALTERA BOTÃO
    document.querySelector(
        ".btn-primary"
    ).innerText =
        "Salvar Alterações";

    // SCROLL TOPO
    window.scrollTo({

        top: 0,

        behavior: "smooth"
    });
}
// =======================
// EDITAR LINHA
// =======================

async function editarLinha(id) {

    const linha =
        document.getElementById(
            `linha-${id}`
        );

    const { data, error } =
        await supabaseClient
            .from("pendencias")
            .select("*")
            .eq("id", id)
            .single();

    if (error) {

        console.error(error);

        return;
    }

    linha.innerHTML = `

        <td>

            <select id="edit-banco-${id}">

                ${await gerarOptionsBanco(
        data.banco
    )}

            </select>

        </td>

</select>

        <td>
            <input
                type="date"
                id="edit-data-${id}"
                value="${data.data || ""}"
            />
        </td>

        <td>
            <input
                id="edit-cliente-${id}"
                value="${data.cliente || ""}"
            />
        </td>

        <td>
            <input
                type="number"
                id="edit-valor-${id}"
                value="${data.valor || 0}"
            />
        </td>

        <td>

            <select
                id="edit-transacao-${id}"
            >

                <option
                  ${data.transacao === "CRÉDITO" ? "selected" : ""}
                >
                  CRÉDITO
                </option>

                <option
                  ${data.transacao === "DÉBITO" ? "selected" : ""}
                >
                  DÉBITO
                </option>

            </select>

        </td>

        <td>

            <select
                id="edit-dono-${id}"
            >

                ${await gerarOptionsDono(
        data.dono
    )}

            </select>

        </td>

        <td class="obs">
            <input
                id="edit-observacao-${id}"
                value="${data.observacao || ""}"
            />
        </td>

        <td>

            <select
                id="edit-status-${id}"
            >

                <option
                  ${data.status === "PENDENTE" ? "selected" : ""}
                >
                  PENDENTE
                </option>

                <option
                  ${data.status === "RESOLVIDO" ? "selected" : ""}
                >
                  RESOLVIDO
                </option>

            </select>

        </td>

        <td>
            ${calcularDias(data.data)}
        </td>

        <td class="acoes">

            <button
                class="save-btn"
                onclick="salvarEdicao(${id})"
            >
                Salvar
            </button>

            <button
                class="cancel-btn"
                onclick="carregarPendencias()"
            >
                Cancelar
            </button>

        </td>
    `;
}

// =======================
// SALVAR EDIÇÃO
// =======================

async function salvarEdicao(id) {

    // DADOS ANTIGOS
    const { data: antigo } =
        await supabaseClient
            .from("pendencias")
            .select("*")
            .eq("id", id)
            .single();

    const pendencia = {

        banco:
            document.getElementById(
                `edit-banco-${id}`
            ).value,

        data:
            document.getElementById(
                `edit-data-${id}`
            ).value,

        cliente:
            document.getElementById(
                `edit-cliente-${id}`
            ).value,

        valor:
            Number(
                document.getElementById(
                    `edit-valor-${id}`
                ).value
            ),

        transacao:
            document.getElementById(
                `edit-transacao-${id}`
            ).value,

        dono:
            normalizarDono(
                document.getElementById(
                    `edit-dono-${id}`
                ).value
            ),

        observacao:
            document.getElementById(
                `edit-observacao-${id}`
            ).value,

        status:
            document.getElementById(
                `edit-status-${id}`
            ).value
    };

    // UPDATE
    const { error } =
        await supabaseClient
            .from("pendencias")
            .update(pendencia)
            .eq("id", id);

    if (error) {

        console.error(error);

        alert(
            "Erro ao salvar."
        );

        return;
    }

    // =======================
    // LOG ALTERAÇÕES
    // =======================

    let alteracoes = "";

    // BANCO
    if (antigo.banco !== pendencia.banco) {

        alteracoes += `

Banco:
${antigo.banco}
→
${pendencia.banco}

`;
    }

    // DATA
    if (antigo.data !== pendencia.data) {

        alteracoes += `

Data:
${formatarDataBR(antigo.data)}
→
${formatarDataBR(pendencia.data)}

`;
    }

    // CLIENTE
    if (antigo.cliente !== pendencia.cliente) {

        alteracoes += `

Cliente:
${antigo.cliente}
→
${pendencia.cliente}

`;
    }

    // VALOR
    if (
        Number(antigo.valor) !==
        Number(pendencia.valor)
    ) {

        alteracoes += `

Valor:
R$ ${Number(antigo.valor)
                .toLocaleString(
                    "pt-BR",
                    {
                        minimumFractionDigits: 2
                    }
                )}

→

R$ ${Number(pendencia.valor)
                .toLocaleString(
                    "pt-BR",
                    {
                        minimumFractionDigits: 2
                    }
                )}

`;
    }

    // TRANSAÇÃO
    if (
        antigo.transacao !==
        pendencia.transacao
    ) {

        alteracoes += `

Transação:
${antigo.transacao}
→
${pendencia.transacao}

`;
    }

    // RESPONSÁVEL
    if (antigo.dono !== pendencia.dono) {

        alteracoes += `

Responsável:
${antigo.dono}
→
${pendencia.dono}

`;
    }

    // OBSERVAÇÃO
    if (
        antigo.observacao !==
        pendencia.observacao
    ) {

        alteracoes += `

Observação:
${antigo.observacao || "(vazio)"}

→

${pendencia.observacao || "(vazio)"}

`;
    }

    // STATUS
    if (
        antigo.status !==
        pendencia.status
    ) {

        alteracoes += `

Status:
${antigo.status}
→
${pendencia.status}

`;
    }

    // SE NADA MUDOU
    if (!alteracoes.trim()) {

        alteracoes =
            "Nenhuma alteração detectada.";
    }

    // LOG
    await registrarLog(

        "EDITOU PENDÊNCIA",

        `
ID:
${id}

Cliente:
${pendencia.cliente}

${alteracoes}
`
    );

    // RECARREGA
    carregarPendencias();
}

// =======================
// PADRONIZAR DONOS EXISTENTES
// =======================

async function padronizarDonosExistentes() {

    const { data, error } =
        await supabaseClient
            .from("pendencias")
            .select("*");

    if (error) {

        console.error(error);

        return;
    }

    for (const p of data) {

        const donoNormalizado =
            normalizarDono(
                p.dono
            );

        // UPDATE
        await supabaseClient
            .from("pendencias")
            .update({
                dono:
                    donoNormalizado
            })
            .eq("id", p.id);
    }

    alert(
        "Donos padronizados!"
    );

    carregarPendencias();
}
// =======================
// PREENCHER SELECT DONO
// =======================

async function preencherSelectDono() {

    const select =
        document.getElementById(
            "dono"
        );

    const valorAtual =
        select.value;

    const { data, error } =
        await supabaseClient
            .from("responsaveis")
            .select("nome")
            .order("nome");

    if (error) {

        console.error(error);

        return;
    }

    select.innerHTML = `
      <option value="">
        Selecione o Responsável
      </option>
    `;

    data.forEach((r) => {

        select.innerHTML += `
          <option value="${r.nome}">
            ${r.nome}
          </option>
        `;
    });

    select.value =
        valorAtual || "";
}
// =======================
// OPTIONS DONOS
// =======================

async function gerarOptionsDono(
    selecionado = ""
) {

    const { data, error } =
        await supabaseClient
            .from("responsaveis")
            .select("nome")
            .order("nome");

    if (error) {

        console.error(error);

        return "";
    }

    return data.map((r) => `

        <option
            value="${r.nome}"
            ${r.nome === selecionado
            ? "selected"
            : ""
        }
        >
            ${r.nome}
        </option>

    `).join("");
}
// =======================
// OPTIONS BANCOS
// =======================

async function gerarOptionsBanco(
    selecionado = ""
) {

    const { data, error } =
        await supabaseClient
            .from("bancos")
            .select("nome")
            .order("nome");

    if (error) {

        console.error(error);

        return "";
    }

    return data.map((b) => `

        <option
            value="${b.nome}"
            ${b.nome === selecionado
            ? "selected"
            : ""
        }
        >
            ${b.nome}
        </option>

    `).join("");
}
// =======================
// PREENCHER BANCOS
// =======================

async function preencherSelectBanco() {

    const select =
        document.getElementById(
            "banco"
        );

    const valorAtual =
        select.value;

    const { data, error } =
        await supabaseClient
            .from("bancos")
            .select("nome")
            .order("nome");

    if (error) {

        console.error(error);

        return;
    }

    select.innerHTML = `
      <option value="">
        Selecione o Banco
      </option>
    `;

    data.forEach((b) => {

        select.innerHTML += `
          <option value="${b.nome}">
            ${b.nome}
          </option>
        `;
    });

    select.value =
        valorAtual || "";
}

// =======================
// LOGOUT
// =======================

function logout() {

    localStorage.removeItem(
        "usuario"
    );

    window.location.href =
        "login.html";
}
// =======================
// NORMALIZAR NOME
// =======================

function normalizarNome(nome) {

    if (!nome) return "";

    return nome
        .trim()
        .toUpperCase();
}

// =======================
// RESIZE FIXO EXCEL
// =======================

function ativarResizeColunas() {

    const tabela =
        document.querySelector("table");

    if (!tabela) return;

    const headers =
        tabela.querySelectorAll("th");

    headers.forEach((th, index) => {

        // ÚLTIMA NÃO
        if (
            index === headers.length - 1
        ) return;

        // EVITA DUPLICAR
        if (
            th.querySelector(".resizer")
        ) return;

        const nextTh =
            headers[index + 1];

        const resizer =
            document.createElement("div");

        resizer.classList.add(
            "resizer"
        );

        th.appendChild(resizer);

        let startX = 0;

        let startWidth = 0;

        let nextWidth = 0;

        const mouseDown =
            (e) => {

                e.preventDefault();

                startX =
                    e.pageX;

                startWidth =
                    th.offsetWidth;

                nextWidth =
                    nextTh.offsetWidth;

                document.addEventListener(
                    "mousemove",
                    mouseMove
                );

                document.addEventListener(
                    "mouseup",
                    mouseUp
                );
            };

        const mouseMove =
            (e) => {

                const dx =
                    e.pageX - startX;

                const novaWidth =
                    startWidth + dx;

                const novaNextWidth =
                    nextWidth - dx;

                // LIMITES
                if (
                    novaWidth < 60 ||
                    novaNextWidth < 60
                ) return;

                // HEADER ATUAL
                th.style.width =
                    `${novaWidth}px`;

                // HEADER NEXT
                nextTh.style.width =
                    `${novaNextWidth}px`;

                // TDs ATUAL
                document
                    .querySelectorAll(
                        `td:nth-child(${index + 1})`
                    )
                    .forEach((td) => {

                        td.style.width =
                            `${novaWidth}px`;
                    });

                // TDs NEXT
                document
                    .querySelectorAll(
                        `td:nth-child(${index + 2})`
                    )
                    .forEach((td) => {

                        td.style.width =
                            `${novaNextWidth}px`;
                    });
            };

        const mouseUp =
            () => {

                document.removeEventListener(
                    "mousemove",
                    mouseMove
                );

                document.removeEventListener(
                    "mouseup",
                    mouseUp
                );
            };

        resizer.addEventListener(
            "mousedown",
            mouseDown
        );
    });
}
async function moverParaDuplicados(id) {

    const confirmar =
        confirm(
            "Mover esta pendência para Duplicados?"
        );

    if (!confirmar) return;

    try {

        // BUSCA REGISTRO

        const {
            data: pendencia,
            error: erroBusca
        } = await supabaseClient
            .from("pendencias")
            .select("*")
            .eq("id", id)
            .single();

        if (erroBusca) {

            alert(
                "Erro ao localizar pendência."
            );

            console.error(
                erroBusca
            );

            return;
        }

        // INSERE EM DUPLICADOS

        const {
            error: erroInsert
        } = await supabaseClient
            .from("duplicados")
            .insert([{

                banco:
                    pendencia.banco,

                data:
                    pendencia.data,

                cliente:
                    pendencia.cliente,

                valor:
                    pendencia.valor,

                transacao:
                    pendencia.transacao,

                dono:
                    pendencia.dono,

                observacao:
                    pendencia.observacao,

                status:
                    pendencia.status

            }]);

        if (erroInsert) {

            alert(
                "Erro ao mover para Duplicados."
            );

            console.error(
                erroInsert
            );

            return;
        }

        // REMOVE DA TABELA ORIGINAL

        const {
            error: erroDelete
        } = await supabaseClient
            .from("pendencias")
            .delete()
            .eq("id", id);

        if (erroDelete) {

            alert(
                "Registro foi copiado mas não foi removido."
            );

            console.error(
                erroDelete
            );

            return;
        }

        alert(
            "Movido para Duplicados."
        );

        carregarPendencias();

    }
    catch (erro) {

        console.error(
            erro
        );

        alert(
            "Erro inesperado."
        );
    }
}
// =======================
// ABRIR OBSERVAÇÃO INTERNA
// =======================

async function abrirObservacaoInterna(id){

    pendenciaObsAtual = id;

    const { data, error } =
        await supabaseClient
            .from("pendencias")
            .select("cliente, observacao_interna")
            .eq("id", id)
            .single();

    if(error){

        console.error(error);

        return;
    }

    document.getElementById(
        "textoObsInterna"
    ).value =
        data.observacao_interna || "";

    document.getElementById(
        "modalObsInterna"
    ).style.display = "flex";
}
// =======================
// FECHAR MODAL
// =======================

function fecharModalObs(){

    document.getElementById(
        "modalObsInterna"
    ).style.display = "none";

    pendenciaObsAtual = null;
}
// =======================
// SALVAR OBSERVAÇÃO INTERNA
// =======================

async function salvarObservacaoInterna(){

    if(!pendenciaObsAtual){

        return;
    }

    // Busca a pendência atual
    const { data: antiga } =
        await supabaseClient
            .from("pendencias")
            .select("*")
            .eq("id", pendenciaObsAtual)
            .single();

    const texto = document
        .getElementById(
            "textoObsInterna"
        )
        .value;

    const { error } =
        await supabaseClient
            .from("pendencias")
            .update({

                observacao_interna: texto

            })
            .eq(
                "id",
                pendenciaObsAtual
            );

    if(error){

        console.error(error);

        alert(
            "Erro ao salvar."
        );

        return;
    }

    // REGISTRA LOG

    await registrarLog(

        "EDITOU OBSERVAÇÃO INTERNA",

        `

Cliente:
${antiga.cliente}

Observação Interna:

${antiga.observacao_interna || "(vazia)"}

↓

${texto || "(vazia)"}

        `
    );

    fecharModalObs();

    carregarPendencias();
}