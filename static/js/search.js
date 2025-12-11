// 搜索页面特有功能
document.addEventListener('DOMContentLoaded', function() {
    initSearchPage();
});

// 页面状态
let searchState = {
    currentQuery: '',
    searchScope: 'all',
    selectedGenres: ['all'],
    sortBy: 'relevance',
    currentPage: 1,
    resultsPerPage: 12,
    currentView: 'list',
    searchHistory: [],
    popularSearches: [],
    searchResults: [],
    totalResults: 0
};

/**
 * 初始化搜索页面
 */
function initSearchPage() {
    console.log('🚀 初始化搜索页面...');

    // 检查访问权限
    if (!checkPageAccess()) return;

    // 加载搜索历史
    loadSearchHistory();

    // 初始化页面组件
    initSearchBox();
    initFilters();
    initViewToggle();
    initEventListeners();

    // 检查URL参数
    checkUrlParams();

    console.log('✅ 搜索页面初始化完成');
}

/**
 * 初始化搜索框
 */
function initSearchBox() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const suggestions = document.getElementById('searchSuggestions');

    // 输入事件 - 显示搜索建议
    searchInput.addEventListener('input', utils.debounce(function() {
        const query = this.value.trim();
        if (query.length > 0) {
            showSearchSuggestions(query);
        } else {
            hideSearchSuggestions();
        }
    }, 300));

    // 焦点事件
    searchInput.addEventListener('focus', function() {
        const query = this.value.trim();
        if (query.length > 0) {
            showSearchSuggestions(query);
        }
    });

    // 点击外部关闭建议
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
            hideSearchSuggestions();
        }
    });

    // 键盘事件
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        } else if (e.key === 'Escape') {
            hideSearchSuggestions();
        }
    });

    // 搜索按钮
    searchBtn.addEventListener('click', performSearch);
}

/**
 * 初始化筛选器
 */
function initFilters() {
    // 搜索范围
    const scopeRadios = document.querySelectorAll('input[name="searchScope"]');
    scopeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            searchState.searchScope = this.value;
        });
    });

    // 作品类型
    const genreCheckboxes = document.querySelectorAll('input[name="genre"]');
    genreCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateSelectedGenres();
        });
    });

    // 排序方式
    const sortRadios = document.querySelectorAll('input[name="sortBy"]');
    sortRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            searchState.sortBy = this.value;
        });
    });

    // 重置筛选
    document.getElementById('resetFilters').addEventListener('click', resetFilters);

    // 应用筛选
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
}

/**
 * 初始化视图切换
 */
function initViewToggle() {
    const listViewBtn = document.getElementById('listView');
    const gridViewBtn = document.getElementById('gridView');
    const resultsContainer = document.getElementById('resultsContainer');

    listViewBtn.addEventListener('click', function() {
        if (searchState.currentView === 'list') return;

        searchState.currentView = 'list';
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
        resultsContainer.classList.remove('grid-view');
        resultsContainer.classList.add('list-view');

        renderSearchResults();
    });

    gridViewBtn.addEventListener('click', function() {
        if (searchState.currentView === 'grid') return;

        searchState.currentView = 'grid';
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
        resultsContainer.classList.remove('list-view');
        resultsContainer.classList.add('grid-view');

        renderSearchResults();
    });
}

/**
 * 初始化事件监听器
 */
