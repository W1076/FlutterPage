/**
 * FlutterPage - 章节管理脚本
 * 负责章节的CRUD操作、批量管理和编辑器功能
 */

// 章节管理模块
const chapterManager = {
    // 当前选中的作品ID
    currentWorkId: null,

    // 当前编辑的章节ID
    currentEditId: null,

    // 章节数据
    chapters: [],

    // 选中的章节ID列表（用于批量操作）
    selectedChapters: new Set(),

    // 筛选状态
    filters: {
        search: '',
        status: 'all',
        sortBy: 'order'
    },

    // 分页信息
    pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
    },

    /**
     * 初始化章节管理模块
     */
    init: function() {
        this.loadWorks();
        this.setupEventListeners();

        console.log('章节管理模块初始化完成');
    },

    /**
     * 加载作品列表
     */
    loadWorks: function() {
        // 模拟作品数据 - 实际项目中从后端API获取
        const works = [
            { id: 1, title: '星穹传说', chapters: 1205, words: 3200000 },
            { id: 2, title: '灵域迷踪', chapters: 985, words: 2800000 },
            { id: 3, title: '剑影仙途', chapters: 1340, words: 3500000 }
        ];

        const workSelect = document.getElementById('workSelect');
        works.forEach(work => {
            const option = document.createElement('option');
            option.value = work.id;
            option.textContent = `${work.title} (${work.chapters}章, ${this.formatNumber(work.words)}字)`;
            workSelect.appendChild(option);
        });
    },

    /**
     * 选择作品
     */
    selectWork: function(workId) {
        this.currentWorkId = workId;
        this.selectedChapters.clear();

        const createBtn = document.getElementById('createChapterBtn');
        const batchBtn = document.getElementById('batchActionsBtn');
        const workInfo = document.getElementById('workInfo');

        if (workId) {
            createBtn.disabled = false;
            batchBtn.disabled = false;

            // 更新作品信息显示
            const workSelect = document.getElementById('workSelect');
            const selectedOption = workSelect.options[workSelect.selectedIndex];
            workInfo.textContent = `- ${selectedOption.textContent.split(' (')[0]}`;

            // 加载章节数据
            this.loadChapters();
        } else {
            createBtn.disabled = true;
            batchBtn.disabled = true;
            workInfo.textContent = '- 选择作品';

            // 清空章节列表
            this.chapters = [];
            this.renderChaptersList();
        }

        this.updateBatchActionsBar();
    },

    /**
     * 加载章节数据
     */
    loadChapters: function() {
        if (!this.currentWorkId) return;

        // 显示加载状态
        this.showLoadingState();

        // 模拟API调用 - 实际项目中从后端获取
        setTimeout(() => {
            // 模拟章节数据
            this.chapters = this.generateChaptersData(50);
            this.pagination.total = this.chapters.length;
            this.renderChaptersList();
            this.updateStatistics();

        }, 1000);
    },

    /**
     * 生成模拟章节数据
     */
    generateChaptersData: function(count) {
        const chapters = [];
        const statuses = ['published', 'draft', 'scheduled'];
        const titles = [
            '初入异界', '神秘传承', '强者之路', '秘境探险', '生死考验',
            '突破境界', '新的征程', '宿命对决', '真相揭露', '最终决战'
        ];

        for (let i = 1; i <= count; i++) {
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const title = titles[Math.floor(Math.random() * titles.length)];
            const words = Math.floor(Math.random() * 5000) + 1500;
            const views = status === 'published' ? Math.floor(Math.random() * 10000) + 1000 : 0;
            const comments = status === 'published' ? Math.floor(Math.random() * 100) : 0;

            chapters.push({
                id: i,
                workId: this.currentWorkId,
                order: i,
                title: `第${this.numberToChinese(i)}章 ${title}`,
                content: this.generateChapterContent(),
                status: status,
                words: words,
                views: views,
                comments: comments,
                createTime: this.randomDate(new Date(2023, 0, 1), new Date()),
                updateTime: this.randomDate(new Date(2023, 0, 1), new Date()),
                publishTime: status === 'scheduled' ? this.randomDate(new Date(), new Date(2024, 0, 1)) : null,
                authorNote: i % 5 === 0 ? '感谢大家的支持，我会继续努力更新的！' : null
            });
        }

        return chapters;
    },

    /**
     * 生成章节内容
     */
    generateChapterContent: function() {
        const paragraphs = [];
        const paragraphCount = Math.floor(Math.random() * 10) + 5;

        for (let i = 0; i < paragraphCount; i++) {
            const sentenceCount = Math.floor(Math.random() * 5) + 3;
            let paragraph = '';

            for (let j = 0; j < sentenceCount; j++) {
                const wordCount = Math.floor(Math.random() * 20) + 10;
                let sentence = '';

                for (let k = 0; k < wordCount; k++) {
                    sentence += '内容 ';
                }

                paragraph += sentence.trim() + '。';
            }

            paragraphs.push(paragraph);
        }

        return paragraphs.join('\n\n');
    },

    /**
     * 设置事件监听器
     */
    setupEventListeners: function() {
        // 章节状态改变时显示/隐藏发布时间输入框
        const statusSelect = document.getElementById('chapterStatus');
        if (statusSelect) {
            statusSelect.addEventListener('change', (e) => {
                this.togglePublishTimeField(e.target.value);
            });
        }

        // 内容输入时更新字数统计
        const contentTextarea = document.getElementById('chapterContent');
        if (contentTextarea) {
            contentTextarea.addEventListener('input', () => {
                this.updateWordCount();
            });
        }

        // 模态框点击外部关闭
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                    this.closePreviewModal();
                    this.closeBatchModal();
                    this.closeDeleteModal();
                }
            });
        });
    },

    /**
     * 显示加载状态
     */
    showLoadingState: function() {
        const container = document.getElementById('chaptersList');
        if (!container) return;

        let skeletonHTML = '';
        for (let i = 0; i < 5; i++) {
            skeletonHTML += `
                <div class="chapter-skeleton">
                    <div class="skeleton-line short" style="height: 20px; margin-bottom: 10px;"></div>
                    <div class="skeleton-line medium" style="height: 16px; margin-bottom: 8px;"></div>
                    <div class="skeleton-line long" style="height: 14px; margin-bottom: 15px;"></div>
                    <div class="skeleton-line short" style="height: 12px; width: 40%;"></div>
                </div>
            `;
        }

        container.innerHTML = `<div class="loading-chapters">${skeletonHTML}</div>`;
    },

    /**
     * 渲染章节列表
     */
    renderChaptersList: function() {
        const container = document.getElementById('chaptersList');
        if (!container) return;

        const filteredChapters = this.getFilteredChapters();

        if (filteredChapters.length === 0) {
            container.innerHTML = this.getEmptyStateHTML();
            return;
        }

        const chaptersHTML = filteredChapters.map(chapter => this.getChapterItemHTML(chapter)).join('');
        container.innerHTML = chaptersHTML;

        this.renderPagination();
    },

    /**
     * 获取筛选后的章节
     */
    getFilteredChapters: function() {
        let filtered = [...this.chapters];

        // 搜索筛选
        if (this.filters.search) {
            const searchLower = this.filters.search.toLowerCase();
            filtered = filtered.filter(chapter =>
                chapter.title.toLowerCase().includes(searchLower) ||
                chapter.content.toLowerCase().includes(searchLower)
            );
        }

        // 状态筛选
        if (this.filters.status !== 'all') {
            filtered = filtered.filter(chapter => chapter.status === this.filters.status);
        }

        // 排序
        filtered.sort((a, b) => {
            switch (this.filters.sortBy) {
                case 'createTime':
                    return new Date(b.createTime) - new Date(a.createTime);
                case 'updateTime':
                    return new Date(b.updateTime) - new Date(a.updateTime);
                case 'views':
                    return b.views - a.views;
                case 'order':
                default:
                    return a.order - b.order;
            }
        });

        return filtered;
    },

    /**
     * 获取章节项HTML
     */
    getChapterItemHTML: function(chapter) {
        const isSelected = this.selectedChapters.has(chapter.id);

        return `
            <div class="chapter-item ${isSelected ? 'selected' : ''}" data-chapter-id="${chapter.id}">
                <div class="chapter-header">
                    <div class="chapter-basic-info">
                        <div class="chapter-checkbox">
                            <input type="checkbox" ${isSelected ? 'checked' : ''} 
                                onchange="chapterManager.toggleChapterSelection(${chapter.id}, this.checked)">
                        </div>
                        <div class="chapter-main-info">
                            <div class="chapter-title-row">
                                <span class="chapter-order">第${this.numberToChinese(chapter.order)}章</span>
                                <h3 class="chapter-title">${chapter.title}</h3>
                                <span class="chapter-status ${chapter.status}">${this.getStatusText(chapter.status)}</span>
                            </div>
                            <div class="chapter-meta">
                                <span><i class="fas fa-calendar"></i> ${this.formatDate(chapter.updateTime)}</span>
                                <span><i class="fas fa-file-word"></i> ${this.formatNumber(chapter.words)}字</span>
                                ${chapter.status === 'published' ? `
                                    <span><i class="fas fa-eye"></i> ${this.formatNumber(chapter.views)}阅读</span>
                                    <span><i class="fas fa-comment"></i> ${chapter.comments}评论</span>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="chapter-actions">
                        <button class="btn btn-primary btn-sm" onclick="chapterManager.editChapter(${chapter.id})">
                            <i class="fas fa-edit"></i> 编辑
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="chapterManager.previewChapter(${chapter.id})">
                            <i class="fas fa-eye"></i> 预览
                        </button>
                        ${chapter.status === 'draft' ? `
                        <button class="btn btn-success btn-sm" onclick="chapterManager.publishChapter(${chapter.id})">
                            <i class="fas fa-paper-plane"></i> 发布
                        </button>
                        ` : ''}
                        <button class="btn btn-danger btn-sm" onclick="chapterManager.showDeleteModal(${chapter.id})">
                            <i class="fas fa-trash"></i> 删除
                        </button>
                    </div>
                </div>
                <div class="chapter-preview">${this.getContentPreview(chapter.content)}</div>
                <div class="chapter-extra-info">
                    <span>创建: ${this.formatDate(chapter.createTime)}</span>
                    ${chapter.authorNote ? `<span>作者说: ${chapter.authorNote}</span>` : ''}
                    ${chapter.publishTime ? `<span>定时发布: ${this.formatDateTime(chapter.publishTime)}</span>` : ''}
                </div>
            </div>
        `;
    },

    /**
     * 获取内容预览
     */
    getContentPreview: function(content) {
        const plainText = content.replace(/<[^>]*>/g, '');
        return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
    },

    /**
     * 获取空状态HTML
     */
    getEmptyStateHTML: function() {
        return `
            <div class="empty-chapters">
                <div class="empty-chapters-icon">
                    <i class="fas fa-file-alt"></i>
                </div>
                <div class="empty-chapters-title">暂无章节</div>
                <div class="empty-chapters-description">
                    ${this.filters.search || this.filters.status !== 'all' ? 
                        '没有找到符合条件的章节，尝试调整搜索条件' : 
                        '开始为您的作品创建第一个章节吧'
                    }
                </div>
                ${!this.filters.search && this.filters.status === 'all' ? `
                    <button class="btn btn-primary" onclick="chapterManager.showCreateModal()">
                        <i class="fas fa-plus"></i> 创建新章节
                    </button>
                ` : `
                    <button class="btn btn-secondary" onclick="chapterManager.clearFilters()">
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
        const container = document.getElementById('chaptersPagination');
        if (!container) return;

        const totalPages = Math.ceil(this.pagination.total / this.pagination.pageSize);

        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = `
            <button class="btn btn-secondary btn-sm" ${this.pagination.currentPage === 1 ? 'disabled' : ''} 
                onclick="chapterManager.goToPage(${this.pagination.currentPage - 1})">
                <i class="fas fa-chevron-left"></i> 上一页
            </button>
            <div class="page-numbers">
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (i === this.pagination.currentPage) {
                paginationHTML += `<span class="page-number active">${i}</span>`;
            } else {
                paginationHTML += `<span class="page-number" onclick="chapterManager.goToPage(${i})">${i}</span>`;
            }
        }

        paginationHTML += `
            </div>
            <button class="btn btn-secondary btn-sm" ${this.pagination.currentPage === totalPages ? 'disabled' : ''} 
                onclick="chapterManager.goToPage(${this.pagination.currentPage + 1})">
                下一页 <i class="fas fa-chevron-right"></i>
            </button>
        `;

        container.innerHTML = paginationHTML;
    },

    /**
     * 显示创建章节模态框
     */
    showCreateModal: function() {
        if (!this.currentWorkId) return;

        this.currentEditId = null;
        document.getElementById('modalTitle').textContent = '新建章节';
        document.getElementById('chapterForm').reset();

        // 设置默认章节序号
        const nextOrder = this.chapters.length > 0 ? Math.max(...this.chapters.map(c => c.order)) + 1 : 1;
        document.getElementById('chapterOrder').value = nextOrder;

        // 清空内容区域
        document.getElementById('chapterContent').value = '';
        document.getElementById('authorNote').value = '';

        this.updateWordCount();
        this.togglePublishTimeField('draft');

        document.getElementById('chapterModal').classList.add('show');
    },

    /**
     * 显示编辑章节模态框
     */
    editChapter: function(chapterId) {
        const chapter = this.chapters.find(c => c.id === chapterId);
        if (!chapter) return;

        this.currentEditId = chapterId;
        document.getElementById('modalTitle').textContent = '编辑章节';

        // 填充表单数据
        document.getElementById('chapterTitle').value = chapter.title;
        document.getElementById('chapterOrder').value = chapter.order;
        document.getElementById('chapterStatus').value = chapter.status;
        document.getElementById('chapterContent').value = chapter.content;
        document.getElementById('authorNote').value = chapter.authorNote || '';

        if (chapter.publishTime) {
            const publishTime = new Date(chapter.publishTime);
            document.getElementById('publishTime').value = publishTime.toISOString().slice(0, 16);
        }

        this.updateWordCount();
        this.togglePublishTimeField(chapter.status);

        document.getElementById('chapterModal').classList.add('show');
    },

    /**
     * 切换发布时间字段显示
     */
    togglePublishTimeField: function(status) {
        const publishTimeGroup = document.getElementById('publishTimeGroup');
        if (status === 'scheduled') {
            publishTimeGroup.style.display = 'block';
        } else {
            publishTimeGroup.style.display = 'none';
        }
    },

    /**
     * 更新字数统计
     */
    updateWordCount: function() {
        const content = document.getElementById('chapterContent').value;
        const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
        const characterCount = content.length;

        document.getElementById('wordCount').textContent = wordCount;
        document.getElementById('characterCount').textContent = characterCount;
    },

    /**
     * 编辑器格式化文本
     */
    formatText: function(format) {
        const textarea = document.getElementById('chapterContent');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);

        let formattedText = '';

        switch (format) {
            case 'bold':
                formattedText = `**${selectedText}**`;
                break;
            case 'italic':
                formattedText = `*${selectedText}*`;
                break;
            case 'underline':
                formattedText = `<u>${selectedText}</u>`;
                break;
        }

        textarea.setRangeText(formattedText, start, end, 'select');
        textarea.focus();
    },

    /**
     * 插入标题
     */
    insertHeading: function() {
        const textarea = document.getElementById('chapterContent');
        const start = textarea.selectionStart;

        textarea.setRangeText('\n## 小标题\n', start, start, 'end');
        textarea.focus();
    },

    /**
     * 插入段落
     */
    insertParagraph: function() {
        const textarea = document.getElementById('chapterContent');
        const start = textarea.selectionStart;

        textarea.setRangeText('\n\n新的段落内容...\n', start, start, 'end');
        textarea.focus();
    },

    /**
     * 字数统计
     */
    wordCount: function() {
        this.updateWordCount();
        utils.showNotification(`当前字数: ${document.getElementById('wordCount').textContent}字`);
    },

    /**
     * 保存章节
     */
    saveChapter: function(event) {
        event.preventDefault();

        const formData = {
            title: document.getElementById('chapterTitle').value.trim(),
            order: parseInt(document.getElementById('chapterOrder').value),
            status: document.getElementById('chapterStatus').value,
            content: document.getElementById('chapterContent').value.trim(),
            authorNote: document.getElementById('authorNote').value.trim(),
            publishTime: document.getElementById('chapterStatus').value === 'scheduled' ?
                document.getElementById('publishTime').value : null
        };

        // 验证表单
        if (!this.validateChapterForm(formData)) {
            return;
        }

        // 模拟API调用
        if (this.currentEditId) {
            // 更新章节
            this.updateChapter(this.currentEditId, formData);
        } else {
            // 创建章节
            this.createChapter(formData);
        }
    },

    /**
     * 保存草稿
     */
    saveDraft: function() {
        const formData = {
            title: document.getElementById('chapterTitle').value.trim() || '未命名章节',
            order: parseInt(document.getElementById('chapterOrder').value) || 1,
            status: 'draft',
            content: document.getElementById('chapterContent').value.trim(),
            authorNote: document.getElementById('authorNote').value.trim()
        };

        if (!formData.content) {
            utils.showNotification('请先输入章节内容', false);
            return;
        }

        // 模拟API调用
        if (this.currentEditId) {
            this.updateChapter(this.currentEditId, formData);
        } else {
            this.createChapter(formData);
        }
    },

    /**
     * 验证章节表单
     */
    validateChapterForm: function(formData) {
        if (!formData.title) {
            utils.showNotification('请输入章节标题', false);
            return false;
        }

        if (!formData.order || formData.order < 1) {
            utils.showNotification('请输入有效的章节序号', false);
            return false;
        }

        if (!formData.content) {
            utils.showNotification('请输入章节内容', false);
            return false;
        }

        if (formData.title.length > 100) {
            utils.showNotification('章节标题不能超过100个字符', false);
            return false;
        }

        if (formData.authorNote.length > 500) {
            utils.showNotification('作者说不能超过500个字符', false);
            return false;
        }

        return true;
    },

    /**
     * 创建章节
     */
    createChapter: function(formData) {
        // 模拟API调用
        setTimeout(() => {
            const newChapter = {
                id: Date.now(),
                workId: this.currentWorkId,
                ...formData,
                words: formData.content.length,
                views: 0,
                comments: 0,
                createTime: new Date().toISOString(),
                updateTime: new Date().toISOString()
            };

            this.chapters.unshift(newChapter);
            this.pagination.total = this.chapters.length;
            this.renderChaptersList();
            this.updateStatistics();
            this.closeModal();

            utils.showNotification('章节创建成功！');
        }, 1000);
    },

    /**
     * 更新章节
     */
    updateChapter: function(chapterId, formData) {
        // 模拟API调用
        setTimeout(() => {
            const chapterIndex = this.chapters.findIndex(c => c.id === chapterId);
            if (chapterIndex !== -1) {
                this.chapters[chapterIndex] = {
                    ...this.chapters[chapterIndex],
                    ...formData,
                    words: formData.content.length,
                    updateTime: new Date().toISOString()
                };

                this.renderChaptersList();
                this.updateStatistics();
                this.closeModal();

                utils.showNotification('章节更新成功！');
            }
        }, 1000);
    },

    /**
     * 发布章节
     */
    publishChapter: function(chapterId) {
        if (!confirm('确定要发布这个章节吗？发布后读者将可以阅读。')) {
            return;
        }

        // 模拟API调用
        setTimeout(() => {
            const chapter = this.chapters.find(c => c.id === chapterId);
            if (chapter) {
                chapter.status = 'published';
                chapter.updateTime = new Date().toISOString();
                this.renderChaptersList();
                utils.showNotification('章节发布成功！');
            }
        }, 1000);
    },

    /**
     * 预览章节
     */
    previewChapter: function(chapterId) {
        const chapter = this.chapters.find(c => c.id === chapterId);
        if (!chapter) return;

        const previewContent = document.getElementById('previewContent');
        previewContent.innerHTML = this.generatePreviewHTML(chapter);

        document.getElementById('previewModal').classList.add('show');
    },

    /**
     * 生成预览HTML
     */
    generatePreviewHTML: function(chapter) {
        return `
            <div class="chapter-title">${chapter.title}</div>
            <div class="chapter-meta">
                <span>字数: ${this.formatNumber(chapter.words)}</span>
                <span>更新时间: ${this.formatDateTime(chapter.updateTime)}</span>
            </div>
            <div class="chapter-content">
                ${chapter.content.split('\n\n').map(paragraph => 
                    `<p>${paragraph}</p>`
                ).join('')}
            </div>
            ${chapter.authorNote ? `
                <div class="author-note">
                    <strong>作者说：</strong>${chapter.authorNote}
                </div>
            ` : ''}
        `;
    },

    // ==================== 批量操作功能 ====================

    /**
     * 切换章节选择状态
     */
    toggleChapterSelection: function(chapterId, isSelected) {
        if (isSelected) {
            this.selectedChapters.add(chapterId);
        } else {
            this.selectedChapters.delete(chapterId);
        }

        // 更新UI
        const chapterElement = document.querySelector(`[data-chapter-id="${chapterId}"]`);
        if (chapterElement) {
            chapterElement.classList.toggle('selected', isSelected);
        }

        this.updateBatchActionsBar();
    },

    /**
     * 更新批量操作栏
     */
    updateBatchActionsBar: function() {
        const batchBar = document.getElementById('batchActionsBar');
        const selectedCount = document.getElementById('selectedCount');

        if (this.selectedChapters.size > 0) {
            batchBar.style.display = 'flex';
            selectedCount.textContent = this.selectedChapters.size;
        } else {
            batchBar.style.display = 'none';
        }
    },

    /**
     * 显示批量操作
     */
    showBatchActions: function() {
        if (this.selectedChapters.size === 0) {
            utils.showNotification('请先选择章节', false);
            return;
        }

        // 这里可以实现不同的批量操作类型
        // 目前只显示一个通用的批量操作模态框
        this.showBatchPublishModal();
    },

    /**
     * 显示批量发布模态框
     */
    showBatchPublishModal: function() {
        document.getElementById('batchModalTitle').textContent = '批量发布章节';
        document.getElementById('batchModalContent').innerHTML = `
            <p>确定要发布选中的 <strong>${this.selectedChapters.size}</strong> 个章节吗？</p>
            <div class="warning-message">
                <i class="fas fa-exclamation-triangle"></i>
                <span>发布后读者将可以立即阅读这些章节</span>
            </div>
        `;

        const confirmBtn = document.getElementById('confirmBatchBtn');
        confirmBtn.textContent = '确认发布';
        confirmBtn.onclick = () => this.executeBatchPublish();

        document.getElementById('batchModal').classList.add('show');
    },

    /**
     * 执行批量发布
     */
    executeBatchPublish: function() {
        // 模拟API调用
        setTimeout(() => {
            this.selectedChapters.forEach(chapterId => {
                const chapter = this.chapters.find(c => c.id === chapterId);
                if (chapter && chapter.status === 'draft') {
                    chapter.status = 'published';
                    chapter.updateTime = new Date().toISOString();
                }
            });

            this.renderChaptersList();
            this.clearSelection();
            this.closeBatchModal();

            utils.showNotification(`成功发布 ${this.selectedChapters.size} 个章节`);
        }, 1000);
    },

    /**
     * 批量删除
     */
    batchDelete: function() {
        if (this.selectedChapters.size === 0) return;

        document.getElementById('deleteMessage').textContent =
            `确定要删除选中的 ${this.selectedChapters.size} 个章节吗？此操作不可恢复！`;

        const confirmBtn = document.getElementById('confirmDeleteBtn');
        confirmBtn.onclick = () => this.executeBatchDelete();

        document.getElementById('deleteModal').classList.add('show');
    },

    /**
     * 执行批量删除
     */
    executeBatchDelete: function() {
        // 模拟API调用
        setTimeout(() => {
            this.chapters = this.chapters.filter(chapter => !this.selectedChapters.has(chapter.id));
            this.pagination.total = this.chapters.length;
            this.renderChaptersList();
            this.updateStatistics();
            this.clearSelection();
            this.closeDeleteModal();

            utils.showNotification(`成功删除 ${this.selectedChapters.size} 个章节`);
        }, 1000);
    },

    /**
     * 批量移动（占位功能）
     */
    batchMove: function() {
        utils.showNotification('批量移动功能开发中...', true);
    },

    /**
     * 清除选择
     */
    clearSelection: function() {
        this.selectedChapters.clear();
        this.updateBatchActionsBar();

        // 更新UI
        document.querySelectorAll('.chapter-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelectorAll('.chapter-checkbox input').forEach(checkbox => {
            checkbox.checked = false;
        });
    },

    // ==================== 其他功能 ====================

    /**
     * 搜索章节
     */
    searchChapters: function(query) {
        this.filters.search = query;
        this.pagination.currentPage = 1;
        this.renderChaptersList();
    },

    /**
     * 筛选章节
     */
    filterChapters: function() {
        this.filters.status = document.getElementById('statusFilter').value;
        this.pagination.currentPage = 1;
        this.renderChaptersList();
    },

    /**
     * 排序章节
     */
    sortChapters: function() {
        this.filters.sortBy = document.getElementById('sortBy').value;
        this.renderChaptersList();
    },

    /**
     * 清除筛选条件
     */
    clearFilters: function() {
        this.filters.search = '';
        this.filters.status = 'all';
        this.filters.sortBy = 'order';

        document.getElementById('chapterSearch').value = '';
        document.getElementById('statusFilter').value = 'all';
        document.getElementById('sortBy').value = 'order';

        this.pagination.currentPage = 1;
        this.renderChaptersList();
    },

    /**
     * 跳转到指定页面
     */
    goToPage: function(page) {
        this.pagination.currentPage = page;
        this.renderChaptersList();
    },

    /**
     * 更新统计信息
     */
    updateStatistics: function() {
        const totalChapters = this.chapters.length;
        const totalWords = this.chapters.reduce((sum, chapter) => sum + chapter.words, 0);

        document.getElementById('totalChaptersCount').textContent = totalChapters;
        document.getElementById('totalWordsCount').textContent = this.formatNumber(totalWords);
    },

    /**
     * 导出章节
     */
    exportChapters: function() {
        if (!this.currentWorkId) {
            utils.showNotification('请先选择作品', false);
            return;
        }

        utils.showNotification('正在准备导出数据...', true);

        // 模拟导出过程
        setTimeout(() => {
            utils.showNotification('章节数据导出成功！');
        }, 2000);
    },

    /**
     * 显示删除确认模态框
     */
    showDeleteModal: function(chapterId) {
        const chapter = this.chapters.find(c => c.id === chapterId);
        if (!chapter) return;

        document.getElementById('deleteMessage').textContent =
            `确定要删除章节 "${chapter.title}" 吗？此操作不可恢复！`;

        const confirmBtn = document.getElementById('confirmDeleteBtn');
        confirmBtn.onclick = () => this.deleteChapter(chapterId);

        document.getElementById('deleteModal').classList.add('show');
    },

    /**
     * 删除章节
     */
    deleteChapter: function(chapterId) {
        // 模拟API调用
        setTimeout(() => {
            this.chapters = this.chapters.filter(c => c.id !== chapterId);
            this.pagination.total = this.chapters.length;
            this.renderChaptersList();
            this.updateStatistics();
            this.closeDeleteModal();

            utils.showNotification('章节删除成功');
        }, 1000);
    },

    /**
     * 编辑当前预览的章节
     */
    editCurrentPreview: function() {
        this.closePreviewModal();
        // 这里需要知道当前预览的是哪个章节
        // 在实际实现中，我们需要记录当前预览的章节ID
    },

    // ==================== 模态框关闭方法 ====================

    closeModal: function() {
        document.getElementById('chapterModal').classList.remove('show');
        this.currentEditId = null;
    },

    closePreviewModal: function() {
        document.getElementById('previewModal').classList.remove('show');
    },

    closeBatchModal: function() {
        document.getElementById('batchModal').classList.remove('show');
    },

    closeDeleteModal: function() {
        document.getElementById('deleteModal').classList.remove('show');
    },

    // ==================== 工具方法 ====================

    /**
     * 获取状态文本
     */
    getStatusText: function(status) {
        const statusMap = {
            'published': '已发布',
            'draft': '草稿',
            'scheduled': '定时发布'
        };
        return statusMap[status] || '未知';
    },

    /**
     * 数字转中文
     */
    numberToChinese: function(num) {
        const chineseNumbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
        if (num <= 10) return chineseNumbers[num];
        if (num < 20) return '十' + chineseNumbers[num - 10];
        if (num < 100) {
            const tens = Math.floor(num / 10);
            const units = num % 10;
            return chineseNumbers[tens] + '十' + (units > 0 ? chineseNumbers[units] : '');
        }
        return num.toString();
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
        return date.toLocaleDateString('zh-CN');
    },

    /**
     * 格式化日期时间
     */
    formatDateTime: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN');
    },

    /**
     * 生成随机日期
     */
    randomDate: function(start, end) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
    }
};

// ==================== 页面初始化 ====================

/**
 * 初始化章节管理页面
 */
function initChapterManagement() {
    console.log('🚀 初始化章节管理页面...');

    // 检查用户权限
    if (!checkAuthorAccess()) {
        return;
    }

    // 初始化章节管理模块
    chapterManager.init();

    // 检查页面访问权限
    checkPageAccess();

    console.log('✅ 章节管理页面初始化完成');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initChapterManagement();
});

// 全局暴露
window.chapterManager = chapterManager;