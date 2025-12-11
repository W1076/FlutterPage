// 评论系统页特有功能
document.addEventListener('DOMContentLoaded', function() {
    initCommentsPage();
});

// 页面状态
let commentsState = {
    bookId: null,
    book: null,
    comments: [],
    currentPage: 1,
    commentsPerPage: 10,
    currentSort: 'newest',
    hasMore: true,
    replyingTo: null
};

/**
 * 初始化评论页面
 */
function initCommentsPage() {
    console.log('🚀 初始化评论页面...');

    // 检查访问权限
    if (!checkPageAccess()) return;

    // 获取URL参数
    commentsState.bookId = router.getUrlParam('bookId');

    if (!commentsState.bookId) {
        utils.showNotification('无效的书籍ID', false);
        setTimeout(() => router.redirectToHome(), 2000);
        return;
    }

    // 加载书籍数据
    loadBookData();

    // 初始化页面组件
    initNavigation();
    initCommentForm();
    initSortOptions();
    initEventListeners();

    // 加载评论数据
    loadComments();

    console.log('✅ 评论页面初始化完成');
}

/**
 * 加载书籍数据
 */
async function loadBookData() {
    try {
        // 使用API管理器获取书籍详情
        const response = await apiManager.book.detail(commentsState.bookId);

        if (response.success) {
            commentsState.book = response.data;
            updateBookInfo();
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
 * 更新书籍信息
 */
function updateBookInfo() {
    if (!commentsState.book) return;

    // 更新页面标题
    document.title = `${commentsState.book.title} - 评论 - FlutterPage`;

    // 更新书籍信息
    document.getElementById('bookTitle').textContent = commentsState.book.title;
    document.getElementById('bookViews').textContent = commentsState.book.views;
    document.getElementById('bookRating').textContent = commentsState.book.rating;

    // 更新链接
    document.getElementById('backToBook').href = `book-detail.html?id=${commentsState.bookId}`;
    document.getElementById('currentBookLink').href = `book-detail.html?id=${commentsState.bookId}`;
    document.getElementById('continueReadingLink').href = `chapter-reading.html?bookId=${commentsState.bookId}&chapterId=1`;

    // 更新用户头像
    const user = userManager.getCurrentUser();
    if (user) {
        document.getElementById('commentUserAvatar').textContent = user.username.charAt(0);
    }
}

/**
 * 初始化导航功能
 */
function initNavigation() {
    // 退出登录
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

/**
 * 初始化评论表单
 */
function initCommentForm() {
    const commentInput = document.getElementById('commentInput');
    const submitBtn = document.getElementById('submitComment');

    // 输入监听
    commentInput.addEventListener('input', function() {
        const length = this.value.length;
        const tips = document.querySelector('.comment-tips span');

        if (length > 1000) {
            this.value = this.value.substring(0, 1000);
            tips.textContent = '评论字数已达上限（1000字）';
            tips.style.color = 'var(--error-color)';
        } else {
            tips.textContent = `评论字数：${length}/1000`;
            tips.style.color = 'var(--text-light)';
        }

        // 更新提交按钮状态
        submitBtn.disabled = length === 0 || length > 1000;
    });

    // 提交评论
    submitBtn.addEventListener('click', submitComment);

    // 回车键提交（Ctrl+Enter）
    commentInput.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            submitComment();
        }
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
            commentsState.currentSort = this.dataset.sort;
            commentsState.currentPage = 1;

            // 重新加载评论
            loadComments();
        });
    });
}

/**
 * 初始化事件监听器
 */
function initEventListeners() {
    // 加载更多
    document.getElementById('loadMoreBtn').addEventListener('click', loadMoreComments);
}

/**
 * 加载评论数据
 */
async function loadComments() {
    try {
        // 调用后端API获取评论数据
        const response = await apiManager.comments.list(commentsState.bookId, commentsState.currentPage, commentsState.currentSort);

        if (response.success) {
            commentsState.comments = response.data.comments;
            commentsState.hasMore = response.data.hasMore;

            renderComments();
            updateCommentsCount();
        } else {
            utils.showNotification('加载评论失败', false);
        }
    } catch (error) {
        console.error('加载评论数据失败:', error);
        utils.showNotification('加载评论失败', false);
    }
}

/**
 * 加载更多评论
 */