function initEventListeners() {
    // 清空搜索历史
    document.getElementById('clearHistory').addEventListener('click', clearSearchHistory);

    // 返回搜索按钮
    document.getElementById('backToSearch').addEventListener('click', function() {
        document.getElementById('searchInput').focus();
    });

    // 退出登录
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

/**
 * 检查URL参数
 */
function checkUrlParams() {
    const urlParams = router.getAllUrlParams();
    const query = urlParams.q;

    if (query) {
        document.getElementById('searchInput').value = query;
        searchState.currentQuery = query;
        performSearch();
    }
}

/**
 * 加载搜索历史
 */
async function loadSearchHistory() {
    try {
        // 调用后端API获取搜索历史
        const response = await apiManager.search.getSearchHistory();
        if (response.success) {
            searchState.searchHistory = response.data || [];
        } else {
            console.error('获取搜索历史失败:', response.message);
            searchState.searchHistory = [];
        }
    } catch (error) {
        console.error('加载搜索历史失败:', error);
        searchState.searchHistory = [];
    }

    // 加载热门搜索
    await loadPopularSearches();

    renderSearchHistory();
}

/**
 * 加载热门搜索
 */
async function loadPopularSearches() {
    try {
        // 调用后端API获取热门搜索
        const response = await apiManager.search.getPopularSearches();
        if (response.success) {
            searchState.popularSearches = response.data || [];
        } else {
            console.error('获取热门搜索失败:', response.message);
            searchState.popularSearches = [];
        }
    } catch (error) {
        console.error('加载热门搜索失败:', error);
        searchState.popularSearches = [];
    }

    renderPopularSearches();
}

/**
 * 渲染搜索历史
 */
function renderSearchHistory() {
    const historyTags = document.getElementById('historyTags');

    if (searchState.searchHistory.length === 0) {
        historyTags.innerHTML = '<p style="color: var(--text-light); font-style: italic;">暂无搜索历史</p>';
        return;
    }

    historyTags.innerHTML = '';

    // 只显示最近10条记录
    const recentHistory = searchState.searchHistory.slice(-10).reverse();

    recentHistory.forEach(query => {
        const tag = document.createElement('div');
        tag.className = 'history-tag';
        tag.textContent = query;
        tag.addEventListener('click', () => {
            document.getElementById('searchInput').value = query;
            searchState.currentQuery = query;
            performSearch();
        });

        historyTags.appendChild(tag);
    });
}

/**
 * 渲染热门搜索
 */
function renderPopularSearches() {
    const popularTags = document.getElementById('popularTags');
    popularTags.innerHTML = '';

    searchState.popularSearches.forEach(query => {
        const tag = document.createElement('div');
        tag.className = 'popular-tag';
        tag.textContent = query;
        tag.addEventListener('click', () => {
            document.getElementById('searchInput').value = query;
            searchState.currentQuery = query;
            performSearch();
        });

        popularTags.appendChild(tag);
    });
}

/**
 * 显示搜索建议
 */
async function showSearchSuggestions(query) {
    const suggestions = document.getElementById('searchSuggestions');

    try {
        // 调用后端API获取搜索建议
        const response = await apiManager.search.getSuggestions(query);

        if (response.success && response.data && response.data.length > 0) {
            const allSuggestions = response.data;

            suggestions.innerHTML = '';

            allSuggestions.forEach(suggestion => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.innerHTML = `
                    <i class="${suggestion.icon || 'fas fa-search'}"></i>
                    <span>${suggestion.text}</span>
                `;

                item.addEventListener('click', () => {
                    document.getElementById('searchInput').value = suggestion.text.split(' - ')[0];
                    hideSearchSuggestions();
                    performSearch();
                });

                suggestions.appendChild(item);
            });

            suggestions.classList.add('active');
        } else {
            hideSearchSuggestions();
        }
    } catch (error) {
        console.error('获取搜索建议失败:', error);
        hideSearchSuggestions();
    }
}

/**
 * 隐藏搜索建议
 */
function hideSearchSuggestions() {
    document.getElementById('searchSuggestions').classList.remove('active');
}

/**
 * 执行搜索
 */
function performSearch() {
    const query = document.getElementById('searchInput').value.trim();

    if (!query) {
        utils.showNotification('请输入搜索关键词', false);
        return;
    }

    searchState.currentQuery = query;
    searchState.currentPage = 1;

    // 添加到搜索历史
    addToSearchHistory(query);

    // 执行搜索
    executeSearch();
}

/**
 * 添加到搜索历史
 */
