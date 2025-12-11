/**
 * FlutterPage - 公共JavaScript函数库
 * 负责整个网站的用户管理、数据管理、路由控制和通用功能
 * 为后续Flask后端集成预留完整接口
 * 支持多角色系统：读者、作者、管理员
 */

// ==================== 全局配置 ====================
const CONFIG = {
    APP_NAME: 'FlutterPage',
    VERSION: '1.0.0',
    API_BASE_URL: '/api', // Flask后端API基础路径
    DEFAULT_BOOK_ID: 1,
    DEFAULT_CHAPTER_ID: 1,
    // 角色配置
    ROLES: {
        READER: 'reader',
        AUTHOR: 'author',
        ADMIN: 'admin'
    },
    // 作者ID起始值
    AUTHOR_ID_START: '000000001'
};

// ==================== 本地存储管理器 ====================
const storageManager = {
    // 存储键名常量
    KEYS: {
        CURRENT_USER: 'flutterpage_current_user',
        USER_ROLE: 'flutterpage_user_role',
        LOGIN_TIME: 'flutterpage_login_time',
        AUTH_TOKEN: 'flutterpage_auth_token', // 为Flask后端预留
        READING_PROGRESS: 'flutterpage_reading_progress',
        USER_PREFERENCES: 'flutterpage_user_preferences'
    },

    /**
     * 保存用户数据
     */
    saveUser: function(userData) {
        try {
            const dataToSave = {
                ...userData,
                _timestamp: Date.now(),
                _expires: Date.now() + (24 * 60 * 60 * 1000) // 24小时过期
            };
            localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(dataToSave));
            return true;
        } catch (error) {
            console.error('保存用户数据失败:', error);
            return false;
        }
    },

    /**
     * 获取用户数据（带过期检查）
     */
    getUser: function() {
        try {
            const stored = localStorage.getItem(this.KEYS.CURRENT_USER);
            if (!stored) return null;

            const userData = JSON.parse(stored);

            // 检查数据是否过期
            if (userData._expires && Date.now() > userData._expires) {
                this.clearUser();
                return null;
            }

            // 移除内部字段后返回
            const { _timestamp, _expires, ...cleanData } = userData;
            return cleanData;
        } catch (error) {
            console.error('获取用户数据失败:', error);
            return null;
        }
    },

    /**
     * 清除用户数据
     */
    clearUser: function() {
        localStorage.removeItem(this.KEYS.CURRENT_USER);
        localStorage.removeItem(this.KEYS.USER_ROLE);
        localStorage.removeItem(this.KEYS.AUTH_TOKEN);
        localStorage.removeItem(this.KEYS.LOGIN_TIME);
    },

    /**
     * 保存用户角色
     */
    saveUserRole: function(role) {
        localStorage.setItem(this.KEYS.USER_ROLE, role);
    },

    /**
     * 获取用户角色
     */
    getUserRole: function() {
        return localStorage.getItem(this.KEYS.USER_ROLE) || null;
    },

    /**
     * 保存认证令牌（为Flask后端预留）
     */
    saveAuthToken: function(token) {
        localStorage.setItem(this.KEYS.AUTH_TOKEN, token);
    },

    /**
     * 获取认证令牌
     */
    getAuthToken: function() {
        return localStorage.getItem(this.KEYS.AUTH_TOKEN);
    },

    /**
     * 保存登录时间
     */
    saveLoginTime: function() {
        localStorage.setItem(this.KEYS.LOGIN_TIME, Date.now().toString());
    },

    /**
     * 获取登录时间
     */
    getLoginTime: function() {
        return localStorage.getItem(this.KEYS.LOGIN_TIME);
    },

    /**
     * 检查是否在登录状态
     */
    isLoggedIn: function() {
        return this.getUser() !== null;
    },

    /**
     * 清除所有存储数据
     */
    clearAll: function() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }
};

// ==================== 用户管理系统 ====================

/**
 * 用户管理模块
 * 负责用户注册、登录、状态管理和权限控制
 * 支持多角色系统
 */
