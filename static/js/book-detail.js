// 书籍详情页特有功能

// 页面状态
let bookDetailState = {
    bookId: null,
    book: null,
    currentSort: 'asc',
    searchQuery: '',
    readingProgress: null
};

/**
 * 初始化书籍详情页
 */
function initBookDetailPage() {
    console.log('🚀 初始化书籍详情页...');

    // 检查访问权限
    if (!checkPageAccess()) return;

    // 获取书籍ID
    bookDetailState.bookId = router.getUrlParam('id');
    if (!bookDetailState.bookId) {
        utils.showNotification('无效的书籍ID', false);
        setTimeout(() => router.redirectToHome(), 2000);
        return;
    }

    // 加载书籍数据
    loadBookData();

    // 初始化页面组件
    initNavigation();
    initEventListeners();

    console.log('✅ 书籍详情页初始化完成');
}

/**
 * 加载书籍数据
 */
async function loadBookData() {
    try {
        // 使用API管理器获取书籍详情
        // 后端接口：/api/book/<bookId>
        const response = await apiManager.book.detail(bookDetailState.bookId);

        if (response.success) {
            bookDetailState.book = response.data;
            renderBookDetail();
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
 * 渲染书籍详情
 */
function renderBookDetail() {
    if (!bookDetailState.book) return;

    const book = bookDetailState.book;

    // 更新页面标题
    document.title = `${book.title} - FlutterPage`;

    // 更新书籍基本信息
    document.getElementById('detailBookTitle').textContent = book.title;
    document.getElementById('detailBookAuthor').textContent = `作者：${book.author}`;
    document.getElementById('detailWordCount').textContent = book.wordCount;
    document.getElementById('detailChapterCount').textContent = book.chapterCount;
    document.getElementById('detailViewCount').textContent = book.views;
    document.getElementById('detailRating').textContent = book.rating;
    document.getElementById('detailBookDescription').innerHTML = book.description;

    // 更新状态徽章
    document.getElementById('bookStatusBadge').textContent = book.status;

    // 渲染书籍标签
    renderBookTags(book.tags);

    // 更新作者信息
    renderAuthorInfo(book.author);

    // 渲染章节列表
    renderChaptersList(book.chapters);

    // 更新操作按钮链接
    document.getElementById('startReadingBtn').href = `chapter-reading.html?bookId=${book.id}&chapterId=1`;
    document.getElementById('viewCommentsBtn').href = `comments-section.html?bookId=${book.id}`;
}

/**
 * 渲染书籍标签
 * @param {Array} tags - 标签数组
 */
function renderBookTags(tags) {
    const tagsContainer = document.getElementById('bookTags');
    tagsContainer.innerHTML = '';

    tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'book-tag';
        tagElement.textContent = tag;
        tagElement.addEventListener('click', () => {
            window.location.href = `search.html?q=${encodeURIComponent(tag)}&scope=tag`;
        });
        tagsContainer.appendChild(tagElement);
    });
}

/**
 * 渲染作者信息
 * @param {string} authorName - 作者名称
 */
function renderAuthorInfo(authorName) {
    // 从API获取作者详细信息
    // 后端接口：/api/author/<authorName>
    document.getElementById('authorAvatar').textContent = authorName.charAt(0);
    document.getElementById('authorName').textContent = authorName;

    // 从API获取作者数据
    loadAuthorData(authorName);
}

/**
 * 加载作者数据
 * @param {string} authorName - 作者名称
 */
async function loadAuthorData(authorName) {
    try {
        // 后端接口：/api/author/<authorName>
        const response = await apiManager.author.detail(authorName);

        if (response.success) {
            const authorData = response.data;
            document.getElementById('authorWorksCount').textContent = authorData.worksCount;
            document.getElementById('authorFansCount').textContent = authorData.fansCount;
            document.getElementById('authorRating').textContent = authorData.rating;
            document.getElementById('authorBio').textContent = authorData.bio;
        }
    } catch (error) {
        console.error('加载作者数据失败:', error);
        // 使用默认数据
        const defaultAuthorData = {
            worksCount: 3,
            fansCount: '12.5万',
            rating: '8.7',
            bio: '资深网络文学作家，擅长构建宏大的世界观和细腻的人物刻画。作品深受读者喜爱，在多个平台拥有大量忠实粉丝。'
        };

        document.getElementById('authorWorksCount').textContent = defaultAuthorData.worksCount;
        document.getElementById('authorFansCount').textContent = defaultAuthorData.fansCount;
        document.getElementById('authorRating').textContent = defaultAuthorData.rating;
        document.getElementById('authorBio').textContent = defaultAuthorData.bio;
    }
}

/**
 * 渲染章节列表
 * @param {Array} chapters - 章节列表
 */
function renderChaptersList(chapters) {
    const chaptersList = document.getElementById('chaptersList');
    chaptersList.innerHTML = '';

    if (!chapters || chapters.length === 0) {
        chaptersList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-book-open"></i>
                </div>
                <h3 class="empty-state-title">暂无章节内容</h3>
                <p class="empty-state-description">作者正在努力创作中，敬请期待</p>
            </div>
        `;
        return;
    }

    // 应用排序
    let sortedChapters = [...chapters];
    if (bookDetailState.currentSort === 'desc') {
        sortedChapters.reverse();
    }

    // 应用搜索过滤
    if (bookDetailState.searchQuery) {
        const query = bookDetailState.searchQuery.toLowerCase();
        sortedChapters = sortedChapters.filter(chapter =>
            chapter.title.toLowerCase().includes(query)
        );
    }

    // 渲染章节
    sortedChapters.forEach(chapter => {
        const chapterItem = document.createElement('div');
        chapterItem.className = 'chapter-item';
        chapterItem.innerHTML = `
            <div class="chapter-info">
                <div class="chapter-title">${chapter.title}</div>
                <div class="chapter-meta">
                    <span><i class="far fa-calendar"></i> ${chapter.date}</span>
                    <span><i class="fas fa-font"></i> ${chapter.wordCount ? chapter.wordCount + '字' : '未知字数'}</span>
                </div>
            </div>
            <div class="chapter-action">
                <button class="btn btn-sm btn-primary read-chapter-btn" data-chapter-id="${chapter.id}">
                    <i class="fas fa-play"></i> 阅读
                </button>
            </div>
        `;

        // 阅读按钮事件
        const readBtn = chapterItem.querySelector('.read-chapter-btn');
        readBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            readChapter(chapter.id);
        });

        // 整个章节项点击事件
        chapterItem.addEventListener('click', () => {
            readChapter(chapter.id);
        });

        chaptersList.appendChild(chapterItem);
    });
}

/**
 * 加载阅读进度
 */
async function loadReadingProgress() {
    const user = userManager.getCurrentUser();
    if (!user) return;

    try {
        // 后端接口：/api/user/reading-progress/<bookId>
        const response = await apiManager.user.getReadingProgress(bookDetailState.bookId);

        if (response.success) {
            bookDetailState.readingProgress = response.data;

            if (bookDetailState.readingProgress) {
                const progressElement = document.getElementById('readingProgress');
                const progressFill = document.getElementById('progressFillLarge');
                const progressPercentage = document.getElementById('progressPercentage');

                progressElement.style.display = 'block';
                progressFill.style.width = bookDetailState.readingProgress.progress + '%';
                progressPercentage.textContent = Math.round(bookDetailState.readingProgress.progress) + '%';

                // 更新开始阅读按钮为继续阅读
                const startReadingBtn = document.getElementById('startReadingBtn');
                startReadingBtn.innerHTML = '<i class="fas fa-play"></i> 继续阅读';
                startReadingBtn.href = `chapter-reading.html?bookId=${bookDetailState.bookId}&chapterId=${bookDetailState.readingProgress.chapterId}`;
            }
        }
    } catch (error) {
        console.error('加载阅读进度失败:', error);
    }
}

/**
 * 初始化导航功能
 */
function initNavigation() {
    // 我的书库链接
    document.getElementById('myBooksLink').addEventListener('click', function(e) {
        e.preventDefault();
        utils.showNotification('我的书库功能开发中', true);
    });

    // 导航搜索框
    const navSearchInput = document.getElementById('navSearchInput');
    if (navSearchInput) {
        navSearchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = this.value.trim();
                if (query) {
                    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
                }
            }
        });
    }

    // 退出登录
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

/**
 * 初始化事件监听器
 */
function initEventListeners() {
    // 关注作者按钮
    const followAuthorBtns = document.querySelectorAll('#followAuthorBtn, #followAuthorBtnLarge');
    followAuthorBtns.forEach(btn => {
        btn.addEventListener('click', handleFollowAuthor);
    });

    // 收藏按钮
    document.getElementById('addToCollectionBtn').addEventListener('click', handleAddToCollection);

    // 章节搜索
    const chaptersSearch = document.getElementById('chaptersSearch');
    if (chaptersSearch) {
        chaptersSearch.addEventListener('input', utils.debounce(function() {
            bookDetailState.searchQuery = this.value.trim();
            renderChaptersList(bookDetailState.book.chapters);
        }, 300));
    }

    // 章节排序
    const chaptersSort = document.getElementById('chaptersSort');
    if (chaptersSort) {
        chaptersSort.addEventListener('change', function() {
            bookDetailState.currentSort = this.value;
            renderChaptersList(bookDetailState.book.chapters);
        });
    }
}

/**
 * 处理关注作者
 */
async function handleFollowAuthor() {
    const user = userManager.getCurrentUser();
    if (!user) {
        utils.showNotification('请先登录', false);
        return;
    }

    try {
        // 后端接口：/api/user/follow-author
        const response = await apiManager.user.followAuthor(bookDetailState.book.author);

        if (response.success) {
            utils.showNotification(`已关注作者：${bookDetailState.book.author}`);

            // 更新按钮状态
            const followBtns = document.querySelectorAll('#followAuthorBtn, #followAuthorBtnLarge');
            followBtns.forEach(btn => {
                btn.innerHTML = '<i class="fas fa-check"></i> 已关注';
                btn.disabled = true;
            });
        } else {
            utils.showNotification('关注作者失败', false);
        }
    } catch (error) {
        console.error('关注作者失败:', error);
        utils.showNotification('关注作者失败', false);
    }
}

/**
 * 处理加入收藏
 */
async function handleAddToCollection() {
    const user = userManager.getCurrentUser();
    if (!user) {
        utils.showNotification('请先登录', false);
        return;
    }

    try {
        // 后端接口：/api/user/add-to-collection
        const response = await apiManager.user.addToCollection(bookDetailState.bookId);

        if (response.success) {
            utils.showNotification(`《${bookDetailState.book.title}》已加入收藏`);

            // 更新按钮状态
            const collectionBtn = document.getElementById('addToCollectionBtn');
            collectionBtn.innerHTML = '<i class="fas fa-check"></i> 已收藏';
            collectionBtn.disabled = true;
        } else {
            utils.showNotification('加入收藏失败', false);
        }
    } catch (error) {
        console.error('加入收藏失败:', error);
        utils.showNotification('加入收藏失败', false);
    }
}

/**
 * 阅读章节
 * @param {number} chapterId - 章节ID
 */
function readChapter(chapterId) {
    // 记录阅读进度到后端
    recordReadingProgress(chapterId);
    router.goToReadingPage(bookDetailState.bookId, chapterId);
}

/**
 * 记录阅读进度
 * @param {number} chapterId - 章节ID
 */
async function recordReadingProgress(chapterId) {
    const user = userManager.getCurrentUser();
    if (!user) return;

    try {
        // 后端接口：/api/user/record-reading-progress
        await apiManager.user.recordReadingProgress(bookDetailState.bookId, chapterId);
    } catch (error) {
        console.error('记录阅读进度失败:', error);
    }
}

// 页面特定初始化函数，供common.js调用
window.initPage = function() {
    console.log('📄 书籍详情页初始化完成');
    initBookDetailPage();
};