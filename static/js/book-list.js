// 小说列表页特有功能

// 分页和筛选状态
let listState = {
    currentPage: 1,
    booksPerPage: 12,
    currentCategory: 'all',
    currentSort: 'default',
    currentView: 'grid',
    activeFilters: {
        status: ['all'],
        wordCount: ['all'],
        updateTime: 'all',
        rating: 'all'
    }
};

/**
 * 初始化小说列表页
 */
function initBookListPage() {
    console.log('🚀 初始化小说列表页...');

    // 检查访问权限
    if (!checkPageAccess()) return;

    // 初始化页面组件
    initNavigation();
    initViewToggle();
    initCategoryNavigation();
    initSortOptions();
    initAdvancedFilters();
    initPagination();

    // 从后端获取并渲染书籍列表
    loadBooksFromBackend();

    console.log('✅ 小说列表页初始化完成');
}

/**
 * 从后端加载书籍数据
 */
function loadBooksFromBackend() {
    // 预留后端接口 - 获取书籍列表
    // 实际实现时应该调用Flask后端API
    console.log('📚 从后端加载书籍数据...');

    // 模拟从后端获取数据
    // 实际实现应该使用 fetch 或 axios
    // fetch('/api/books')
    //     .then(response => response.json())
    //     .then(data => {
    //         window.booksData = data.books;
    //         renderBooks();
    //     })
    //     .catch(error => {
    //         console.error('获取书籍数据失败:', error);
    //         utils.showNotification('加载书籍列表失败', true);
    //     });

    // 临时使用模拟数据
    setTimeout(() => {
        renderBooks();
    }, 100);
}

/**
 * 初始化导航功能
 */
function initNavigation() {
    // 我的收藏链接
    document.getElementById('myCollectionLink').addEventListener('click', function(e) {
        e.preventDefault();
        utils.showNotification('我的收藏功能开发中', true);
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
 * 初始化视图切换
 */
function initViewToggle() {
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    const booksGrid = document.getElementById('booksGrid');

    gridViewBtn.addEventListener('click', function() {
        if (listState.currentView === 'grid') return;

        listState.currentView = 'grid';
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
        booksGrid.classList.remove('list-view');
        booksGrid.classList.add('grid-view');

        renderBooks();
    });

    listViewBtn.addEventListener('click', function() {
        if (listState.currentView === 'list') return;

        listState.currentView = 'list';
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
        booksGrid.classList.remove('grid-view');
        booksGrid.classList.add('list-view');

        renderBooks();
    });
}

/**
 * 初始化分类导航
 */
function initCategoryNavigation() {
    const categoryItems = document.querySelectorAll('.category-item');

    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            // 更新活动状态
            document.querySelector('.category-item.active').classList.remove('active');
            this.classList.add('active');

            // 更新分类和重置分页
            listState.currentCategory = this.dataset.category;
            listState.currentPage = 1;

            // 重新渲染书籍
            renderBooks();
        });
    });
}

/**
 * 初始化排序选项
 */
function initSortOptions() {
    const sortBtns = document.querySelectorAll('.sort-btn');

    sortBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 更新活动状态
            document.querySelector('.sort-btn.active').classList.remove('active');
            this.classList.add('active');

            // 更新排序方式
            listState.currentSort = this.dataset.sort;

            // 重新渲染书籍
            renderBooks();
        });
    });
}

/**
 * 初始化高级筛选
 */
function initAdvancedFilters() {
    const toggleFiltersBtn = document.getElementById('toggleFiltersBtn');
    const advancedFilters = document.getElementById('advancedFilters');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');

    // 切换筛选面板
    toggleFiltersBtn.addEventListener('click', function() {
        advancedFilters.classList.toggle('active');
        const icon = this.querySelector('i');
        if (advancedFilters.classList.contains('active')) {
            icon.className = 'fas fa-times';
            this.innerHTML = '<i class="fas fa-times"></i> 关闭筛选';
        } else {
            icon.className = 'fas fa-filter';
            this.innerHTML = '<i class="fas fa-filter"></i> 高级筛选';
        }
    });

    // 重置筛选
    resetFiltersBtn.addEventListener('click', function() {
        resetAdvancedFilters();
    });

    // 应用筛选
    applyFiltersBtn.addEventListener('click', function() {
        applyAdvancedFilters();
        advancedFilters.classList.remove('active');
        toggleFiltersBtn.innerHTML = '<i class="fas fa-filter"></i> 高级筛选';
    });

    // 筛选选项变化监听
    setupFilterListeners();
}

/**
 * 设置筛选监听器
 */
function setupFilterListeners() {
    // 状态筛选
    const statusFilters = document.querySelectorAll('input[name="status"]');
    statusFilters.forEach(filter => {
        filter.addEventListener('change', function() {
            if (this.value === 'all' && this.checked) {
                // 如果选中"全部"，取消选中其他状态
                statusFilters.forEach(f => {
                    if (f.value !== 'all') f.checked = false;
                });
            } else if (this.checked) {
                // 如果选中其他状态，取消选中"全部"
                document.querySelector('input[name="status"][value="all"]').checked = false;
            }
        });
    });

    // 字数筛选
    const wordCountFilters = document.querySelectorAll('input[name="wordCount"]');
    wordCountFilters.forEach(filter => {
        filter.addEventListener('change', function() {
            if (this.value === 'all' && this.checked) {
                wordCountFilters.forEach(f => {
                    if (f.value !== 'all') f.checked = false;
                });
            } else if (this.checked) {
                document.querySelector('input[name="wordCount"][value="all"]').checked = false;
            }
        });
    });
}