const userManager = {
    // 当前用户信息
    currentUser: null,

    /**
     * 初始化用户管理系统
     */
    init: function() {
        this.loadCurrentUser();
        console.log('用户管理系统初始化完成');
    },

    /**
     * 从存储加载当前用户信息
     */
    loadCurrentUser: function() {
        // 从storageManager加载，不使用sessionStorage
        this.currentUser = storageManager.getUser();
        if (this.currentUser) {
            console.log('从localStorage加载用户:', this.currentUser.username);
        }
    },

    /**
     * 保存当前用户信息
     */
    saveCurrentUser: function() {
        if (this.currentUser) {
            storageManager.saveUser(this.currentUser);
        } else {
            storageManager.clearUser();
        }
    },

    /**
     * 用户注册
     * @param {string} username - 用户名
     * @param {string} email - 邮箱
     * @param {string} password - 密码
     * @param {string} role - 角色 (reader/author/admin)
     * @returns {Object} 注册结果
     */
    register: function(username, email, password, role = CONFIG.ROLES.READER) {
        // 输入验证
        if (!username || !email || !password) {
            return { success: false, message: '请填写所有必填字段' };
        }

        if (username.length < 3) {
            return { success: false, message: '用户名至少3个字符' };
        }

        if (password.length < 6) {
            return { success: false, message: '密码至少6个字符' };
        }

        if (!this.validateEmail(email)) {
            return { success: false, message: '邮箱格式不正确' };
        }

        // 注册逻辑将由后端处理，这里只做前端验证
        console.log('用户注册请求:', { username, email, role });

        return {
            success: true,
            message: '注册请求已发送',
            user: null
        };
    },

    /**
     * 作者注册
     * @param {Object} authorData - 作者数据
     * @returns {Object} 注册结果
     */
    registerAuthor: function(authorData) {
        const { username, email, password, penName, realName, phone, idCard } = authorData;

        // 基础验证
        if (!username || !email || !password || !penName || !realName || !phone || !idCard) {
            return { success: false, message: '请填写所有必填字段' };
        }

        if (username.length < 3) {
            return { success: false, message: '用户名至少3个字符' };
        }

        if (password.length < 6) {
            return { success: false, message: '密码至少6个字符' };
        }

        if (!this.validateEmail(email)) {
            return { success: false, message: '邮箱格式不正确' };
        }

        if (penName.length < 2) {
            return { success: false, message: '笔名至少2个字符' };
        }

        if (!this.validatePhone(phone)) {
            return { success: false, message: '请输入有效的手机号码' };
        }

        if (!this.validateIdCard(idCard)) {
            return { success: false, message: '请输入有效的身份证号' };
        }

        console.log('作者注册请求:', authorData);

        // 模拟生成作者ID
        const authorId = this.generateAuthorId();

        return {
            success: true,
            message: '作者注册成功',
            authorId: authorId,
            user: null
        };
    },

    /**
     * 生成作者ID
     * @returns {string} 作者ID
     */
    generateAuthorId: function() {
        // 模拟从数据库获取下一个作者ID
        // 实际应用中，这会由后端数据库自动生成
        const storedId = localStorage.getItem('lastAuthorId') || CONFIG.AUTHOR_ID_START;
        const nextId = String(parseInt(storedId) + 1).padStart(9, '0');
        localStorage.setItem('lastAuthorId', nextId);
        return nextId;
    },

    /**
     * 用户登录
     * @param {string} identifier - 用户名或邮箱
     * @param {string} password - 密码
     * @param {string} role - 角色类型
     * @param {string} uid - 管理员UID（可选）
     * @returns {Object} 登录结果
     */
    login: function(identifier, password, role = CONFIG.ROLES.READER, uid = null) {
        if (!identifier || !password) {
            return { success: false, message: '请填写用户名/邮箱和密码' };
        }

        if (role === CONFIG.ROLES.ADMIN && !uid) {
            return { success: false, message: '管理员请提供UID' };
        }

        // 登录逻辑将由后端处理，这里只做前端验证
        console.log('用户登录请求:', { identifier, role, uid });

        return {
            success: true,
            message: '登录请求已发送',
            user: null,
            role: role
        };
    },

    /**
     * 退出登录
     */
    logout: function() {
        console.log('用户退出登录:', this.currentUser?.username);
        this.currentUser = null;
        storageManager.clearUser();
    },

    /**
     * 获取当前登录用户
     * @returns {Object|null} 当前用户信息
     */
    getCurrentUser: function() {
        return this.currentUser ? this.sanitizeUserData(this.currentUser) : null;
    },

    /**
     * 检查用户是否已登录
     * @returns {boolean} 登录状态
     */
    isLoggedIn: function() {
        return storageManager.isLoggedIn();
    },

    /**
     * 获取用户角色
     * @returns {string|null} 用户角色
     */
    getUserRole: function() {
        return storageManager.getUserRole();
    },

    /**
     * 检查用户角色
     * @param {string} role - 要检查的角色
     * @returns {boolean} 是否匹配
     */
    hasRole: function(role) {
        return this.getUserRole() === role;
    },

    /**
     * 验证邮箱格式
     * @param {string} email - 邮箱地址
     * @returns {boolean} 验证结果
     */
    validateEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * 验证手机号格式
     * @param {string} phone - 手机号码
     * @returns {boolean} 验证结果
     */
    validatePhone: function(phone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(phone);
    },

    /**
     * 验证身份证号格式
     * @param {string} idCard - 身份证号
     * @returns {boolean} 验证结果
     */
    validateIdCard: function(idCard) {
        const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
        return idCardRegex.test(idCard);
    },

    /**
     * 清理用户数据（移除密码等敏感信息）
     * @param {Object} user - 用户数据
     * @returns {Object} 清理后的用户数据
     */
    sanitizeUserData: function(user) {
        const sanitized = { ...user };
        delete sanitized.password;
        return sanitized;
    },

    /**
     * 更新用户偏好设置
     * @param {Object} preferences - 偏好设置
     * @returns {boolean} 更新结果
     */
    updatePreferences: function(preferences) {
        if (!this.currentUser) return false;

        this.currentUser.preferences = { ...this.currentUser.preferences, ...preferences };
        this.saveCurrentUser();
        return true;
    },

    /**
     * 保存阅读进度
     * @param {number} bookId - 书籍ID
     * @param {number} chapterId - 章节ID
     * @param {number} progress - 阅读进度
     * @returns {boolean} 保存结果
     */
    saveReadingProgress: function(bookId, chapterId, progress) {
        if (!this.currentUser) return false;

        if (!this.currentUser.preferences.readingProgress) {
            this.currentUser.preferences.readingProgress = {};
        }

        this.currentUser.preferences.readingProgress[bookId] = {
            chapterId: chapterId,
            progress: progress,
            timestamp: new Date().toISOString()
        };

        this.saveCurrentUser();
        return true;
    },

    /**
     * 获取阅读进度
     * @param {number} bookId - 书籍ID
     * @returns {Object|null} 阅读进度
     */
    getReadingProgress: function(bookId) {
        if (!this.currentUser || !this.currentUser.preferences.readingProgress) {
            return null;
        }
        return this.currentUser.preferences.readingProgress[bookId] || null;
    },

    /**
     * 检查页面访问权限
     * @param {string} requiredRole - 需要的角色
     * @returns {boolean} 是否有权限
     */
    checkAccess: function(requiredRole) {
        const userRole = this.getUserRole();

        if (!userRole) return false;

        // 管理员拥有所有权限
        if (userRole === CONFIG.ROLES.ADMIN) return true;

        // 作者可以访问作者页面和读者页面
        if (userRole === CONFIG.ROLES.AUTHOR) {
            return requiredRole === CONFIG.ROLES.AUTHOR || requiredRole === CONFIG.ROLES.READER;
        }

        // 读者只能访问读者页面
        return userRole === requiredRole;
    }
};

// ==================== 书籍数据管理系统 ====================

/**
 * 书籍数据管理模块
 * 负责书籍数据的存储、检索和管理
 */