async function loadMoreComments() {
    try {
        commentsState.currentPage++;
        const response = await apiManager.comments.list(commentsState.bookId, commentsState.currentPage, commentsState.currentSort);

        if (response.success) {
            commentsState.comments = [...commentsState.comments, ...response.data.comments];
            commentsState.hasMore = response.data.hasMore;

            renderComments();

            if (!commentsState.hasMore) {
                utils.showNotification('已加载所有评论', true);
                document.getElementById('loadMoreBtn').disabled = true;
            }
        } else {
            commentsState.currentPage--; // 回退页码
            utils.showNotification('加载更多评论失败', false);
        }
    } catch (error) {
        commentsState.currentPage--; // 回退页码
        console.error('加载更多评论失败:', error);
        utils.showNotification('加载更多评论失败', false);
    }
}

/**
 * 渲染评论列表
 */
function renderComments() {
    const commentsList = document.getElementById('commentsList');

    if (!commentsState.comments || commentsState.comments.length === 0) {
        commentsList.innerHTML = `
            <div class="comments-empty">
                <i class="fas fa-comment-slash"></i>
                <h3>暂无评论</h3>
                <p>成为第一个评论的人吧！</p>
            </div>
        `;
        document.getElementById('loadMore').style.display = 'none';
        return;
    }

    commentsList.innerHTML = '';

    commentsState.comments.forEach(comment => {
        const commentElement = createCommentElement(comment);
        commentsList.appendChild(commentElement);
    });

    // 更新加载更多按钮状态
    document.getElementById('loadMoreBtn').disabled = !commentsState.hasMore;
    document.getElementById('loadMore').style.display = commentsState.hasMore ? 'block' : 'none';
}

/**
 * 创建评论元素
 */
