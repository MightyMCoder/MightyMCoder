/*!
    Title: Dev Portfolio Template
    Version: 1.2.2
    Last Change: 03/25/2020
    Author: Ryan Fitzgerald
    Repo: https://github.com/RyanFitzgerald/devportfolio-template
    Issues: https://github.com/RyanFitzgerald/devportfolio-template/issues

    Description: This file contains all the scripts associated with the single-page
    portfolio website.
*/

(function($) {

    // Show current year
    $("#current-year").text(new Date().getFullYear());

    // Remove no-js class
    $('html').removeClass('no-js');

    document.querySelectorAll('header a:not(.no-scroll)').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            // Hide the menu once clicked if mobile
            const header = document.querySelector('header');
            if (header.classList.contains('active')) {
                header.classList.remove('active');
                document.body.classList.remove('active');
            }

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            const yHeaderOffset = document.getElementById('menu').offsetHeight;  

            if (targetElement) {
                const scrollDistance = targetElement.getBoundingClientRect().top + window.pageYOffset - yHeaderOffset;

                window.scrollTo({
                    top: scrollDistance,
                    behavior: 'smooth'
                });
            }
        });
    });

    // typing animation lead
    let texts = [];
    let textIndex = 0;
    let charIndex = 0;

    $(document).ready(function () {
        // Texte aus HTML lesen
        $('#lead-texts-to-type span').each(function () {
        texts.push($(this).text());
        });

        // Animation starten
        typeNextText();
    });

    function typeNextText() {
        const $typingText = $('#lead-text-span');
        const currentText = texts[textIndex];

        if (charIndex < currentText.length) {
            $typingText.text($typingText.text() + currentText.charAt(charIndex));
            charIndex++;
            setTimeout(typeNextText, 50);
        } else {
            setTimeout(eraseText, 2000);
        }
    }

    function eraseText() {
        const $typingText = $('#lead-text-span');
        if (charIndex > 0) {
            $typingText.text($typingText.text().slice(0, -1));
            charIndex--;
            setTimeout(eraseText, 30);
        } else {
            textIndex = (textIndex + 1) % texts.length;
            setTimeout(typeNextText, 500);
        }
    }

    // Create timeline helper function
    function createTimeline(timelineId, iconClass) {
        $this = $(timelineId); // Store reference to this
        $userContent = $this.children('div'); // user content

        // Create each timeline block
        $userContent.each(function() {
            $(this).addClass('vtimeline-content').wrap('<div class="vtimeline-point"><div class="vtimeline-block"></div></div>');
        });

        // Add icons to each block
        $this.find('.vtimeline-point').each(function() {
            $(this).prepend('<div class="vtimeline-icon"><i class="' + iconClass + '"></i></div>');
        });

        // Add dates to the timeline if exists
        $this.find('.vtimeline-content').each(function() {
            var date = $(this).data('date');
            if (date) { // Prepend if exists
                $(this).parent().prepend('<span class="vtimeline-date">'+date+'</span>');
            }
        });
    }

    // Create timeline for experience
    $('#experience-timeline').each(function() {
        createTimeline('#experience-timeline', 'fa fa-briefcase');
    });

    // Create timeline for education
    $('#education-timeline').each(function() {
        createTimeline('#education-timeline', 'fa fa-graduation-cap');
    });

    // Open mobile menu
    $('#mobile-menu-open').click(function() {
        $('header, body').addClass('active');
    });

    // Close mobile menu
    $('#mobile-menu-close').click(function() {
        $('header, body').removeClass('active');
    });

    // Load additional projects
    $('#view-more-projects').click(function(e){
        e.preventDefault();
        $(this).fadeOut(300, function() {
            $('#more-projects').fadeIn(300);
        });
    });

    document.addEventListener("DOMContentLoaded", function () {
        // Back to top button
        const backToTopBtn = document.getElementById("back-to-top");

        if (backToTopBtn) {
            window.addEventListener("scroll", () => {
                if (window.scrollY > 300) {
                    backToTopBtn.classList.add("visible");
                } else {
                    backToTopBtn.classList.remove("visible");
                }
            });

            backToTopBtn.addEventListener("click", function (e) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }

        // Sync project image heights with info section
        function syncProjectHeights() {
            document.querySelectorAll('.project').forEach(project => {
            const image = project.querySelector('.project-image');
            const info = project.querySelector('.project-info');

            if (image && info) {
                // Reset any previous inline height
                image.style.height = 'auto';
                // Match image height to info
                image.style.height = info.offsetHeight + 'px';
            }
            });
        }

        window.addEventListener('load', syncProjectHeights);
        window.addEventListener('resize', syncProjectHeights);

        // Reset forms on page load and back/forward navigation
        function resetForms() {
            for (const form of document.getElementsByTagName('form')) {
                form.reset();
            }
        }

        // Handle browser back/forward navigation (especially iOS Safari)
        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                resetForms();
            }
        });

        // Reset forms on initial load
        resetForms();
    });
})(jQuery);
