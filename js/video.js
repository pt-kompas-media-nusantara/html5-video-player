/*jslint vars: true, plusplus: true, devel: true, nomen: true, maxerr: 50, regexp: true, browser:true */

var videos = (function () {
    'use strict';
    var objects = {
            videoWrappers : document.getElementsByClassName('box-video')
        },
        calculate = {
            gcd : function (width, height) {
                return (height === 0) ? width : calculate.gcd(height, width % height);
            }
        },
        humanReadableDuration = function (intDuration) {
            var h,
                m,
                s,
                hour = Math.floor(intDuration / 3600),
                min = Math.floor((intDuration - (hour * 3600)) / 60),
                sec = Math.floor(intDuration - (hour * 3600) - (min * 60));
            
            if (hour > 0) {
                h = (hour < 1) ? '0' + hour : hour;
                h += ':';
            } else {
                h = '';
            }
            m = (min < 10) ? '0' + min : min;
            s = (sec < 10) ? '0' + sec : sec;
            return h + m + ':' + s;
        },
        setInitialDuration = function (barTime, video) {
            if (isNaN(video.duration)) {
                barTime.textContent = '';
            } else {
                var fn = function () {
                    barTime.textContent = humanReadableDuration(video.duration);
                };
                video.addEventListener('loadedmetadata', fn, false);
            }
        },
        setProgress = function (progressCurrent, progressInput, video, btnPlay, barTime, controls) {
            var percentage,
                fn = function () {
                    percentage = Math.floor((100 / video.duration) * video.currentTime);
                    progressCurrent.style.width = percentage + '%';
                    progressInput.value = percentage;
                    barTime.textContent = humanReadableDuration(video.duration - video.currentTime);
                    
                    if (video.ended) {
                        btnPlay.classList.remove('pause');
                        btnPlay.classList.add('replay');
                        btnPlay.setAttribute('title', 'Putar ulang');
                        
                        if (controls.classList.contains('hidden')) {
                            controls.classList.remove('hidden');
                        }
                    }
                };
            video.addEventListener('timeupdate', fn, false);
        },
        setProgressChange = function (progressInput, video) {
            var time,
                fn = function () {
                    time = video.duration * (progressInput.value / 100);
                    video.currentTime = time;
                };
            
            progressInput.addEventListener('change', fn, false);
        },
        setVolume = function (val, video) {
            var vol = video.volume;
            vol = val;
            
            if (vol >= 0 && vol <= 1) {
                video.volume = vol;
            } else {
                video.volume = (vol < 0) ? 0 : 1;
            }
        },
        setVolumeChange = function (volumeCurrent, volumeInput, video, volumeIcon) {
            var vol,
                fn = function () {
                    vol = volumeInput.value / 100;
                    volumeCurrent.style.width = volumeInput.value + '%';
                    video.volume = vol;
                    volumeInput.setAttribute('value', vol * 100);
                    
                    if (vol > 0) {
                        volumeIcon.classList.remove('mute');
                        volumeIcon.classList.add('unmute');
                    } else {
                        volumeIcon.classList.remove('unmute');
                        volumeIcon.classList.add('mute');
                    }
                };
            
            volumeInput.addEventListener('change', fn, false);
        },
        togglePlay = function (eventSource, btnPlay, video) {
            var fn = function () {
                if (btnPlay.classList.contains('play')) {
                    btnPlay.classList.remove('play');
                    btnPlay.classList.add('pause');
                    video.play();
                } else if (btnPlay.classList.contains('replay')) {
                    btnPlay.classList.remove('replay');
                    btnPlay.classList.add('pause');
                    video.currentTime = 0;
                    video.play();
                } else {
                    btnPlay.classList.remove('pause');
                    btnPlay.classList.add('play');
                    video.pause();
                }
            };
            
            eventSource.addEventListener('click', fn, false);
        },
        toggleFullscreen = function (button, video) {
            var fn = function () {
                if (!video.fullscreenElement && !video.mozFullScreenElement && !video.webkitFullscreenElement && !video.msFullscreenElement) {
                    if (video.webkitRequestFullscreen) {
                        video.webkitRequestFullscreen();
                    } else if (video.mozRequestFullScreen) {
                        video.mozRequestFullScreen();
                    } else if (video.msRequestFullscreen) {
                        video.msRequestFullscreen();
                    } else if (video.requestFullscreen) {
                        video.requestFullscreen();
                    }
                } else {
                    if (video.webkitExitFullscreen) {
                        video.webkitExitFullscreen();
                    } else if (video.mozCancelFullScreen) {
                        video.mozCancelFullScreen();
                    } else if (video.msExitFullscreen) {
                        video.msExitFullscreen();
                    } else if (video.exitFullscreen) {
                        video.exitFullscreen();
                    }
                }
            };
            button.addEventListener('click', fn, false);
        },
        toggleShowHideControls = function (controls, video) {
            video.addEventListener('mouseover', function () {
                if (!video.paused) {
                    if (controls.classList.contains('hidden')) {
                        controls.classList.remove('hidden');
                    }
                }

            }, false);

            video.addEventListener('mouseout', function () {
                if (!video.paused) {
                    if (!controls.classList.contains('hidden')) {
                        controls.classList.add('hidden');
                    }
                }
            }, false);

            controls.addEventListener('mouseover', function () {
                if (!video.paused) {
                    if (controls.classList.contains('hidden')) {
                        controls.classList.remove('hidden');
                    }
                }

            }, false);

            controls.addEventListener('mouseout', function () {
                if (!video.paused) {
                    if (!controls.classList.contains('hidden')) {
                        controls.classList.add('hidden');
                    }
                }
            }, false);
        },
        toggleVolumeMute = function (button, volumeInput, volumeCurrent, video) {
            var vol,
                fn = function () {
                    vol = parseInt(volumeInput.getAttribute('value'), 10);
                    
                    if (button.classList.contains('mute')) {
                        button.classList.remove('mute');
                        button.classList.add('unmute');
                        video.volume = vol / 100;
                        volumeCurrent.style.width = vol + '%';
                        volumeInput.value = vol;
                    } else {
                        button.classList.remove('unmute');
                        button.classList.add('mute');
                        video.volume = 0;
                        volumeCurrent.style.width = 0;
                        volumeInput.value = 0;
                    }
                };
            
            button.addEventListener('click', fn, false);
        },
        displayControls = function () {
            var parent = objects.videoWrappers,
                parentLen = parent.length,
                i,
                video,
                controls,
                barTime,
                btnFullscreen,
                btnPlay,
                icoLogo,
                progressWrapper,
                progressCurrent,
                progressInput,
                volumeWrapper,
                volumeIcon,
                volumeCurrent,
                volumeInput;
            
            for (i = 0; i < parentLen; i++) {
                video = parent[i].getElementsByTagName('video')[0];
                controls = parent[i].getElementsByClassName('controls')[0];
                
                icoLogo = document.createElement('div');
                icoLogo.className = 'ico-logo';
                
                btnPlay = document.createElement('div');
                btnPlay.className = 'btn-play play';
                btnPlay.setAttribute('title', 'Putar');
                
                progressWrapper = document.createElement('div');
                progressWrapper.className = 'bar-progress-wrapper';
                progressCurrent = document.createElement('div');
                progressCurrent.className = 'bar-progress-current';
                progressInput = document.createElement('input');
                progressInput.className = 'bar-progress-range';
                progressInput.setAttribute('type', 'range');
                progressInput.setAttribute('value', 0);
                
                progressWrapper.appendChild(progressCurrent);
                progressWrapper.appendChild(progressInput);
                
                barTime = document.createElement('div');
                barTime.className = 'bar-time';
                barTime.textContent = '00:00:00';
                
                volumeWrapper = document.createElement('div');
                volumeWrapper.className = 'volume-wrapper';
                volumeIcon = document.createElement('div');
                volumeIcon.className = "ico-volume unmute";
                volumeCurrent = document.createElement('div');
                volumeCurrent.className = 'bar-volume-current';
                volumeInput = document.createElement('input');
                volumeInput.className = 'bar-volume-range';
                volumeInput.setAttribute('type', 'range');
                volumeInput.setAttribute('value', 50);
                
                volumeWrapper.appendChild(volumeIcon);
                volumeWrapper.appendChild(volumeCurrent);
                volumeWrapper.appendChild(volumeInput);
                
                btnFullscreen = document.createElement('div');
                btnFullscreen.className = 'btn-fullscreen';
                btnFullscreen.setAttribute('title', 'Layar penuh');
                
                controls.appendChild(icoLogo);
                controls.appendChild(btnPlay);
                controls.appendChild(progressWrapper);
                controls.appendChild(barTime);
                if (!navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
                    //hide volume controls in Apple's products for audio's volume is controlled physically by users
                    //hide fullscreen button also
                    controls.appendChild(volumeWrapper);
                    controls.appendChild(btnFullscreen);
                }
                
                
                setVolume(0.5, video);
                togglePlay(btnPlay, btnPlay, video);
                togglePlay(video, btnPlay, video);
                setProgress(progressCurrent, progressInput, video, btnPlay, barTime, controls);
                setProgressChange(progressInput, video);
                setVolumeChange(volumeCurrent, volumeInput, video, volumeIcon);
                toggleVolumeMute(volumeIcon, volumeInput, volumeCurrent, video);
                toggleFullscreen(btnFullscreen, video);
                toggleShowHideControls(controls, video);
                setInitialDuration(barTime, video); //webkit returns NaN if video's duration value is fetched without listening to loadedmetadata event
            }
        },
        setDimensions = function () {
            var parent = objects.videoWrappers,
                parentLen = parent.length,
                i,
                video,
                rW = 16, //let's say the aspect ratio of all videos is 16:9
                rH = 9,
                vW,
                vH;
            
            for (i = 0; i < parentLen; i++) {
                video = parent[i].getElementsByTagName('video')[0];
                
                video.setAttribute('width', parent[i].offsetWidth);
                video.setAttribute('height', parent[i].offsetWidth * (rH / rW));
                video.style.width = parent[i].offsetWidth + 'px';
                video.style.height = (parent[i].offsetWidth * (rH / rW)) + 'px';
            }
        },
        init = function () {
            setDimensions();
            displayControls();
        };
    
    return {
        init : init
    };
}());


window.addEventListener('load', videos.init, false);