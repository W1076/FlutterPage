/**
 * FlutterPage - 作品管理脚本
 * 负责作品管理的CRUD操作、筛选搜索和模态框交互
 */

// 作品管理模块
const worksManager = {
    // 当前编辑的作品ID
    currentEditId: null,

    // 作品数据
    works: [],

    // 筛选状态
    filters: {
        search: '',
        status: 'all',
        sortBy: 'updateTime'
    },

    // 分页信息
    pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
    },

    /**
     * 初始化作品管理模块
     */
    init: function() {
        this.loadWorks();
        this.setupEventListeners();

        console.log('作品管理模块初始化完成');
    },

    /**
     * 加载作品数据
     */
    loadWorks: function() {
        // 显示加载状态
        this.showLoadingState();

        // 模拟API调用 - 实际项目中从后端获取
        setTimeout(() => {
            // 模拟作品数据
            this.works = [
                {
                    id: 1,
                    title: '星穹传说',
                    cover: '📚',
                    category: '玄幻',
                    tags: ['星际', '修炼', '热血'],
                    status: 'publishing',
                    description: '在浩瀚的星穹之中，少年意外获得神秘传承，开启了一段跨越星际的传奇旅程。星辰为伴，宇宙为战场，他能否揭开宇宙的终极奥秘？',
                    views: 2458000,
                    collections: 125000,
                    chapters: 1205,
                    words: 3200000,
                    comments: 45600,
                    createTime: '2023-01-15',
                    updateTime: '2023-10-15',
                    isVip: true,
                    allowComments: true,
                    allowRecommend: true
                },
                {
                    id: 2,
                    title: '灵域迷踪',
                    cover: '🔮',
                    category: '都市',
                    tags: ['异能', '悬疑', '探险'],
                    status: 'publishing',
                    description: '灵气复苏时代，平凡少年觉醒特殊能力，探索隐藏在现实背后的灵域世界。谜团重重，真相究竟是什么？',
                    views: 2135000,
                    collections: 108000,
                    chapters: 985,
                    words: 2800000,
                    comments: 38900,
                    createTime: '2023-02-20',
                    updateTime: '2023-10-14',
                    isVip: false,
                    allowComments: true,
                    allowRecommend: true
                },
                {
                    id: 3,
                    title: '剑影仙途',
                    cover: '⚔️',
                    category: '仙侠',
                    tags: ['剑修', '冒险', '成长'],
                    status: 'finished',
                    description: '一剑破万法，一剑证仙途。少年持剑行走天下，斩妖除魔，追寻那虚无缥缈的仙道巅峰。',
                    views: 1987000,
                    collections: 93000,
                    chapters: 1340,
                    words: 3500000,
                    comments: 51200,
                    createTime: '2022-11-10',
                    updateTime: '2023-10-13',
                    isVip: true,
                    allowComments: true,
                    allowRecommend: true
                },
                {
                    id: 4,
                    title: '美食异世界',
                    cover: '🍜',
                    category: '穿越',
                    tags: ['美食', '轻松', '种田'],
                    status: 'draft',
                    description: '顶尖厨师意外穿越到异世界，用美食征服各种族，建立美食帝国，传播中华饮食文化。',
                    views: 0,
                    collections: 0,
                    chapters: 0,
                    words: 0,
                    comments: 0,
                    createTime: '2023-10-10',
                    updateTime: '2023-10-10',
                    isVip: false,
                    allowComments: true,
                    allowRecommend: true
                }
            ];

            this.pagination.total = this.works.length;
            this.renderWorksList();
            this.updateWorksCount();

        }, 1000);
    },

    /**
     * 设置事件监听器
     */
    setupEventListeners: function() {
        // 标签输入
        const tagInput = document.getElementById('tagInput');
        if (tagInput) {
            tagInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addTag(tagInput.value.trim());
                    tagInput.value = '';
                }
            });
        }

        // 封面上传
        const coverUpload = document.getElementById('coverUpload');
        if (coverUpload) {
            coverUpload.addEventListener('change', (e) => {
                this.handleCoverUpload(e.target.files[0]);
            });
        }

        // 模态框点击外部关闭
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                    this.closeDeleteModal();
                }
            });
        });
    },

    /**
     * 显示加载状态
     */
    showLoadingState: function() {
        const container = document.getElementById('worksList');
        if (!container) return;

        container.innerHTML = `
            <div class="work-card">
                <div class="loading-skeleton skeleton-item" style="height: 40px; margin-bottom: 15px;"></div>
                <div class="loading-skeleton skeleton-item short" style="height: 20px; margin-bottom: 10px;"></div>
                <div class="loading-skeleton skeleton-item medium" style="height: 60px; margin-bottom: 15px;"></div>
                <div class="loading-skeleton skeleton-item" style="height: 30px; margin-bottom: 10px;"></div>
            </div>
            <div class="work-card">
                <div class="loading-skeleton skeleton-item" style="height: 40px; margin-bottom: 15px;"></div>
                <div class="loading-skeleton skeleton-item short" style="height: 20px; margin-bottom: 10px;"></div>
                <div class="loading-skeleton skeleton-item medium" style="height: 60px; margin-bottom: 15px;"></div>
                <div class="loading-skeleton skeleton-item" style="height: 30px; margin-bottom: 10px;"></div>
            </div>
        `;
    },

    /**
     * 渲染作品列表
     */
    renderWorksList: function() {
        const container = document.getElementById('worksList');
        if (!container) return;

        const filteredWorks = this.getFilteredWorks();

        if (filteredWorks.length === 0) {
            container.innerHTML = this.getEmptyStateHTML();
            return;
        }

        const worksHTML = filteredWorks.map(work => this.getWorkCardHTML(work)).join('');
        container.innerHTML = worksHTML;

        this.renderPagination();
    },

    /**
     * 获取筛选后的作品
     */
    getFilteredWorks: function() {
        let filtered = [...this.works];

        // 搜索筛选
        if (this.filters.search) {
            const searchLower = this.filters.search.toLowerCase();
            filtered = filtered.filter(work =>
                work.title.toLowerCase().includes(searchLower) ||
                work.description.toLowerCase().includes(searchLower) ||
                work.tags.some(tag => tag.toLowerCase().includes(searchLower))
            );
        }

        // 状态筛选
        if (this.filters.status !== 'all') {
            filtered = filtered.filter(work => work.status === this.filters.status);
        }

        // 排序
        filtered.sort((a, b) => {
            switch (this.filters.sortBy) {
                case 'createTime':
                    return new Date(b.createTime) - new Date(a.createTime);
                case 'views':
                    return b.views - a.views;
                case 'collections':
                    return b.collections - a.collections;
                case 'updateTime':
                default:
                    return new Date(b.updateTime) - new Date(a.updateTime);
            }
        });

        return filtered;
    },

    /**
     * 获取作品卡片HTML
     */
    getWorkCardHTML: function(work) {
        return `
            <div class="work-card" data-work-id="${work.id}">
                <div class="work-header">
                    <div class="work-cover">${work.cover}</div>
                    <div class="work-basic-info">
                        <div class="work-title-row">
                            <h3 class="work-title">${work.title}</h3>
                            <span class="work-status ${work.status}">${this.getStatusText(work.status)}</span>
                        </div>
                        <div class="work-meta">
                            <span><i class="fas fa-layer-group"></i> ${work.category}</span>
                            <span><i class="fas fa-calendar"></i> ${this.formatDate(work.updateTime)}更新</span>
                            ${work.isVip ? '<span><i class="fas fa-crown" style="color: #FFD700;"></i> VIP作品</span>' : ''}
                        </div>
                        <div class="work-tags">
                            ${work.tags.map(tag => `<span class="work-tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="work-description">${work.description}</div>
                
                <div class="work-stats">
                    <div class="stat-item">
                        <span class="stat-value">${this.formatNumber(work.views)}</span>
                        <span class="stat-label">阅读量</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${this.formatNumber(work.collections)}</span>
                        <span class="stat-label">收藏数</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${work.chapters}</span>
                        <span class="stat-label">章节数</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${this.formatNumber(work.words)}</span>
                        <span class="stat-label">总字数</span>
                    </div>
                </div>
                
                <div class="work-actions">
                    <button class="btn btn-primary btn-sm" onclick="worksManager.editWork(${work.id})">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="worksManager.viewChapters(${work.id})">
                        <i class="fas fa-file-alt"></i> 管理章节
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="worksManager.viewStatistics(${work.id})">
                        <i class="fas fa-chart-bar"></i> 数据统计
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="worksManager.viewComments(${work.id})">
                        <i class="fas fa-comments"></i> 评论管理
                    </button>
                    ${work.status === 'draft' ? `
                    <button class="btn btn-success btn-sm" onclick="worksManager.publishWork(${work.id})">
                        <i class="fas fa-paper-plane"></i> 发布
                    </button>
                    ` : ''}
                    <button class="btn btn-danger btn-sm" onclick="worksManager.showDeleteModal(${work.id})">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * 获取空状态HTML
     */
    getEmptyStateHTML: function() {
        return `
            <div class="empty-works">
                <div class="empty-works-icon">
                    <i class="fas fa-book"></i>
                </div>
                <div class="empty-works-title">暂无作品</div>
                <div class="empty-works-description">
                    ${this.filters.search || this.filters.status !== 'all' ? 
                        '没有找到符合条件的作品，尝试调整搜索条件' : 
                        '开始创作您的第一部作品，让读者发现您的才华'
                    }
                </div>
                ${!this.filters.search && this.filters.status === 'all' ? `
                    <button class="btn btn-primary" onclick="worksManager.showCreateModal()">
                        <i class="fas fa-plus"></i> 创建新作品
                    </button>
                ` : `
                    <button class="btn btn-secondary" onclick="worksManager.clearFilters()">
                        <i class="fas fa-times"></i> 清除筛选条件
                    </button>
                `}
            </div>
        `;
    },

    /**
     * 渲染分页
     */
    renderPagination: function() {
        const container = document.getElementById('worksPagination');
        if (!container) return;

        const totalPages = Math.ceil(this.pagination.total / this.pagination.pageSize);

        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = `
            <button class="btn btn-secondary btn-sm" ${this.pagination.currentPage === 1 ? 'disabled' : ''} 
                onclick="worksManager.goToPage(${this.pagination.currentPage - 1})">
                <i class="fas fa-chevron-left"></i> 上一页
            </button>
            <div class="page-numbers">
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (i === this.pagination.currentPage) {
                paginationHTML += `<span class="page-number active">${i}</span>`;
            } else {
                paginationHTML += `<span class="page-number" onclick="worksManager.goToPage(${i})">${i}</span>`;
            }
        }

        paginationHTML += `
            </div>
            <button class="btn btn-secondary btn-sm" ${this.pagination.currentPage === totalPages ? 'disabled' : ''} 
                onclick="worksManager.goToPage(${this.pagination.currentPage + 1})">
                下一页 <i class="fas fa-chevron-right"></i>
            </button>
        `;

        container.innerHTML = paginationHTML;
    },

    /**
     * 显示创建作品模态框
     */
    showCreateModal: function() {
        this.currentEditId = null;
        document.getElementById('modalTitle').textContent = '新建作品';
        document.getElementById('workForm').reset();
        document.getElementById('tagsContainer').innerHTML = '';
        document.getElementById('coverPreview').innerHTML = '<i class="fas fa-book"></i><span>封面预览</span>';
        document.getElementById('workModal').classList.add('show');
    },

    /**
     * 显示编辑作品模态框
     */
    editWork: function(workId) {
        const work = this.works.find(w => w.id === workId);
        if (!work) return;

        this.currentEditId = workId;
        document.getElementById('modalTitle').textContent = '编辑作品';

        // 填充表单数据
        document.getElementById('workTitle').value = work.title;
        document.getElementById('workCategory').value = work.category;
        document.getElementById('workStatus').value = work.status;
        document.getElementById('workDescription').value = work.description;
        document.getElementById('isVip').checked = work.isVip;
        document.getElementById('allowComments').checked = work.allowComments;
        document.getElementById('allowRecommend').checked = work.allowRecommend;

        // 填充标签
        const tagsContainer = document.getElementById('tagsContainer');
        tagsContainer.innerHTML = '';
        work.tags.forEach(tag => this.addTagToContainer(tag));

        // 填充封面
        const coverPreview = document.getElementById('coverPreview');
        coverPreview.innerHTML = work.cover + '<span>封面预览</span>';

        document.getElementById('workModal').classList.add('show');
    },

    /**
     * 添加标签
     */
    addTag: function(tagText) {
        if (!tagText) return;

        const tagsContainer = document.getElementById('tagsContainer');
        const existingTags = Array.from(tagsContainer.querySelectorAll('.tag')).map(tag => tag.querySelector('span').textContent);

        if (existingTags.length >= 5) {
            utils.showNotification('最多只能添加5个标签', false);
            return;
        }

        if (existingTags.includes(tagText)) {
            utils.showNotification('标签已存在', false);
            return;
        }

        if (tagText.length > 10) {
            utils.showNotification('标签长度不能超过10个字符', false);
            return;
        }

        this.addTagToContainer(tagText);
    },

    /**
     * 添加标签到容器
     */
    addTagToContainer: function(tagText) {
        const tagsContainer = document.getElementById('tagsContainer');
        const tagHTML = `
            <div class="tag">
                <span>${tagText}</span>
                <button type="button" class="tag-remove" onclick="worksManager.removeTag(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        tagsContainer.insertAdjacentHTML('beforeend', tagHTML);
    },

    /**
     * 移除标签
     */
    removeTag: function(button) {
        button.closest('.tag').remove();
    },

    /**
     * 处理封面上传
     */
    handleCoverUpload: function(file) {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            utils.showNotification('请上传图片文件', false);
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            utils.showNotification('图片大小不能超过5MB', false);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const coverPreview = document.getElementById('coverPreview');
            coverPreview.innerHTML = `<img src="${e.target.result}" alt="封面图片">`;
        };
        reader.readAsDataURL(file);
    },

    /**
     * 保存作品
     */
    saveWork: function(event) {
        event.preventDefault();

        const formData = {
            title: document.getElementById('workTitle').value.trim(),
            category: document.getElementById('workCategory').value,
            status: document.getElementById('workStatus').value,
            description: document.getElementById('workDescription').value.trim(),
            tags: Array.from(document.getElementById('tagsContainer').querySelectorAll('.tag span')).map(span => span.textContent),
            isVip: document.getElementById('isVip').checked,
            allowComments: document.getElementById('allowComments').checked,
            allowRecommend: document.getElementById('allowRecommend').checked
        };

        // 验证表单
        if (!this.validateWorkForm(formData)) {
            return;
        }

        // 模拟API调用
        if (this.currentEditId) {
            // 更新作品
            this.updateWork(this.currentEditId, formData);
        } else {
            // 创建作品
            this.createWork(formData);
        }
    },

    /**
     * 验证作品表单
     */
    validateWorkForm: function(formData) {
        if (!formData.title) {
            utils.showNotification('请输入作品名称', false);
            return false;
        }

        if (!formData.category) {
            utils.showNotification('请选择作品分类', false);
            return false;
        }

        if (!formData.description) {
            utils.showNotification('请输入作品简介', false);
            return false;
        }

        if (formData.title.length > 50) {
            utils.showNotification('作品名称不能超过50个字符', false);
            return false;
        }

        if (formData.description.length > 500) {
            utils.showNotification('作品简介不能超过500个字符', false);
            return false;
        }

        return true;
    },

    /**
     * 创建作品
     */
    createWork: function(formData) {
        // 模拟API调用
        setTimeout(() => {
            const newWork = {
                id: Date.now(),
                ...formData,
                cover: '📚',
                views: 0,
                collections: 0,
                chapters: 0,
                words: 0,
                comments: 0,
                createTime: new Date().toISOString().split('T')[0],
                updateTime: new Date().toISOString().split('T')[0]
            };

            this.works.unshift(newWork);
            this.pagination.total = this.works.length;
            this.renderWorksList();
            this.updateWorksCount();
            this.closeModal();

            utils.showNotification('作品创建成功！');
        }, 1000);
    },

    /**
     * 更新作品
     */
    updateWork: function(workId, formData) {
        // 模拟API调用
        setTimeout(() => {
            const workIndex = this.works.findIndex(w => w.id === workId);
            if (workIndex !== -1) {
                this.works[workIndex] = {
                    ...this.works[workIndex],
                    ...formData,
                    updateTime: new Date().toISOString().split('T')[0]
                };

                this.renderWorksList();
                this.closeModal();

                utils.showNotification('作品更新成功！');
            }
        }, 1000);
    },

    /**
     * 发布作品
     */
    publishWork: function(workId) {
        if (!confirm('确定要发布这个作品吗？发布后读者将可以看到您的作品。')) {
            return;
        }

        // 模拟API调用
        setTimeout(() => {
            const work = this.works.find(w => w.id === workId);
            if (work) {
                work.status = 'publishing';
                this.renderWorksList();
                utils.showNotification('作品发布成功！');
            }
        }, 1000);
    },

    /**
     * 显示删除确认模态框
     */
    showDeleteModal: function(workId) {
        const work = this.works.find(w => w.id === workId);
        if (!work) return;

        document.getElementById('deleteWorkTitle').textContent = work.title;
        document.getElementById('deleteModal').classList.add('show');

        // 设置确认删除按钮的事件
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        confirmBtn.onclick = () => this.deleteWork(workId);
    },

    /**
     * 删除作品
     */
    deleteWork: function(workId) {
        // 模拟API调用
        setTimeout(() => {
            this.works = this.works.filter(w => w.id !== workId);
            this.pagination.total = this.works.length;
            this.renderWorksList();
            this.updateWorksCount();
            this.closeDeleteModal();

            utils.showNotification('作品删除成功');
        }, 1000);
    },

    /**
     * 搜索作品
     */
    searchWorks: function(query) {
        this.filters.search = query;
        this.pagination.currentPage = 1;
        this.renderWorksList();
    },

    /**
     * 筛选作品
     */
    filterWorks: function() {
        this.filters.status = document.getElementById('statusFilter').value;
        this.pagination.currentPage = 1;
        this.renderWorksList();
    },

    /**
     * 排序作品
     */
    sortWorks: function() {
        this.filters.sortBy = document.getElementById('sortBy').value;
        this.renderWorksList();
    },

    /**
     * 清除筛选条件
     */
    clearFilters: function() {
        this.filters.search = '';
        this.filters.status = 'all';
        this.filters.sortBy = 'updateTime';

        document.getElementById('worksSearch').value = '';
        document.getElementById('statusFilter').value = 'all';
        document.getElementById('sortBy').value = 'updateTime';

        this.pagination.currentPage = 1;
        this.renderWorksList();
    },

    /**
     * 跳转到指定页面
     */
    goToPage: function(page) {
        this.pagination.currentPage = page;
        this.renderWorksList();
    },

    /**
     * 关闭模态框
     */
    closeModal: function() {
        document.getElementById('workModal').classList.remove('show');
        this.currentEditId = null;
    },

    /**
     * 关闭删除确认模态框
     */
    closeDeleteModal: function() {
        document.getElementById('deleteModal').classList.remove('show');
    },

    /**
     * 更新作品数量显示
     */
    updateWorksCount: function() {
        const countElement = document.getElementById('totalWorksCount');
        if (countElement) {
            countElement.textContent = this.works.length;
        }
    },

    /**
     * 导出作品数据
     */
    exportWorksData: function() {
        utils.showNotification('正在准备导出数据...', true);

        // 模拟导出过程
        setTimeout(() => {
            utils.showNotification('作品数据导出成功！');
        }, 2000);
    },

    /**
     * 查看章节管理
     */
    viewChapters: function(workId) {
        router.navigateTo('chapter-management.html', { workId: workId });
    },

    /**
     * 查看数据统计
     */
    viewStatistics: function(workId) {
        router.navigateTo('data-analysis.html', { workId: workId });
    },

    /**
     * 查看评论管理
     */
    viewComments: function(workId) {
        router.navigateTo('comment-management.html', { workId: workId });
    },

    // ==================== 工具方法 ====================

    /**
     * 获取状态文本
     */
    getStatusText: function(status) {
        const statusMap = {
            'publishing': '连载中',
            'finished': '已完结',
            'draft': '草稿',
            'pending': '审核中'
        };
        return statusMap[status] || '未知';
    },

    /**
     * 格式化数字
     */
    formatNumber: function(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + '万';
        } else if (num >= 10000) {
            return (num / 10000).toFixed(1) + '万';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + '千';
        }
        return num.toString();
    },

    /**
     * 格式化日期
     */
    formatDate: function(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        if (diff < 86400000) { // 1天内
            return '今天';
        } else if (diff < 172800000) { // 2天内
            return '昨天';
        } else {
            return date.toLocaleDateString('zh-CN');
        }
    }
};

// ==================== 页面初始化 ====================

/**
 * 初始化作品管理页面
 */
function initWorksManagement() {
    console.log('🚀 初始化作品管理页面...');

    // 检查用户权限
    if (!checkAuthorAccess()) {
        return;
    }

    // 初始化作品管理模块
    worksManager.init();

    // 检查页面访问权限
    checkPageAccess();

    console.log('✅ 作品管理页面初始化完成');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initWorksManagement();
});

// 全局暴露
window.worksManager = worksManager;