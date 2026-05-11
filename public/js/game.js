/**
 * 游戏主类，负责整个游戏的初始化、运行和状态管理
 */
class Game {
    /**
     * 构造函数，初始化游戏状态和属性
     */
    constructor() {
        this.currentScreen = 'login-screen'; // 当前显示的屏幕，默认登录屏幕
        this.username = '';
        this.ammo = 3;
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.player = null;
        this.gameLoop = null;
        this.isGamePaused = false;
        this.quizQuestions = [];
        this.currentQuestionIndex = 0;
        this.correctAnswers = 0;
        this.enemyCount = 7;
        this.enemiesDestroyed = 0;
        this.health = 5;  // 新增：玩家初始生命值
                // 新增关卡配置（后续依次添加其他7关）
        this.levels = [
            {
                name: "法律法规与总则",
                category: "法律法规与总则",
                successImg: "法律法规与总则挑战成功图.png",
                failImg: "法律法规与总则挑战失败图.png"
            },
            {
                name: "通风与瓦斯防治",
                category: "通风与瓦斯防治",
                successImg: "通风与瓦斯防治挑战成功图.png",
                failImg: "通风与瓦斯防治挑战失败图.png"
            },
            {
                name: "爆炸与火灾防治",
                category: "爆炸与火灾防治",
                successImg: "爆炸与火灾防治挑战成功图.png",
                failImg: "爆炸与火灾防治挑战失败图.png"
            },
            {
                name: "矿井水害防治",
                category: "矿井水害防治",
                successImg: "矿井水害防治挑战成功图.png",
                failImg: "矿井水害防治挑战失败图.png"
            },
            {
                name: "顶板与冲击地压防治",
                category: "顶板与冲击地压防治",
                successImg: "顶板与冲击地压防治挑战成功图.png",
                failImg: "顶板与冲击地压防治挑战失败图.png"
            },
            {
                name: "爆破与爆炸物品管理",
                category: "爆破与爆炸物品管理",
                successImg: "爆破与爆炸物品管理挑战成功图.png",
                failImg: "爆破与爆炸物品管理挑战失败图.png"
            },
            {
                name: "运输提升与电气安全",
                category: "运输提升与电气安全",
                successImg: "运输提升与电气安全挑战成功图.png",
                failImg: "运输提升与电气安全挑战失败图.png"
            },
            {
                name: "职业健康与应急避险",
                category: "职业健康与应急避险",
                successImg: "职业健康与应急避险挑战成功图.png",
                failImg: "职业健康与应急避险挑战失败图.png"
            }
        ];
        this.currentLevel = 0;
        this.levelQuestions = [];        // 当前关卡的50题
        this.levelAnsweredIndex = 0;     // 已答到第几题（0~50）
        this.levelCorrectCount = 0;      // 本关累计答对题数
        this.wrongQuestions = [];        // 错题集（对象引用）
        this.infiniteQuiz = false;       // 是否进入无尽答题模式
        this.quizComplete = false;       // 20题是否已答完
        this.roundResults = [];          // 本轮每道题正确/错误
        this.normalQuestionIndex = 0;    // 无尽模式下正常出题的起始索引
        this.answeredRecords = [];       // 存储每道题的作答记录（用于回看）
        this.canNavigate = false;        // 是否允许通过按钮切换题目
        // ===== 音频预加载 =====
        this.bgMusic = new Audio('sound/game_music.ogg');
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.2;

        this.bulletSound = new Audio('sound/bullet.wav');
        this.bulletSound.volume = 0.2;

        this.getBulletSound = new Audio('sound/get_bullet.wav');
        this.getBulletSound.volume = 0.2;

        this.meDownSound = new Audio('sound/me_down.wav');
        this.meDownSound.volume = 0.2;

        // 三个敌人爆炸音效，随机使用
        this.enemyDownSounds = [
            new Audio('sound/enemy1_down.wav'),
            new Audio('sound/enemy2_down.wav'),
            new Audio('sound/enemy3_down.wav')
        ];
        this.enemyDownSounds.forEach(snd => snd.volume = 0.3);

        this.buttonSound = new Audio('sound/button.wav');
        this.buttonSound.volume = 0.2;

        // 背景音乐是否已启动
        this.musicStarted = false;
        // ===== 音频预加载结束 =====
        this.init();
    }

