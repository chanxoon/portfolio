let scrollY;
let wrap = document.querySelector('body');
let myScroll;

// 스크린 높이 계산
function syncHeight() {
    document.documentElement.style.setProperty('--window-inner-height', `${window.innerHeight}px`);
}

// mobile check
function isMobile() {
    const width = window.innerWidth;
    if (width < 1025) {
        return true;
    }
    return false;
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

// swiper
function swipeInitrEvent() {
    const swiperElements = document.querySelectorAll('.swiperModule');
    if (swiperElements.length === 0) return;

    swiperElements.forEach(el => {
        let swiper = null;

        const parentContainer = el.closest('.cardItemInner');
        const swiperContainer = el.querySelector('.swiper');
        if (!swiperContainer || !parentContainer) return;

        const controlContainer = parentContainer.querySelector('.controlContent');
        const controlCount = controlContainer.querySelector('.controlCount');
        const currentEl = controlCount?.querySelector('.current');
        const totalEl = controlCount?.querySelector('.total');

        // ---- 반응형 breakpoint 값 추출 ----
        function getBreakpoints() {
            // 원본 breakpoint 값을 별도로 저장
            let tabletBreakpointOriginal = 1440; // 기본값
            let mobileBreakpointOriginal = 767; // 기본값

            // taMode 클래스에서 추출 (예: taMode1200)
            const tabletModeClass = [...el.classList].find(cls => /^taMode(\d+)$/i.test(cls));
            if (tabletModeClass) {
                tabletBreakpointOriginal = parseInt(tabletModeClass.replace(/^taMode/i, ''), 10);
            }

            // moMode 클래스에서 추출 (예: moMode600)
            const mobileModeClass = [...el.classList].find(cls => /^moMode(\d+)$/i.test(cls));
            if (mobileModeClass) {
                mobileBreakpointOriginal = parseInt(mobileModeClass.replace(/^moMode/i, ''), 10);
            }

            // data 속성으로도 설정 가능
            if (el.dataset.taMode) {
                tabletBreakpointOriginal = parseInt(el.dataset.taMode, 10);
            }
            if (el.dataset.mobileMode) {
                mobileBreakpointOriginal = parseInt(el.dataset.mobileMode, 10);
            }

            // 실제 사용할 breakpoint 값 (원본을 복사)
            let tabletBreakpoint = tabletBreakpointOriginal;
            const mobileBreakpoint = mobileBreakpointOriginal;

            // 모바일 모드가 태블릿 모드보다 크면 태블릿 모드도 모바일 모드 값을 따름
            if (mobileBreakpoint > tabletBreakpoint) {
                tabletBreakpoint = mobileBreakpoint;
            }

            return { tabletBreakpoint, mobileBreakpoint };
        }

        // ---- 현재 디바이스 타입 판단 ----
        function getDeviceType() {
            const { tabletBreakpoint, mobileBreakpoint } = getBreakpoints();
            const width = window.innerWidth;

            if (width <= mobileBreakpoint) {
                return 'mobile';
            }
            if (width <= tabletBreakpoint) {
                return 'tablet';
            }
            return 'pc';
        }

        // 슬라이드 개수
        function getSlidesPerView() {
            let slidesPerView = 1;
            const deviceType = getDeviceType();

            // PC 설정 먼저 가져오기 (기본값)
            const pcClass = [...el.classList].find(cls => /^pcPerview(\d+)$/i.test(cls));
            if (pcClass) {
                slidesPerView = parseInt(pcClass.replace('pcPerview', ''), 10);
            } else if (el.dataset.pcSlides) {
                slidesPerView = parseInt(el.dataset.pcSlides, 10);
            }

            if (deviceType === 'mobile') {
                // 모바일 설정이 있으면 덮어쓰기
                const moClass = [...el.classList].find(cls => /^moPerview(\d+)$/i.test(cls));
                if (moClass) {
                    slidesPerView = parseInt(moClass.replace('moPerview', ''), 10);
                } else if (el.dataset.moSlides) {
                    slidesPerView = parseInt(el.dataset.moSlides, 10);
                }
                // 모바일 설정이 없으면 PC 설정 유지
            } else if (deviceType === 'tablet') {
                // 태블릿 설정이 있으면 덮어쓰기
                const tabletClass = [...el.classList].find(cls => /^taPerview(\d+)$/i.test(cls));
                if (tabletClass) {
                    slidesPerView = parseInt(tabletClass.replace('taPerview', ''), 10);
                } else if (el.dataset.taSlides) {
                    slidesPerView = parseInt(el.dataset.taSlides, 10);
                }
                // 태블릿 설정이 없으면 PC 설정 유지
            }

            return slidesPerView;
        }

        // gap 처리
        function getGap() {
            let spaceBetween = 0;
            const deviceType = getDeviceType();

            // PC gap 먼저 가져오기 (기본값)
            const pcGapClass = [...el.classList].find(cls => /^pcGaps(\d+)$/i.test(cls));
            if (pcGapClass) {
                spaceBetween = parseInt(pcGapClass.replace('pcGaps', ''), 10);
            } else if (el.dataset.pcGaps) {
                spaceBetween = parseInt(el.dataset.pcGaps, 10);
            }

            if (deviceType === 'mobile') {
                // 모바일 gap이 있으면 덮어쓰기
                const moGapClass = [...el.classList].find(cls => /^moGaps(\d+)$/i.test(cls));
                if (moGapClass) {
                    spaceBetween = parseInt(moGapClass.replace('moGaps', ''), 10);
                } else if (el.dataset.moGaps) {
                    spaceBetween = parseInt(el.dataset.moGaps, 10);
                }
                // 모바일 설정이 없으면 PC 설정 유지
            } else if (deviceType === 'tablet') {
                // 태블릿 gap이 있으면 덮어쓰기
                const tabletGapClass = [...el.classList].find(cls => /^taGaps(\d+)$/i.test(cls));
                if (tabletGapClass) {
                    spaceBetween = parseInt(tabletGapClass.replace('taGaps', ''), 10);
                } else if (el.dataset.taGaps) {
                    spaceBetween = parseInt(el.dataset.taGaps, 10);
                }
                // 태블릿 설정이 없으면 PC 설정 유지
            }

            return spaceBetween;
        }

        // singleSlide 클래스 토글 함수
        function toggleSingleSlideClass(pageCount) {
            if (pageCount === 1) {
                el.classList.add('singleSlide');
                controlContainer.classList.add('singleSlide');
            } else {
                el.classList.remove('singleSlide');
                controlContainer.classList.remove('singleSlide');
            }
        }

        // Swiper 초기화
        function initSwiper() {
            const slidesPerView = getSlidesPerView();
            const spaceBetween = getGap();

            if (swiper) swiper.destroy(true, true);

            const swiperOptions = {
                loop: false,
                slidesPerView,
                spaceBetween,
                on: {
                    init() {
                        const pageCount = this.snapGrid.length;
                        if (totalEl) totalEl.textContent = pageCount;
                        if (currentEl) currentEl.textContent = 1;

                        // singleSlide 클래스 추가/제거
                        toggleSingleSlideClass(pageCount);
                    },
                    slideChange() {
                        if (currentEl) currentEl.textContent = this.snapIndex + 1;
                    },
                },
            };

            const paginationEl = el.querySelector('.swiper-pagination');
            if (paginationEl) {
                swiperOptions.pagination = {
                    el: paginationEl,
                    clickable: true,
                };
            }

            const prevEl = parentContainer.querySelector('.controlContent .buttonPrev');
            const nextEl = parentContainer.querySelector('.controlContent .buttonNext');

            if (prevEl && nextEl) {
                swiperOptions.navigation = {
                    nextEl,
                    prevEl,
                };
            }

            swiper = new Swiper(swiperContainer, swiperOptions);
        }

        // 첫 실행
        initSwiper();

        // ---- Resize debounce 처리 ----
        let resizeTimer = null;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                initSwiper();
            }, 200);
        });
    });
}

