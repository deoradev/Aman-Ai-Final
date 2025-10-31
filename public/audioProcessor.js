/**
 * This AudioWorkletProcessor receives audio data from the microphone
 * and forwards it to the main thread for processing and sending to the API.
 * It runs in a separate thread, preventing UI blocking.
 */
class AudioProcessor extends AudioWorkletProcessor {
  // Using a constructor is necessary for the class to be correctly registered.
  constructor() {
    super();
  }

  /**
   * Called by the browser's audio engine with new audio data.
   * @param {Float32Array[][]} inputs - An array of inputs, each with an array of channels.
   * @returns {boolean} - Return true to keep the processor alive.
   */
  process(inputs) {
    // We expect one input with one channel.
    const input = inputs[0];
    const channel = input[0];

    // If there's audio data, send a copy to the main thread.
    // A copy is sent to avoid issues with the buffer being reused.
    if (channel) {
      this.port.postMessage(channel.slice());
    }

    // Return true to indicate the processor should not be terminated.
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);