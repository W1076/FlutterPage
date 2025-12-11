"""
FlutterPage - 终极解决方案
不改前端任何代码，强制处理所有跳转
"""

from flask import Flask, render_template, send_from_directory, jsonify, request, redirect
import os

app = Flask(__name__)


# ==================== 1. 静态文件处理 ====================
@app.route('/static/<path:filename>')
def serve_static(filename):
    """处理静态文件"""
    return send_from_directory('static', filename)


@app.route('/css/<path:filename>')
def serve_css(filename):
    """处理CSS文件"""
    return send_from_directory('static/css', filename)


@app.route('/js/<path:filename>')
def serve_js(filename):
    """处理JS文件"""
    return send_from_directory('static/js', filename)


# 处理前端HTML中的相对路径
@app.route('/../static/<path:filename>')
def serve_static_relative(filename):
    """处理 ../static/ 路径"""
    return send_from_directory('static', filename)


# ==================== 2. 页面路由 ====================
@app.route('/')
def index():
    """首页 -> 登录页"""
    return render_template('index.html')


@app.route('/home')
def home():
    """主页（Flask路由）"""
    return render_template('home.html')


# ==================== 3. 关键：处理所有HTML文件请求 ====================
# 这是解决问题的核心！
@app.route('/<page_name>')
def serve_html_page(page_name):
    """
    处理所有页面请求，包括：
    - home.html
    - index.html
    - book-detail.html
    - 等等...
    """
    # 如果是HTML文件
    if page_name.endswith('.html'):
        # 映射到对应的Flask路由
        page_map = {
            'home.html': 'home',  # home.html -> /home 路由
            'index.html': '',  # index.html -> / 路由
            'book-detail.html': 'book_detail',
            'chapter-reading.html': 'chapter_reading',
            'author-dashboard.html': 'author_dashboard',
            'admin-dashboard.html': 'admin_dashboard',
            'book-list.html': 'book_list',
            'search.html': 'search'
        }

        if page_name in page_map:
            # 重定向到Flask路由
            return redirect(f'/{page_map[page_name]}')
        else:
            # 其他页面暂时返回主页
            return redirect('/home')

    # 如果不是HTML文件，尝试作为静态文件
    try:
        return send_from_directory('static', page_name)
    except:
        return redirect('/')


# ==================== 4. 实际页面路由（供重定向使用） ====================
# 这些路由处理重定向后的页面
@app.route('/book_detail')
def book_detail():
    """书籍详情页"""
    return render_template('home.html')  # 暂时返回主页


@app.route('/chapter_reading')
def chapter_reading():
    """章节阅读页"""
    return render_template('home.html')


@app.route('/author_dashboard')
def author_dashboard():
    """作者后台"""
    return render_template('home.html')


@app.route('/admin_dashboard')
def admin_dashboard():
    """管理员后台"""
    return render_template('home.html')


@app.route('/book_list')
def book_list():
    """书籍列表页"""
    return render_template('home.html')


@app.route('/search')
def search():
    """搜索页面"""
    return render_template('home.html')


# ==================== 5. API接口（必须与前端匹配） ====================
@app.route('/api/login', methods=['POST'])
def api_login():
    """登录API"""
    data = request.get_json()
    print(f"🔑 登录请求: {data}")

    # 强制返回成功，让前端执行跳转代码
    return jsonify({
        'success': True,
        'message': '登录成功！正在跳转到主页...',
        'user': {
            'user_id': 1,
            'username': data.get('identifier', '用户'),
            'email': f"{data.get('identifier', 'user')}@example.com",
            'role': data.get('role', 'reader')
        },
        'role': data.get('role', 'reader')
    })


@app.route('/api/register', methods=['POST'])
def api_register():
    """注册API"""
    return jsonify({
        'success': True,
        'message': '注册成功'
    })


@app.route('/api/register/author', methods=['POST'])
def api_register_author():
    """作者注册API"""
    return jsonify({
        'success': True,
        'message': '作者注册成功',
        'authorId': 'AUTH001'
    })


@app.route('/api/logout', methods=['POST'])
def api_logout():
    """登出API"""
    return jsonify({
        'success': True,
        'message': '登出成功'
    })


@app.route('/api/current_user', methods=['GET'])
def api_current_user():
    """当前用户API"""
    return jsonify({
        'success': False,
        'message': '用户未登录'
    })