// tooltip
function tooltipEvent(dir1, dir2) {
    const tooltipIcon = '.tooltipModule';
    const tooltipTitle = '.tooltipTitle';

    function tooltipInitEvent(target) {
        document.querySelectorAll(target).forEach(element => {
            function infoResult() {
                const tooltipAttr = element.getAttribute('data-tooltip');
                if (tooltipAttr) {
                    return tooltipAttr;
                }
                const tooltipHtmlAttr = element.getAttribute('data-tooltip-html');
                if (tooltipHtmlAttr) {
                    return tooltipHtmlAttr.replace(/\n/g, '');
                }
                return '';
            }

            $(element).qtip({
                content: {
                    text: infoResult(),
                },
                position: {
                    /*
                        // 기본 4방향 (중앙 정렬)

                        // 오른쪽
                        position: {
                            my: 'left center',
                            at: 'right center',
                        }

                        // 왼쪽
                        position: {
                            my: 'right center',
                            at: 'left center',
                        }

                        // 위쪽
                        position: {
                            my: 'bottom center',
                            at: 'top center',
                        }

                        // 아래쪽
                        position: {
                            my: 'top center',
                            at: 'bottom center',
                        }

                        // 오른쪽 방향 (상세)

                        // 오른쪽 위
                        position: {
                            my: 'left bottom',
                            at: 'right top',
                        }

                        // 오른쪽 중앙
                        position: {
                            my: 'left center',
                            at: 'right center',
                        }

                        // 오른쪽 아래
                        position: {
                            my: 'left top',
                            at: 'right bottom',
                        }

                        // 왼쪽 방향 (상세)

                        // 왼쪽 위
                        position: {
                            my: 'right bottom',
                            at: 'left top',
                        }

                        // 왼쪽 중앙
                        position: {
                            my: 'right center',
                            at: 'left center',
                        }

                        // 왼쪽 아래
                        position: {
                            my: 'right top',
                            at: 'left bottom',
                        }

                        // 위쪽 방향 (상세)

                        // 위쪽 왼쪽
                        position: {
                            my: 'bottom right',
                            at: 'top left',
                        }

                        // 위쪽 중앙
                        position: {
                            my: 'bottom center',
                            at: 'top center',
                        }

                        // 위쪽 오른쪽
                        position: {
                            my: 'bottom left',
                            at: 'top right',
                        }

                        // 아래쪽 방향 (상세)

                        // 아래쪽 왼쪽
                        position: {
                            my: 'top right',
                            at: 'bottom left',
                        }

                        // 아래쪽 중앙
                        position: {
                            my: 'top center',
                            at: 'bottom center',
                        }

                        // 아래쪽 오른쪽
                        position: {
                            my: 'top left',
                            at: 'bottom right',
                        }

                        // 대각선 모서리

                        // 오른쪽 위 모서리
                        position: {
                            my: 'left bottom',
                            at: 'right top',
                        }

                        // 오른쪽 아래 모서리
                        position: {
                            my: 'left top',
                            at: 'right bottom',
                        }

                        // 왼쪽 위 모서리
                        position: {
                            my: 'right bottom',
                            at: 'left top',
                        }

                        // 왼쪽 아래 모서리
                        position: {
                            my: 'right top',
                            at: 'left bottom',
                        }

                        그 외 4개의 조합을 통한 다수의 방향 옵션이 존재
                    */
                    my: dir1 || 'left center',
                    at: dir2 || 'right center',
                },
                style: {
                    classes: 'qtip-light qtip-rounded qtip-shadow',
                },
            });
        });
    }

    tooltipInitEvent(tooltipIcon);
    tooltipInitEvent(tooltipTitle);
}

// mobile main daily check list event
function moDailyCheckListEvent() {
    const dailyCheckListElements = document.querySelectorAll('.dailyCheckListModule');
    if (dailyCheckListElements.length === 0) return;

    dailyCheckListElements.forEach(el => {
        function weekButtonClickEvent() {
            // 1440 이하일 때만 실행
            if (window.innerWidth > 1440) return;

            const topItems = el.querySelectorAll('.dateListInner.top .item');

            topItems.forEach(topItem => {
                const button = topItem.querySelector('.weekbutton.top');

                button.addEventListener('click', () => {
                    // 클릭한 top 아이템의 요일 클래스 찾기 (sun, mon, tue, wed, thu, fri, sat)
                    const dayClass = Array.from(topItem.classList).find(cls =>
                        ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].includes(cls),
                    );

                    if (dayClass) {
                        // 모든 top 아이템에서 active 제거
                        topItems.forEach(item => item.classList.remove('active'));

                        // 클릭한 top 아이템에 active 추가
                        topItem.classList.add('active');

                        // 모든 bottom 아이템에서 active 제거
                        const bottomItems = el.querySelectorAll('.dateListInner.bottom .item');
                        bottomItems.forEach(item => item.classList.remove('active'));

                        // 같은 요일 클래스를 가진 bottom 아이템에 active 추가
                        const targetBottomItem = el.querySelector(`.dateListInner.bottom .item.${dayClass}`);
                        if (targetBottomItem) {
                            targetBottomItem.classList.add('active');
                        }
                    }
                });
            });
        }

        function dailyActiveEvent() {
            // 초기 이벤트 바인딩
            weekButtonClickEvent();

            // 윈도우 리사이즈 시 이벤트 재바인딩
            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    weekButtonClickEvent();
                }, 250);
            });
        }

        // 이벤트 초기화
        dailyActiveEvent();
    });
}