const bookManager = {
    // 虚构书籍数据
    books: [
        {
            id: 1,
            title: '星穹传说',
            author: '云梦泽',
            authorId: '000000001',
            views: '245.8万',
            rating: 8.9,
            wordCount: 320,
            chapterCount: 1205,
            description: '在浩瀚的星穹之中，少年意外获得神秘传承，开启了一段跨越星际的传奇旅程。星辰为伴，宇宙为战场，他能否揭开宇宙的终极奥秘？',
            tags: ['玄幻', '星际', '修炼'],
            cover: '📚',
            status: '连载中',
            updateTime: '2023-10-15',
            chapters: []
        },
        {
            id: 2,
            title: '灵域迷踪',
            author: '幻雨',
            authorId: '000000002',
            views: '213.5万',
            rating: 9.2,
            wordCount: 280,
            chapterCount: 985,
            description: '灵气复苏时代，平凡少年觉醒特殊能力，探索隐藏在现实背后的灵域世界。谜团重重，真相究竟是什么？',
            tags: ['都市', '异能', '悬疑'],
            cover: '🔮',
            status: '连载中',
            updateTime: '2023-10-14',
            chapters: []
        },
        {
            id: 3,
            title: '剑影仙途',
            author: '青衫客',
            authorId: '000000003',
            views: '198.7万',
            rating: 8.7,
            wordCount: 350,
            chapterCount: 1340,
            description: '一剑破万法，一剑证仙途。少年持剑行走天下，斩妖除魔，追寻那虚无缥缈的仙道巅峰。',
            tags: ['仙侠', '剑修', '冒险'],
            cover: '⚔️',
            status: '已完结',
            updateTime: '2023-10-13',
            chapters: []
        },
        {
            id: 4,
            title: '数据觉醒',
            author: '代码行者',
            authorId: '000000004',
            views: '176.5万',
            rating: 8.8,
            wordCount: 265,
            chapterCount: 890,
            description: '当人工智能拥有自我意识，当虚拟世界与现实边界模糊，人类将面临怎样的挑战与机遇？',
            tags: ['科幻', 'AI', '未来'],
            cover: '💻',
            status: '连载中',
            updateTime: '2023-10-12',
            chapters: []
        },
        {
            id: 5,
            title: '时光侦探社',
            author: '谜案追踪者',
            authorId: '000000005',
            views: '154.3万',
            rating: 9.0,
            wordCount: 210,
            chapterCount: 720,
            description: '一家神秘的侦探社，专门处理与时间相关的离奇案件。穿越时空，解开历史谜团，守护时间线的稳定。',
            tags: ['悬疑', '穿越', '侦探'],
            cover: '🕵️',
            status: '连载中',
            updateTime: '2023-10-11',
            chapters: []
        },
        {
            id: 6,
            title: '美食异世界',
            author: '饕餮客',
            authorId: '000000006',
            views: '142.8万',
            rating: 8.5,
            wordCount: 185,
            chapterCount: 650,
            description: '顶尖厨师意外穿越到异世界，用美食征服各种族，建立美食帝国，传播中华饮食文化。',
            tags: ['美食', '穿越', '轻松'],
            cover: '🍜',
            status: '连载中',
            updateTime: '2023-10-10',
            chapters: []
        }
    ],

    /**
     * 初始化书籍数据
     */
    init: function() {
        this.generateChaptersForAllBooks();
        console.log('书籍管理系统初始化完成，加载书籍数量:', this.books.length);
    },

    /**
     * 为所有书籍生成章节数据
     */
    generateChaptersForAllBooks: function() {
        this.books.forEach(book => {
            book.chapters = this.generateChapters(book.title, book.chapterCount);
        });
    },

    /**
     * 生成章节数据
     * @param {string} bookTitle - 书籍标题
     * @param {number} chapterCount - 章节数量
     * @returns {Array} 章节列表
     */
    generateChapters: function(bookTitle, chapterCount) {
        const chapters = [];
        const maxChapters = Math.min(chapterCount, 50); // 限制生成的章节数量

        for (let i = 1; i <= maxChapters; i++) {
            chapters.push({
                id: i,
                title: `第${this.numberToChinese(i)}章 ${this.generateChapterTitle()}`,
                date: this.generateChapterDate(i),
                wordCount: Math.floor(Math.random() * 3000) + 1500,
                content: this.generateChapterContent(bookTitle, i)
            });
        }
        return chapters;
    },

    /**
     * 生成章节标题
     * @returns {string} 章节标题
     */
    generateChapterTitle: function() {
        const titles = [
            '初入异界', '神秘传承', '强者之路', '秘境探险', '生死考验',
            '突破境界', '新的征程', '宿命对决', '真相揭露', '最终决战',
            '意外收获', '强敌来袭', '绝境逢生', '友情考验', '爱情萌芽',
            '阴谋浮现', '实力暴涨', '宗门大比', '远古遗迹', '血脉觉醒'
        ];
        return titles[Math.floor(Math.random() * titles.length)];
    },

    /**
     * 生成章节日期
     * @param {number} chapterId - 章节ID
     * @returns {string} 日期字符串
     */
    generateChapterDate: function(chapterId) {
        const date = new Date();
        date.setDate(date.getDate() - chapterId * 2);
        return date.toISOString().split('T')[0];
    },

    /**
     * 生成章节内容
     * @param {string} bookTitle - 书籍标题
     * @param {number} chapterId - 章节ID
     * @returns {string} 章节内容HTML
     */
    generateChapterContent: function(bookTitle, chapterId) {
        const paragraphs = [];
        const paragraphCount = Math.floor(Math.random() * 15) + 8;

        // 章节开头
        paragraphs.push(`<h3>第${this.numberToChinese(chapterId)}章 ${this.generateChapterTitle()}</h3>`);

        for (let i = 0; i < paragraphCount; i++) {
            const sentenceCount = Math.floor(Math.random() * 5) + 3;
            let paragraph = '<p>';

            for (let j = 0; j < sentenceCount; j++) {
                const wordCount = Math.floor(Math.random() * 20) + 10;
                let sentence = '';

                for (let k = 0; k < wordCount; k++) {
                    sentence += '内容 ';
                }

                paragraph += sentence.trim() + '。';
            }

            paragraph += '</p>';
            paragraphs.push(paragraph);
        }

        return paragraphs.join('');
    },

    /**
     * 数字转中文
     * @param {number} num - 数字
     * @returns {string} 中文数字
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
     * 根据ID获取书籍
     * @param {number} bookId - 书籍ID
     * @returns {Object|null} 书籍信息
     */
    getBookById: function(bookId) {
        const book = this.books.find(book => book.id === parseInt(bookId));
        if (!book) {
            console.warn('未找到书籍，ID:', bookId);
        }
        return book || null;
    },

    /**
     * 根据作者ID获取书籍
     * @param {string} authorId - 作者ID
     * @returns {Array} 书籍列表
     */
    getBooksByAuthor: function(authorId) {
        return this.books.filter(book => book.authorId === authorId);
    },

    /**
     * 获取所有书籍
     * @returns {Array} 书籍列表
     */
    getAllBooks: function() {
        return this.books;
    },

    /**
     * 根据分类获取书籍
     * @param {string} category - 分类名称
     * @returns {Array} 书籍列表
     */
    getBooksByCategory: function(category) {
        if (category === '全部') return this.books;
        return this.books.filter(book => book.tags.includes(category));
    },

    /**
     * 搜索书籍
     * @param {string} query - 搜索关键词
     * @param {string} scope - 搜索范围 (all, title, author, tag)
     * @returns {Array} 搜索结果
     */
    searchBooks: function(query, scope = 'all') {
        if (!query.trim()) return [];

        const lowerQuery = query.toLowerCase();

        return this.books.filter(book => {
            switch (scope) {
                case 'title':
                    return book.title.toLowerCase().includes(lowerQuery);
                case 'author':
                    return book.author.toLowerCase().includes(lowerQuery);
                case 'tag':
                    return book.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
                case 'all':
                default:
                    return book.title.toLowerCase().includes(lowerQuery) ||
                           book.author.toLowerCase().includes(lowerQuery) ||
                           book.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
                           book.description.toLowerCase().includes(lowerQuery);
            }
        });
    },

    /**
     * 获取热门书籍
     * @param {number} limit - 数量限制
     * @returns {Array} 热门书籍列表
     */
    getHotBooks: function(limit = 8) {
        return [...this.books]
            .sort((a, b) => this.parseViews(b.views) - this.parseViews(a.views))
            .slice(0, limit);
    },

    /**
     * 获取新书
     * @param {number} limit - 数量限制
     * @returns {Array} 新书列表
     */
    getNewBooks: function(limit = 8) {
        return [...this.books]
            .sort((a, b) => new Date(b.updateTime) - new Date(a.updateTime))
            .slice(0, limit);
    },

    /**
     * 解析阅读量字符串
     * @param {string} views - 阅读量字符串
     * @returns {number} 解析后的数字
     */
    parseViews: function(views) {
        if (views.includes('万')) {
            return parseFloat(views) * 10000;
        }
        return parseFloat(views);
    },

    /**
     * 获取书籍章节
     * @param {number} bookId - 书籍ID
     * @param {number} chapterId - 章节ID
     * @returns {Object|null} 章节信息
     */
    getChapter: function(bookId, chapterId) {
        const book = this.getBookById(bookId);
        if (!book) return null;

        const chapter = book.chapters.find(ch => ch.id === parseInt(chapterId));
        if (!chapter) {
            console.warn('未找到章节，书籍ID:', bookId, '章节ID:', chapterId);
        }
        return chapter || null;
    },

    /**
     * 获取相邻章节
     * @param {number} bookId - 书籍ID
     * @param {number} chapterId - 当前章节ID
     * @returns {Object} 相邻章节信息
     */
    getAdjacentChapters: function(bookId, chapterId) {
        const book = this.getBookById(bookId);
        if (!book) return { prev: null, next: null };

        const currentIndex = book.chapters.findIndex(ch => ch.id === parseInt(chapterId));

        return {
            prev: currentIndex > 0 ? book.chapters[currentIndex - 1] : null,
            next: currentIndex < book.chapters.length - 1 ? book.chapters[currentIndex + 1] : null
        };
    },

    /**
     * 添加新书籍（作者功能）
     * @param {Object} bookData - 书籍数据
     * @param {string} authorId - 作者ID
     * @returns {Object} 添加结果
     */
    addBook: function(bookData, authorId) {
        const newBook = {
            id: this.books.length + 1,
            authorId: authorId,
            author: bookData.authorName || '匿名作者',
            status: '连载中',
            updateTime: new Date().toISOString().split('T')[0],
            chapters: [],
            views: '0',
            rating: 0,
            wordCount: 0,
            chapterCount: 0,
            ...bookData
        };

        this.books.push(newBook);
        console.log('添加新书籍:', newBook);

        return {
            success: true,
            message: '书籍添加成功',
            book: newBook
        };
    },

    /**
     * 更新书籍信息（作者功能）
     * @param {number} bookId - 书籍ID
     * @param {Object} updates - 更新数据
     * @param {string} authorId - 作者ID
     * @returns {Object} 更新结果
     */
    updateBook: function(bookId, updates, authorId) {
        const bookIndex = this.books.findIndex(book =>
            book.id === parseInt(bookId) && book.authorId === authorId
        );

        if (bookIndex === -1) {
            return { success: false, message: '书籍不存在或无权修改' };
        }

        this.books[bookIndex] = { ...this.books[bookIndex], ...updates };
        console.log('更新书籍:', this.books[bookIndex]);

        return {
            success: true,
            message: '书籍更新成功',
            book: this.books[bookIndex]
        };
    }
};

