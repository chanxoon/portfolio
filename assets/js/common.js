let scrollY;
let wrap = document.querySelector('body');
let myScroll;

// 스크린 높이 계산
function syncHeight() {
    document.documentElement.style.setProperty('--window-inner-height', `${window.innerHeight}px`);
}

// body scroll lock
function bodyLock() {
    scrollY = window.scrollY;
    document.documentElement.classList.add('is-locked');
    wrap.style.top = `-${scrollY}px`;
    // AOS 사용시 refresh 필요
    // AOS.refresh();
}

// body scroll unlock
function bodyUnlock() {
    document.documentElement.classList.remove('is-locked');
    window.scrollTo(0, scrollY);
    if (wrap) {
        wrap.style.top = '';
    }
    // AOS 사용시 refresh 필요
    // AOS.refresh();
}

// tab menu event
function tabMenuEvent() {
    $('.tabMenu li').click(function () {
        const tabId = $(this).data('tab');
        const tabParent = $(this).closest('.tabWrap');

        $(tabParent).find('.tabMenu li').removeClass('active');
        $(this).addClass('active');

        $(tabParent).find('.tabPanel').removeClass('active');
        $('#' + tabId).addClass('active');
    });
}

// popup open
function modalOpen(el) {
    $('#' + el).fadeIn('fast');
    $('#dim').fadeIn('fast');
    bodyLock();
    tabMenuEvent();
}

// popup close
function modalClose(el) {
    $(el).parents('.popWrap').fadeOut('fast');
    $('#dim').fadeOut('fast');
    bodyUnlock();
}

function headerActiveCheck() {
    const TopVal = $(window).scrollTop();
    const TopFixed1 = 100;

    if (TopFixed1 <= TopVal) {
        $('#header').addClass('active');
    } else {
        $('#header').removeClass('active');
    }
}
$(window).on('scroll', headerActiveCheck);
// 새로고침
$(document).ready(() => {
    headerActiveCheck();
});

document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 1000,
    });

    const swiper = new Swiper('.mySwiper', {
        effect: 'coverflow',
        grabCursor: true,
        slidesPerView: 4,
        spaceBetween: 10,
        centeredSlides: true,
        loop: true,
        coverflowEffect: {
            rotate: 20,
            stretch: 0,
            depth: 160,
            modifier: 1,
            slideShadows: false,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination',
        },
    });

    wrap = document.getElementById('wrap');
    syncHeight();
    // selectbox
    $('.custom-sel').each(function () {
        const selWrap = $(this);
        const selBtn = $(this).find('button');
        const selLayer = $(this).find('ul');
        const selResult = $(this).find('input');
        selBtn.on('click', () => {
            if (selWrap.hasClass('open')) {
                selWrap.toggleClass('open');
                selLayer.slideToggle('fast');
            } else {
                $('.custom-sel').removeClass('open');
                $('.custom-sel > ul').slideUp('fast');
                selWrap.addClass('open');
                selLayer.slideDown('fast');
            }
        });
        selLayer.find('li').on('click', function () {
            $(this).addClass('selected').siblings().removeClass('selected');
            selResult.val($(this).attr('data-value'));
            selBtn.text($(this).text());
            selWrap.removeClass('open');
            selLayer.slideUp('fast');
        });
    });
    // selectbox close
    $(document).on('click', e => {
        e.stopPropagation();
        const selWrap = $('.custom-sel');
        const selLayer = selWrap.find('ul');

        if (selWrap.has(e.target).length === 0) {
            selWrap.removeClass('open');
            selLayer.slideUp('fast');
        }
    });

    // 스크롤다운
    $('.scrollBtn button').on('click', () => {
        const $target = $('.introSec'); // 기준 엘리먼트
        const targetBottom = $target.offset().top + $target.outerHeight();
        const currentScroll = $(window).scrollTop();

        // 이미 하단보다 내려가 있으면 이동 안 함
        if (currentScroll >= targetBottom) return;

        $('html, body').animate(
            {
                scrollTop: targetBottom,
            },
            500,
        );
    });

    // 메뉴 버튼 액티브
    $('.navBtn button').on('click', function () {
        $(this).toggleClass('active');
        $('#header').toggleClass('on');
        $('.navListWrap').toggleClass('active');

        if ($(this).hasClass('active')) {
            bodyLock();
        } else {
            bodyUnlock();
        }
    });

    // 스크롤탑
    const $scrollBtn = $('#scrollTopBtn');
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $scrollBtn.fadeIn();
        } else {
            $scrollBtn.fadeOut();
        }
    });
    $scrollBtn.click(() => {
        $('html, body').animate({ scrollTop: 0 }, 'smooth');
    });
    // footer를 가리지 않도록 위치 조정
    function adjustButtonPosition() {
        const footerOffset = $('footer').offset().top;
        const windowHeight = $(window).height();
        const scrollPos = $(window).scrollTop();
        const buttonHeight = $scrollBtn.outerHeight();

        if (scrollPos + windowHeight > footerOffset) {
            const offsetFromFooter = scrollPos + windowHeight - footerOffset;
            $scrollBtn.css('bottom', offsetFromFooter + 20 + 'px'); // footer에 겹치지 않도록 조정
        } else {
            $scrollBtn.css('bottom', '20px'); // 기본 위치
        }
    }
    $(window).scroll(adjustButtonPosition);
    $(window).resize(adjustButtonPosition);
});

// $(() => {
//     $(window).on('resize', function () {
//         const width = $(this).width();
//         if (width <= 1400) {

//         } else {

//         }
//     });
//     $(window).trigger('resize');
// });

window.addEventListener('load', () => {});

window.addEventListener('resize', () => {
    syncHeight();
});

window.addEventListener('scroll', () => {});
