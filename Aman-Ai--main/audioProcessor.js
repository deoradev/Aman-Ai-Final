class AudioProcessor extends AudioWorkletProcessor {
  constructor() { super(); }
  process(inputs) {
    // We only expect one input, with one channel.
    const channel = inputs[0]?.[0];
    if (channel) {
      // Post a copy of the Float32Array to the main thread.
      // The '.slice()' is important to create a copy, as the underlying ArrayBuffer is reused.
      this.port.postMessage(channel.slice());
    }
    // Return true to keep the processor alive.
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);