// ==================== API接口管理系统 ====================

/**
 * API接口管理模块
 * 为Flask后端集成预留完整接口，当前使用模拟数据
 * 支持多角色系统
 */
const apiManager = {
    // API端点配置
    ENDPOINTS: {
        // 用户相关
        USER_LOGIN: '/auth/login',
        USER_REGISTER: '/auth/register',
        AUTHOR_REGISTER: '/auth/register/author',
        USER_LOGOUT: '/auth/logout',
        USER_PROFILE: '/user/profile',

        // 书籍相关
        BOOK_LIST: '/books',
        BOOK_DETAIL: '/books/{id}',
        BOOK_SEARCH: '/books/search',
        BOOK_ADD: '/books',
        BOOK_UPDATE: '/books/{id}',

        // 章节相关
        CHAPTER_CONTENT: '/books/{bookId}/chapters/{chapterId}',
        CHAPTER_LIST: '/books/{bookId}/chapters',
        CHAPTER_ADD: '/books/{bookId}/chapters',
        CHAPTER_UPDATE: '/books/{bookId}/chapters/{chapterId}',

        // 评论相关
        COMMENTS: '/books/{bookId}/comments',
        COMMENT_CREATE: '/books/{bookId}/comments',
        COMMENT_LIKE: '/comments/{commentId}/like',

        // 阅读记录
        READING_PROGRESS: '/reading/progress',
        READING_HISTORY: '/reading/history',

        // 管理相关
        ADMIN_USERS: '/admin/users',
        ADMIN_BOOKS: '/admin/books',
        ADMIN_STATS: '/admin/stats'
    },

    /**
     * 发送API请求
     * @param {string} endpoint - API端点
     * @param {string} method - HTTP方法
     * @param {Object} data - 请求数据
     * @returns {Promise} API响应
     */
    request: async function(endpoint, method = 'GET', data = null) {
        // 模拟网络延迟
        await this.delay(500 + Math.random() * 1000);

        // 在实际项目中，这里会发送真实的HTTP请求到Flask后端
        // const response = await fetch(CONFIG.API_BASE_URL + endpoint, {
        //     method: method,
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': userManager.getCurrentUser() ? `Bearer ${userManager.getCurrentUser().token}` : ''
        //     },
        //     body: data ? JSON.stringify(data) : null
        // });
        // return await response.json();

        // 当前使用模拟响应
        return this.mockResponse(endpoint, method, data);
    },

    /**
     * 模拟API响应
     * @param {string} endpoint - API端点
     * @param {string} method - HTTP方法
     * @param {Object} data - 请求数据
     * @returns {Object} 模拟响应
     */
    mockResponse: function(endpoint, method, data) {
        // 用户认证相关API
        if (endpoint === this.ENDPOINTS.USER_LOGIN && method === 'POST') {
            const { identifier, password, role, uid } = data;

            // 调用 userManager.login 进行验证
            const result = userManager.login(identifier, password, role, uid);

            if (result.success) {
                // 模拟用户数据（为后续Flask后端预留接口）
                const userData = {
                    id: Date.now(),
                    username: identifier,
                    email: identifier.includes('@') ? identifier : `${identifier}@example.com`,
                    role: role,
                    preferences: {
                        theme: 'default',
                        fontSize: 16,
                        readingProgress: {}
                    },
                    // 为不同角色添加特定字段
                    ...(role === CONFIG.ROLES.AUTHOR && {
                        authorId: userManager.generateAuthorId(),
                        penName: identifier,
                        isAuthor: true
                    }),
                    ...(role === CONFIG.ROLES.ADMIN && {
                        isAdmin: true,
                        permissions: ['users', 'books', 'system']
                    })
                };

                // 保存到userManager和storageManager
                userManager.currentUser = userData;
                userManager.saveCurrentUser();
                storageManager.saveUserRole(role);
                storageManager.saveLoginTime();

                // 模拟生成JWT token（为Flask后端预留）
                const mockToken = `mock_jwt_${Date.now()}_${Math.random().toString(36).substr(2)}`;
                storageManager.saveAuthToken(mockToken);

                // 返回完整结果
                return {
                    success: true,
                    message: '登录成功',
                    user: userData,
                    token: mockToken,
                    role: role
                };
            }

            return result;
        }

        if (endpoint === this.ENDPOINTS.USER_REGISTER && method === 'POST') {
            const result = userManager.register(data.username, data.email, data.password, data.role);
            if (result.success) {
                result.message = '注册成功！请登录';
            }
            return result;
        }

        if (endpoint === this.ENDPOINTS.AUTHOR_REGISTER && method === 'POST') {
            const result = userManager.registerAuthor(data);
            if (result.success) {
                result.message = '作者注册成功！请登录';
            }
            return result;
        }

        if (endpoint === this.ENDPOINTS.USER_LOGOUT && method === 'POST') {
            userManager.logout();
            return { success: true, message: '退出成功' };
        }

        // 书籍相关API
        if (endpoint === this.ENDPOINTS.BOOK_LIST && method === 'GET') {
            return {
                success: true,
                data: bookManager.getAllBooks(),
                pagination: {
                    page: 1,
                    total: bookManager.getAllBooks().length,
                    hasMore: false
                }
            };
        }

        if (endpoint.startsWith('/books/') && !endpoint.includes('/chapters') && method === 'GET') {
            const bookId = endpoint.split('/').pop();
            const book = bookManager.getBookById(bookId);
            return {
                success: !!book,
                data: book,
                message: book ? '获取成功' : '书籍不存在'
            };
        }

        if (endpoint === this.ENDPOINTS.BOOK_SEARCH && method === 'GET') {
            const query = data?.q || '';
            const results = bookManager.searchBooks(query);
            return {
                success: true,
                data: results,
                total: results.length
            };
        }

        if (endpoint === this.ENDPOINTS.BOOK_ADD && method === 'POST') {
            const currentUser = userManager.getCurrentUser();
            if (!currentUser || currentUser.role !== CONFIG.ROLES.AUTHOR) {
                return { success: false, message: '无权限添加书籍' };
            }
            return bookManager.addBook(data, currentUser.authorId);
        }

        if (endpoint.includes('/books/') && method === 'PUT' && !endpoint.includes('/chapters')) {
            const bookId = endpoint.split('/').pop();
            const currentUser = userManager.getCurrentUser();
            if (!currentUser || currentUser.role !== CONFIG.ROLES.AUTHOR) {
                return { success: false, message: '无权限修改书籍' };
            }
            return bookManager.updateBook(bookId, data, currentUser.authorId);
        }

        // 章节相关API
        if (endpoint.includes('/chapters') && method === 'GET') {
            const pathParts = endpoint.split('/');
            const bookId = pathParts[2];
            const chapterId = pathParts[4];

            if (chapterId) {
                // 获取特定章节
                const chapter = bookManager.getChapter(bookId, chapterId);
                return {
                    success: !!chapter,
                    data: chapter,
                    message: chapter ? '获取成功' : '章节不存在'
                };
            } else {
                // 获取章节列表
                const book = bookManager.getBookById(bookId);
                return {
                    success: !!book,
                    data: book ? book.chapters : [],
                    message: book ? '获取成功' : '书籍不存在'
                };
            }
        }

        // 管理相关API
        if (endpoint === this.ENDPOINTS.ADMIN_USERS && method === 'GET') {
            if (!userManager.hasRole(CONFIG.ROLES.ADMIN)) {
                return { success: false, message: '无权限访问' };
            }
            return {
                success: true,
                data: {
                    total: 150,
                    active: 120,
                    newToday: 5
                }
            };
        }

        // 默认成功响应
        return {
            success: true,
            message: '操作成功',
            data: null
        };
    },

    /**
     * 模拟网络延迟
     * @param {number} ms - 延迟时间(毫秒)
     * @returns {Promise}
     */
    delay: function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // ========== 具体API方法 ==========

    // 用户相关
    user: {
        login: function(credentials) {
            return apiManager.request(apiManager.ENDPOINTS.USER_LOGIN, 'POST', credentials);
        },

        register: function(userData) {
            return apiManager.request(apiManager.ENDPOINTS.USER_REGISTER, 'POST', userData);
        },

        registerAuthor: function(authorData) {
            return apiManager.request(apiManager.ENDPOINTS.AUTHOR_REGISTER, 'POST', authorData);
        },

        logout: function() {
            return apiManager.request(apiManager.ENDPOINTS.USER_LOGOUT, 'POST');
        },

        getProfile: function() {
            return apiManager.request(apiManager.ENDPOINTS.USER_PROFILE);
        }
    },

    // 书籍相关
    book: {
        list: function(page = 1, category = 'all') {
            return apiManager.request(`${apiManager.ENDPOINTS.BOOK_LIST}?page=${page}&category=${category}`);
        },

        detail: function(bookId) {
            const endpoint = apiManager.ENDPOINTS.BOOK_DETAIL.replace('{id}', bookId);
            return apiManager.request(endpoint);
        },

        search: function(query, scope = 'all') {
            return apiManager.request(`${apiManager.ENDPOINTS.BOOK_SEARCH}?q=${encodeURIComponent(query)}&scope=${scope}`);
        },

        add: function(bookData) {
            return apiManager.request(apiManager.ENDPOINTS.BOOK_ADD, 'POST', bookData);
        },

        update: function(bookId, updates) {
            const endpoint = apiManager.ENDPOINTS.BOOK_UPDATE.replace('{id}', bookId);
            return apiManager.request(endpoint, 'PUT', updates);
        }
    },

    // 章节相关
    chapter: {
        getContent: function(bookId, chapterId) {
            const endpoint = apiManager.ENDPOINTS.CHAPTER_CONTENT
                .replace('{bookId}', bookId)
                .replace('{chapterId}', chapterId);
            return apiManager.request(endpoint);
        },

        getList: function(bookId) {
            const endpoint = apiManager.ENDPOINTS.CHAPTER_LIST.replace('{bookId}', bookId);
            return apiManager.request(endpoint);
        }
    },

    // 阅读记录
    reading: {
        saveProgress: function(bookId, chapterId, progress) {
            return apiManager.request(apiManager.ENDPOINTS.READING_PROGRESS, 'POST', {
                bookId: bookId,
                chapterId: chapterId,
                progress: progress
            });
        },

        getHistory: function() {
            return apiManager.request(apiManager.ENDPOINTS.READING_HISTORY);
        }
    },

    // 管理相关
    admin: {
        getUsers: function() {
            return apiManager.request(apiManager.ENDPOINTS.ADMIN_USERS);
        },

        getBooks: function() {
            return apiManager.request(apiManager.ENDPOINTS.ADMIN_BOOKS);
        },

        getStats: function() {
            return apiManager.request(apiManager.ENDPOINTS.ADMIN_STATS);
        }
    }
};

