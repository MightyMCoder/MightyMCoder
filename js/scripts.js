/*!
    Title: Personal Portfolio MightyMCoder (Scripts)
    Version: 1.0.0
    Last Change: 05/21/2025
    Author: MightyMCoder
    Repo: https://github.com/MightyMCoder/MightyMCoder

    based on:
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
    "use strict";

    const portfolio = {
        init() {
            this.cacheSelectors();
            this.bindEvents();
            this.initVariables();
            this.setCurrentYear();
            this.removeNoJsClass();
            this.setupLanguage();
            this.setupBackToTop();
        },

        cacheSelectors() {
            this.$html = $('html');
            this.$body = $('body');
            this.$header = $('header');
            this.$currentYear = $('#current-year');
            this.$menu = $('#menu');
            this.$languageSwitcher = $('#language-switcher');
            this.$mobileMenuOpen = $('#mobile-menu-open');
            this.$mobileMenuClose = $('#mobile-menu-close');
            this.$viewMore = $('#view-more-projects');
            this.$hideMore = $('#hide-more-projects');
            this.$moreProjects = $('#more-projects');
            this.$leadTextSpan = $('#lead-text-span');
            this.$leadTexts = $('#lead-texts-to-type span');
        },

        bindEvents() {
            // Document ready
            $(document).ready(() => {
                this.registerNavigation();
                this.bindLanguageSwitcher();
                this.bindMobileMenu();
                this.bindProjectToggle();
            });

            // DOMContentLoaded events
            document.addEventListener("DOMContentLoaded", () => {
                this.bindBackToTop();
                window.addEventListener('resize', this.syncProjectHeights.bind(this));
                this.resetForms();
                window.addEventListener('pageshow', (event) => {
                    if (event.persisted) {
                        this.resetForms();
                    }
                });
            });
        },

        initVariables() {
            // Typing animation variables
            this.texts = [];
            this.textIndex = 0;
            this.charIndex = 0;
            this.typingTimeout = null;
            this.erasingTimeout = null;
        },

        setCurrentYear() {
            this.$currentYear.text(new Date().getFullYear());
        },

        removeNoJsClass() {
            this.$html.removeClass('no-js');
        },

        registerNavigation() {
            // Smooth scrolling on navigation links
            document.querySelectorAll('header a:not(.no-scroll)').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleNavigationClick(anchor);
                });
            });
        },

        handleNavigationClick(anchor) {
            // Hide mobile menu if visible
            if (this.$header.hasClass('active')) {
                this.$header.removeClass('active');
                this.$body.removeClass('active');
            }

            const targetId = anchor.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            const headerOffset = this.$menu.length ? this.$menu.offset().height : 0;

            if (targetElement) {
                const scrollDistance = targetElement.getBoundingClientRect().top + window.pageYOffset - headerOffset;
                window.scrollTo({
                    top: scrollDistance,
                    behavior: 'smooth'
                });
            }
        },

        setupLanguage() {
            // Load language from localStorage or default
            const savedLang = localStorage.getItem('lang') || 'de';
            this.loadLanguage(savedLang);
        },

        bindLanguageSwitcher() {
            $('#language-switcher .dropdown-item').on('click', (e) => {
                e.preventDefault();
                const lang = $(e.currentTarget).data('lang');
                this.loadLanguage(lang);
                localStorage.setItem('lang', lang);
            });
        },

        loadLanguage(lang) {
            this.$html.attr('lang', lang);
            $('#form-language').val(lang);
            this.updateLanguageButton(lang);

            $.ajax({
                url: 'languages/' + lang + '.xml',
                dataType: 'xml',
                success: (xml) => {
                    const translations = {};
                    $(xml).find('string').each(function () {
                        const key = $(this).attr('name');
                        translations[key] = $(this).text();
                    });

                    $('[data-i18n]').each(function () {
                        const key = $(this).attr('data-i18n');
                        if (translations[key]) {
                            $(this).html(translations[key]);
                        }
                    });

                    $('[data-i18n-date]').each(function () {
                        const key = $(this).attr('data-i18n-date');
                        if (translations[key]) {
                            $(this).attr('data-date', translations[key]);
                        }
                    });

                    $('[data-i18n-placeholder]').each(function () {
                        const key = $(this).attr('data-i18n-placeholder');
                        if (translations[key]) {
                            $(this).attr('placeholder', translations[key]);
                        }
                    });

                    // Setup typing texts
                    this.texts = [];
                    this.$leadTexts.each(function () {
                        const key = $(this).attr('data-i18n');
                        if (translations[key]) {
                            $(this).html(translations[key]);
                            portfolio.texts.push(translations[key]);
                        }
                    });
                    
                    // Restart typing animation
                    this.clearTypingTimers();
                    this.textIndex = 0;
                    this.charIndex = 0;
                    this.$leadTextSpan.text('');
                    this.typeNextText();

                    // Sync project heights and rebuild timelines
                    this.syncProjectHeights();
                    this.rebuildTimeline('#experience-timeline', 'fa fa-briefcase');
                    this.rebuildTimeline('#education-timeline', 'fa fa-graduation-cap');
                },
                error: () => {
                    console.error('Language file not found: ' + lang);
                }
            });
        },

        updateLanguageButton(lang) {
            const $button = $('#language-switcher button');
            switch (lang) {
                case 'de':
                    $button.attr('data-i18n', 'LANG_GERMAN');
                    break;
                case 'en':
                    $button.attr('data-i18n', 'LANG_ENGLISH');
                    break;
                case 'fr':
                    $button.attr('data-i18n', 'LANG_FRENCH');
                    break;
            }
        },

        clearTypingTimers() {
            if (this.typingTimeout) {
                clearTimeout(this.typingTimeout);
                this.typingTimeout = null;
            }
            if (this.erasingTimeout) {
                clearTimeout(this.erasingTimeout);
                this.erasingTimeout = null;
            }
        },

        typeNextText() {
            const currentText = this.texts[this.textIndex] || "";
            if (this.charIndex < currentText.length) {
                this.$leadTextSpan.text(this.$leadTextSpan.text() + currentText.charAt(this.charIndex));
                this.charIndex++;
                this.typingTimeout = setTimeout(() => this.typeNextText(), 50);
            } else {
                this.typingTimeout = null;
                this.erasingTimeout = setTimeout(() => this.eraseText(), 2000);
            }
        },

        eraseText() {
            if (this.charIndex > 0) {
                this.$leadTextSpan.text(this.$leadTextSpan.text().slice(0, -1));
                this.charIndex--;
                this.erasingTimeout = setTimeout(() => this.eraseText(), 30);
            } else {
                this.textIndex = (this.textIndex + 1) % this.texts.length;
                this.erasingTimeout = setTimeout(() => this.typeNextText(), 500);
            }
        },

        syncProjectHeights() {
            $('.project').each(function() {
                const $project = $(this);
                const $image = $project.find('.project-image');
                const $info = $project.find('.project-info');
                if ($image.length && $info.length) {
                    $image.css('height', 'auto');
                    $image.css('height', $info.outerHeight() + 'px');
                }
            });
        },

        rebuildTimeline(timelineId, iconClass) {
            const $container = $(timelineId);
            const $rawItems = [];
            $container.children('.vtimeline-point').each(function () {
                const $content = $(this).find('.vtimeline-content').first();
                if ($content.length) {
                    $content.removeClass('vtimeline-content');
                    $content.children('.vtimeline-date').remove();
                    $rawItems.push($content.detach());
                }
            });

            if (!$rawItems.length) {
                $container.children('div').each(function () {
                    $rawItems.push($(this).detach());
                });
            }

            $container.empty();
            $rawItems.forEach(($item) => {
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
        },

        bindMobileMenu() {
            this.$mobileMenuOpen.on('click', (e) => {
                e.preventDefault();
                this.$header.addClass('active');
                this.$body.addClass('active');
            });

            this.$mobileMenuClose.on('click', (e) => {
                e.preventDefault();
                this.$header.removeClass('active');
                this.$body.removeClass('active');
            });
        },

        bindProjectToggle() {
            this.$viewMore.on('click', (e) => {
                e.preventDefault();
                this.toggleProjects(true);
            });

            this.$hideMore.on('click', (e) => {
                e.preventDefault();
                this.toggleProjects(false);
            });
        },

        toggleProjects(showMore) {
            if (showMore) {
                this.$viewMore.fadeOut(300, () => {
                    this.$moreProjects.slideDown(500);
                    this.$hideMore.fadeIn(300);
                    this.syncProjectHeights();
                });
            } else {
                this.$hideMore.fadeOut(300, () => {
                    this.$moreProjects.slideUp(500);
                    this.$viewMore.fadeIn(300);
                });
            }
        },

        setupBackToTop() {
            this.$backToTopBtn = $("#back-to-top");
        },

        bindBackToTop() {
            if (this.$backToTopBtn.length) {
                window.addEventListener("scroll", () => {
                    if (window.scrollY > 300) {
                        this.$backToTopBtn.addClass("visible");
                    } else {
                        this.$backToTopBtn.removeClass("visible");
                    }
                });
                this.$backToTopBtn.on("click", (e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                });
            }
        },

        resetForms() {
            document.querySelectorAll('form').forEach(form => form.reset());
        }
    };

    portfolio.init();
})(jQuery);
