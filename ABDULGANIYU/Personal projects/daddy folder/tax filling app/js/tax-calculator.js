/* =========================================
   TAX CALCULATOR
========================================= */

document.addEventListener("DOMContentLoaded", async () => {

    await requireLogin();

    setupTaxYears();

    setupCalculator();

    await loadClassifiedTransactions();

});


/* =========================================
   TAX YEARS
========================================= */

function setupTaxYears() {

    const taxYear = document.getElementById("taxYear");

    if (!taxYear) return;

    const currentYear = new Date().getFullYear();

    for (
        let year = currentYear;
        year >= currentYear - 5;
        year--
    ) {

        const option = document.createElement("option");

        option.value = year;
        option.textContent = year;

        taxYear.appendChild(option);

    }

}


/* =========================================
   SETUP CALCULATOR
========================================= */

function setupCalculator() {

    const form =
        document.getElementById("taxCalculatorForm");

    const clearButton =
        document.getElementById("clearCalculator");

    const saveButton =
        document.getElementById("saveCalculationBtn");


    if (!form) return;


    form.addEventListener(
        "submit",
        calculateTax
    );


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearCalculator
        );

    }


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveCalculation
        );

    }

}


/* =========================================
   CALCULATE TAX
========================================= */

function calculateTax(event) {

    event.preventDefault();


    const monthlyIncome =
        getNumber("monthlyIncome");


    const otherIncome =
        getNumber("otherIncome");


    const deductions =
        getNumber("deductions");


    const periodElement =
        document.getElementById(
            "calculationPeriod"
        );


    const period =
        periodElement
            ? periodElement.value
            : "monthly";


    /*
     * Combine the income streams.
     */

    const totalMonthlyIncome =
        monthlyIncome + otherIncome;


    /*
     * Convert everything to annual
     * figures for the tax calculation.
     */

    let annualIncome;


    if (period === "annual") {

        annualIncome =
            totalMonthlyIncome;

    } else {

        annualIncome =
            totalMonthlyIncome * 12;

    }


    /*
     * Convert deductions to annual.
     */

    let annualDeductions;


    if (period === "annual") {

        annualDeductions =
            deductions;

    } else {

        annualDeductions =
            deductions * 12;

    }


    /*
     * Taxable income cannot be negative.
     */

    const taxableIncome =
        Math.max(
            annualIncome - annualDeductions,
            0
        );


    /*
     * Apply Nigerian graduated tax bands.
     */

    const taxAmount =
        calculateConfiguredTax(
            taxableIncome
        );


    /*
     * Convert annual tax to monthly tax.
     */

    const monthlyTax =
        taxAmount / 12;


    /*
     * Effective tax rate.
     */

    let effectiveRate = 0;


    if (taxableIncome > 0) {

        effectiveRate =
            (
                taxAmount /
                taxableIncome
            ) * 100;

    }


    /*
     * Display result.
     */

    displayResult({

        totalIncome:
            annualIncome,

        deductions:
            annualDeductions,

        taxableIncome:
            taxableIncome,

        taxAmount:
            taxAmount,

        monthlyTax:
            monthlyTax,

        effectiveRate:
            effectiveRate

    });


    /*
     * Store calculation so it can
     * later be saved to Supabase.
     */

    window.lastTaxCalculation = {

        taxYear:
            document.getElementById(
                "taxYear"
            )?.value || "",

        calculationPeriod:
            period,

        totalIncome:
            annualIncome,

        deductions:
            annualDeductions,

        taxableIncome:
            taxableIncome,

        taxAmount:
            taxAmount,

        monthlyTax:
            monthlyTax,

        effectiveRate:
            effectiveRate,

        createdAt:
            new Date().toISOString()

    };

}


/* =========================================
   NIGERIAN TAX ENGINE
========================================= */