// ==================== 页面路由管理系统 ====================

/**
 * 页面路由管理模块
 * 负责页面跳转、参数传递和导航控制
 * 支持多角色页面跳转
 */
const router = {
    /**
     * 获取当前页面所在的目录路径
     * @returns {string} 目录路径
     */
    getCurrentDirectory: function() {
        const currentPath = window.location.pathname;
        const lastSlashIndex = currentPath.lastIndexOf('/');

        if (lastSlashIndex === -1) {
            return '/';
        }

        return currentPath.substring(0, lastSlashIndex + 1);
    },

    /**
     * 跳转到指定页面
     * @param {string} page - 页面名称或路径
     * @param {Object} params - URL参数
     */
    navigateTo: function(page, params = {}) {
        // 获取当前目录
        const currentDir = this.getCurrentDirectory();

        // 构建完整URL
        let url;

        if (page.startsWith('/')) {
            // 如果是绝对路径，直接使用
            url = page;
        } else if (page.includes('/')) {
            // 如果页面路径包含目录，根据当前目录计算
            if (currentDir.includes('/templates/')) {
                // 当前已经在templates目录下
                url = page;
            } else {
                // 需要返回到templates目录
                url = '../templates/' + page;
            }
        } else {
            // 普通页面，直接使用当前目录
            url = page;
        }

        if (Object.keys(params).length > 0) {
            const queryParams = new URLSearchParams(params);
            url += '?' + queryParams.toString();
        }

        console.log('页面跳转:', url, '当前目录:', currentDir);
        window.location.href = url;
    },

    /**
     * 跳转到书籍详情页
     * @param {number} bookId - 书籍ID
     */
    goToBookDetail: function(bookId) {
        this.navigateTo('book-detail.html', { id: bookId });
    },

    /**
     * 跳转到阅读页面
     * @param {number} bookId - 书籍ID
     * @param {number} chapterId - 章节ID
     */
    goToReadingPage: function(bookId, chapterId = 1) {
        this.navigateTo('chapter-reading.html', {
            bookId: bookId,
            chapterId: chapterId
        });
    },

    /**
     * 跳转到评论页面
     * @param {number} bookId - 书籍ID
     */
    goToComments: function(bookId) {
        this.navigateTo('comments-section.html', { bookId: bookId });
    },

    /**
     * 跳转到作者后台
     */
    goToAuthorDashboard: function() {
        this.navigateTo('author/author-dashboard.html');
    },

    /**
     * 跳转到管理员后台
     */
    goToAdminDashboard: function() {
        this.navigateTo('admin/admin-dashboard.html');
    },

    /**
     * 获取URL参数
     * @param {string} param - 参数名
     * @returns {string|null} 参数值
     */
    getUrlParam: function(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },

    /**
     * 获取所有URL参数
     * @returns {Object} 参数对象
     */
    getAllUrlParams: function() {
        const urlParams = new URLSearchParams(window.location.search);
        const params = {};

        for (const [key, value] of urlParams) {
            params[key] = value;
        }

        return params;
    },

    /**
     * 检查必要参数
     * @param {Array} requiredParams - 必需参数列表
     * @returns {boolean} 检查结果
     */
    checkRequiredParams: function(requiredParams) {
        const params = this.getAllUrlParams();

        for (const param of requiredParams) {
            if (!params[param]) {
                console.error('缺少必要参数:', param);
                return false;
            }
        }

        return true;
    },

    /**
     * 重定向到首页
     */
    redirectToHome: function() {
        const userRole = storageManager.getUserRole();

        if (userRole === CONFIG.ROLES.AUTHOR) {
            this.goToAuthorDashboard();
        } else if (userRole === CONFIG.ROLES.ADMIN) {
            this.goToAdminDashboard();
        } else {
            this.navigateTo('home.html');
        }
    },

    /**
     * 重定向到登录页
     */
    redirectToLogin: function() {
        this.navigateTo('index.html');
    },

    /**
     * 返回上一页
     */
    goBack: function() {
        window.history.back();
    },

    /**
     * 检查页面权限并重定向
     * @param {string} requiredRole - 需要的角色
     */
    checkAndRedirect: function(requiredRole) {
        if (!userManager.checkAccess(requiredRole)) {
            utils.showNotification('您没有权限访问此页面', false);
            setTimeout(() => {
                this.redirectToHome();
            }, 2000);
            return false;
        }
        return true;
    }
};

