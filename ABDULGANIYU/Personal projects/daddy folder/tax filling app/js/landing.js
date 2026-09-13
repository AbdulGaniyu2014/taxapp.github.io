/* =========================================
   TAXFLOW — LANDING PAGE JS
   ========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const menuButton =
            document.getElementById(
                "mobileMenuBtn"
            );

        const mobileNav =
            document.getElementById(
                "mobileNav"
            );


        /* =====================================
           MOBILE MENU
        ===================================== */

        if (
            menuButton &&
            mobileNav
        ) {

            menuButton.addEventListener(
                "click",
                () => {

                    mobileNav.classList.toggle(
                        "active"
                    );


                    const icon =
                        menuButton.querySelector(
                            "i"
                        );


                    if (
                        mobileNav.classList.contains(
                            "active"
                        )
                    ) {

                        icon.className =
                            "fa-solid fa-xmark";

                        menuButton.setAttribute(
                            "aria-label",
                            "Close menu"
                        );

                    } else {

                        icon.className =
                            "fa-solid fa-bars";

                        menuButton.setAttribute(
                            "aria-label",
                            "Open menu"
                        );

                    }

                }
            );


            /* ===============================
               CLOSE MENU AFTER LINK CLICK
            =============================== */

            mobileNav
                .querySelectorAll("a")
                .forEach(
                    link => {

                        link.addEventListener(
                            "click",
                            () => {

                                mobileNav.classList.remove(
                                    "active"
                                );


                                const icon =
                                    menuButton.querySelector(
                                        "i"
                                    );


                                icon.className =
                                    "fa-solid fa-bars";


                                menuButton.setAttribute(
                                    "aria-label",
                                    "Open menu"
                                );

                            }
                        );

                    }
                );

        }


        /* =====================================
           ESCAPE MENU WITH ESC KEY
        ===================================== */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key !== "Escape"
                ) {

                    return;

                }


                if (
                    !mobileNav ||
                    !menuButton
                ) {

                    return;

                }


                mobileNav.classList.remove(
                    "active"
                );


                const icon =
                    menuButton.querySelector(
                        "i"
                    );


                if (icon) {

                    icon.className =
                        "fa-solid fa-bars";

                }


                menuButton.setAttribute(
                    "aria-label",
                    "Open menu"
                );

            }
        );

    }
);