function calculateConfiguredTax(
    taxableIncome
) {

    let remaining =
        Math.max(
            Number(taxableIncome) || 0,
            0
        );


    let tax = 0;


    /*
     * First ₦800,000
     * Tax rate: 0%
     */

    if (remaining > 0) {

        const band =
            Math.min(
                remaining,
                800000
            );

        tax +=
            band * 0;

        remaining -= band;

    }


    /*
     * Next ₦2,200,000
     * Tax rate: 15%
     */

    if (remaining > 0) {

        const band =
            Math.min(
                remaining,
                2200000
            );

        tax +=
            band * 0.15;

        remaining -= band;

    }


    /*
     * Next ₦9,000,000
     * Tax rate: 18%
     */

    if (remaining > 0) {

        const band =
            Math.min(
                remaining,
                9000000
            );

        tax +=
            band * 0.18;

        remaining -= band;

    }


    /*
     * Next ₦13,000,000
     * Tax rate: 21%
     */

    if (remaining > 0) {

        const band =
            Math.min(
                remaining,
                13000000
            );

        tax +=
            band * 0.21;

        remaining -= band;

    }


    /*
     * Next ₦25,000,000
     * Tax rate: 23%
     */

    if (remaining > 0) {

        const band =
            Math.min(
                remaining,
                25000000
            );

        tax +=
            band * 0.23;

        remaining -= band;

    }


    /*
     * Above ₦50,000,000
     * Tax rate: 25%
     */

    if (remaining > 0) {

        tax +=
            remaining * 0.25;

    }


    return tax;

}


/* =========================================
   DISPLAY RESULT
========================================= */

function displayResult(result) {

    const resultEmpty =
        document.getElementById(
            "resultEmpty"
        );

    const resultContent =
        document.getElementById(
            "resultContent"
        );


    if (resultEmpty) {

        resultEmpty.hidden = true;

    }


    if (resultContent) {

        resultContent.hidden = false;

    }


    setText(
        "resultTotalIncome",
        formatCurrency(
            result.totalIncome
        )
    );


    setText(
        "resultDeductions",
        formatCurrency(
            result.deductions
        )
    );


    setText(
        "resultTaxableIncome",
        formatCurrency(
            result.taxableIncome
        )
    );


    setText(
        "resultTax",
        formatCurrency(
            result.taxAmount
        )
    );


    setText(
        "resultMonthlyTax",
        formatCurrency(
            result.monthlyTax
        )
    );


    setText(
        "resultTaxRate",
        result.effectiveRate.toFixed(2) + "%"
    );

}


/* =========================================
   LOAD TRANSACTIONS
========================================= */

async function loadClassifiedTransactions() {

    const table =
        document.getElementById(
            "classifiedTransactions"
        );


    if (!table) return;


    const {
        data: { user },
        error: userError
    } = await db.auth.getUser();


    if (userError || !user) {

        window.location.href =
            "login.html";

        return;

    }


    const {
        data: transactions,
        error
    } = await db
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


        table.innerHTML = `
            <tr>
                <td
                    colspan="4"
                    style="text-align:center;padding:35px;"
                >
                    Unable to load transactions.
                </td>
            </tr>
        `;

        return;

    }


    renderClassifiedTransactions(
        transactions || []
    );

}


/* =========================================
   RENDER TRANSACTIONS
========================================= */

function renderClassifiedTransactions(
    transactions
) {

    const table =
        document.getElementById(
            "classifiedTransactions"
        );


    if (!table) return;


    table.innerHTML = "";


    if (transactions.length === 0) {

        table.innerHTML = `
            <tr>
                <td
                    colspan="4"
                    style="text-align:center;padding:35px;"
                >
                    No transactions available.
                </td>
            </tr>
        `;

        updateClassifiedSummary([]);

        return;

    }


    transactions.forEach(transaction => {

        const amount =
            Number(
                transaction.amount
            ) || 0;


        const date =
            transaction.created_at
                ? new Date(
                    transaction.created_at
                ).toLocaleDateString()
                : "--";


        table.innerHTML += `
            <tr>

                <td>
                    ${escapeHTML(
                        transaction.transaction_name ||
                        "Unnamed transaction"
                    )}
                </td>

                <td>
                    ${formatCurrency(amount)}
                </td>

                <td>
                    ${escapeHTML(
                        transaction.status ||
                        "Pending"
                    )}
                </td>

                <td>
                    ${date}
                </td>

            </tr>
        `;

    });


    updateClassifiedSummary(
        transactions
    );

}


