/*=========================================
    TRANSACTIONS.JS
=========================================*/

document.addEventListener("DOMContentLoaded", async () => {

    await requireLogin();

    setupTransactionModal();

    await loadTransactions();

});


/*=========================================
    LOAD TRANSACTIONS
=========================================*/

async function loadTransactions(){

    const {
        data: { user },
        error: userError
    } = await db.auth.getUser();

    if(userError || !user){

        window.location.href = "login.html";

        return;

    }


    const { data, error } = await db
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
            ascending:false
        });


    if(error){

        console.error("Transaction loading error:", error);

        return;

    }


    const table =
        document.getElementById("transactionTable");

    const totalTransactions =
        document.getElementById("totalTransactions");

    const completedTransactions =
        document.getElementById("completedTransactions");

    const pendingTransactions =
        document.getElementById("pendingTransactions");

    const totalAmount =
        document.getElementById("totalAmount");


    totalTransactions.textContent =
        data.length;


    let completed = 0;

    let pending = 0;

    let amount = 0;


    table.innerHTML = "";


    if(data.length === 0){

        table.innerHTML = `
            <tr>
                <td colspan="5"
                    style="text-align:center;padding:40px;">
                    No transactions found.
                </td>
            </tr>
        `;

    }


    data.forEach(transaction => {

        const transactionAmount =
            Number(transaction.amount) || 0;


        amount += transactionAmount;


        if(transaction.status === "Completed"){
            completed++;
        }


        if(transaction.status === "Pending"){
            pending++;
        }


        const date =
            transaction.created_at
                ? new Date(
                    transaction.created_at
                ).toLocaleDateString()
                : "--";


        table.innerHTML += `
            <tr>

                <td>
                    ${transaction.id.substring(0,8)}...
                </td>

                <td>
                    ${date}
                </td>

                <td>
                    ₦${transactionAmount.toLocaleString()}
                </td>

                <td>
                    ${transaction.status}
                </td>

                <td>

                    <button
                        class="view-btn"
                        type="button">
                        View
                    </button>

                </td>

            </tr>
        `;

    });


    completedTransactions.textContent =
        completed;


    pendingTransactions.textContent =
        pending;


    totalAmount.textContent =
        "₦" + amount.toLocaleString();

}


/*=========================================
    TRANSACTION MODAL
=========================================*/

function setupTransactionModal(){

    const modal =
        document.getElementById(
            "transactionModal"
        );

    const openButton =
        document.getElementById(
            "newTransactionBtn"
        );

    const closeButton =
        document.getElementById(
            "closeTransactionModal"
        );

    const cancelButton =
        document.getElementById(
            "cancelTransaction"
        );

    const form =
        document.getElementById(
            "transactionForm"
        );


    if(!modal || !openButton || !form){

        console.error(
            "Transaction modal elements missing."
        );

        return;

    }


    /* OPEN */

    openButton.addEventListener("click", () => {

        modal.classList.add("show");

        document
            .getElementById("transactionName")
            .focus();

    });


    /* CLOSE */

    closeButton.addEventListener("click", () => {

        closeTransactionModal();

    });


    cancelButton.addEventListener("click", () => {

        closeTransactionModal();

    });


    /* CLICK OUTSIDE */

    modal.addEventListener("click", (event) => {

        if(event.target === modal){

            closeTransactionModal();

        }

    });


    /* ESC KEY */

    document.addEventListener("keydown", (event) => {

        if(
            event.key === "Escape" &&
            modal.classList.contains("show")
        ){

            closeTransactionModal();

        }

    });


    /* SUBMIT */

    form.addEventListener(
        "submit",
        saveTransaction
    );

}


/*=========================================
    CLOSE MODAL
=========================================*/

function closeTransactionModal(){

    const modal =
        document.getElementById(
            "transactionModal"
        );

    const form =
        document.getElementById(
            "transactionForm"
        );


    modal.classList.remove("show");

    form.reset();

}


/*=========================================
    SAVE TRANSACTION
=========================================*/

async function saveTransaction(event){

    event.preventDefault();


    const saveButton =
        document.getElementById(
            "saveTransaction"
        );


    const transactionName =
        document.getElementById(
            "transactionName"
        ).value.trim();


    const transactionAmount =
        Number(
            document.getElementById(
                "transactionAmount"
            ).value
        );


    const transactionStatus =
        document.getElementById(
            "transactionStatus"
        ).value;


    const transactionNotes =
        document.getElementById(
            "transactionNotes"
        ).value.trim();


    if(!transactionName){

        alert(
            "Please enter a transaction name."
        );

        return;

    }


    if(
        !Number.isFinite(transactionAmount) ||
        transactionAmount < 0
    ){

        alert(
            "Please enter a valid amount."
        );

        return;

    }


    saveButton.disabled = true;

    saveButton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Saving...
    `;


    try{

        const {
            data: { user },
            error: userError
        } = await db.auth.getUser();


        if(userError || !user){

            throw new Error(
                "Your session has expired. Please log in again."
            );

        }


        const { error } = await db
            .from("transactions")
            .insert({

                user_id: user.id,

                transaction_name:
                    transactionName,

                amount:
                    transactionAmount,

                status:
                    transactionStatus,

                notes:
                    transactionNotes || null

            });


        if(error){

            throw error;

        }


        closeTransactionModal();

        await loadTransactions();


        alert(
            "Transaction saved successfully!"
        );


    }catch(error){

        console.error(
            "Transaction save error:",
            error
        );


        alert(
            error.message ||
            "Unable to save transaction."
        );


    }finally{

        saveButton.disabled = false;

        saveButton.innerHTML = `
            <i class="fa-solid fa-check"></i>
            Save Transaction
        `;

    }

}