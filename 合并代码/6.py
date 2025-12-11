# comment_api.py
from flask import Flask, Blueprint, request, jsonify
import pymysql
from datetime import datetime

# 创建Flask应用
app = Flask(__name__)

# 创建蓝图
comment_bp = Blueprint('comment', __name__, url_prefix='/api/comments')

# 数据库配置
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '123456',
    'database': 'flutterpage',
    'charset': 'utf8mb4'
}


# 初始化数据库表
def init_database():
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 创建用户表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                User_id INT AUTO_INCREMENT PRIMARY KEY,
                Username VARCHAR(50) NOT NULL UNIQUE,
                Email VARCHAR(100),
                Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 创建小说表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS novels (
                Novel_id INT AUTO_INCREMENT PRIMARY KEY,
                Title VARCHAR(255) NOT NULL,
                Author VARCHAR(100),
                Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 创建评论表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS comments (
                Comment_id INT AUTO_INCREMENT PRIMARY KEY,
                Novel_id INT NOT NULL,
                User_id INT NOT NULL,
                Content TEXT NOT NULL,
                Parent_id INT NULL,
                Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                Updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """)

        # 插入测试数据
        cursor.execute(
            "INSERT IGNORE INTO users (User_id, Username, Email) VALUES (1, 'test_user', 'test@example.com')")
        cursor.execute("INSERT IGNORE INTO novels (Novel_id, Title, Author) VALUES (1, '测试小说', '测试作者')")

        conn.commit()
        print("数据库表初始化完成！")

    except Exception as e:
        print(f"数据库初始化错误: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()


# 获取数据库连接
def get_db_connection():
    return pymysql.connect(**DB_CONFIG)


# 用户会话验证（简化测试版）
user_sessions = {
    'test_session': {'user_id': 1, 'username': 'test_user'}
}


def validate_session(session_id):
    return session_id in user_sessions


# 发表评论API
@comment_bp.route('', methods=['POST'])
def add_comment():
    # 验证会话
    session_id = request.headers.get('X-Session-ID')
    if not validate_session(session_id):
        return jsonify({
            'status': 'error',
            'message': '未授权访问'
        }), 401

    user_info = user_sessions[session_id]
    data = request.get_json()

    # 检查必填字段
    if not data or 'novel_id' not in data or 'content' not in data:
        return jsonify({
            'status': 'error',
            'message': '缺少小说ID或评论内容'
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    try:
        # 检查小说是否存在
        cursor.execute("SELECT * FROM novels WHERE Novel_id = %s", (data['novel_id'],))
        if not cursor.fetchone():
            return jsonify({
                'status': 'error',
                'message': '小说不存在'
            }), 404

        # 插入评论
        cursor.execute("""
            INSERT INTO comments (Novel_id, User_id, Content, Parent_id, Created_at, Updated_at)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            data['novel_id'],
            user_info['user_id'],
            data['content'],
            data.get('parent_id'),
            datetime.now(),
            datetime.now()
        ))
        comment_id = cursor.lastrowid
        conn.commit()

        return jsonify({
            'status': 'success',
            'message': '评论发表成功',
            'comment_id': comment_id
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

    finally:
        cursor.close()
        conn.close()


# 获取小说评论列表
@comment_bp.route('/novel/<int:novel_id>', methods=['GET'])
def get_comments(novel_id):
    # 获取分页参数
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))
    offset = (page - 1) * per_page

    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    try:
        # 获取评论总数
        cursor.execute("""
            SELECT COUNT(*) as count FROM comments 
            WHERE Novel_id = %s AND Parent_id IS NULL
        """, (novel_id,))
        total = cursor.fetchone()['count']

        # 获取顶级评论
        cursor.execute("""
            SELECT c.*, u.Username FROM comments c
            LEFT JOIN users u ON c.User_id = u.User_id
            WHERE c.Novel_id = %s AND c.Parent_id IS NULL
            ORDER BY c.Created_at DESC
            LIMIT %s OFFSET %s
        """, (novel_id, per_page, offset))
        comments = cursor.fetchall()

        # 获取每条评论的回复
        for comment in comments:
            cursor.execute("""
                SELECT c.*, u.Username FROM comments c
                LEFT JOIN users u ON c.User_id = u.User_id
                WHERE c.Parent_id = %s
                ORDER BY c.Created_at ASC
            """, (comment['Comment_id'],))
            comment['replies'] = cursor.fetchall()

        return jsonify({
            'status': 'success',
            'data': comments,
            'pagination': {
                'total': total,
                'pages': (total + per_page - 1) // per_page,
                'current_page': page,
                'per_page': per_page
            }
        }), 200

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        cursor.close()
        conn.close()


# 测试接口 - 添加一些示例评论
@comment_bp.route('/test', methods=['POST'])
def add_test_comments():
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 清空现有评论
        cursor.execute("DELETE FROM comments")

        # 添加测试评论
        test_comments = [
            (1, 1, '这是一条很好的评论！', None),
            (1, 1, '我非常喜欢这本小说！', None),
            (1, 1, '作者写得真好！', 1),  # 回复第一条评论
            (1, 1, '同意你的观点！', 2)  # 回复第二条评论
        ]

        for comment in test_comments:
            cursor.execute("""
                INSERT INTO comments (Novel_id, User_id, Content, Parent_id)
                VALUES (%s, %s, %s, %s)
            """, comment)

        conn.commit()
        return jsonify({'status': 'success', 'message': '测试评论添加成功'})

    except Exception as e:
        conn.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# 注册蓝图到Flask应用
app.register_blueprint(comment_bp)


@app.route('/')
def hello():
    return '评论API服务运行中！<br><a href="/api/comments/novel/1">查看评论</a><br><a href="/api/comments/test" method="post">添加测试评论</a>'


# 启动Flask应用
if __name__ == '__main__':
    print("初始化数据库...")
    init_database()
    print("启动评论API服务...")
    print("访问 http://localhost:5000/ 查看测试页面")
    print("访问 http://localhost:5000/api/comments/novel/1 测试评论接口")
    app.run(debug=True, host='0.0.0.0', port=5000)