/**
 * 管理员仪表板脚本
 * 负责管理员后台的功能实现和交互处理
 */

const adminManager = {
    // 当前管理员信息
    currentAdmin: null,

    // 当前显示的模块
    currentSection: 'dashboard',

    /**
     * 初始化管理员仪表板
     */
    init: function() {
        console.log('🚀 初始化管理员仪表板...');

        // 加载管理员数据
        this.loadAdminData();

        // 初始化事件监听器
        this.initEventListeners();

        // 初始化图表
        this.initCharts();

        // 加载统计数据
        this.loadStatistics();

        console.log('✅ 管理员仪表板初始化完成');
    },

    /**
     * 加载管理员数据
     */
    loadAdminData: function() {
        // 模拟管理员数据
        this.currentAdmin = {
            id: 1,
            username: 'admin',
            name: '系统管理员',
            role: '超级管理员',
            permissions: ['users', 'content', 'system', 'stats']
        };

        // 更新显示
        const adminNameElement = document.querySelector('.admin-name');
        const adminRoleElement = document.querySelector('.admin-role');

        if (adminNameElement) {
            adminNameElement.textContent = this.currentAdmin.name;
        }

        if (adminRoleElement) {
            adminRoleElement.textContent = this.currentAdmin.role;
        }
    },

    /**
     * 初始化事件监听器
     */
    initEventListeners: function() {
        // 侧边栏菜单点击事件
        const menuItems = document.querySelectorAll('.menu-item:not(.group-title)');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const target = e.currentTarget.getAttribute('data-target');
                this.switchSection(target);
            });
        });

        // 筛选标签点击事件
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const filterType = e.currentTarget.getAttribute('data-filter');
                this.filterContent(filterType);
            });
        });

        // 设置导航点击事件
        const settingsNavs = document.querySelectorAll('.settings-nav');
        settingsNavs.forEach(nav => {
            nav.addEventListener('click', (e) => {
                const target = e.currentTarget.getAttribute('data-target');
                this.switchSettingsPanel(target);
            });
        });

        // 全选用户复选框
        const selectAllUsers = document.getElementById('selectAllUsers');
        if (selectAllUsers) {
            selectAllUsers.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('.user-checkbox');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = e.target.checked;
                });
            });
        }

        // 搜索功能
        const userSearch = document.getElementById('userSearch');
        if (userSearch) {
            userSearch.addEventListener('input', this.debounce(this.searchUsers, 300));
        }

        // 日期筛选
        const dateFilter = document.getElementById('dateFilter');
        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                this.filterByDate(e.target.value);
            });
        }
    },

    /**
     * 初始化图表
     */
    initCharts: function() {
        // 用户增长趋势图
        const userGrowthCtx = document.getElementById('userGrowthChart');
        if (userGrowthCtx) {
            this.userGrowthChart = new Chart(userGrowthCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['10月1日', '10月8日', '10月15日', '10月22日', '10月29日', '11月5日', '11月12日'],
                    datasets: [{
                        label: '新用户',
                        data: [120, 150, 180, 200, 250, 300, 350],
                        borderColor: '#4f46e5',
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        fill: true,
                        tension: 0.4
                    }, {
                        label: '活跃用户',
                        data: [1000, 1100, 1200, 1300, 1400, 1500, 1580],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // 作品分类饼图
        const categoryCtx = document.getElementById('categoryChart');
        if (categoryCtx) {
            this.categoryChart = new Chart(categoryCtx.getContext('2d'), {
                type: 'pie',
                data: {
                    labels: ['玄幻', '仙侠', '都市', '科幻', '历史', '悬疑', '其他'],
                    datasets: [{
                        data: [30, 25, 15, 10, 8, 7, 5],
                        backgroundColor: [
                            '#4f46e5', '#10b981', '#3b82f6', '#f59e0b',
                            '#ef4444', '#8b5cf6', '#6b7280'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }
            });
        }
    },

    /**
     * 加载统计数据
     */
    loadStatistics: function() {
        // 这里可以调用API获取实时统计数据
        console.log('加载统计数据...');
    },

    /**
     * 切换显示模块
     * @param {string} sectionId - 要显示的模块ID
     */
    switchSection: function(sectionId) {
        // 隐藏所有模块
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // 显示目标模块
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
        }

        // 更新菜单项状态
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-target') === sectionId) {
                item.classList.add('active');
            }
        });

        // 滚动到顶部
        window.scrollTo(0, 0);
    },

    /**
     * 搜索用户
     * @param {Event} e - 输入事件
     */
    searchUsers: function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#user-management tbody tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    },

    /**
     * 按日期筛选数据
     * @param {string} dateRange - 日期范围
     */
    filterByDate: function(dateRange) {
        console.log('按日期筛选:', dateRange);
        // 这里可以调用API获取对应日期范围的数据
    },

    /**
     * 筛选内容
     * @param {string} filterType - 筛选类型
     */
    filterContent: function(filterType) {
        // 更新筛选标签状态
        const tabs = document.querySelectorAll('.filter-tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-filter') === filterType) {
                tab.classList.add('active');
            }
        });

        // 根据筛选类型显示/隐藏内容
        console.log('筛选内容:', filterType);
        // 这里可以实现具体的筛选逻辑
    },

    /**
     * 切换设置面板
     * @param {string} panelId - 面板ID
     */
    switchSettingsPanel: function(panelId) {
        // 更新导航状态
        const navs = document.querySelectorAll('.settings-nav');
        navs.forEach(nav => {
            nav.classList.remove('active');
            if (nav.getAttribute('data-target') === panelId) {
                nav.classList.add('active');
            }
        });

        // 切换面板
        const panels = document.querySelectorAll('.settings-panel');
        panels.forEach(panel => {
            panel.classList.remove('active');
        });

        const targetPanel = document.getElementById(panelId);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
    },

    /**
     * 防抖函数
     * @param {Function} func - 要执行的函数
     * @param {number} delay - 延迟时间
     * @returns {Function} 防抖后的函数
     */
    debounce: function(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * 封禁用户
     * @param {number} userId - 用户ID
     */
    banUser: function(userId) {
        if (confirm(`确定要封禁用户 ${userId} 吗？`)) {
            // 调用API封禁用户
            console.log('封禁用户:', userId);
            utils.showNotification('用户已封禁');
        }
    },

    /**
     * 解封用户
     * @param {number} userId - 用户ID