/**
 * 重置高级筛选
 */
function resetAdvancedFilters() {
    // 重置表单
    document.querySelector('input[name="status"][value="all"]').checked = true;
    document.querySelectorAll('input[name="status"]').forEach(f => {
        if (f.value !== 'all') f.checked = false;
    });

    document.querySelector('input[name="wordCount"][value="all"]').checked = true;
    document.querySelectorAll('input[name="wordCount"]').forEach(f => {
        if (f.value !== 'all') f.checked = false;
    });

    document.querySelector('input[name="updateTime"][value="all"]').checked = true;
    document.querySelector('input[name="rating"][value="all"]').checked = true;

    // 重置状态
    listState.activeFilters = {
        status: ['all'],
        wordCount: ['all'],
        updateTime: 'all',
        rating: 'all'
    };

    // 重新渲染书籍
    renderBooks();

    utils.showNotification('筛选条件已重置');
}

/**
 * 应用高级筛选
 */
function applyAdvancedFilters() {
    // 获取状态筛选
    const statusFilters = Array.from(document.querySelectorAll('input[name="status"]:checked'))
        .map(cb => cb.value);
    listState.activeFilters.status = statusFilters.length > 0 ? statusFilters : ['all'];

    // 获取字数筛选
    const wordCountFilters = Array.from(document.querySelectorAll('input[name="wordCount"]:checked'))
        .map(cb => cb.value);
    listState.activeFilters.wordCount = wordCountFilters.length > 0 ? wordCountFilters : ['all'];

    // 获取更新时间筛选
    const updateTimeFilter = document.querySelector('input[name="updateTime"]:checked');
    listState.activeFilters.updateTime = updateTimeFilter ? updateTimeFilter.value : 'all';

    // 获取评分筛选
    const ratingFilter = document.querySelector('input[name="rating"]:checked');
    listState.activeFilters.rating = ratingFilter ? ratingFilter.value : 'all';

    // 重置分页
    listState.currentPage = 1;

    // 重新渲染书籍
    renderBooks();

    utils.showNotification('筛选条件已应用');
}

/**
 * 初始化分页
 */