// ==================== 工具函数 ====================

/**
 * 工具函数模块
 * 提供各种通用工具函数
 */
const utils = {
    /**
     * 显示通知消息
     * @param {string} message - 消息内容
     * @param {boolean} isSuccess - 是否成功消息
     * @param {number} duration - 显示时长(毫秒)
     */
    showNotification: function(message, isSuccess = true, duration = 3000) {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');

        if (!notification || !notificationText) {
            console.warn('通知组件未找到');
            return;
        }

        // 更新通知内容
        notificationText.textContent = message;
        notification.className = 'notification';
        notification.classList.add(isSuccess ? 'success' : 'error');

        // 更新图标
        const icon = notification.querySelector('i');
        if (icon) {
            icon.className = isSuccess ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        }

        // 显示通知
        notification.classList.add('show');

        // 自动隐藏
        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);

        console.log(`通知: ${message}`, isSuccess ? '✅' : '❌');
    },

    /**
     * 创建背景浮动元素
     */
    createBackgroundElements: function() {
        const container = document.getElementById('backgroundElements');
        if (!container) return;

        // 清空现有元素
        container.innerHTML = '';

        const elementsCount = 15;

        for (let i = 0; i < elementsCount; i++) {
            const element = document.createElement('div');
            element.classList.add('bg-circle');

            const size = Math.random() * 120 + 30;
            const posX = Math.random() * 100;
            const delay = Math.random() * 5;
            const duration = Math.random() * 10 + 20;

            element.style.width = `${size}px`;
            element.style.height = `${size}px`;
            element.style.left = `${posX}%`;
            element.style.top = `${100 + Math.random() * 20}%`;
            element.style.opacity = Math.random() * 0.2 + 0.05;
            element.style.animationDuration = `${duration}s`;
            element.style.animationDelay = `${delay}s`;

            container.appendChild(element);
        }
    },

    /**
     * 格式化日期
     * @param {string|Date} date - 日期
     * @returns {string} 格式化后的日期
     */
    formatDate: function(date) {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;

        // 小于1分钟
        if (diff < 60000) {
            return '刚刚';
        }

        // 小于1小时
        if (diff < 3600000) {
            return `${Math.floor(diff / 60000)}分钟前`;
        }

        // 小于1天
        if (diff < 86400000) {
            return `${Math.floor(diff / 3600000)}小时前`;
        }

        // 小于1周
        if (diff < 604800000) {
            return `${Math.floor(diff / 86400000)}天前`;
        }

        // 返回具体日期
        return d.toLocaleDateString('zh-CN');
    },

    /**
     * 防抖函数
     * @param {Function} func - 要防抖的函数
     * @param {number} delay - 延迟时间
     * @returns {Function} 防抖后的函数
     */
    debounce: function(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * 节流函数
     * @param {Function} func - 要节流的函数
     * @param {number} delay - 延迟时间
     * @returns {Function} 节流后的函数
     */
    throttle: function(func, delay) {
        let lastCall = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                func.apply(this, args);
            }
        };
    },

    /**
     * 生成随机ID
     * @param {number} length - ID长度
     * @returns {string} 随机ID
     */
    generateId: function(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    /**
     * 安全地解析JSON
     * @param {string} jsonString - JSON字符串
     * @param {*} defaultValue - 默认值
     * @returns {*} 解析结果
     */
    safeJsonParse: function(jsonString, defaultValue = null) {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('JSON解析失败:', error);
            return defaultValue;
        }
    },

    /**
     * 检查元素是否存在
     * @param {string} selector - 选择器
     * @returns {boolean} 是否存在
     */
    elementExists: function(selector) {
        return !!document.querySelector(selector);
    },

    /**
     * 加载脚本
     * @param {string} src - 脚本URL
     * @returns {Promise} 加载Promise
     */
    loadScript: function(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },

    /**
     * 格式化数字为中文单位
     * @param {number} num - 数字
     * @returns {string} 格式化后的字符串
     */
    formatNumber: function(num) {
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + '万';
        }
        return num.toString();
    },

    /**
     * 深度合并对象
     * @param {Object} target - 目标对象
     * @param {Object} source - 源对象
     * @returns {Object} 合并后的对象
     */
    deepMerge: function(target, source) {
        const result = { ...target };

        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }

        return result;
    }
};

