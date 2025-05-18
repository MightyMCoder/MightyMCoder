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

/*     // Animate to section when nav is clicked
    $('header a').click(function(e) {

        // Treat as normal link if no-scroll class
        if ($(this).hasClass('no-scroll')) return;

        e.preventDefault();
        var heading = $(this).attr('href');
        var scrollDistance = $(heading).offset().top;

        $('html, body').animate({
            scrollTop: scrollDistance + 'px'
        }, Math.abs(window.pageYOffset - $(heading).offset().top) / 1);

        // Hide the menu once clicked if mobile
        if ($('header').hasClass('active')) {
            $('header, body').removeClass('active');
        }
    }); */

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

    // Create timeline
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

        // Contact form reset
/*         window.onbeforeunload = () => {
            for(const form of document.getElementsByTagName('form')) {
                form.reset();
            }
        } */

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
