# Plotting functionality disabled for production deployment
# All matplotlib imports and functions are commented out to reduce dependencies

# import matplotlib.pyplot as plt
# import librosa.display
# import numpy as np


def plot_loss(history):
    """
    Plot training loss - DISABLED FOR PRODUCTION
    """
    print("Plotting disabled for production deployment")
    pass


def plot_spectrograms(y_noisy, enhanced, stft_noisy, SR=16000, HOP_LENGTH=128, N_FFT=512):
    """
    Plot spectrograms - DISABLED FOR PRODUCTION
    """
    print("Plotting disabled for production deployment")
    pass


# Original plotting functions (commented out for production):
"""
def plot_loss(history):
    plt.figure()
    plt.plot(history.history['loss'], label='Loss')
    plt.title('Training Loss')
    plt.xlabel('Epoch')
    plt.ylabel('MSE')
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.show()


def plot_spectrograms(y_noisy, enhanced, stft_noisy, SR=16000, HOP_LENGTH=128, N_FFT=512):
    plt.figure(figsize=(12, 5))
    plt.subplot(1, 2, 1)
    D = librosa.amplitude_to_db(np.abs(stft_noisy), ref=np.max)
    librosa.display.specshow(D, sr=SR, hop_length=HOP_LENGTH, y_axis='log', x_axis='time')
    plt.title('Noisy Spectrogram')
    plt.colorbar()

    plt.subplot(1, 2, 2)
    D2 = librosa.amplitude_to_db(np.abs(librosa.stft(enhanced, n_fft=N_FFT, hop_length=HOP_LENGTH)), ref=np.max)
    librosa.display.specshow(D2, sr=SR, hop_length=HOP_LENGTH, y_axis='log', x_axis='time')
    plt.title('Enhanced Spectrogram')
    plt.colorbar()

    plt.tight_layout()
    plt.show()
"""