    /**
     * 初始化游戏，绑定事件和显示登录屏幕
     */
    init() {
        this.bindEvents();
        
        this.showScreen('login-screen');
    }
    /**
     * 绑定游戏事件，包括登录、开始游戏、理论、返回菜单、返回理论、重试、失败复习、成功复习、继续游戏、分类按钮点击、键盘事件
     */
    bindEvents() {
        document.getElementById('login-btn').addEventListener('click', () => this.handleLogin());
        document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());
        document.getElementById('theory-btn').addEventListener('click', () => this.showScreen('theory-screen'));
        document.getElementById('back-to-menu-btn').addEventListener('click', () => this.showScreen('menu-screen'));
        document.getElementById('back-to-theory-btn').addEventListener('click', () => this.showScreen('theory-screen'));
        document.getElementById('fail-review-btn').addEventListener('click', () => this.showScreen('theory-screen'));
        document.getElementById('success-review-btn').addEventListener('click', () => this.showScreen('theory-screen'));
        document.getElementById('continue-game-btn').addEventListener('click', () => this.continueGame());  // 新增
        document.getElementById('prev-question-btn').addEventListener('click', () => this.prevQuestion());
        document.getElementById('next-question-btn').addEventListener('click', () => this.nextQuestion());
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.showCategoryQuestions(e.target.dataset.category));
        });

        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    /**
     * 显示指定屏幕，包括登录屏幕、菜单屏幕、理论屏幕、游戏屏幕
     * @param {string} screenId - 要显示的屏幕ID
     */
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;

        // 背景音乐控制：只在游戏画面播放，进入其他画面暂停
        if (screenId === 'game-screen') {
            this.playMusic();
            this.initGameCanvas();
        } else {
            this.stopMusic();
        }
    }
    /**
     * 处理登录事件，验证用户名并显示菜单屏幕
     */
    handleLogin() {
        const usernameInput = document.getElementById('username');
        this.username = usernameInput.value.trim();
        
        if (this.username) {
            this.showScreen('menu-screen');
        } else {
            alert('请输入用户名');
        }
    }
    /**
     * 处理开始游戏事件，重置游戏状态并显示游戏屏幕
     */
    async startGame() {
        this.ammo = 10;
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.enemiesDestroyed = 0;
        this.isGamePaused = false;
        this.health = 5;

        // 加载当前关卡题目（只取前20题）
        await this.loadLevelQuestions();
        this.levelAnsweredIndex = 0;
        this.levelCorrectCount = 0;
        this.wrongQuestions = [];          // 清空错题集
        this.infiniteQuiz = false;
        this.quizComplete = false;
        this.roundResults = [];
        this.normalQuestionIndex = 0;
        this.showScreen('game-screen');
        this.updateGameUI();
    }
    async loadLevelQuestions() {
        const category = this.levels[this.currentLevel].category;
        // 使用绝对路径，确保从网站根目录加载
        const response = await fetch('/questions.json');
        const all = await response.json();
        if (all[category] && all[category].length >= 50) {
            this.levelQuestions = all[category].slice(0, 50);
        } else {
            console.error('题库不足');
        }
    }
    /**
     * 初始化游戏画布，设置游戏背景和玩家飞机
     */
    initGameCanvas() {
        // 在创建新循环前清除旧的游戏循环
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        const canvas = document.getElementById('game-canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        this.background = new Image();
        this.background.src = '游戏背景图.png';

        this.player = {
            x: canvas.width / 2 - 50,
            y: canvas.height - 150,
            width: 100,
            height: 100,
            speed: 8,
            image: new Image()
        };
        this.player.image.src = '玩家飞机图.png';

        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            space: false
        };

        this.spawnEnemies();
        this.gameLoop = setInterval(() => this.updateGame(), 1000 / 60);
    }

    /**
     * 生成危险源敌机
     */
    spawnEnemies() {
        const canvas = document.getElementById('game-canvas');
        for (let i = 0; i < this.enemyCount; i++) {
            const enemy = {
                x: Math.random() * (canvas.width - 80),
                y: -100 - (i * 150),
                width: 80,
                height: 80,
                speed: 2,
                image: new Image(),
                hasShot: false  // 新增：标记是否已发射过子弹
            };
            enemy.image.src = '危险源敌机图.png';
            this.enemies.push(enemy);
        }
    }

    /**
     * 处理键盘按下事件，更新玩家飞机位置和射击
     * @param {Event} e - 键盘事件对象
     */
    handleKeyDown(e) {
        if (this.currentScreen !== 'game-screen' || this.isGamePaused) return;
        
        const key = e.key.toLowerCase();
        if (key === 'w') this.keys.w = true;
        if (key === 'a') this.keys.a = true;
        if (key === 's') this.keys.s = true;
        if (key === 'd') this.keys.d = true;
        if (key === ' ') {
            e.preventDefault();
            if (!this.keys.space) {
                this.shoot();
            }
            this.keys.space = true;
        }
    }
    /**
     * 处理键盘松开事件，更新玩家飞机位置和射击
     * @param {Event} e - 键盘事件对象
     */
    handleKeyUp(e) {
        const key = e.key.toLowerCase();
        if (key === 'w') this.keys.w = false;
        if (key === 'a') this.keys.a = false;
        if (key === 's') this.keys.s = false;
        if (key === 'd') this.keys.d = false;
        if (key === ' ') this.keys.space = false;
    }
    /**
     * 处理射击事件，创建子弹并更新游戏状态
     */
    shoot() {
        if (this.ammo <= 0) {
            this.startQuiz();
            return;
        }
        /**
         * 创建子弹并更新游戏状态
         */
        const canvas = document.getElementById('game-canvas');
        const bullet = {
            x: this.player.x + this.player.width / 2 - 5,
            y: this.player.y,
            width: 10,
            height: 20,
            speed: 10,
            image: new Image()
        };
        bullet.image.src = '万能弹药图.png';
        this.bullets.push(bullet);
        this.ammo--;
        this.updateGameUI();
        this.bulletSound.currentTime = 0;   // 重置以便快速连击
        this.bulletSound.play().catch(console.warn);
    }
    /**
     * 更新游戏状态，包括玩家飞机、子弹和敌机
     */
    updateGame() {
        if (this.isGamePaused) return;

        const canvas = document.getElementById('game-canvas');
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.updatePlayer();
        this.updateBullets();
        this.updateEnemies();
        this.checkCollisions();

        this.drawGame(ctx);
    }
    /**
     * 更新玩家飞机位置
     */
    updatePlayer() {
        const canvas = document.getElementById('game-canvas');
        
        if (this.keys.w && this.player.y > 0) {
            this.player.y -= this.player.speed;
        }
        if (this.keys.s && this.player.y < canvas.height - this.player.height) {
            this.player.y += this.player.speed;
        }
        if (this.keys.a && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.keys.d && this.player.x < canvas.width - this.player.width) {
            this.player.x += this.player.speed;
        }
    }
    /**
     * 更新子弹位置
     */
    updateBullets() {
        const canvas = document.getElementById('game-canvas');
        
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > -bullet.height;
        });

        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.y += bullet.speed;
            return bullet.y < canvas.height;
        });
    }
    /**
     * 更新敌机位置
     */
    updateEnemies() {
        const canvas = document.getElementById('game-canvas');
        const now = Date.now();

        this.enemies.forEach(enemy => {
            enemy.y += enemy.speed;

            // 敌机进入屏幕且尚未发射子弹时，发射一次
            if (enemy.y >= 0 && !enemy.hasShot) {
                this.enemyShoot(enemy);
                enemy.hasShot = true;  // 标记为已发射
            }
        });

        this.enemies = this.enemies.filter(enemy => enemy.y < canvas.height + 100);

        if (this.enemies.length < this.enemyCount) {
            this.spawnEnemies();
        }
    }

    /**
     * 敌机射击事件，创建敌机子弹并更新游戏状态
     * @param {Object} enemy - 敌机对象
     */
    enemyShoot(enemy) {
        const bullet = {
            x: enemy.x + enemy.width / 2 - 5,
            y: enemy.y + enemy.height,
            width: 10,
            height: 20,
            speed: 5
        };
        this.enemyBullets.push(bullet);
    }

    /**
     * 检查子弹和敌机之间的碰撞
     */
    checkCollisions() {
        //玩家子弹碰撞敌机事件
        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.isColliding(bullet, enemy)) {
                    this.bullets.splice(bulletIndex, 1);
                    this.enemies.splice(enemyIndex, 1);
                    this.enemiesDestroyed++;
                    this.updateGameUI();
                    // 随机播放一个爆炸音效
                    const randomDown = this.enemyDownSounds[Math.floor(Math.random() * 3)];
                    randomDown.currentTime = 0;
                    randomDown.play().catch(console.warn);
                    // 实时检查胜利条件：答题完成 + 答对≥40 + 击毁≥70
                    if (this.quizComplete && this.levelCorrectCount >= 40 && this.enemiesDestroyed >= 70) {
                        this.levelWin();
                        return; // 终止碰撞检测后续逻辑
                    }
                }
            });
        });
        //玩家飞机碰撞敌机子弹事件
        this.enemyBullets.forEach((bullet, index) => {
            if (this.isColliding(bullet, this.player)) {
                this.enemyBullets.splice(index, 1);  // 移除子弹
                this.health--;                       // 生命值减1
                this.updateGameUI();                 // 更新UI
                if (this.health <= 0) {
                    this.gameOver();                 // 生命值耗尽才失败
                }
            }
            });
        // 敌机与玩家碰撞
        this.enemies.forEach(enemy => {
            if (this.isColliding(enemy, this.player)) {
                const enemyIndex = this.enemies.indexOf(enemy);
                if (enemyIndex > -1) {
                    this.enemies.splice(enemyIndex, 1);  // 移除敌机
                }
                this.health--;                       // 生命值减1
                this.updateGameUI();                 // 更新UI
                if (this.health <= 0) {
                    this.gameOver();                 // 生命值耗尽才失败
                }
            }
        });
    }

    /**
     * 检查两个对象是否碰撞
     * @param {Object} obj1 - 第一个对象
     * @param {Object} obj2 - 第二个对象
     * @returns {boolean} - 如果碰撞则返回true，否则返回false
     */
    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
   
    /**
     * 绘制游戏元素，包括背景、玩家飞机、子弹和敌机
     * @param {CanvasRenderingContext2D} ctx - 2D渲染上下文
     */
    drawGame(ctx) {
        const canvas = document.getElementById('game-canvas');
        if (this.background && this.background.complete) {
            ctx.drawImage(this.background, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        if (this.player && this.player.image.complete) {
            ctx.drawImage(this.player.image, this.player.x, this.player.y, this.player.width, this.player.height);
        }

        this.bullets.forEach(bullet => {
            if (bullet.image.complete) {
                ctx.drawImage(bullet.image, bullet.x, bullet.y, bullet.width, bullet.height);
            }
        });

        this.enemies.forEach(enemy => {
            if (enemy.image.complete) {
                ctx.drawImage(enemy.image, enemy.x, enemy.y, enemy.width, enemy.height);
            }
        });

        this.enemyBullets.forEach(bullet => {
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
    }
   
    /**
     * 更新游戏界面元素，包括弹药数量和敌机数量
     */
    updateGameUI() {
        document.getElementById('ammo-count').textContent = this.ammo;// 显示当前弹药数量
        document.getElementById('enemy-count').textContent = this.enemiesDestroyed + '/70' ;// 显示当前敌机数量
         // 新增：显示当前生命值
        document.getElementById('health-count').textContent = this.health;// 显示当前生命值
    }
    
    /**
     * 游戏结束事件，显示失败界面
     */
    gameOver() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        this.meDownSound.currentTime = 0;
        this.meDownSound.play().catch(console.warn);
        this.stopMusic();
        this.levelLose();
    }

    /** 
     * 游戏结束事件，显示胜利界面
     */
    gameWin() {
        clearInterval(this.gameLoop);
        this.showScreen('success-screen');
    }

    /**
     * 开始游戏事件，获取题目并显示在界面上
     */
    startQuiz() {
        this.isGamePaused = true;
        this.roundResults = new Array(this.quizQuestions.length).fill(false);
        this.answeredRecords = new Array(10).fill(null); // 初始10个空位
        this.canNavigate = false;
        document.getElementById('quiz-content').classList.remove('hidden');
        document.getElementById('quiz-result').classList.add('hidden');

        // 强制无尽模式条件
        if (this.quizComplete && this.enemiesDestroyed < 70) {
            this.infiniteQuiz = true;
        }

        if (this.infiniteQuiz) {
            // 无尽模式：优先使用错题，错题不够时（极少情况）才用原题
            const pool = this.wrongQuestions.length > 0 ? this.wrongQuestions : this.levelQuestions;
            const needed = 10;
            this.quizQuestions = [];
            for (let i = 0; i < needed; i++) {
                this.quizQuestions.push(pool[i % pool.length]);
            }
        } else {
            // 正常模式：从未答的50题中取最多10道
            const remaining = this.levelQuestions.slice(this.levelAnsweredIndex);
            this.quizQuestions = remaining.slice(0, 10);
        }

        // 确保 answeredRecords 长度与题目数一致
        this.answeredRecords = new Array(this.quizQuestions.length).fill(null);
        this.currentQuestionIndex = 0;
        this.correctAnswers = 0;
        this.showScreen('quiz-screen');
        this.showQuestion();
    }
    /**
     * 显示当前题目和选项
     */
    showQuestion() {
        const question = this.quizQuestions[this.currentQuestionIndex];
        document.getElementById('current-question').textContent = this.currentQuestionIndex + 1;
        document.getElementById('total-questions').textContent = this.quizQuestions.length;
        document.getElementById('question-text').textContent = question.question;
        
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';

        // 解析显示区域（同之前）
        let explDiv = document.getElementById('explanation-display');
        if (!explDiv) {
            explDiv = document.createElement('div');
            explDiv.id = 'explanation-display';
            explDiv.style.marginTop = '15px';
            explDiv.style.padding = '10px';
            explDiv.style.backgroundColor = '#f0f0f0';
            explDiv.style.borderRadius = '5px';
            explDiv.style.color = '#333';
            explDiv.style.display = 'none';
            optionsContainer.parentNode.insertBefore(explDiv, optionsContainer.nextSibling);
        } else {
            explDiv.style.display = 'none';
        }

        // 恢复已作答状态（如果有记录）
        const record = this.answeredRecords[this.currentQuestionIndex];
        if (record) {
            // 该题已经答过，禁用所有选项，显示之前的选择和解析
            // 创建按钮但不绑定事件，根据 record 高亮
            if (question.type === 'choice') {
                question.options.forEach((option) => {
                    const btn = document.createElement('button');
                    btn.className = 'option-btn';
                    btn.textContent = option;
                    btn.disabled = true;
                    if (option === record.userAnswer) {
                        btn.classList.add(record.isCorrect ? 'correct' : 'wrong');
                    }
                    if (option === question.answer) {
                        btn.classList.add('correct');
                    }
                    optionsContainer.appendChild(btn);
                });
            } else {
                // 判断题同理
                const trueBtn = document.createElement('button');
                trueBtn.className = 'option-btn';
                trueBtn.textContent = '正确';
                trueBtn.disabled = true;
                if (record.userAnswer === true) {
                    trueBtn.classList.add(record.isCorrect ? 'correct' : 'wrong');
                }
                if (question.answer === true) trueBtn.classList.add('correct');
                optionsContainer.appendChild(trueBtn);
                const falseBtn = document.createElement('button');
                falseBtn.className = 'option-btn';
                falseBtn.textContent = '错误';
                falseBtn.disabled = true;
                if (record.userAnswer === false) {
                    falseBtn.classList.add(record.isCorrect ? 'correct' : 'wrong');
                }
                if (question.answer === false) falseBtn.classList.add('correct');
                optionsContainer.appendChild(falseBtn);
            }

            // 显示解析
            if (explDiv) {
                explDiv.innerHTML = '<span style="color: blue; font-weight: bold; font-size: 16px;">解析：</span><span style="color: black; font-size: 16px;">' + (question.explanation || '无解析') + '</span>';
                explDiv.style.display = 'block';
            }
            // 按钮状态：允许前进/后退
            this.canNavigate = true;
        } else {
            // 未答题目：正常创建选项按钮，绑定 checkAnswer
            this.canNavigate = false;
            if (question.type === 'choice') {
                question.options.forEach((option) => {
                    const btn = document.createElement('button');
                    btn.className = 'option-btn';
                    btn.textContent = option;
                    btn.addEventListener('click', () => this.checkAnswer(option, question.answer, btn));
                    optionsContainer.appendChild(btn);
                });
            } else if (question.type === 'judgment') {
                const trueBtn = document.createElement('button');
                trueBtn.className = 'option-btn';
                trueBtn.textContent = '正确';
                trueBtn.addEventListener('click', () => this.checkAnswer(true, question.answer, trueBtn));
                optionsContainer.appendChild(trueBtn);

                const falseBtn = document.createElement('button');
                falseBtn.className = 'option-btn';
                falseBtn.textContent = '错误';
                falseBtn.addEventListener('click', () => this.checkAnswer(false, question.answer, falseBtn));
                optionsContainer.appendChild(falseBtn);
            }
        }

        // 更新导航按钮状态
        this.updateNavButtons();
    }

    /**
     * 检查用户答案是否正确，更新界面元素
     * @param {*} userAnswer - 用户选择的答案
     * @param {*} correctAnswer - 正确答案
     * @param {HTMLButtonElement} btn - 点击的按钮元素
     */
    checkAnswer(userAnswer, correctAnswer, btn) {
        const allBtns = document.querySelectorAll('.option-btn');
        allBtns.forEach(b => b.disabled = true);

        // 对于选择题，去除选项前缀（如 "A. "）后再比较
        let isCorrect = false;
        const question = this.quizQuestions[this.currentQuestionIndex];
        if (question.type === 'choice') {
            // 去除 userAnswer 可能包含的前缀
            const cleanUserAnswer = userAnswer.replace(/^[A-Z]\.\s*/, '').trim();
            isCorrect = (cleanUserAnswer === correctAnswer.trim());
        } else {
            // 判断题保持布尔值比较
            isCorrect = (userAnswer === correctAnswer);
        }

        if (isCorrect) {
            this.correctAnswers++;
            btn.classList.add('correct');
        } else {
            btn.classList.add('wrong');
            const question = this.quizQuestions[this.currentQuestionIndex];
            allBtns.forEach(b => {
                if (question.type === 'judgment') {
                    // 判断题：直接用按钮文本与正确答案匹配
                    if ((b.textContent === '正确' && correctAnswer === true) ||
                        (b.textContent === '错误' && correctAnswer === false)) {
                        b.classList.add('correct');
                    }
                } else {
                    // 选择题：去除选项前缀后比较
                    const cleanText = b.textContent.replace(/^[A-Z]\.\s*/, '').trim();
                    if (cleanText === correctAnswer.trim()) {
                        b.classList.add('correct');
                    }
                }
            });
        }

        // 记录本次作答
        const currentQ = this.quizQuestions[this.currentQuestionIndex];
        this.answeredRecords[this.currentQuestionIndex] = {
            userAnswer: userAnswer,
            isCorrect: isCorrect,
            explanation: currentQ.explanation
        };

        // 显示解析（样式调整：解析蓝色，内容黑色，字体 16px）
        const explDiv = document.getElementById('explanation-display');
        if (explDiv && currentQ) {
            explDiv.innerHTML = '<span style="color: blue; font-weight: bold; font-size: 16px;">解析：</span><span style="color: black; font-size: 16px;">' + (currentQ.explanation || '无解析') + '</span>';
            explDiv.style.display = 'block';
        }

        // 允许导航
        this.canNavigate = true;
        this.updateNavButtons();
        this.roundResults[this.currentQuestionIndex] = isCorrect;
    }
        
    /**
     * 显示答题结果，包括准确率和获得的弹药数量
     */
    showQuizResult() {
        const roundCorrect = this.correctAnswers;
        const roundTotal = this.quizQuestions.length;
        const accuracy = Math.round((roundCorrect / roundTotal) * 100);

        // 1. 更新错题集（只保留答错的题目，不移除已变正确的错题）
        this.quizQuestions.forEach((q, idx) => {
            const isCorrect = this.roundResults[idx];
            if (!isCorrect) {
                this.wrongQuestions.push(q);
            }
        });

        // 2. 更新总进度（仅在非无尽模式时更新）
        if (!this.quizComplete) {
            this.levelAnsweredIndex += roundTotal;
            this.levelCorrectCount += roundCorrect;
            if (this.levelAnsweredIndex >= 50) {
                this.quizComplete = true;
            }
        }

        // 3. 显示结果界面
        document.getElementById('accuracy').textContent = accuracy;
        document.getElementById('earned-ammo').textContent = roundCorrect;
        document.getElementById('quiz-content').classList.add('hidden');
        document.getElementById('quiz-result').classList.remove('hidden');
    }
    updateNavButtons() {
        const prevBtn = document.getElementById('prev-question-btn');
        const nextBtn = document.getElementById('next-question-btn');
        if (!prevBtn || !nextBtn) return;

        // 控制按钮可见性
        if (this.currentQuestionIndex === 0) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'inline-block';
        } else if (this.currentQuestionIndex === this.quizQuestions.length - 1) {
            prevBtn.style.display = 'inline-block';
            nextBtn.style.display = 'inline-block';
        } else {
            prevBtn.style.display = 'inline-block';
            nextBtn.style.display = 'inline-block';
        }

        prevBtn.disabled = (this.currentQuestionIndex === 0);

        // 始终根据题目位置更新按钮文字
        if (this.currentQuestionIndex === this.quizQuestions.length - 1) {
            nextBtn.textContent = '查看结果';
        } else {
            nextBtn.textContent = '下一题';
        }

        // 允许导航时启用按钮，否则禁用
        nextBtn.disabled = !this.canNavigate;
    }

    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.showQuestion();
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.quizQuestions.length - 1) {
            this.currentQuestionIndex++;
            this.showQuestion();
        } else if (this.currentQuestionIndex === this.quizQuestions.length - 1) {
            // 已达最后一题，进入结果页
            this.showQuizResult();
        }
    }
    continueGame() {
    // 胜负判断：已完成50题且答对<40，失败
        if (this.quizComplete && this.levelCorrectCount < 40) {
            this.levelLose();
            return;
        }
        // 胜利：已完成50题，答对≥40，且击毁≥70
        if (this.quizComplete && this.levelCorrectCount >= 40 && this.enemiesDestroyed >= 70) {
            this.levelWin();
            return;
        }

        // 进入无尽模式：已完成50题，答对≥40，但击毁不足
        if (this.quizComplete && this.levelCorrectCount >= 40 && this.enemiesDestroyed < 70) {
            this.infiniteQuiz = true;
        }

        // 补充弹药、返回游戏
        this.ammo += this.correctAnswers;   // 本轮正确数
        if (this.correctAnswers > 0) {
            this.getBulletSound.currentTime = 0;
            this.getBulletSound.play().catch(console.warn);
        }
        this.isGamePaused = false;
        document.getElementById('quiz-content').classList.remove('hidden');
        document.getElementById('quiz-result').classList.add('hidden');
        this.showScreen('game-screen');
        this.updateGameUI();
    }
    /**
     * 显示指定分类的题目
     * @param {string} category - 题目分类
     */
    async showCategoryQuestions(category) {
        try {
            // 直接加载整个 questions.json，从中提取对应分类
            const response = await fetch('questions.json');
            const allQuestions = await response.json();
            const questions = allQuestions[category] || [];
            
            document.getElementById('category-title').textContent = category;
            const questionsList = document.getElementById('questions-list');
            questionsList.innerHTML = '';
            questions.forEach((q, index) => {
                const questionItem = document.createElement('div');
                questionItem.className = 'question-item';
                
                const typeText = q.type === 'choice' ? '选择题' : '判断题';
                questionItem.innerHTML = `
                    <span class="question-type">${typeText}</span>
                    <h3>${index + 1}. ${q.question}</h3>
                    ${q.type === 'choice' ? `
                        <div class="options">
                            ${q.options.map(opt => `<div class="option">${opt}</div>`).join('')}
                        </div>
                    ` : ''}
                    <div class="answer">答案: ${q.type === 'choice' ? q.answer : (q.answer ? '正确' : '错误')}</div>
                    <div class="explanation">解析: ${q.explanation}</div>
                `;
                
                questionsList.appendChild(questionItem);
            });
            this.showScreen('category-questions-screen');
        } catch (error) {
            console.error('获取题目失败:', error);
        }
    }
    playMusic() {
        if (!this.musicStarted) {
            this.bgMusic.play().catch(console.warn);
            this.musicStarted = true;
        }
    }

    stopMusic() {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
        this.musicStarted = false;
    }
    levelWin() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        // 设置成功界面图片
        document.getElementById('success-bg-img').src = this.levels[this.currentLevel].successImg;
        const nextBtn = document.getElementById('next-level-btn');
        if (this.currentLevel < this.levels.length - 1) {
            nextBtn.textContent = '进入下一关';
            nextBtn.onclick = () => this.nextLevel();
        } else {
            nextBtn.textContent = '返回主菜单';
            nextBtn.onclick = () => this.showScreen('menu-screen');
        }
        this.showScreen('success-screen');
    }

    levelLose() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        document.getElementById('fail-bg-img').src = this.levels[this.currentLevel].failImg;
        const retryBtn = document.getElementById('retry-level-btn');
        retryBtn.textContent = '重新挑战';
        retryBtn.onclick = () => this.restartLevel();
        this.showScreen('fail-screen');
    }

    nextLevel() {
        this.currentLevel++;
        if (this.currentLevel < this.levels.length) {
            this.startGame();   // 异步启动下一关
        }
    }

    restartLevel() {
        this.startGame();       // 重新开始当前关卡
    }
    /**
     * 重新开始游戏事件，重置游戏状态并重新开始游戏
     */
    restartGame() {
        this.startGame();
    }
}

window.onload = () => {
    new Game();
};
