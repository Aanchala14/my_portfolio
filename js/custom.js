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

    // PROJECT CAROUSEL
    $('.owl-carousel').owlCarousel({
    	items: 1,
	    loop:true,
	    margin:10,
	    nav:true
	});

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
        left: { x: -1, y: 0, angle: Math.PI },
        right: { x: 1, y: 0, angle: 0 },
        up: { x: 0, y: -1, angle: -Math.PI / 2 },
        down: { x: 0, y: 1, angle: Math.PI / 2 }
      };
      let player = { x: 1, y: 1 };
      let direction = directions.right;
      let queuedDirection = directions.right;
      let dots = new Set();
      let score = 0;
      let level = 1;
      let running = false;
      let timer = null;
      let mouthOpen = true;

      const scoreDisplay = document.getElementById('maze-score');
      const levelDisplay = document.getElementById('maze-level');
      const toggle = document.getElementById('maze-toggle');

      function resetDots() {
        dots = new Set();
        map.forEach(function(row, y) {
          row.split('').forEach(function(cell, x) {
            if (cell === '.') dots.add(x + ',' + y);
          });
        });
        dots.delete('1,1');
      }

      function canMove(move) {
        const x = player.x + move.x;
        const y = player.y + move.y;
        return map[y] && map[y][x] !== '#';
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
      }

      function step() {
        if (canMove(queuedDirection)) direction = queuedDirection;
        if (canMove(direction)) {
          player.x += direction.x;
          player.y += direction.y;
          const key = player.x + ',' + player.y;
          if (dots.delete(key)) {
            score += 10;
            scoreDisplay.textContent = score;
          }
        }
        if (dots.size === 0) {
          level += 1;
          levelDisplay.textContent = level;
          player = { x: 1, y: 1 };
          direction = directions.right;
          queuedDirection = directions.right;
          resetDots();
        }
        mouthOpen = !mouthOpen;
        draw();
      }

      function setRunning(nextRunning) {
        running = nextRunning;
        toggle.textContent = running ? 'Pause game' : 'Start game';
        if (timer) clearInterval(timer);
        timer = running ? setInterval(step, 145) : null;
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
      resetDots();
      draw();
    }

})(jQuery);
