(function () {
  const videos = {
    "video-1": document.getElementById("video-1"),
  };

  const descriptions = {
    "video-1": document.getElementById("description-1"),
  };

  let currentVideoIndex = 0; // Start with the first video
  const videoKeys = Object.keys(videos);
  const videoContent = document.querySelector(".video-section__content");
  const videoWrapper = document.querySelector(".video-section__wrapper");

  // Hide the content function
  const seriesDropdownButton = document.getElementById("seriesDropdownButton");
  const seriesDropdown = document.getElementById("seriesDropdown");
  const seriesClose = document.querySelector(".series__close");

  let hideTimeout;
  let isVideoPaused = false;
  let isDragging = false; // Flag to track if the video is being dragged

  function hideContent(video) {
    const timeUpdateHandler = () => {
      if (
        video.currentTime >= 5 &&
        !isVideoPaused &&
        !isDragging && // Check if not dragging
        !seriesDropdown.classList.contains("series__wrapper--active")
      ) {
        videoContent.classList.add("video-section__content--hidden");
        seriesDropdownButton.classList.add("series__button--hidden");
        video.removeEventListener("timeupdate", timeUpdateHandler); // Stop listening after hiding
      }
    };

    const showContentHandler = () => {
      videoContent.classList.remove("video-section__content--hidden");
      seriesDropdownButton.classList.remove("series__button--hidden");
      clearTimeout(hideTimeout); // Clear the previous timeout
      if (
        !isVideoPaused &&
        !isDragging && // Check if not dragging
        !seriesDropdown.classList.contains("series__wrapper--active")
      ) {
        hideTimeout = setTimeout(() => {
          videoContent.classList.add("video-section__content--hidden");
          seriesDropdownButton.classList.add("series__button--hidden");
        }, 5000); // Hide content after 5 seconds of inactivity
      }
    };

    const pauseHandler = () => {
      isVideoPaused = true;
      videoContent.classList.remove("video-section__content--hidden");
      seriesDropdownButton.classList.remove("series__button--hidden");
      clearTimeout(hideTimeout); // Clear the timeout when the video is paused
    };

    const playHandler = () => {
      isVideoPaused = false;
      showContentHandler(); // Show the content and reset the timer when the video is played
      video.addEventListener("timeupdate", timeUpdateHandler); // Re-add the timeupdate listener
    };

    // Dragging handlers
    const dragStartHandler = () => {
      isDragging = true; // Set dragging to true
      showContentHandler();
    };

    const dragEndHandler = () => {
      isDragging = false; // Set dragging to false
    };

    // Add event listeners
    video.addEventListener("timeupdate", timeUpdateHandler);
    video.addEventListener("mousemove", showContentHandler);
    video.addEventListener("click", showContentHandler);
    document.addEventListener("keydown", showContentHandler);
    document.addEventListener("mouseup", showContentHandler);
    video.addEventListener("pause", pauseHandler);
    video.addEventListener("play", playHandler);

    // Add drag event listeners
    document.addEventListener("mousedown", dragStartHandler);
    document.addEventListener("mouseup", dragEndHandler);
  }

  // Toggle dropdown visibility
  if (seriesDropdownButton) {
    seriesDropdownButton.addEventListener("click", () => {
      seriesDropdown.classList.toggle("series__wrapper--active");
      seriesDropdownButton.classList.toggle("series__button--active");
      shareContent.classList.remove("share__content--active");
      shareButton.classList.remove("share__button--active");
      shade.classList.remove("shade--active");
    });

    seriesClose.addEventListener("click", () => {
      seriesDropdown.classList.remove("series__wrapper--active");
      seriesDropdownButton.classList.remove("series__button--active");
    });
  }

  // Function to switch videos based on selection
  seriesDropdown.addEventListener("click", (event) => {
    const target = event.target.closest(".series__item");
    if (target) {
      const selectedVideoId = target.getAttribute("data-video-id");

      // Pause the current video before switching
      const currentVideo = videos[videoKeys[currentVideoIndex]];
      currentVideo.pause();

      // Hide all videos and show the selected one
      for (const id in videos) {
        videos[id].classList.toggle(
          "video-section__item--active",
          id === selectedVideoId
        );
      }

      for (const id in descriptions) {
        descriptions[id].classList.toggle(
          "video-section__label--active",
          id === selectedVideoId
        );
      }

      // Play the selected video
      const selectedVideo = videos[selectedVideoId];
      selectedVideo.currentTime = 0; // Reset to start

      // Function to switch videos based on selection from dropdown
      currentVideoIndex = videoKeys.indexOf(selectedVideoId); // Update current index based on selection

      updateVideo(); // Call updateVideo to reflect changes

      // Hide the dropdown after selection
      seriesDropdown.classList.remove("series__wrapper--active");
      seriesDropdownButton.classList.remove("series__button--active");
    }
  });

  // Change play/pause icons functions
  const playButton = document.getElementById("playButton");
  const bottomPlayButton = document.querySelector(".bottom-play-button");

  const playImage = playButton.querySelector('.play-button__image[alt="Play"]');
  const pauseImage = playButton.querySelector(
    '.play-button__image[alt="Pause"]'
  );

  function addPauseIcon() {
    // Remove active class from play image
    playImage.classList.remove("play-button__image--active");
    // Add active class to pause image
    pauseImage.classList.add("play-button__image--active");

    bottomPlayButton.classList.add("bottom-play-button--paused");
  }

  function removePauseIcon() {
    // Remove active class from pause image
    pauseImage.classList.remove("play-button__image--active");
    // Add active class to play image
    playImage.classList.add("play-button__image--active");

    bottomPlayButton.classList.remove("bottom-play-button--paused");
  }

  // Play/Pause functionality
  function togglePlayPause() {
    const currentVideo = Object.values(videos).find((video) =>
      video.classList.contains("video-section__item--active")
    );
    if (currentVideo.paused) {
      currentVideo.play();
      addPauseIcon();
    } else {
      currentVideo.pause();
      removePauseIcon();
    }

    // Hide the content
    hideContent(currentVideo);
  }

  videoWrapper.addEventListener("click", (event) => {
    if (event.target.closest(".video-section__bottom")) {
      return;
    }

    togglePlayPause();
  });

  bottomPlayButton.addEventListener("click", togglePlayPause);

  // Add event listener for space bar press
  document.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
      event.preventDefault(); // Prevent the default space bar action (scrolling)
      togglePlayPause();
    }
  });

  // Progress bar
  const progressFill = document.getElementById("progressFill");
  const progressIndicator = document.getElementById("progressIndicator");

  const hoverTimeElement = document.getElementById("hoverTime");
  const hoverTimeTextElement = document.getElementById("hoverTimeText");

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const updateProgress = (video) => {
    const percentage = (video.currentTime / video.duration) * 100;
    progressFill.style.width = percentage + "%";
    progressIndicator.style.left = `calc(${percentage}%)`;
  };

  // Add event listener for timeupdate on each video
  Object.values(videos).forEach((video) => {
    video.addEventListener("timeupdate", () => updateProgress(video));
  });

  // Function to handle progress bar interactions
  function handleProgressBar(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const percentage = (offsetX / rect.width) * 100;

    // Get the currently displayed video
    const currentVideo = Object.values(videos).find((video) =>
      video.classList.contains("video-section__item--active")
    );

    if (currentVideo) {
      const newTime = (percentage / 100) * currentVideo.duration;

      if (event.type === "click") {
        currentVideo.currentTime = newTime;
      } else if (event.type === "mousemove") {
        hoverTimeTextElement.textContent = formatTime(newTime);
        hoverTimeElement.style.left = `${percentage}%`;
        hoverTimeElement.classList.add("progress__time--active");
      }
    }
  }

  // Add event listeners for click and mousemove
  document
    .querySelector(".progress")
    .addEventListener("click", handleProgressBar);

  document
    .querySelector(".progress__bar")
    .addEventListener("mousemove", handleProgressBar);

  document
    .querySelector(".progress__bar")
    .addEventListener("mouseleave", () => {
      hoverTimeElement.classList.remove("progress__time--active");
    });

  // Volume
  const volumeButton = document.querySelector(".volume-button");
  const volumeBar = document.querySelector(".volume-bar");
  const volumeFill = document.querySelector(".volume-fill");
  const volumeIndicator = document.querySelector(".volume-indicator");
  const progress = document.querySelector(".progress");

  // Function to update the volume based on the position of the mouse
  function updateVolume(e) {
    const rect = volumeBar.getBoundingClientRect();
    const y = e.clientY - rect.top;
    let percentage = Math.max(0, Math.min(100, (y / rect.height) * 100));

    volumeFill.style.height = `${percentage}%`;
    volumeIndicator.style.top = `${percentage}%`;

    const currentVideo = Object.values(videos).find((video) =>
      video.classList.contains("video-section__item--active")
    );

    if (currentVideo) {
      currentVideo.muted = false;
      currentVideo.volume = 1 - percentage / 100;
      previousVolume = currentVideo.volume;
    }

    volumeButton.classList.remove("volume-button--muted");
  }

  function updateVolumeIndicator(volume) {
    const volumePercentage = volume * 100;
    volumeFill.style.height = `${volumePercentage}%`;
    volumeIndicator.style.top = `${volumePercentage}%`;
  }

  updateVolumeIndicator(0);

  // Event listeners for mousedown on the volume indicator and volume bar
  volumeIndicator.addEventListener("mousedown", (e) => {
    isDragging = true;
    updateVolume(e);
  });

  volumeBar.addEventListener("mousedown", (e) => {
    isDragging = true;
    updateVolume(e);
  });

  // Event listener for mousemove on the document
  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      updateVolume(e);
    }
  });

  // Event listener for mouseup on the document
  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Event listener for click on the volume button
  volumeButton.addEventListener("click", (e) => {
    volumeButton.classList.toggle("volume-button--muted");

    const currentVideo = Object.values(videos).find((video) =>
      video.classList.contains("video-section__item--active")
    );

    if (currentVideo) {
      currentVideo.muted = !currentVideo.muted;

      if (currentVideo.muted) {
        previousVolume = currentVideo.volume;
        volumeFill.style.height = "100%";
        volumeIndicator.style.top = "100%";
      } else if (previousVolume === 1) {
        updateVolumeIndicator(0);
      } else {
        updateVolumeIndicator(previousVolume);
      }
    }
  });

  // Adjust volume with scroll
  volumeBar.addEventListener("wheel", (e) => {
    e.preventDefault(); // Prevent the default scroll behavior
    const delta = Math.sign(-e.deltaY); // Determine the scroll direction

    const currentHeight = parseFloat(volumeFill.style.height) || 0;
    const newHeight = Math.max(0, Math.min(100, currentHeight - delta * 5)); // Adjust the volume by 5% per scroll

    volumeFill.style.height = `${newHeight}%`;
    volumeIndicator.style.top = `${newHeight}%`;

    const currentVideo = Object.values(videos).find((video) =>
      video.classList.contains("video-section__item--active")
    );

    if (currentVideo) {
      currentVideo.muted = false;
      currentVideo.volume = 1 - newHeight / 100;
      previousVolume = currentVideo.volume;
    }

    volumeButton.classList.remove("volume-button--muted");
  });

  volumeButton.addEventListener("mouseover", () => {
    progress.classList.add("progress--hidden");
  });
  volumeBar.addEventListener("mouseover", () => {
    progress.classList.add("progress--hidden");
  });

  volumeButton.addEventListener("mouseout", () => {
    progress.classList.remove("progress--hidden");
  });
  volumeBar.addEventListener("mouseout", () => {
    progress.classList.remove("progress--hidden");
  });

  // Next button
  // Function to update the video and description
  function updateVideo() {
    // Hide all videos and descriptions first
    for (const key of videoKeys) {
      videos[key].classList.remove("video-section__item--active");
      descriptions[key].classList.remove("video-section__label--active");
    }

    // Show the current video and description
    const currentVideo = videos[videoKeys[currentVideoIndex]];
    const currentDescription = descriptions[videoKeys[currentVideoIndex]];

    currentVideo.classList.add("video-section__item--active");
    currentDescription.classList.add("video-section__label--active");

    // Reset and play the current video
    currentVideo.currentTime = 0; // Reset to start

    currentVideo.addEventListener("timeupdate", () => {
      updateProgress(currentVideo);
    });

    removePauseIcon();
    updateLink();
  }

  // Event listener for the Next button
  document.getElementById("next").addEventListener("click", function () {
    const currentVideo = videos[videoKeys[currentVideoIndex]];
    currentVideo.pause(); // Pause the current video

    if (currentVideoIndex < videoKeys.length - 1) {
      currentVideoIndex++; // Move to the next video
    } else {
      currentVideoIndex = 0; // Loop back to the first video
    }
    updateVideo();
  });

  // Back 10 seconds button
  const backButton = document.getElementById("backButton");
  backButton.addEventListener("click", function () {
    const currentVideo = Object.values(videos).find((video) =>
      video.classList.contains("video-section__item--active")
    );
    currentVideo.currentTime = Math.max(0, currentVideo.currentTime - 10);
  });

  // Forward 10 seconds button
  const forwardButton = document.getElementById("forwardButton");
  forwardButton.addEventListener("click", function () {
    const currentVideo = Object.values(videos).find((video) =>
      video.classList.contains("video-section__item--active")
    );
    currentVideo.currentTime = Math.min(
      currentVideo.duration,
      currentVideo.currentTime + 10
    );
  });

  // Fullscreen
  const fullScreenButton = document.getElementById("fullScreen");
  const videoContainer = document.querySelector(".video-section__container");
  const fullScreenClose = document.querySelector(".full-screen-close");
  const contentTop = document.querySelector(".video-section__content-top");
  const sectionBottom = document.querySelector(".video-section__bottom");

  const series = document.querySelector(".series");
  const currentVideo = videos[videoKeys[currentVideoIndex]];

  function handleFullscreen() {
    if (isFullscreen()) {
      // The video is in fullscreen mode
      exitFullscreen();
      setFullscreenData(false);
    } else {
      // The video is not in fullscreen mode
      requestFullscreen(videoContainer);
      setFullscreenData(true);
    }
  }

  function handleFullscreenSafari() {
    if (isFullscreen()) {
      // The video is in fullscreen mode
      exitFullscreen();
      setFullscreenData(false);
    } else {
      // The video is not in fullscreen mode
      requestFullscreen(currentVideo);
      setFullscreenData(true);
    }
  }
  
  function setFullscreenData(state) {
    videoContainer.setAttribute("data-fullscreen", !!state);
  }
  
  function isFullscreen() {
    return !!(
      document.fullscreenElement ||
      document.mozFullScreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    );
  }
  
  function requestFullscreen(element) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }
  
  function exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }

  function toggleFullClasses() {
    videoContainer.classList.toggle("video-section__container--full");
    videoWrapper.classList.toggle("video-section__wrapper--full");

    series.classList.toggle("series--full");
    seriesClose.classList.toggle("series__close--full");

    seriesDropdownButton.classList.toggle("series__button--full");
    seriesDropdown.classList.toggle("series__wrapper--full");

    fullScreenButton.classList.toggle("full-screen-button--opened");
    fullScreenClose.classList.toggle("full-screen-close--full");

    currentVideo.classList.toggle("video-section__item--full");
    videoContent.classList.toggle("video-section__content--full");

    contentTop.classList.toggle("video-section__content-top--full");
    sectionBottom.classList.toggle("video-section__bottom--full");
  }

  document.addEventListener("fullscreenchange", (e) => {
    setFullscreenData(isFullscreen());
    toggleFullClasses();
  });
  
  document.addEventListener("mozfullscreenchange", (e) => {
    setFullscreenData(isFullscreen());
    toggleFullClasses();
  });
  
  document.addEventListener("webkitfullscreenchange", (e) => {
    setFullscreenData(isFullscreen());
    toggleFullClasses();
  });
  
  document.addEventListener("MSFullscreenChange", (e) => {
    setFullscreenData(isFullscreen());
    toggleFullClasses();
  });
  
  currentVideo.addEventListener("webkitbeginfullscreen", () => {
    currentVideo.controls = false;
  });
  
  currentVideo.addEventListener("webkitendfullscreen", () => {
    currentVideo.controls = true;
  });
  
  fullScreenButton.addEventListener("click", (e) => {
    // handleFullscreen();   
    handleFullscreenSafari();
  });
  
  fullScreenClose.addEventListener("click", (e) => {
    handleFullscreen();
  });

  // Share
  const shareButton = document.querySelector(".share__button");
  const shareContent = document.querySelector(".share__content");
  const shareClose = document.querySelector(".share__close");
  const shade = document.querySelector(".shade");

  shareButton.addEventListener("click", () => {
    if (shareButton.classList.contains("share__button--active")) {
      sharePopUp.classList.remove("share__pop-up--active");
    }

    shareContent.classList.toggle("share__content--active");
    shareButton.classList.toggle("share__button--active");
    shade.classList.toggle("shade--active");
    document.body.classList.toggle("stop-scroll");
  });

  shareClose.addEventListener("click", () => {
    shareContent.classList.remove("share__content--active");
    shareButton.classList.remove("share__button--active");
    shade.classList.remove("shade--active");
    sharePopUp.classList.remove("share__pop-up--active");
    document.body.classList.remove("stop-scroll");
  });

  document.body.addEventListener("click", (event) => {
    if (event.target.closest(".series") || event.target.closest(".share")) {
      return;
    }

    seriesDropdown.classList.remove("series__wrapper--active");
    seriesDropdownButton.classList.remove("series__button--active");

    shareContent.classList.remove("share__content--active");
    shareButton.classList.remove("share__button--active");
    sharePopUp.classList.remove("share__pop-up--active");

    shade.classList.remove("shade--active");
    document.body.classList.remove("stop-scroll");
  });

  const input = document.querySelector(".share__input");
  const shareFormButton = document.querySelector(".share__form-button");
  const shareInfo = document.querySelector(".share__info");
  const sharePopUp = document.querySelector(".share__pop-up");

  // Function to update the input value with the current video src
  // Update the href attributes of the links
  const tgLink = document.querySelector(".share__link--tg");
  const vkLink = document.querySelector(".share__link--vk");
  const okLink = document.querySelector(".share__link--ok");

  function updateLink() {
    const currentVideo = videos[videoKeys[currentVideoIndex]];
    const currentVideoSrc = currentVideo.src;
    input.value = currentVideoSrc;

    tgLink.href = `https://t.me/share/url?url=${encodeURIComponent(
      currentVideoSrc
    )}`;
    vkLink.href = `https://vk.com/share.php?url=${encodeURIComponent(
      currentVideoSrc
    )}`;
    okLink.href = `https://connect.ok.ru/offer?url=${encodeURIComponent(
      currentVideoSrc
    )}`;
  }

  // Function to copy the link to the clipboard
  async function copyLink() {
    try {
      // Get the text from the input field
      const linkToCopy = input.value;

      // Copy the text to the clipboard
      await navigator.clipboard.writeText(linkToCopy);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }

  // Initial update of the input value
  updateLink();

  // Event listener to copy the link when the button is clicked
  shareFormButton.addEventListener("click", (e) => {
    e.preventDefault();
    copyLink();
    sharePopUp.classList.add("share__pop-up--active");
    // shareContent.classList.add("share__content--mobile");
  });

  shareInfo.addEventListener("click", () => {
    copyLink();
    sharePopUp.classList.add("share__pop-up--active");
    // shareContent.classList.add("share__content--mobile");
  });

  // share__pop-up moile
  function addMobilePopUp() {
    shareContent.classList.add("share__content--mobile");
    shade.classList.remove("shade--active");
    setTimeout(() => {
      sharePopUp.classList.remove("share__pop-up--active");
      shareContent.classList.remove("share__content--mobile");
      shareContent.classList.remove("share__content--active");
      shareButton.classList.remove("share__button--active");
      document.body.classList.remove("stop-scroll");
    }, 1000);
  }

  function width960() {
    if (window.innerWidth < 961) {
      // Adjust the selector as needed

      shareFormButton.addEventListener("click", () => {
        addMobilePopUp();
      });

      shareInfo.addEventListener("click", () => {
        addMobilePopUp();
      });
    }
  }

  window.addEventListener("resize", width960);
  window.addEventListener("load", width960);

  // Initialize by showing the first video
  videos["video-1"].classList.add("video-section__item--active");
  descriptions["video-1"].classList.add("video-section__label--active");
})();

// var player = new Yandex.VH.Player('player1', {
//   contentId: '372588947591440072',
//   width: 1200,
//   height: 620,
//   adConfig: {
//       adBreaks: [
//           { adFoxParameters: {} }
//       ]
//   },
//   params: {
//       autoplay: 0,
//       mute: 1,
//       tv: 0,
//       loop: 1,
//       preload: 0
//   }
// });
