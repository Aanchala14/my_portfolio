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

})(jQuery);