function initPagination() {
    document.getElementById('prevPage').addEventListener('click', () => {
        if (listState.currentPage > 1) {
            listState.currentPage--;
            renderBooks();
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        const totalPages = Math.ceil(getFilteredBooks().length / listState.booksPerPage);
        if (listState.currentPage < totalPages) {
            listState.currentPage++;
            renderBooks();
        }
    });
}

/**
 * 获取筛选后的书籍
 * @returns {Array} 筛选后的书籍列表
 */
function getFilteredBooks() {
    // 预留后端接口 - 实际应该调用后端API进行筛选
    // 临时使用前端筛选逻辑
    let filteredBooks = window.booksData || [];

    // 分类筛选
    if (listState.currentCategory !== 'all') {
        filteredBooks = filteredBooks.filter(book => book.category === listState.currentCategory);
    }

    // 高级筛选
    filteredBooks = filteredBooks.filter(book => {
        // 状态筛选
        if (!listState.activeFilters.status.includes('all')) {
            const statusMatch = listState.activeFilters.status.some(status => {
                if (status === 'serial') return book.status === '连载中';
                if (status === 'complete') return book.status === '已完结';
                return true;
            });
            if (!statusMatch) return false;
        }

        // 字数筛选
        if (!listState.activeFilters.wordCount.includes('all')) {
            const wordCountMatch = listState.activeFilters.wordCount.some(range => {
                if (range === 'short') return book.wordCount < 100;
                if (range === 'medium') return book.wordCount >= 100 && book.wordCount < 300;
                if (range === 'long') return book.wordCount >= 300;
                return true;
            });
            if (!wordCountMatch) return false;
        }

        // 评分筛选
        if (listState.activeFilters.rating !== 'all') {
            if (listState.activeFilters.rating === 'high' && book.rating < 8) return false;
            if (listState.activeFilters.rating === 'medium' && (book.rating < 6 || book.rating >= 8)) return false;
        }

        return true;
    });

    // 排序
    filteredBooks = sortBooks(filteredBooks, listState.currentSort);

    return filteredBooks;
}

/**
 * 排序书籍
 * @param {Array} books - 书籍列表
 * @param {string} sortBy - 排序方式
 * @returns {Array} 排序后的书籍列表
 */
function sortBooks(books, sortBy) {
    const sortedBooks = [...books];

    switch (sortBy) {
        case 'popular':
            sortedBooks.sort((a, b) => parseViews(b.views) - parseViews(a.views));
            break;
        case 'update':
            sortedBooks.sort((a, b) => new Date(b.updateTime) - new Date(a.updateTime));
            break;
        case 'rating':
            sortedBooks.sort((a, b) => b.rating - a.rating);
            break;
        case 'chapter':
            sortedBooks.sort((a, b) => b.chapterCount - a.chapterCount);
            break;
        case 'default':
        default:
            // 默认排序保持原顺序
            break;
    }

    return sortedBooks;
}

/**
 * 解析浏览量
 * @param {string} views - 浏览量字符串
 * @returns {number} 解析后的数字
 */
function parseViews(views) {
    if (typeof views === 'number') return views;
    if (views.includes('万')) {
        return parseFloat(views) * 10000;
    }
    if (views.includes('亿')) {
        return parseFloat(views) * 100000000;
    }
    return parseInt(views) || 0;
}

/**
 * 渲染书籍列表
 */
function renderBooks() {
    const filteredBooks = getFilteredBooks();
    const booksGrid = document.getElementById('booksGrid');

    // 计算分页
    const startIndex = (listState.currentPage - 1) * listState.booksPerPage;
    const endIndex = startIndex + listState.booksPerPage;
    const booksToShow = filteredBooks.slice(startIndex, endIndex);

    // 清空容器
    booksGrid.innerHTML = '';

    // 空状态处理
    if (booksToShow.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <div class="empty-state-icon">
                <i class="fas fa-book-open"></i>
            </div>
            <h3 class="empty-state-title">暂无相关书籍</h3>
            <p class="empty-state-description">尝试调整筛选条件或选择其他分类</p>
            <button class="btn btn-primary" id="resetAllFilters">重置所有筛选</button>
        `;
        booksGrid.appendChild(emptyState);

        document.getElementById('resetAllFilters').addEventListener('click', resetAllFilters);

        // 隐藏分页
        document.getElementById('pagination').style.display = 'none';
        return;
    }

    // 显示分页
    document.getElementById('pagination').style.display = 'flex';

    // 渲染书籍
    booksToShow.forEach(book => {
        const bookCard = createBookCard(book);
        booksGrid.appendChild(bookCard);
    });

    // 更新分页
    updatePagination(filteredBooks.length);
}

/**
 * 创建书籍卡片
 * @param {Object} book - 书籍数据
 * @returns {HTMLElement} 书籍卡片元素
 */
function createBookCard(book) {
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card';
    bookCard.dataset.id = book.id;

    if (listState.currentView === 'list') {
        // 列表视图
        bookCard.innerHTML = `
            <div class="book-cover">
                <i class="fas fa-book"></i>
            </div>
            <div class="book-info">
                <div>
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">作者：${book.author}</p>
                    <p class="book-description">${book.description}</p>
                </div>
                <div class="book-meta">
                    <span><i class="fas fa-eye"></i> ${book.views}</span>
                    <span><i class="fas fa-bookmark"></i> ${book.rating}</span>
                    <span><i class="fas fa-file-alt"></i> ${book.chapterCount}章</span>
                    <span><i class="fas fa-font"></i> ${book.wordCount}万字</span>
                </div>
            </div>
        `;
    } else {
        // 网格视图
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
    }

    bookCard.addEventListener('click', () => {
        // 预留后端接口 - 跳转到书籍详情页
        // 实际应该调用后端路由
        window.location.href = `book-detail.html?id=${book.id}`;
    });

    return bookCard;
}

/**
 * 更新分页组件
 * @param {number} totalBooks - 总书籍数量
 */
function updatePagination(totalBooks) {
    const totalPages = Math.ceil(totalBooks / listState.booksPerPage);
    const pageNumbers = document.getElementById('pageNumbers');
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');

    // 更新按钮状态
    prevButton.disabled = listState.currentPage === 1;
    nextButton.disabled = listState.currentPage === totalPages;

    // 生成页码
    pageNumbers.innerHTML = '';

    // 显示最多5个页码
    let startPage = Math.max(1, listState.currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    // 调整起始页码，确保显示5个页码
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageNumber = document.createElement('div');
        pageNumber.className = 'page-number';
        if (i === listState.currentPage) {
            pageNumber.classList.add('active');
        }
        pageNumber.textContent = i;
        pageNumber.addEventListener('click', () => {
            listState.currentPage = i;
            renderBooks();
        });
        pageNumbers.appendChild(pageNumber);
    }
}

/**
 * 重置所有筛选
 */
function resetAllFilters() {
    // 重置分类
    document.querySelector('.category-item.active').classList.remove('active');
    document.querySelector('.category-item[data-category="all"]').classList.add('active');
    listState.currentCategory = 'all';

    // 重置排序
    document.querySelector('.sort-btn.active').classList.remove('active');
    document.querySelector('.sort-btn[data-sort="default"]').classList.add('active');
    listState.currentSort = 'default';

    // 重置高级筛选
    resetAdvancedFilters();

    // 重置分页
    listState.currentPage = 1;

    // 重新渲染
    renderBooks();

    utils.showNotification('所有筛选条件已重置');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化小说列表页功能
    initBookListPage();
});

// 页面特定初始化函数，供common.js调用
window.initPage = function() {
    console.log('📄 小说列表页初始化完成');
};