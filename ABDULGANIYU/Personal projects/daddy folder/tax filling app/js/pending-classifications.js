/*=========================================
    PENDING CLASSIFICATIONS.JS
=========================================*/

document.addEventListener("DOMContentLoaded", async () => {

    console.log(
        "Pending Classifications page loaded."
    );

    await loadPendingClassifications();

    setupRefreshButton();

});


/*=========================================
    LOAD PENDING CLASSIFICATIONS
=========================================*/

async function loadPendingClassifications() {

    const container =
        document.getElementById(
            "pendingTransactions"
        );

    const loading =
        document.getElementById(
            "classificationLoading"
        );

    const empty =
        document.getElementById(
            "classificationEmpty"
        );


    try {

        if (loading) {

            loading.hidden = false;

        }

        if (empty) {

            empty.hidden = true;

        }


        if (container) {

            container.innerHTML = "";

        }


        /*=========================================
            CHECK SUPABASE
        =========================================*/

        if (
            typeof db === "undefined"
        ) {

            throw new Error(
                "Supabase client was not found. Check supabase.js."
            );

        }


        /*=========================================
            GET LOGGED-IN USER
        =========================================*/

        const {
            data: {
                user
            },
            error: userError
        } = await db.auth.getUser();


        if (userError) {

            throw userError;

        }


        if (!user) {

            throw new Error(
                "No logged-in user was found."
            );

        }


        console.log(
            "Logged-in user:",
            user.id
        );


        /*=========================================
            GET TRANSACTIONS
        =========================================*/

        const {
            data: transactions,
            error
        } = await db
            .from("transactions")
            .select("*")
            .eq(
                "user_id",
                user.id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            throw error;

        }


        console.log(
            "Transactions from Supabase:",
            transactions
        );


        const allTransactions =
            transactions || [];


        /*=========================================
            UPDATE COUNTS
        =========================================*/

        updateClassificationCounts(
            allTransactions
        );


        /*=========================================
            FILTER PENDING
        =========================================*/

        const pending =
            allTransactions.filter(
                transaction => {

                    const status =
                        String(
                            transaction.status || ""
                        )
                        .trim()
                        .toLowerCase();


                    const classification =
                        String(
                            transaction.classification || ""
                        )
                        .trim()
                        .toLowerCase();


                    return (
                        status === "pending" &&
                        (
                            classification === "" ||
                            classification === "pending"
                        )
                    );

                }
            );


        console.log(
            "Pending transactions:",
            pending
        );


        if (loading) {

            loading.hidden = true;

        }


        /*=========================================
            NO PENDING TRANSACTIONS
        =========================================*/

        if (
            pending.length === 0
        ) {

            if (empty) {

                empty.hidden = false;

            }

            return;

        }


        /*=========================================
            SHOW TRANSACTIONS
        =========================================*/

        renderPendingTransactions(
            pending
        );


    } catch (error) {

        console.error(
            "Pending Classifications Error:",
            error
        );


        if (loading) {

            loading.hidden = true;

        }


        if (empty) {

            empty.hidden = false;

            empty.innerHTML = `

                <div class="empty-icon">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                </div>

                <h3>
                    Unable to load classifications
                </h3>

                <p>
                    ${escapeHTML(
                        error.message ||
                        "Something went wrong."
                    )}
                </p>

            `;

        }

    }

}


/*=========================================
    UPDATE COUNTS
=========================================*/

function updateClassificationCounts(
    transactions
) {

    let pending = 0;

    let income = 0;

    let nonIncome = 0;

    let ignored = 0;


    transactions.forEach(
        transaction => {

            const status =
                String(
                    transaction.status || ""
                )
                .trim()
                .toLowerCase();


            const classification =
                String(
                    transaction.classification || ""
                )
                .trim()
                .toLowerCase();


            /* PENDING */

            if (
                status === "pending" &&
                (
                    classification === "" ||
                    classification === "pending"
                )
            ) {

                pending++;

            }


            /* INCOME */

            if (
                classification === "income"
            ) {

                income++;

            }


            /* NON-INCOME */

            if (
                classification === "non-income"
            ) {

                nonIncome++;

            }


            /* IGNORE */

            if (
                classification === "ignore"
            ) {

                ignored++;

            }

        }
    );


    setText(
        "pendingCount",
        pending
    );


    setText(
        "incomeCount",
        income
    );


    setText(
        "nonIncomeCount",
        nonIncome
    );


    setText(
        "ignoredCount",
        ignored
    );


    console.log(
        "Counts:",
        {
            pending,
            income,
            nonIncome,
            ignored
        }
    );

}


/*=========================================
    RENDER TRANSACTIONS
=========================================*/

