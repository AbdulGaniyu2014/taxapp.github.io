/* =========================================
   TAXFLOW AUTH.JS
   SIGNUP + LOGIN
   ========================================= */

const SUPABASE_URL =
    "https://jcwqobrhfsiiojaqntmd.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_84OBE6Hmjh4kMB9f1Qoe4g_TVo7q4NL";


/* =========================================
   SUPABASE CLIENT
   ========================================= */

if (!window.supabase) {

    console.error(
        "Supabase library was not loaded."
    );

} else {

    window.db =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

}


/* =========================================
   PAGE START
   ========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "TaxFlow auth.js loaded."
        );

        setupSignup();

        setupLogin();

        setupPasswordToggles();

        setupForgotPassword();

    }
);


/* =========================================
   SIGNUP
   ========================================= */

function setupSignup() {

    const form =
        document.getElementById(
            "signupForm"
        );

    if (!form) return;


    const errorBox =
        document.getElementById(
            "signupError"
        );

    const successBox =
        document.getElementById(
            "signupSuccess"
        );

    const button =
        document.getElementById(
            "signupButton"
        );

    const buttonText =
        document.getElementById(
            "signupButtonText"
        );

    const spinner =
        document.getElementById(
            "signupSpinner"
        );


    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            clearMessage(
                errorBox
            );

            clearMessage(
                successBox
            );


            /* =========================
               GET FORM VALUES
            ========================= */

            const fullName =
                document
                    .getElementById(
                        "fullName"
                    )
                    ?.value
                    .trim();


            const email =
                document
                    .getElementById(
                        "signupEmail"
                    )
                    ?.value
                    .trim()
                    .toLowerCase();


            const password =
                document
                    .getElementById(
                        "signupPassword"
                    )
                    ?.value;


            const confirmPassword =
                document
                    .getElementById(
                        "confirmPassword"
                    )
                    ?.value;


            const agreeTerms =
                document
                    .getElementById(
                        "agreeTerms"
                    );


            /* =========================
               VALIDATION
            ========================= */

            if (!fullName) {

                showError(
                    errorBox,
                    "Please enter your full name."
                );

                return;

            }


            if (!email) {

                showError(
                    errorBox,
                    "Please enter your email address."
                );

                return;

            }


            if (!password) {

                showError(
                    errorBox,
                    "Please create a password."
                );

                return;

            }


            if (password.length < 8) {

                showError(
                    errorBox,
                    "Your password must be at least 8 characters."
                );

                return;

            }


            if (
                confirmPassword &&
                password !== confirmPassword
            ) {

                showError(
                    errorBox,
                    "Your passwords do not match."
                );

                return;

            }


            if (
                agreeTerms &&
                !agreeTerms.checked
            ) {

                showError(
                    errorBox,
                    "Please agree to the Terms and Privacy Policy."
                );

                return;

            }


            /* =========================
               CHECK SUPABASE
            ========================= */

            if (!window.db) {

                showError(
                    errorBox,
                    "Supabase could not be loaded. Please refresh the page and try again."
                );

                console.error(
                    "Supabase client is missing."
                );

                return;

            }


            /* =========================
               LOADING
            ========================= */

            setButtonLoading(
                button,
                buttonText,
                spinner,
                true,
                "Creating account..."
            );


            console.log(
                "Starting Supabase signup..."
            );


            try {

                /* =====================
                   CREATE ACCOUNT
                ===================== */

                const {
                    data,
                    error
                } =
                    await window.db.auth.signUp({

                        email: email,

                        password: password,

                        options: {

                            data: {

                                full_name:
                                    fullName,

                                onboarding_completed:
                                    false

                            }

                        }

                    });


                /* =====================
                   HANDLE ERROR
                ===================== */

                if (error) {

                    console.error(
                        "SUPABASE SIGNUP ERROR:",
                        error
                    );

                    console.error(
                        "Error message:",
                        error.message
                    );

                    console.error(
                        "Error code:",
                        error.code
                    );

                    console.error(
                        "Error status:",
                        error.status
                    );


                    throw error;

                }


                console.log(
                    "Supabase signup response:",
                    data
                );


                if (!data?.user) {

                    throw new Error(
                        "Supabase did not return a user."
                    );

                }


                /* =====================
                   SAVE NAME LOCALLY
                ===================== */

                localStorage.setItem(
                    "taxflow_full_name",
                    fullName
                );


                /* =====================
                   USER HAS SESSION
                ===================== */

                if (data.session) {

                    console.log(
                        "Account created and user is signed in."
                    );


                    /*
                     * NEW USER
                     * GO TO ONBOARDING
                     */

                    window.location.href =
                        "onboarding.html";

                    return;

                }


                /* =====================
                   EMAIL CONFIRMATION
                ===================== */

                console.log(
                    "Email confirmation is required."
                );


                showSuccess(
                    successBox,
                    "Account created successfully! Please check your email to confirm your account."
                );


                setButtonLoading(
                    button,
                    buttonText,
                    spinner,
                    false,
                    "Create account"
                );


            } catch (error) {

                console.error(
                    "================================"
                );

                console.error(
                    "SIGNUP FAILED"
                );

                console.error(
                    error
                );

                console.error(
                    "================================"
                );


                /*
                 * Show the REAL error
                 * while debugging.
                 */

                const message =
                    getUsefulErrorMessage(
                        error
                    );


                showError(
                    errorBox,
                    message
                );


                setButtonLoading(
                    button,
                    buttonText,
                    spinner,
                    false,
                    "Create account"
                );

            }

        }
    );

}


