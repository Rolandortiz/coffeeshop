//  GSAP SECTION
document.addEventListener("DOMContentLoaded", function() {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from(".nav-item", {
      opacity: 0,
      duration: 2,
      scrollTrigger: {
        trigger: ".nav-item",
        start: "center bottom",
        end: "bottom top",

      }
    });
  });


 gsap.registerPlugin(ScrollTrigger);
        const offerSection = document.querySelector('#review-section');


        const offerAnim = gsap.timeline({
            scrollTrigger: {
                trigger: offerSection,

                start: 'top center',


            }
        });
        offerAnim.from('#reviews', {
             duration: 1,
            scale: 0.5,
            opacity: 0,
            delay: 0.5,
            stagger: 1,
            ease: "elastic",
            force3D: true
        });

gsap.to("#review-btn", {
  duration: 1,
  x: 600,
  rotation: 360,
scrollTrigger: {
                trigger: offerSection,

                start: 'top center',

            }
});


gsap.registerPlugin(ScrollTrigger)
const projectSection = document.getElementById('products-section');

const projectAnim = gsap.timeline({
    scrollTrigger: {
        trigger: projectSection,
        start: 'center bottom',
        end: 'bottom top',

    }
});

projectAnim.from(".card", {
    duration: 1,
    scale: 0.5,
    opacity: 0,
    delay: 0.5,
    stagger: 0.2,
    ease: "elastic",
    force3D: true
});


$(document).ready(function() {
  $('.like-form button').click(function(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    var button = $(this);
    var reviewId = $(this).data('review-id');

    // Find the parent review element and then find the button within it
    var reviewElement = button.closest('.review');
    var reviewButton = reviewElement.find('.like-form button');

    $.ajax({
      type: 'POST',
      url: '/review/' + reviewId + '/like',
      success: function(response) {
        var likeCount = response.likeCount;
        var isLiked = response.isLiked;

        reviewButton.toggleClass('add-like');
        reviewButton.toggleClass('remove-like');

        if (isLiked) {
          reviewButton.html('<svg class="me-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-up" viewBox="0 0 16 16"><path d="M8.864..."></svg>Like');
        } else {
          reviewButton.html('<i class="fas fa-thumbs-up"></i> Liked');
        }

        var likeCountElement = reviewElement.find('.like-count');
        likeCountElement.text(likeCount);
      },
      error: function(error) {
        console.log('Error updating the like button', error);
      }
    });
  });
});
