/**
 * FlutterPage - 数据分析脚本
 * 负责数据可视化、图表渲染和数据分析功能
 */

// 数据分析模块
const dataAnalysis = {
    // 当前选中的作品ID
    currentWorkId: 'all',

    // 当前时间范围
    currentTimeRange: '30',

    // 图表数据
    chartData: {
        trend: {},
        gender: {},
        age: {},
        time: {},
        regions: {},
        chapters: {},
        retention: {},
        comparison: {}
    },

    // 数据洞察
    insights: [],

    /**
     * 初始化数据分析模块
     */
    init: function() {
        this.loadWorks();
        this.loadData();
        this.setupEventListeners();

        console.log('数据分析模块初始化完成');
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
     * 加载数据
     */
    loadData: function() {
        this.showLoadingState();

        // 模拟API调用 - 实际项目中从后端获取
        setTimeout(() => {
            this.generateMockData();
            this.renderOverviewCards();
            this.renderCharts();
            this.renderInsights();
            this.renderComparison();

            utils.showNotification('数据加载完成');
        }, 1500);
    },

    /**
     * 生成模拟数据
     */
    generateMockData: function() {
        // 趋势数据
        this.chartData.trend = this.generateTrendData();

        // 读者分布数据
        this.chartData.gender = this.generateGenderData();
        this.chartData.age = this.generateAgeData();
        this.chartData.time = this.generateTimeData();
        this.chartData.regions = this.generateRegionData();

        // 章节表现数据
        this.chartData.chapters = this.generateChapterData();

        // 留存率数据
        this.chartData.retention = this.generateRetentionData();

        // 对比数据
        this.chartData.comparison = this.generateComparisonData();

        // 数据洞察
        this.insights = this.generateInsights();
    },

    /**
     * 生成趋势数据
     */
    generateTrendData: function() {
        const days = this.getDaysInRange();
        const data = {
            labels: days,
            datasets: {
                views: [],
                collections: [],
                comments: []
            }
        };

        let baseViews = 1000;
        let baseCollections = 50;
        let baseComments = 20;

        days.forEach((day, index) => {
            // 模拟波动
            const views = baseViews + Math.random() * 500 - 250 + (index * 20);
            const collections = baseCollections + Math.random() * 10 - 5 + (index * 2);
            const comments = baseComments + Math.random() * 8 - 4 + (index * 1);

            data.datasets.views.push(Math.round(views));
            data.datasets.collections.push(Math.round(collections));
            data.datasets.comments.push(Math.round(comments));
        });

        return data;
    },

    /**
     * 生成性别分布数据
     */
    generateGenderData: function() {
        return {
            male: 45,
            female: 52,
            unknown: 3
        };
    },

    /**
     * 生成年龄分布数据
     */
    generateAgeData: function() {
        return {
            '18岁以下': 15,
            '18-24岁': 35,
            '25-34岁': 28,
            '35-44岁': 15,
            '45岁以上': 7
        };
    },

    /**
     * 生成时段分布数据
     */
    generateTimeData: function() {
        const hours = Array.from({length: 24}, (_, i) => i);
        const data = {};

        hours.forEach(hour => {
            // 模拟阅读高峰在晚上
            let value = 100;
            if (hour >= 8 && hour <= 12) value = 200;  // 上午
            if (hour >= 12 && hour <= 14) value = 150; // 中午
            if (hour >= 19 && hour <= 23) value = 300; // 晚上
            if (hour >= 0 && hour <= 6) value = 50;    // 深夜

            // 添加随机波动
            value += Math.random() * 100 - 50;

            data[hour] = Math.max(0, Math.round(value));
        });

        return data;
    },

    /**
     * 生成地域分布数据
     */
    generateRegionData: function() {
        return [
            { region: '北京', percentage: 12.5, users: 12500 },
            { region: '上海', percentage: 10.2, users: 10200 },
            { region: '广东', percentage: 9.8, users: 9800 },
            { region: '江苏', percentage: 8.5, users: 8500 },
            { region: '浙江', percentage: 7.9, users: 7900 },
            { region: '四川', percentage: 6.3, users: 6300 },
            { region: '湖北', percentage: 5.7, users: 5700 },
            { region: '其他', percentage: 39.1, users: 39100 }
        ];
    },

    /**
     * 生成章节表现数据
     */
    generateChapterData: function() {
        const chapters = [];
        for (let i = 1; i <= 10; i++) {
            chapters.push({
                id: i,
                title: `第${this.numberToChinese(i)}章 精彩内容`,
                views: Math.round(10000 / i + Math.random() * 2000),
                comments: Math.round(100 / i + Math.random() * 50),
                collections: Math.round(500 / i + Math.random() * 100),
                completion: Math.round(85 - i * 2 + Math.random() * 10)
            });
        }
        return chapters;
    },

    /**
     * 生成留存率数据
     */
    generateRetentionData: function() {
        return {
            '次日留存': 45,
            '3日留存': 32,
            '7日留存': 25,
            '15日留存': 18,
            '30日留存': 12
        };
    },

    /**
     * 生成对比数据
     */
    generateComparisonData: function() {
        return {
            '星穹传说': { views: 2458000, collections: 125000, comments: 45600, income: 12345 },
            '灵域迷踪': { views: 2135000, collections: 108000, comments: 38900, income: 9876 },
            '剑影仙途': { views: 1987000, collections: 93000, comments: 51200, income: 15432 }
        };
    },

    /**
     * 生成数据洞察
     */
    generateInsights: function() {
        return [
            {
                icon: 'fas fa-bolt',
                title: '阅读高峰时段',
                content: '您的读者最活跃的时间是晚上8-10点，建议在这个时段发布新章节以获得更多曝光。',
                metric: '晚上8-10点',
                change: '+15%',
                changeType: 'positive'
            },
            {
                icon: 'fas fa-users',
                title: '读者增长趋势',
                content: '过去30天新增读者数量增长显著，主要来自25-34岁年龄段的女性读者。',
                metric: '2,458人',
                change: '+12%',
                changeType: 'positive'
            },
            {
                icon: 'fas fa-book-open',
                title: '章节完成率',
                content: '读者平均阅读完成率为78%，前3章流失率较高，建议优化开头内容。',
                metric: '78%',
                change: '-3%',
                changeType: 'negative'
            },
            {
                icon: 'fas fa-share-alt',
                title: '社交分享',
                content: '您的作品在社交媒体上被分享次数增加了25%，第5章是最受欢迎的分享章节。',
                metric: '1,234次',
                change: '+25%',
                changeType: 'positive'
            }
        ];
    },

    /**
     * 设置事件监听器
     */
    setupEventListeners: function() {
        // 图表指标切换
        document.querySelectorAll('.chart-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const metric = e.target.dataset.metric;
                this.switchTrendMetric(metric);

                // 更新按钮状态
                document.querySelectorAll('.chart-action-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // 时间范围选择
        const timeRangeSelect = document.getElementById('timeRange');
        timeRangeSelect.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                document.getElementById('customTimeRange').style.display = 'block';
            } else {
                document.getElementById('customTimeRange').style.display = 'none';
                this.currentTimeRange = e.target.value;
                this.refreshData();
            }
        });
    },

    /**
     * 显示加载状态
     */
    showLoadingState: function() {
        const containers = [
            'trendChart', 'genderChart', 'ageChart', 'timeChart',
            'regionList', 'chapterPerformance', 'retentionChart', 'comparisonChart'
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
    },

    /**
     * 渲染概览卡片
     */
    renderOverviewCards: function() {
        const totalViews = this.chartData.trend.datasets.views.reduce((a, b) => a + b, 0);
        const totalCollections = this.chartData.trend.datasets.collections.reduce((a, b) => a + b, 0);
        const totalComments = this.chartData.trend.datasets.comments.reduce((a, b) => a + b, 0);

        document.getElementById('totalViews').textContent = this.formatNumber(totalViews);
        document.getElementById('totalCollections').textContent = this.formatNumber(totalCollections);
        document.getElementById('totalComments').textContent = this.formatNumber(totalComments);
        document.getElementById('totalIncome').textContent = '¥' + this.formatNumber(12345);

        // 更新趋势
        this.updateTrendIndicators();
    },

    /**
     * 更新趋势指标
     */
    updateTrendIndicators: function() {
        const trends = [
            { id: 'viewsTrend', value: '+12%' },
            { id: 'collectionsTrend', value: '+8%' },
            { id: 'commentsTrend', value: '+15%' },
            { id: 'incomeTrend', value: '+20%' }
        ];

        trends.forEach(trend => {
            const element = document.getElementById(trend.id);
            if (element) {
                element.innerHTML = `<i class="fas fa-arrow-up"></i> <span>${trend.value}</span> 较上月`;
                element.className = 'trend positive';
            }
        });
    },

    /**
     * 渲染所有图表
     */
    renderCharts: function() {
        this.renderTrendChart();
        this.renderGenderChart();
        this.renderAgeChart();
        this.renderTimeChart();
        this.renderRegionChart();
        this.renderChapterPerformance();
        this.renderRetentionChart();
    },

    /**
     * 渲染趋势图表
     */
    renderTrendChart: function() {
        const container = document.getElementById('trendChart');
        if (!container) return;

        const data = this.chartData.trend;
        const maxValue = Math.max(...data.datasets.views);

        let html = `
            <div class="chart-grid">
                ${Array.from({length: 50}, (_, i) => `<div class="grid-line"></div>`).join('')}
            </div>
            <div class="x-axis">
                ${data.labels.map(label => `<span>${label}</span>`).join('')}
            </div>
            <div class="y-axis">
                ${[maxValue, maxValue * 0.75, maxValue * 0.5, maxValue * 0.25, 0].map(value => 
                    `<span>${this.formatNumber(value)}</span>`
                ).join('')}
            </div>
            <svg class="data-line" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="${this.generateLinePath(data.datasets.views, maxValue)}" />
                ${data.datasets.views.map((value, index) => `
                    <circle class="data-point" cx="${(index / (data.labels.length - 1)) * 100}" 
                            cy="${100 - (value / maxValue) * 100}" r="2"
                            onclick="dataAnalysis.showDataDetail('views', ${index})" />
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
     * 渲染性别分布图表
     */
    renderGenderChart: function() {
        const container = document.getElementById('genderChart');
        if (!container) return;

        const data = this.chartData.gender;
        const total = Object.values(data).reduce((sum, value) => sum + value, 0);
        const colors = ['#6A85B6', '#FF6B8B', '#BAC8E0'];

        let startAngle = 0;
        let html = '';
        let legendHtml = '';

        Object.entries(data).forEach(([key, value], index) => {
            const percentage = (value / total) * 100;
            const angle = (percentage / 100) * 360;
            const color = colors[index];

            html += `
                <div class="pie-slice" 
                     style="background: conic-gradient(${color} 0deg ${angle}deg, transparent ${angle}deg 360deg);
                            transform: rotate(${startAngle}deg);"
                     onclick="dataAnalysis.showDataDetail('gender', '${key}')">
                </div>
            `;

            legendHtml += `
                <div class="legend-item">
                    <div class="legend-color" style="background: ${color};"></div>
                    <span class="legend-label">${this.getGenderText(key)}</span>
                    <span class="legend-value">${percentage.toFixed(1)}%</span>
                </div>
            `;

            startAngle += angle;
        });

        html += `<div class="pie-legend">${legendHtml}</div>`;
        container.innerHTML = html;
    },

    /**
     * 渲染年龄分布图表
     */
    renderAgeChart: function() {
        const container = document.getElementById('ageChart');
        if (!container) return;

        const data = this.chartData.age;
        const maxValue = Math.max(...Object.values(data));

        let html = `
            <div class="bar-container">
                ${Object.entries(data).map(([age, value]) => `
                    <div class="bar-item">
                        <div class="bar" style="height: ${(value / maxValue) * 100}%;"
                             onclick="dataAnalysis.showDataDetail('age', '${age}')">
                            <span class="bar-value">${this.formatNumber(value)}</span>
                        </div>
                        <div class="bar-label">${age}</div>
                    </div>
                `).join('')}
            </div>
        `;

        container.innerHTML = html;
    },

    /**
     * 渲染时段分布图表
     */
    renderTimeChart: function() {
        const container = document.getElementById('timeChart');
        if (!container) return;

        const data = this.chartData.time;
        const maxValue = Math.max(...Object.values(data));

        let html = `
            <div class="bar-container">
                ${Object.entries(data).map(([hour, value]) => `
                    <div class="bar-item">
                        <div class="bar" style="height: ${(value / maxValue) * 100}%;"
                             onclick="dataAnalysis.showDataDetail('time', ${hour})">
                            <span class="bar-value">${this.formatNumber(value)}</span>
                        </div>
                        <div class="bar-label">${hour}时</div>
                    </div>
                `).join('')}
            </div>
        `;

        container.innerHTML = html;
    },

    /**
     * 渲染地域分布图表
     */
    renderRegionChart: function() {
        const container = document.getElementById('regionList');
        if (!container) return;

        const data = this.chartData.regions;

        let html = data.map(region => `
            <div class="region-item" onclick="dataAnalysis.showDataDetail('region', '${region.region}')">
                <span class="region-name">${region.region}</span>
                <div class="region-stats">
                    <span class="region-percentage">${region.percentage}%</span>
                    <span>${this.formatNumber(region.users)}人</span>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    },

    /**
     * 渲染章节表现表格
     */
    renderChapterPerformance: function() {
        const container = document.getElementById('chapterPerformance');
        if (!container) return;

        const data = this.chartData.chapters;

        let html = `
            <table class="performance-table">
                <thead>
                    <tr>
                        <th>章节</th>
                        <th>阅读量</th>
                        <th>评论数</th>
                        <th>收藏数</th>
                        <th>完成率</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(chapter => `
                        <tr onclick="dataAnalysis.showChapterDetail(${chapter.id})">
                            <td class="chapter-title">${chapter.title}</td>
                            <td>${this.formatNumber(chapter.views)}</td>
                            <td>${this.formatNumber(chapter.comments)}</td>
                            <td>${this.formatNumber(chapter.collections)}</td>
                            <td class="${chapter.completion > 80 ? 'positive' : 'negative'}">
                                ${chapter.completion}%
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = html;
    },

    /**
     * 渲染留存率图表
     */
    renderRetentionChart: function() {
        const container = document.getElementById('retentionChart');
        if (!container) return;

        const data = this.chartData.retention;
        const maxValue = Math.max(...Object.values(data));

        let html = `
            <div class="bar-container">
                ${Object.entries(data).map(([period, value]) => `
                    <div class="bar-item">
                        <div class="bar" style="height: ${(value / maxValue) * 100}%;"
                             onclick="dataAnalysis.showDataDetail('retention', '${period}')">
                            <span class="bar-value">${value}%</span>
                        </div>
                        <div class="bar-label">${period}</div>
                    </div>
                `).join('')}
            </div>
        `;

        container.innerHTML = html;
    },

    /**
     * 渲染数据洞察
     */
    renderInsights: function() {
        const container = document.getElementById('insightsGrid');
        if (!container) return;

        let html = this.insights.map(insight => `
            <div class="insight-card">
                <div class="insight-header">
                    <div class="insight-icon">
                        <i class="${insight.icon}"></i>
                    </div>
                    <h4 class="insight-title">${insight.title}</h4>
                </div>
                <div class="insight-content">${insight.content}</div>
                <div class="insight-metric">
                    <span class="metric-value">${insight.metric}</span>
                    <span class="metric-change ${insight.changeType}">
                        <i class="fas fa-arrow-${insight.changeType === 'positive' ? 'up' : 'down'}"></i>
                        ${insight.change}
                    </span>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    },

    /**
     * 渲染对比分析
     */
    renderComparison: function() {
        const container = document.getElementById('comparisonChart');
        if (!container) return;

        const data = this.chartData.comparison;
        const metric = document.getElementById('comparisonMetric').value;
        const maxValue = Math.max(...Object.values(data).map(item => item[metric]));

        let html = `
            <div class="comparison-bars">
                ${Object.entries(data).map(([work, metrics]) => `
                    <div class="comparison-bar" onclick="dataAnalysis.showWorkComparison('${work}')">
                        <div class="bar" style="height: ${(metrics[metric] / maxValue) * 100}%;"></div>
                        <div class="comparison-value">${this.formatNumber(metrics[metric])}</div>
                        <div class="comparison-label">${work}</div>
                    </div>
                `).join('')}
            </div>
        `;

        container.innerHTML = html;
    },

    // ==================== 交互功能 ====================

    /**
     * 选择作品
     */
    selectWork: function(workId) {
        this.currentWorkId = workId;

        const workInfo = document.getElementById('workInfo');
        if (workId === 'all') {
            workInfo.textContent = '- 整体数据';
        } else {
            const workSelect = document.getElementById('workSelect');
            const selectedOption = workSelect.options[workSelect.selectedIndex];
            workInfo.textContent = `- ${selectedOption.textContent}`;
        }

        this.refreshData();
    },

    /**
     * 切换时间范围
     */
    changeTimeRange: function(range) {
        this.currentTimeRange = range;
        this.refreshData();
    },

    /**
     * 应用自定义时间范围
     */
    applyCustomRange: function() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (!startDate || !endDate) {
            utils.showNotification('请选择完整的日期范围', false);
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            utils.showNotification('开始日期不能晚于结束日期', false);
            return;
        }

        this.currentTimeRange = 'custom';
        this.refreshData();

        utils.showNotification('已应用自定义时间范围');
    },

    /**
     * 切换趋势指标
     */
    switchTrendMetric: function(metric) {
        // 在实际项目中，这里会重新加载对应指标的数据
        // 这里只是模拟切换效果
        console.log('切换到指标:', metric);

        const data = this.chartData.trend;
        const maxValue = Math.max(...data.datasets[metric]);

        const svg = document.querySelector('#trendChart .data-line');
        if (svg) {
            const path = svg.querySelector('path');
            const points = svg.querySelectorAll('.data-point');

            if (path) {
                path.setAttribute('d', this.generateLinePath(data.datasets[metric], maxValue));
            }

            points.forEach((point, index) => {
                const x = (index / (data.labels.length - 1)) * 100;
                const y = 100 - (data.datasets[metric][index] / maxValue) * 100;
                point.setAttribute('cx', x);
                point.setAttribute('cy', y);
                point.setAttribute('onclick', `dataAnalysis.showDataDetail('${metric}', ${index})`);
            });
        }
    },

    /**
     * 刷新数据
     */
    refreshData: function() {
        utils.showNotification('正在更新数据...', true);
        this.loadData();
    },

    /**
     * 导出报告
     */
    exportReport: function() {
        utils.showNotification('正在生成数据报告...', true);

        // 模拟导出过程
        setTimeout(() => {
            utils.showNotification('数据报告导出成功！');

            // 在实际项目中，这里会触发文件下载
            // 模拟创建一个下载链接
            const link = document.createElement('a');
            link.href = '#'; // 实际应该是后端生成的报告文件URL
            link.download = `数据报告_${new Date().toISOString().split('T')[0]}.pdf`;
            link.click();
        }, 2000);
    },

    /**
     * 显示数据详情
     */
    showDataDetail: function(type, id) {
        let title = '';
        let content = '';

        switch (type) {
            case 'views':
                title = '阅读量详情';
                content = `第${id + 1}天的阅读量为 ${this.formatNumber(this.chartData.trend.datasets.views[id])}`;
                break;
            case 'gender':
                title = '性别分布详情';
                content = `${this.getGenderText(id)}读者占比 ${this.chartData.gender[id]}%`;
                break;
            case 'age':
                title = '年龄分布详情';
                content = `${id}读者占比 ${this.chartData.age[id]}%`;
                break;
            case 'time':
                title = '时段分布详情';
                content = `${id}时的阅读量为 ${this.formatNumber(this.chartData.time[id])}`;
                break;
            case 'region':
                const region = this.chartData.regions.find(r => r.region === id);
                title = '地域分布详情';
                content = `${id}地区读者占比 ${region.percentage}%，共 ${this.formatNumber(region.users)} 人`;
                break;
            case 'retention':
                title = '留存率详情';
                content = `${id}留存率为 ${this.chartData.retention[id]}%`;
                break;
        }

        document.getElementById('detailModalTitle').textContent = title;
        document.getElementById('detailModalContent').innerHTML = `
            <div class="detail-content">
                <p>${content}</p>
                <div class="detail-actions">
                    <button class="btn btn-primary" onclick="dataAnalysis.closeDetailModal()">关闭</button>
                </div>
            </div>
        `;

        document.getElementById('detailModal').classList.add('show');
    },

    /**
     * 显示章节详情
     */
    showChapterDetail: function(chapterId) {
        const chapter = this.chartData.chapters.find(c => c.id === chapterId);
        if (!chapter) return;

        document.getElementById('detailModalTitle').textContent = '章节表现详情';
        document.getElementById('detailModalContent').innerHTML = `
            <div class="detail-content">
                <h4>${chapter.title}</h4>
                <div class="chapter-stats">
                    <div class="stat-item">
                        <span class="stat-label">阅读量:</span>
                        <span class="stat-value">${this.formatNumber(chapter.views)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">评论数:</span>
                        <span class="stat-value">${this.formatNumber(chapter.comments)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">收藏数:</span>
                        <span class="stat-value">${this.formatNumber(chapter.collections)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">阅读完成率:</span>
                        <span class="stat-value ${chapter.completion > 80 ? 'positive' : 'negative'}">${chapter.completion}%</span>
                    </div>
                </div>
                <div class="detail-actions">
                    <button class="btn btn-primary" onclick="dataAnalysis.closeDetailModal()">关闭</button>
                    <button class="btn btn-secondary" onclick="router.navigateTo('chapter-management.html', {workId: ${this.currentWorkId}})">管理章节</button>
                </div>
            </div>
        `;

        document.getElementById('detailModal').classList.add('show');
    },

    /**
     * 显示作品对比
     */
    showWorkComparison: function(workName) {
        const data = this.chartData.comparison[workName];

        document.getElementById('detailModalTitle').textContent = `${workName} - 数据对比`;
        document.getElementById('detailModalContent').innerHTML = `
            <div class="detail-content">
                <h4>${workName}</h4>
                <div class="comparison-stats">
                    <div class="stat-item">
                        <span class="stat-label">总阅读量:</span>
                        <span class="stat-value">${this.formatNumber(data.views)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">总收藏数:</span>
                        <span class="stat-value">${this.formatNumber(data.collections)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">总评论数:</span>
                        <span class="stat-value">${this.formatNumber(data.comments)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">总收入:</span>
                        <span class="stat-value">¥${this.formatNumber(data.income)}</span>
                    </div>
                </div>
                <div class="detail-actions">
                    <button class="btn btn-primary" onclick="dataAnalysis.closeDetailModal()">关闭</button>
                </div>
            </div>
        `;

        document.getElementById('detailModal').classList.add('show');
    },

    /**
     * 更新对比分析
     */
    updateComparison: function() {
        this.renderComparison();
    },

    /**
     * 关闭详情模态框
     */
    closeDetailModal: function() {
        document.getElementById('detailModal').classList.remove('show');
    },

    // ==================== 工具方法 ====================

    /**
     * 获取时间范围内的天数
     */
    getDaysInRange: function() {
        const days = parseInt(this.currentTimeRange);
        const labels = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(this.formatDate(date));
        }

        return labels;
    },

    /**
     * 获取性别文本
     */
    getGenderText: function(gender) {
        const genderMap = {
            'male': '男性',
            'female': '女性',
            'unknown': '未知'
        };
        return genderMap[gender] || gender;
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
    formatDate: function(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${month}-${day}`;
    }
};

// ==================== 页面初始化 ====================

/**
 * 初始化数据分析页面
 */
function initDataAnalysis() {
    console.log('🚀 初始化数据分析页面...');

    // 检查用户权限
    if (!checkAuthorAccess()) {
        return;
    }

    // 初始化数据分析模块
    dataAnalysis.init();

    // 检查页面访问权限
    checkPageAccess();

    console.log('✅ 数据分析页面初始化完成');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initDataAnalysis();
});

// 全局暴露
window.dataAnalysis = dataAnalysis;