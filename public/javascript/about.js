$(document).ready(function(){

  $(".navbar a, footer a[href='#myPage']").on('click', function(event) {

    if (this.hash !== "") {

      event.preventDefault();


      var hash = this.hash;


      $('html, body').animate({
        scrollTop: $(hash).offset().top
      }, 900, function(){

        window.location.hash = hash;
      });
    }
  });

  $(window).scroll(function() {
    $(".slideanim").each(function(){
      var pos = $(this).offset().top;

      var winTop = $(window).scrollTop();
        if (pos < winTop + 600) {
          $(this).addClass("slide");
        }
    });
  });
})


// gsap

gsap.fromTo(
    ".description-about",
    { x: -900 },
    {
        x: "10%",
        scrollTrigger: {
        duration: 5,
            trigger: ".description-about",
            start: "-80px 100px",
            end: "center bottom",
            pinSpacing: false,

        }
    }
);
gsap.fromTo(
    ".about-image",
    { x: 900 },
    {
        x: "45%",
        scrollTrigger: {
        duration: 5,
            trigger: ".about-image",
            start: "-80px 100px",
            end: "center bottom",
            pinSpacing: false,
        }
    }
);

gsap.fromTo(
    ".mission-image",
    { x: -900 },
    {
        x: "10%",
        scrollTrigger: {
        duration: 5,
            trigger: ".mission-image",
            start: "-200px 100px",
            end: "center bottom",
            pinSpacing: false,

        }
    }
);

gsap.fromTo(
    ".mission-about",
    { x: 900 },
    {
        x: "10%",
        scrollTrigger: {
        duration: 5,
            trigger: ".mission-about",
            start: "-200px 100px",
            end: "center bottom",
            pinSpacing: false,
        }
    }
);

  gsap.registerPlugin(ScrollTrigger);

gsap.to('.jumbotron', {
  scrollTrigger: {
    trigger: '.jumbotron',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
  },
  rotation: 360,
  scale: 0.5,
  opacity: 0.5
});