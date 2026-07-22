(function ($) {

  "use strict";

    // COLOR MODE
    $('.color-mode').click(function(){
        $('.color-mode-icon').toggleClass('active')
        $('body').toggleClass('dark-mode')
        $(this).attr('aria-pressed', $('body').hasClass('dark-mode'))
    })

    // HEADER
    $(".navbar").headroom();

    // SMOOTHSCROLL
    $(function() {
      $('.nav-link, .custom-btn-link, .footer a[href^="#"]').on('click', function(event) {
        var $anchor = $(this);
        var target = $($anchor.attr('href'));
        if (target.length) {
          $('html, body').stop().animate({ scrollTop: target.offset().top - 69 }, 700);
          $('.navbar-collapse').collapse('hide');
          event.preventDefault();
        }
      });
    });  

    // TOOLTIP
    $('.social-links a').tooltip();

    // VIOLET MAZE GAME
    const canvas = document.getElementById('violet-maze');
    if (canvas) {
      const context = canvas.getContext('2d');
      const tile = 40;
      const map = [
        '##############',
        '#............#',
        '#.##.####.##.#',
        '#............#',
        '#.##.#..#.##.#',
        '#....#..#....#',
        '####.####.####',
        '#............#',
        '#.##.####.##.#',
        '##############'
      ];
      const directions = {
        left: { name: 'left', opposite: 'right', x: -1, y: 0, angle: Math.PI },
        right: { name: 'right', opposite: 'left', x: 1, y: 0, angle: 0 },
        up: { name: 'up', opposite: 'down', x: 0, y: -1, angle: -Math.PI / 2 },
        down: { name: 'down', opposite: 'up', x: 0, y: 1, angle: Math.PI / 2 }
      };
      const enemyStarts = [
        { x: 5, y: 3, color: '#ff5b65', direction: 'left', chase: true },
        { x: 6, y: 3, color: '#ff9fca', direction: 'right', chase: false },
        { x: 7, y: 3, color: '#52d8e8', direction: 'left', chase: true },
        { x: 8, y: 3, color: '#ffad4d', direction: 'right', chase: false }
      ];
      let player;
      let enemies;
      let direction;
      let queuedDirection;
      let dots;
      let score;
      let lives;
      let running = false;
      let timer = null;
      let mouthOpen = true;
      let tick = 0;
      let finished = false;
      let finishMessage = '';

      const scoreDisplay = document.getElementById('maze-score');
      const livesDisplay = document.getElementById('maze-lives');
      const toggle = document.getElementById('maze-toggle');

      function canOccupy(x, y) {
        return Boolean(map[y] && map[y][x] && map[y][x] !== '#');
      }

      function resetCharacters() {
        player = { x: 1, y: 1 };
        direction = directions.right;
        queuedDirection = directions.right;
        enemies = enemyStarts.map(function(enemy) {
          return { x: enemy.x, y: enemy.y, color: enemy.color, chase: enemy.chase, direction: directions[enemy.direction] };
        });
      }

      function resetDots() {
        dots = new Set();
        map.forEach(function(row, y) {
          row.split('').forEach(function(cell, x) {
            if (cell === '.') dots.add(x + ',' + y);
          });
        });
        dots.delete('1,1');
        enemyStarts.forEach(function(enemy) { dots.delete(enemy.x + ',' + enemy.y); });
      }

      function resetGame() {
        score = 0;
        lives = 3;
        tick = 0;
        finished = false;
        finishMessage = '';
        scoreDisplay.textContent = score;
        livesDisplay.textContent = lives;
        resetCharacters();
        resetDots();
        draw();
      }

      function canPlayerMove(move) {
        return canOccupy(player.x + move.x, player.y + move.y);
      }

      function drawEnemy(enemy) {
        const x = enemy.x * tile + tile / 2;
        const y = enemy.y * tile + tile / 2;
        context.fillStyle = enemy.color;
        context.beginPath();
        context.arc(x, y - 2, 14, Math.PI, 0);
        context.lineTo(x + 14, y + 13);
        context.lineTo(x + 7, y + 8);
        context.lineTo(x, y + 13);
        context.lineTo(x - 7, y + 8);
        context.lineTo(x - 14, y + 13);
        context.closePath();
        context.fill();
        context.fillStyle = '#fff';
        context.beginPath();
        context.arc(x - 5, y - 3, 4, 0, Math.PI * 2);
        context.arc(x + 5, y - 3, 4, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = '#2a1740';
        context.beginPath();
        context.arc(x - 4 + enemy.direction.x, y - 2 + enemy.direction.y, 1.8, 0, Math.PI * 2);
        context.arc(x + 6 + enemy.direction.x, y - 2 + enemy.direction.y, 1.8, 0, Math.PI * 2);
        context.fill();
      }

      function draw() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#100b16';
        context.fillRect(0, 0, canvas.width, canvas.height);
        map.forEach(function(row, y) {
          row.split('').forEach(function(cell, x) {
            if (cell === '#') {
              context.fillStyle = '#39244a';
              context.fillRect(x * tile + 3, y * tile + 3, tile - 6, tile - 6);
              context.strokeStyle = '#7d4aac';
              context.lineWidth = 2;
              context.strokeRect(x * tile + 5, y * tile + 5, tile - 10, tile - 10);
            }
          });
        });
        context.fillStyle = '#d8c0ef';
        dots.forEach(function(key) {
          const parts = key.split(',');
          context.beginPath();
          context.arc(Number(parts[0]) * tile + tile / 2, Number(parts[1]) * tile + tile / 2, 3.5, 0, Math.PI * 2);
          context.fill();
        });
        enemies.forEach(drawEnemy);
        const centreX = player.x * tile + tile / 2;
        const centreY = player.y * tile + tile / 2;
        const mouth = mouthOpen ? 0.25 : 0.08;
        context.fillStyle = '#a855e6';
        context.beginPath();
        context.moveTo(centreX, centreY);
        context.arc(centreX, centreY, 15, direction.angle + mouth, direction.angle + Math.PI * 2 - mouth);
        context.closePath();
        context.fill();
        context.fillStyle = '#fff';
        context.beginPath();
        context.arc(centreX + Math.cos(direction.angle - 1.1) * 6, centreY + Math.sin(direction.angle - 1.1) * 6, 2.2, 0, Math.PI * 2);
        context.fill();
        if (finishMessage) {
          context.fillStyle = 'rgba(16,11,22,.82)';
          context.fillRect(90, 158, 380, 84);
          context.fillStyle = '#fff';
          context.font = '700 27px Maven Pro, sans-serif';
          context.textAlign = 'center';
          context.fillText(finishMessage, canvas.width / 2, 208);
          context.textAlign = 'start';
        }
        canvas.dataset.enemyCount = String(enemies.length);
        canvas.dataset.enemyPositions = enemies.map(function(enemy) { return enemy.x + ',' + enemy.y; }).join('|');
        canvas.dataset.gameState = finished ? 'finished' : (running ? 'running' : 'paused');
      }

      function chooseEnemyMove(enemy) {
        let options = Object.keys(directions).map(function(name) { return directions[name]; }).filter(function(move) {
          return canOccupy(enemy.x + move.x, enemy.y + move.y);
        });
        const forwardOptions = options.filter(function(move) { return move.name !== enemy.direction.opposite; });
        if (forwardOptions.length) options = forwardOptions;
        if (enemy.chase) {
          options.sort(function(a, b) {
            const aDistance = Math.abs(enemy.x + a.x - player.x) + Math.abs(enemy.y + a.y - player.y);
            const bDistance = Math.abs(enemy.x + b.x - player.x) + Math.abs(enemy.y + b.y - player.y);
            return aDistance - bDistance;
          });
          return options[0];
        }
        return options[Math.floor(Math.random() * options.length)];
      }

      function hasCollision() {
        return enemies.some(function(enemy) { return enemy.x === player.x && enemy.y === player.y; });
      }

      function stopWithLabel(label) {
        running = false;
        if (timer) clearInterval(timer);
        timer = null;
        toggle.textContent = label;
      }

      function loseLife() {
        lives -= 1;
        livesDisplay.textContent = lives;
        if (lives === 0) {
          finished = true;
          finishMessage = 'Game over';
          stopWithLabel('Play again');
        } else {
          resetCharacters();
          finishMessage = 'Caught! ' + lives + ' lives left';
          stopWithLabel('Continue');
        }
        draw();
      }

      function step() {
        if (canPlayerMove(queuedDirection)) direction = queuedDirection;
        if (canPlayerMove(direction)) {
          player.x += direction.x;
          player.y += direction.y;
          const key = player.x + ',' + player.y;
          if (dots.delete(key)) {
            score += 10;
            scoreDisplay.textContent = score;
          }
        }
        if (hasCollision()) {
          loseLife();
          return;
        }
        tick += 1;
        if (tick % 2 === 0) {
          enemies.forEach(function(enemy) {
            const move = chooseEnemyMove(enemy);
            if (move) {
              enemy.direction = move;
              enemy.x += move.x;
              enemy.y += move.y;
            }
          });
        }
        if (hasCollision()) {
          loseLife();
          return;
        }
        if (dots.size === 0) {
          finished = true;
          finishMessage = 'Maze cleared!';
          stopWithLabel('Play again');
        }
        mouthOpen = !mouthOpen;
        draw();
      }

      function setRunning(nextRunning) {
        if (nextRunning && finished) resetGame();
        finishMessage = '';
        running = nextRunning;
        toggle.textContent = running ? 'Pause game' : 'Start game';
        if (timer) clearInterval(timer);
        timer = running ? setInterval(step, 150) : null;
        draw();
      }

      function chooseDirection(name) {
        queuedDirection = directions[name];
        if (!running) setRunning(true);
      }

      document.addEventListener('keydown', function(event) {
        const keys = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down' };
        if (keys[event.key]) {
          event.preventDefault();
          chooseDirection(keys[event.key]);
        }
      });
      document.querySelectorAll('[data-direction]').forEach(function(button) {
        button.addEventListener('click', function() { chooseDirection(button.dataset.direction); });
      });
      toggle.addEventListener('click', function() { setRunning(!running); });
      document.addEventListener('visibilitychange', function() { if (document.hidden && running) setRunning(false); });
      resetGame();
    }

})(jQuery);
