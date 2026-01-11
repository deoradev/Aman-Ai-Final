class AudioProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (input && input[0]) {
      const inputData = input[0];
      // Post the raw Float32Array to the main thread for conversion
      this.port.postMessage(inputData);
    }
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);