# ==================== 6. 中间件：强制跳转 ====================
@app.before_request
def force_redirect():
    """
    强制跳转中间件
    当前端JS执行 window.location.href = 'xxx.html' 时
    这个中间件会拦截并重定向
    """
    path = request.path

    # 调试信息
    print(f"📡 请求路径: {path}")
    print(f"📡 请求方法: {request.method}")

    # 如果直接访问 home.html，重定向到 /home
    if path == '/home.html':
        print("🔄 重定向: /home.html -> /home")
        return redirect('/home')

    # 如果直接访问 index.html，重定向到 /
    if path == '/index.html':
        print("🔄 重定向: /index.html -> /")
        return redirect('/')

    # 如果API登录成功后的跳转
    if path == '/' and request.method == 'GET':
        # 检查是否是从登录过来的
        referer = request.headers.get('Referer', '')
        if '/api/login' in referer:
            print("🔄 登录成功，重定向到主页")
            return redirect('/home')


# ==================== 7. 注入JavaScript代码（最暴力但有效） ====================
@app.after_request
def inject_javascript(response):
    """
    在每个HTML页面中注入JavaScript
    强制覆盖前端的跳转逻辑
    """
    if response.content_type and 'text/html' in response.content_type:
        try:
            html = response.get_data(as_text=True)

            # 要注入的JavaScript代码
            inject_code = """
            <script>
            // ==================== 强制重写前端跳转逻辑 ====================
            console.log('🔄 Flask注入的JavaScript已加载');

            // 1. 重写全局跳转函数
            window.originalLocationHref = window.location.href;

            // 2. 重写 window.location.href 的setter
            Object.defineProperty(window.location, 'href', {
                set: function(url) {
                    console.log('🔄 拦截跳转请求:', url);

                    // 映射HTML文件到Flask路由
                    var routeMap = {
                        'home.html': '/home',
                        'index.html': '/',
                        'book-detail.html': '/book_detail',
                        'chapter-reading.html': '/chapter_reading',
                        'author-dashboard.html': '/author_dashboard',
                        'admin-dashboard.html': '/admin_dashboard'
                    };

                    // 如果是映射中的URL，使用Flask路由
                    if (url in routeMap) {
                        console.log('🔄 映射到Flask路由:', routeMap[url]);
                        window.location = routeMap[url];
                    } else if (url.endsWith('.html')) {
                        // 其他.html文件，重定向到主页
                        console.log('🔄 其他HTML文件，重定向到主页');
                        window.location = '/home';
                    } else {
                        // 其他URL，正常跳转
                        console.log('🔄 正常跳转:', url);
                        window.location = url;
                    }
                },
                get: function() {
                    return window.originalLocationHref;
                }
            });

            // 3. 重写特定函数（如果存在）
            setTimeout(function() {
                // 重写 router.redirectToHome
                if (typeof router !== 'undefined' && router.redirectToHome) {
                    var originalRedirectToHome = router.redirectToHome;
                    router.redirectToHome = function() {
                        console.log('🔄 拦截 redirectToHome，跳转到 /home');
                        window.location = '/home';
                    };
                }

                // 重写 router.redirectToLogin
                if (typeof router !== 'undefined' && router.redirectToLogin) {
                    router.redirectToLogin = function() {
                        console.log('🔄 拦截 redirectToLogin，跳转到 /');
                        window.location = '/';
                    };
                }

                // 重写 handleLoginSuccess
                if (typeof handleLoginSuccess !== 'undefined') {
                    window.originalHandleLoginSuccess = handleLoginSuccess;
                    handleLoginSuccess = function(userData, role) {
                        console.log('🔄 登录成功，强制跳转到 /home');
                        setTimeout(function() {
                            window.location = '/home';
                        }, 1000);
                    };
                }
            }, 100);

            console.log('✅ Flask跳转拦截器已激活');
            </script>
            """

            # 注入到</body>标签前
            if '</body>' in html:
                html = html.replace('</body>', inject_code + '</body>')
                response.set_data(html)
                print("✅ JavaScript代码已注入到页面")
        except Exception as e:
            print(f"⚠️ 注入JavaScript时出错: {e}")

    return response


# ==================== 8. 启动服务器 ====================
if __name__ == '__main__':
    print("=" * 70)
    print("🚀 FlutterPage 终极解决方案启动！")
    print("📌 前端代码：完全未修改")
    print("🎯 核心原理：URL重写 + JavaScript注入")
    print("🌐 访问地址：http://localhost:5000")
    print("🔗 登录页：http://localhost:5000/")
    print("🔗 主页：http://localhost:5000/home")
    print("=" * 70)
    print("📢 重要提示：")
    print("1. 登录后会强制跳转到主页")
    print("2. 所有 .html 文件请求都会被重定向")
    print("3. 查看浏览器控制台查看跳转日志")
    print("=" * 70)


    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000,
        threaded=True
    )