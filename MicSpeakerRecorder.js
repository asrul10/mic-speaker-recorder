"use strict";

import MultiStreamsMixer from "multistreamsmixer";
import RecordRTC from "recordrtc";

/**
 * Mic and/or Speaker Recorder
 * @module MicSpeakerRecorder
 */
export default class MicSpeakerRecorder {
  /**
   * @constructor
   * @param {object} config
   */
  constructor(
    config = { mic: true, speaker: true },
    successCallback = () => {},
    stopCallback = () => {},
    errorCallback = () => {}
  ) {
    /**
     * @private
     * @type {RecordRTC}
     */
    this.recorder = [];
    /**
     * @private
     * @type {MediaStream}
     */
    this.mediaStream = null;
    /**
     * @private
     * @type {MediaStream}
     */
    this.mediaStreamMic = null;
    /**
     * @private
     * @type {boolean}
     */
    this.mic = config.mic;
    if (typeof config.mic === "undefined") {
      this.mic = true;
    }
    /**
     * @private
     * @type {boolean}
     */
    this.speaker = config.speaker;
    if (typeof config.speaker === "undefined") {
      this.speaker = true;
    }
    /**
     * Callback success
     * @private
     * @type {function}
     */
    this.callbackStreamSuccess = successCallback;
    /**
     * Callback error
     * @private
     * @type {function}
     */
    this.callbackStreamError = errorCallback;
    /**
     * Callback stop
     * @private
     * @type {function}
     */
    this.callbackStreamStop = stopCallback;
  }

  /**
   * Get popup permission display media
   * @private
   * @returns {MediaDevices}|null
   */
  getMediaDevices() {
    if (navigator.mediaDevices.getDisplayMedia) {
      return navigator.mediaDevices;
    }
    if (navigator.getDisplayMedia) {
      return navigator;
    }
    return null;
  }

  /**
   * Capture Microphone
   * @private
   * @param {MediaDevices} mediaDevices
   * @returns {MediaStream}
   */
  captureMicrophone(mediaDevices) {
    return mediaDevices.getUserMedia({ audio: true, video: false });
  }

  /**
   * Capture Speaker
   * @private
   * @param {MediaDevices} mediaDevices
   * @returns {MediaStream}
   */
  captureSpeaker(mediaDevices) {
    return mediaDevices.getDisplayMedia({ audio: true, video: true });
  }

  /**
   * Stop listener
   * @private
   */
  stopListener() {
    let isExecuted = false;
    const executedOnce = () => {
      if (isExecuted === false) {
        this.recorder.stopRecording(() => {
          this.callbackStreamStop(this.recorder.getBlob());
          this.recorder.destroy();
          this.recorder = null;
          this.stop();
        });
      }
      isExecuted = true;
    };

    this.mediaStream.addEventListener("ended", executedOnce, false);
    this.mediaStream.addEventListener("inactive", executedOnce, false);
    this.mediaStream.getTracks().forEach((track) => {
      track.addEventListener("ended", executedOnce, false);
      track.addEventListener("inactive", executedOnce, false);
    });
  }

  /**
   * Start recording
   * @public
   */
  start() {
    const mediaDevices = this.getMediaDevices();
    if (mediaDevices === null) {
      this.callbackStreamError();
      return;
    }
    this.captureMicrophone(mediaDevices)
      .then((streamMic) => {
        this.captureSpeaker(mediaDevices)
          .then((streamSpeaker) => {
            const audioStream = [];
            if (this.mic) {
              audioStream.push(streamMic);
            }
            if (this.speaker) {
              audioStream.push(streamSpeaker);
            }
            const audioMixer = new MultiStreamsMixer(audioStream);
            const audioMixedStream = audioMixer.getMixedStream();
            this.recorder = RecordRTC(audioMixedStream, {
              type: "audio",
            });
            this.mediaStream = streamSpeaker;
            this.mediaStreamMic = streamMic;
            this.recorder.startRecording();
            this.stopListener();
            this.callbackStreamSuccess(audioMixedStream, this.recorder);
          })
          .catch((error) => {
            throw new Error(error);
          });
      })
      .catch((error) => {
        console.error(error);
        this.callbackStreamError();
      });
  }

  /**
   * Stop recording
   * @public
   */
  stop() {
    this.mediaStream.stop();
    this.mediaStreamMic.stop();
    this.mediaStream = null;
    this.mediaStreamMic = null;
  }
}
