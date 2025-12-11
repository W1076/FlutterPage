// writing-settings.js

/**
 * FlutterPage - 写作设置管理模块
 * 负责作者写作设置的保存、加载和管理
 */

const writingSettings = {
    // 当前设置数据
    currentSettings: {},

    /**
     * 初始化写作设置
     */
    init: function() {
        this.loadSettings();
        this.setupEventListeners();
        this.updateUIFromSettings();
        console.log('写作设置模块初始化完成');
    },

    /**
     * 设置事件监听器
     */
    setupEventListeners: function() {
        // 导航点击事件
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchPanel(e.currentTarget.dataset.target);
            });
        });

        // 编辑器宽度滑块
        const widthSlider = document.getElementById('editorWidth');
        if (widthSlider) {
            widthSlider.addEventListener('input', (e) => {
                document.getElementById('editorWidthValue').textContent = e.target.value + 'px';
            });
        }

        // 表单变化时自动保存（可选）
        document.querySelectorAll('#editor-settings input, #editor-settings select').forEach(element => {
            element.addEventListener('change', () => {
                this.saveSettings();
            });
        });
    },

    /**
     * 切换设置面板
     * @param {string} panelId - 面板ID
     */
    switchPanel: function(panelId) {
        // 移除所有活动状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelectorAll('.settings-panel').forEach(panel => {
            panel.classList.remove('active');
        });

        // 添加活动状态
        document.querySelector(`.nav-item[data-target="${panelId}"]`).classList.add('active');
        document.getElementById(panelId).classList.add('active');
    },

    /**
     * 从本地存储加载设置
     */
    loadSettings: function() {
        try {
            const storedSettings = localStorage.getItem('writingSettings');
            if (storedSettings) {
                this.currentSettings = JSON.parse(storedSettings);
            } else {
                this.loadDefaultSettings();
            }
        } catch (error) {
            console.error('加载写作设置失败:', error);
            this.loadDefaultSettings();
        }
    },

    /**
     * 加载默认设置
     */
    loadDefaultSettings: function() {
        this.currentSettings = {
            // 编辑器设置
            editorTheme: 'light',
            editorFontSize: '16',
            editorFontFamily: 'system',
            editorLineHeight: '1.5',
            editorWidth: 800,
            editorSpellCheck: true,
            editorWordCount: true,
            editorFullScreen: true,

            // 自动保存设置
            autoSaveEnabled: true,
            autoSaveInterval: '60',
            autoSaveBeforeExit: true,
            autoSaveDrafts: true,
            draftRetention: '30',

            // 写作习惯
            dailyWordGoal: 3000,
            reminderHour: '9',
            reminderEnabled: false,
            focusMode: true,
            typewriterMode: false,
            statsWords: true,
            statsTime: true,
            statsSpeed: false,

            // 发布设置
            defaultPublishStatus: 'published',
            publishConfirmation: true,
            autoChapterNumbering: true,
            allowComments: true,
            allowVoting: true,
            postPublishAction: 'next',

            // 章节默认值
            defaultChapterTitle: '第{number}章 {title}',
            defaultChapterPrice: 0,
            defaultChapterLength: 3000,
            defaultVipOnly: false,
            defaultAllowShare: true,

            // 内容过滤
            contentFilterEnabled: true,
            sensitiveWordLevel: 'medium',
            customSensitiveWords: '',
            autoReplaceSensitiveWords: true,
            contentReviewBeforePublish: false,

            // 备份设置
            autoBackupEnabled: true,
            backupFrequency: 'weekly',
            backupRetention: '10',
            backupOnPublish: true,
            backupFormatTxt: true,
            backupFormatDoc: false,
            backupFormatPdf: false,

            // 高级设置
            enableExperimentalFeatures: false,
            enableKeyboardShortcuts: true,
            enableMarkdownSupport: false,
            enableRichTextEditor: true,
            editorPerformanceMode: 'auto',
            maxUndoSteps: '100',

            // 隐私设置
            showOnlineStatus: true,
            showWritingProgress: false,
            allowPrivateMessages: true,
            allowFanFollowing: true,
            collectUsageData: true,
            personalizedRecommendations: false
        };
    },

    /**
     * 更新UI以反映当前设置
     */
    updateUIFromSettings: function() {
        // 遍历所有设置并更新UI元素
        for (const [key, value] of Object.entries(this.currentSettings)) {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else if (element.type === 'range') {
                    element.value = value;
                    // 更新显示值
                    const valueElement = document.getElementById(key + 'Value');
                    if (valueElement) {
                        valueElement.textContent = value + (key === 'editorWidth' ? 'px' : '');
                    }
                } else {
                    element.value = value;
                }
            }
        }
    },

    /**
     * 从UI收集设置
     */
    collectSettingsFromUI: function() {
        const settings = {};

        // 收集所有表单元素的值
        document.querySelectorAll('.settings-panel input, .settings-panel select, .settings-panel textarea').forEach(element => {
            const id = element.id;
            if (id) {
                if (element.type === 'checkbox') {
                    settings[id] = element.checked;
                } else if (element.type === 'number') {
                    settings[id] = parseInt(element.value) || 0;
                } else if (element.type === 'range') {
                    settings[id] = parseInt(element.value) || 0;
                } else {
                    settings[id] = element.value;
                }
            }
        });

        return settings;
    },

    /**
     * 保存设置
     */
    saveSettings: function() {
        try {
            this.currentSettings = this.collectSettingsFromUI();
            localStorage.setItem('writingSettings', JSON.stringify(this.currentSettings));
            utils.showNotification('设置已保存', true);
            console.log('写作设置已保存:', this.currentSettings);

            // 发送到后端API（未来实现）
            // this.saveToBackend();

            return true;
        } catch (error) {
            console.error('保存写作设置失败:', error);
            utils.showNotification('保存设置失败，请重试', false);
            return false;
        }
    },

    /**
     * 保存设置到后端（预留接口）
     */
    saveToBackend: async function() {
        try {
            // 这里将调用Flask后端API保存设置
            // const response = await apiManager.request('/api/author/settings', 'POST', this.currentSettings);
            // return response.success;

            // 暂时模拟成功
            return true;
        } catch (error) {
            console.error('保存设置到后端失败:', error);
            return false;
        }
    },

    /**
     * 恢复默认设置
     */
    resetToDefault: function() {
        if (confirm('确定要恢复默认设置吗？这将重置所有自定义设置。')) {
            this.loadDefaultSettings();
            this.updateUIFromSettings();
            this.saveSettings();
            utils.showNotification('已恢复默认设置', true);
        }
    },

    /**
     * 手动备份
     */
    manualBackup: function() {
        utils.showNotification('开始备份作品数据...', true);

        // 模拟备份过程
        setTimeout(() => {
            utils.showNotification('备份完成！', true);
        }, 2000);
    },

    /**
     * 恢复备份
     */
    restoreBackup: function() {
        // 在实际应用中，这里会打开文件选择器选择备份文件
        utils.showNotification('恢复备份功能将在后续版本中提供', false);
    },

    /**
     * 导出个人数据
     */
    exportData: function() {
        utils.showNotification('正在生成数据导出文件...', true);

        // 模拟导出过程
        setTimeout(() => {
            // 创建数据导出
            const data = {
                settings: this.currentSettings,
                exportTime: new Date().toISOString(),
                version: '1.0.0'
            };

            // 创建下载链接
            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `flutterpage_settings_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            utils.showNotification('数据导出完成！', true);
        }, 1500);
    },

    /**
     * 删除账户
     */
    deleteAccount: function() {
        if (confirm('确定要删除账户吗？此操作不可撤销，所有数据将被永久删除！')) {
            utils.showNotification('账户删除请求已提交，我们的客服将在24小时内联系您确认', true);

            // 在实际应用中，这里会调用后端API提交删除请求
            // apiManager.request('/api/user/delete', 'POST');
        }
    }
};

// 页面初始化函数
function initPage() {
    writingSettings.init();

    // 更新用户信息
    const user = userManager.getCurrentUser();
    if (user) {
        document.getElementById('authorName').textContent = user.username;
        document.getElementById('authorAvatar').textContent = user.username.charAt(0);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initPage();
});