// accordion
function accordionEvent() {
    const target = document.querySelectorAll('.accordionModule');
    if (target.length > 0) {
        target.forEach(el => {
            const trigger = el.querySelector('.accordionTrigger');
            const content = el.querySelector('.accordionModuleContent');
            const body = el.querySelector('.accordionBody');
            const bodyInner = el.querySelector('.accordionBodyContent');
            const accToggle = el.querySelector('.toggleBtnset .toggle');

            if (!trigger || !body) return;

            // ResizeObserver 생성
            const resizeObserver = new ResizeObserver(entries => {
                entries.forEach(entry => {
                    // active 상태일 때만 높이 갱신
                    if (content.classList.contains('active')) {
                        const height = bodyInner.offsetHeight;
                        body.style.height = `${height}px`;
                    }
                });
            });

            // 높이 설정 함수
            const setHeight = (disableTransition = false) => {
                if (disableTransition) {
                    body.style.transition = 'none';
                }

                const height = bodyInner.offsetHeight;
                body.style.height = `${height}px`;

                if (disableTransition) {
                    // 강제 reflow를 통해 transition: none이 적용되도록 함
                    // eslint-disable-next-line no-unused-expressions
                    body.offsetHeight;
                    // transition 복원
                    body.style.transition = '';
                }
            };

            // 높이 초기화 함수
            const resetHeight = () => {
                body.style.height = '0px';
            };

            trigger.addEventListener('click', () => {
                const isActive = content.classList.contains('active');

                if (isActive) {
                    content.classList.remove('active');
                    resetHeight();
                    // ResizeObserver 해제
                    resizeObserver.unobserve(bodyInner);
                    trigger.textContent = '열기';
                } else {
                    content.classList.add('active');
                    setHeight(); // transition 활성화 상태로 높이 설정
                    // ResizeObserver 시작
                    resizeObserver.observe(bodyInner);
                    trigger.textContent = '닫기';
                }
            });

            // 아코디언 헤더 토글버튼 클릭시
            accToggle.addEventListener('click', e => {
                const isActive = e.target.checked;
                const allCh = $(e.currentTarget)
                    .closest('.accordionModuleContent')
                    .find('.accordionBody input[type=checkbox]');

                if (isActive) {
                    content.classList.add('active');
                    setHeight();
                    allCh.prop('checked', true);
                    // ResizeObserver 시작
                    resizeObserver.observe(bodyInner);
                } else {
                    content.classList.remove('active');
                    resetHeight();
                    allCh.prop('checked', false);
                    // ResizeObserver 해제
                    resizeObserver.unobserve(bodyInner);
                }
            });

            // 트리 체크박스 전체/부분 제어
            $(el).on('change', '[data-all-trigger]', function () {
                const key = $(this).data('all-trigger');
                $(el).find(`[data-all-chk="${key}"]`).prop('checked', this.checked).trigger('change');
            });

            // body 체크 상태 → header toggle 반영
            $(el).on('change', '.accordionBody input[type=checkbox]', () => {
                const checked = $(el).find('.accordionBody input[type=checkbox]:checked').length;
                accToggle.indeterminate = false;
                accToggle.checked = checked > 0;
            });

            // 초기 상태가 active인 경우 처리
            if (content.classList.contains('active')) {
                setHeight(true); // transition 없이 높이 설정
                resizeObserver.observe(bodyInner);
            } else {
                resetHeight();
            }
        });
    }
}

// calendar test schedule array
const testEvents = [
    {
        start: '2025-11-06T12:00:00',
        end: '2025-11-06T13:00:00',
        className: 'scheduleBlue',
    },
    {
        start: '2025-11-06T12:00:00',
        end: '2025-11-06T13:00:00',
        className: 'scheduleGreen',
    },
    {
        start: '2025-11-06T12:00:00',
        end: '2025-11-06T13:00:00',
        className: 'scheduleGray',
    },
    {
        start: '2025-11-08T14:00:00',
        end: '2025-11-08T15:30:00',
        className: 'schedulePrimary',
    },
    {
        start: '2025-11-08T14:00:00',
        end: '2025-11-08T15:30:00',
    },
    {
        start: '2025-11-08T14:00:00',
        end: '2025-11-08T15:30:00',
    },
    {
        start: '2025-11-08T14:00:00',
        end: '2025-11-08T15:30:00',
    },
    {
        start: '2025-11-08T14:00:00',
        end: '2025-11-08T15:30:00',
    },
    {
        start: '2025-11-08T14:00:00',
        end: '2025-11-08T15:30:00',
    },
    {
        start: '2025-11-09T09:00:00',
        end: '2025-11-09T10:00:00',
    },
    {
        start: '2025-12-06T12:00:00',
        end: '2025-12-06T13:00:00',
        className: 'scheduleBlue',
    },
    {
        start: '2025-12-06T12:00:00',
        end: '2025-12-06T13:00:00',
        className: 'scheduleGreen',
    },
    {
        start: '2025-12-06T12:00:00',
        end: '2025-12-06T13:00:00',
        className: 'scheduleGray',
    },
    {
        start: '2025-12-08T14:00:00',
        end: '2025-12-08T15:30:00',
        className: 'schedulePrimary',
    },
    {
        start: '2025-12-08T14:00:00',
        end: '2025-12-08T15:30:00',
    },
    {
        start: '2025-12-08T14:00:00',
        end: '2025-12-08T15:30:00',
    },
    {
        start: '2025-12-08T14:00:00',
        end: '2025-12-08T15:30:00',
    },
    {
        start: '2025-12-08T14:00:00',
        end: '2025-12-08T15:30:00',
    },
    {
        start: '2025-12-08T14:00:00',
        end: '2025-12-08T15:30:00',
    },
    {
        start: '2025-12-09T09:00:00',
        end: '2025-12-09T10:00:00',
    },
];

// 한국 공휴일 데이터 (2025-2026년)
const holidays = [
    // 매년 반복되는 양력 공휴일
    { date: '01-01', title: '신정' },
    { date: '03-01', title: '삼일절' },
    { date: '05-05', title: '어린이날' },
    { date: '06-06', title: '현충일' },
    { date: '08-15', title: '광복절' },
    { date: '10-03', title: '개천절' },
    { date: '10-09', title: '한글날' },
    { date: '12-25', title: '성탄절' },

    // 2025년 음력 공휴일 및 대체공휴일
    { date: '2025-01-28', title: '설날 연휴' },
    { date: '2025-01-29', title: '설날' },
    { date: '2025-01-30', title: '설날 연휴' },
    { date: '2025-03-03', title: '대체공휴일(삼일절)' },
    { date: '2025-05-05', title: '어린이날' },
    { date: '2025-05-06', title: '석가탄신일' },
    { date: '2025-10-05', title: '추석 연휴' },
    { date: '2025-10-06', title: '추석' },
    { date: '2025-10-07', title: '추석 연휴' },
    { date: '2025-10-08', title: '대체공휴일(추석)' },

    // 2026년 음력 공휴일 및 대체공휴일
    { date: '2026-02-16', title: '설날 연휴' },
    { date: '2026-02-17', title: '설날' },
    { date: '2026-02-18', title: '설날 연휴' },
    { date: '2026-03-02', title: '대체공휴일(삼일절)' },
    { date: '2026-05-25', title: '석가탄신일' },
    { date: '2026-09-24', title: '추석 연휴' },
    { date: '2026-09-25', title: '추석' },
    { date: '2026-09-26', title: '추석 연휴' },
    { date: '2026-09-28', title: '대체공휴일(추석)' },
];

