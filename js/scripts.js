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

    // Create timeline helper function
    function createTimeline(timelineId, iconClass) {
        const $container = $(timelineId);

        // Step 1: Extract all timeline items before they were wrapped
        const $rawItems = [];
        $container.children('.vtimeline-point').each(function () {
            const $content = $(this).find('.vtimeline-content').first();
            if ($content.length) {
                $content.removeClass('vtimeline-content');
                $content.children('.vtimeline-date').remove(); // just in case
                $rawItems.push($content.detach()); // store original div
            }
        });

        if ($rawItems.length === 0) {
            // fallback: if not already wrapped (e.g., first time)
            $container.children('div').each(function () {
                $rawItems.push($(this).detach());
            });
        }

        // Step 2: Clear container
        $container.empty();

        // Step 3: Re-insert raw divs and rebuild
        $rawItems.forEach(function ($item) {
            $item.addClass('vtimeline-content');

            const date = $item.attr('data-date') || '';
            const $block = $('<div class="vtimeline-block"></div>').append($item);
            const $point = $('<div class="vtimeline-point"></div>')
                .append('<div class="vtimeline-icon"><i class="' + iconClass + '"></i></div>')
                .append($block);

            if (date) {
                $point.prepend('<span class="vtimeline-date">' + date + '</span>');
            }

            $container.append($point);
        });
    }

    let texts = [];
    let textIndex = 0;
    let charIndex = 0;
    let typingTimeout = null;
    let erasingTimeout = null;

    function loadLanguage(lang) {
        // change language tag
        $('html').attr('lang', lang);

        // Change language in form
        $('#form-language').val(lang);

        // Update language button
        updateLanguageButton(lang);

        $.ajax({
            url: 'languages/' + lang + '.xml',
            dataType: 'xml',
            success: function (xml) {
                const translations = {};

                // Parse XML: <string name="KEY">Value</string>
                $(xml).find('string').each(function () {
                    const key = $(this).attr('name');
                    const value = $(this).text();
                    translations[key] = value;
                });

                // Apply translations to all elements with data-i18n
                $('[data-i18n]').each(function () {
                    const key = $(this).attr('data-i18n');
                    if (translations[key]) {
                        $(this).html(translations[key]);
                    }
                });

                // Translate timeline dates
                $('[data-i18n-date]').each(function () {
                    const key = $(this).attr('data-i18n-date');
                    if (translations[key]) {
                        $(this).attr('data-date', translations[key]);
                    }
                });

                // Translate placeholders
                $('[data-i18n-placeholder]').each(function () {
                    const key =$(this).attr('data-i18n-placeholder');
                    if (translations[key]) {
                        $(this).attr('placeholder', translations[key]);
                    }
                });

                // Get translated typing texts
                texts = [];
                $('#lead-texts-to-type span').each(function () {
                    const key = $(this).attr('data-i18n');
                    if (translations[key]) {
                        $(this).html(translations[key]); // Optional: update DOM
                        texts.push(translations[key]);   // Required: push to typing array
                    }
                });

                // Restart typing animation
                clearTypingTimers();
                textIndex = 0;
                charIndex = 0;
                
                // Start typing animation
                $('#lead-text-span').text('');
                typeNextText();

                // Sync project images heights
                syncProjectHeights();
             
                // Create timeline for experience
                $('#experience-timeline').each(function() {
                    createTimeline('#experience-timeline', 'fa fa-briefcase');
                });

                // Create timeline for education
                $('#education-timeline').each(function() {
                    createTimeline('#education-timeline', 'fa fa-graduation-cap');
                });
            },
            error: function () {
                console.error('Language file not found: ' + lang);
            }
        });
    }

    function updateLanguageButton(lang) {
        const $button = $('#language-switcher button');

        if (lang === 'de') {
            $button.attr('data-i18n', 'LANG_GERMAN');
        } else if (lang === 'en') {
            $button.attr('data-i18n', 'LANG_ENGLISH');
        } else if (lang === 'fr') {
            $button.attr('data-i18n', 'LANG_FRENCH');
        }
    }

    function clearTypingTimers() {
        if (typingTimeout) {
            clearTimeout(typingTimeout);
            typingTimeout = null;
        }
        if (erasingTimeout) {
            clearTimeout(erasingTimeout);
            erasingTimeout = null;
        }
    }

    function typeNextText() {
        const $typingText = $('#lead-text-span');
        const currentText = texts[textIndex] || "";

        if (charIndex < currentText.length) {
            $typingText.text($typingText.text() + currentText.charAt(charIndex));
            charIndex++;
            typingTimeout = setTimeout(typeNextText, 50);
        } else {
            typingTimeout = null;
            erasingTimeout = setTimeout(eraseText, 2000);
        }
    }

    function eraseText() {
        const $typingText = $('#lead-text-span');
        if (charIndex > 0) {
            $typingText.text($typingText.text().slice(0, -1));
            charIndex--;
            erasingTimeout = setTimeout(eraseText, 30);
        } else {
            textIndex = (textIndex + 1) % texts.length;
            erasingTimeout = setTimeout(typeNextText, 500);
        }
    }

    $(document).ready(function () {
        $('#language-switcher .dropdown-item').on('click', function (e) {
            e.preventDefault();
            const lang = $(this).data('lang');
            loadLanguage(lang);
            localStorage.setItem('lang', lang);
        });

        const savedLang = localStorage.getItem('lang') || 'de';
        loadLanguage(savedLang);
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