/* =========================================
   LOGIN
   ========================================= */

function setupLogin() {

    const form =
        document.getElementById(
            "loginForm"
        );

    if (!form) return;


    const errorBox =
        document.getElementById(
            "loginError"
        );

    const successBox =
        document.getElementById(
            "loginSuccess"
        );

    const button =
        document.getElementById(
            "loginButton"
        );

    const buttonText =
        document.getElementById(
            "loginButtonText"
        );

    const spinner =
        document.getElementById(
            "loginSpinner"
        );


    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            clearMessage(
                errorBox
            );

            clearMessage(
                successBox
            );


            const email =
                document
                    .getElementById(
                        "email"
                    )
                    ?.value
                    .trim()
                    .toLowerCase();


            const password =
                document
                    .getElementById(
                        "password"
                    )
                    ?.value;


            if (!email) {

                showError(
                    errorBox,
                    "Please enter your email address."
                );

                return;

            }


            if (!password) {

                showError(
                    errorBox,
                    "Please enter your password."
                );

                return;

            }


            if (!window.db) {

                showError(
                    errorBox,
                    "Supabase could not be loaded. Please refresh the page."
                );

                return;

            }


            setButtonLoading(
                button,
                buttonText,
                spinner,
                true,
                "Logging in..."
            );


            try {

                const {
                    data,
                    error
                } =
                    await window.db.auth.signInWithPassword({

                        email:
                            email,

                        password:
                            password

                    });


                if (error) {

                    console.error(
                        "SUPABASE LOGIN ERROR:",
                        error
                    );

                    throw error;

                }


                if (!data?.user) {

                    throw new Error(
                        "No user was returned from Supabase."
                    );

                }


                console.log(
                    "Login successful:",
                    data.user
                );


                const metadata =
                    data.user.user_metadata || {};


                const onboardingCompleted =
                    metadata.onboarding_completed === true;


                /*
                 * Check local onboarding
                 * as a fallback.
                 */

                const localCompleted =
                    localStorage.getItem(
                        "taxflow_onboarding_completed"
                    ) === "true";


                if (
                    !onboardingCompleted &&
                    !localCompleted
                ) {

                    window.location.href =
                        "onboarding.html";

                    return;

                }


                /*
                 * Existing user
                 */

                window.location.href =
                    "dashboard.html";


            } catch (error) {

                console.error(
                    "LOGIN FAILED:",
                    error
                );


                showError(
                    errorBox,
                    getUsefulErrorMessage(
                        error
                    )
                );


                setButtonLoading(
                    button,
                    buttonText,
                    spinner,
                    false,
                    "Log in"
                );

            }

        }
    );

}


/* =========================================
   PASSWORD TOGGLE
   ========================================= */

function setupPasswordToggles() {

    const toggles =
        document.querySelectorAll(
            ".password-toggle"
        );


    toggles.forEach(
        toggle => {

            toggle.addEventListener(
                "click",
                () => {

                    const wrapper =
                        toggle.closest(
                            ".input-wrapper"
                        );


                    const input =
                        wrapper?.querySelector(
                            "input"
                        );


                    if (!input) return;


                    const icon =
                        toggle.querySelector(
                            "i"
                        );


                    if (
                        input.type ===
                        "password"
                    ) {

                        input.type =
                            "text";


                        icon?.classList.remove(
                            "fa-eye"
                        );


                        icon?.classList.add(
                            "fa-eye-slash"
                        );

                    } else {

                        input.type =
                            "password";


                        icon?.classList.remove(
                            "fa-eye-slash"
                        );


                        icon?.classList.add(
                            "fa-eye"
                        );

                    }

                }
            );

        }
    );

}