async function addToSearchHistory(query) {
    try {
        // 调用后端API保存搜索历史
        const response = await apiManager.search.addToSearchHistory(query);

        if (response.success) {
            // 更新本地状态
            searchState.searchHistory = searchState.searchHistory.filter(item => item !== query);
            searchState.searchHistory.push(query);

            // 更新显示
            renderSearchHistory();
        } else {
            console.error('保存搜索历史失败:', response.message);
        }
    } catch (error) {
        console.error('保存搜索历史失败:', error);
    }
}

/**
 * 执行搜索
 */
async function executeSearch() {
    try {
        // 显示加载状态
        showLoadingState();

        // 构建搜索参数
        const searchParams = {
            query: searchState.currentQuery,
            scope: searchState.searchScope,
            genres: searchState.selectedGenres.includes('all') ? [] : searchState.selectedGenres,
            sortBy: searchState.sortBy,
            page: searchState.currentPage,
            pageSize: searchState.resultsPerPage
        };

        // 使用API管理器进行搜索
        const response = await apiManager.search.performSearch(searchParams);

        if (response.success) {
            searchState.searchResults = response.data.books || [];
            searchState.totalResults = response.data.total || searchState.searchResults.length;

            // 渲染结果
            renderSearchResults();

            // 更新结果信息
            updateResultsInfo();
        } else {
            utils.showNotification('搜索失败，请稍后重试', false);
            showNoResults();
        }
    } catch (error) {
        console.error('搜索错误:', error);
        utils.showNotification('搜索失败，请稍后重试', false);
        showNoResults();
    }
}

/**
 * 显示加载状态
 */
function showLoadingState() {
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = `
        <div class="empty-state">
            <div class="loading-spinner"></div>
            <h3>搜索中...</h3>
            <p>正在查找相关内容</p>
        </div>
    `;

    document.getElementById('pagination').style.display = 'none';
}

/**
 * 显示无结果状态
 */
function showNoResults() {
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = `
        <div class="no-results">
            <div class="no-results-icon">
                <i class="fas fa-search"></i>
            </div>
            <h3>暂无搜索结果</h3>
            <p>尝试使用其他关键词或调整筛选条件</p>
            <button id="backToSearch" class="btn btn-primary">返回搜索</button>
        </div>
    `;

    document.getElementById('pagination').style.display = 'none';

    // 重新绑定事件
    document.getElementById('backToSearch').addEventListener('click', function() {
        document.getElementById('searchInput').focus();
    });
}

/**
 * 更新选中的类型
 */
function updateSelectedGenres() {
    const selected = Array.from(document.querySelectorAll('input[name="genre"]:checked'))
        .map(cb => cb.value);

    searchState.selectedGenres = selected.length > 0 ? selected : ['all'];
}

/**
 * 渲染搜索结果
 */
function renderSearchResults() {
    const resultsContainer = document.getElementById('resultsContainer');

    if (searchState.searchResults.length === 0) {
        showNoResults();
        return;
    }

    // 计算分页
    const startIndex = (searchState.currentPage - 1) * searchState.resultsPerPage;
    const endIndex = startIndex + searchState.resultsPerPage;
    const resultsToShow = searchState.searchResults.slice(startIndex, endIndex);

    resultsContainer.innerHTML = '';

    if (searchState.currentView === 'list') {
        // 列表视图
        resultsToShow.forEach(book => {
            const bookCard = createListBookCard(book);
            resultsContainer.appendChild(bookCard);
        });
    } else {
        // 网格视图
        const booksGrid = document.createElement('div');
        booksGrid.className = 'books-grid';

        resultsToShow.forEach(book => {
            const bookCard = createGridBookCard(book);
            booksGrid.appendChild(bookCard);
        });

        resultsContainer.appendChild(booksGrid);
    }

    // 显示分页
    document.getElementById('pagination').style.display = 'flex';
    updatePagination();
}

/**
 * 创建列表视图书籍卡片
 */
