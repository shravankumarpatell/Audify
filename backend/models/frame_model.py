import numpy as np
import matplotlib.pyplot as plt
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Input
from ..data.features import extract_features, butter_lowpass_filter, HOP_LENGTH, WINDOW_TYPE, SR
from ..metrics.quality import segmental_snr, compute_pesq, compute_stoi
import soundfile as sf
import os
import librosa
import io


def build_frame_model(input_dim: int) -> Sequential:
    """
    Build and compile a simple frame-wise DNN model.
    """
    model = Sequential([
        Input(shape=(input_dim,)),
        Dense(1024, activation='relu'),
        Dense(input_dim, activation='linear')
    ])
    model.compile(optimizer='adam', loss='mse')
    return model


def prepare_data(clean_path: str, noisy_path: str):
    """
    Load matching clean/noisy files, extract features, normalize frames.
    Returns normalized X, Y, and normalization stats.
    """
    X_frames, Y_frames = [], []

    for fname in os.listdir(clean_path):
        clean_file = os.path.join(clean_path, fname)
        noisy_file = os.path.join(noisy_path, fname)
        if os.path.exists(noisy_file):
            clean_feats, _, _ = extract_features(clean_file)
            noisy_feats, _, _ = extract_features(noisy_file)
            min_len = min(clean_feats.shape[0], noisy_feats.shape[0])
            X_frames.append(noisy_feats[:min_len])
            Y_frames.append(clean_feats[:min_len])

    X = np.vstack(X_frames)
    Y = np.vstack(Y_frames)
    mean = np.mean(X)
    std = np.std(X)
    X_norm = (X - mean) / std
    Y_norm = (Y - mean) / std
    return X_norm, Y_norm, mean, std


def train_model(clean_path: str, noisy_path: str, epochs: int = 10, batch_size: int = 32):
    """
    Train frame model on the given dataset.
    Returns trained model and normalization stats.
    """
    X, Y, mean, std = prepare_data(clean_path, noisy_path)
    model = build_frame_model(X.shape[1])
    history = model.fit(X, Y, epochs=epochs, batch_size=batch_size)

    # Plot training loss
    plt.figure()
    plt.plot(history.history['loss'], label='Training Loss')
    plt.title('Model Loss Over Epochs')
    plt.xlabel('Epoch')
    plt.ylabel('MSE Loss')
    plt.grid(True)
    plt.legend()
    plt.tight_layout()
    plt.show()

    return model, mean, std


def enhance_audio(model, noisy_file: str, mean: float, std: float,
                  output_path: str = None,
                  output_buffer: 'io.BytesIO' = None):
    """
    Enhance a single noisy audio file, save output, and report metrics.
    """
    feats, y_noisy, stft_noisy = extract_features(noisy_file)
    norm_feats = (feats - mean) / std
    pred = model.predict(norm_feats)
    pred = (pred * std) + mean

    # Reconstruct waveform
    mag = librosa.db_to_amplitude(pred.T)
    phase = np.angle(stft_noisy[:, :mag.shape[1]])
    enhanced_stft = mag * np.exp(1j * phase)
    enhanced = librosa.istft(enhanced_stft, hop_length=HOP_LENGTH, window=WINDOW_TYPE)
    enhanced = butter_lowpass_filter(enhanced, cutoff=4000, sr=SR)

    # Output: write to file or buffer
    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        sf.write(output_path, enhanced, SR)
    if output_buffer is not None:
        # Write WAV data into BytesIO buffer
        sf.write(output_buffer, enhanced, SR, format='WAV')