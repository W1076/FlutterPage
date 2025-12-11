// ==================== 章节阅读页特有功能 ====================

// 页面状态管理
let readingState = {
    bookId: null,
    chapterId: null,
    book: null,
    chapter: null,
    chapters: [],
    fontSize: 16,
    theme: 'light',
    isFullscreen: false,
    currentProgress: 0
};

/**
 * 初始化章节阅读页
 */
function initChapterReadingPage() {
    console.log('🚀 初始化章节阅读页...');

    // 检查访问权限
    if (!checkPageAccess()) return;

    // 获取URL参数
    readingState.bookId = router.getUrlParam('bookId');
    readingState.chapterId = parseInt(router.getUrlParam('chapterId')) || 1;

    if (!readingState.bookId) {
        utils.showNotification('无效的书籍ID', false);
        setTimeout(() => router.redirectToHome(), 2000);
        return;
    }

    // 加载书籍数据
    loadBookData();

    // 初始化页面组件
    initNavigation();
    initReadingControls();
    initChapterNavigation();
    initEventListeners();

    console.log('✅ 章节阅读页初始化完成');
}

/**
 * 加载书籍数据
 */
async function loadBookData() {
    try {
        // 使用API管理器获取书籍详情
        const response = await apiManager.book.detail(readingState.bookId);

        if (response.success) {
            readingState.book = response.data;
            readingState.chapters = readingState.book.chapters || [];

            // 更新页面信息
            updatePageInfo();

            // 加载章节内容
            loadChapterContent();

            // 渲染章节列表
            renderChaptersList();

            // 加载阅读进度
            loadReadingProgress();
        } else {
            utils.showNotification('书籍不存在', false);
            setTimeout(() => router.redirectToHome(), 2000);
        }
    } catch (error) {
        console.error('加载书籍数据失败:', error);
        utils.showNotification('加载书籍信息失败', false);
    }
}

/**
 * 更新页面信息
 */
function updatePageInfo() {
    if (!readingState.book) return;

    // 更新页面标题
    document.title = `${readingState.book.title} - 第${readingState.chapterId}章 - FlutterPage`;

    // 更新书籍和章节标题
    document.getElementById('bookTitle').textContent = readingState.book.title;

    // 更新返回链接
    document.getElementById('backToBook').href = `book-detail.html?id=${readingState.bookId}`;
    document.getElementById('currentBookLink').href = `book-detail.html?id=${readingState.bookId}`;
}

/**
 * 加载章节内容
 */
async function loadChapterContent() {
    try {
        // 使用API管理器获取章节内容
        const response = await apiManager.chapter.getContent(readingState.bookId, readingState.chapterId);

        if (response.success) {
            readingState.chapter = response.data;
            renderChapterContent();
            updateChapterNavigation();
        } else {
            utils.showNotification('章节不存在', false);
            // 尝试加载第一章
            if (readingState.chapterId !== 1) {
                readingState.chapterId = 1;
                loadChapterContent();
            }
        }
    } catch (error) {
        console.error('加载章节内容失败:', error);
        utils.showNotification('加载章节内容失败', false);
    }
}

/**
 * 渲染章节内容
 */
