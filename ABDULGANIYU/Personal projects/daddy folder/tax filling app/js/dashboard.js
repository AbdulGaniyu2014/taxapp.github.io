/* =========================================
   TAXFLOW — DASHBOARD JS
   ========================================= */

document.addEventListener("DOMContentLoaded", async () => {

    /* =====================================
       SUPABASE
    ===================================== */

    const SUPABASE_URL =
        "https://jcwqobrhfsiiojaqntmd.supabase.co";

    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_84OBE6Hmjh4kMB9f1Qoe4g_TVo7q4NL";

    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );


    /* =====================================
       ELEMENTS
    ===================================== */

    const welcomeName =
        document.getElementById("welcomeName");

    const sidebarUserName =
        document.getElementById("sidebarUserName");

    const sidebarUserEmail =
        document.getElementById("sidebarUserEmail");

    const sidebarAvatar =
        document.getElementById("sidebarAvatar");

    const topbarAvatar =
        document.getElementById("topbarAvatar");

    const totalIncome =
        document.getElementById("totalIncome");

    const totalExpenses =
        document.getElementById("totalExpenses");

    const taxDue =
        document.getElementById("taxDue");

    const pendingCount =
        document.getElementById("pendingCount");

    const pendingBadge =
        document.getElementById("pendingBadge");

    const taxSummaryAmount =
        document.getElementById("taxSummaryAmount");

    const taxableIncome =
        document.getElementById("taxableIncome");

    const taxProgress =
        document.getElementById("taxProgress");

    const recentTransactions =
        document.getElementById(
            "recentTransactions"
        );

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    /* =====================================
       HELPERS
    ===================================== */

    function formatCurrency(amount) {

        const number =
            Number(amount) || 0;

        return new Intl.NumberFormat(
            "en-NG",
            {
                style: "currency",
                currency: "NGN",
                minimumFractionDigits: 2
            }
        ).format(number);
    }


    function getInitials(name) {

        if (!name) {
            return "U";
        }

        const words =
            name.trim().split(/\s+/);

        if (words.length === 1) {

            return words[0]
                .substring(0, 2)
                .toUpperCase();

        }

        return (
            words[0][0] +
            words[words.length - 1][0]
        ).toUpperCase();
    }


    function getFirstName(name) {

        if (!name) {
            return "there";
        }

        return name
            .trim()
            .split(/\s+/)[0];
    }


    function setText(element, value) {

        if (element) {
            element.textContent = value;
        }
    }


    /* =====================================
       CHECK SESSION
    ===================================== */

    async function getCurrentUser() {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .getUser();

        if (error) {

            console.error(
                "Unable to get user:",
                error
            );

            return null;
        }

        return data.user;
    }


    const user =
        await getCurrentUser();


    /*
     * If there is no logged-in user,
     * send them back to Login.
     */

    if (!user) {

        window.location.href =
            "login.html";

        return;
    }


    /* =====================================
       USER INFORMATION
    ===================================== */

    const metadata =
        user.user_metadata || {};


    /*
     * We saved the registered name
     * during signup as full_name.
     */

    const fullName =
        metadata.full_name ||
        metadata.name ||
        "User";


    const email =
        user.email || "";


    const initials =
        getInitials(fullName);


    setText(
        welcomeName,
        `Welcome, ${getFirstName(fullName)}`
    );


    setText(
        sidebarUserName,
        fullName
    );


    setText(
        sidebarUserEmail,
        email
    );


    setText(
        sidebarAvatar,
        initials
    );


    setText(
        topbarAvatar,
        initials
    );


    /* =====================================
       TRANSACTIONS
    ===================================== */

    let transactions = [];


    async function loadTransactions() {

        /*
         * IMPORTANT:
         *
         * This expects a table called
         * "transactions".
         *
         * The table should contain:
         *
         * id
         * user_id
         * amount
         * classification
         * description
         * created_at
         *
         */

        const {
            data,
            error
        } =
            await supabaseClient
                .from("transactions")
                .select("*")
                .eq("user_id", user.id)
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Transaction loading error:",
                error
            );

            /*
             * Don't break the dashboard if
             * the transactions table isn't
             * ready yet.
             */

            transactions = [];

            return;
        }


        transactions =
            data || [];


        calculateDashboard();
    }


    /* =====================================
       CALCULATE DASHBOARD
    ===================================== */

    function calculateDashboard() {

        let income = 0;

        let expenses = 0;

        let pending = 0;


        transactions.forEach(
            transaction => {

                const amount =
                    Number(
                        transaction.amount
                    ) || 0;


                const classification =
                    String(
                        transaction.classification ||
                        ""
                    )
                    .trim()
                    .toLowerCase();


                /*
                 * INCOME
                 */

                if (
                    classification ===
                        "income"
                ) {

                    income += amount;

                }


                /*
                 * EXPENSE
                 */

                else if (
                    classification ===
                        "expense" ||

                    classification ===
                        "expenses"
                ) {

                    expenses += amount;

                }


                /*
                 * PENDING
                 */

                else if (
                    classification ===
                        "pending" ||

                    classification ===
                        ""
                ) {

                    pending++;

                }

            }
        );


        /*
         * Taxable income
         */

        const taxable =
            Math.max(
                income - expenses,
                0
            );


        /*
         * Simple estimate.
         *
         * We will replace this with
         * the proper Nigerian tax
         * calculation when the tax
         * engine is added.
         */

        const estimatedTax =
            taxable * 0.15;


        setText(
            totalIncome,
            formatCurrency(income)
        );


        setText(
            totalExpenses,
            formatCurrency(expenses)
        );


        setText(
            taxDue,
            formatCurrency(estimatedTax)
        );


        setText(
            taxSummaryAmount,
            formatCurrency(estimatedTax)
        );


        setText(
            taxableIncome,
            formatCurrency(taxable)
        );


        setText(
            pendingCount,
            pending
        );


        setText(
            pendingBadge,
            pending
        );


        /*
         * Tax progress
         */

        let progress = 0;


        if (income > 0) {

            progress =
                Math.min(
                    (
                        taxable /
                        income
                    ) * 100,
                    100
                );

        }


        if (taxProgress) {

            taxProgress.style.width =
                `${progress}%`;

        }


        renderRecentTransactions();
    }


    /* =====================================
       RECENT TRANSACTIONS
    ===================================== */

    function renderRecentTransactions() {

        if (!recentTransactions) {
            return;
        }


        if (!transactions.length) {

            recentTransactions.innerHTML = `

                <div class="dashboard-empty">

                    <div class="empty-icon">

                        <i class="fa-solid fa-receipt"></i>

                    </div>

                    <strong>
                        No transactions yet
                    </strong>

                    <span>
                        Add your first transaction to get started.
                    </span>

                    <a
                        href="transactions.html"
                        class="btn btn-secondary"
                    >
                        Add transaction
                    </a>

                </div>

            `;

            return;
        }


        const recent =
            transactions.slice(0, 5);


        recentTransactions.innerHTML =
            recent.map(
                transaction => {

                    const amount =
                        Number(
                            transaction.amount
                        ) || 0;


                    const classification =
                        String(
                            transaction.classification ||
                            "Pending"
                        )
                        .trim();


                    const normalized =
                        classification
                            .toLowerCase();


                    let typeClass =
                        "pending";


                    if (
                        normalized ===
                        "income"
                    ) {

                        typeClass =
                            "income";

                    }

                    else if (
                        normalized ===
                        "expense" ||

                        normalized ===
                        "expenses"
                    ) {

                        typeClass =
                            "expense";

                    }


                    const description =
                        transaction.description ||
                        "Transaction";


                    const date =
                        transaction.created_at
                            ? new Date(
                                transaction.created_at
                              ).toLocaleDateString(
                                "en-NG",
                                {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                }
                              )
                            : "";


                    return `

                        <div
                            class="transaction-row"
                        >

                            <div
                                class="transaction-icon ${typeClass}"
                            >

                                <i class="fa-solid ${
                                    typeClass === "income"
                                        ? "fa-arrow-trend-up"
                                        : typeClass === "expense"
                                            ? "fa-arrow-trend-down"
                                            : "fa-clock"
                                }"></i>

                            </div>


                            <div
                                class="transaction-details"
                            >

                                <strong>
                                    ${escapeHTML(
                                        description
                                    )}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        classification
                                    )}
                                    ${date ? ` · ${date}` : ""}
                                </span>

                            </div>


                            <strong
                                class="transaction-amount ${typeClass}"
                            >

                                ${
                                    typeClass === "income"
                                        ? "+"
                                        : typeClass === "expense"
                                            ? "-"
                                            : ""
                                }

                                ${formatCurrency(
                                    amount
                                )}

                            </strong>

                        </div>

                    `;

                }
            ).join("");
    }


    /* =====================================
       ESCAPE HTML
    ===================================== */

    function escapeHTML(value) {

        return String(value)
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


    /* =====================================
       LOGOUT
    ===================================== */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            async () => {

                logoutButton.disabled =
                    true;


                const {
                    error
                } =
                    await supabaseClient
                        .auth
                        .signOut();


                if (error) {

                    console.error(
                        "Logout error:",
                        error
                    );

                    logoutButton.disabled =
                        false;

                    return;
                }


                window.location.href =
                    "login.html";

            }
        );

    }


    /* =====================================
       MOBILE SIDEBAR
    ===================================== */

    const sidebar =
        document.getElementById(
            "dashboardSidebar"
        );

    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );

    const menuButton =
        document.getElementById(
            "mobileMenuButton"
        );

    const closeButton =
        document.getElementById(
            "sidebarClose"
        );


    function openSidebar() {

        sidebar?.classList.add(
            "open"
        );

        overlay?.classList.add(
            "active"
        );

    }


    function closeSidebar() {

        sidebar?.classList.remove(
            "open"
        );

        overlay?.classList.remove(
            "active"
        );

    }


    menuButton?.addEventListener(
        "click",
        openSidebar
    );


    closeButton?.addEventListener(
        "click",
        closeSidebar
    );


    overlay?.addEventListener(
        "click",
        closeSidebar
    );


    /* =====================================
       AUTO REFRESH
    ===================================== */

    await loadTransactions();


    /*
     * Refresh transaction information
     * every 30 seconds.
     */

    setInterval(
        loadTransactions,
        30000
    );


    /*
     * Listen for Supabase auth changes.
     */

    supabaseClient.auth.onAuthStateChange(
        (event) => {

            if (
                event ===
                "SIGNED_OUT"
            ) {

                window.location.href =
                    "login.html";

            }

        }
    );

});