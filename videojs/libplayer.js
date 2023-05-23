(() => {

    window.currentVideoTimeWithAttention = []
    const countElementInArray = (array,element) => {
        let count = 0;

        for (let i = 0; i < array.length; i += 1) {
            if (array[i] === element) {
                count += 1;
            }
        }
        return count
    }

    function byField(field) {
        return (a, b) => a[field] > b[field] ? -1 : 1;
      }

    window.WSSP = async function WSSP(initialData) {

        if (!initialData) {
            return console.warn('Initialization data was not received');
        }

        const Player = videojs(initialData.playerElement, {
            autoplay: initialData.autoplay || false,
            playsinline: true,
            responsive: true
        });

        class OperationWithPlayer {
            constructor() {
                this.renderToCanvas = false;
                this.videoPlaying = false;
                this.videoPlayingFromButton = false;
                this.loader = true;
                this.faceDetectorActive = false;
                this.videoStop = false;
                this.indexesAttention = [];
                this.currentSecond = 0;
                this.seconds = 0;
                this.secondsPlay = 0;
            }

            async pausePlay() {
                console.log(323)
                Player.pause();
            }

            startPlay() {
                Player.play();
            }

            setUrlVideo(url) {
                if (url.indexOf('https://www.youtube.com/watch') + 1 === 1 || url.indexOf('https://youtu.be/') + 1 === 1) {
                    Player.src({
                        type: "video/youtube",
                        src: url
                    });
                } else {
                    Player.src({
                        type: "video/mp4",
                        src: url
                    });
                }
            }

            setCurrentTime(time) {
                Player.one('playing', function () {
                    Player.currentTime(time)
                });
            }


            async initialFaceDetector(player) {
                let loader = false;

                if (initialData.loader) {
                    loader = document.getElementById(initialData.loader)
                    loader.style.display = "flex"
                }

                Player.muted(true);
                function onIndex(index) {
                    if (initialData.faceDetectorPlayPause) {
                        if (!PC.videoStop) {
                            if (index.attention) {
                                if (!PC.videoPlaying && PC.faceDetectorActive) {
                                    PC.videoPlaying = true;
                                    PC.startPlay()
                                }
                            }
                        } else {
                            if (!index.attention) {
                                if (PC.videoPlaying && PC.faceDetectorActive) {
                                    PC.videoPlaying = false;
                                    PC.pausePlay()
                                }
                            }
                        }
                    }
                }

                function onSecondIndex(index) {
                    // console.log(index)
                }

                const canvas = document.getElementById(initialData.canvasElementId)
                canvas.style.zIndex = 2;
                Player.currentTime(0)
                await window.createFaceDetector(player, { onIndex: onIndex, onSecondIndex: onSecondIndex })


                setTimeout(() => {

                    Player.muted(false);
                    Player.currentTime(0)

                    if (loader) {
                        loader.style.display = "none"
                    }

                }, 100)
                PC.faceDetectorActive = true
            }


            async initialFaceDetectorWebcam(player) {
                if (!this.loader) {
                    this.loader = true;
                    let loader = false;
                    let loaderWebcam = false;

                    if (initialData.loader) {
                        loader = document.getElementById(initialData.loader)
                        loader.style.display = "flex"
                    }
                    if (initialData.loaderWebcam) {
                        loaderWebcam = document.getElementById(initialData.loaderWebcam)
                        loaderWebcam.style.display = "flex"
                    }
                }

                Player.muted(true);
                function onIndex(index) {
                    if (index) {

                        if (typeof index.attention != undefined) {

                            if (initialData.indexAttentionElement) {

                                const elementIndexAttention = document.getElementById(initialData.indexAttentionElement)
                                PC.indexesAttention.push(index.attention)


                                if (elementIndexAttention) {
                                    if (PC.indexesAttention.length > 0) {
                                        if (PC.seconds > PC.currentSecond) {
                                            PC.currentSecond = PC.seconds
                                            elementIndexAttention.innerHTML = Math.floor(100 / Number(PC.indexesAttention.length) * Number(PC.indexesAttention.filter(index => index == 1).length))
                                        }
                                    }
                                }

                            }

                        }

                        if (typeof index.activeFaces != undefined) {

                            if (initialData.activeFacesElement) {

                                const activeFaces = document.getElementById(initialData.activeFacesElement)

                                if (activeFaces) {

                                    activeFaces.innerHTML = Number(index.activeFaces)

                                }

                            }

                        }


                        if (typeof index.faces != undefined) {

                            if (initialData.facesElement) {

                                const faces = document.getElementById(initialData.facesElement)

                                if (faces) {

                                    faces.innerHTML = Number(index.faces)

                                }

                            }

                        }


                    }

                    // if (initialData.faceDetectorPlayPauseWebcam) {
                    //     if (!PC.videoStop) {
                    //         if (index.attention) {
                    //             if (!PC.videoPlaying && PC.faceDetectorActive) {
                    //                 PC.startPlay()
                    //                 PC.videoPlaying = true;
                    //             }
                    //         }
                    //         if (!index.attention) {
                    //             if (PC.videoPlaying && PC.faceDetectorActive) {
                    //                 PC.pausePlay()
                    //                 PC.videoPlaying = false;
                    //             }
                    //         }
                    //     }
                    // }

                    // PC.faceDetectorActive = true

                    if (index) {
                        const time = Math.round(Player.currentTime())
                        if (window.currentVideoTimeWithAttention.length < 1) {
                            window.currentVideoTimeWithAttention.push({
                                time: time,
                                attentions: [index.attention]
                            })
                            return;
                        }
                        if (!window.currentVideoTimeWithAttention.find(el => el.time === time)) {
                            window.currentVideoTimeWithAttention.push({
                                time: time, attentions: [
                                    index.attention
                                ]
                            })
                            return
                        } else {
                            window.currentVideoTimeWithAttention.find(el => el.time === time).attentions.push(index.attention)
                        }
                    }
                }

                function onSecondIndex(index) {
                    if (initialData.faceDetectorPlayPauseWebcam) {
                        if (!PC.videoStop) {
                            if (index.attention) {
                                if (!PC.videoPlaying && PC.faceDetectorActive) {
                                    PC.startPlay()
                                    PC.videoPlaying = true;
                                }
                            }
                            if (!index.attention) {
                                if (PC.videoPlaying && PC.faceDetectorActive) {
                                    PC.pausePlay()
                                    PC.videoPlaying = false;
                                }
                            }
                        }
                    }
                    PC.faceDetectorActive = true
                }

                const canvas = document.getElementById(initialData.canvasWebcamElementId)
                canvas.style.zIndex = 2;
                Player.currentTime(0)
                await window.createFaceDetector(player, { onIndex: onIndex, onSecondIndex: onSecondIndex }, canvas)


                setTimeout(() => {

                    Player.muted(false);
                    Player.currentTime(0)

                    if (PC.loader) {
                        const loader = document.getElementById(initialData.loader)
                        const loaderWebcam = document.getElementById(initialData.loaderWebcam)
                        loader.style.display = "none"
                        loaderWebcam.style.display = "none"
                    }

                }, 100)
                return true
            }


            async streamFromWebcam() {
                this.loader = true;
                let loader = false;
                let loaderWebcam = false;

                if (initialData.loader) {
                    loader = document.getElementById(initialData.loader)
                    loader.style.display = "flex"
                }
                if (initialData.loaderWebcam) {
                    loaderWebcam = document.getElementById(initialData.loaderWebcam)
                    loaderWebcam.style.display = "flex"
                }

                let mediaStream;
                const video = document.getElementById(initialData.webcamVideoElementId)


                if (navigator.mediaDevices.getUserMedia) {
                    mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
                    video.srcObject = mediaStream
                    await video.play()
                }

                return true;
            }

        }


        const PC = new OperationWithPlayer();


        const init = async () => {
            PC.setUrlVideo(initialData.video_url)
        }


        await init();


        if (Player.src().indexOf('https://www.youtube.com/watch') + 1 === 1 || Player.src().indexOf('https://youtu.be/') + 1 === 1) {
            Player.options.youtube = {
                ytControls: 2,
                rel: 1,
                autohide: 0,
                start: initialData.video_currentTime,
                t: initialData.video_currentTime
            }
        }

        Player.on('play', async () => {
            if (initialData.faceDetectorWebcam && !PC.videoPlayingFromButton && !PC.faceDetectorActive && !PC.videoPlaying) {
                PC.indexesAttention = [];
                const streamStarted = await PC.streamFromWebcam()
                if (streamStarted) {
                    await PC.initialFaceDetectorWebcam(document.getElementById(initialData.webcamVideoElementId))
                }
            }
            PC.videoStop = false
            PC.videoPlayingFromButton = true
        })


        Player.on('pause', async () => {
            if (initialData.faceDetectorWebcam && PC.videoPlayingFromButton && PC.faceDetectorActive && PC.videoPlaying) {
                PC.videoPlayingFromButton = false
                PC.videoStop = true
                Player.controls(true)
            }
        })

        Player.on('ended', async () => {
            window.destroyFaceDetector()
            PC.videoPlayingFromButton = false
            PC.videoPlaying = false
            PC.faceDetectorActive = false
            const data = []
            window.currentVideoTimeWithAttention.map((element) => {
                const countActiveAttention = countElementInArray(element.attentions, 1)
                const procent = Math.round(100 / element.attentions.length * countActiveAttention)
                data.push({x:element.time, y:procent})
            })

            data.sort((prev, next) => prev.x - next.x);

            console.log(data)

            window.charts.chart1.updateSeries([{
                data: data
            }])
        })

        Player.on('timeupdate', () => {
            PC.secondsPlay = Math.round(Player.currentTime())
        })

        const interval = setInterval(() => {
            PC.seconds += 1;
        }, 1000)


    }


})()