function renderPendingTransactions(
    transactions
) {

    const container =
        document.getElementById(
            "pendingTransactions"
        );


    if (!container) {

        console.error(
            "pendingTransactions element was not found."
        );

        return;

    }


    container.innerHTML = "";


    transactions.forEach(
        transaction => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "pending-transaction-card";


            card.innerHTML = `

                <div class="transaction-info">

                    <h3>
                        ${escapeHTML(
                            transaction.transaction_name ||
                            "Unnamed transaction"
                        )}
                    </h3>

                    <p>
                        ${
                            transaction.notes
                                ? escapeHTML(
                                    transaction.notes
                                )
                                : "No notes"
                        }
                    </p>

                </div>


                <div class="transaction-amount">

                    ₦${Number(
                        transaction.amount || 0
                    ).toLocaleString(
                        "en-NG",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    )}

                </div>


                <div class="transaction-date">

                    ${formatDate(
                        transaction.created_at
                    )}

                </div>


                <div class="classification-actions">

                    <button
                        type="button"
                        class="classify-income"
                        data-id="${escapeHTML(
                            transaction.id
                        )}"
                        data-classification="Income"
                    >

                        <i class="fa-solid fa-arrow-trend-up"></i>

                        Income

                    </button>


                    <button
                        type="button"
                        class="classify-non-income"
                        data-id="${escapeHTML(
                            transaction.id
                        )}"
                        data-classification="Non-income"
                    >

                        <i class="fa-solid fa-minus"></i>

                        Non-income

                    </button>


                    <button
                        type="button"
                        class="classify-ignore"
                        data-id="${escapeHTML(
                            transaction.id
                        )}"
                        data-classification="Ignore"
                    >

                        <i class="fa-solid fa-ban"></i>

                        Ignore

                    </button>

                </div>

            `;


            /*=========================================
                BUTTON EVENTS
            =========================================*/

            const buttons =
                card.querySelectorAll(
                    ".classification-actions button"
                );


            buttons.forEach(
                button => {

                    button.addEventListener(
                        "click",
                        async () => {

                            const id =
                                button.dataset.id;


                            const classification =
                                button.dataset.classification;


                            await classifyTransaction(
                                id,
                                classification,
                                buttons
                            );

                        }
                    );

                }
            );


            container.appendChild(
                card
            );

        }
    );

}


/*=========================================
    CLASSIFY TRANSACTION
=========================================*/

async function classifyTransaction(
    transactionId,
    classification,
    buttons
) {

    try {

        console.log(
            "Classifying:",
            transactionId,
            classification
        );


        /*=========================================
            DISABLE BUTTONS
        =========================================*/

        buttons.forEach(
            button => {

                button.disabled = true;

            }
        );


        /*=========================================
            GET USER
        =========================================*/

        const {
            data: {
                user
            },
            error: userError
        } = await db.auth.getUser();


        if (userError) {

            throw userError;

        }


        if (!user) {

            throw new Error(
                "You are not logged in."
            );

        }


        /*=========================================
            UPDATE SUPABASE
        =========================================*/

        const {
            data,
            error
        } = await db
            .from("transactions")
            .update({

                classification:
                    classification,

                status:
                    "Completed"

            })
            .eq(
                "id",
                transactionId
            )
            .eq(
                "user_id",
                user.id
            )
            .select();


        if (error) {

            throw error;

        }


        console.log(
            "Updated transaction:",
            data
        );


        /*=========================================
            CHECK UPDATE
        =========================================*/

        if (
            !data ||
            data.length === 0
        ) {

            throw new Error(
                "The transaction was not updated. Check your Supabase RLS UPDATE policy."
            );

        }


        /*=========================================
            RELOAD
        =========================================*/

        await loadPendingClassifications();


        showMessage(
            "Transaction classified as " +
            classification +
            ".",
            "success"
        );


    } catch (error) {

        console.error(
            "Classification update error:",
            error
        );


        buttons.forEach(
            button => {

                button.disabled = false;

            }
        );


        showMessage(
            error.message ||
            "Unable to classify transaction.",
            "error"
        );

    }

}


/*=========================================
    REFRESH
=========================================*/

function setupRefreshButton() {

    const button =
        document.getElementById(
            "refreshClassifications"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        async () => {

            button.disabled = true;


            const originalHTML =
                button.innerHTML;


            button.innerHTML = `

                <i class="fa-solid fa-spinner fa-spin"></i>

                Refreshing...

            `;


            try {

                await loadPendingClassifications();

            } finally {

                button.disabled = false;

                button.innerHTML =
                    originalHTML;

            }

        }
    );

}


/*=========================================
    SET TEXT
=========================================*/

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}


/*=========================================
    FORMAT DATE
=========================================*/

function formatDate(
    value
) {

    if (!value) {

        return "--";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "--";

    }


    return date.toLocaleDateString(
        "en-NG",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


/*=========================================
    ESCAPE HTML
=========================================*/

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


/*=========================================
    SHOW MESSAGE
=========================================*/

function showMessage(
    message,
    type
) {

    /*
     * Use your existing toast function
     * if your project already has one.
     */

    if (
        typeof showToast ===
        "function"
    ) {

        showToast(
            message,
            type
        );

        return;

    }


    if (type === "error") {

        alert(message);

    } else {

        console.log(message);

    }

}