// ==================== 初始化函数 ====================

/**
 * 初始化应用程序
 */
function initApp() {
    console.log(`🚀 ${CONFIG.APP_NAME} v${CONFIG.VERSION} 初始化中...`);

    // 初始化存储管理器
    console.log('初始化存储管理器...');

    // 初始化各模块
    userManager.init();
    bookManager.init();

    // 创建背景元素
    utils.createBackgroundElements();

    // 检查登录状态并更新UI
    const user = checkLoginStatus();

    // 如果是登录页面且已登录，跳转到首页
    if (window.location.pathname.includes('index.html') && user) {
        console.log('已登录用户访问登录页，跳转到首页...');
        setTimeout(() => {
            router.redirectToHome();
        }, 1000);
    }

    console.log(`✅ ${CONFIG.APP_NAME} 初始化完成`);
}

/**
 * 检查登录状态并更新页面
 */
function checkLoginStatus() {
    const user = userManager.getCurrentUser();

    // 更新页面上的用户信息
    const usernameElements = document.querySelectorAll('[id*="usernameDisplay"], [id*="welcomeUsername"]');
    const avatarElements = document.querySelectorAll('[id*="userAvatar"], [id*="commentUserAvatar"]');
    const roleElements = document.querySelectorAll('[id*="userRole"]');

    usernameElements.forEach(el => {
        if (el && user) {
            el.textContent = user.username;
        }
    });

    avatarElements.forEach(el => {
        if (el && user) {
            el.textContent = user.username.charAt(0);
        }
    });

    roleElements.forEach(el => {
        if (el && user) {
            const roleText = {
                [CONFIG.ROLES.READER]: '读者',
                [CONFIG.ROLES.AUTHOR]: '作者',
                [CONFIG.ROLES.ADMIN]: '管理员'
            }[user.role] || '用户';
            el.textContent = roleText;
        }
    });

    // 如果是登录页面且已登录，跳转到首页
    if (window.location.pathname.includes('index.html') && user) {
        setTimeout(() => {
            router.redirectToHome();
        }, 1000);
    }

    return user;
}