/* =========================================
   CLASSIFIED SUMMARY
========================================= */

function updateClassifiedSummary(
    transactions
) {

    let income = 0;


    transactions.forEach(transaction => {

        /*
         * Only completed transactions are
         * included in this temporary summary.
         */

        if (
            transaction.status ===
            "Completed"
        ) {

            income +=
                Number(
                    transaction.amount
                ) || 0;

        }

    });


    setText(
        "classifiedIncome",
        formatCurrency(income)
    );


    setText(
        "classifiedTransactionCount",
        transactions.length
    );

}


/* =========================================
   SAVE CALCULATION
========================================= */

async function saveCalculation() {

    const calculation =
        window.lastTaxCalculation;


    if (!calculation) {

        alert(
            "Please calculate your tax first."
        );

        return;

    }


    const {
        data: { user },
        error: userError
    } = await db.auth.getUser();


    if (userError || !user) {

        alert(
            "Your session has expired. Please log in again."
        );

        window.location.href =
            "login.html";

        return;

    }


    const saveButton =
        document.getElementById(
            "saveCalculationBtn"
        );


    if (saveButton) {

        saveButton.disabled = true;

        saveButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Saving...
        `;

    }


    try {

        const { error } =
            await db
                .from("tax_calculations")
                .insert({

                    user_id:
                        user.id,

                    annual_income:
                        calculation.totalIncome,

                    deductions:
                        calculation.deductions,

                    taxable_income:
                        calculation.taxableIncome,

                    tax_amount:
                        calculation.taxAmount

                });


        if (error) {

            throw error;

        }


        alert(
            "Tax calculation saved successfully."
        );


    } catch (error) {

        console.error(
            "Save calculation error:",
            error
        );


        alert(
            error.message ||
            "Unable to save calculation."
        );


    } finally {

        if (saveButton) {

            saveButton.disabled = false;

            saveButton.innerHTML = `
                <i class="fa-solid fa-floppy-disk"></i>
                Save Calculation
            `;

        }

    }

}


/* =========================================
   CLEAR CALCULATOR
========================================= */

function clearCalculator() {

    const form =
        document.getElementById(
            "taxCalculatorForm"
        );


    if (form) {

        form.reset();

    }


    const resultEmpty =
        document.getElementById(
            "resultEmpty"
        );


    const resultContent =
        document.getElementById(
            "resultContent"
        );


    if (resultEmpty) {

        resultEmpty.hidden = false;

    }


    if (resultContent) {

        resultContent.hidden = true;

    }


    window.lastTaxCalculation =
        null;


    setText(
        "resultTotalIncome",
        "₦0.00"
    );

    setText(
        "resultDeductions",
        "₦0.00"
    );

    setText(
        "resultTaxableIncome",
        "₦0.00"
    );

    setText(
        "resultTax",
        "₦0.00"
    );

    setText(
        "resultMonthlyTax",
        "₦0.00"
    );

    setText(
        "resultTaxRate",
        "0%"
    );

}


/* =========================================
   GET NUMBER
========================================= */

function getNumber(id) {

    const element =
        document.getElementById(id);


    if (!element) {

        return 0;

    }


    const value =
        Number(element.value);


    if (
        !Number.isFinite(value) ||
        value < 0
    ) {

        return 0;

    }


    return value;

}


/* =========================================
   FORMAT CURRENCY
========================================= */

function formatCurrency(amount) {

    return "₦" +
        Number(amount || 0)
            .toLocaleString(
                "en-NG",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );

}


/* =========================================
   SET TEXT
========================================= */

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent = value;

    }

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}