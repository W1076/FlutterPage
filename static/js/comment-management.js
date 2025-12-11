/**
 * FlutterPage - 评论管理脚本
 * 负责评论的展示、回复、删除和批量操作功能
 */

// 评论管理模块
const commentManager = {
    // 当前选中的作品ID
    currentWorkId: 'all',

    // 当前回复的评论ID
    currentReplyId: null,

    // 选中的评论ID列表（用于批量操作）
    selectedComments: new Set(),

    // 评论数据
    comments: [],

    // 筛选状态
    filters: {
        search: '',
        status: 'all',
        sentiment: 'all',
        sortBy: 'newest'
    },

    // 分页信息
    pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
    },

    /**
     * 初始化评论管理模块
     */
    init: function() {
        this.loadWorks();
        this.loadComments();
        this.setupEventListeners();

        console.log('评论管理模块初始化完成');
    },

    /**
     * 加载作品列表
     */
    loadWorks: function() {
        // 模拟作品数据 - 实际项目中从后端API获取
        const works = [
            { id: 1, title: '星穹传说' },
            { id: 2, title: '灵域迷踪' },
            { id: 3, title: '剑影仙途' }
        ];

        const workSelect = document.getElementById('workSelect');
        works.forEach(work => {
            const option = document.createElement('option');
            option.value = work.id;
            option.textContent = work.title;
            workSelect.appendChild(option);
        });
    },

    /**
     * 加载评论数据
     */
    loadComments: function() {
        this.showLoadingState();

        // 模拟API调用 - 实际项目中从后端获取
        setTimeout(() => {
            this.generateMockData();
            this.renderStats();
            this.renderCommentsList();

            utils.showNotification('评论数据加载完成');
        }, 1500);
    },

    /**
     * 生成模拟数据
     */
    generateMockData: function() {
        this.comments = this.generateCommentsData(25);
        this.pagination.total = this.comments.length;
    },

    /**
     * 生成评论数据
     */
    generateCommentsData: function(count) {
        const comments = [];
        const works = ['星穹传说', '灵域迷踪', '剑影仙途', '数据觉醒', '美食异世界'];
        const readers = [
            { name: '书迷小张', level: '忠实读者', avatar: '书' },
            { name: '文学爱好者', level: '高级读者', avatar: '文' },
            { name: '追更达人', level: '铁杆粉丝', avatar: '追' },
            { name: '星空漫步', level: '新读者', avatar: '星' },
            { name: '时光旅行者', level: '高级读者', avatar: '时' }
        ];
        const sentiments = ['positive', 'neutral', 'negative'];
        const sentimentTexts = {
            'positive': '好评',
            'neutral': '中评',
            'negative': '差评'
        };

        const commentsTexts = [
            '大大写得真好！情节紧凑，人物塑造也很立体，期待后续发展！',
            '这一章太精彩了，主角的成长让人感动，希望作者能保持这个水准。',
            '有些地方逻辑不太通，希望作者能再斟酌一下。',
            '更新速度能不能快一点？每天都等得好着急啊！',
            '配角的故事线也很吸引人，希望能多写一些配角的内容。',
            '文笔优美，描写细腻，读起来很享受。',
            '世界观设定很新颖，期待后续的展开。',
            '感情线发展得有点快，希望能更自然一些。',
            '战斗场面写得很精彩，画面感很强！',
            '希望作者能多注意一下细节描写，有些地方略显仓促。'
        ];

        for (let i = 0; i < count; i++) {
            const reader = readers[Math.floor(Math.random() * readers.length)];
            const work = works[Math.floor(Math.random() * works.length)];
            const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
            const content = commentsTexts[Math.floor(Math.random() * commentsTexts.length)];
            const date = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
            const likes = Math.floor(Math.random() * 50);
            const hasReplies = Math.random() > 0.5;
            const isPinned = Math.random() > 0.8;
            const isUnread = Math.random() > 0.6;

            const comment = {
                id: i + 1,
                workId: works.indexOf(work) + 1,
                work: work,
                reader: reader.name,
                readerLevel: reader.level,
                readerAvatar: reader.avatar,
                content: content,
                sentiment: sentiment,
                sentimentText: sentimentTexts[sentiment],
                time: date.toISOString(),
                likes: likes,
                replies: hasReplies ? Math.floor(Math.random() * 5) : 0,
                isPinned: isPinned,
                isUnread: isUnread,
                hasReplied: Math.random() > 0.4,
                chapter: `第${this.numberToChinese(Math.floor(Math.random() * 100) + 1)}章`
            };

            // 生成回复数据
            if (hasReplies) {
                comment.repliesList = this.generateRepliesData(comment.replies, comment.hasReplied);
            }

            comments.push(comment);
        }

        // 按时间倒序排列
        return comments.sort((a, b) => new Date(b.time) - new Date(a.time));
    },

    /**
     * 生成回复数据
     */
    generateRepliesData: function(count, hasAuthorReply) {
        const replies = [];
        const readers = ['书友123', '文学少年', '星空追梦', '时光旅人'];
        const authorReplied = hasAuthorReply;

        for (let i = 0; i < count; i++) {
            const isAuthor = authorReplied && i === count - 1;
            const replier = isAuthor ? '作者' : readers[Math.floor(Math.random() * readers.length)];
            const avatar = isAuthor ? '作' : replier.charAt(0);
            const date = new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000);

            const replyTexts = [
                '谢谢支持！我会继续努力的！',
                '这个建议很好，我会考虑的。',
                '后续情节会更精彩的，敬请期待！',
                '我也很喜欢这个角色！',
                '感谢指出问题，我会修改的。',
                '哈哈，这个细节被你发现了！',
                '新的章节已经在写了！',
                '谢谢打赏！太感动了！'
            ];

            const content = isAuthor ?
                replyTexts[Math.floor(Math.random() * replyTexts.length)] :
                `回复${replies.length > 0 ? '楼上' : '楼主'}：说的很有道理！`;

            replies.push({
                id: i + 1,
                replier: replier,
                replierAvatar: avatar,
                content: content,
                time: date.toISOString(),
                isAuthor: isAuthor,
                likes: Math.floor(Math.random() * 20)
            });
        }

        return replies;
    },

    /**
     * 设置事件监听器
     */
    setupEventListeners: function() {
        // 评论内容点击展开/收起
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('comment-content')) {
                this.toggleCommentExpand(e.target);
            }
        });

        // 模态框点击外部关闭
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeReplyModal();
                    this.closeBatchReplyModal();
                    this.closeCommentDetailModal();
                    this.closeDeleteModal();
                }
            });
        });
    },

    /**
     * 显示加载状态
     */
    showLoadingState: function() {
        const container = document.getElementById('commentsList');
        if (!container) return;

        let skeletonHTML = '';
        for (let i = 0; i < 5; i++) {
            skeletonHTML += `
                <div class="comment-skeleton">
                    <div class="skeleton-line short" style="height: 20px; margin-bottom: 15px;"></div>
                    <div class="skeleton-line long" style="height: 60px; margin-bottom: 15px;"></div>
                    <div class="skeleton-line medium" style="height: 16px; margin-bottom: 10px;"></div>
                    <div class="skeleton-line short" style="height: 12px; width: 40%;"></div>
                </div>
            `;
        }

        container.innerHTML = `<div class="loading-comments">${skeletonHTML}</div>`;
    },

    /**
     * 渲染统计信息
     */
    renderStats: function() {
        const totalComments = this.comments.length;
        const unrepliedComments = this.comments.filter(c => !c.hasReplied).length;
        const positiveComments = this.comments.filter(c => c.sentiment === 'positive').length;
        const todayComments = this.comments.filter(c => {
            const commentDate = new Date(c.time);
            const today = new Date();
            return commentDate.toDateString() === today.toDateString();
        }).length;

        document.getElementById('totalComments').textContent = totalComments;
        document.getElementById('unrepliedComments').textContent = unrepliedComments;
        document.getElementById('positiveComments').textContent = positiveComments;
        document.getElementById('todayComments').textContent = todayComments;
        document.getElementById('totalCommentsCount').textContent = totalComments;
    },

    /**
     * 渲染评论列表
     */
    renderCommentsList: function() {
        const container = document.getElementById('commentsList');
        if (!container) return;

        const filteredComments = this.getFilteredComments();

        if (filteredComments.length === 0) {
            container.innerHTML = this.getEmptyStateHTML();
            return;
        }

        const commentsHTML = filteredComments.map(comment => this.getCommentHTML(comment)).join('');
        container.innerHTML = commentsHTML;

        this.renderPagination();
    },

    /**
     * 获取筛选后的评论
     */
    getFilteredComments: function() {
        let filtered = [...this.comments];

        // 作品筛选
        if (this.currentWorkId !== 'all') {
            filtered = filtered.filter(comment => comment.workId === parseInt(this.currentWorkId));
        }

        // 搜索筛选
        if (this.filters.search) {
            const searchLower = this.filters.search.toLowerCase();
            filtered = filtered.filter(comment =>
                comment.content.toLowerCase().includes(searchLower) ||
                comment.reader.toLowerCase().includes(searchLower) ||
                comment.work.toLowerCase().includes(searchLower)
            );
        }

        // 状态筛选
        if (this.filters.status !== 'all') {
            switch (this.filters.status) {
                case 'unreplied':
                    filtered = filtered.filter(comment => !comment.hasReplied);
                    break;
                case 'replied':
                    filtered = filtered.filter(comment => comment.hasReplied);
                    break;
                case 'pinned':
                    filtered = filtered.filter(comment => comment.isPinned);
                    break;
            }
        }

        // 情感筛选
        if (this.filters.sentiment !== 'all') {
            filtered = filtered.filter(comment => comment.sentiment === this.filters.sentiment);
        }

        // 排序
        filtered.sort((a, b) => {
            switch (this.filters.sortBy) {
                case 'oldest':
                    return new Date(a.time) - new Date(b.time);
                case 'likes':
                    return b.likes - a.likes;
                case 'replies':
                    return b.replies - a.replies;
                case 'newest':
                default:
                    return new Date(b.time) - new Date(a.time);
            }
        });

        return filtered;
    },

    /**
     * 获取评论HTML
     */
    getCommentHTML: function(comment) {
        const isSelected = this.selectedComments.has(comment.id);
        const sentimentClass = `sentiment-${comment.sentiment}`;

        return `
            <div class="comment-item ${comment.isUnread ? 'unread' : ''} ${comment.isPinned ? 'pinned' : ''} ${isSelected ? 'selected' : ''}" 
                 data-comment-id="${comment.id}">
                ${comment.isPinned ? `
                    <div class="pinned-badge">
                        <i class="fas fa-thumbtack"></i> 置顶
                    </div>
                ` : ''}
                
                <div class="comment-checkbox">
                    <input type="checkbox" ${isSelected ? 'checked' : ''} 
                        onchange="commentManager.toggleCommentSelection(${comment.id}, this.checked)">
                </div>
                
                <div class="comment-header">
                    <div class="comment-user">
                        <div class="user-avatar">${comment.readerAvatar}</div>
                        <div class="user-info">
                            <div class="user-name">${comment.reader}</div>
                            <div class="user-level">
                                <span class="level-badge">${comment.readerLevel}</span>
                                <span>${this.formatDate(comment.time)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="comment-meta">
                        <div class="comment-work">《${comment.work}》${comment.chapter}</div>
                        <div class="comment-time">${this.formatTime(comment.time)}</div>
                    </div>
                </div>
                
                <div class="comment-sentiment ${sentimentClass}">
                    <i class="fas ${this.getSentimentIcon(comment.sentiment)}"></i>
                    ${comment.sentimentText}
                </div>
                
                <div class="comment-content">${comment.content}</div>
                
                ${comment.repliesList && comment.repliesList.length > 0 ? `
                    <div class="replies-list">
                        ${comment.repliesList.map(reply => this.getReplyHTML(reply)).join('')}
                    </div>
                ` : ''}
                
                <div class="comment-actions">
                    <div class="comment-stats">
                        <div class="comment-stat ${comment.likes > 0 ? 'active' : ''}" 
                             onclick="commentManager.likeComment(${comment.id})">
                            <i class="fas fa-thumbs-up stat-icon"></i>
                            <span>${comment.likes}</span>
                        </div>
                        <div class="comment-stat ${comment.replies > 0 ? 'active' : ''}" 
                             onclick="commentManager.toggleReplies(${comment.id})">
                            <i class="fas fa-comment stat-icon"></i>
                            <span>${comment.replies}</span>
                        </div>
                        <div class="comment-stat" onclick="commentManager.shareComment(${comment.id})">
                            <i class="fas fa-share stat-icon"></i>
                            <span>分享</span>
                        </div>
                    </div>
                    <div class="action-buttons">
                        <button class="btn btn-primary btn-sm" onclick="commentManager.replyToComment(${comment.id})">
                            <i class="fas fa-reply"></i> 回复
                        </button>
                        ${comment.isPinned ? `
                            <button class="btn btn-secondary btn-sm" onclick="commentManager.unpinComment(${comment.id})">
                                <i class="fas fa-thumbtack"></i> 取消置顶
                            </button>
                        ` : `
                            <button class="btn btn-secondary btn-sm" onclick="commentManager.pinComment(${comment.id})">
                                <i class="fas fa-thumbtack"></i> 置顶
                            </button>
                        `}
                        <button class="btn btn-secondary btn-sm" onclick="commentManager.showCommentDetail(${comment.id})">
                            <i class="fas fa-info-circle"></i> 详情
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="commentManager.showDeleteModal(${comment.id})">
                            <i class="fas fa-trash"></i> 删除
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * 获取回复HTML
     */
    getReplyHTML: function(reply) {
        return `
            <div class="reply-item ${reply.isAuthor ? 'author-reply' : ''}">
                <div class="reply-avatar ${reply.isAuthor ? 'author' : ''}">${reply.replierAvatar}</div>
                <div class="reply-content">
                    <div class="reply-header">
                        <div class="reply-user">
                            <span class="reply-name">${reply.replier}</span>
                            ${reply.isAuthor ? `<span class="reply-badge author">作者</span>` : ''}
                        </div>
                        <div class="reply-time">${this.formatTime(reply.time)}</div>
                    </div>
                    <div class="reply-text">${reply.content}</div>
                    <div class="reply-actions">
                        <div class="reply-action" onclick="commentManager.likeReply(${reply.id})">
                            <i class="fas fa-thumbs-up"></i>
                            <span>${reply.likes}</span>
                        </div>
                        ${!reply.isAuthor ? `
                            <div class="reply-action" onclick="commentManager.replyToReply(${reply.id})">
                                <i class="fas fa-reply"></i>
                                <span>回复</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * 获取空状态HTML
     */
    getEmptyStateHTML: function() {
        return `
            <div class="empty-comments">
                <div class="empty-comments-icon">
                    <i class="fas fa-comments"></i>
                </div>
                <div class="empty-comments-title">暂无评论</div>
                <div class="empty-comments-description">
                    ${this.filters.search || this.filters.status !== 'all' || this.filters.sentiment !== 'all' ? 
                        '没有找到符合条件的评论，尝试调整筛选条件' : 
                        '当有读者评论您的作品时，评论会显示在这里'
                    }
                </div>
                ${!this.filters.search && this.filters.status === 'all' && this.filters.sentiment === 'all' ? `
                    <button class="btn btn-primary" onclick="commentManager.promoteWorks()">
                        <i class="fas fa-bullhorn"></i> 推广作品获取更多评论
                    </button>
                ` : `
                    <button class="btn btn-secondary" onclick="commentManager.clearFilters()">
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
        const container = document.getElementById('commentsPagination');
        if (!container) return;

        const totalPages = Math.ceil(this.pagination.total / this.pagination.pageSize);

        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = `
            <button class="btn btn-secondary btn-sm" ${this.pagination.currentPage === 1 ? 'disabled' : ''} 
                onclick="commentManager.goToPage(${this.pagination.currentPage - 1})">
                <i class="fas fa-chevron-left"></i> 上一页
            </button>
            <div class="page-numbers">
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (i === this.pagination.currentPage) {
                paginationHTML += `<span class="page-number active">${i}</span>`;
            } else {
                paginationHTML += `<span class="page-number" onclick="commentManager.goToPage(${i})">${i}</span>`;
            }
        }

        paginationHTML += `
            </div>
            <button class="btn btn-secondary btn-sm" ${this.pagination.currentPage === totalPages ? 'disabled' : ''} 
                onclick="commentManager.goToPage(${this.pagination.currentPage + 1})">
                下一页 <i class="fas fa-chevron-right"></i>
            </button>
        `;

        container.innerHTML = paginationHTML;
    },

    // ==================== 交互功能 ====================

    /**
     * 选择作品
     */
    selectWork: function(workId) {
        this.currentWorkId = workId;
        this.pagination.currentPage = 1;
        this.renderCommentsList();
        this.renderStats();
    },

    /**
     * 搜索评论
     */
    searchComments: function(query) {
        this.filters.search = query;
        this.pagination.currentPage = 1;
        this.renderCommentsList();
    },

    /**
     * 筛选评论
     */
    filterComments: function() {
        this.filters.status = document.getElementById('statusFilter').value;
        this.filters.sentiment = document.getElementById('sentimentFilter').value;
        this.pagination.currentPage = 1;
        this.renderCommentsList();
    },

    /**
     * 排序评论
     */
    sortComments: function() {
        this.filters.sortBy = document.getElementById('sortBy').value;
        this.renderCommentsList();
    },

    /**
     * 清除筛选条件
     */
    clearFilters: function() {
        this.filters.search = '';
        this.filters.status = 'all';
        this.filters.sentiment = 'all';
        this.filters.sortBy = 'newest';

        document.getElementById('commentSearch').value = '';
        document.getElementById('statusFilter').value = 'all';
        document.getElementById('sentimentFilter').value = 'all';
        document.getElementById('sortBy').value = 'newest';

        this.pagination.currentPage = 1;
        this.renderCommentsList();
    },

    /**
     * 切换评论选择状态
     */
    toggleCommentSelection: function(commentId, isSelected) {
        if (isSelected) {
            this.selectedComments.add(commentId);
        } else {
            this.selectedComments.delete(commentId);
        }

        // 更新UI
        const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
        if (commentElement) {
            commentElement.classList.toggle('selected', isSelected);
        }

        this.updateBatchActionsBar();
    },

    /**
     * 更新批量操作栏
     */
    updateBatchActionsBar: function() {
        const batchBar = document.getElementById('batchActionsBar');
        const selectedCount = document.getElementById('selectedCommentsCount');

        if (this.selectedComments.size > 0) {
            batchBar.style.display = 'flex';
            selectedCount.textContent = this.selectedComments.size;
        } else {
            batchBar.style.display = 'none';
        }
    },

    /**
     * 清除选择
     */
    clearSelection: function() {
        this.selectedComments.clear();
        this.updateBatchActionsBar();

        // 更新UI
        document.querySelectorAll('.comment-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelectorAll('.comment-checkbox input').forEach(checkbox => {
            checkbox.checked = false;
        });
    },

    /**
     * 回复评论
     */
    replyToComment: function(commentId) {
        const comment = this.comments.find(c => c.id === commentId);
        if (!comment) return;

        this.currentReplyId = commentId;

        // 填充原始评论
        document.getElementById('originalComment').innerHTML = `
            <div class="original-header">
                <span class="original-user">${comment.reader}</span>
                <span class="original-time">${this.formatDateTime(comment.time)}</span>
            </div>
            <div class="original-content">${comment.content}</div>
        `;

        // 清空回复内容
        document.getElementById('replyContent').value = '';

        document.getElementById('replyModal').classList.add('show');
    },

    /**
     * 提交回复
     */
    submitReply: function(event) {
        event.preventDefault();

        const content = document.getElementById('replyContent').value.trim();
        if (!content) {
            utils.showNotification('请输入回复内容', false);
            return;
        }

        if (content.length > 500) {
            utils.showNotification('回复内容不能超过500个字符', false);
            return;
        }

        // 模拟API调用
        utils.showNotification('回复发送中...', true);

        setTimeout(() => {
            const comment = this.comments.find(c => c.id === this.currentReplyId);
            if (comment) {
                // 更新评论状态
                comment.hasReplied = true;
                comment.replies = (comment.replies || 0) + 1;

                // 添加回复到列表
                if (!comment.repliesList) {
                    comment.repliesList = [];
                }

                comment.repliesList.push({
                    id: Date.now(),
                    replier: '作者',
                    replierAvatar: '作',
                    content: content,
                    time: new Date().toISOString(),
                    isAuthor: true,
                    likes: 0
                });

                this.renderCommentsList();
                this.renderStats();
                this.closeReplyModal();

                utils.showNotification('回复成功！');
            }
        }, 1000);
    },

    /**
     * 批量回复
     */
    batchReply: function() {
        if (this.selectedComments.size === 0) {
            utils.showNotification('请先选择要回复的评论', false);
            return;
        }

        document.getElementById('batchReplyCount').textContent = this.selectedComments.size;
        document.getElementById('batchReplyContent').value = '';

        document.getElementById('batchReplyModal').classList.add('show');
    },

    /**
     * 提交批量回复
     */
    submitBatchReply: function(event) {
        event.preventDefault();

        const content = document.getElementById('batchReplyContent').value.trim();
        if (!content) {
            utils.showNotification('请输入回复内容', false);
            return;
        }

        if (content.length > 500) {
            utils.showNotification('回复内容不能超过500个字符', false);
            return;
        }

        // 模拟API调用
        utils.showNotification(`正在向 ${this.selectedComments.size} 条评论发送回复...`, true);

        setTimeout(() => {
            this.selectedComments.forEach(commentId => {
                const comment = this.comments.find(c => c.id === commentId);
                if (comment && !comment.hasReplied) {
                    // 更新评论状态
                    comment.hasReplied = true;
                    comment.replies = (comment.replies || 0) + 1;

                    // 添加回复到列表
                    if (!comment.repliesList) {
                        comment.repliesList = [];
                    }

                    comment.repliesList.push({
                        id: Date.now(),
                        replier: '作者',
                        replierAvatar: '作',
                        content: content,
                        time: new Date().toISOString(),
                        isAuthor: true,
                        likes: 0
                    });
                }
            });

            this.renderCommentsList();
            this.renderStats();
            this.clearSelection();
            this.closeBatchReplyModal();

            utils.showNotification(`成功回复 ${this.selectedComments.size} 条评论`);
        }, 2000);
    },

    /**
     * 点赞评论
     */
    likeComment: function(commentId) {
        const comment = this.comments.find(c => c.id === commentId);
        if (comment) {
            comment.likes += 1;
            this.renderCommentsList();
            utils.showNotification('已点赞');
        }
    },

    /**
     * 点赞回复
     */
    likeReply: function(replyId) {
        // 在实际项目中，这里需要遍历所有评论找到对应的回复
        // 这里只是模拟功能
        utils.showNotification('已点赞回复');
    },

    /**
     * 切换回复显示
     */
    toggleReplies: function(commentId) {
        const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
        const repliesList = commentElement.querySelector('.replies-list');

        if (repliesList) {
            repliesList.style.display = repliesList.style.display === 'none' ? 'block' : 'none';
        }
    },

    /**
     * 置顶评论
     */
    pinComment: function(commentId) {
        const comment = this.comments.find(c => c.id === commentId);
        if (comment) {
            comment.isPinned = true;
            this.renderCommentsList();
            utils.showNotification('评论已置顶');
        }
    },

    /**
     * 取消置顶评论
     */
    unpinComment: function(commentId) {
        const comment = this.comments.find(c => c.id === commentId);
        if (comment) {
            comment.isPinned = false;
            this.renderCommentsList();
            utils.showNotification('已取消置顶');
        }
    },

    /**
     * 分享评论
     */
    shareComment: function(commentId) {
        // 模拟分享功能
        utils.showNotification('评论链接已复制到剪贴板');

        // 在实际项目中，这里会生成分享链接并复制到剪贴板
        const comment = this.comments.find(c => c.id === commentId);
        if (comment) {
            const shareUrl = `${window.location.origin}/share/comment/${commentId}`;
            navigator.clipboard.writeText(shareUrl).catch(err => {
                console.error('复制失败:', err);
            });
        }
    },

    /**
     * 显示评论详情
     */
    showCommentDetail: function(commentId) {
        const comment = this.comments.find(c => c.id === commentId);
        if (!comment) return;

        // 标记为已读
        if (comment.isUnread) {
            comment.isUnread = false;
            this.renderStats();
        }

        document.getElementById('commentDetailContent').innerHTML = `
            <div class="comment-detail">
                <div class="detail-section">
                    <h4>评论信息</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">读者名称</span>
                            <span class="detail-value">${comment.reader}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">读者等级</span>
                            <span class="detail-value">${comment.readerLevel}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">评论时间</span>
                            <span class="detail-value">${this.formatDateTime(comment.time)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">情感分析</span>
                            <span class="detail-value ${comment.sentiment}">${comment.sentimentText}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>作品信息</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">作品名称</span>
                            <span class="detail-value">《${comment.work}》</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">评论章节</span>
                            <span class="detail-value">${comment.chapter}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>评论内容</h4>
                    <div class="comment-content">${comment.content}</div>
                </div>
                
                <div class="detail-section">
                    <h4>互动数据</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">点赞数</span>
                            <span class="detail-value">${comment.likes}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">回复数</span>
                            <span class="detail-value">${comment.replies || 0}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">是否置顶</span>
                            <span class="detail-value">${comment.isPinned ? '是' : '否'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">是否已回复</span>
                            <span class="detail-value">${comment.hasReplied ? '是' : '否'}</span>
                        </div>
                    </div>
                </div>
                
                ${comment.repliesList && comment.repliesList.length > 0 ? `
                    <div class="detail-section">
                        <h4>回复记录</h4>
                        <div class="replies-list">
                            ${comment.repliesList.map(reply => this.getReplyHTML(reply)).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        document.getElementById('commentDetailModal').classList.add('show');
    },

    /**
     * 回复回复（嵌套回复）
     */
    replyToReply: function(replyId) {
        // 在实际项目中，这里会打开一个嵌套回复的模态框
        // 这里只是模拟功能
        utils.showNotification('回复功能开发中...', true);
    },

    /**
     * 显示删除确认模态框
     */
    showDeleteModal: function(commentId) {
        const comment = this.comments.find(c => c.id === commentId);
        if (!comment) return;

        document.getElementById('deleteMessage').textContent =
            `确定要删除读者 "${comment.reader}" 的评论吗？此操作不可恢复！`;

        const confirmBtn = document.getElementById('confirmDeleteBtn');
        confirmBtn.onclick = () => this.deleteComment(commentId);

        document.getElementById('deleteModal').classList.add('show');
    },

    /**
     * 删除评论
     */
    deleteComment: function(commentId) {
        // 模拟API调用
        setTimeout(() => {
            this.comments = this.comments.filter(c => c.id !== commentId);
            this.pagination.total = this.comments.length;
            this.renderCommentsList();
            this.renderStats();
            this.closeDeleteModal();

            utils.showNotification('评论删除成功');
        }, 1000);
    },

    /**
     * 批量删除
     */
    batchDelete: function() {
        if (this.selectedComments.size === 0) return;

        document.getElementById('deleteMessage').textContent =
            `确定要删除选中的 ${this.selectedComments.size} 条评论吗？此操作不可恢复！`;

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
            this.comments = this.comments.filter(comment => !this.selectedComments.has(comment.id));
            this.pagination.total = this.comments.length;
            this.renderCommentsList();
            this.renderStats();
            this.clearSelection();
            this.closeDeleteModal();

            utils.showNotification(`成功删除 ${this.selectedComments.size} 条评论`);
        }, 1000);
    },

    /**
     * 标记全部为已读
     */
    markAllAsRead: function() {
        this.comments.forEach(comment => {
            comment.isUnread = false;
        });

        this.renderCommentsList();
        this.renderStats();

        utils.showNotification('所有评论已标记为已读');
    },

    /**
     * 批量标记为已读
     */
    batchMarkAsRead: function() {
        this.selectedComments.forEach(commentId => {
            const comment = this.comments.find(c => c.id === commentId);
            if (comment) {
                comment.isUnread = false;
            }
        });

        this.renderCommentsList();
        this.renderStats();
        this.clearSelection();

        utils.showNotification(`已标记 ${this.selectedComments.size} 条评论为已读`);
    },

    /**
     * 推广作品
     */
    promoteWorks: function() {
        utils.showNotification('正在打开作品推广页面...', true);
        // 在实际项目中，这里会跳转到作品推广页面
    },

    /**
     * 导出评论
     */
    exportComments: function() {
        utils.showNotification('正在准备导出评论数据...', true);

        // 模拟导出过程
        setTimeout(() => {
            utils.showNotification('评论数据导出成功！');

            // 在实际项目中，这里会触发文件下载
            const link = document.createElement('a');
            link.href = '#'; // 实际应该是后端生成的文件URL
            link.download = `评论数据_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
        }, 2000);
    },

    /**
     * 刷新评论
     */
    refreshComments: function() {
        utils.showNotification('正在更新评论数据...', true);
        this.loadComments();
    },

    /**
     * 跳转到指定页面
     */
    goToPage: function(page) {
        this.pagination.currentPage = page;
        this.renderCommentsList();
    },

    /**
     * 切换评论展开状态
     */
    toggleCommentExpand: function(contentElement) {
        // 在实际项目中，这里可以添加展开/收起长评论的功能
        // 这里只是模拟功能
        if (contentElement.scrollHeight > 100) {
            contentElement.style.maxHeight = contentElement.style.maxHeight ? '' : 'none';
        }
    },

    // ==================== 模态框关闭方法 ====================

    closeReplyModal: function() {
        document.getElementById('replyModal').classList.remove('show');
        this.currentReplyId = null;
    },

    closeBatchReplyModal: function() {
        document.getElementById('batchReplyModal').classList.remove('show');
    },

    closeCommentDetailModal: function() {
        document.getElementById('commentDetailModal').classList.remove('show');
    },

    closeDeleteModal: function() {
        document.getElementById('deleteModal').classList.remove('show');
    },

    // ==================== 工具方法 ====================

    /**
     * 获取情感图标
     */
    getSentimentIcon: function(sentiment) {
        const iconMap = {
            'positive': 'fa-smile',
            'neutral': 'fa-meh',
            'negative': 'fa-frown'
        };
        return iconMap[sentiment] || 'fa-comment';
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
     * 格式化日期
     */
    formatDate: function(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return '今天';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return '昨天';
        } else {
            return date.toLocaleDateString('zh-CN');
        }
    },

    /**
     * 格式化时间
     */
    formatTime: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * 格式化日期时间
     */
    formatDateTime: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN');
    }
};

// ==================== 页面初始化 ====================

/**
 * 初始化评论管理页面
 */
function initCommentManagement() {
    console.log('🚀 初始化评论管理页面...');

    // 检查用户权限
    if (!checkAuthorAccess()) {
        return;
    }

    // 初始化评论管理模块
    commentManager.init();

    // 检查页面访问权限
    checkPageAccess();

    console.log('✅ 评论管理页面初始化完成');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initCommentManagement();
});

// 全局暴露
window.commentManager = commentManager;