/**
 * 退出登录
 */
function logout() {
    if (confirm('确定要退出登录吗？')) {
        userManager.logout();
        utils.showNotification('已退出登录');
        setTimeout(() => {
            router.redirectToLogin();
        }, 1500);
    }
}

/**
 * 检查页面访问权限
 * @param {string} requiredRole - 需要的角色
 * @returns {boolean} 是否有权限访问
 */
function checkPageAccess(requiredRole = CONFIG.ROLES.READER) {
    const currentPage = window.location.pathname.split('/').pop();

    // 不需要登录的页面
    const publicPages = ['index.html', 'main-index.html'];

    // 如果不在公开页面且未登录，跳转到登录页
    if (!publicPages.includes(currentPage) && !storageManager.isLoggedIn()) {
        utils.showNotification('请先登录', false);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        return false;
    }

    // 检查角色权限
    const userRole = storageManager.getUserRole();

    if (!userRole) {
        utils.showNotification('用户角色信息丢失，请重新登录', false);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        return false;
    }

    // 权限检查逻辑
    if (requiredRole === CONFIG.ROLES.ADMIN && userRole !== CONFIG.ROLES.ADMIN) {
        utils.showNotification('您没有管理员权限', false);
        setTimeout(() => {
            router.redirectToHome();
        }, 2000);
        return false;
    }

    if (requiredRole === CONFIG.ROLES.AUTHOR &&
        userRole !== CONFIG.ROLES.AUTHOR &&
        userRole !== CONFIG.ROLES.ADMIN) {
        utils.showNotification('您没有作者权限', false);
        setTimeout(() => {
            router.redirectToHome();
        }, 2000);
        return false;
    }

    return true;
}

/**
 * 获取用户欢迎信息
 * @returns {string} 欢迎信息
 */
function getWelcomeMessage() {
    const user = userManager.getCurrentUser();
    if (!user) return '';

    const roleText = {
        [CONFIG.ROLES.READER]: '读者',
        [CONFIG.ROLES.AUTHOR]: '作者',
        [CONFIG.ROLES.ADMIN]: '管理员'
    }[user.role] || '用户';

    return `欢迎，${user.username}（${roleText}）`;
}

// ==================== 全局暴露 ====================

// 将主要功能暴露到全局作用域，便于其他脚本使用
window.userManager = userManager;
window.bookManager = bookManager;
window.apiManager = apiManager;
window.router = router;
window.utils = utils;
window.logout = logout;
window.checkLoginStatus = checkLoginStatus;
window.checkPageAccess = checkPageAccess;
window.getWelcomeMessage = getWelcomeMessage;
window.CONFIG = CONFIG;
window.storageManager = storageManager;

// ==================== 页面加载初始化 ====================

// 当DOM加载完成时初始化应用
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

// 页面完全加载后的额外初始化
window.addEventListener('load', function() {
    // 执行页面特定的检查
    if (typeof initPage === 'function') {
        initPage();
    }
});

console.log('📚 common.js 加载完成 - FlutterPage公共函数库 - 支持多角色系统');