function createCommentElement(comment) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment-item';
    commentDiv.dataset.commentId = comment.id;

    const timeAgo = utils.formatDate(comment.time);

    commentDiv.innerHTML = `
        <div class="comment-header">
            <div class="comment-user">
                <div class="comment-user-avatar">${comment.avatar}</div>
                <div class="comment-user-info">
                    <div class="comment-username">${comment.username}</div>
                    <div class="comment-time">${timeAgo}</div>
                </div>
            </div>
            <div class="comment-actions">
                <button class="comment-action-btn like-btn ${comment.isLiked ? 'liked' : ''}" 
                        data-comment-id="${comment.id}">
                    <i class="fas fa-heart"></i>
                    <span class="like-count">${comment.likes}</span>
                </button>
                <button class="comment-action-btn reply-btn" data-comment-id="${comment.id}">
                    <i class="fas fa-reply"></i>
                    回复
                </button>
            </div>
        </div>
        <div class="comment-content">${escapeHtml(comment.content)}</div>
        ${comment.replies && comment.replies.length > 0 ? `
            <div class="replies-section">
                ${comment.replies.map(reply => `
                    <div class="comment-item reply-item">
                        <div class="comment-header">
                            <div class="comment-user">
                                <div class="comment-user-avatar">${reply.avatar}</div>
                                <div class="comment-user-info">
                                    <div class="comment-username">${reply.username}</div>
                                    <div class="comment-time">${utils.formatDate(reply.time)}</div>
                                </div>
                            </div>
                            <button class="comment-action-btn like-btn ${reply.isLiked ? 'liked' : ''}" 
                                    data-reply-id="${reply.id}">
                                <i class="fas fa-heart"></i>
                                <span class="like-count">${reply.likes}</span>
                            </button>
                        </div>
                        <div class="comment-content">${escapeHtml(reply.content)}</div>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        <div class="reply-form" id="replyForm-${comment.id}">
            <textarea class="reply-input" placeholder="回复 ${comment.username}..." maxlength="500"></textarea>
            <button class="reply-submit" data-comment-id="${comment.id}">发送</button>
        </div>
    `;

    // 添加事件监听器
    const likeBtn = commentDiv.querySelector('.like-btn');
    const replyBtn = commentDiv.querySelector('.reply-btn');
    const replySubmit = commentDiv.querySelector('.reply-submit');

    likeBtn.addEventListener('click', handleLike);
    replyBtn.addEventListener('click', toggleReplyForm);
    replySubmit.addEventListener('click', submitReply);

    return commentDiv;
}

/**
 * 更新评论数量
 */
function updateCommentsCount() {
    const totalComments = commentsState.comments.reduce((total, comment) => {
        return total + 1 + (comment.replies ? comment.replies.length : 0);
    }, 0);

    document.getElementById('commentsCount').textContent = `(${totalComments})`;
    document.getElementById('bookComments').textContent = (totalComments / 1000).toFixed(1) + '万';
}

/**
 * 提交评论
 */
async function submitComment() {
    const user = userManager.getCurrentUser();
    if (!user) {
        utils.showNotification('请先登录', false);
        return;
    }

    const commentInput = document.getElementById('commentInput');
    const content = commentInput.value.trim();

    if (!content) {
        utils.showNotification('评论内容不能为空', false);
        return;
    }

    if (content.length > 1000) {
        utils.showNotification('评论字数超出限制', false);
        return;
    }

    try {
        // 调用后端API提交评论
        const response = await apiManager.comments.create(commentsState.bookId, content);

        if (response.success) {
            // 重新加载评论
            await loadComments();

            // 清空输入框
            commentInput.value = '';
            document.querySelector('.comment-tips span').textContent = '评论字数：0/1000';
            document.getElementById('submitComment').disabled = true;

            utils.showNotification('评论发表成功');
        } else {
            utils.showNotification('评论发表失败', false);
        }
    } catch (error) {
        console.error('提交评论失败:', error);
        utils.showNotification('评论发表失败', false);
    }
}

/**
 * 处理点赞
 */
async function handleLike(e) {
    const user = userManager.getCurrentUser();
    if (!user) {
        utils.showNotification('请先登录', false);
        return;
    }

    const button = e.currentTarget;
    const commentId = button.dataset.commentId;
    const replyId = button.dataset.replyId;

    try {
        // 调用后端API进行点赞
        const response = await apiManager.comments.like(commentId, replyId);

        if (response.success) {
            // 更新UI状态
            const isLiked = response.data.isLiked;
            const likes = response.data.likes;

            button.classList.toggle('liked', isLiked);
            button.querySelector('.like-count').textContent = likes;
        } else {
            utils.showNotification('点赞失败', false);
        }
    } catch (error) {
        console.error('点赞操作失败:', error);
        utils.showNotification('点赞失败', false);
    }
}

/**
 * 切换回复表单
 */
function toggleReplyForm(e) {
    const user = userManager.getCurrentUser();
    if (!user) {
        utils.showNotification('请先登录', false);
        return;
    }

    const commentId = e.currentTarget.dataset.commentId;
    const replyForm = document.getElementById(`replyForm-${commentId}`);

    // 关闭其他回复表单
    document.querySelectorAll('.reply-form').forEach(form => {
        if (form.id !== `replyForm-${commentId}`) {
            form.classList.remove('active');
        }
    });

    replyForm.classList.toggle('active');

    if (replyForm.classList.contains('active')) {
        const textarea = replyForm.querySelector('.reply-input');
        textarea.focus();
        commentsState.replyingTo = commentId;
    } else {
        commentsState.replyingTo = null;
    }
}

/**
 * 提交回复
 */
async function submitReply(e) {
    const user = userManager.getCurrentUser();
    if (!user) {
        utils.showNotification('请先登录', false);
        return;
    }

    const commentId = e.currentTarget.dataset.commentId;
    const replyForm = document.getElementById(`replyForm-${commentId}`);
    const replyInput = replyForm.querySelector('.reply-input');
    const content = replyInput.value.trim();

    if (!content) {
        utils.showNotification('回复内容不能为空', false);
        return;
    }

    try {
        // 调用后端API提交回复
        const response = await apiManager.comments.reply(commentId, content);

        if (response.success) {
            // 重新加载评论
            await loadComments();

            // 清空并关闭回复表单
            replyInput.value = '';
            replyForm.classList.remove('active');
            commentsState.replyingTo = null;

            utils.showNotification('回复成功');
        } else {
            utils.showNotification('回复失败', false);
        }
    } catch (error) {
        console.error('提交回复失败:', error);
        utils.showNotification('回复失败', false);
    }
}

/**
 * HTML转义函数
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 页面特定初始化函数，供common.js调用
window.initPage = function() {
    console.log('📄 评论页面初始化完成');
};