"""
FlutterPage - 纯连接版Flask后端
功能：只负责连接前端文件，不修改任何前端代码
"""

from flask import Flask, render_template, send_from_directory, jsonify
import os

# 初始化Flask应用
app = Flask(__name__)

# ==================== 配置静态文件路径 ====================
# 设置静态文件夹路径（与前端代码保持一致）
app.static_folder = 'static'
app.tatic_url_path = '/static'


# ==================== 页面路由（原样提供HTML文件） ====================
@app.route('/')
def index():
    """网站根目录 - 重定向到登录页"""
    return render_template('index.html')


@app.route('/index.html')
def index_html():
    """登录页面（原样提供）"""
    return render_template('index.html')


@app.route('/home.html')
def home_html():
    """主页（原样提供）"""
    return render_template('home.html')


# ==================== API接口（模拟前端期望的响应） ====================
@app.route('/api/login', methods=['POST'])
def api_login():
    """
    模拟登录接口
    响应格式完全按照前端JavaScript的期望
    """
    import json
    from flask import request

    # 获取前端发送的数据
    data = request.get_json()

    # 打印接收到的数据（用于调试）
    print(f"收到登录请求: {data}")

    # 模拟成功响应（完全按照前端期望的格式）
    return jsonify({
        'success': True,
        'message': '登录成功',
        'user': {
            'id': 1,
            'username': data.get('identifier', '用户'),
            'email': 'user@example.com',
            'role': data.get('role', 'reader'),
            'token': 'mock_jwt_token_123456'
        }
    }), 200


@app.route('/api/register', methods=['POST'])
def api_register():
    """
    模拟注册接口
    响应格式完全按照前端JavaScript的期望
    """
    import json
    from flask import request

    data = request.get_json()
    print(f"收到注册请求: {data}")

    # 模拟成功响应
    return jsonify({
        'success': True,
        'message': '注册成功'
    }), 201


@app.route('/api/register/author', methods=['POST'])
def api_register_author():
    """
    模拟作者注册接口
    响应格式完全按照前端JavaScript的期望
    """
    import json
    from flask import request

    data = request.get_json()
    print(f"收到作者注册请求: {data}")

    # 模拟成功响应，包含作者ID
    return jsonify({
        'success': True,
        'message': '作者注册成功',
        'authorId': '000000001'
    }), 201


@app.route('/api/logout', methods=['POST'])
def api_logout():
    """
    模拟登出接口
    """
    return jsonify({
        'success': True,
        'message': '登出成功'
    }), 200


@app.route('/api/current_user', methods=['GET'])
def api_current_user():
    """
    模拟获取当前用户接口
    """
    return jsonify({
        'success': False,
        'message': '用户未登录'
    }), 401


@app.route('/api/books', methods=['GET'])
def api_books():
    """
    模拟获取书籍列表接口
    """
    # 模拟书籍数据（按照前端期望的格式）
    mock_books = [
        {
            'id': 1,
            'title': '星穹传说',
            'author': '云梦泽',
            'views': '245.8万',
            'rating': 8.9,
            'description': '在浩瀚的星穹之中...',
            'tags': ['玄幻', '星际'],
            'cover': '📚'
        },
        {
            'id': 2,
            'title': '灵域迷踪',
            'author': '幻雨',
            'views': '213.5万',
            'rating': 9.2,
            'description': '灵气复苏时代...',
            'tags': ['都市', '异能'],
            'cover': '🔮'
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
    }), 200


@app.route('/api/books/search', methods=['GET'])
def api_search_books():
    """
    模拟搜索书籍接口
    """
    query = request.args.get('q', '')

    # 根据查询词返回模拟数据
    mock_results = [
        {
            'id': 1,
            'title': f'搜索到: {query}',
            'author': '测试作者',
            'views': '100万',
            'rating': 8.5,
            'description': f'这是关于"{query}"的搜索结果',
            'tags': ['测试'],
            'cover': '🔍'
        }
    ] if query else []

    return jsonify({
        'success': True,
        'data': mock_results,
        'total': len(mock_results)
    }), 200


# ==================== 健康检查接口 ====================
@app.route('/api/health', methods=['GET'])
def api_health():
    """
    健康检查接口
    """
    return jsonify({
        'status': 'healthy',
        'message': 'FlutterPage服务器运行正常',
        'timestamp': '2023-01-01T00:00:00'
    }), 200


# ==================== 静态文件路由 ====================
@app.route('/static/<path:filename>')
def serve_static(filename):
    """
    提供静态文件访问
    路径保持与原前端代码一致
    """
    return send_from_directory(app.static_folder, filename)


# ==================== 错误处理 ====================
@app.errorhandler(404)
def page_not_found(e):
    """404页面未找到"""
    return render_template('index.html'), 404


# ==================== 启动函数 ====================
def create_project_structure():
    """
    创建项目目录结构（如果不存在）
    """
    directories = ['templates', 'static/css', 'static/js']

    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"创建目录: {directory}")

    # 检查必要的文件是否存在
    required_files = [
        'templates/index.html',
        'templates/home.html',
        'static/css/common.css',
        'static/js/common.js'
    ]

    for file in required_files:
        if not os.path.exists(file):
            print(f"警告: 文件 {file} 不存在，请确保前端文件已放置")


if __name__ == '__main__':
    # 创建目录结构
    create_project_structure()

    # 启动信息
    print("=" * 50)
    print("🚀 FlutterPage 纯连接版启动")
    print("📚 不修改任何前端代码")
    print("🌐 访问地址: http://localhost:5000")
    print("=" * 50)

    # 运行Flask应用
    app.run(
        debug=True,  # 调试模式
        host='0.0.0.0',  # 监听所有网络接口
        port=5000,  # 端口号
        threaded=True  # 启用多线程
    )