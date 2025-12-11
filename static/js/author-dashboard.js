/**
 * FlutterPage - 作者端仪表板脚本
 * 负责作者仪表板的数据加载、交互处理和API调用
 */

// 作者管理模块
const authorManager = {
    // 当前作者信息
    currentAuthor: null,

    // 作者作品数据
    authorWorks: [],

    // 统计数据
    statistics: {
        totalWorks: 0,
        totalChapters: 0,
        totalViews: 0,
        totalCollections: 0,
        monthlyWords: 0,
        dailyAverage: 0,
        completionRate: 0
    },

    /**
     * 初始化作者管理模块
     */
    init: function() {
        this.loadAuthorData();
        this.loadAuthorWorks();
        this.loadStatistics();
        this.setupEventListeners();

        console.log('作者管理模块初始化完成');
    },

    /**
     * 加载作者数据
     */
    loadAuthorData: function() {
        // 模拟作者数据 - 实际项目中从后端API获取
        this.currentAuthor = {
            id: 1,
            username: '云梦泽',
            penName: '云梦泽',
            email: 'yunmengze@example.com',
            joinDate: '2023-01-15',
            level: '签约作者',
            avatar: '云',
            worksCount: 3,
            totalWords: 950000,
            monthlyIncome: 2456.78
        };

        // 更新页面显示
        this.updateAuthorInfo();
    },

    /**
     * 更新作者信息显示
     */
    updateAuthorInfo: function() {
        if (!this.currentAuthor) return;

        const avatarElement = document.getElementById('authorAvatar');
        const nameElement = document.getElementById('authorName');

        if (avatarElement) {
            avatarElement.textContent = this.currentAuthor.avatar;
        }
        if (nameElement) {
            nameElement.textContent = this.currentAuthor.penName;
        }
    },

    /**
     * 加载作者作品数据
     */
    loadAuthorWorks: function() {
        // 模拟作品数据 - 实际项目中从后端API获取
        this.authorWorks = [
            {
                id: 1,
                title: '星穹传说',
                cover: '📚',
                status: 'publishing',
                views: '245.8万',
                collections: '12.5万',
                chapters: 1205,
                words: 3200000,
                lastUpdate: '2023-10-15',
                updateFrequency: '日更'
            },
            {
                id: 2,
                title: '灵域迷踪',
                cover: '🔮',
                status: 'publishing',
                views: '213.5万',
                collections: '10.8万',
                chapters: 985,
                words: 2800000,
                lastUpdate: '2023-10-14',
                updateFrequency: '日更'
            },
            {
                id: 3,
                title: '剑影仙途',
                cover: '⚔️',
                status: 'finished',
                views: '198.7万',
                collections: '9.3万',
                chapters: 1340,
                words: 3500000,
                lastUpdate: '2023-10-13',
                updateFrequency: '已完结'
            }
        ];

        this.renderRecentWorks();
        this.renderReaderFeedback();
    },

    /**
     * 加载统计数据
     */
    loadStatistics: function() {
        // 模拟统计数据 - 实际项目中从后端API获取
        this.statistics = {
            totalWorks: 3,
            totalChapters: 3530,
            totalViews: 6580000,
            totalCollections: 326000,
            monthlyWords: 45678,
            dailyAverage: 2156,
            completionRate: 68
        };

        this.updateStatisticsDisplay();
    },

    /**
     * 更新统计数据显示
     */
    updateStatisticsDisplay: function() {
        document.getElementById('totalWorks').textContent = this.statistics.totalWorks;
        document.getElementById('totalChapters').textContent = this.formatNumber(this.statistics.totalChapters);
        document.getElementById('totalViews').textContent = this.formatNumber(this.statistics.totalViews);
        document.getElementById('totalCollections').textContent = this.formatNumber(this.statistics.totalCollections);
    },

    /**
     * 渲染最近作品列表
     */
    renderRecentWorks: function() {
        const container = document.getElementById('recentWorks');
        if (!container) return;

        if (this.authorWorks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-book"></i>
                    </div>
                    <div class="empty-state-title">暂无作品</div>
                    <div class="empty-state-description">开始创作您的第一部作品吧！</div>
                    <button class="btn btn-primary" onclick="router.navigateTo('works-management.html', {action: 'create'})">
                        <i class="fas fa-plus"></i> 创建新作品
                    </button>
                </div>
            `;
            return;
        }

        const worksHTML = this.authorWorks.map(work => `
            <div class="work-item" onclick="authorManager.viewWorkDetail(${work.id})">
                <div class="work-cover">${work.cover}</div>
                <div class="work-info">
                    <div class="work-title">${work.title}</div>
                    <div class="work-meta">
                        <span><i class="fas fa-eye"></i> ${work.views}</span>
                        <span><i class="fas fa-heart"></i> ${work.collections}</span>
                        <span><i class="fas fa-file-alt"></i> ${work.chapters}章</span>
                    </div>
                </div>
                <div class="work-status ${work.status}">
                    ${this.getStatusText(work.status)}
                </div>
            </div>
        `).join('');

        container.innerHTML = worksHTML;
    },

    /**
     * 渲染读者反馈
     */
    renderReaderFeedback: function() {
        const container = document.getElementById('readerFeedback');
        if (!container) return;

        // 模拟读者反馈数据
        const feedbacks = [
            {
                id: 1,
                user: {
                    name: '书迷小张',
                    avatar: '书'
                },
                work: '星穹传说',
                content: '大大今天更新太精彩了！主角的成长线写得真好，期待下一章的星际大战！',
                time: '2小时前',
                likes: 23,
                isReplied: false
            },
            {
                id: 2,
                user: {
                    name: '文学爱好者',
                    avatar: '文'
                },
                work: '灵域迷踪',
                content: '这一章的悬疑设置得很巧妙，不过有个小细节可能需要注意一下...',
                time: '5小时前',
                likes: 15,
                isReplied: true
            },
            {
                id: 3,
                user: {
                    name: '追更达人',
                    avatar: '追'
                },
                work: '剑影仙途',
                content: '完结撒花！感谢大大带来这么精彩的故事，期待新作！',
                time: '1天前',
                likes: 45,
                isReplied: false
            }
        ];

        const feedbackHTML = feedbacks.map(feedback => `
            <div class="feedback-item">
                <div class="feedback-header">
                    <div class="feedback-user">
                        <div class="user-avatar-small">${feedback.user.avatar}</div>
                        <div class="user-info-small">
                            <div class="user-name">${feedback.user.name}</div>
                            <div class="feedback-time">${feedback.time}</div>
                        </div>
                    </div>
                    <div class="feedback-work">《${feedback.work}》</div>
                </div>
                <div class="feedback-content">${feedback.content}</div>
                <div class="feedback-actions">
                    <div class="feedback-action" onclick="authorManager.likeFeedback(${feedback.id})">
                        <i class="fas fa-thumbs-up"></i>
                        <span>${feedback.likes}</span>
                    </div>
                    <div class="feedback-action" onclick="authorManager.replyToFeedback(${feedback.id})">
                        <i class="fas fa-reply"></i>
                        <span>回复</span>
                    </div>
                    ${!feedback.isReplied ? `
                    <div class="feedback-action" onclick="authorManager.markAsReplied(${feedback.id})">
                        <i class="fas fa-check"></i>
                        <span>标记已回复</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `).join('');

        container.innerHTML = feedbackHTML;
    },

    /**
     * 设置事件监听器
     */
    setupEventListeners: function() {
        // 实时数据更新
        setInterval(() => {
            this.updateRealTimeData();
        }, 30000); // 每30秒更新一次实时数据
    },

    /**
     * 更新实时数据
     */
    updateRealTimeData: function() {
        // 模拟实时数据更新
        const randomIncrement = Math.floor(Math.random() * 100) + 50;
        this.statistics.totalViews += randomIncrement;

        // 更新显示
        this.updateStatisticsDisplay();

        console.log('实时数据已更新');
    },

    /**
     * 查看作品详情
     * @param {number} workId - 作品ID
     */
    viewWorkDetail: function(workId) {
        router.navigateTo('works-management.html', { id: workId, view: 'detail' });
    },

    /**
     * 点赞读者反馈
     * @param {number} feedbackId - 反馈ID
     */
    likeFeedback: function(feedbackId) {
        // 调用后端API点赞反馈
        apiManager.author.feedback.like(feedbackId)
            .then(response => {
                if (response.success) {
                    utils.showNotification('已点赞读者反馈');
                } else {
                    utils.showNotification('点赞失败', false);
                }
            })
            .catch(error => {
                console.error('点赞反馈失败:', error);
                utils.showNotification('操作失败', false);
            });
    },

    /**
     * 回复读者反馈
     * @param {number} feedbackId - 反馈ID
     */
    replyToFeedback: function(feedbackId) {
        const reply = prompt('请输入回复内容：');
        if (reply && reply.trim()) {
            // 调用后端API回复反馈
            apiManager.author.feedback.reply(feedbackId, reply.trim())
                .then(response => {
                    if (response.success) {
                        utils.showNotification('回复成功');
                        this.renderReaderFeedback(); // 重新渲染反馈列表
                    } else {
                        utils.showNotification('回复失败', false);
                    }
                })
                .catch(error => {
                    console.error('回复反馈失败:', error);
                    utils.showNotification('操作失败', false);
                });
        }
    },

    /**
     * 标记反馈为已回复
     * @param {number} feedbackId - 反馈ID
     */
    markAsReplied: function(feedbackId) {
        // 调用后端API标记反馈
        apiManager.author.feedback.markReplied(feedbackId)
            .then(response => {
                if (response.success) {
                    utils.showNotification('已标记为已回复');
                    this.renderReaderFeedback(); // 重新渲染反馈列表
                } else {
                    utils.showNotification('标记失败', false);
                }
            })
            .catch(error => {
                console.error('标记反馈失败:', error);
                utils.showNotification('操作失败', false);
            });
    },

    /**
     * 格式化数字显示
     * @param {number} num - 数字
     * @returns {string} 格式化后的字符串
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
     * 获取状态文本
     * @param {string} status - 状态代码
     * @returns {string} 状态文本
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
     * 获取作品统计数据
     * @param {number} workId - 作品ID
     * @returns {Promise} 统计数据
     */
    getWorkStatistics: function(workId) {
        return apiManager.author.works.getStatistics(workId);
    },

    /**
     * 获取收入数据
     * @param {string} period - 时间周期
     * @returns {Promise} 收入数据
     */
    getIncomeData: function(period = 'monthly') {
        return apiManager.author.income.getData(period);
    }
};

// ==================== API接口扩展 ====================

// 扩展API管理器，添加作者端接口
apiManager.author = {
    // 作品管理
    works: {
        list: function(page = 1) {
            return apiManager.request('/author/works?page=' + page);
        },

        create: function(workData) {
            return apiManager.request('/author/works', 'POST', workData);
        },

        update: function(workId, workData) {
            return apiManager.request(`/author/works/${workId}`, 'PUT', workData);
        },

        delete: function(workId) {
            return apiManager.request(`/author/works/${workId}`, 'DELETE');
        },

        getStatistics: function(workId) {
            return apiManager.request(`/author/works/${workId}/statistics`);
        }
    },

    // 章节管理
    chapters: {
        list: function(workId, page = 1) {
            return apiManager.request(`/author/works/${workId}/chapters?page=${page}`);
        },

        create: function(workId, chapterData) {
            return apiManager.request(`/author/works/${workId}/chapters`, 'POST', chapterData);
        },

        update: function(workId, chapterId, chapterData) {
            return apiManager.request(`/author/works/${workId}/chapters/${chapterId}`, 'PUT', chapterData);
        },

        delete: function(workId, chapterId) {
            return apiManager.request(`/author/works/${workId}/chapters/${chapterId}`, 'DELETE');
        },

        publish: function(workId, chapterId) {
            return apiManager.request(`/author/works/${workId}/chapters/${chapterId}/publish`, 'POST');
        }
    },

    // 评论管理
    comments: {
        list: function(page = 1, filters = {}) {
            const queryParams = new URLSearchParams(filters);
            return apiManager.request(`/author/comments?page=${page}&${queryParams}`);
        },

        reply: function(commentId, content) {
            return apiManager.request(`/author/comments/${commentId}/reply`, 'POST', { content });
        },

        delete: function(commentId) {
            return apiManager.request(`/author/comments/${commentId}`, 'DELETE');
        }
    },

    // 反馈管理
    feedback: {
        like: function(feedbackId) {
            return apiManager.request(`/author/feedback/${feedbackId}/like`, 'POST');
        },

        reply: function(feedbackId, content) {
            return apiManager.request(`/author/feedback/${feedbackId}/reply`, 'POST', { content });
        },

        markReplied: function(feedbackId) {
            return apiManager.request(`/author/feedback/${feedbackId}/mark-replied`, 'POST');
        }
    },

    // 收入管理
    income: {
        getData: function(period = 'monthly') {
            return apiManager.request(`/author/income?period=${period}`);
        },

        getDetails: function(startDate, endDate) {
            return apiManager.request(`/author/income/details?start=${startDate}&end=${endDate}`);
        }
    },

    // 数据统计
    statistics: {
        getOverview: function() {
            return apiManager.request('/author/statistics/overview');
        },

        getWorksData: function(workId, period = 'monthly') {
            return apiManager.request(`/author/statistics/works/${workId}?period=${period}`);
        },

        getReaderAnalysis: function() {
            return apiManager.request('/author/statistics/readers');
        }
    }
};

// ==================== 页面初始化 ====================

/**
 * 初始化作者仪表板页面
 */
function initAuthorDashboard() {
    console.log('🚀 初始化作者仪表板...');

    // 检查用户权限
    if (!checkAuthorAccess()) {
        return;
    }

    // 初始化作者管理模块
    authorManager.init();

    // 检查页面访问权限
    checkPageAccess();

    console.log('✅ 作者仪表板初始化完成');
}

/**
 * 检查作者访问权限
 * @returns {boolean} 是否有权限访问
 */
function checkAuthorAccess() {
    const currentUser = userManager.getCurrentUser();

    if (!currentUser) {
        utils.showNotification('请先登录', false);
        setTimeout(() => {
            router.redirectToLogin();
        }, 1500);
        return false;
    }

    // 检查是否为作者身份
    // 在实际项目中，这里会检查用户的角色权限
    if (!currentUser.isAuthor) {
        utils.showNotification('您没有作者权限', false);
        setTimeout(() => {
            router.redirectToHome();
        }, 1500);
        return false;
    }

    return true;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initAuthorDashboard();
});

// 全局暴露
window.authorManager = authorManager;