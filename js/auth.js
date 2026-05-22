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
// LOGIN
// =======================

async function login() {

    const email =
        document.getElementById(
            "email"
        ).value
            .trim()
            .toLowerCase();

    const senha =
        document.getElementById(
            "senha"
        ).value
            .trim();

    if (
        !email ||
        !senha
    ) {

        alert(
            "Preencha email e senha."
        );

        return;
    }

    // VERIFICA USUÁRIO
    const { data, error } =
        await supabaseClient
            .from("usuarios")
            .select("*")
            .eq("email", email)
            .eq("senha", senha)
            .single();

    if (
        error ||
        !data
    ) {

        alert(
            "Email ou senha inválidos."
        );

        return;
    }

    // SALVA LOCAL
    localStorage.setItem(
        "usuario",
        JSON.stringify({

            email: data.email,

            role: data.role
        })
    );

    // REDIRECIONA
    window.location.href =
        "index.html";
}