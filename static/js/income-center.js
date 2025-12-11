/**
 * FlutterPage - 收入中心脚本
 * 负责收入统计、提现管理和图表展示功能
 */

// 收入中心管理模块
const incomeCenter = {
    // 当前选中的标签页
    currentTab: 'incomeRecords',

    // 收入数据
    incomeData: {
        overview: {},
        trend: {},
        sources: {},
        works: {},
        types: {},
        readers: {},
        records: [],
        withdrawRecords: [],
        settlementRecords: []
    },

    // 分页信息
    pagination: {
        income: { currentPage: 1, pageSize: 10, total: 0 },
        withdraw: { currentPage: 1, pageSize: 10, total: 0 },
        settlement: { currentPage: 1, pageSize: 10, total: 0 }
    },

    /**
     * 初始化收入中心模块
     */
    init: function() {
        this.loadIncomeData();
        this.setupEventListeners();

        console.log('收入中心模块初始化完成');
    },

    /**
     * 加载收入数据
     */
    loadIncomeData: function() {
        this.showLoadingState();

        // 模拟API调用 - 实际项目中从后端获取
        setTimeout(() => {
            this.generateMockData();
            this.renderOverview();
            this.renderCharts();
            this.renderRecords();

            utils.showNotification('收入数据加载完成');
        }, 1500);
    },

    /**
     * 生成模拟数据
     */
    generateMockData: function() {
        // 概览数据
        this.incomeData.overview = {
            availableBalance: 2456.78,
            yesterdayIncome: 123.45,
            yesterdayChange: 12.5,
            monthlyIncome: 2345.67,
            monthlyChange: 8.3,
            totalIncome: 123456.78,
            totalChange: 15.2
        };

        // 趋势数据
        this.incomeData.trend = this.generateTrendData();

        // 收入来源数据
        this.incomeData.sources = {
            '章节订阅': 45.2,
            '读者打赏': 25.8,
            'VIP分成': 18.5,
            '广告收入': 8.3,
            '活动奖励': 2.2
        };

        // 作品收入排行
        this.incomeData.works = [
            { title: '星穹传说', amount: 12345.67, percentage: 42.5 },
            { title: '灵域迷踪', amount: 9876.54, percentage: 34.1 },
            { title: '剑影仙途', amount: 5432.10, percentage: 18.7 },
            { title: '数据觉醒', amount: 1234.56, percentage: 4.3 },
            { title: '美食异世界', amount: 567.89, percentage: 2.0 }
        ];

        // 收入类型分析
        this.incomeData.types = {
            '普通章节': 35.2,
            'VIP章节': 42.8,
            '打赏收入': 15.6,
            '广告分成': 6.4
        };

        // 读者付费分析
        this.incomeData.readers = {
            '付费读者数': 1234,
            '平均付费金额': 45.67,
            '付费转化率': 12.5,
            '复购率': 68.3
        };

        // 收入记录
        this.incomeData.records = this.generateIncomeRecords(50);
        this.pagination.income.total = this.incomeData.records.length;

        // 提现记录
        this.incomeData.withdrawRecords = this.generateWithdrawRecords(15);
        this.pagination.withdraw.total = this.incomeData.withdrawRecords.length;

        // 结算记录
        this.incomeData.settlementRecords = this.generateSettlementRecords(12);
        this.pagination.settlement.total = this.incomeData.settlementRecords.length;
    },

    /**
     * 生成趋势数据
     */
    generateTrendData: function() {
        const days = 30;
        const data = {
            labels: [],
            amounts: []
        };

        let baseAmount = 50;

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            data.labels.push(this.formatDate(date));

            // 模拟收入波动（周末收入较高）
            const dayOfWeek = date.getDay();
            let amount = baseAmount + Math.random() * 30 - 15;
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                amount += 20; // 周末增加
            }

            // 模拟增长趋势
            amount += i * 0.5;

            data.amounts.push(Math.round(amount * 100) / 100);
        }

        return data;
    },

    /**
     * 生成收入记录
     */
    generateIncomeRecords: function(count) {
        const records = [];
        const types = ['chapter', 'tip', 'vip', 'ad', 'bonus'];
        const typeNames = {
            'chapter': '章节订阅',
            'tip': '读者打赏',
            'vip': 'VIP分成',
            'ad': '广告收入',
            'bonus': '活动奖励'
        };
        const works = ['星穹传说', '灵域迷踪', '剑影仙途', '数据觉醒', '美食异世界'];
        const readers = ['书迷小张', '文学爱好者', '追更达人', '星空漫步', '时光旅行者'];

        for (let i = 0; i < count; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const amount = Math.random() * 100 + 1;
            const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

            records.push({
                id: i + 1,
                time: date.toISOString(),
                work: works[Math.floor(Math.random() * works.length)],
                type: type,
                typeName: typeNames[type],
                amount: Math.round(amount * 100) / 100,
                reader: readers[Math.floor(Math.random() * readers.length)],
                status: 'completed'
            });
        }

        // 按时间倒序排列
        return records.sort((a, b) => new Date(b.time) - new Date(a.time));
    },

    /**
     * 生成提现记录
     */
    generateWithdrawRecords: function(count) {
        const records = [];
        const methods = ['alipay', 'wechat', 'bank'];
        const methodNames = {
            'alipay': '支付宝',
            'wechat': '微信支付',
            'bank': '银行卡'
        };
        const statuses = ['completed', 'processing', 'pending', 'failed'];
        const statusNames = {
            'completed': '已完成',
            'processing': '处理中',
            'pending': '待处理',
            'failed': '失败'
        };

        for (let i = 0; i < count; i++) {
            const amount = Math.floor(Math.random() * 2000) + 100;
            const fee = amount * 0.01;
            const actual = amount - fee;
            const date = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
            const method = methods[Math.floor(Math.random() * methods.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];

            records.push({
                id: i + 1,
                time: date.toISOString(),
                amount: Math.round(amount * 100) / 100,
                fee: Math.round(fee * 100) / 100,
                actual: Math.round(actual * 100) / 100,
                method: method,
                methodName: methodNames[method],
                status: status,
                statusName: statusNames[status]
            });
        }

        // 按时间倒序排列
        return records.sort((a, b) => new Date(b.time) - new Date(a.time));
    },

    /**
     * 生成结算记录
     */
    generateSettlementRecords: function(count) {
        const records = [];
        const statuses = ['completed', 'processing'];
        const statusNames = {
            'completed': '已结算',
            'processing': '结算中'
        };

        for (let i = 0; i < count; i++) {
            const income = Math.floor(Math.random() * 5000) + 1000;
            const platformFee = income * 0.3;
            const tax = income * 0.1;
            const actual = income - platformFee - tax;
            const date = new Date(2023, 10 - i, 25); // 每月25日

            records.push({
                id: i + 1,
                period: `${date.getFullYear()}年${date.getMonth() + 1}月`,
                income: Math.round(income * 100) / 100,
                platformFee: Math.round(platformFee * 100) / 100,
                tax: Math.round(tax * 100) / 100,
                actual: Math.round(actual * 100) / 100,
                status: i === 0 ? 'processing' : 'completed',
                statusName: i === 0 ? '结算中' : '已结算',
                time: i === 0 ? '' : date.toISOString()
            });
        }

        // 按时间倒序排列
        return records.sort((a, b) => new Date(b.time || new Date()) - new Date(a.time || new Date()));
    },

    /**
     * 设置事件监听器
     */
    setupEventListeners: function() {
        // 提现金额输入监听
        const amountInput = document.getElementById('withdrawAmount');
        if (amountInput) {
            amountInput.addEventListener('input', () => {
                this.updateWithdrawSummary();
            });
        }

        // 提现方式切换监听
        const methodRadios = document.querySelectorAll('input[name="withdrawMethod"]');
        methodRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.switchWithdrawMethod(e.target.value);
            });
        });

        // 模态框点击外部关闭
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeWithdrawModal();
                    this.closeIncomeDetailModal();
                }
            });
        });
    },

    /**
     * 显示加载状态
     */
    showLoadingState: function() {
        const containers = [
            'incomeTrendChart', 'incomeSourceChart', 'worksRankingChart',
            'incomeTypeChart', 'readerAnalysisChart'
        ];

        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `
                    <div class="loading-state">
                        <div class="loading-spinner"></div>
                        <div>加载数据中...</div>
                    </div>
                `;
            }
        });

        // 表格加载状态
        const recordBodies = ['incomeRecordsBody', 'withdrawRecordsBody', 'settlementRecordsBody'];
        recordBodies.forEach(bodyId => {
            const body = document.getElementById(bodyId);
            if (body) {
                body.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 40px;">
                            <div class="loading-state">
                                <div class="loading-spinner"></div>
                                <div>加载数据中...</div>
                            </div>
                        </td>
                    </tr>
                `;
            }
        });
    },

    /**
     * 渲染概览数据
     */
    renderOverview: function() {
        const overview = this.incomeData.overview;

        document.getElementById('availableBalance').textContent = '¥' + overview.availableBalance.toFixed(2);
        document.getElementById('yesterdayIncome').textContent = '¥' + overview.yesterdayIncome.toFixed(2);
        document.getElementById('monthlyIncome').textContent = '¥' + overview.monthlyIncome.toFixed(2);
        document.getElementById('totalIncome').textContent = '¥' + this.formatNumber(overview.totalIncome);

        document.getElementById('yesterdayChange').textContent = overview.yesterdayChange + '%';
        document.getElementById('monthlyChange').textContent = overview.monthlyChange + '%';
        document.getElementById('totalChange').textContent = overview.totalChange + '%';

        // 更新模态框中的余额
        document.getElementById('modalAvailableBalance').textContent = '¥' + overview.availableBalance.toFixed(2);
    },

    /**
     * 渲染所有图表
     */
    renderCharts: function() {
        this.renderIncomeTrendChart();
        this.renderIncomeSourceChart();
        this.renderWorksRankingChart();
        this.renderIncomeTypeChart();
        this.renderReaderAnalysisChart();
    },

    /**
     * 渲染收入趋势图表
     */
    renderIncomeTrendChart: function() {
        const container = document.getElementById('incomeTrendChart');
        if (!container) return;

        const data = this.incomeData.trend;
        const maxAmount = Math.max(...data.amounts);

        let html = `
            <div class="chart-grid">
                ${Array.from({length: 50}, (_, i) => `<div class="grid-line"></div>`).join('')}
            </div>
            <div class="x-axis">
                ${data.labels.map((label, index) => 
                    index % 5 === 0 ? `<span>${label}</span>` : '<span></span>'
                ).join('')}
            </div>
            <div class="y-axis">
                ${[maxAmount, maxAmount * 0.75, maxAmount * 0.5, maxAmount * 0.25, 0].map(value => 
                    `<span>¥${value.toFixed(0)}</span>`
                ).join('')}
            </div>
            <svg class="data-line" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="${this.generateLinePath(data.amounts, maxAmount)}" 
                      stroke="#6A85B6" stroke-width="3" fill="none" />
                ${data.amounts.map((amount, index) => `
                    <circle class="data-point" cx="${(index / (data.amounts.length - 1)) * 100}" 
                            cy="${100 - (amount / maxAmount) * 100}" r="2"
                            fill="#6A85B6" stroke="#ffffff" stroke-width="2"
                            onclick="incomeCenter.showIncomeDetail(${index})" />
                `).join('')}
            </svg>
        `;

        container.innerHTML = html;
    },

    /**
     * 生成折线路径
     */
    generateLinePath: function(data, maxValue) {
        if (data.length === 0) return '';

        const points = data.map((value, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - (value / maxValue) * 100;
            return `${x},${y}`;
        });

        return `M ${points.join(' L ')}`;
    },

    /**
     * 渲染收入来源图表
     */
    renderIncomeSourceChart: function() {
        const container = document.getElementById('incomeSourceChart');
        if (!container) return;

        const data = this.incomeData.sources;
        const colors = ['#6A85B6', '#FF6B8B', '#4ECDC4', '#45B7D1', '#96CEB4'];

        let startAngle = 0;
        let html = '';
        let legendHtml = '';

        Object.entries(data).forEach(([source, percentage], index) => {
            const angle = (percentage / 100) * 360;
            const color = colors[index];

            html += `
                <div class="pie-slice" 
                     style="background: conic-gradient(${color} 0deg ${angle}deg, transparent ${angle}deg 360deg);
                            transform: rotate(${startAngle}deg);"
                     onclick="incomeCenter.showSourceDetail('${source}')">
                </div>
            `;

            legendHtml += `
                <div class="legend-item">
                    <div class="legend-color" style="background: ${color};"></div>
                    <span class="legend-label">${source}</span>
                    <span class="legend-value">${percentage}%</span>
                </div>
            `;

            startAngle += angle;
        });

        html += `<div class="pie-legend">${legendHtml}</div>`;
        container.innerHTML = html;
    },

    /**
     * 渲染作品收入排行
     */
    renderWorksRankingChart: function() {
        const container = document.getElementById('worksRankingChart');
        if (!container) return;

        const data = this.incomeData.works;

        let html = data.map((work, index) => `
            <div class="ranking-item" onclick="incomeCenter.showWorkDetail('${work.title}')">
                <div class="ranking-info">
                    <div class="ranking-number ${index < 3 ? 'top-3' : ''}">${index + 1}</div>
                    <div class="ranking-title">${work.title}</div>
                </div>
                <div class="ranking-amount">¥${this.formatNumber(work.amount)}</div>
            </div>
        `).join('');

        container.innerHTML = html;
    },

    /**
     * 渲染收入类型图表
     */
    renderIncomeTypeChart: function() {
        const container = document.getElementById('incomeTypeChart');
        if (!container) return;

        const data = this.incomeData.types;
        const maxValue = Math.max(...Object.values(data));

        let html = `
            <div class="bar-container">
                ${Object.entries(data).map(([type, percentage]) => `
                    <div class="bar-item">
                        <div class="bar" style="height: ${(percentage / maxValue) * 100}%;"
                             onclick="incomeCenter.showTypeDetail('${type}')">
                            <span class="bar-value">${percentage}%</span>
                        </div>
                        <div class="bar-label">${type}</div>
                    </div>
                `).join('')}
            </div>
        `;

        container.innerHTML = html;
    },

    /**
     * 渲染读者付费分析
     */
    renderReaderAnalysisChart: function() {
        const container = document.getElementById('readerAnalysisChart');
        if (!container) return;

        const data = this.incomeData.readers;

        let html = `
            <div class="reader-item">
                <span class="reader-label">付费读者数</span>
                <div>
                    <span class="reader-value">${this.formatNumber(data['付费读者数'])}人</span>
                </div>
            </div>
            <div class="reader-item">
                <span class="reader-label">平均付费金额</span>
                <div>
                    <span class="reader-value">¥${data['平均付费金额'].toFixed(2)}</span>
                </div>
            </div>
            <div class="reader-item">
                <span class="reader-label">付费转化率</span>
                <div>
                    <span class="reader-value">${data['付费转化率']}%</span>
                </div>
            </div>
            <div class="reader-item">
                <span class="reader-label">读者复购率</span>
                <div>
                    <span class="reader-value">${data['复购率']}%</span>
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    /**
     * 渲染记录表格
     */
    renderRecords: function() {
        this.renderIncomeRecords();
        this.renderWithdrawRecords();
        this.renderSettlementRecords();

        // 更新统计信息
        this.updateWithdrawSummary();
    },

    /**
     * 渲染收入记录
     */
    renderIncomeRecords: function() {
        const container = document.getElementById('incomeRecordsBody');
        if (!container) return;

        const filteredRecords = this.getFilteredIncomeRecords();
        const startIndex = (this.pagination.income.currentPage - 1) * this.pagination.income.pageSize;
        const endIndex = startIndex + this.pagination.income.pageSize;
        const pageRecords = filteredRecords.slice(startIndex, endIndex);

        if (pageRecords.length === 0) {
            container.innerHTML = this.getEmptyRecordsHTML('income');
            return;
        }

        let html = pageRecords.map(record => `
            <tr onclick="incomeCenter.showIncomeRecordDetail(${record.id})">
                <td>${this.formatDateTime(record.time)}</td>
                <td>${record.work}</td>
                <td>
                    <span class="income-type ${record.type}">
                        <i class="fas ${this.getIncomeTypeIcon(record.type)}"></i>
                        ${record.typeName}
                    </span>
                </td>
                <td class="amount positive">+¥${record.amount.toFixed(2)}</td>
                <td>${record.reader}</td>
                <td>
                    <span class="status completed">已完成</span>
                </td>
            </tr>
        `).join('');

        container.innerHTML = html;
        this.renderIncomeRecordsPagination(filteredRecords.length);
    },

    /**
     * 渲染提现记录
     */
    renderWithdrawRecords: function() {
        const container = document.getElementById('withdrawRecordsBody');
        if (!container) return;

        const startIndex = (this.pagination.withdraw.currentPage - 1) * this.pagination.withdraw.pageSize;
        const endIndex = startIndex + this.pagination.withdraw.pageSize;
        const pageRecords = this.incomeData.withdrawRecords.slice(startIndex, endIndex);

        if (pageRecords.length === 0) {
            container.innerHTML = this.getEmptyRecordsHTML('withdraw');
            return;
        }

        let html = pageRecords.map(record => `
            <tr>
                <td>${this.formatDateTime(record.time)}</td>
                <td class="amount">¥${record.amount.toFixed(2)}</td>
                <td class="amount negative">-¥${record.fee.toFixed(2)}</td>
                <td class="amount positive">¥${record.actual.toFixed(2)}</td>
                <td>${record.methodName}</td>
                <td>
                    <span class="status ${record.status}">${record.statusName}</span>
                </td>
                <td>
                    ${record.status === 'processing' ? `
                        <button class="btn btn-secondary btn-sm" onclick="incomeCenter.cancelWithdraw(${record.id})">
                            取消申请
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');

        container.innerHTML = html;
        this.renderWithdrawRecordsPagination();
    },

    /**
     * 渲染结算记录
     */
    renderSettlementRecords: function() {
        const container = document.getElementById('settlementRecordsBody');
        if (!container) return;

        const startIndex = (this.pagination.settlement.currentPage - 1) * this.pagination.settlement.pageSize;
        const endIndex = startIndex + this.pagination.settlement.pageSize;
        const pageRecords = this.incomeData.settlementRecords.slice(startIndex, endIndex);

        if (pageRecords.length === 0) {
            container.innerHTML = this.getEmptyRecordsHTML('settlement');
            return;
        }

        let html = pageRecords.map(record => `
            <tr>
                <td>${record.period}</td>
                <td class="amount positive">¥${record.income.toFixed(2)}</td>
                <td class="amount negative">-¥${record.platformFee.toFixed(2)}</td>
                <td class="amount negative">-¥${record.tax.toFixed(2)}</td>
                <td class="amount positive">¥${record.actual.toFixed(2)}</td>
                <td>
                    <span class="status ${record.status}">${record.statusName}</span>
                </td>
                <td>${record.time ? this.formatDate(record.time) : '-'}</td>
            </tr>
        `).join('');

        container.innerHTML = html;
        this.renderSettlementRecordsPagination();
    },

    // ==================== 交互功能 ====================

    /**
     * 切换标签页
     */
    switchTab: function(tabName) {
        this.currentTab = tabName;

        // 更新标签按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.tab-btn[onclick="incomeCenter.switchTab('${tabName}')"]`).classList.add('active');

        // 更新标签内容
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // 刷新当前标签页数据
        if (tabName === 'incomeRecords') {
            this.renderIncomeRecords();
        } else if (tabName === 'withdrawRecords') {
            this.renderWithdrawRecords();
        } else if (tabName === 'settlementRecords') {
            this.renderSettlementRecords();
        }
    },

    /**
     * 搜索收入记录
     */
    searchIncomeRecords: function(query) {
        this.renderIncomeRecords();
    },

    /**
     * 筛选收入记录
     */
    filterIncomeRecords: function() {
        this.renderIncomeRecords();
    },

    /**
     * 获取筛选后的收入记录
     */
    getFilteredIncomeRecords: function() {
        let records = [...this.incomeData.records];

        // 这里可以添加更多的筛选逻辑
        // 目前只是返回所有记录

        return records;
    },

    /**
     * 显示提现模态框
     */
    showWithdrawModal: function() {
        const availableBalance = this.incomeData.overview.availableBalance;

        if (availableBalance < 100) {
            utils.showNotification('可提现余额不足100元，无法提现', false);
            return;
        }

        // 重置表单
        document.getElementById('withdrawForm').reset();
        document.getElementById('withdrawAmount').value = '';
        this.updateWithdrawSummary();

        // 显示支付宝账号输入框（默认选中）
        this.switchWithdrawMethod('alipay');

        document.getElementById('withdrawModal').classList.add('show');
    },

    /**
     * 切换提现方式
     */
    switchWithdrawMethod: function(method) {
        // 隐藏所有账号输入组
        document.getElementById('alipayAccountGroup').style.display = 'none';
        document.getElementById('wechatAccountGroup').style.display = 'none';
        document.getElementById('bankAccountGroup').style.display = 'none';

        // 显示对应的账号输入组
        if (method === 'alipay') {
            document.getElementById('alipayAccountGroup').style.display = 'block';
        } else if (method === 'wechat') {
            document.getElementById('wechatAccountGroup').style.display = 'block';
        } else if (method === 'bank') {
            document.getElementById('bankAccountGroup').style.display = 'block';
        }
    },

    /**
     * 更新提现摘要
     */
    updateWithdrawSummary: function() {
        const amountInput = document.getElementById('withdrawAmount');
        const amount = parseFloat(amountInput.value) || 0;
        const fee = amount * 0.01;
        const actual = amount - fee;

        document.getElementById('summaryAmount').textContent = '¥' + amount.toFixed(2);
        document.getElementById('summaryFee').textContent = '¥' + fee.toFixed(2);
        document.getElementById('summaryActual').textContent = '¥' + actual.toFixed(2);
    },

    /**
     * 提交提现申请
     */
    submitWithdraw: function(event) {
        event.preventDefault();

        const amount = parseFloat(document.getElementById('withdrawAmount').value);
        const method = document.querySelector('input[name="withdrawMethod"]:checked').value;

        if (amount < 100) {
            utils.showNotification('提现金额不能低于100元', false);
            return;
        }

        const availableBalance = this.incomeData.overview.availableBalance;
        if (amount > availableBalance) {
            utils.showNotification('提现金额不能超过可提现余额', false);
            return;
        }

        // 验证账号信息
        if (method === 'alipay') {
            const account = document.getElementById('alipayAccount').value.trim();
            if (!account) {
                utils.showNotification('请输入支付宝账号', false);
                return;
            }
        } else if (method === 'wechat') {
            const account = document.getElementById('wechatAccount').value.trim();
            if (!account) {
                utils.showNotification('请输入微信账号', false);
                return;
            }
        } else if (method === 'bank') {
            const bankName = document.getElementById('bankName').value.trim();
            const bankAccount = document.getElementById('bankAccount').value.trim();
            const accountName = document.getElementById('accountName').value.trim();

            if (!bankName || !bankAccount || !accountName) {
                utils.showNotification('请填写完整的银行卡信息', false);
                return;
            }
        }

        // 模拟API调用
        utils.showNotification('提现申请提交中...', true);

        setTimeout(() => {
            this.closeWithdrawModal();
            utils.showNotification('提现申请已提交，预计1-3个工作日内到账');

            // 更新余额（在实际项目中应从后端获取最新数据）
            this.incomeData.overview.availableBalance -= amount;
            this.renderOverview();

            // 刷新提现记录
            this.loadIncomeData();
        }, 2000);
    },

    /**
     * 取消提现申请
     */
    cancelWithdraw: function(recordId) {
        if (!confirm('确定要取消这个提现申请吗？')) {
            return;
        }

        // 模拟API调用
        utils.showNotification('正在取消提现申请...', true);

        setTimeout(() => {
            utils.showNotification('提现申请已取消');
            // 在实际项目中，这里会更新记录状态并刷新数据
        }, 1000);
    },

    /**
     * 导出收入数据
     */
    exportIncomeData: function() {
        utils.showNotification('正在准备导出数据...', true);

        // 模拟导出过程
        setTimeout(() => {
            utils.showNotification('收入数据导出成功！');

            // 在实际项目中，这里会触发文件下载
            const link = document.createElement('a');
            link.href = '#'; // 实际应该是后端生成的文件URL
            link.download = `收入数据_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
        }, 2000);
    },

    /**
     * 刷新数据
     */
    refreshData: function() {
        utils.showNotification('正在更新收入数据...', true);
        this.loadIncomeData();
    },

    /**
     * 改变收入周期
     */
    changeIncomePeriod: function(period) {
        // 在实际项目中，这里会重新加载对应周期的数据
        console.log('切换到收入周期:', period);
        this.refreshData();
    },

    // ==================== 详情查看功能 ====================

    /**
     * 显示收入详情
     */
    showIncomeDetail: function(index) {
        const data = this.incomeData.trend;
        const date = data.labels[index];
        const amount = data.amounts[index];

        document.getElementById('incomeDetailContent').innerHTML = `
            <div class="detail-content">
                <h4>${date} 收入详情</h4>
                <div class="detail-stats">
                    <div class="stat-item">
                        <span class="stat-label">日期:</span>
                        <span class="stat-value">${date}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">日收入:</span>
                        <span class="stat-value positive">¥${amount.toFixed(2)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">较前日:</span>
                        <span class="stat-value ${amount > (data.amounts[index - 1] || 0) ? 'positive' : 'negative'}">
                            ${index > 0 ? ((amount - data.amounts[index - 1]) / data.amounts[index - 1] * 100).toFixed(1) + '%' : '-'}
                        </span>
                    </div>
                </div>
                <div class="detail-actions">
                    <button class="btn btn-primary" onclick="incomeCenter.closeIncomeDetailModal()">关闭</button>
                </div>
            </div>
        `;

        document.getElementById('incomeDetailModal').classList.add('show');
    },

    /**
     * 显示来源详情
     */
    showSourceDetail: function(source) {
        const percentage = this.incomeData.sources[source];

        document.getElementById('incomeDetailContent').innerHTML = `
            <div class="detail-content">
                <h4>${source} 详情</h4>
                <div class="detail-stats">
                    <div class="stat-item">
                        <span class="stat-label">收入来源:</span>
                        <span class="stat-value">${source}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">占比:</span>
                        <span class="stat-value">${percentage}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">估算月收入:</span>
                        <span class="stat-value positive">
                            ¥${(this.incomeData.overview.monthlyIncome * percentage / 100).toFixed(2)}
                        </span>
                    </div>
                </div>
                <div class="detail-info">
                    <p>${this.getSourceDescription(source)}</p>
                </div>
                <div class="detail-actions">
                    <button class="btn btn-primary" onclick="incomeCenter.closeIncomeDetailModal()">关闭</button>
                </div>
            </div>
        `;

        document.getElementById('incomeDetailModal').classList.add('show');
    },

    /**
     * 显示作品详情
     */
    showWorkDetail: function(workTitle) {
        const work = this.incomeData.works.find(w => w.title === workTitle);

        document.getElementById('incomeDetailContent').innerHTML = `
            <div class="detail-content">
                <h4>《${workTitle}》收入详情</h4>
                <div class="detail-stats">
                    <div class="stat-item">
                        <span class="stat-label">作品名称:</span>
                        <span class="stat-value">${workTitle}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">累计收入:</span>
                        <span class="stat-value positive">¥${this.formatNumber(work.amount)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">收入占比:</span>
                        <span class="stat-value">${work.percentage}%</span>
                    </div>
                </div>
                <div class="detail-actions">
                    <button class="btn btn-primary" onclick="incomeCenter.closeIncomeDetailModal()">关闭</button>
                    <button class="btn btn-secondary" onclick="router.navigateTo('works-management.html')">管理作品</button>
                </div>
            </div>
        `;

        document.getElementById('incomeDetailModal').classList.add('show');
    },

    /**
     * 显示类型详情
     */
    showTypeDetail: function(type) {
        const percentage = this.incomeData.types[type];

        document.getElementById('incomeDetailContent').innerHTML = `
            <div class="detail-content">
                <h4>${type} 收入详情</h4>
                <div class="detail-stats">
                    <div class="stat-item">
                        <span class="stat-label">收入类型:</span>
                        <span class="stat-value">${type}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">占比:</span>
                        <span class="stat-value">${percentage}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">估算月收入:</span>
                        <span class="stat-value positive">
                            ¥${(this.incomeData.overview.monthlyIncome * percentage / 100).toFixed(2)}
                        </span>
                    </div>
                </div>
                <div class="detail-actions">
                    <button class="btn btn-primary" onclick="incomeCenter.closeIncomeDetailModal()">关闭</button>
                </div>
            </div>
        `;

        document.getElementById('incomeDetailModal').classList.add('show');
    },

    /**
     * 显示收入记录详情
     */
    showIncomeRecordDetail: function(recordId) {
        const record = this.incomeData.records.find(r => r.id === recordId);

        document.getElementById('incomeDetailContent').innerHTML = `
            <div class="detail-content">
                <h4>收入记录详情</h4>
                <div class="detail-stats">
                    <div class="stat-item">
                        <span class="stat-label">时间:</span>
                        <span class="stat-value">${this.formatDateTime(record.time)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">作品:</span>
                        <span class="stat-value">${record.work}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">收入类型:</span>
                        <span class="stat-value">${record.typeName}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">金额:</span>
                        <span class="stat-value positive">¥${record.amount.toFixed(2)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">读者:</span>
                        <span class="stat-value">${record.reader}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">状态:</span>
                        <span class="stat-value">已完成</span>
                    </div>
                </div>
                <div class="detail-actions">
                    <button class="btn btn-primary" onclick="incomeCenter.closeIncomeDetailModal()">关闭</button>
                </div>
            </div>
        `;

        document.getElementById('incomeDetailModal').classList.add('show');
    },

    // ==================== 分页功能 ====================

    /**
     * 渲染收入记录分页
     */
    renderIncomeRecordsPagination: function(totalRecords) {
        const container = document.getElementById('incomeRecordsPagination');
        if (!container) return;

        const totalPages = Math.ceil(totalRecords / this.pagination.income.pageSize);
        this.renderPagination(container, 'income', totalPages);
    },

    /**
     * 渲染提现记录分页
     */
    renderWithdrawRecordsPagination: function() {
        const container = document.getElementById('withdrawRecordsPagination');
        if (!container) return;

        const totalPages = Math.ceil(this.pagination.withdraw.total / this.pagination.withdraw.pageSize);
        this.renderPagination(container, 'withdraw', totalPages);
    },

    /**
     * 渲染结算记录分页
     */
    renderSettlementRecordsPagination: function() {
        const container = document.getElementById('settlementRecordsPagination');
        if (!container) return;

        const totalPages = Math.ceil(this.pagination.settlement.total / this.pagination.settlement.pageSize);
        this.renderPagination(container, 'settlement', totalPages);
    },

    /**
     * 渲染分页组件
     */
    renderPagination: function(container, type, totalPages) {
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        const currentPage = this.pagination[type].currentPage;

        let html = `
            <button class="btn btn-secondary btn-sm" ${currentPage === 1 ? 'disabled' : ''} 
                onclick="incomeCenter.goToPage('${type}', ${currentPage - 1})">
                <i class="fas fa-chevron-left"></i> 上一页
            </button>
            <div class="page-numbers">
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                html += `<span class="page-number active">${i}</span>`;
            } else {
                html += `<span class="page-number" onclick="incomeCenter.goToPage('${type}', ${i})">${i}</span>`;
            }
        }

        html += `
            </div>
            <button class="btn btn-secondary btn-sm" ${currentPage === totalPages ? 'disabled' : ''} 
                onclick="incomeCenter.goToPage('${type}', ${currentPage + 1})">
                下一页 <i class="fas fa-chevron-right"></i>
            </button>
        `;

        container.innerHTML = html;
    },

    /**
     * 跳转到指定页面
     */
    goToPage: function(type, page) {
        this.pagination[type].currentPage = page;

        if (type === 'income') {
            this.renderIncomeRecords();
        } else if (type === 'withdraw') {
            this.renderWithdrawRecords();
        } else if (type === 'settlement') {
            this.renderSettlementRecords();
        }
    },

    // ==================== 更新统计信息 ====================

    /**
     * 更新提现统计信息
     */
    updateWithdrawSummary: function() {
        const withdrawRecords = this.incomeData.withdrawRecords;
        const totalWithdraw = withdrawRecords.reduce((sum, record) => sum + record.amount, 0);
        const monthlyWithdraw = withdrawRecords
            .filter(record => new Date(record.time) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
            .reduce((sum, record) => sum + record.amount, 0);

        document.getElementById('totalWithdraw').textContent = '¥' + totalWithdraw.toFixed(2);
        document.getElementById('monthlyWithdraw').textContent = '¥' + monthlyWithdraw.toFixed(2);
        document.getElementById('withdrawCount').textContent = withdrawRecords.length + '次';
    },

    // ==================== 模态框关闭方法 ====================

    closeWithdrawModal: function() {
        document.getElementById('withdrawModal').classList.remove('show');
    },

    closeIncomeDetailModal: function() {
        document.getElementById('incomeDetailModal').classList.remove('show');
    },

    // ==================== 工具方法 ====================

    /**
     * 获取收入类型图标
     */
    getIncomeTypeIcon: function(type) {
        const iconMap = {
            'chapter': 'fa-book',
            'tip': 'fa-gift',
            'vip': 'fa-crown',
            'ad': 'fa-ad',
            'bonus': 'fa-award'
        };
        return iconMap[type] || 'fa-coins';
    },

    /**
     * 获取来源描述
     */
    getSourceDescription: function(source) {
        const descriptions = {
            '章节订阅': '读者购买阅读权限产生的收入，是主要的收入来源。',
            '读者打赏': '读者自愿给予的额外奖励，体现读者对作品的喜爱。',
            'VIP分成': 'VIP会员阅读产生的平台分成收入。',
            '广告收入': '在作品页面展示广告产生的分成收入。',
            '活动奖励': '参与平台活动获得的奖金和奖励。'
        };
        return descriptions[source] || '暂无描述';
    },

    /**
     * 获取空记录HTML
     */
    getEmptyRecordsHTML: function(type) {
        const messages = {
            'income': '暂无收入记录',
            'withdraw': '暂无提现记录',
            'settlement': '暂无结算记录'
        };

        return `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <i class="fas fa-coins"></i>
                        </div>
                        <div class="empty-state-title">${messages[type]}</div>
                        <div class="empty-state-description">
                            ${type === 'income' ? '当有读者订阅或打赏时，收入记录会显示在这里' : 
                              type === 'withdraw' ? '当您申请提现时，提现记录会显示在这里' :
                              '平台会在结算周期结束后生成结算记录'}
                        </div>
                    </div>
                </td>
            </tr>
        `;
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
        return num.toFixed(2);
    },

    /**
     * 格式化日期
     */
    formatDate: function(dateString) {
        const date = new Date(dateString);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${month}-${day}`;
    },

    /**
     * 格式化日期时间
     */
    formatDateTime: function(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }
};

// ==================== 页面初始化 ====================

/**
 * 初始化收入中心页面
 */
function initIncomeCenter() {
    console.log('🚀 初始化收入中心页面...');

    // 检查用户权限
    if (!checkAuthorAccess()) {
        return;
    }

    // 初始化收入中心模块
    incomeCenter.init();

    // 检查页面访问权限
    checkPageAccess();

    console.log('✅ 收入中心页面初始化完成');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initIncomeCenter();
});

// 全局暴露
window.incomeCenter = incomeCenter;