function createListBookCard(book) {
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card';
    bookCard.dataset.id = book.id;

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
                <span><i class="fas fa-tags"></i> ${book.tags.join(', ')}</span>
            </div>
        </div>
    `;

    bookCard.addEventListener('click', () => {
        router.goToBookDetail(book.id);
    });

    return bookCard;
}

/**
 * 创建网格视图书籍卡片
 */
function createGridBookCard(book) {
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
}

/**
 * 更新结果信息
 */
function updateResultsInfo() {
    const resultsTitle = document.getElementById('resultsTitle');
    const resultsCount = document.getElementById('resultsCount');

    if (searchState.currentQuery) {
        resultsTitle.textContent = `搜索"${searchState.currentQuery}"的结果`;
        resultsCount.textContent = `找到 ${searchState.totalResults} 个结果`;
    } else {
        resultsTitle.textContent = '请输入搜索关键词';
        resultsCount.textContent = '';
    }
}

/**
 * 更新分页
 */
function updatePagination() {
    const totalPages = Math.ceil(searchState.totalResults / searchState.resultsPerPage);
    const pagination = document.getElementById('pagination');

    // 生成分页HTML
    let paginationHTML = '';

    if (totalPages > 1) {
        paginationHTML = `
            <button id="prevPage" class="page-btn" ${searchState.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
            <div class="page-numbers" id="pageNumbers"></div>
            <button id="nextPage" class="page-btn" ${searchState.currentPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
    }

    pagination.innerHTML = paginationHTML;

    if (totalPages > 1) {
        const pageNumbers = document.getElementById('pageNumbers');
        const prevButton = document.getElementById('prevPage');
        const nextButton = document.getElementById('nextPage');

        // 生成页码
        let startPage = Math.max(1, searchState.currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);

        // 调整起始页码，确保显示5个页码
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageNumber = document.createElement('div');
            pageNumber.className = 'page-number';
            if (i === searchState.currentPage) {
                pageNumber.classList.add('active');
            }
            pageNumber.textContent = i;
            pageNumber.addEventListener('click', () => {
                searchState.currentPage = i;
                renderSearchResults();
            });
            pageNumbers.appendChild(pageNumber);
        }

        // 绑定分页按钮事件
        prevButton.onclick = () => {
            if (searchState.currentPage > 1) {
                searchState.currentPage--;
                renderSearchResults();
            }
        };

        nextButton.onclick = () => {
            if (searchState.currentPage < totalPages) {
                searchState.currentPage++;
                renderSearchResults();
            }
        };
    }
}

/**
 * 重置筛选
 */
function resetFilters() {
    // 搜索范围
    document.querySelector('input[name="searchScope"][value="all"]').checked = true;
    searchState.searchScope = 'all';

    // 作品类型
    document.querySelectorAll('input[name="genre"]').forEach(cb => {
        cb.checked = cb.value === 'all';
    });
    searchState.selectedGenres = ['all'];

    // 排序方式
    document.querySelector('input[name="sortBy"][value="relevance"]').checked = true;
    searchState.sortBy = 'relevance';

    utils.showNotification('筛选条件已重置');
}

/**
 * 应用筛选
 */
function applyFilters() {
    // 更新选中的类型
    updateSelectedGenres();

    // 重新执行搜索
    if (searchState.currentQuery) {
        executeSearch();
    }

    utils.showNotification('筛选条件已应用');
}

/**
 * 清空搜索历史
 */
async function clearSearchHistory() {
    if (searchState.searchHistory.length === 0) return;

    if (confirm('确定要清空搜索历史吗？')) {
        try {
            // 调用后端API清空搜索历史
            const response = await apiManager.search.clearSearchHistory();

            if (response.success) {
                searchState.searchHistory = [];
                renderSearchHistory();
                utils.showNotification('搜索历史已清空');
            } else {
                utils.showNotification('清空搜索历史失败', false);
            }
        } catch (error) {
            console.error('清空搜索历史失败:', error);
            utils.showNotification('清空搜索历史失败', false);
        }
    }
}

// 页面特定初始化函数，供common.js调用
window.initPage = function() {
    console.log('📄 搜索页面初始化完成');
};