$(document).ready(function() {
  function delay(n) {
    n = n || 2000;
    return new Promise((done) => {
      setTimeout(() => {
        done();
      }, n);
    });
  }

  function pageTransition() {
    var tl = gsap.timeline();
    tl.to(".loading-screen", {
      duration: 1.2,
      width: "100%",
      left: "0%",
      ease: "Expo.easeInOut"
    });
    tl.to(".loading-screen", {
      duration: 1,
      width: "100%",
      left: "100%",
      ease: "Expo.easeInOut",
      delay: 0.3
    });
    tl.set(".loading-screen", {
      left: "-100%",
    });
  }

  $('.list-group-item').click(function(e) {
    e.preventDefault(); // Prevent the default behavior of anchor tag
    const url = $(this).attr('href');
    pageTransition();
    setTimeout(function() {
      window.location.href = url; // Navigate to the new page
    }, 1300); // Adjust the delay to match the duration of your transition animation
  });

  // Additional JavaScript code goes here

});