/* =========================================
   FORGOT PASSWORD
   ========================================= */

function setupForgotPassword() {

    const link =
        document.getElementById(
            "forgotPassword"
        );


    if (!link) return;


    link.addEventListener(
        "click",
        async (event) => {

            event.preventDefault();


            const emailInput =
                document.getElementById(
                    "email"
                );


            const email =
                emailInput
                    ?.value
                    .trim()
                    .toLowerCase();


            const errorBox =
                document.getElementById(
                    "loginError"
                );


            if (!email) {

                showError(
                    errorBox,
                    "Enter your email address first."
                );

                emailInput?.focus();

                return;

            }


            try {

                const {
                    error
                } =
                    await window.db.auth.resetPasswordForEmail(
                        email,
                        {
                            redirectTo:
                                `${window.location.origin}/html/reset-password.html`
                        }
                    );


                if (error) {

                    throw error;

                }


                showSuccess(
                    errorBox,
                    "Password reset instructions have been sent to your email."
                );


            } catch (error) {

                console.error(
                    "PASSWORD RESET ERROR:",
                    error
                );


                showError(
                    errorBox,
                    getUsefulErrorMessage(
                        error
                    )
                );

            }

        }
    );

}


/* =========================================
   BUTTON LOADING
   ========================================= */

function setButtonLoading(
    button,
    textElement,
    spinner,
    loading,
    text
) {

    if (button) {

        button.disabled =
            loading;

    }


    if (textElement) {

        textElement.textContent =
            text;

    }


    if (spinner) {

        spinner.style.display =
            loading
                ? "inline-block"
                : "none";

    }

}


/* =========================================
   ERROR
   ========================================= */

function showError(
    element,
    message
) {

    if (!element) {

        alert(message);

        return;

    }


    element.textContent =
        message;


    element.classList.add(
        "show"
    );

}


/* =========================================
   SUCCESS
   ========================================= */

function showSuccess(
    element,
    message
) {

    if (!element) {

        alert(message);

        return;

    }


    element.textContent =
        message;


    element.classList.add(
        "show"
    );

}


/* =========================================
   CLEAR MESSAGE
   ========================================= */

function clearMessage(
    element
) {

    if (!element) return;


    element.textContent =
        "";


    element.classList.remove(
        "show"
    );

}


/* =========================================
   USEFUL SUPABASE ERROR
   ========================================= */

function getUsefulErrorMessage(
    error
) {

    if (!error) {

        return "Something went wrong. Please try again.";

    }


    const message =
        error.message ||
        String(error);


    const lower =
        message.toLowerCase();


    /* =========================
       DATABASE TRIGGER ERROR
    ========================= */

    if (
        lower.includes(
            "database error saving new user"
        )
    ) {

        return (
            "Supabase created the authentication request, " +
            "but your database trigger failed while creating the user profile. " +
            "This must be fixed in the Supabase database/trigger setup."
        );

    }


    /* =========================
       FAILED TO FETCH
    ========================= */

    if (
        lower.includes(
            "failed to fetch"
        )
    ) {

        return (
            "TaxFlow could not connect to Supabase. " +
            "Check that you are running the website through a local server " +
            "and that your Supabase project is reachable."
        );

    }


    /* =========================
       EXISTING ACCOUNT
    ========================= */

    if (
        lower.includes(
            "user already registered"
        )
    ) {

        return (
            "An account with this email already exists. " +
            "Please log in instead."
        );

    }


    /* =========================
       INVALID LOGIN
    ========================= */

    if (
        lower.includes(
            "invalid login credentials"
        )
    ) {

        return (
            "Incorrect email or password."
        );

    }


    /* =========================
       EMAIL NOT CONFIRMED
    ========================= */

    if (
        lower.includes(
            "email not confirmed"
        )
    ) {

        return (
            "Please confirm your email before logging in."
        );

    }


    /* =========================
       RATE LIMIT
    ========================= */

    if (
        lower.includes(
            "rate limit"
        )
    ) {

        return (
            "Too many requests. Please wait a little while and try again later."
        );

    }


    /* =========================
       INVALID EMAIL
    ========================= */

    if (
        lower.includes(
            "invalid email"
        )
    ) {

        return (
            "Please enter a valid email address."
        );

    }


    /*
     * Return the actual
     * Supabase message.
     */

    return message;

}