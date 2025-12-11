/**
 * FlutterPage - 首页JavaScript文件
 * 负责首页特有功能和交互
 */

// 首页功能模块
const homePage = {
    /**
     * 初始化首页
     */
    init: function() {
        console.log('🚀 初始化首页...');

        // 检查访问权限
        if (!checkPageAccess()) return;

        // 初始化页面组件
        this.initWelcomeSection();
        this.initQuickNavigation();
        this.initReadingProgress();
        this.initBookSections();
        this.initEventListeners();

        console.log('✅ 首页初始化完成');
    },

    /**
     * 初始化欢迎区域
     */
    initWelcomeSection: function() {
        const user = userManager.getCurrentUser();
        if (user) {
            document.getElementById('welcomeUsername').textContent = user.username;
        }
    },

    /**
     * 初始化快速导航
     */
    initQuickNavigation: function() {
        // 随机推荐功能
        document.getElementById('randomBookLink').addEventListener('click', function(e) {
            e.preventDefault();
            homePage.showRandomBook();
        });

        // 作者榜单功能
        document.getElementById('authorListLink').addEventListener('click', function(e) {
            e.preventDefault();
            utils.showNotification('作者榜单功能开发中', true);
        });
    },

    /**
     * 初始化阅读进度
     */
    initReadingProgress: function() {
        const user = userManager.getCurrentUser();
        if (!user || !user.preferences || !user.preferences.readingProgress) {
            return; // 没有阅读进度数据
        }

        const progressData = user.preferences.readingProgress;
        const progressBooks = Object.keys(progressData)
            .map(bookId => {
                const book = bookManager.getBookById(bookId);
                if (!book) return null;

                const progress = progressData[bookId];
                const chapter = book.chapters.find(ch => ch.id === progress.chapterId);

                return {
                    book: book,
                    progress: progress,
                    chapter: chapter
                };
            })
            .filter(item => item !== null)
            .slice(0, 4); // 最多显示4本

        if (progressBooks.length === 0) return;

        // 显示阅读进度区域
        document.getElementById('readingProgressSection').style.display = 'block';

        // 渲染阅读进度书籍
        this.renderProgressBooks(progressBooks);

        // 查看全部进度
        document.getElementById('viewAllProgress').addEventListener('click', function(e) {
            e.preventDefault();
            utils.showNotification('阅读历史功能开发中', true);
        });
    },

    /**
     * 渲染阅读进度书籍
     * @param {Array} progressBooks - 阅读进度数据
     */
    renderProgressBooks: function(progressBooks) {
        const progressBooksList = document.getElementById('progressBooksList');
        progressBooksList.innerHTML = '';

        progressBooks.forEach(item => {
            const progressElement = document.createElement('div');
            progressElement.className = 'progress-book-item';
            progressElement.innerHTML = `
                <div class="progress-book-cover">
                    <i class="fas fa-book"></i>
                </div>
                <div class="progress-book-info">
                    <div class="progress-book-title">${item.book.title}</div>
                    <div class="progress-book-chapter">${item.chapter ? item.chapter.title : '未知章节'}</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${item.progress.progress}%"></div>
                    </div>
                </div>
            `;

            progressElement.addEventListener('click', () => {
                router.goToReadingPage(item.book.id, item.progress.chapterId);
            });

            progressBooksList.appendChild(progressElement);
        });
    },

    /**
     * 初始化书籍区域
     */
    initBookSections: function() {
        // 渲染热门推荐
        this.renderHotBooks();

        // 渲染新书榜单
        this.renderNewBooks();

        // 渲染热门作者
        this.renderPopularAuthors();

        // 渲染推荐书籍
        this.renderRecommendedBooks();
    },

    /**
     * 渲染热门推荐书籍
     */
    renderHotBooks: function() {
        const hotBooks = bookManager.getHotBooks(8);
        const hotBooksGrid = document.getElementById('hotBooksGrid');

        if (hotBooks.length === 0) {
            hotBooksGrid.innerHTML = '<div class="empty-state">暂无热门书籍</div>';
            return;
        }

        hotBooksGrid.innerHTML = '';
        hotBooks.forEach(book => {
            const bookCard = this.createBookCard(book);
            hotBooksGrid.appendChild(bookCard);
        });
    },

    /**
     * 渲染新书榜单
     */
    renderNewBooks: function() {
        const newBooks = bookManager.getNewBooks(8);
        const newBooksGrid = document.getElementById('newBooksGrid');

        if (newBooks.length === 0) {
            newBooksGrid.innerHTML = '<div class="empty-state">暂无新书</div>';
            return;
        }

        newBooksGrid.innerHTML = '';
        newBooks.forEach(book => {
            const bookCard = this.createBookCard(book);
            newBooksGrid.appendChild(bookCard);
        });
    },

    /**
     * 渲染热门作者
     */
    renderPopularAuthors: function() {
        const authors = [
            { name: '云梦泽', books: '星穹传说系列', avatar: '云' },
            { name: '幻雨', books: '灵域迷踪', avatar: '幻' },
            { name: '青衫客', books: '剑影仙途', avatar: '青' },
            { name: '代码行者', books: '数据觉醒', avatar: '代' },
            { name: '谜案追踪者', books: '时光侦探社', avatar: '谜' }
        ];

        const authorsRow = document.getElementById('authorsRow');
        authorsRow.innerHTML = '';

        authors.forEach(author => {
            const authorCard = document.createElement('div');
            authorCard.className = 'author-card';
            authorCard.innerHTML = `
                <div class="author-avatar">${author.avatar}</div>
                <div class="author-name">${author.name}</div>
                <div class="author-books">${author.books}</div>
            `;

            authorCard.addEventListener('click', () => {
                utils.showNotification(`查看${author.name}的作品`, true);
                // 后续可跳转到作者详情页
            });

            authorsRow.appendChild(authorCard);
        });

        // 查看全部作者
        document.getElementById('viewAllAuthors').addEventListener('click', function(e) {
            e.preventDefault();
            utils.showNotification('作者列表功能开发中', true);
        });
    },

    /**
     * 渲染推荐书籍
     */
    renderRecommendedBooks: function() {
        // 简单实现：随机选择4本书作为推荐
        const allBooks = bookManager.getAllBooks();
        const shuffled = [...allBooks].sort(() => 0.5 - Math.random());
        const recommendedBooks = shuffled.slice(0, 4);

        const recommendedGrid = document.getElementById('recommendedBooksGrid');

        if (recommendedBooks.length === 0) {
            recommendedGrid.innerHTML = '<div class="empty-state">暂无推荐书籍</div>';
            return;
        }

        recommendedGrid.innerHTML = '';
        recommendedBooks.forEach(book => {
            const bookCard = this.createBookCard(book);
            recommendedGrid.appendChild(bookCard);
        });

        // 换一换功能
        document.getElementById('refreshRecommendations').addEventListener('click', function(e) {
            e.preventDefault();
            homePage.renderRecommendedBooks();
            utils.showNotification('已更新推荐', true);
        });
    },

    /**
     * 创建书籍卡片
     * @param {Object} book - 书籍数据
     * @returns {HTMLElement} 书籍卡片元素
     */
    createBookCard: function(book) {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.dataset.id = book.id;

        bookCard.innerHTML = `
            <div class="book-cover">
                <i class="fas fa-book"></i>
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">作者：${book.author}</p>
                <div class="book-stats">
                    <span><i class="fas fa-eye"></i> ${book.views}</span>
                    <span><i class="fas fa-bookmark"></i> ${book.rating}</span>
                </div>
            </div>
        `;

        bookCard.addEventListener('click', () => {
            router.goToBookDetail(book.id);
        });

        return bookCard;
    },

    /**
     * 初始化事件监听器
     */
    initEventListeners: function() {
        // 继续阅读按钮
        document.getElementById('continueReadingBtn').addEventListener('click', this.handleContinueReading);

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
    },

    /**
     * 处理继续阅读
     */
    handleContinueReading: function() {
        const user = userManager.getCurrentUser();
        if (!user || !user.preferences || !user.preferences.readingProgress) {
            utils.showNotification('您还没有阅读记录', false);
            return;
        }

        const progressData = user.preferences.readingProgress;
        const bookIds = Object.keys(progressData);

        if (bookIds.length === 0) {
            utils.showNotification('您还没有阅读记录', false);
            return;
        }

        // 获取最近阅读的书籍
        const latestBookId = bookIds.reduce((latestId, currentId) => {
            const latestTime = progressData[latestId]?.timestamp || 0;
            const currentTime = progressData[currentId]?.timestamp || 0;
            return currentTime > latestTime ? currentId : latestId;
        }, bookIds[0]);

        const latestProgress = progressData[latestBookId];
        const book = bookManager.getBookById(latestBookId);

        if (book && latestProgress) {
            router.goToReadingPage(book.id, latestProgress.chapterId);
        } else {
            utils.showNotification('无法找到阅读记录', false);
        }
    },

    /**
     * 显示随机书籍
     */
    showRandomBook: function() {
        const books = bookManager.getAllBooks();
        if (books.length === 0) {
            utils.showNotification('暂无书籍数据', false);
            return;
        }

        const randomBook = books[Math.floor(Math.random() * books.length)];
        utils.showNotification(`随机推荐: ${randomBook.title}`, true);

        // 2秒后跳转到书籍详情
        setTimeout(() => {
            router.goToBookDetail(randomBook.id);
        }, 2000);
    }
};

