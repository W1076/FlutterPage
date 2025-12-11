# app.py
from flask import Flask, request, jsonify
import pymysql
import hashlib
import uuid
from datetime import datetime

# 初始化Flask应用
app = Flask(__name__)

# 数据库连接配置
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '123456',
    'database': 'flutterpage',
    'charset': 'utf8mb4'
}


# 获取数据库连接
def get_db_connection():
    """创建并返回数据库连接对象"""
    return pymysql.connect(**DB_CONFIG)


# 密码加密函数
def encrypt_password(password):
    """使用SHA256+盐值加密密码"""
    salt = uuid.uuid4().hex  # 生成随机盐值
    hash_result = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}:{hash_result}"


# 验证密码函数
def verify_password(stored_password, input_password):
    """验证输入密码是否正确"""
    salt, stored_hash = stored_password.split(':')
    input_hash = hashlib.sha256((input_password + salt).encode()).hexdigest()
    return input_hash == stored_hash


# 用户会话存储（简单实现）
user_sessions = {}


# 根路由 - 解决404问题
@app.route('/')
def home():
    return jsonify({
        'status': 'success',
        'message': 'Flask API服务器运行正常',
        'endpoints': {
            'register': '/api/register (POST)',
            'login': '/api/login (POST)',
            'logout': '/api/logout (POST)'
        }
    }), 200


# 注册API
@app.route('/api/register', methods=['POST'])
def register():
    # 获取前端提交的数据
    data = request.get_json()

    # 检查必填字段
    required_fields = ['username', 'password', 'email']
    for field in required_fields:
        if field not in data:
            return jsonify({
                'status': 'error',
                'message': f'缺少必要字段：{field}'
            }), 400

    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    try:
        # 检查用户名是否已存在
        cursor.execute("SELECT * FROM users WHERE Username = %s", (data['username'],))
        if cursor.fetchone():
            return jsonify({
                'status': 'error',
                'message': '用户名已存在'
            }), 400

        # 检查邮箱是否已存在
        cursor.execute("SELECT * FROM users WHERE Email = %s", (data['email'],))
        if cursor.fetchone():
            return jsonify({
                'status': 'error',
                'message': '邮箱已被注册'
            }), 400

        # 加密密码
        encrypted_pwd = encrypt_password(data['password'])

        # 插入新用户
        cursor.execute("""
            INSERT INTO users (Username, Password, Email, Phone, Created_at)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            data['username'],
            encrypted_pwd,
            data['email'],
            data.get('phone', ''),
            datetime.now()
        ))
        conn.commit()

        return jsonify({
            'status': 'success',
            'message': '注册成功'
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({
            'status': 'error',
            'message': f'注册失败: {str(e)}'
        }), 500

    finally:
        cursor.close()
        conn.close()


# 登录API
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()

    # 检查必填字段
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({
            'status': 'error',
            'message': '用户名或密码不能为空'
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    try:
        # 查询用户
        cursor.execute("SELECT * FROM users WHERE Username = %s", (data['username'],))
        user = cursor.fetchone()

        # 验证用户和密码
        if not user or not verify_password(user['Password'], data['password']):
            return jsonify({
                'status': 'error',
                'message': '用户名或密码错误'
            }), 401

        # 创建会话
        session_id = str(uuid.uuid4())
        user_sessions[session_id] = {
            'user_id': user['User_id'],
            'username': user['Username'],
            'email': user['Email']
        }

        return jsonify({
            'status': 'success',
            'message': '登录成功',
            'session_id': session_id,
            'user': {
                'user_id': user['User_id'],
                'username': user['Username'],
                'email': user['Email']
            }
        }), 200

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'登录失败: {str(e)}'
        }), 500

    finally:
        cursor.close()
        conn.close()


# 登出API
@app.route('/api/logout', methods=['POST'])
def logout():
    data = request.get_json()
    session_id = data.get('session_id') if data else None

    # 如果请求体中没有，尝试从header获取
    if not session_id:
        session_id = request.headers.get('X-Session-ID')

    if session_id and session_id in user_sessions:
        del user_sessions[session_id]
        return jsonify({
            'status': 'success',
            'message': '登出成功'
        }), 200

    return jsonify({
        'status': 'error',
        'message': '无效的会话'
    }), 401


# 健康检查接口
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'success',
        'message': '服务运行正常',
        'timestamp': datetime.now().isoformat()
    }), 200


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)