function renderChapterContent() {
    const contentContainer = document.getElementById('readingContent');

    if (!readingState.chapter) {
        contentContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-book-open"></i>
                </div>
                <h3 class="empty-state-title">章节内容为空</h3>
                <p class="empty-state-description">作者正在努力创作中</p>
            </div>
        `;
        return;
    }

    // 更新章节标题
    document.getElementById('chapterTitle').textContent = readingState.chapter.title;

    // 渲染内容
    contentContainer.innerHTML = readingState.chapter.content || `
        <div class="content-placeholder">
            <p>本章节内容暂未发布，敬请期待...</p>
        </div>
    `;

    // 应用当前字体大小和主题
    applyReadingSettings();

    // 开始跟踪阅读进度
    startProgressTracking();
}

/**
 * 渲染章节列表
 */
function renderChaptersList() {
    const chaptersList = document.getElementById('sidebarChaptersList');

    if (!readingState.chapters || readingState.chapters.length === 0) {
        chaptersList.innerHTML = `
            <div class="empty-state">
                <p>暂无章节</p>
            </div>
        `;
        return;
    }

    chaptersList.innerHTML = '';

    readingState.chapters.forEach(chapter => {
        const chapterItem = document.createElement('div');
        chapterItem.className = 'chapter-sidebar-item';
        if (chapter.id === readingState.chapterId) {
            chapterItem.classList.add('active');
        }

        chapterItem.innerHTML = `
            <div class="chapter-title">${chapter.title}</div>
            <div class="chapter-meta">
                <span>${chapter.date} • ${chapter.wordCount || 0}字</span>
            </div>
        `;

        chapterItem.addEventListener('click', () => {
            switchToChapter(chapter.id);
            closeSidebar();
        });

        chaptersList.appendChild(chapterItem);
    });
}

/**
 * 初始化导航功能
 */
function initNavigation() {
    // 退出登录
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

/**
 * 初始化阅读控制
 */
function initReadingControls() {
    // 字体大小控制
    document.getElementById('fontSizeUp').addEventListener('click', increaseFontSize);
    document.getElementById('fontSizeDown').addEventListener('click', decreaseFontSize);

    // 主题切换
    document.getElementById('themeLight').addEventListener('click', () => switchTheme('light'));
    document.getElementById('themeDark').addEventListener('click', () => switchTheme('dark'));
    document.getElementById('themeSepia').addEventListener('click', () => switchTheme('sepia'));

    // 全屏控制
    document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);

    // 监听全屏变化
    document.addEventListener('fullscreenchange', handleFullscreenChange);
}

/**
 * 初始化章节导航
 */
function initChapterNavigation() {
    // 章节列表侧边栏
    document.getElementById('chapterListBtn').addEventListener('click', openSidebar);
    document.getElementById('chapterListBtnBottom').addEventListener('click', openSidebar);
    document.getElementById('closeSidebar').addEventListener('click', closeSidebar);
    document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);

    // 上一章/下一章
    document.getElementById('prevChapter').addEventListener('click', goToPrevChapter);
    document.getElementById('prevChapterBottom').addEventListener('click', goToPrevChapter);
    document.getElementById('nextChapter').addEventListener('click', goToNextChapter);
    document.getElementById('nextChapterBottom').addEventListener('click', goToNextChapter);
}

/**
 * 初始化事件监听器
 */
function initEventListeners() {
    // 键盘快捷键
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // 滚动进度跟踪
    window.addEventListener('scroll', utils.throttle(updateReadingProgress, 100));
}

/**
 * 增大字体
 */
function increaseFontSize() {
    if (readingState.fontSize < 24) {
        readingState.fontSize += 2;
        updateFontSize();
    }
}

/**
 * 减小字体
 */
function decreaseFontSize() {
    if (readingState.fontSize > 12) {
        readingState.fontSize -= 2;
        updateFontSize();
    }
}

/**
 * 更新字体大小
 */
function updateFontSize() {
    document.getElementById('fontSizeDisplay').textContent = readingState.fontSize + 'px';
    applyReadingSettings();

    // 保存用户偏好到后端
    if (userManager.getCurrentUser()) {
        // 预留后端接口调用
        // apiManager.user.updatePreferences({ fontSize: readingState.fontSize });
    }
}

/**
 * 切换主题
 */
function switchTheme(theme) {
    readingState.theme = theme;

    // 更新按钮状态
    document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`theme${theme.charAt(0).toUpperCase() + theme.slice(1)}`).classList.add('active');

    applyReadingSettings();

    // 保存用户偏好到后端
    if (userManager.getCurrentUser()) {
        // 预留后端接口调用
        // apiManager.user.updatePreferences({ theme: theme });
    }
}

/**
 * 应用阅读设置
 */
function applyReadingSettings() {
    const content = document.getElementById('readingContent');

    // 应用字体大小
    content.style.fontSize = readingState.fontSize + 'px';

    // 应用主题 - 移除所有主题类，然后添加当前主题
    content.className = 'reading-content';
    content.classList.add(readingState.theme + '-theme');
}

/**
 * 切换全屏
 */
function toggleFullscreen() {
    if (!readingState.isFullscreen) {
        enterFullscreen();
    } else {
        exitFullscreen();
    }
}

/**
 * 进入全屏
 */
function enterFullscreen() {
    const container = document.getElementById('readingContainer');

    if (container.requestFullscreen) {
        container.requestFullscreen();
    } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
    } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
    }
}

/**
 * 退出全屏
 */
function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

/**
 * 处理全屏变化
 */
function handleFullscreenChange() {
    readingState.isFullscreen = !readingState.isFullscreen;
    document.getElementById('readingContainer').classList.toggle('fullscreen', readingState.isFullscreen);

    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (readingState.isFullscreen) {
        fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
        fullscreenBtn.title = '退出全屏';
    } else {
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        fullscreenBtn.title = '全屏阅读';
    }
}

/**
 * 打开侧边栏
 */
function openSidebar() {
    document.getElementById('chaptersSidebar').classList.add('active');
    document.getElementById('sidebarOverlay').classList.add('active');
}

/**
 * 关闭侧边栏
 */
function closeSidebar() {
    document.getElementById('chaptersSidebar').classList.remove('active');
    document.getElementById('sidebarOverlay').classList.remove('active');
}

/**
 * 切换到指定章节
 */
function switchToChapter(chapterId) {
    if (chapterId === readingState.chapterId) return;

    readingState.chapterId = chapterId;
    loadChapterContent();

    // 更新URL但不刷新页面
    const newUrl = `chapter-reading.html?bookId=${readingState.bookId}&chapterId=${chapterId}`;
    window.history.pushState({}, '', newUrl);
}

/**
 * 更新章节导航状态
 */
function updateChapterNavigation() {
    const currentIndex = readingState.chapters.findIndex(ch => ch.id === readingState.chapterId);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < readingState.chapters.length - 1;

    // 更新按钮状态
    document.getElementById('prevChapter').disabled = !hasPrev;
    document.getElementById('prevChapterBottom').disabled = !hasPrev;
    document.getElementById('nextChapter').disabled = !hasNext;
    document.getElementById('nextChapterBottom').disabled = !hasNext;
}

/**
 * 前往上一章
 */
function goToPrevChapter() {
    const currentIndex = readingState.chapters.findIndex(ch => ch.id === readingState.chapterId);
    if (currentIndex > 0) {
        const prevChapter = readingState.chapters[currentIndex - 1];
        switchToChapter(prevChapter.id);
    }
}

/**
 * 前往下一章
 */
function goToNextChapter() {
    const currentIndex = readingState.chapters.findIndex(ch => ch.id === readingState.chapterId);
    if (currentIndex < readingState.chapters.length - 1) {
        const nextChapter = readingState.chapters[currentIndex + 1];
        switchToChapter(nextChapter.id);
    }
}

/**
 * 开始跟踪阅读进度
 */
function startProgressTracking() {
    readingState.currentProgress = 0;
    updateProgressDisplay();
}

/**
 * 更新阅读进度
 */
function updateReadingProgress() {
    const content = document.getElementById('readingContent');
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = content.scrollHeight || document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight || document.documentElement.clientHeight;

    const progress = Math.min(100, Math.max(0, (scrollTop / (scrollHeight - clientHeight)) * 100));

    if (progress > readingState.currentProgress) {
        readingState.currentProgress = progress;
        updateProgressDisplay();

        // 保存阅读进度到后端
        if (userManager.getCurrentUser() && progress > 10) { // 至少阅读10%才保存
            // 预留后端接口调用
            // apiManager.reading.saveProgress(readingState.bookId, readingState.chapterId, progress);
        }
    }
}

/**
 * 更新进度显示
 */
function updateProgressDisplay() {
    document.getElementById('progressFill').style.width = readingState.currentProgress + '%';
    document.getElementById('progressText').textContent = Math.round(readingState.currentProgress) + '%';
}

/**
 * 加载阅读进度
 */
function loadReadingProgress() {
    const user = userManager.getCurrentUser();
    if (!user) return;

    // 预留从后端获取阅读进度的接口调用
    // const progress = await apiManager.reading.getProgress(readingState.bookId);
    // if (progress && progress.chapterId === readingState.chapterId) {
    //     readingState.currentProgress = progress.progress;
    //     updateProgressDisplay();
    // }
}

/**
 * 处理键盘快捷键
 */
function handleKeyboardShortcuts(e) {
    // 防止在输入框中触发
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch(e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            goToPrevChapter();
            break;
        case 'ArrowRight':
            e.preventDefault();
            goToNextChapter();
            break;
        case 'Escape':
            if (readingState.isFullscreen) {
                exitFullscreen();
            } else {
                closeSidebar();
            }
            break;
        case ' ':
            e.preventDefault();
            // 空格键翻页
            if (e.shiftKey) {
                goToPrevChapter();
            } else {
                goToNextChapter();
            }
            break;
    }
}

/**
 * 加载用户偏好设置
 */
function loadUserPreferences() {
    const user = userManager.getCurrentUser();
    if (user && user.preferences) {
        if (user.preferences.fontSize) {
            readingState.fontSize = user.preferences.fontSize;
        }
        if (user.preferences.theme) {
            readingState.theme = user.preferences.theme;
        }

        updateFontSize();
        switchTheme(readingState.theme);
    }
}

// 页面特定初始化函数，供common.js调用
window.initPage = function() {
    console.log('📄 章节阅读页初始化完成');
    loadUserPreferences();
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initChapterReadingPage();
});