// ==================== 后端需要实现的功能统计 ====================

/**
 * 首页需要后端实现的功能列表：
 *
 * 1. 用户相关功能：
 *    - 用户登录状态验证 (GET /api/auth/check)
 *    - 用户偏好设置获取 (GET /api/user/preferences)
 *    - 用户阅读进度同步 (GET/POST /api/reading/progress)
 *
 * 2. 书籍数据相关：
 *    - 热门推荐书籍数据 (GET /api/books/hot)
 *    - 新书榜单数据 (GET /api/books/new)
 *    - 个性化推荐算法 (GET /api/books/recommended)
 *    - 随机推荐书籍 (GET /api/books/random)
 *
 * 3. 作者相关：
 *    - 热门作者榜单 (GET /api/authors/popular)
 *    - 作者作品列表 (GET /api/authors/{id}/books)
 *
 * 4. 阅读记录：
 *    - 用户阅读历史 (GET /api/reading/history)
 *    - 最近阅读记录 (GET /api/reading/recent)
 *    - 阅读进度同步 (POST /api/reading/progress)
 *
 * 5. 其他功能：
 *    - 搜索功能 (GET /api/search)
 *    - 分类浏览 (GET /api/categories)
 *    - 我的书库 (GET /api/user/bookshelf)
 */

// ==================== 页面加载初始化 ====================

// 当DOM加载完成时初始化首页
document.addEventListener('DOMContentLoaded', function() {
    homePage.init();
});

// 页面特定初始化函数，供common.js调用
window.initPage = function() {
    console.log('📄 首页初始化完成');
};

console.log('🏠 home.js 加载完成 - FlutterPage首页功能');