// calendar event
/* 캘린더 이벤트 생성 및 렌더링 함수 */
function calendarEvent(schedule, holidayData = holidays) {
    // 페이지 내 모든 캘린더 모듈 요소 선택
    const calendarEl = document.querySelectorAll('.calendarModule');
    const scheduleArray = schedule;
    const holidaysArray = holidayData;

    /* 일정 아이템 HTML 렌더링 함수 */
    function scheduleItemRender(target, type) {
        const result = `
            <span class="scheduleItemModule res ${type}">
                <span class="scheduleItemContent">
                    <span class="scheduleText">
                        ${target}
                    </span>
                </span>
            </span>
        `;
        return result;
    }

    /* FullCalendar 초기화 및 렌더링 함수 */
    function calendarRender(target) {
        /* 화면 크기에 따른 캘린더 종횡비 계산, 종횡비 값 (모바일: 0.8, 데스크톱: 1) */
        function getAspectRatio() {
            return window.innerWidth <= 767 ? 0.8 : 1;
        }

        /* 화면 크기에 따른 일별 최대 이벤트 표시 개수 설정, 모바일에서는 0(제한없음), 데스크톱에서는 true(자동) */
        function getDayMaxEvents() {
            return window.innerWidth <= 767 ? 0 : true;
        }

        // FullCalendar 인스턴스 생성 및 설정
        const calendar = new FullCalendar.Calendar(target, {
            /* 날짜 셀 내용 커스터마이징, 날짜에서 '일' 텍스트 제거 (예: '15일' → '15') */
            dayCellContent(arg) {
                return arg.dayNumberText.replace('일', '');
            },

            // 캘린더 종횡비 설정 (높이/너비 비율)
            aspectRatio: getAspectRatio(),

            // 초기 뷰 모드: 월간 그리드 뷰
            initialView: 'dayGridMonth',

            // 하루에 표시할 최대 이벤트 수 (초과 시 +N으로 표시)
            dayMaxEvents: getDayMaxEvents(),

            // 로케일 설정: 한국어
            locale: 'ko',

            // 헤더 툴바 레이아웃 설정
            headerToolbar: {
                start: 'prev', // 왼쪽: 이전 달 버튼
                center: 'title', // 중앙: 현재 년월 제목
                end: 'next', // 오른쪽: 다음 달 버튼
            },

            // 이벤트에 시작/종료 시간 표시 활성화
            displayEventTime: true,
            displayEventEnd: true,

            // 이벤트 시간 표시 포맷 설정
            eventTimeFormat: {
                hour: '2-digit', // 시간 2자리
                minute: '2-digit', // 분 2자리
                hour12: false, // 24시간 형식
                meridiem: false, // 오전/오후 표시 비활성화
            },

            /* 캘린더에 표시할 이벤트 데이터, 모든 스케줄 이벤트를 block 형태로 표시 */
            events: scheduleArray.map(event => ({
                ...event,
                display: 'block', // 이벤트를 블록 형태로 표시
            })),

            /* 날짜 범위 변경 시 호출되는 콜백 (월 변경 등), 공휴일 표시를 동적으로 처리 */
            datesSet() {
                // 약간의 지연을 두어 이벤트가 완전히 렌더링된 후 처리
                setTimeout(() => {
                    // 모든 날짜 셀 선택
                    const dayCells = target.querySelectorAll('.fc-daygrid-day');

                    dayCells.forEach(cell => {
                        // 기존 공휴일 관련 스타일 및 클래스 초기화
                        cell.classList.remove('holiday-box');

                        // 날짜 숫자 색상 초기화
                        const dayNumber = cell.querySelector('.fc-daygrid-day-number');
                        if (dayNumber) {
                            dayNumber.style.color = '';
                        }

                        // 기존에 추가된 공휴일 타이틀 제거
                        const existingTitles = cell.querySelectorAll('.holiday-title');
                        existingTitles.forEach(title => title.remove());

                        // 날짜 셀의 data-date 속성에서 날짜 정보 추출
                        const dateAttr = cell.getAttribute('data-date');
                        if (dateAttr) {
                            // 날짜를 년-월-일로 분리
                            const [year, month, day] = dateAttr.split('-');
                            const monthDay = `${month}-${day}`; // 월-일 형식

                            /* 공휴일 데이터에서 해당 날짜 찾기, 5자리 형식(MM-DD): 매년 반복되는 공휴일, 10자리 형식(YYYY-MM-DD): 특정 년도의 공휴일 */
                            const holiday = holidaysArray.find(h => {
                                if (h.date.length === 5) {
                                    // 매년 반복되는 공휴일 (예: 01-01, 03-01)
                                    return h.date === monthDay;
                                }
                                if (h.date.length === 10) {
                                    // 특정 년도의 공휴일 (예: 2025-01-01)
                                    return h.date === dateAttr;
                                }
                                return false;
                            });

                            // 공휴일인 경우 스타일 적용
                            if (holiday) {
                                // 공휴일 배경 스타일 클래스 추가
                                cell.classList.add('holiday-box');

                                // 날짜 숫자를 빨간색으로 변경
                                if (dayNumber) {
                                    dayNumber.style.color = '#d32f2f';
                                }

                                // 공휴일 이름 표시 요소 추가
                                const dayEvents = cell.querySelector('.fc-daygrid-day-events');
                                if (dayEvents) {
                                    const holidayTitle = document.createElement('div');
                                    holidayTitle.className = 'holiday-title';
                                    holidayTitle.textContent = holiday.title;

                                    // 이벤트 목록 최상단에 공휴일 타이틀 삽입
                                    dayEvents.insertBefore(holidayTitle, dayEvents.firstChild);
                                }
                            }
                        }
                    });
                }, 50); // 50ms 지연
            },

            /* 날짜 셀이 DOM에 마운트될 때 호출되는 콜백 (초기 렌더링), 공휴일 스타일링 및 타이틀 추가 */
            dayCellDidMount(info) {
                // 로컬 타임존 기준으로 정확한 날짜 추출
                const year = info.date.getFullYear();
                const month = String(info.date.getMonth() + 1).padStart(2, '0'); // 0-based이므로 +1
                const day = String(info.date.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`; // YYYY-MM-DD 형식
                const monthDay = `${month}-${day}`; // MM-DD 형식

                /* 해당 날짜의 공휴일 찾기, datesSet과 동일한 로직으로 처리 */
                const holiday = holidaysArray.find(h => {
                    if (h.date.length === 5) {
                        // 매년 반복되는 공휴일
                        return h.date === monthDay;
                    }
                    if (h.date.length === 10) {
                        // 특정 년도의 공휴일
                        return h.date === dateStr;
                    }
                    return false;
                });

                // 공휴일인 경우 스타일 적용
                if (holiday) {
                    // 공휴일 배경 스타일 클래스 추가
                    info.el.classList.add('holiday-box');

                    // 날짜 숫자를 빨간색으로 변경
                    const dayNumber = info.el.querySelector('.fc-daygrid-day-number');
                    if (dayNumber) {
                        dayNumber.style.color = '#d32f2f';
                    }

                    // 공휴일 이름 표시 요소 추가
                    const dayEvents = info.el.querySelector('.fc-daygrid-day-events');
                    if (dayEvents) {
                        const holidayTitle = document.createElement('div');
                        holidayTitle.className = 'holiday-title';
                        holidayTitle.textContent = holiday.title;

                        // 이벤트 목록 최상단에 공휴일 타이틀 삽입
                        dayEvents.insertBefore(holidayTitle, dayEvents.firstChild);
                    }
                }
            },

            /* 이벤트가 DOM에 렌더링된 후 호출되는 콜백, 시간 구분자를 '-'에서 '~'로 변경 */
            eventDidMount(info) {
                const timeEl = info.el.querySelector('.fc-event-time');

                // 시간 요소가 존재하고 아직 처리되지 않은 경우
                if (timeEl && !timeEl.dataset.processed) {
                    // '-' 구분자를 '~'로 변경
                    timeEl.textContent = timeEl.textContent.replace('-', '~');

                    // 중복 처리 방지를 위한 플래그 설정
                    timeEl.dataset.processed = 'true';
                }
            },

            /* 이벤트 내용 커스터마이징, 시간 범위와 타입을 포함한 HTML 생성 */
            eventContent(arg) {
                let timeText = '';
                let classItem = '';

                // 시작 시간과 종료 시간이 모두 존재하는 경우
                if (arg.event.start && arg.event.end) {
                    // 시작 시간 포맷팅 (HH:MM)
                    const startHour = String(arg.event.start.getHours()).padStart(2, '0');
                    const startMin = String(arg.event.start.getMinutes()).padStart(2, '0');

                    // 종료 시간 포맷팅 (HH:MM)
                    const endHour = String(arg.event.end.getHours()).padStart(2, '0');
                    const endMin = String(arg.event.end.getMinutes()).padStart(2, '0');

                    // 이벤트 타입(클래스명) 추출
                    classItem = arg.event.classNames[0] || arg.event.extendedProps.className || '';

                    // 시간 범위 텍스트 생성 (HH:MM ~ HH:MM)
                    timeText = `${startHour}:${startMin} ~ ${endHour}:${endMin}`;
                }

                // 커스텀 HTML 반환
                return {
                    html: scheduleItemRender(timeText, classItem),
                };
            },

            /* "more" 링크 텍스트 커스터마이징, 기본 "+N more"를 "+N"으로 변경 */
            moreLinkText(num) {
                return '+' + num;
            },
        });

        // 캘린더 렌더링 실행
        calendar.render();

        /* 윈도우 리사이즈 이벤트 핸들러, 화면 크기 변경 시 캘린더 옵션 및 크기 업데이트 */
        let resizeTimer; // 디바운싱용 타이머
        window.addEventListener('resize', () => {
            // 기존 타이머 클리어 (디바운싱)
            clearTimeout(resizeTimer);

            // 250ms 후에 실행 (연속적인 리사이즈 이벤트 방지)
            resizeTimer = setTimeout(() => {
                // 새로운 화면 크기에 맞춰 종횡비 업데이트
                calendar.setOption('aspectRatio', getAspectRatio());

                // 새로운 화면 크기에 맞춰 최대 이벤트 수 업데이트
                calendar.setOption('dayMaxEvents', getDayMaxEvents());

                // 캘린더 크기 강제 재계산 및 업데이트
                calendar.updateSize();
            }, 250);
        });

        // 생성된 캘린더 인스턴스 반환 (외부에서 제어 가능하도록)
        return calendar;
    }

    /* 페이지에 존재하는 모든 캘린더 모듈에 대해 캘린더 렌더링 함수 실행 */
    if (calendarEl.length > 0) {
        calendarEl.forEach(el => {
            calendarRender(el);
        });
    }
}

// 사용 예시:
// 1. 기본 공휴일 사용
// calendarEvent(testEvents);

// 2. 커스텀 공휴일 사용
// calendarEvent(testEvents, customHolidays);

// 3. 공휴일 없이 사용
// calendarEvent(testEvents, []);

// all check event
function allCheckEvent() {
    // data-all-chk 또는 data-all-trigger 속성을 가진 모든 체크박스 찾기
    const allChkBoxes = document.querySelectorAll(
        'input[type="checkbox"][data-all-chk], input[type="checkbox"][data-all-trigger]',
    );

    if (allChkBoxes.length > 0) {
        // 전체 선택 체크박스 트리거 함수
        const triggerAllCheck = (triggerValue, isChecked) => {
            // data-all-trigger 값과 동일한 data-all-chk를 가진 모든 체크박스 찾기
            const sameGroupBoxes = document.querySelectorAll(`input[type="checkbox"][data-all-chk="${triggerValue}"]`);

            sameGroupBoxes.forEach(box => {
                box.checked = isChecked;

                // 만약 이 체크박스도 data-all-trigger를 가지고 있다면 (하위 전체 선택)
                const subTriggerValue = box.getAttribute('data-all-trigger');
                if (subTriggerValue) {
                    // 재귀적으로 하위 그룹도 체크/해제
                    triggerAllCheck(subTriggerValue, isChecked);
                }
            });
        };

        // 개별 체크박스 상태 확인 및 상위 전체 선택 체크박스 업데이트
        const updateMasterCheckbox = chkValue => {
            // 전체 선택 체크박스 찾기
            const masterCheckbox = document.querySelector(`input[type="checkbox"][data-all-trigger="${chkValue}"]`);

            if (masterCheckbox) {
                // 동일한 data-all-chk 값을 가진 개별 체크박스들
                const individualBoxes = document.querySelectorAll(`input[type="checkbox"][data-all-chk="${chkValue}"]`);

                // 모든 개별 체크박스가 체크되어 있는지 확인
                const allChecked = Array.from(individualBoxes).every(box => box.checked);

                // 전체 선택 체크박스 상태 업데이트
                masterCheckbox.checked = allChecked;

                // 상위 그룹이 있다면 재귀적으로 업데이트
                const parentChkValue = masterCheckbox.getAttribute('data-all-chk');
                if (parentChkValue) {
                    updateMasterCheckbox(parentChkValue);
                }
            }
        };

        // 페이지 로드 시 전체 선택 체크박스 상태 확인 및 적용
        const initializeCheckboxes = () => {
            // data-all-trigger 속성을 가진 모든 전체 선택 체크박스 찾기
            const masterCheckboxes = document.querySelectorAll('input[type="checkbox"][data-all-trigger]');

            masterCheckboxes.forEach(masterCheckbox => {
                const triggerValue = masterCheckbox.getAttribute('data-all-trigger');

                if (masterCheckbox.checked) {
                    // 전체 선택 체크박스가 체크되어 있으면 같은 그룹 모두 체크
                    triggerAllCheck(triggerValue, true);
                }
            });
        };

        // 페이지 로드 시 초기화
        initializeCheckboxes();

        // 체크박스 변경 이벤트
        allChkBoxes.forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                const triggerValue = this.getAttribute('data-all-trigger');
                const chkValue = this.getAttribute('data-all-chk');

                // data-all-trigger 속성이 있는 경우 (전체 선택 체크박스)
                if (triggerValue) {
                    const isChecked = this.checked;

                    // 하위 그룹 전체 체크/해제 (재귀적으로)
                    triggerAllCheck(triggerValue, isChecked);

                    // 만약 이 전체 선택 체크박스도 상위 그룹에 속해있다면
                    if (chkValue) {
                        updateMasterCheckbox(chkValue);
                    }
                }
                // data-all-chk만 있는 개별 체크박스인 경우
                else if (chkValue) {
                    // 상위 전체 선택 체크박스 상태 업데이트 (재귀적으로)
                    updateMasterCheckbox(chkValue);
                }
            });
        });
    }
}

// checkbox - accordion control event
function checkboxAccordionEvent() {
    // data-accordion-trigger 속성을 가진 체크박스 찾기
    const accordionTriggerCheckboxes = document.querySelectorAll('input[type="checkbox"][data-accordion-trigger]');

    if (accordionTriggerCheckboxes.length === 0) return;

    accordionTriggerCheckboxes.forEach(checkbox => {
        const triggerValue = checkbox.getAttribute('data-accordion-trigger');

        // 해당 체크박스와 연결된 아코디언들 찾기
        const targetAccordions = document.querySelectorAll(`.accordionModule[data-accordion-group="${triggerValue}"]`);

        if (targetAccordions.length === 0) return;

        // 각 아코디언에 대한 참조 저장
        const accordionControls = [];

        targetAccordions.forEach(el => {
            const content = el.querySelector('.accordionModuleContent');
            const trigger = el.querySelector('.accordionTrigger');

            if (!content) return;

            accordionControls.push({
                element: el,
                content,
                trigger,
            });
        });

        // 전체 체크박스 상태 업데이트 함수
        const updateMasterCheckbox = () => {
            const allActive = accordionControls.every(control => control.content.classList.contains('active'));
            checkbox.checked = allActive;
        };

        // 각 아코디언에 MutationObserver 설정 (active 클래스 변화 감지)
        accordionControls.forEach(control => {
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        // 아코디언 상태 변경 시 전체 체크박스 업데이트
                        updateMasterCheckbox();
                    }
                });
            });

            // content 요소의 class 속성 변화 감지
            observer.observe(control.content, {
                attributes: true,
                attributeFilter: ['class'],
            });
        });

        // 초기 체크박스 상태 설정
        updateMasterCheckbox();

        // 체크박스 변경 이벤트
        checkbox.addEventListener('change', function () {
            const isChecked = this.checked;

            accordionControls.forEach(control => {
                const { trigger } = control;

                // 개별 아코디언의 트리거 버튼 클릭으로 상태 변경
                if (trigger) {
                    const currentActive = control.content.classList.contains('active');

                    // 현재 상태와 목표 상태가 다를 때만 클릭
                    if ((isChecked && !currentActive) || (!isChecked && currentActive)) {
                        trigger.click();
                    }
                }
            });
        });
    });
}

/* timepicker event */
function timepickerEvent() {
    const target = document.querySelectorAll('.timepickerModule');

    if (target.length > 0) {
        target.forEach(t => {
            $(t).timepicker({
                timeFormat: 'H:i', // 24시간 형식 (09:00, 13:00 등)
                interval: 30,
                dynamic: false,
                dropdown: true,
                scrollbar: true,
            });
            t.value = '00:00';

            // 이미 아이콘이 있다면 중복 생성 방지
            if (!t.nextElementSibling || !t.nextElementSibling.classList.contains('ui-timepicker-trigger')) {
                const icon = document.createElement('img');
                icon.src = '/assets/img/icon/ico-timepicker-g.svg';
                icon.alt = '타임픽커 아이콘';
                icon.classList.add('ui-timepicker-trigger');

                // input 바로 뒤에 삽입
                t.insertAdjacentElement('afterend', icon);
            }
        });
    }
}

/* custom progress event */
function customProgressEvent() {
    $('.progressTest').on('click', () => {
        $.blockUI({
            message: '<div class="loading-spinner"></div>',
            css: {
                border: 'none',
                padding: '0',
                backgroundColor: 'transparent',
                '-webkit-border-radius': '0',
                '-moz-border-radius': '0',
                opacity: 1,
                color: 'transparent',
                fontSize: '0',
                width: 'auto',
                left: '50%',
                top: '50%',
                transform: 'translate(-50% , -50%)',
            },
        });

        // 2초 후 자동 해제
        setTimeout($.unblockUI, 2000);
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

// datepicker 년/월/일
$(() => {
    // 모든 datepicker에 대한 공통 옵션 설정
    $.datepicker.setDefaults({
        dateFormat: 'yy-mm-dd', // Input Display Format 변경
        showOtherMonths: true, // 빈 공간에 현재월의 앞뒤월의 날짜를 표시
        showMonthAfterYear: true, // 년도 먼저 나오고, 뒤에 월 표시
        changeYear: true, // 콤보박스에서 년 선택 가능
        changeMonth: true, // 콤보박스에서 월 선택 가능
        showOn: 'both', // button:버튼을 표시하고,버튼을 눌러야만 달력 표시 ^ both:버튼을 표시하고,버튼을 누르거나 input을 클릭하면 달력 표시
        buttonImage: '/assets/img/btn-calender.svg', // 버튼 이미지 경로
        buttonImageOnly: true, // 기본 버튼의 회색 부분을 없애고, 이미지만 보이게 함
        buttonText: '선택', // 버튼에 마우스 갖다 댔을 때 표시되는 텍스트
        yearSuffix: '년', // 달력의 년도 부분 뒤에 붙는 텍스트
        monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'], // 달력의 월 부분 텍스트
        monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'], // 달력의 월 부분 Tooltip 텍스트
        dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'], // 달력의 요일 부분 텍스트
        dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'], // 달력의 요일 부분 Tooltip 텍스트
        // minDate: '-1M', // 최소 선택일자(-1D:하루전, -1M:한달전, -1Y:일년전)
        // maxDate: '+1M', // 최대 선택일자(+1D:하루후, -1M:한달후, -1Y:일년후)
        beforeShow(input, inst) {
            const offset = $(input).offset();
            const height = $(input).height();
            window.setTimeout(() => {
                $(inst.dpDiv).css({ top: offset.top + height + 'px', left: offset.left + 'px' });
            }, 1);
        },
    });

    // datepicker 년/월
    function createMonthButtons(inst, input) {
        $(inst.dpDiv).find('.monthButtons').remove();
        const wrapButton = $('<div class="monthButtons" style="text-align:center; margin-top:5px;"></div>');
        const currentMonth = inst.drawMonth + 1;

        for (let m = 1; m <= 12; m++) {
            const btn = $('<button type="button">' + String(m).padStart(2, '0') + '월</button>');
            if (m === currentMonth) btn.addClass('active');

            btn.on('click', () => {
                const year = inst.drawYear;
                const monthStr = String(m).padStart(2, '0');
                input.val(year + '-' + monthStr);
                $(input).datepicker('setDate', new Date(year, m - 1, 1));
                createMonthButtons(inst, input);
                input.datepicker('hide');
            });
            wrapButton.append(btn);
        }
        $(inst.dpDiv).append(wrapButton);
    }

    $('.yearMonthBtn').datepicker({
        dateFormat: 'yy-mm',
        changeMonth: false,
        changeYear: true,
        showButtonPanel: false,

        onChangeMonthYear(year, month, inst) {
            setTimeout(() => {
                $(inst.dpDiv).find('.ui-datepicker-calendar').hide();
                createMonthButtons(inst, inst.input);
                inst.input.val(year + '-' + String(month).padStart(2, '0'));
            }, 1);
        },

        beforeShow(input, inst) {
            setTimeout(() => {
                $(inst.dpDiv).find('.ui-datepicker-calendar').hide();
                createMonthButtons(inst, $(input));
            }, 1);
        },
    });

    $('.yearOnlyBtn').datepicker({
        dateFormat: 'yy',
        changeMonth: false,
        changeYear: true,
        showButtonPanel: false,

        onChangeMonthYear(year, month, inst) {
            setTimeout(() => {
                $(inst.dpDiv).find('.ui-datepicker-calendar').hide();
                inst.input.val(year);
            }, 1);
        },

        beforeShow(input, inst) {
            setTimeout(() => {
                $(inst.dpDiv).find('.ui-datepicker-calendar').hide();
            }, 1);
        },

        onSelect(dateText, inst) {
            const year = inst.selectedYear;
            $(this).val(year);
            $(this).datepicker('hide');
        },
    });
});

document.addEventListener('DOMContentLoaded', () => {
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
    // datapicker 버튼 이미지
    $('.datepicker').datepicker({
        showOn: 'both',
        buttonImage: '/assets/img/btn-calender.svg',
        buttonImageOnly: true,
    });
});

// 년월일 셀렉트
$(() => {
    const $year = $('.year');
    const $month = $('.month');
    const $day = $('.day');
    const currentYear = new Date().getFullYear();

    for (let y = currentYear; y >= 1900; y--) {
        $year.append($('<option>', { value: y, text: y }));
    }

    $month.append($('<option>', { value: '', text: '월' }));
    for (let m = 1; m <= 12; m++) {
        $month.append($('<option>', { value: m, text: m }));
    }

    $day.append($('<option>', { value: '', text: '일' }));

    function fillDays(year, month) {
        const y = year || currentYear; // no-param-reassign 해결
        const m = month;

        $day.find('option[value!=""]').remove();
        if (!m) return;

        const daysInMonth = new Date(y, m, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            $day.append($('<option>', { value: d, text: d }));
        }
    }

    $year.val('');
    $month.val('');
    $day.val('');

    $year.on('change', function () {
        fillDays($(this).val(), $month.val());
        $day.val('');
    });
    $month.on('change', function () {
        fillDays($year.val(), $(this).val());
        $day.val('');
    });
});

// 인풋 자동완성 리스트
$(() => {
    const savedTexts = ['부서', '부서1', '부서2', '부서3', '부서4', '부서5', '부서6'];

    function showAutoList(value) {
        const $autoList = $('#autoList');

        if (!value) {
            $autoList.hide();
            return;
        }

        const matches = savedTexts.filter(txt => txt.includes(value));

        if (matches.length > 0) {
            let html = '';
            matches.forEach(item => {
                html += `<div class='autoItem'>${item}</div>`;
            });

            $autoList.html(html).show();

            $('.autoItem').on('click', function () {
                $('#autoInput').val($(this).text());
                $autoList.hide();
            });
        } else {
            $autoList.hide();
        }
    }

    $('#autoInput').on('input', function () {
        const val = $(this).val().trim();
        showAutoList(val);
    });
});

// 파일업로드
$(() => {
    const $fileInput = $('#fileInput');
    const $fileText = $('#fileText');
    const $fileList = $('#fileList');

    const filesState = [];

    function render() {
        $fileList.empty();

        if (filesState.length === 0) {
            $fileList.html('<div class="empty">선택된 파일이 없습니다.</div>');
            return;
        }
        $fileList.show();

        filesState.forEach((item, idx) => {
            const $wrap = $(
                `<div class="item flex jcB">
                    <div class="leftBox">
                        <i class="ico icoFile">파일아이콘</i>
                        <span class="fileName">${item.file.name}</span>
                        <a href="#none" class="ico icoUploadGray" download>업로드아이콘</a>
                    </div>
                    <button class="deleteBtn ico icoDelCircle" data-index="${idx}">삭제</button>
                </div>`,
            );

            $wrap.find('.deleteBtn').on('click', () => {
                const realIdx = $wrap.index();
                if (realIdx >= 0 && realIdx < filesState.length) {
                    filesState.splice(realIdx, 1);
                }
                if (filesState.length === 0) {
                    $fileText.val('');
                    $fileText.attr('placeholder', '파일을 선택하세요.');
                } else if (filesState.length === 1) {
                    $fileText.val(filesState[0].file.name);
                } else {
                    $fileText.val(filesState.length + '개의 파일 선택됨');
                }
                render();
            });

            $fileList.append($wrap);
        });
    }

    // 파일 추가 처리
    $fileInput.on('change', function (e) {
        const list = Array.from(e.target.files);

        list.forEach(file => {
            const exists = filesState.some(f => f.file.name === file.name && f.file.size === file.size);
            if (!exists) filesState.push({ file });
        });

        if (filesState.length === 0) {
            $fileText.val('');
            $fileText.attr('placeholder', '파일을 선택하세요.');
        } else if (filesState.length === 1) {
            $fileText.val(filesState[0].file.name);
        } else {
            $fileText.val(filesState.length + '개의 파일 선택됨');
        }

        // input 값 초기화해서 같은 파일 재선택 가능
        $(this).val('');
        render();
    });
});

$(document).ready(() => {
    const currentUrl = window.location.pathname; // 현재 페이지 경로
    $('#nav .navList li a').each(function () {
        const link = $(this).attr('href');

        // 현재 URL과 메뉴의 href가 일치하면 active 클래스 추가
        if (currentUrl === link) {
            $('#nav .navList li a').removeClass('active');
            $(this).addClass('active');
        }
    });

    // 공통페이지 footer bg제거
    $(function () {
        if ($('.myPage').length > 0) {
            $(this).find('.footerContent').attr('style', 'background:none;border:none;');
        } else {
            $(this).find('.footerContent').attr('style', '');
        }
    });

    /* global IScroll */
    if ($('.iscrollBox').length) {
        myScroll = new IScroll('.iscrollBox', {
            scrollX: true,
            scrollY: false,
            mouseWheel: true,
            scrollbars: true,
            interactiveScrollbars: true,
            fadeScrollbars: true,
            bounce: true,
            eventPassthrough: true,
        });
    }
    document.addEventListener(
        'touchmove',
        e => {
            const isInside = e.target.closest('.iscrollBox');
            if (!isInside) return; // wrapper 외부는 스크롤 허용
            e.preventDefault(); // iScroll 내부만 터치 이벤트 막기
        },
        { passive: false },
    );

    // 우편번호 주소 버튼 이벤트
    // ConfirmYn 예제
    $('.addrBox ul li button').on('click', () => {
        $.confirmYn(
            '이주소로 선택하시겠습니까?',
            '',
            () => {
                $.alert('완료되었습니다!', '', () => {
                    // 완료
                });
            },
            () => {
                $.alert('취소되었습니다!', '', () => {
                    // 취소
                });
            },
        );
    });

    // Alert 예제
    // $('.addrBox ul li button').on('click', () => {
    //     $.alert('완료되었습니다!', '', () => {

    //     });
    // });

    // Toast 예제
    // $('.addrBox ul li button').on('click', () => {
    //     $.toast('토스트는 2초후 사라지고, 긴문장은 2줄로 제한합니다.', 2000, () => {});
    // });

    $('#nav-button').on('click', function () {
        $(this).toggleClass('active');
        $('#header').toggleClass('active');

        if ($(this).hasClass('active')) {
            bodyLock();
        } else {
            bodyUnlock();
        }
    });

    // 3뎁스 클릭 시 토글
    $('.depth2 > li > a').on('click', function (e) {
        const nextUl = $(this).next('.depth3');
        if (nextUl.length) {
            e.preventDefault();
            $(this).parent().toggleClass('open');
            $(this).parent().siblings().removeClass('open');
        }
    });

    // 2뎁스 화살표
    $('.depth2 > li').each(function () {
        if ($(this).find('.depth3').length > 0) {
            $(this).addClass('arr');
        } else {
            $(this).removeClass('arr');
        }
    });

    // 1뎁스 메뉴 오버 시
    $('.navWrap > ul > li > a').on('mouseenter', function () {
        const idx = $(this).parent().index();
        const $depth2List = $('.depthWrap .depth2');

        $('.navWrap > ul > li').removeClass('active');
        $depth2List.removeClass('active');

        $(this).parent().addClass('active');
        $depth2List.eq(idx).addClass('active');
    });

    $('.navWrap')
        .on('mouseenter', e => {
            $('.navWrap').addClass('active');
        })
        .on('mouseleave', e => {
            $('.navWrap').removeClass('active');
        });

    function setActiveByIndex(idx) {
        const $depth2List = $('.depthWrap .depth2');
        const $liList = $('.navWrap > ul > li');

        $liList.removeClass('active');
        $depth2List.removeClass('active');

        $liList.eq(idx).addClass('active');
        $depth2List.eq(idx).addClass('active');
    }

    // 1뎁스 오버 시
    $('.navWrap > ul > li > a').on('mouseenter', function () {
        const idx = $(this).parent().index();
        setActiveByIndex(idx);
    });

    // 2뎁스 오버 시 → 1뎁스/2뎁스 active 이동
    $('.depthWrap .depth2').on('mouseenter', function () {
        const idx = $(this).index(); // depth2 index
        setActiveByIndex(idx);
    });

    // navWrap 바깥으로 나가면 초기화
    $('.navWrap').on('mouseleave', () => {
        $('.navWrap > ul > li').removeClass('active');
        $('.depthWrap .depth2').removeClass('active');
    });

    // user 메뉴 active
    $('.userArea button').on('click', function (e) {
        $(this).toggleClass('active');
        if ($(this).hasClass('active')) {
            $('.userMenu').fadeIn('fast');
        } else {
            $('.userMenu').fadeOut('fast');
        }
    });
    $(document).on('click', e => {
        if (window.innerWidth <= 747) {
            return;
        }
        if ($(e.target).closest('.userArea button').length === 0) {
            $('.userArea button').removeClass('active');
            $('.userMenu').fadeOut('fast');
        }
    });

    // family 메뉴 active
    $('.familyArea button').on('click', function (e) {
        $(this).toggleClass('active');
        if ($(this).hasClass('active')) {
            $('.familyMenu').fadeIn('fast');
        } else {
            $('.familyMenu').fadeOut('fast');
        }
    });
    $(document).on('click', e => {
        if (window.innerWidth <= 747) {
            return;
        }
        if ($(e.target).closest('.familyArea button').length === 0) {
            $('.familyArea button').removeClass('active');
            $('.familyMenu').fadeOut('fast');
        }
    });

    // 파일업로드
    $('#fileUpload').on('change', function () {
        const file = this.files[0];
        const $nameEl = $('#fileName');
        if (file) {
            $nameEl.text(file.name);
        } else {
            $nameEl.text('');
        }
    });

    /* 프로그레스바 컬러 */
    $('.progress-container').each(function () {
        const bar = $(this).find('.progress-bar');
        const valueElem = $(this).find('.progress-value');
        const value = parseInt(bar.data('value'), 10);
        bar.css('clip-path', 'inset(0 ' + (100 - value) + '% 0 0)');
        valueElem.text(value + '%');
    });

    // 테이블 rowspan 왼쪽 보더
    $('.tblList tr').each(function () {
        if ($(this).find('td').attr('rowspan')) {
            $(this).next('tr').find('td:first-child').css('border-left', '1px solid #ccc');
        }
    });

    // 상담히스토리 버튼
    $('.btnBox .icoArrDown').on('click', function () {
        $(this).toggleClass('active');
        const chatinner = $('.chat .innerWrap .inner');
        if ($(this).hasClass('active')) {
            $(chatinner).find('.row').eq(0).css('height', '96%');
            $(chatinner).find('.row').eq(1).css('height', '4%');
        } else {
            $(chatinner).find('.row').eq(0).css('height', '65%');
            $(chatinner).find('.row').eq(1).css('height', '35%');
        }
    });

    // 솔팅 아이콘
    $('.icoSorting').on('click', function () {
        $(this).toggleClass('active');
    });

    // 로그인 패스워드 토글 btn
    $('.toggleBtn').on('click', function () {
        const $pw = $(this).parent().find('.togglePw');
        if ($pw.attr('type') === 'password') {
            $pw.attr('type', 'text');
            $(this).text('숨기기').addClass('active');
        } else {
            $pw.attr('type', 'password');
            $(this).text('보기').removeClass('active');
        }
    });

    // 메뉴레이어
    $('.panelBtn').on('click', function () {
        $(this).parent().toggleClass('active');

        if ($(this).parent().hasClass('active')) {
            $('#nav').css('width', '200px');
            $('#contents').css('min-width', 'calc(100% - 200px)');
        } else {
            $('#nav').css('width', '');
            $('#contents').css('min-width', '');
        }
    });

    const sideBtn = document.querySelector('.btn-side');
    const closeBtn = document.querySelector('.btn-close');

    if (sideBtn) {
        sideBtn.addEventListener('click', () => {
            const userView = document.querySelector('.user-history');
            userView?.classList.add('open');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const userView = document.querySelector('.user-history');
            userView?.classList.remove('open');
        });
    }

    tabMenuEvent();
    swipeInitrEvent();
    tooltipEvent();
    moDailyCheckListEvent();
    accordionEvent();
    calendarEvent(testEvents);
    allCheckEvent();
    checkboxAccordionEvent();
    timepickerEvent();
    customProgressEvent();
});

$(() => {
    $(window).on('resize', function () {
        const width = $(this).width();
        if (width <= 1440) {
            $('.navWrap').addClass('active');
            $('.navWrap').on('mouseleave', e => {
                $('.navWrap').addClass('active');
            });
            $('.navWrap>ul>li:nth-child(1)').addClass('active');
            $('.userMenu').show();
            $('.familyMenu').show();

            const $depthWrap = $('.depthWrap');
            const $depthInner = $depthWrap.find('.inner');
            const $depth2Items = $depthInner.find('.depth2');
            const $navItems = $('.navWrap > ul > li');

            let isAnimating = false;
            let scrollTimer = null;
            const headerOffset = 0;

            // 클릭 시 (정확한 offset 계산)
            $navItems.on('click', function (e) {
                e.preventDefault();
                const index = $(this).index();
                const $target = $depth2Items.eq(index);

                if (!$target.length) return;

                // depthWrap의 현재 scrollTop + (대상 offset - depthWrap offset) - offset 보정
                const targetTop =
                    $depthWrap.scrollTop() + ($target.offset().top - $depthWrap.offset().top) - headerOffset;

                isAnimating = true;
                $depthWrap.stop().animate({ scrollTop: targetTop }, 400, () => {
                    isAnimating = false;
                    // 강제로 active 동기화
                    $navItems.removeClass('active').eq(index).addClass('active');
                });
            });

            // 스크롤 시 active 변경
            $depthWrap.on('scroll', () => {
                if (isAnimating) return;

                if (scrollTimer) clearTimeout(scrollTimer);
                scrollTimer = setTimeout(() => {
                    const wrapTop = $depthWrap.offset().top;

                    let currentIndex = 0;
                    let minDiff = Infinity;

                    $depth2Items.each(function (i) {
                        const $title = $(this).find('.depth1-mobile').first();
                        if (!$title.length) return;

                        // h3가 문서 기준에서 어느 위치인지
                        const titleTop = $title.offset().top;

                        // depthWrap 상단과의 거리 차이
                        const diff = Math.abs(titleTop - wrapTop);

                        // 가장 가까운 것을 선택
                        if (diff < minDiff) {
                            minDiff = diff;
                            currentIndex = i;
                        }
                    });

                    $navItems.removeClass('active').eq(currentIndex).addClass('active');
                }, 40);
            });
        } else {
            $('.navWrap').removeClass('active');
            $('.navWrap').on('mouseleave', e => {
                $('.navWrap').removeClass('active');
            });
            $('.navWrap>ul>li:nth-child(1)').removeClass('active');
            $('.userMenu').hide();
            $('.familyMenu').hide();
            bodyUnlock();
        }
    });
    $(window).trigger('resize');
});

window.addEventListener('load', () => {});

window.addEventListener('resize', () => {
    syncHeight();
});

window.addEventListener('scroll', () => {});
