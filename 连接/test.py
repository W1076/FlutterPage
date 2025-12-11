"""
FlutterPage - 纯连接版Flask后端
完整正确的版本，所有路由都正确配置
"""

from flask import Flask, render_template, send_from_directory, jsonify, request
import os

# 初始化Flask应用
app = Flask(__name__)

# ==================== 配置静态文件路径 ====================
# 告诉Flask静态文件在哪里
app.static_folder = 'static'
app.static_url_path = '/static'


# ==================== 页面路由 ====================
@app.route('/')
def index():
    """网站首页 -> 重定向到登录页"""
    return render_template('index.html')


@app.route('/login')
def login_page():
    """登录页面"""
    return render_template('index.html')


@app.route('/home')
def home_page():
    """主页"""
    return render_template('home.html')


# ==================== 静态文件路由 ====================
# Flask会自动处理/static/路径，这里也手动定义确保正确
@app.route('/static/<path:filename>')
def serve_static(filename):
    """提供静态文件访问"""
    return send_from_directory(app.static_folder, filename)


# 特别处理CSS和JS文件的多种可能路径
@app.route('/css/<path:filename>')
def serve_css(filename):
    """处理/css/路径请求"""
    try:
        return send_from_directory('static/css', filename)
    except:
        return "CSS文件未找到", 404


@app.route('/js/<path:filename>')
def serve_js(filename):
    """处理/js/路径请求"""
    try:
        return send_from_directory('static/js', filename)
    except:
        return "JS文件未找到", 404


# ==================== API接口路由 ====================
@app.route('/api/login', methods=['POST'])
def api_login():
    """登录接口"""
    data = request.get_json()
    print(f"收到登录请求: {data}")

    # 返回前端期望的格式
    return jsonify({
        'success': True,
        'message': '登录成功',
        'user': {
            'user_id': 1,
            'username': data.get('identifier', '测试用户'),
            'email': f"{data.get('identifier', 'test')}@example.com",
            'role': data.get('role', 'reader'),
            'token': 'mock_token_123456'
        },
        'role': data.get('role', 'reader')
    })


@app.route('/api/register', methods=['POST'])
def api_register():
    """注册接口"""
    data = request.get_json()
    print(f"收到注册请求: {data}")

    return jsonify({
        'success': True,
        'message': '注册成功'
    })


@app.route('/api/register/author', methods=['POST'])
def api_register_author():
    """作者注册接口"""
    data = request.get_json()
    print(f"收到作者注册请求: {data}")

    return jsonify({
        'success': True,
        'message': '作者注册成功',
        'authorId': 'AUTH001'
    })


@app.route('/api/logout', methods=['POST'])
def api_logout():
    """登出接口"""
    return jsonify({
        'success': True,
        'message': '登出成功'
    })


@app.route('/api/current_user', methods=['GET'])
def api_current_user():
    """获取当前用户接口"""
    return jsonify({
        'success': False,
        'message': '用户未登录'
    })


@app.route('/api/books', methods=['GET'])
def api_books():
    """获取书籍列表"""
    # 模拟书籍数据
    mock_books = [
        {
            'id': 1,
            'title': '星穹传说',
            'author': '云梦泽',
            'views': '245.8万',
            'rating': 8.9,
            'wordCount': 320,
            'chapterCount': 1205,
            'description': '在浩瀚的星穹之中，少年意外获得神秘传承...',
            'tags': ['玄幻', '星际', '修炼'],
            'cover': '📚',
            'status': '连载中',
            'updateTime': '2023-10-15'
        },
        {
            'id': 2,
            'title': '灵域迷踪',
            'author': '幻雨',
            'views': '213.5万',
            'rating': 9.2,
            'wordCount': 280,
            'chapterCount': 985,
            'description': '灵气复苏时代，平凡少年觉醒特殊能力...',
            'tags': ['都市', '异能', '悬疑'],
            'cover': '🔮',
            'status': '连载中',
            'updateTime': '2023-10-14'
        }
    ]

    return jsonify({
        'success': True,
        'data': mock_books,
        'pagination': {
            'page': 1,
            'total': 2,
            'hasMore': False
        }
    })


@app.route('/api/books/search', methods=['GET'])
def api_search_books():
    """搜索书籍"""
    query = request.args.get('q', '')

    # 简单搜索逻辑
    mock_books = [
        {
            'id': 1,
            'title': '星穹传说',
            'author': '云梦泽',
            'views': '245.8万',
            'rating': 8.9,
            'tags': ['玄幻', '星际'],
            'cover': '📚'
        }
    ]

    if query:
        mock_books[0]['title'] = f"搜索结果: {query}"

    return jsonify({
        'success': True,
        'data': mock_books if query else [],
        'total': len(mock_books) if query else 0
    })


@app.route('/api/books/<int:book_id>', methods=['GET'])
def api_book_detail(book_id):
    """书籍详情"""
    return jsonify({
        'success': True,
        'data': {
            'id': book_id,
            'title': f'书籍{book_id}详情',
            'author': f'作者{book_id}',
            'views': '100万',
            'rating': 8.5,
            'description': '这是一个测试书籍的描述',
            'chapters': [
                {'id': 1, 'title': '第1章', 'date': '2023-01-01'},
                {'id': 2, 'title': '第2章', 'date': '2023-01-02'}
            ]
        }
    })


@app.route('/api/health', methods=['GET'])
def api_health():
    """健康检查接口"""
    return jsonify({
        'status': 'healthy',
        'message': '服务器运行正常',
        'timestamp': '2023-12-04T00:00:00Z'
    })


# ==================== 处理HTML文件直接访问 ====================
@app.route('/<filename>.html')
def serve_html(filename):
    """处理.html文件的直接访问"""
    try:
        return render_template(f'{filename}.html')
    except:
        return f"页面 {filename}.html 未找到", 404


# ==================== 错误处理 ====================
@app.errorhandler(404)
def page_not_found(e):
    """404页面未找到"""
    return render_template('index.html')


# ==================== 启动应用 ====================
if __name__ == '__main__':
    print("=" * 50)
    print("🚀 FlutterPage 服务器启动")
    print("📁 静态文件目录:", app.static_folder)
    print("📁 模板目录:", app.template_folder)
    print("🌐 访问地址: http://localhost:5000")
    print("🔗 登录页面: http://localhost:5000/")
    print("🔗 主页: http://localhost:5000/home")
    print("🔗 健康检查: http://localhost:5000/api/health")
    print("=" * 50)

    # 运行服务器
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000
    )