# author_api.py
from flask import Flask, Blueprint, request, jsonify
import pymysql

# 创建蓝图
author_bp = Blueprint('author', __name__, url_prefix='/api/author')

# 数据库配置
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'password',
    'database': 'flutterpage',
    'charset': 'utf8mb4'
}


# 获取数据库连接
def get_db_connection():
    return pymysql.connect(**DB_CONFIG)


# 用户会话验证
user_sessions = {}


def validate_session(session_id):
    return session_id in user_sessions


# 获取作者小说列表
@author_bp.route('/novels', methods=['GET'])
def get_author_novels():
    # 验证会话
    session_id = request.headers.get('X-Session-ID')
    if not validate_session(session_id):
        return jsonify({
            'status': 'error',
            'message': '未授权访问'
        }), 401

    user_info = user_sessions[session_id]

    # 获取查询参数
    status = request.args.get('status')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    offset = (page - 1) * per_page

    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    try:
        # 构建查询条件
        query = "SELECT * FROM novels WHERE Author_id = %s"
        params = [user_info['user_id']]

        if status and status in ['draft', 'review', 'published']:
            query += " AND Status = %s"
            params.append(status)

        # 获取总数
        count_query = query.replace("SELECT *", "SELECT COUNT(*) as count")
        cursor.execute(count_query, params)
        total = cursor.fetchone()['count']

        # 获取小说列表
        query += " ORDER BY Updated_at DESC LIMIT %s OFFSET %s"
        params.extend([per_page, offset])

        cursor.execute(query, params)
        novels = cursor.fetchall()

        # 添加统计信息
        for novel in novels:
            # 章节数
            cursor.execute("""
                SELECT COUNT(*) as count FROM chapters
                WHERE Novel_id = %s
            """, (novel['Novel_id'],))
            novel['chapter_count'] = cursor.fetchone()['count']

            # 收藏数
            cursor.execute("""
                SELECT COUNT(*) as count FROM favorites
                WHERE Novel_id = %s
            """, (novel['Novel_id'],))
            novel['favorite_count'] = cursor.fetchone()['count']

            # 评论数
            cursor.execute("""
                SELECT COUNT(*) as count FROM comments
                WHERE Novel_id = %s
            """, (novel['Novel_id'],))
            novel['comment_count'] = cursor.fetchone()['count']

        return jsonify({
            'status': 'success',
            'data': novels,
            'pagination': {
                'total': total,
                'pages': (total + per_page - 1) // per_page,
                'current_page': page,
                'per_page': per_page
            }
        }), 200

    finally:
        cursor.close()
        conn.close()


# 小说统计数据
@author_bp.route('/novels/<int:novel_id>/stats', methods=['GET'])
def novel_stats(novel_id):
    # 验证会话
    session_id = request.headers.get('X-Session-ID')
    if not validate_session(session_id):
        return jsonify({
            'status': 'error',
            'message': '未授权访问'
        }), 401

    user_info = user_sessions[session_id]

    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    try:
        # 检查权限
        cursor.execute("""
            SELECT * FROM novels
            WHERE Novel_id = %s AND Author_id = %s
        """, (novel_id, user_info['user_id']))
        novel = cursor.fetchone()

        if not novel:
            return jsonify({
                'status': 'error',
                'message': '小说不存在或无权限'
            }), 403

        # 获取统计数据
        stats = {
            'novel_id': novel['Novel_id'],
            'title': novel['Title'],
            'status': novel['Status'],
            'word_count': novel['Word_count'],
            'created_at': novel['Created_at'],
            'updated_at': novel['Updated_at']
        }

        # 章节统计
        cursor.execute("""
            SELECT COUNT(*) as chapters, SUM(Word_count) as words
            FROM chapters WHERE Novel_id = %s
        """, (novel_id,))
        chapter_stats = cursor.fetchone()
        stats['chapters'] = chapter_stats['chapters']
        stats['total_words'] = chapter_stats['words'] or 0

        # 收藏统计
        cursor.execute("""
            SELECT COUNT(*) as count FROM favorites
            WHERE Novel_id = %s
        """, (novel_id,))
        stats['favorites'] = cursor.fetchone()['count']

        # 评论统计
        cursor.execute("""
            SELECT COUNT(*) as count FROM comments
            WHERE Novel_id = %s
        """, (novel_id,))
        stats['comments'] = cursor.fetchone()['count']

        # 阅读统计
        cursor.execute("""
            SELECT COUNT(DISTINCT User_id) as readers
            FROM reading_records r
            JOIN chapters c ON r.Chapter_id = c.Chapter_id
            WHERE c.Novel_id = %s
        """, (novel_id,))
        stats['readers'] = cursor.fetchone()['readers'] or 0

        return jsonify({
            'status': 'success',
            'data': stats
        }), 200

    finally:
        cursor.close()
        conn.close()


# ========== Flask应用初始化 ==========
# 创建Flask应用
app = Flask(__name__)

# 注册蓝图
app.register_blueprint(author_bp)


# 测试路由
@app.route('/')
def index():
    return 'Flask API 已启动，请访问 /api/author/novels'


if __name__ == '__main__':
    # 启动Flask开发服务器
    app.run(debug=True, host='0.0.0.0', port=5000)