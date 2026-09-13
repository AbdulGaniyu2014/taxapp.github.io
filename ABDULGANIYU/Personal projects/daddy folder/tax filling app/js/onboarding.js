/* =========================================
   TAXFLOW — ONBOARDING JS
   ========================================= */

document.addEventListener("DOMContentLoaded", async () => {

    const SUPABASE_URL =
        "https://jcwqobrhfsiiojaqntmd.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_84OBE6Hmjh4kMB9f1Qoe4g_TVo7q4NL";

    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );


    /* =====================================
       ELEMENTS
    ===================================== */

    const steps =
        document.querySelectorAll(".question-step");

    const nextButton =
        document.getElementById("nextButton");

    const backButton =
        document.getElementById("backButton");

    const currentStep =
        document.getElementById("currentStep");

    const progressBar =
        document.getElementById("progressBar");

    const form =
        document.getElementById("onboardingForm");


    let currentStepNumber = 1;

    const totalSteps = steps.length;


    /* =====================================
       CHECK LOGIN
    ===================================== */

    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (userError || !user) {

        window.location.href =
            "login.html";

        return;
    }


    /* =====================================
       SHOW STEP
    ===================================== */

    function showStep(stepNumber) {

        steps.forEach(step => {

            const stepValue =
                Number(
                    step.dataset.step
                );

            step.classList.toggle(
                "active",
                stepValue === stepNumber
            );

        });


        if (currentStep) {

            currentStep.textContent =
                stepNumber;

        }


        if (progressBar) {

            const percentage =
                (stepNumber / totalSteps) * 100;

            progressBar.style.width =
                `${percentage}%`;

        }


        /*
         * Back button
         */

        if (backButton) {

            backButton.style.visibility =
                stepNumber === 1
                    ? "hidden"
                    : "visible";

        }


        /*
         * Last step button
         */

        if (nextButton) {

            if (stepNumber === totalSteps) {

                nextButton.innerHTML = `
                    Finish setup
                    <i class="fa-solid fa-check"></i>
                `;

            } else {

                nextButton.innerHTML = `
                    Continue
                    <i class="fa-solid fa-arrow-right"></i>
                `;

            }

        }

    }


    /* =====================================
       VALIDATE STEP
    ===================================== */

    function validateCurrentStep() {

        const activeStep =
            document.querySelector(
                `.question-step[data-step="${currentStepNumber}"]`
            );


        if (!activeStep) {
            return true;
        }


        /*
         * Radio buttons
         */

        const radioInputs =
            activeStep.querySelectorAll(
                'input[type="radio"]'
            );


        if (radioInputs.length > 0) {

            const checked =
                activeStep.querySelector(
                    'input[type="radio"]:checked'
                );


            if (!checked) {

                showMessage(
                    "Please select an option to continue."
                );

                return false;
            }

        }


        /*
         * Checkboxes
         *
         * We allow zero checkboxes because
         * some questions are optional.
         */

        return true;
    }


    /* =====================================
       MESSAGE
    ===================================== */

    function showMessage(message) {

        let messageBox =
            document.getElementById(
                "onboardingMessage"
            );


        if (!messageBox) {

            messageBox =
                document.createElement("div");

            messageBox.id =
                "onboardingMessage";

            messageBox.style.marginTop =
                "15px";

            messageBox.style.padding =
                "12px 15px";

            messageBox.style.borderRadius =
                "10px";

            messageBox.style.background =
                "#fff4f4";

            messageBox.style.color =
                "#b42318";

            messageBox.style.fontSize =
                "14px";

            form.appendChild(
                messageBox
            );

        }


        messageBox.textContent =
            message;


        setTimeout(() => {

            messageBox.remove();

        }, 3500);

    }


    /* =====================================
       COLLECT ANSWERS
    ===================================== */

    function collectAnswers() {

        const answers = {};


        /*
         * Radio values
         */

        const radioInputs =
            form.querySelectorAll(
                'input[type="radio"]:checked'
            );


        radioInputs.forEach(input => {

            answers[input.name] =
                input.value;

        });


        /*
         * Checkbox values
         */

        const checkboxGroups = {};


        const checkboxes =
            form.querySelectorAll(
                'input[type="checkbox"]:checked'
            );


        checkboxes.forEach(input => {

            if (
                !checkboxGroups[input.name]
            ) {

                checkboxGroups[input.name] =
                    [];

            }


            checkboxGroups[input.name]
                .push(input.value);

        });


        Object.keys(
            checkboxGroups
        ).forEach(name => {

            answers[name] =
                checkboxGroups[name];

        });


        return answers;
    }


    /* =====================================
       SAVE ONBOARDING
    ===================================== */

    async function saveOnboarding() {

        const answers =
            collectAnswers();


        /*
         * Save locally first.
         *
         * This allows the onboarding
         * flow to work immediately while
         * we connect it to your exact
         * Supabase profile table.
         */

        const onboardingData = {

            user_id:
                user.id,

            email:
                user.email || "",

            ...answers,

            onboarding_completed:
                true,

            completed_at:
                new Date().toISOString()

        };


        localStorage.setItem(
            "taxflow_onboarding",
            JSON.stringify(
                onboardingData
            )
        );


        /*
         * Also store the completion
         * flag locally.
         */

        localStorage.setItem(
            "taxflow_onboarding_completed",
            "true"
        );


        return true;
    }


    /* =====================================
       CONTINUE
    ===================================== */

    nextButton?.addEventListener(
        "click",
        async () => {

            /*
             * Validate current question
             */

            if (
                !validateCurrentStep()
            ) {

                return;

            }


            /*
             * Next question
             */

            if (
                currentStepNumber <
                totalSteps
            ) {

                currentStepNumber++;

                showStep(
                    currentStepNumber
                );

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

                return;
            }


            /*
             * Last question
             */

            nextButton.disabled =
                true;


            nextButton.innerHTML = `
                Saving...
                <i class="fa-solid fa-spinner fa-spin"></i>
            `;


            try {

                await saveOnboarding();


                /*
                 * Finished!
                 */

                window.location.href =
                    "dashboard.html";

            }

            catch (error) {

                console.error(
                    "Onboarding error:",
                    error
                );


                showMessage(
                    "Something went wrong. Please try again."
                );


                nextButton.disabled =
                    false;


                nextButton.innerHTML = `
                    Finish setup
                    <i class="fa-solid fa-check"></i>
                `;

            }

        }
    );


    /* =====================================
       BACK
    ===================================== */

    backButton?.addEventListener(
        "click",
        () => {

            if (
                currentStepNumber <= 1
            ) {

                return;

            }


            currentStepNumber--;


            showStep(
                currentStepNumber
            );


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );


    /* =====================================
       OPTION CARD CLICK EFFECT
    ===================================== */

    const optionCards =
        document.querySelectorAll(
            ".option-card"
        );


    optionCards.forEach(card => {

        card.addEventListener(
            "click",
            () => {

                /*
                 * Small visual feedback.
                 */

                card.classList.add(
                    "selected"
                );

                setTimeout(() => {

                    card.classList.remove(
                        "selected"
                    );

                }, 200);

            }
        );

    });


    /* =====================================
       START
    ===================================== */

    showStep(1);

});